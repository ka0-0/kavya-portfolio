import React, { useState, useEffect, useRef } from "react";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  SphereGeometry,
  MeshBasicMaterial,
  ShaderMaterial,
  Color,
  Mesh,
  Group,
  InstancedMesh,
  Matrix4,
  Raycaster,
  Vector2,
  Vector3,
  RingGeometry,
  DoubleSide,
  Clock,
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
} from "three";
import { useTheme } from "../theme/ThemeContext";
import "./Globe.css";

// Helper: Convert Lat/Lng to 3D Cartesian coordinates on a sphere of given radius
function latLngToPosition(lat, lng, radius) {
  const latRad = lat * (Math.PI / 180);
  const lngRad = lng * (Math.PI / 180);
  const x = Math.cos(latRad) * Math.sin(lngRad) * radius;
  const y = Math.sin(latRad) * radius;
  const z = Math.cos(latRad) * Math.cos(lngRad) * radius;
  return new Vector3(x, y, z);
}

// Theme color maps matching index.css themes (failsafe static mapping)
const themeColorsMap = {
  blue: { accent: "#22d3ee", accentLight: "#67e8f9" },
  black: { accent: "#ffffff", accentLight: "#e4e4e7" },
  pink: { accent: "#ec4899", accentLight: "#f472b6" },
  purple: { accent: "#a855f7", accentLight: "#c084fc" },
  orange: { accent: "#f97316", accentLight: "#fb923c" },
  red: { accent: "#ef4444", accentLight: "#f87171" },
  green: { accent: "#22c55e", accentLight: "#4ade80" },
};

// Helper: Fetch colors from local Javascript theme map based on theme name
function getThemeColors(accentName) {
  const themeColors = themeColorsMap[accentName] || themeColorsMap.blue;
  return {
    accent: new Color(themeColors.accent),
    accentLight: new Color(themeColors.accentLight),
  };
}

// Custom Fresnel Shader for theme-aware atmospheric rim glow (optimized for razor-thin silhouette glow)
const glowVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const glowFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  uniform vec3 color;
  uniform float intensity;
  uniform float fade;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    // Fresnel Rim Intensity (high exponent ensures glow is concentrated strictly at the silhouette)
    float glow = pow(1.0 - max(0.0, dot(normal, vec3(0.0, 0.0, 1.0))), fade) * intensity;
    gl_FragColor = vec4(color, glow);
  }
`;

export default function Globe() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Theme context
  const { accent } = useTheme();

  // Load States
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [loaderOpacity, setLoaderOpacity] = useState(1);
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingLines, setLoadingLines] = useState([
    { text: "INITIALIZING NEURAL LINK...", status: "active" },
    { text: "DOWNLOADING TOPOLOGY DATA...", status: "pending" },
    { text: "MAPPING NETWORK NODES...", status: "pending" },
    { text: "ESTABLISHING SECURE_NODE_02 BEACON...", status: "pending" },
    { text: "STATUS: BOOTING", status: "pending" }
  ]);

  // Popover States for Delhi Beacon
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ left: 0, top: 0, markerX: 0, markerY: 0, anchorX: 0, anchorY: 0, origin: 'bottom left' });
  const [latency, setLatency] = useState(12);

  // References for Three.js cleanup & dynamic updates
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  
  // Material references for instant theme recoloring
  const centerMatRef = useRef(null);
  const glowMatRef = useRef(null);
  const pulseRingsRef = useRef([]);
  const atmosphereMatRef = useRef(null);
  const hitSphereRef = useRef(null);
  const delhiBeaconGroupRef = useRef(null);

  // Target colors for smooth transition between themes (lerped in animate loop, initialized to active theme)
  const targetColorsRef = useRef(null);
  if (!targetColorsRef.current) {
    const themeColors = themeColorsMap[accent] || themeColorsMap.blue;
    targetColorsRef.current = {
      accent: new Color(themeColors.accent),
      accentLight: new Color(themeColors.accentLight),
    };
  }

  // Holographic loader sequence effect
  useEffect(() => {
    if (loadingStage < 4) {
      const timer = setTimeout(() => {
        setLoadingLines(prev => prev.map((line, idx) => {
          if (idx === loadingStage) {
            return { ...line, status: "done" };
          } else if (idx === loadingStage + 1) {
            return { ...line, status: "active" };
          }
          return line;
        }));
        setLoadingStage(prev => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    } else if (loadingStage === 4 && dataLoaded) {
      setLoadingLines(prev => prev.map((line, idx) => {
        if (idx === 4) {
          return { text: "STATUS: SECURE_NODE_02 ONLINE", status: "success" };
        }
        return line;
      }));
      const timer = setTimeout(() => {
        setLoaderOpacity(0);
        setTimeout(() => {
          setShowLoader(false);
        }, 800);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [loadingStage, dataLoaded]);

  // Main Three.js Setup Effect
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Clock for delta timing and uniform animations
    const clock = new Clock();

    // 1. Scene & Render Engine Setup
    const scene = new Scene();
    sceneRef.current = scene;

    // Camera FOV set to 50, resting distance 2.35 to make the globe appear slightly larger
    const camera = new PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.4); // Start zoomed out for first-load reveal animation
    cameraRef.current = camera;

    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Fetch theme colors
    const colors = getThemeColors(accent);

    // 2. Base Ocean Geometry (Pure Black)
    const globeRadius = 1.0;
    const oceanGeo = new SphereGeometry(globeRadius, 64, 64);
    const oceanMat = new MeshBasicMaterial({
      color: 0x000000,
      transparent: false,
    });
    const oceanMesh = new Mesh(oceanGeo, oceanMat);
    scene.add(oceanMesh);

    // 3. Globe Container Group (for rotations, breathing, floating)
    const globeGroup = new Group();
    scene.add(globeGroup);
    globeGroup.add(oceanMesh);

    // 3b. Thin, Delicate Latitude and Longitude Grid lines (OriginKit match)
    const gridVertices = [];
    const gridIndices = [];
    let gridIndex = 0;
    const gridSpacing = 15; // Spacing in degrees

    // Latitude circles
    for (let lat = -75; lat <= 75; lat += gridSpacing) {
      const segments = 120;
      const firstIdx = gridIndex;
      for (let i = 0; i < segments; i++) {
        const lng = (i / segments) * 360 - 180;
        const pos = latLngToPosition(lat, lng, globeRadius * 1.0005);
        gridVertices.push(pos.x, pos.y, pos.z);
        if (i > 0) {
          gridIndices.push(gridIndex - 1, gridIndex);
        }
        gridIndex++;
      }
      gridIndices.push(gridIndex - 1, firstIdx); // Close circle loop
    }

    // Longitude lines
    for (let lng = -180; lng < 180; lng += gridSpacing) {
      const segments = 60;
      for (let i = 0; i <= segments; i++) {
        const lat = (i / segments) * 180 - 90;
        const pos = latLngToPosition(lat, lng, globeRadius * 1.0005);
        gridVertices.push(pos.x, pos.y, pos.z);
        if (i > 0) {
          gridIndices.push(gridIndex - 1, gridIndex);
        }
        gridIndex++;
      }
    }

    const gridGeo = new BufferGeometry();
    gridGeo.setAttribute("position", new Float32BufferAttribute(gridVertices, 3));
    gridGeo.setIndex(gridIndices);
    const gridMat = new LineBasicMaterial({
      color: 0x555555,
      transparent: true,
      opacity: 0.35, // subtle and clearly visible dark gray grid
    });
    const gridMesh = new LineSegments(gridGeo, gridMat);
    globeGroup.add(gridMesh);

    // 4. Custom Atmospheric rim glow (Razor-thin Fresnel matching OriginKit)
    // Scale reduced from 1.12 to 1.018, fade exponent increased to 7.0 for tight 2-3px halo
    const atmosphereGeo = new SphereGeometry(globeRadius * 1.018, 64, 64);
    const atmosphereMat = new ShaderMaterial({
      vertexShader: glowVertexShader,
      fragmentShader: glowFragmentShader,
      uniforms: {
        color: { value: colors.accent }, // Theme-aware atmospheric rim glow (smoothly transitions)
        intensity: { value: 0.16 }, // Low opacity
        fade: { value: 7.0 },       // Sharp silhouette falloff
      },
      blending: 2, // Custom additive blending
      side: 1,     // BackSide rendering
      transparent: true,
      depthWrite: false,
    });
    atmosphereMatRef.current = atmosphereMat;
    const atmosphereMesh = new Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // 5. Delhi AI Tracking Node Beacon Group (Delhi size reduced by ~20%)
    const beaconGroup = new Group();
    const delhiLatLng = { lat: 28.6139, lng: 77.2090 };
    const delhiPos = latLngToPosition(delhiLatLng.lat, delhiLatLng.lng, globeRadius + 0.005);
    beaconGroup.position.copy(delhiPos);

    // Align beacon group normal outward from center of sphere
    const beaconNormal = delhiPos.clone().normalize();
    beaconGroup.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), beaconNormal);
    globeGroup.add(beaconGroup);
    delhiBeaconGroupRef.current = beaconGroup;

    // Beacon Core Dot (Reduced from 0.015 to 0.009)
    const centerGeo = new SphereGeometry(0.009, 16, 16);
    const centerMat = new MeshBasicMaterial({ color: colors.accent });
    centerMatRef.current = centerMat;
    const centerDot = new Mesh(centerGeo, centerMat);
    beaconGroup.add(centerDot);

    // Beacon Soft Outer Glow (Reduced from 0.038 to 0.024, opacity lowered)
    const glowGeo = new SphereGeometry(0.024, 16, 16);
    const glowMat = new MeshBasicMaterial({
      color: colors.accentLight,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    glowMatRef.current = glowMat;
    const outerGlow = new Mesh(glowGeo, glowMat);
    beaconGroup.add(outerGlow);

    // Radar Expanding Pulses (Pulse radius reduced from 0.08 to 0.045, lower opacity)
    const pulseGeo = new RingGeometry(0.001, 0.045, 32);
    const pulseRings = [];
    for (let i = 0; i < 2; i++) {
      const pulseMat = new MeshBasicMaterial({
        color: colors.accent,
        transparent: true,
        opacity: 0.55,
        side: DoubleSide,
        depthWrite: false,
      });
      const pulseRing = new Mesh(pulseGeo, pulseMat);
      pulseRing.position.z = 0.002;
      pulseRing.scale.set(0.1, 0.1, 1.0);
      pulseRing.userData = {
        scale: 0.1 + i * 0.45,
        speed: 0.7,
      };
      beaconGroup.add(pulseRing);
      pulseRings.push(pulseRing);
    }
    pulseRingsRef.current = pulseRings;

    // Invisible larger raycast hit area for precise beacon hovering
    const hitSphereGeo = new SphereGeometry(0.09, 16, 16);
    const hitSphereMat = new MeshBasicMaterial({
      visible: false,
      depthWrite: false,
    });
    const hitSphere = new Mesh(hitSphereGeo, hitSphereMat);
    beaconGroup.add(hitSphere);
    hitSphereRef.current = hitSphere;

    // 6. Asynchronous land dotted map builder (Highly detailed, dense grid)
    let dotInstances = null;

    const buildDottedLand = async () => {
      try {
        const response = await fetch("/data/world.geojson");
        if (!response.ok) throw new Error("GeoJSON not found locally");
        const geojsonData = await response.json();

        // Canvas for coordinate land detection
        const offscreenW = 1024;
        const offscreenH = 512;
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = offscreenW;
        offscreenCanvas.height = offscreenH;
        const ctx = offscreenCanvas.getContext("2d", { willReadFrequently: true });
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, offscreenW, offscreenH);
        ctx.fillStyle = "#ffffff";

        geojsonData.features.forEach((feature) => {
          const geom = feature.geometry;
          if (!geom) return;

          const drawRing = (ring) => {
            if (ring.length === 0) return;
            const [startLng, startLat] = ring[0];
            const sx = ((startLng + 180) / 360) * offscreenW;
            const sy = ((90 - startLat) / 180) * offscreenH;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            for (let i = 1; i < ring.length; i++) {
              const [lng, lat] = ring[i];
              const x = ((lng + 180) / 360) * offscreenW;
              const y = ((90 - lat) / 180) * offscreenH;
              ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
          };

          if (geom.type === "Polygon") {
            geom.coordinates.forEach(drawRing);
          } else if (geom.type === "MultiPolygon") {
            geom.coordinates.forEach((poly) => poly.forEach(drawRing));
          }
        });

        const imgData = ctx.getImageData(0, 0, offscreenW, offscreenH);
        const pixels = imgData.data;

        const checkLand = (lng, lat) => {
          const x = Math.round(((lng + 180) / 360) * offscreenW) % offscreenW;
          const y = Math.round(((90 - lat) / 180) * offscreenH);
          const clampedY = Math.max(0, Math.min(offscreenH - 1, y));
          const idx = (clampedY * offscreenW + x) * 4;
          return pixels[idx] > 128;
        };

        // Populate coordinate mesh grid spacing (reduced to 2.3 for smaller, denser, evenly distributed dots)
        const coordinates = [];
        const spacing = 2.3;
        for (let lat = -82; lat <= 82; lat += spacing) {
          const latRad = (Math.abs(lat) * Math.PI) / 180;
          const cosLat = Math.cos(latRad);
          const lngStep = cosLat > 0.05 ? spacing / cosLat : 360;
          for (let lng = -180; lng < 180; lng += lngStep) {
            if (checkLand(lng, lat)) {
              coordinates.push([lng, lat]);
            }
          }
        }

        // InstancedMesh setup (dot sphere size reduced from 0.0075 to 0.0035 for OriginKit visual match)
        const dotGeo = new SphereGeometry(0.0035, 4, 4);
        const dotMat = new MeshBasicMaterial({
          color: 0xffffff, // Bright white dots
          transparent: true,
          opacity: 1.0,
        });

        dotInstances = new InstancedMesh(dotGeo, dotMat, coordinates.length);
        const matrix = new Matrix4();

        for (let i = 0; i < coordinates.length; i++) {
          const [lng, lat] = coordinates[i];
          const pos = latLngToPosition(lat, lng, globeRadius);
          matrix.makeScale(1, 1, 1);
          matrix.setPosition(pos);
          dotInstances.setMatrixAt(i, matrix);
        }

        dotInstances.instanceMatrix.needsUpdate = true;
        globeGroup.add(dotInstances);

        // 6b. Continent Boundary outlines for visual crispness (OriginKit match)
        const outlineVertices = [];
        const outlineIndices = [];
        let outlineIndexOffset = 0;

        geojsonData.features.forEach((feature) => {
          const geom = feature.geometry;
          if (!geom) return;

          const addRingLines = (ring) => {
            if (ring.length < 2) return;
            const startIdx = outlineIndexOffset;
            for (let i = 0; i < ring.length; i++) {
              const [lng, lat] = ring[i];
              const pos = latLngToPosition(lat, lng, globeRadius * 1.0008);
              outlineVertices.push(pos.x, pos.y, pos.z);
              if (i > 0) {
                outlineIndices.push(outlineIndexOffset - 1, outlineIndexOffset);
              }
              outlineIndexOffset++;
            }
            outlineIndices.push(outlineIndexOffset - 1, startIdx); // Close loop
          };

          if (geom.type === "Polygon") {
            geom.coordinates.forEach(addRingLines);
          } else if (geom.type === "MultiPolygon") {
            geom.coordinates.forEach((poly) => poly.forEach(addRingLines));
          }
        });

        const outlineGeo = new BufferGeometry();
        outlineGeo.setAttribute("position", new Float32BufferAttribute(outlineVertices, 3));
        outlineGeo.setIndex(outlineIndices);
        const outlineMat = new LineBasicMaterial({
          color: 0x6B6B6B, // Medium gray continent outlines
          transparent: true,
          opacity: 1.0, // Clear and visible
        });
        const outlineMesh = new LineSegments(outlineGeo, outlineMat);
        globeGroup.add(outlineMesh);

        setDataLoaded(true);
      } catch (err) {
        console.error("Land loading failed, falling back", err);
        setDataLoaded(true);
      }
    };

    buildDottedLand();

    // 7. Interaction Math & Variables
    // India coordinates: Lat 28.6139, Lng 77.2090
    const targetYRotation = -delhiLatLng.lng * (Math.PI / 180);
    const targetXRotation = delhiLatLng.lat * (Math.PI / 180);

    // Start offset for intro animation: Rotate camera from -90 degrees longitude and 0 latitude
    const initialYOffset = targetYRotation - 1.5; // Offset by ~85 degrees
    const initialXOffset = targetXRotation - 0.5;

    const rotation = { x: initialYOffset, y: initialXOffset };
    const targetRotation = { x: initialYOffset, y: initialXOffset };
    const velocity = { x: 0, y: 0 };
    
    let isDragging = false;
    let isHoveringBeacon = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    // Auto rotation parameters
    let autoRotationWeight = 0;
    let inertiaEndTime = performance.now();

    // Camera reveal sequence (zoom target changed from 2.55 to 2.35)
    let introProgress = 0;
    const introDuration = 1.6; // seconds

    // 8. Animation & Tick Loop
    const raycaster = new Raycaster();
    const mouse = new Vector2();
    let animationFrameId = null;

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.1); // Clamp to avoid spikes on tab blur
      const time = clock.getElapsedTime();

      // Accessibility: Respect user settings
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // First load camera intro ease-in (over 1.6s)
      if (introProgress < 1.0) {
        introProgress += dt / introDuration;
        if (introProgress > 1.0) introProgress = 1.0;
        
        // easeOutCubic curve
        const t = 1.0 - Math.pow(1.0 - introProgress, 3);
        camera.position.z = 4.4 + (2.35 - 4.4) * t;
        
        targetRotation.x = initialYOffset + (targetYRotation - initialYOffset) * t;
        targetRotation.y = initialXOffset + (targetXRotation - initialXOffset) * t;
        
        rotation.x = targetRotation.x;
        rotation.y = targetRotation.y;
      }

      // Base auto rotation speed (slower for reduced motion)
      const baseRotationSpeed = prefersReduced ? 0.05 : 0.22;

      // Handle Auto Rotation blending after drag inertia finishes
      if (isDragging || isHoveringBeacon || introProgress < 1.0) {
        autoRotationWeight = 0;
        if (isDragging) {
          inertiaEndTime = performance.now();
        }
      } else {
        const velMag = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        const isInertia = velMag > 0.0001;

        if (isInertia) {
          autoRotationWeight = 0;
          inertiaEndTime = performance.now();
        } else {
          // Inertia ended. Wait 1.8 seconds, then blend auto-rotation back in over 1 second
          const elapsed = (performance.now() - inertiaEndTime) / 1000;
          if (elapsed > 1.8) {
            autoRotationWeight = Math.min(1.0, autoRotationWeight + dt * 1.0);
          } else {
            autoRotationWeight = 0;
          }
        }
      }

      // Apply drag inertia / momentum decay
      if (!isDragging && introProgress >= 1.0) {
        const decay = prefersReduced ? 0.8 : 0.95;
        targetRotation.x += velocity.x;
        targetRotation.y += velocity.y;
        targetRotation.y = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, targetRotation.y));
        
        velocity.x *= decay;
        velocity.y *= decay;

        // Apply automatic slow rotation
        if (autoRotationWeight > 0) {
          targetRotation.x -= baseRotationSpeed * autoRotationWeight * dt;
        }
      }

      // Smoothly lerp towards target rotations
      const lerpFactor = prefersReduced ? 0.3 : 0.08;
      rotation.x += (targetRotation.x - rotation.x) * lerpFactor;
      rotation.y += (targetRotation.y - rotation.y) * lerpFactor;
      
      globeGroup.rotation.y = rotation.x;
      globeGroup.rotation.x = rotation.y;

      // 9. Beacon animations (breathing & pulsing)
      if (!prefersReduced) {
        const breathe = 1.0 + 0.12 * Math.sin(time * 2.8);
        centerDot.scale.set(breathe, breathe, breathe);

        const glowBreathe = 1.0 + 0.22 * Math.sin(time * 2.8);
        outerGlow.scale.set(glowBreathe, glowBreathe, glowBreathe);
        outerGlow.material.opacity = 0.16 + 0.06 * Math.sin(time * 2.8);

        // Slow organic floating and breathing motion on the entire globe
        globeGroup.position.y = Math.sin(time * 0.7) * 0.02;
        const globeBreathe = 1.0 + Math.sin(time * 0.9) * 0.008;
        globeGroup.scale.set(globeBreathe, globeBreathe, globeBreathe);
      } else {
        centerDot.scale.set(1.0, 1.0, 1.0);
        outerGlow.scale.set(1.0, 1.0, 1.0);
        outerGlow.material.opacity = 0.22;
        globeGroup.position.y = 0;
        globeGroup.scale.set(1, 1, 1);
      }

      // Pulse rings expansion animation
      pulseRings.forEach((ring) => {
        let rScale = ring.userData.scale;
        rScale += ring.userData.speed * dt;
        if (rScale > 1.0) {
          rScale = 0.05;
        }
        ring.userData.scale = rScale;
        ring.scale.set(rScale, rScale, 1.0);

        const progress = (rScale - 0.05) / 0.95;
        ring.material.opacity = (1.0 - progress) * 0.55;
      });

      // 10. Atmospheric glow hover state lerp (highly subtle Fresnel rim)
      const currentIntensity = atmosphereMat.uniforms.intensity.value;
      const targetIntensity = isHoveringBeacon ? 0.30 : 0.16;
      atmosphereMat.uniforms.intensity.value += (targetIntensity - currentIntensity) * 0.1;

      // Center dot hover glow animation
      if (isHoveringBeacon && !prefersReduced) {
        outerGlow.scale.addScalar(0.01);
        if (outerGlow.scale.x > 1.5) outerGlow.scale.set(1.5, 1.5, 1.5);
      }

      // Color transition interpolation (250-300ms transition)
      const colorLerpSpeed = Math.min(1.0, dt * 10.0);
      if (centerMatRef.current) {
        centerMatRef.current.color.lerp(targetColorsRef.current.accent, colorLerpSpeed);
      }
      if (glowMatRef.current) {
        glowMatRef.current.color.lerp(targetColorsRef.current.accentLight, colorLerpSpeed);
      }
      if (pulseRingsRef.current.length > 0) {
        pulseRingsRef.current.forEach((ring) => {
          ring.material.color.lerp(targetColorsRef.current.accent, colorLerpSpeed);
        });
      }
      if (atmosphereMatRef.current) {
        atmosphereMatRef.current.uniforms.color.value.lerp(targetColorsRef.current.accent, colorLerpSpeed);
      }

      // Render Scene
      renderer.render(scene, camera);

      // 11. Compute Delhi Beacon Screen position for HTML Popover positioning
      if (introProgress >= 1.0) {
        const beaconWorldPos = new Vector3();
        centerDot.getWorldPosition(beaconWorldPos);

        // Check if the marker is facing away from the camera
        const isBehind = beaconWorldPos.dot(camera.position) < 0;

        if (isBehind) {
          setShowPopover(false);
        } else {
          // Project world coords to normalized device coords (NDC)
          const projected = beaconWorldPos.clone().project(camera);
          
          // Map to pixel offset inside container
          const pixelX = (projected.x * 0.5 + 0.5) * width;
          const pixelY = (-(projected.y * 0.5) + 0.5) * height;

          // Tooltip dimensions and safe margins
          const W = 190;
          const H = 95;
          const edgeMargin = 15;
          const offsetDist = 26;

          // Candidate positions: above-right, above-left, below-right, below-left
          const pAboveRight = {
            left: pixelX + offsetDist,
            top: pixelY - offsetDist - H,
            origin: "bottom left"
          };
          const pAboveLeft = {
            left: pixelX - offsetDist - W,
            top: pixelY - offsetDist - H,
            origin: "bottom right"
          };
          const pBelowRight = {
            left: pixelX + offsetDist,
            top: pixelY + offsetDist,
            origin: "top left"
          };
          const pBelowLeft = {
            left: pixelX - offsetDist - W,
            top: pixelY + offsetDist,
            origin: "top right"
          };

          const positions = [pAboveRight, pAboveLeft, pBelowRight, pBelowLeft];
          let selected = null;

          for (const pos of positions) {
            const isInside = 
              pos.left >= edgeMargin && 
              (pos.left + W) <= width - edgeMargin && 
              pos.top >= edgeMargin && 
              (pos.top + H) <= height - edgeMargin;
            if (isInside) {
              selected = pos;
              break;
            }
          }

          if (!selected) {
            // Fallback to above-right, but clamp to boundaries
            selected = { ...pAboveRight };
            selected.left = Math.max(edgeMargin, Math.min(width - W - edgeMargin, selected.left));
            selected.top = Math.max(edgeMargin, Math.min(height - H - edgeMargin, selected.top));
          }

          const origin = selected.origin;
          const left = selected.left;
          const top = selected.top;
          const anchorX = origin.includes("left") ? left : left + W;
          const anchorY = origin.includes("bottom") ? top + H - 12 : top + 12;

          setPopoverPos({
            left,
            top,
            markerX: pixelX,
            markerY: pixelY,
            anchorX,
            anchorY,
            origin
          });
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 10. Drag-to-rotate listener setup
    const handleMouseDown = (e) => {
      isDragging = true;
      velocity.x = 0;
      velocity.y = 0;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      const handleMouseMoveDrag = (moveEvent) => {
        const sensitivity = 0.005;
        const dx = moveEvent.clientX - lastMouseX;
        const dy = moveEvent.clientY - lastMouseY;

        targetRotation.x += dx * sensitivity;
        targetRotation.y += dy * sensitivity;
        targetRotation.y = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, targetRotation.y));

        velocity.x = dx * sensitivity * 0.28;
        velocity.y = dy * sensitivity * 0.28;

        lastMouseX = moveEvent.clientX;
        lastMouseY = moveEvent.clientY;
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMoveDrag);
        document.removeEventListener("mouseup", handleMouseUp);
        isDragging = false;
      };

      document.addEventListener("mousemove", handleMouseMoveDrag);
      document.addEventListener("mouseup", handleMouseUp);
    };

    canvas.addEventListener("mousedown", handleMouseDown);

    // 11. Hover and Raycast Detection
    const handleMouseMoveHover = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(hitSphere);

      if (intersects.length > 0) {
        if (!isHoveringBeacon) {
          isHoveringBeacon = true;
          setShowPopover(true);
          setLatency(Math.floor(10 + Math.random() * 4));
        }
      } else {
        if (isHoveringBeacon) {
          isHoveringBeacon = false;
          setShowPopover(false);
        }
      }
    };

    canvas.addEventListener("mousemove", handleMouseMoveHover);

    // 12. ResizeObserver setup
    const resizeObserver = new ResizeObserver(() => {
      const newWidth = container.clientWidth || 400;
      const newHeight = container.clientHeight || 400;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });
    resizeObserver.observe(container);

    // Clean up Three.js resources on unmount (traverse handles all items recursively)
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMoveHover);
      resizeObserver.disconnect();
      renderer.dispose();
      
      globeGroup.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
    };
  }, [dataLoaded]);

  // Recolor effect: updates target colors dynamically when theme changes (transition lerped in animate loop)
  useEffect(() => {
    const colors = getThemeColors(accent);
    targetColorsRef.current.accent.copy(colors.accent);
    targetColorsRef.current.accentLight.copy(colors.accentLight);
  }, [accent]);

  return (
    <div ref={containerRef} className="globe-container-wrapper">
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="globe-canvas" style={{ opacity: showLoader ? 0 : 1 }} />

      {/* Cyberpunk Loader Screen overlay */}
      {showLoader && (
        <div className="globe-loader-overlay" style={{ opacity: loaderOpacity }}>
          <div className="globe-loader-terminal">
            {loadingLines.map((line, idx) => (
              <div
                key={idx}
                className={`globe-loader-line ${line.status} ${
                  line.status === "active" ? "globe-loader-cursor" : ""
                }`}
              >
                <span>{line.text}</span>
                <span>
                  {line.status === "done" && "[ OK ]"}
                  {line.status === "success" && "[ READY ]"}
                  {line.status === "active" && "[ LOAD ]"}
                  {line.status === "pending" && "[ WAIT ]"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holographic popup (only active when hovering over Delhi beacon) */}
      {showPopover && !showLoader && (
        <>
          {/* Subtle themed leader connector line */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-30"
            style={{ opacity: showPopover ? 0.7 : 0, transition: 'opacity 0.3s ease' }}
          >
            <line
              x1={popoverPos.markerX}
              y1={popoverPos.markerY}
              x2={popoverPos.anchorX}
              y2={popoverPos.anchorY}
              stroke="var(--accent-color)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <circle cx={popoverPos.markerX} cy={popoverPos.markerY} r="2.5" fill="var(--accent-color)" />
            <circle cx={popoverPos.anchorX} cy={popoverPos.anchorY} r="2" fill="var(--accent-color)" />
          </svg>

          <div
            className="globe-popover"
            style={{
              left: `${popoverPos.left}px`,
              top: `${popoverPos.top}px`,
              opacity: showPopover ? 1 : 0,
              transform: `scale(${showPopover ? 1 : 0.95})`,
              transformOrigin: popoverPos.origin,
              marginTop: '0px',
            }}
          >
            <div className="globe-popover-header">
              <span>SECURE LINK</span>
              <span>NODE_01</span>
            </div>
            <div className="globe-popover-title">Delhi, India</div>
            <div className="globe-popover-subtitle">AI Engineer</div>
            <div className="globe-popover-footer">
              <span>STATUS: <span className="globe-popover-status">ONLINE</span></span>
              <span>{latency}ms</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
