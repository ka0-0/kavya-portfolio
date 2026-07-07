import React, { Suspense, useRef, useEffect, useState, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment } from '@react-three/drei';
import * as THREE from 'three';


const drawFace = (ctx, eyeScaleY = 1.0) => {
  // Light Cyber Blue Screen Background
  const bgGradient = ctx.createLinearGradient(0, 0, 0, 512);
  bgGradient.addColorStop(0, '#93c5fd');
  bgGradient.addColorStop(1, '#60a5fa');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle Digital Grid Overlay
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2.5;
  for (let x = 0; x < 512; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y < 512; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // TWO PURE JET BLACK OVAL EYES WITH DYNAMIC Y-SCALE BLINKING
  ctx.fillStyle = '#000000';
  const radiusY = Math.max(3, 70 * eyeScaleY);

  // Left Oval Eye
  ctx.beginPath();
  ctx.ellipse(190, 256, 32, radiusY, 0, 0, 2 * Math.PI);
  ctx.fill();

  // Right Oval Eye
  ctx.beginPath();
  ctx.ellipse(322, 256, 32, radiusY, 0, 0, 2 * Math.PI);
  ctx.fill();
};

const Robot = memo(function Robot({ onLoad, onReady, isReady, responsiveScale, mouseRef }) {
  const { scene, animations } = useGLTF('/models/small_robot.glb');
  const groupRef = useRef();

  const faceCtxRef = useRef(null);
  const faceTextureRef = useRef(null);
  const lastBlinkRef = useRef(1.0);

  // Setup animations if present in small_robot.glb
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (actions) {
      const actionNames = Object.keys(actions);
      if (actionNames.length > 0) {
        const action = actions[actionNames[0]];
        if (action) {
          action.timeScale = 0.35; // Slow down idle body animation speed
          action.play();
        }
      }
    }
  }, [actions]);

  // Traverse scene, hide background planes first & configure materials
  useEffect(() => {
    if (!scene) return;

    if (onLoad) onLoad();

    // 1. Generate initial face screen canvas texture with TWO BLACK OVAL EYES
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 512;
    const ctx = faceCanvas.getContext('2d');

    drawFace(ctx, 1.0);

    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.flipY = false;

    faceCtxRef.current = ctx;
    faceTextureRef.current = faceTexture;

    // 2. Permanently purge explainer_Eye & standardSurface nodes from the scene graph
    const nodesToRemove = [];
    scene.traverse((obj) => {
      const name = (obj.name || '').toLowerCase();
      const matName = (obj.material?.name || '').toLowerCase();
      if (
        name.includes('eye') ||
        matName.includes('standardsurface') ||
        name.includes('standardsurface')
      ) {
        nodesToRemove.push(obj);
      }
    });
    nodesToRemove.forEach((node) => {
      node.visible = false;
      if (node.material) node.material.visible = false;
      if (node.parent) {
        node.parent.remove(node);
      }
    });

    // 3. Hide background floor planes & configure remaining materials
    scene.traverse((child) => {
      if (child.isMesh) {
        child.frustumCulled = true;
        child.castShadow = false;
        child.receiveShadow = false;

        const cName = (child.name || '').toLowerCase();
        const mName = (child.material?.name || '').toLowerCase();

        if (
          cName.includes('platform') ||
          cName.includes('floor') ||
          cName.includes('stage') ||
          cName.includes('podium') ||
          cName.includes('environment') ||
          cName.includes('background') ||
          cName.includes('plane')
        ) {
          child.visible = false;
          return;
        }

        if (child.material) {
          const mat = child.material;

          mat.envMapIntensity = 1.2;

          // A. BODY & RING MATERIAL (explainer_Body_Mat): Tint pale body texture to rich Royal Blue while preserving neon white border glow
          if (mName.includes('body') || cName.includes('body') || cName.includes('ring')) {
            mat.color = new THREE.Color('#2563eb'); // Rich Royal Cyber Blue for body surface
            mat.emissive = new THREE.Color('#ffffff'); // Neon white/cyan glowing borders around face, ears & bottom ring
            mat.emissiveIntensity = 2.2;
            mat.roughness = 0.3;
            mat.metalness = 0.2;
          }
          // B. FACE SCREEN DISPLAY: Apply custom face texture with TWO BLACK OVAL EYES and clear GLB maps
          else if (mName.includes('face') || cName.includes('face')) {
            mat.map = faceTexture;
            mat.emissiveMap = faceTexture;
            mat.normalMap = null;
            mat.bumpMap = null;
            mat.roughnessMap = null;
            mat.metalnessMap = null;
            mat.alphaMap = null;
            mat.color = new THREE.Color('#ffffff');
            mat.emissive = new THREE.Color('#ffffff');
            mat.emissiveIntensity = 0.8;
            mat.roughness = 0.2;
            mat.metalness = 0.1;
          }
        }
      }
    });

    // Shifted position upward to align robot center with hero text block
    const FIXED_SCALE = 12;
    scene.scale.set(FIXED_SCALE, FIXED_SCALE, FIXED_SCALE);
    scene.position.set(0, 0.25, 0);
  }, [scene, onLoad]);

  const frameCountRef = useRef(0);
  // Smooth floating, breathing, blinking & full-viewport mouse tracking loop
  useFrame((state, delta) => {
    if (frameCountRef.current >= 3) {
      if (onReady) onReady();
    }
    frameCountRef.current++;
    if (!groupRef.current) return;

    const t = state.clock.getElapsedTime();

    // 1. Dynamic Double Eye Blinking Loop (Blink-Blink double blink turn)
    if (faceCtxRef.current && faceTextureRef.current) {
      const blinkCycle = t % 2.8;
      let eyeScaleY = 1.0;

      // First Blink (0.00s - 0.12s)
      if (blinkCycle < 0.06) {
        eyeScaleY = Math.max(0.04, 1.0 - (blinkCycle / 0.06));
      } else if (blinkCycle < 0.12) {
        eyeScaleY = Math.min(1.0, (blinkCycle - 0.06) / 0.06);
      }
      // Second Blink (0.18s - 0.30s)
      else if (blinkCycle >= 0.18 && blinkCycle < 0.24) {
        eyeScaleY = Math.max(0.04, 1.0 - ((blinkCycle - 0.18) / 0.06));
      } else if (blinkCycle >= 0.24 && blinkCycle < 0.30) {
        eyeScaleY = Math.min(1.0, (blinkCycle - 0.24) / 0.06);
      }

      if (blinkCycle < 0.35 || lastBlinkRef.current !== eyeScaleY) {
        lastBlinkRef.current = eyeScaleY;
        drawFace(faceCtxRef.current, eyeScaleY);
        faceTextureRef.current.needsUpdate = true;
      }
    }

    // 1. Slow idle float oscillation (Y-axis)
    const floatY = Math.sin(t * 1.4) * 0.05;
    groupRef.current.position.y = floatY;

    // 2. Gentle breathing scale movement
    const breathScale = 1.0 + Math.sin(t * 1.8) * 0.006;
    groupRef.current.scale.setScalar(responsiveScale * breathScale);

    // 3. Full Viewport Mouse Tracking & Rotation Limits (±20° Horiz, ±10° Vert)
    const MAX_ROT_Y = (20 * Math.PI) / 180; // ±20 degrees
    const MAX_ROT_X = (10 * Math.PI) / 180; // ±10 degrees

    const now = Date.now();
    const isIdle = !mouseRef.current.hasMoved || (now - mouseRef.current.lastMove > 2000);

    const targetNormX = isIdle ? 0 : mouseRef.current.targetX;
    const targetNormY = isIdle ? 0 : mouseRef.current.targetY;

    const targetRotY = targetNormX * MAX_ROT_Y;
    const targetRotX = targetNormY * MAX_ROT_X;

    const currentRotY = groupRef.current.rotation.y;
    const currentRotX = groupRef.current.rotation.x;

    if (Math.abs(currentRotY - targetRotY) > 0.001 || Math.abs(currentRotX - targetRotX) > 0.001) {
      // Smooth lerp damping (no instant snapping)
      const lerpFactor = Math.min(1, delta * 4.5);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRotY, targetRotY, lerpFactor);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(currentRotX, targetRotX, lerpFactor);
    } else {
      groupRef.current.rotation.y = targetRotY;
      groupRef.current.rotation.x = targetRotX;
    }
  });

  return (
    <group ref={groupRef} visible={isReady}>
      <primitive object={scene} />
    </group>
  );
});

export default function RobotModel({ onLoad }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1.0);
  const [isInView, setIsInView] = useState(true);
  const [loadEnv, setLoadEnv] = useState(true); // Mount environment immediately for pre-rendering
  const [isReady, setIsReady] = useState(false);
  const mouseRef = useRef({ targetX: 0, targetY: 0, lastMove: 0, hasMoved: false });
  const viewportRef = useRef({ w: window.innerWidth || 1, h: window.innerHeight || 1 });

  // Cache viewport size on resize to prevent forced layout reads on mouse pointer events
  useEffect(() => {
    const handleResize = () => {
      viewportRef.current = { w: window.innerWidth || 1, h: window.innerHeight || 1 };
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Viewport Intersection Observer to freeze Canvas rendering when out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScale(0.85);
      } else if (width < 1024) {
        setScale(0.95);
      } else {
        setScale(1.0);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track cursor movement across the ENTIRE viewport (only active when model is visible)
  useEffect(() => {
    if (!isInView) return;

    const handlePointerMove = (e) => {
      const v = viewportRef.current;

      // Normalized viewport coordinates (-1 at far left/top to +1 at far right/bottom)
      const normX = (e.clientX / v.w) * 2 - 1;
      const normY = (e.clientY / v.h) * 2 - 1;

      mouseRef.current.targetX = Math.max(-1, Math.min(1, normX));
      mouseRef.current.targetY = Math.max(-1, Math.min(1, normY));
      mouseRef.current.lastMove = Date.now();
      mouseRef.current.hasMoved = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.hasMoved = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isInView]);

  const glSettings = useMemo(
    () => ({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    }),
    []
  );

  return (
    <div 
      ref={containerRef} 
      className="relative flex items-center justify-center pointer-events-none w-full h-[520px] sm:h-[620px] lg:h-[700px] bg-transparent transition-opacity duration-150 ease-in-out"
      style={{ opacity: isReady ? 1 : 0 }}
    >
      <Canvas
        frameloop={isInView ? "always" : "never"} // Freeze WebGL render loops entirely when Hero goes out of view!
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2)]}
        gl={glSettings}
        camera={{ position: [0, 0.35, 4.2], fov: 35 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        {/* Studio HDRI Environment Reflection Map (Deferred by 150ms) */}
        {loadEnv && <Environment preset="city" environmentIntensity={1.2} />}

        {/* Studio Lighting Setup */}
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight position={[3, 5, 4]} intensity={1.6} color="#ffffff" />
        <directionalLight position={[5, 4, 2]} intensity={2.8} color="#00d2ff" />
        <directionalLight position={[-5, 3, 2]} intensity={2.0} color="#a855f7" />
        <directionalLight position={[0, 6, 0]} intensity={1.0} color="#ffffff" />
        <pointLight position={[0, -1, 1.5]} intensity={1.5} color="#00d2ff" />

        <Suspense fallback={null}>
          <Robot onLoad={null} onReady={() => setIsReady(true)} isReady={isReady} responsiveScale={scale} mouseRef={mouseRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
