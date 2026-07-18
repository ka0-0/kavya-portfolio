import React, { Suspense, useRef, useEffect, useState, useMemo, useCallback, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useTheme } from '../theme/ThemeContext';

const faceColors = {
  blue: { start: '#93c5fd', end: '#60a5fa' },
  black: { start: '#f3f4f6', end: '#9ca3af' },
  pink: { start: '#fbcfe8', end: '#f472b6' },
  purple: { start: '#e9d5ff', end: '#c084fc' },
  orange: { start: '#fed7aa', end: '#fdba74' },
  red: { start: '#fecaca', end: '#fca5a5' },
  green: { start: '#a7f3d0', end: '#86efac' }
};

const drawFace = (ctx, eyeScaleY = 1.0, theme = 'blue', eyeOffsetX = 0, eyeOffsetY = 0) => {
  // Light Cyber Screen Background matching theme
  const colors = faceColors[theme] || faceColors.blue;
  const bgGradient = ctx.createLinearGradient(0, 0, 0, 512);
  bgGradient.addColorStop(0, colors.start);
  bgGradient.addColorStop(1, colors.end);
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
  ctx.ellipse(190 + eyeOffsetX, 256 + eyeOffsetY, 32, radiusY, 0, 0, 2 * Math.PI);
  ctx.fill();

  // Right Oval Eye
  ctx.beginPath();
  ctx.ellipse(322 + eyeOffsetX, 256 + eyeOffsetY, 32, radiusY, 0, 0, 2 * Math.PI);
  ctx.fill();
};

const easeInOutCubic = (x) => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

const Robot = memo(function Robot({ 
  onLoad, 
  onReady, 
  isReady, 
  responsiveScale, 
  mouseRef, 
  theme, 
  glanceAtAIKAV, 
  robotBubbleRef, 
  activeSection, 
  viewportRef 
}) {
  const { scene, animations } = useGLTF('/models/small_robot.glb');
  const groupRef = useRef();

  const faceCtxRef = useRef(null);
  const faceTextureRef = useRef(null);
  const lastBlinkRef = useRef(1.0);
  const lastThemeRef = useRef(theme);

  const bodyMaterialRef = useRef(null);
  const ringMaterialRef = useRef(null);

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

    drawFace(ctx, 1.0, theme, 0, 0);

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
          // Clone material to avoid sharing state between separate model meshes
          const mat = child.material.clone();
          child.material = mat;

          mat.envMapIntensity = 1.2;

          // A. BODY & RING MATERIAL (explainer_Body_Mat): Tint body texture dynamically while preserving glow
          if (mName.includes('body') || cName.includes('body') || cName.includes('ring')) {
            mat.color = new THREE.Color('#2563eb'); // Default initial
            mat.emissive = new THREE.Color('#ffffff'); // Neon white/cyan glowing borders
            mat.emissiveIntensity = 2.2;
            mat.roughness = 0.3;
            mat.metalness = 0.2;

            if (cName.includes('ring')) {
              ringMaterialRef.current = mat;
            } else {
              bodyMaterialRef.current = mat;
            }
          }
          // B. FACE SCREEN DISPLAY: Apply custom face texture with TWO BLACK OVAL EYES
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

  const springLeanRef = useRef({ x: 0, y: 0, z: 0 });

  const hasSignaledReadyRef = useRef(false);

  // Reaction State Machine ref
  const reactionRef = useRef({
    state: 'idle', // 'idle', 'trigger', 'wait_200ms', 'eyes_move', 'head_follow', 'stare', 'dialogue', 'sigh', 'return_blend', 'cooldown'
    startTime: 0,
    startRotY: 0,
    startRotX: 0,
    startRotZ: 0,
    lastPlayedTime: 0,
    cooldownDuration: 90000,
    eyeOffsetX: 0,
    targetRotY: 0,
    targetRotX: 0
  });

  const lastDrawnEyeOffsetXRef = useRef(0);

  // Listen for the orb dialogue cute joke event
  useEffect(() => {
    const handleCuteJoke = () => {
      const nowMs = Date.now();
      const rx = reactionRef.current;
      
      if (rx.state !== 'idle' && rx.state !== 'cooldown') return;
      if (rx.state === 'cooldown' && nowMs - rx.lastPlayedTime < rx.cooldownDuration) {
        return;
      }
      rx.state = 'trigger';
    };

    window.addEventListener('orb-cute-joke', handleCuteJoke);
    return () => {
      window.removeEventListener('orb-cute-joke', handleCuteJoke);
    };
  }, []);

  // Smooth floating, breathing, blinking, theme transitions & mouse tracking loop
  useFrame((state, delta) => {
    if (!hasSignaledReadyRef.current) {
      hasSignaledReadyRef.current = true;
      if (onReady) onReady();
    }
    if (!groupRef.current) return;

    const t = state.clock.getElapsedTime();

    // 1. Theme transition interpolation for material colors (250-350ms lerp timing)
    const themeColors = {
      blue:   { body: '#2563eb', ring: '#1e3a8a', metalness: 0.2, roughness: 0.3 },
      black:  { body: '#0a0a0a', ring: '#050505', metalness: 0.45, roughness: 0.38 }, // Piano Black / Obsidian
      pink:   { body: '#ec4899', ring: '#be185d', metalness: 0.2, roughness: 0.3 },
      purple: { body: '#8b5cf6', ring: '#4c1d95', metalness: 0.2, roughness: 0.3 },
      orange: { body: '#f97316', ring: '#7c2d12', metalness: 0.2, roughness: 0.3 },
      red:    { body: '#ef4444', ring: '#7f1d1d', metalness: 0.2, roughness: 0.3 },
      green:  { body: '#22c55e', ring: '#14532d', metalness: 0.2, roughness: 0.3 }
    };

    // Reusable static color instances to prevent garbage collection allocations in useFrame
    if (!Robot.tempBodyColor) Robot.tempBodyColor = new THREE.Color();
    if (!Robot.tempRingColor) Robot.tempRingColor = new THREE.Color();

    const targetShades = themeColors[theme] || themeColors.blue;
    // Smooth lerp color over ~300ms (damp factor around 8-9 converges in ~300ms)
    const lerpFactor = Math.min(1, delta * 8.5);

    if (bodyMaterialRef.current) {
      Robot.tempBodyColor.set(targetShades.body);
      bodyMaterialRef.current.color.lerp(Robot.tempBodyColor, lerpFactor);
      bodyMaterialRef.current.metalness = THREE.MathUtils.lerp(bodyMaterialRef.current.metalness, targetShades.metalness, lerpFactor);
      bodyMaterialRef.current.roughness = THREE.MathUtils.lerp(bodyMaterialRef.current.roughness, targetShades.roughness, lerpFactor);
    }
    if (ringMaterialRef.current) {
      Robot.tempRingColor.set(targetShades.ring);
      ringMaterialRef.current.color.lerp(Robot.tempRingColor, lerpFactor);
      ringMaterialRef.current.metalness = THREE.MathUtils.lerp(ringMaterialRef.current.metalness, targetShades.metalness, lerpFactor);
      ringMaterialRef.current.roughness = THREE.MathUtils.lerp(ringMaterialRef.current.roughness, targetShades.roughness, lerpFactor);
    }

    // 2. Dynamic Double Eye Blinking Loop and dynamic theme face screen redraw
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

      const themeChanged = lastThemeRef.current !== theme;
      const roundedEyeOffset = Math.round(reactionRef.current.eyeOffsetX);
      const eyeOffsetChanged = Math.abs(roundedEyeOffset - lastDrawnEyeOffsetXRef.current) >= 1;

      if (blinkCycle < 0.35 || lastBlinkRef.current !== eyeScaleY || themeChanged || eyeOffsetChanged) {
        lastBlinkRef.current = eyeScaleY;
        lastDrawnEyeOffsetXRef.current = roundedEyeOffset;
        if (themeChanged) {
          lastThemeRef.current = theme;
        }
        drawFace(faceCtxRef.current, eyeScaleY, theme, roundedEyeOffset, 0);
        faceTextureRef.current.needsUpdate = true;
      }
    }

    // 3. Multi-Frequency Non-Cyclic Organic Idle Float (Vertical ±8px, Horizontal ±5px, Roll ±2°)
    const floatY = (Math.sin(t * 0.73) * 0.032 + Math.sin(t * 1.31) * 0.018); // Vertical drift
    const floatX = (Math.cos(t * 0.61) * 0.020 + Math.sin(t * 1.17) * 0.012); // Horizontal drift
    const floatRotZ = (Math.sin(t * 0.53) * 0.020 + Math.cos(t * 0.97) * 0.015); // Slight roll oscillation

    // 4. Subtle Continuous Breathing Scale (1 -> 1.015 -> 1)
    const breathScale = 1.0 + (Math.sin(t * 0.89) * 0.5 + 0.5) * 0.015;
    groupRef.current.scale.setScalar(responsiveScale * breathScale);

    // 5. Spring-Driven Mouse Follow Lean (X: ±18px -> ~0.11 units, Y: ±12px -> ~0.075 units, RotZ: ±3° -> ~0.052 rad)
    const now = Date.now();
    const isIdle = !mouseRef.current.hasMoved || (now - mouseRef.current.lastMove > 2000);

    const normX = isIdle ? 0 : mouseRef.current.targetX;
    const normY = isIdle ? 0 : mouseRef.current.targetY;

    const targetLeanX = normX * 0.11;
    const targetLeanY = -normY * 0.075;
    const targetLeanZ = -normX * 0.052;

    const leanFactor = Math.min(1, delta * 4.5);
    springLeanRef.current.x = THREE.MathUtils.lerp(springLeanRef.current.x, targetLeanX, leanFactor);
    springLeanRef.current.y = THREE.MathUtils.lerp(springLeanRef.current.y, targetLeanY, leanFactor);
    springLeanRef.current.z = THREE.MathUtils.lerp(springLeanRef.current.z, targetLeanZ, leanFactor);

    // Apply combined position (base offset + idle float + spring mouse lean)
    groupRef.current.position.y = floatY + springLeanRef.current.y;
    groupRef.current.position.x = floatX + springLeanRef.current.x;
    groupRef.current.rotation.z = floatRotZ + springLeanRef.current.z;

    // 5.5 Robot reaction state machine
    const rx = reactionRef.current;
    const nowMs = Date.now();

    // Cancellation safety
    if (activeSection !== 'home' && rx.state !== 'idle' && rx.state !== 'cooldown') {
      rx.state = 'idle';
      rx.eyeOffsetX = 0;
      if (robotBubbleRef.current) {
        robotBubbleRef.current.style.opacity = "0";
        robotBubbleRef.current.style.transform = "translate(-50%, -50%) scale(0.95)";
        robotBubbleRef.current.style.pointerEvents = "none";
      }
    }

    // Cooldown progression
    if (rx.state === 'cooldown' && nowMs - rx.lastPlayedTime >= rx.cooldownDuration) {
      rx.state = 'idle';
    }

    // State machine checks
    if (rx.state === 'trigger') {
      const rect = document.getElementById('aikav-placeholder-home')?.getBoundingClientRect();
      const MAX_ROT_Y = (20 * Math.PI) / 180;
      const MAX_ROT_X = (10 * Math.PI) / 180;
      let targetRotY = -0.21;
      let targetRotX = -0.05;
      
      if (rect) {
        const v = viewportRef.current;
        const orbNormX = (rect.left + rect.width / 2) / v.w * 2 - 1;
        const orbNormY = (rect.top + rect.height / 2) / v.h * 2 - 1;
        targetRotY = THREE.MathUtils.clamp(orbNormX * MAX_ROT_Y * 2.2, -MAX_ROT_Y * 2.2, MAX_ROT_Y * 2.2);
        targetRotX = THREE.MathUtils.clamp(orbNormY * MAX_ROT_X * 2.2, -MAX_ROT_X * 2.2, MAX_ROT_X * 2.2);
      }
      
      rx.targetRotY = targetRotY;
      rx.targetRotX = targetRotX;
      rx.state = 'wait_200ms';
      rx.startTime = t;
    }

    if (rx.state === 'wait_200ms') {
      if (t - rx.startTime >= 0.200) {
        rx.state = 'eyes_move';
        rx.startTime = t;
      }
    } else if (rx.state === 'eyes_move') {
      const progress = Math.min(1, (t - rx.startTime) / 0.120);
      rx.eyeOffsetX = THREE.MathUtils.lerp(0, -20, progress);
      if (progress >= 1.0) {
        rx.state = 'head_follow';
        rx.startTime = t;
        rx.startRotY = groupRef.current.rotation.y;
        rx.startRotX = groupRef.current.rotation.x;
        rx.startRotZ = groupRef.current.rotation.z;
      }
    } else if (rx.state === 'head_follow') {
      const progress = Math.min(1, (t - rx.startTime) / 0.450);
      const eased = easeInOutCubic(progress);
      rx.eyeOffsetX = -20;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(rx.startRotY, rx.targetRotY, eased);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(rx.startRotX, rx.targetRotX, eased);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(rx.startRotZ, 0, eased);
      if (progress >= 1.0) {
        rx.state = 'stare';
        rx.startTime = t;
      }
    } else if (rx.state === 'stare') {
      rx.eyeOffsetX = -20;
      groupRef.current.rotation.y = rx.targetRotY;
      groupRef.current.rotation.x = rx.targetRotX;
      groupRef.current.rotation.z = 0;
      if (t - rx.startTime >= 0.800) {
        rx.state = 'dialogue';
        rx.startTime = t;
        if (robotBubbleRef.current) {
          robotBubbleRef.current.style.transitionDuration = "150ms";
          robotBubbleRef.current.style.opacity = "1";
          robotBubbleRef.current.style.transform = "translate(-50%, -50%) scale(1)";
          robotBubbleRef.current.style.pointerEvents = "auto";
        }
      }
    } else if (rx.state === 'dialogue') {
      rx.eyeOffsetX = -20;
      groupRef.current.rotation.y = rx.targetRotY;
      groupRef.current.rotation.x = rx.targetRotX;
      groupRef.current.rotation.z = 0;
      
      const elapsed = t - rx.startTime;
      if (elapsed >= 1.050 && elapsed < 1.250) {
        if (robotBubbleRef.current && robotBubbleRef.current.style.opacity !== "0") {
          robotBubbleRef.current.style.transitionDuration = "200ms";
          robotBubbleRef.current.style.opacity = "0";
          robotBubbleRef.current.style.transform = "translate(-50%, -50%) scale(0.95) translateY(-4px)";
          robotBubbleRef.current.style.pointerEvents = "none";
        }
      } else if (elapsed >= 1.250) {
        if (robotBubbleRef.current) {
          robotBubbleRef.current.style.opacity = "0";
          robotBubbleRef.current.style.transform = "translate(-50%, -50%) scale(0.95) translateY(-4px)";
          robotBubbleRef.current.style.pointerEvents = "none";
        }
        rx.state = 'sigh';
        rx.startTime = t;
      }
    } else if (rx.state === 'sigh') {
      rx.eyeOffsetX = -20;
      const elapsed = t - rx.startTime;
      let sighRotX = rx.targetRotX;
      
      if (elapsed < 0.250) {
        const progress = elapsed / 0.250;
        // Drop head 1 degree (0.017 rad)
        sighRotX = THREE.MathUtils.lerp(rx.targetRotX, rx.targetRotX + 0.017, progress);
      } else if (elapsed < 0.500) {
        const progress = (elapsed - 0.250) / 0.250;
        sighRotX = THREE.MathUtils.lerp(rx.targetRotX + 0.017, rx.targetRotX, progress);
      } else {
        rx.state = 'return_blend';
        rx.startTime = t;
        rx.startRotY = groupRef.current.rotation.y;
        rx.startRotX = groupRef.current.rotation.x;
        rx.startRotZ = groupRef.current.rotation.z;
      }
      groupRef.current.rotation.y = rx.targetRotY;
      groupRef.current.rotation.x = sighRotX;
      groupRef.current.rotation.z = 0;
    } else if (rx.state === 'return_blend') {
      const progress = Math.min(1, (t - rx.startTime) / 0.600);
      const eased = easeInOutCubic(progress);
      rx.eyeOffsetX = THREE.MathUtils.lerp(-20, 0, progress);
      
      const normX = isIdle ? 0 : mouseRef.current.targetX;
      const normY = isIdle ? 0 : mouseRef.current.targetY;
      const MAX_ROT_Y = (20 * Math.PI) / 180;
      const MAX_ROT_X = (10 * Math.PI) / 180;
      const normalTargetRotY = glanceAtAIKAV ? -0.45 : (normX * MAX_ROT_Y);
      const normalTargetRotX = glanceAtAIKAV ? -0.22 : (normY * MAX_ROT_X);
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(rx.startRotY, normalTargetRotY, eased);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(rx.startRotX, normalTargetRotX, eased);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(rx.startRotZ, floatRotZ + springLeanRef.current.z, eased);
      
      if (progress >= 1.0) {
        rx.state = 'cooldown';
        rx.lastPlayedTime = Date.now();
        rx.cooldownDuration = 60000 + Math.random() * 60000; // randomized once to 60-120 seconds
        window.dispatchEvent(new CustomEvent('robot-reaction-complete'));
      }
    }

    // 6. Full Viewport Head Tracking & Rotation Limits (±20° Horiz, ±10° Vert)
    if (rx.state === 'idle' || rx.state === 'wait_200ms' || rx.state === 'cooldown') {
      const MAX_ROT_Y = (20 * Math.PI) / 180;
      const MAX_ROT_X = (10 * Math.PI) / 180;

      const targetRotY = glanceAtAIKAV ? -0.45 : (normX * MAX_ROT_Y); // Glance towards top-left AIKAV
      const targetRotX = glanceAtAIKAV ? -0.22 : (normY * MAX_ROT_X); // Look up slightly

      const currentRotY = groupRef.current.rotation.y;
      const currentRotX = groupRef.current.rotation.x;

      if (Math.abs(currentRotY - targetRotY) > 0.001 || Math.abs(currentRotX - targetRotX) > 0.001) {
        const lerpFactorRot = Math.min(1, delta * (glanceAtAIKAV ? 6.0 : 4.5));
        groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRotY, targetRotY, lerpFactorRot);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(currentRotX, targetRotX, lerpFactorRot);
      } else {
        groupRef.current.rotation.y = targetRotY;
        groupRef.current.rotation.x = targetRotX;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
});

export default function RobotModel({ onLoad, glanceAtAIKAV, activeSection }) {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const robotBubbleRef = useRef(null);
  const [scale, setScale] = useState(1.0);
  const [isInView, setIsInView] = useState(true);
  const [loadEnv, setLoadEnv] = useState(true); // Mount environment immediately for pre-rendering
  const [isRenderReady, setIsRenderReady] = useState(false);
  const [isEntranceStarted, setIsEntranceStarted] = useState(false);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, []);

  const handleReady = useCallback(() => {
    if (isRenderReady) return;
    setIsRenderReady(true);
    if (onLoad) onLoad();

    const elapsed = Date.now() - mountTimeRef.current;
    const targetPause = 300; // Minimum presentation delay ~250-300ms
    const remainingDelay = Math.max(0, targetPause - elapsed);

    const timer = setTimeout(() => {
      setIsEntranceStarted(true);
    }, remainingDelay);

    return () => clearTimeout(timer);
  }, [isRenderReady, onLoad]);

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
    <motion.div 
      ref={containerRef} 
      className="relative flex items-center justify-center pointer-events-none w-full h-[340px] md:h-[520px] sm:h-[620px] lg:h-[700px] bg-transparent"
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      animate={
        isEntranceStarted
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 40, scale: 0.94 }
      }
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Speech bubble styling */}
      <style>{`
        .robot-speech-bubble {
          position: absolute;
          left: 55%;
          top: 35%;
          transform: translate(-50%, -50%) scale(0.95);
          opacity: 0;
          pointer-events: none;
          user-select: none;
          background: rgba(8, 12, 18, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(56, 189, 248, 0.25);
          box-shadow: 0 0 16px rgba(56, 189, 248, 0.15);
          padding: 8px 12px;
          border-radius: 12px;
          transition: opacity 150ms cubic-bezier(0.16, 1, 0.3, 1), transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1000;
        }
      `}</style>

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
        <directionalLight position={[5, 4, 2]} intensity={2.8} color={
          theme === 'blue' ? '#00d2ff' :
          theme === 'black' ? '#ffffff' :
          theme === 'pink' ? '#ec4899' :
          theme === 'purple' ? '#a855f7' :
          theme === 'orange' ? '#f97316' :
          theme === 'red' ? '#ef4444' :
          theme === 'green' ? '#22c55e' : '#00d2ff'
        } />
        <directionalLight position={[-5, 3, 2]} intensity={2.0} color="#a855f7" />
        <directionalLight position={[0, 6, 0]} intensity={1.0} color="#ffffff" />
        <pointLight position={[0, -1, 1.5]} intensity={1.5} color={
          theme === 'blue' ? '#00d2ff' :
          theme === 'black' ? '#ffffff' :
          theme === 'pink' ? '#ec4899' :
          theme === 'purple' ? '#a855f7' :
          theme === 'orange' ? '#f97316' :
          theme === 'red' ? '#ef4444' :
          theme === 'green' ? '#22c55e' : '#00d2ff'
        } />

        <Suspense fallback={null}>
          <Robot 
            onLoad={null} 
            onReady={handleReady} 
            isReady={isRenderReady} 
            responsiveScale={scale} 
            mouseRef={mouseRef} 
            theme={theme} 
            glanceAtAIKAV={glanceAtAIKAV}
            robotBubbleRef={robotBubbleRef}
            activeSection={activeSection}
            viewportRef={viewportRef}
          />
        </Suspense>
      </Canvas>

      {/* Speech Bubble Markup rendered AFTER Canvas to ensure correct visual stacking order */}
      <div ref={robotBubbleRef} className="robot-speech-bubble">
        <p style={{
          margin: 0,
          color: '#ffffff',
          fontWeight: '500',
          fontSize: '12.5px',
          lineHeight: '1.4',
          letterSpacing: '0.05em',
        }}>
          Shut up.
        </p>
      </div>
    </motion.div>
  );
}
