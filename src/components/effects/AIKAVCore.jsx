import React, { useEffect, useRef, useState } from 'react';

const CORE_STYLES = `
        .aikav-core-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;
        }

        /* 300px Symmetrical container frame */
        .aikav-svg-frame {
          position: relative;
          width: 300px;
          height: 300px;
          transform-style: preserve-3d;
          display: block;
          overflow: visible;
        }

        /* Perfectly Centered 3D Ambient Rear Halo cushion */
        .aikav-svg-frame::before {
          content: "";
          position: absolute;
          width: 280px;
          height: 280px;
          top: 10px;
          left: 10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 80%);
          filter: blur(15px);
          z-index: 0;
          pointer-events: none;
          animation: aikav-halo-breath 6s ease-in-out infinite alternate;
        }

        /* Perfectly Centered SVG gauged rings */
        .aikav-svg-frame svg {
          position: absolute;
          top: -22px;
          left: -22px;
          transition: transform 0.5s, animation-duration 0.5s ease;
          z-index: calc(10 - (2 * var(--j)));
          transform-origin: center;
          width: 344px;
          height: 344px;
          fill: none;
          will-change: transform;
          transform-style: preserve-3d;
        }

        /* -------------------------------------------------------------
           INDEPENDENT SLOW COGNITIVE ROTATIONS (NON-HARMONIC PRIMES)
           ------------------------------------------------------------- */
        
        /* SVG 1 (Outer containment ring: 54s clockwise + subtle glow breath) */
        .aikav-svg-frame svg[style*="--j: 0"] {
          animation: aikav-rotate-clockwise 54s linear infinite, aikav-outer-glow-breath 4.5s ease-in-out infinite;
          opacity: 0.55;
        }

        /* SVG 2 (Outer segment reactor coils: 26s clockwise) */
        .aikav-svg-frame svg[style*="--j: 1"] {
          animation: aikav-rotate-clockwise 26s linear infinite;
          opacity: 0.65;
          filter: drop-shadow(0 0 6px rgba(0, 102, 255, 0.42)); /* Electric Blue glow shadow */
        }

        /* SVG 3 (Technical gauges / ticks: 82s counter-clockwise) */
        .aikav-svg-frame svg[style*="--j: 2"] {
          animation: aikav-rotate-counter-clockwise 82s linear infinite;
          opacity: 0.7;
          filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.3));
        }
        
        /* out3 - elegant violet accent highlights: 72s counter-clockwise */
        .aikav-svg-frame #out3 {
          stroke: #7c3aed !important;
          opacity: 0.9;
          filter: drop-shadow(0 0 8px rgba(124, 58, 237, 0.8));
          animation: aikav-rotate-counter-clockwise 72s linear infinite;
          transform-origin: center;
        }

        /* SVG 4 (Inner segmented markings ring: 120s counter-clockwise slow drift) */
        .aikav-svg-frame svg[style*="--j: 3"] {
          animation: aikav-rotate-counter-clockwise 120s linear infinite;
          opacity: 0.75;
          filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.3));
        }

        /* SVG 5 (HUD center details: 40s clockwise) */
        .aikav-svg-frame svg[style*="--j: 4"] {
          animation: aikav-rotate-clockwise 40s linear infinite;
          opacity: 0.95;
          filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.5)); /* Cyan glow shadow */
        }
        
        /* Hide static HUD center circles and calibration ticks from SVG 5 to keep the lens clean */
        .aikav-svg-frame #center1,
        .aikav-svg-frame #center,
        .aikav-svg-frame #sensor-micro-details {
          display: none !important;
          opacity: 0 !important;
        }

        /* Volumetric Plasma Filaments animation */
        .aikav-svg-frame #plasma-filaments path {
          animation: aikav-filament-drift 5s ease-in-out infinite alternate;
          transform-origin: center;
        }

        /* Rotations */
        @keyframes aikav-rotate-clockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes aikav-rotate-counter-clockwise {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* Outer ring glow breathing: subtle 10-15% increase */
        @keyframes aikav-outer-glow-breath {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.25));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.38));
          }
        }

        /* -------------------------------------------------------------
           VOLUMETRIC FLUID PLASMA ENGINE (100% SYMMETRICAL GLOW)
           ------------------------------------------------------------- */
        .aikav-energy-sphere {
          position: absolute;
          top: 102px;
          left: 102px;
          border-radius: 50%;
          height: 96px;
          width: 96px;
          animation: aikav-rotate-sphere 12s linear infinite, aikav-shimmer-sweep 15s ease-in-out infinite;
          background: radial-gradient(circle at center, rgba(0, 255, 255, 0.15) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 100%);
          z-index: 1;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Perfectly Symmetrical Radial Energy Layers (Capped Blur) */
        .aikav-energy-sphere span {
          position: absolute;
          border-radius: 50%;
          height: 100%;
          width: 100%;
        }

        .aikav-energy-sphere span:nth-of-type(1) {
          background: radial-gradient(circle, rgba(0, 255, 255, 0.22) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 80%);
          filter: blur(6px);
          animation: aikav-span-breath 5s ease-in-out infinite alternate;
        }

        .aikav-energy-sphere span:nth-of-type(2) {
          background: radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, rgba(6, 182, 212, 0.12) 50%, transparent 80%);
          filter: blur(12px);
          animation: aikav-span-breath 4.2s ease-in-out infinite alternate;
          opacity: 0.8;
        }

        .aikav-energy-sphere span:nth-of-type(3) {
          background: radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(124, 58, 237, 0.08) 60%, transparent 80%);
          filter: blur(20px);
          animation: aikav-span-breath 6.2s ease-in-out infinite alternate;
          opacity: 0.6;
        }

        .aikav-energy-sphere span:nth-of-type(4) {
          background: radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(37, 99, 235, 0.08) 60%, transparent 80%);
          filter: blur(24px);
          animation: aikav-span-breath 5.2s ease-in-out infinite alternate;
          opacity: 0.4;
        }

        /* -------------------------------------------------------------
           PREMIUM RECESSED AI OPTICAL LENS
           ------------------------------------------------------------- */
        .aikav-optical-lens {
          position: absolute;
          top: 112px;
          left: 112px;
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 12;
        }

        /* Large recessed black circular lens with deep inset shadows & radial layers */
        .aikav-lens-aperture {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: radial-gradient(circle at center, #07070b 0%, #010102 70%, #000000 100%);
          border: solid 2px rgba(0, 255, 255, 0.9);
          box-shadow: 
            0 0 10px rgba(0, 255, 255, 0.45),
            inset 0 5px 10px rgba(0, 0, 0, 0.98),
            inset 0 -2px 5px rgba(255, 255, 255, 0.07),
            inset 0 0 16px rgba(0, 0, 0, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: transform 0.06s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease;
        }

        /* Micro Engineering Details (alignment cardinal notches) */
        .aikav-lens-tick {
          position: absolute;
          background-color: rgba(0, 255, 255, 0.4);
          pointer-events: none;
          z-index: 8;
        }

        .tick-n {
          width: 1px;
          height: 4px;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
        }

        .tick-s {
          width: 1px;
          height: 4px;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
        }

        .tick-e {
          width: 4px;
          height: 1px;
          right: 2px;
          top: 50%;
          transform: translateY(-50%);
        }

        .tick-w {
          width: 4px;
          height: 1px;
          left: 2px;
          top: 50%;
          transform: translateY(-50%);
        }

        /* Fixed Lens Reflections (Cyan & White specular reflections) */
        .aikav-lens-reflection {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 10;
        }

        .reflection-white {
          width: 3px;
          height: 3px;
          background-color: rgba(255, 255, 255, 0.4);
          top: 14px;
          left: 14px;
          filter: blur(0.2px);
        }

        .reflection-cyan {
          width: 7px;
          height: 3px;
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.15) 0%, transparent 100%);
          transform: rotate(-35deg);
          top: 12px;
          left: 16px;
          filter: blur(0.5px);
        }

        /* Violet accent arc segment bordering right side */
        .aikav-violet-accent {
          position: absolute;
          width: 69px;
          height: 69px;
          border-radius: 50%;
          border: solid 2.5px transparent;
          border-top-color: rgba(124, 58, 237, 0.35);
          border-right-color: rgba(124, 58, 237, 0.35);
          transform: rotate(-15deg);
          pointer-events: none;
          z-index: 9;
          filter: drop-shadow(0 0 4px rgba(124, 58, 237, 0.25));
        }

        /* Pupil container translated by cursor LERP */
        .aikav-pupil-container {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }

        /* Small glowing pupil wrapper for blink transitions */
        .aikav-pupil {
          position: relative;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.06s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Pupil Emitter: Gradient & slow low-intensity heartbeat keyframe */
        .aikav-pupil-emitter {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #ffffff 0%, #00ffff 45%, #0066ff 100%);
          box-shadow: 
            0 0 6px rgba(0, 255, 255, 0.6),
            0 0 11px rgba(0, 102, 255, 0.38);
          animation: aikav-heartbeat 9.5s ease-in-out infinite;
        }

        /* Tiny white specular highlight inside the pupil */
        .aikav-specular {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background-color: #ffffff;
          top: 2.5px;
          left: 2.5px;
          z-index: 5;
        }

        /* Heartbeat cycle: scale +1.05 and brightens emitter */
        @keyframes aikav-heartbeat {
          0%, 93%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          96% {
            transform: scale(1.05);
            filter: brightness(1.15);
          }
        }

        /* -------------------------------------------------------------
           MECHANICAL APERTURE BLINK TRANSITIONS
           ------------------------------------------------------------- */
        
        /* Shutter Ellipse Compression (ScaleY) on aperture */
        .aikav-optical-lens.aikav-recalibrating .aikav-lens-aperture {
          transform: scaleY(0.06);
          box-shadow: 
            0 0 4px rgba(0, 255, 255, 0.3),
            inset 0 0 12px rgba(0, 0, 0, 0.98);
        }

        /* Smooth pupil shrinking inside the contracting aperture */
        .aikav-optical-lens.aikav-recalibrating .aikav-pupil {
          transform: scale(0.18);
        }

        /* -------------------------------------------------------------
           FIRST LOAD WAKE-UP SEQUENCE STYLES
           ------------------------------------------------------------- */
        
        /* Step 1: Dim core, static paused rings, closed aperture, hidden pupil */
        .aikav-wake-step-1 .aikav-svg-frame {
          opacity: 0.25;
          filter: brightness(0.4) blur(1px);
        }
        .aikav-wake-step-1 svg {
          animation-play-state: paused !important;
        }
        .aikav-wake-step-1 .aikav-lens-aperture {
          transform: scaleY(0.06) !important;
        }
        .aikav-wake-step-1 .aikav-pupil {
          transform: scale(0) !important;
          opacity: 0 !important;
        }

        /* Step 2: Pupil visible/powered on inside closed aperture, rings paused */
        .aikav-wake-step-2 .aikav-svg-frame {
          opacity: 0.55;
          filter: brightness(0.7) blur(0.5px);
          transition: opacity 0.6s ease, filter 0.6s ease;
        }
        .aikav-wake-step-2 svg {
          animation-play-state: paused !important;
        }
        .aikav-wake-step-2 .aikav-lens-aperture {
          transform: scaleY(0.06) !important;
        }
        .aikav-wake-step-2 .aikav-pupil {
          transform: scale(1) !important;
          opacity: 1 !important;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
        }

        /* Step 3: Rings start spinning, outer glow appears, lens still closed */
        .aikav-wake-step-3 .aikav-svg-frame {
          opacity: 1;
          filter: brightness(1);
          transition: opacity 0.6s ease, filter 0.6s ease;
        }
        .aikav-wake-step-3 .aikav-lens-aperture {
          transform: scaleY(0.06) !important;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Steps 4, 5, 6: Lens opens */
        .aikav-wake-step-4 .aikav-lens-aperture,
        .aikav-wake-step-5 .aikav-lens-aperture,
        .aikav-wake-step-6 .aikav-lens-aperture {
          transform: scaleY(1);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Start-of-hover micro acknowledgement pulse (250ms, scale +4%) */
        .aikav-hover-pulse {
          animation: aikav-micro-pulse-keyframes 0.25s ease-out !important;
        }
        @keyframes aikav-micro-pulse-keyframes {
          0% {
            transform: scale(1);
            filter: brightness(1);
          }
          40% {
            transform: scale(1.04);
            filter: brightness(1.1);
          }
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
        }

        /* Keyframes */
        @keyframes aikav-rotate-sphere {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes aikav-span-breath {
          0% {
            opacity: 0.3;
            transform: scale(0.95);
          }
          100% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes aikav-halo-breath {
          0% {
            opacity: 0.5;
            transform: scale(0.93);
          }
          100% {
            opacity: 0.9;
            transform: scale(1.07);
          }
        }

        /* Periodic cognitive shimmer sweep */
        @keyframes aikav-shimmer-sweep {
          0% { filter: brightness(1); }
          44% { filter: brightness(1); }
          47% { filter: brightness(1.12) contrast(1.03); }
          50% { filter: brightness(1); }
          100% { filter: brightness(1); }
        }

        /* Morphing electrical filament animation keyframes */
        @keyframes aikav-filament-drift {
          0% {
            opacity: 0.25;
            transform: rotate(0deg) scale(0.95);
            stroke-width: 0.5px;
          }
          50% {
            opacity: 0.7;
            transform: rotate(180deg) scale(1.05);
            stroke-width: 0.75px;
          }
          100% {
            opacity: 0.35;
            transform: rotate(360deg) scale(0.95);
            stroke-width: 0.5px;
          }
        }

        /* -------------------------------------------------------------
           LIGHTWEIGHT SINGLE CSS WARP THRUSTER TRAIL
           ------------------------------------------------------------- */
        .aikav-thruster-trail {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 140px;
          height: 48px;
          margin-top: -24px;
          margin-left: -70px;
          border-radius: 50%;
          background: radial-gradient(ellipse at right center, rgba(0, 255, 255, 0.85) 0%, rgba(6, 182, 212, 0.45) 35%, rgba(37, 99, 235, 0.15) 70%, transparent 100%);
          filter: blur(8px);
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transform-origin: center right;
          transition: opacity 120ms ease-out, transform 120ms ease-out;
          will-change: transform, opacity;
        }

        .aikav-thruster-active {
          opacity: 1;
          animation: aikav-thruster-pulse 200ms ease-out forwards;
        }

        @keyframes aikav-thruster-pulse {
          0% {
            opacity: 0;
            transform: rotate(var(--trail-angle, 135deg)) translate(20px, 0) scaleX(0.3) scaleY(0.5);
          }
          35% {
            opacity: 0.95;
            transform: rotate(var(--trail-angle, 135deg)) translate(-40px, 0) scaleX(1.15) scaleY(1.0);
          }
          100% {
            opacity: 0;
            transform: rotate(var(--trail-angle, 135deg)) translate(-80px, 0) scaleX(1.4) scaleY(0.3);
          }
        }

        /* Temporary CSS ring rotation speed boost (~2x speed) */
        .aikav-rings-boosted svg {
          transition: animation-duration 120ms ease-in-out !important;
        }

        .aikav-rings-boosted svg[style*="--j: 0"] {
          animation-duration: 27s !important;
        }

        .aikav-rings-boosted svg[style*="--j: 1"] {
          animation-duration: 13s !important;
        }

        .aikav-rings-boosted svg[style*="--j: 2"] {
          animation-duration: 41s !important;
        }

        .aikav-rings-boosted #out3 {
          animation-duration: 36s !important;
        }

        .aikav-rings-boosted svg[style*="--j: 3"] {
          animation-duration: 60s !important;
        }

        .aikav-rings-boosted svg[style*="--j: 4"] {
          animation-duration: 20s !important;
        }

        /* 10% Flight Glow Boost */
        .aikav-glow-boosted .aikav-svg-frame::before {
          filter: blur(18px) brightness(1.2) !important;
          opacity: 0.95 !important;
          transition: filter 150ms ease-out, opacity 150ms ease-out;
        }
`;

const injectCoreStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('aikav-core-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'aikav-core-styles';
    styleEl.textContent = CORE_STYLES;
    document.head.appendChild(styleEl);
  }
};

// Ensure styles are injected once globally on module load
injectCoreStyles();

const AIKAVCore = ({ 
  size = 320, 
  className = '', 
  style = {}, 
  lookAway = false,
  forceBlink = false,
  lookDirection = null,
  isMoving = false,
  ringSpeedBoost = false,
  thrusterActive = false,
  thrusterAngle = 135,
  glowBoost = false
}) => {
  const scale = size / 300;
  const wrapperRef = useRef(null);
  const pupilRef = useRef(null);
  const isTrackingPausedRef = useRef(false);
  const [isBlinking, setIsBlinking] = useState(false);
  
  // Lazy initial state prevents mount-time setWakeUpStep re-render pass
  const [wakeUpStep, setWakeUpStep] = useState(() => {
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('aikav-woke')) {
      return 1;
    }
    return 0;
  });
  const wakeUpStepRef = useRef(wakeUpStep);
  wakeUpStepRef.current = wakeUpStep;

  const lastMouseMoveTimeRef = useRef(performance.now());

  // Hover awareness & controlled transition states
  const [isHovered, setIsHovered] = useState(false);
  const [isHoverPulsing, setIsHoverPulsing] = useState(false);
  const isHoveredRef = useRef(false);
  const lookAwayRef = useRef(lookAway);
  const lookDirectionRef = useRef(lookDirection);
  const isMovingRef = useRef(isMoving);

  // Directly sync state & props with mutable refs for requestAnimationFrame tracking loop
  isHoveredRef.current = isHovered;
  lookAwayRef.current = lookAway;
  lookDirectionRef.current = lookDirection;
  isMovingRef.current = isMoving;
  const lastPupilPosRef = useRef({ x: '', y: '' });

  // Safety fallback to ensure styles are attached
  useEffect(() => {
    injectCoreStyles();
  }, []);

  // Controlled single blink trigger during transition pre-movement
  useEffect(() => {
    if (forceBlink) {
      setIsBlinking(true);
      isTrackingPausedRef.current = true;
      const t1 = setTimeout(() => {
        setIsBlinking(false);
        const t2 = setTimeout(() => {
          isTrackingPausedRef.current = false;
        }, 60);
      }, 120);
      return () => {
        clearTimeout(t1);
      };
    }
  }, [forceBlink]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsHoverPulsing(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsHoverPulsing(false);
  };

  // Reset micro pulse acknowledgement after 250ms
  useEffect(() => {
    if (isHoverPulsing) {
      const timer = setTimeout(() => setIsHoverPulsing(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isHoverPulsing]);

  // Timed session-gated Wake-up sequence on first page load (no mount re-render)
  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('aikav-woke')) {
      sessionStorage.setItem('aikav-woke', 'true');

      const t1 = setTimeout(() => setWakeUpStep(2), 600);  // Step 2: Pupil powers on (visible inside slit)
      const t2 = setTimeout(() => setWakeUpStep(3), 1200); // Step 3: Rings start spinning, outer glow appears
      const t3 = setTimeout(() => setWakeUpStep(4), 1600); // Step 4: Lens opens, pupil looks LEFT
      const t4 = setTimeout(() => setWakeUpStep(5), 2100); // Step 5: Pupil looks RIGHT
      const t5 = setTimeout(() => setWakeUpStep(6), 2600); // Step 6: Pupil returns CENTER
      const t6 = setTimeout(() => setWakeUpStep(0), 3000); // Step 0: Wake-up ends, tracking active

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
        clearTimeout(t6);
      };
    }
  }, []);

  // High-performance, scroll-aware LERP pupil cursor tracking & idle focus loop
  useEffect(() => {
    let clientX = null;
    let clientY = null;
    let currentX = 0;
    let currentY = 0;
    let cachedRect = null;
    let isRectDirty = true;

    const handleMouseMove = (e) => {
      clientX = e.clientX;
      clientY = e.clientY;
      lastMouseMoveTimeRef.current = performance.now();
      isRectDirty = true;
    };

    const handleMouseLeaveViewport = (e) => {
      if (!e.relatedTarget) {
        clientX = null;
        clientY = null;
      }
    };

    const handleWindowBlur = () => {
      clientX = null;
      clientY = null;
    };

    const markRectDirty = () => {
      isRectDirty = true;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveViewport);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('resize', markRectDirty, { passive: true });
    window.addEventListener('scroll', markRectDirty, { passive: true, capture: true });

    let animId;
    let startFrameId;

    const updatePosition = () => {
      let targetX = 0;
      let targetY = 0;
      let ease = 0.15;
      const timeMs = performance.now();

      const isCursorActive = clientX !== null && clientY !== null;
      const currentWakeUpStep = wakeUpStepRef.current;
      // Pause cursor tracking during blinks, wake-up sequence, dialogue reaction, relocation movement, or explicit look direction
      const isPaused = isTrackingPausedRef.current || currentWakeUpStep > 0 || lookAwayRef.current || isMovingRef.current || !!lookDirectionRef.current;

      if (!isPaused && isCursorActive && wrapperRef.current) {
        if (isRectDirty || !cachedRect) {
          cachedRect = wrapperRef.current.getBoundingClientRect();
          isRectDirty = false;
        }
        const lensCenterX = cachedRect.left + cachedRect.width / 2;
        const lensCenterY = cachedRect.top + cachedRect.height / 2;

        const dx = clientX - lensCenterX;
        const dy = clientY - lensCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          const dirX = dx / dist;
          const dirY = dy / dist;

          // Proximity Factor: 0 when cursor is at 40px, 1 when cursor is at 180px or further
          const proximityFactor = Math.min(Math.max((dist - 40) / 140, 0), 1);
          
          // Hover Awareness: increase max radius limits by exactly 1px (from 7.5px to 8.5px) when hovered
          const radiusMultiplier = 3.0;
          const baseRadius = 4.5;
          const maxRadius = (baseRadius + proximityFactor * radiusMultiplier) + (isHoveredRef.current ? 1.0 : 0.0);

          const targetDist = Math.min(dist * 0.045, maxRadius);
          targetX = dirX * targetDist;
          targetY = dirY * targetDist;

          // Hover Awareness Easing: track exactly 15% faster when hovered
          const normalEase = 0.11 + proximityFactor * 0.04;
          ease = normalEase * (isHoveredRef.current ? 1.15 : 1.0);

          // Idle Focus Twitch: when cursor is stationary for 2s, perform a tiny 1px autofocus twitch every 15s
          const isStationary = (timeMs - lastMouseMoveTimeRef.current) >= 2000;
          if (isStationary) {
            const cycle = (timeMs / 1000) % 15;
            if (cycle < 1.8) {
              const pulse = Math.sin((cycle * Math.PI) / 1.8); // 0 -> 1 -> 0 rise and fall
              const intervalIndex = Math.floor(timeMs / 15000);
              const angle = (intervalIndex * 115) * (Math.PI / 180);
              targetX += Math.cos(angle) * 1.0 * pulse;
              targetY += Math.sin(angle) * 1.0 * pulse;
            }
          }
        }
      } else if (lookDirectionRef.current) {
        // Pre-movement glance toward relocation destination
        if (lookDirectionRef.current === 'bottom-right') {
          targetX = 6.0;
          targetY = 6.0;
        } else if (lookDirectionRef.current === 'top-left') {
          targetX = -6.0;
          targetY = -6.0;
        } else if (typeof lookDirectionRef.current === 'object') {
          targetX = lookDirectionRef.current.x ?? 0;
          targetY = lookDirectionRef.current.y ?? 0;
        }
        ease = 0.35; // Snappy glance
      } else if (isMovingRef.current) {
        // Hold natural center position during high-speed arc movement
        targetX = 0;
        targetY = 0;
        ease = 0.2;
      } else if (isPaused && currentWakeUpStep > 0) {
        // Wake-up look around calibration timeline steps
        if (currentWakeUpStep === 4) {
          targetX = -6; // Look left
          targetY = 0;
        } else if (currentWakeUpStep === 5) {
          targetX = 6;  // Look right
          targetY = 0;
        } else {
          targetX = 0;  // Center
          targetY = 0;
        }
        ease = 0.08; // Ultra smooth look around speed
      } else if (isPaused && lookAwayRef.current) {
        // Look away briefly during the dialogue joke calibration
        targetX = 7.5; // Look away (e.g. to the right/up)
        targetY = -2;
        ease = 0.22; // Snappy look away
      } else if (!isCursorActive && !isTrackingPausedRef.current) {
        // Idle focus adjustments when cursor is out of viewport: 1.0px correction every 15 seconds
        const cycle = (timeMs / 1000) % 15;
        if (cycle < 1.8) {
          const pulse = Math.sin((cycle * Math.PI) / 1.8);
          const intervalIndex = Math.floor(timeMs / 15000);
          const angle = (intervalIndex * 115) * (Math.PI / 180);
          targetX = Math.cos(angle) * 1.0 * pulse; // Max 1px correction
          targetY = Math.sin(angle) * 1.0 * pulse;
        }
        ease = 0.08; // Smooth idle correction speed
      }

      // Spring interpolation: current += (target - current) * ease
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      const pxStr = currentX.toFixed(2);
      const pyStr = currentY.toFixed(2);

      if (pupilRef.current && (lastPupilPosRef.current.x !== pxStr || lastPupilPosRef.current.y !== pyStr)) {
        lastPupilPosRef.current.x = pxStr;
        lastPupilPosRef.current.y = pyStr;
        pupilRef.current.style.transform = 'translate(' + pxStr + 'px, ' + pyStr + 'px)';
      }

      animId = requestAnimationFrame(updatePosition);
    };

    startFrameId = requestAnimationFrame(() => {
      updatePosition();
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveViewport);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('resize', markRectDirty);
      window.removeEventListener('scroll', markRectDirty, { capture: true });
      cancelAnimationFrame(startFrameId);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Periodic camera aperture mechanical blinks (with nested double blinks)
  useEffect(() => {
    let blinkTimeout;
    let openTimeout;

    const triggerBlink = (isDouble = false) => {
      setIsBlinking(true);
      isTrackingPausedRef.current = true;

      // Close transition: 60ms. Hold: 80ms. Total: 140ms.
      blinkTimeout = setTimeout(() => {
        setIsBlinking(false);

        // Open transition: 60ms. Total: 200ms.
        openTimeout = setTimeout(() => {
          isTrackingPausedRef.current = false;

          // Occasionally perform a double blink (22% chance, only if not already a double)
          const shouldDouble = !isDouble && Math.random() < 0.22;

          if (shouldDouble) {
            const doubleDelay = 150 + Math.random() * 100; // 150-250ms
            blinkTimeout = setTimeout(() => triggerBlink(true), doubleDelay);
          } else {
            // Schedule next standard blink in 4s ± 500ms (3.5s to 4.5s)
            const nextDelay = 3500 + Math.random() * 1000;
            blinkTimeout = setTimeout(() => triggerBlink(false), nextDelay);
          }
        }, 60);
      }, 140);
    };

    // Stagger first blink if wake-up sequence is active on initial load
    const hasWoke = sessionStorage.getItem('aikav-woke');
    const initialDelay = hasWoke ? (3500 + Math.random() * 1000) : (6500 + Math.random() * 1000);
    blinkTimeout = setTimeout(() => triggerBlink(false), initialDelay);

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(openTimeout);
    };
  }, []);

  const wakeUpClass = wakeUpStep > 0 ? ('aikav-wake-step-' + wakeUpStep) : '';
  const activeHoverClass = isHovered ? 'aikav-active-hover' : '';
  const ringSpeedClass = ringSpeedBoost ? 'aikav-rings-boosted' : '';
  const glowBoostClass = glowBoost ? 'aikav-glow-boosted' : '';
  const containerClassName = ['aikav-core-wrapper', className, wakeUpClass, activeHoverClass, ringSpeedClass, glowBoostClass].filter(Boolean).join(' ');

  return (
    <div
      className={containerClassName}
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        width: size + 'px',
        height: size + 'px',
      }}
    >
      <div
        className="aikav-svg-frame"
        style={{
          transform: 'scale(' + scale + ')',
        }}
      >
        {/* Single lightweight CSS radial-gradient warp thruster exhaust trail */}
        <div
          className={'aikav-thruster-trail' + (thrusterActive ? ' aikav-thruster-active' : '')}
          style={{
            '--trail-angle': (thrusterAngle ?? 135) + 'deg',
            transform: 'rotate(' + (thrusterAngle ?? 135) + 'deg)'
          }}
        />
        {/* Volumetric Fluid Plasma Engine */}
        <div className="aikav-energy-sphere">
          <span />
          <span />
          <span />
          <span />
        </div>

        {/* AI Premium Optical Lens Unit (Sibling to Energy Sphere, completely static) */}
        <div className={'aikav-optical-lens' + (isBlinking ? ' aikav-recalibrating' : '')}>
          {/* Violet accent arc segment */}
          <div className="aikav-violet-accent" />
          
          {/* The lens aperture (cyan border, recessed dark gradient face) */}
          <div className="aikav-lens-aperture">
            {/* Cardinal calibration ticks */}
            <div className="aikav-lens-tick tick-n" />
            <div className="aikav-lens-tick tick-e" />
            <div className="aikav-lens-tick tick-s" />
            <div className="aikav-lens-tick tick-w" />

            {/* Fixed Lens Reflections */}
            <div className="aikav-lens-reflection reflection-white" />
            <div className="aikav-lens-reflection reflection-cyan" />
            
            {/* Specular highlight is inside the pupil */}
            <div className="aikav-pupil-container" ref={pupilRef}>
              <div className="aikav-pupil">
                <div className={'aikav-pupil-emitter' + (isHoverPulsing ? ' aikav-hover-pulse' : '')}>
                  <div className="aikav-specular" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HUD Ring Layer 1 (Outer Ring out1) */}
        <svg style={{ '--i': 0, '--j': 0 }}>
          <g id="out1">
            <path d="M72 172C72 116.772 116.772 72 172 72C227.228 72 272 116.772 272 172C272 227.228 227.228 272 172 272C116.772 272 72 227.228 72 172ZM197.322 172C197.322 158.015 185.985 146.678 172 146.678C158.015 146.678 146.678 158.015 146.678 172C146.678 185.985 158.015 197.322 172 197.322C185.985 197.322 197.322 185.985 197.322 172Z" />
            <path mask="url(#path-1-inside-1_111_3212)" strokeMiterlimit={16} strokeWidth={2} stroke="#00FFFF" d="M72 172C72 116.772 116.772 72 172 72C227.228 72 272 116.772 272 172C272 227.228 227.228 272 172 272C116.772 272 72 227.228 72 172ZM197.322 172C197.322 158.015 185.985 146.678 172 146.678C158.015 146.678 146.678 158.015 146.678 172C146.678 185.985 158.015 197.322 172 197.322C185.985 197.322 197.322 185.985 197.322 172Z" />
          </g>
        </svg>

        {/* HUD Ring Layer 2 (Outer Segmented Reactor Coils) */}
        <svg style={{ '--i': 1, '--j': 1 }}>
          <g id="out2">
            <mask fill="white" id="path-2-inside-2_111_3212">
              <path d="M102.892 127.966C93.3733 142.905 88.9517 160.527 90.2897 178.19L94.3752 177.88C93.1041 161.1 97.3046 144.36 106.347 130.168L102.892 127.966Z" />
              <path d="M93.3401 194.968C98.3049 211.971 108.646 226.908 122.814 237.541L125.273 234.264C111.814 224.163 101.99 209.973 97.2731 193.819L93.3401 194.968Z" />
              <path d="M152.707 92.3592C140.33 95.3575 128.822 101.199 119.097 109.421L121.742 112.55C130.981 104.739 141.914 99.1897 153.672 96.3413L152.707 92.3592Z" />
              <path d="M253.294 161.699C255.099 175.937 253.132 190.4 247.59 203.639L243.811 202.057C249.075 189.48 250.944 175.74 249.23 162.214L253.294 161.699Z" />
              <path d="M172 90.0557C184.677 90.0557 197.18 92.9967 208.528 98.6474C219.875 104.298 229.757 112.505 237.396 122.621L234.126 125.09C226.869 115.479 217.481 107.683 206.701 102.315C195.921 96.9469 184.043 94.1529 172 94.1529V90.0557Z" />
              <path d="M244.195 133.235C246.991 138.442 249.216 143.937 250.83 149.623L246.888 150.742C245.355 145.34 243.242 140.12 240.586 135.174L244.195 133.235Z" />
              <path d="M234.238 225.304C223.932 237.338 210.358 246.126 195.159 250.604C179.961 255.082 163.7 255.058 148.606 250.534L149.775 246.607C164.201 250.905 179.563 250.928 194.001 246.674C208.44 242.42 221.335 234.071 231.126 222.639L234.238 225.304Z" />
            </mask>
            <path mask="url(#path-2-inside-2_111_3212)" fill="#00FFFF" d="M102.892 127.966L105.579 123.75L101.362 121.063L98.6752 125.28L102.892 127.966ZM90.2897 178.19L85.304 178.567L85.6817 183.553L90.6674 183.175L90.2897 178.19ZM94.3752 177.88L94.7529 182.866L99.7386 182.488L99.3609 177.503L94.3752 177.88ZM106.347 130.168L110.564 132.855L113.251 128.638L109.034 125.951L106.347 130.168ZM93.3401 194.968L91.9387 190.168L87.1391 191.569L88.5405 196.369L93.3401 194.968ZM122.814 237.541L119.813 241.54L123.812 244.541L126.813 240.542ZM125.273 234.264L129.272 237.265L132.273 233.266L128.274 230.265L125.273 234.264ZM97.2731 193.819L102.073 192.418L100.671 187.618L95.8717 189.02L97.2731 193.819ZM152.707 92.3592L157.567 91.182L156.389 86.3226L151.53 87.4998L152.707 92.3592ZM119.097 109.421L115.869 105.603L112.05 108.831L115.278 112.649ZM121.742 112.55L117.924 115.778L121.152 119.596L124.97 116.368ZM153.672 96.3413L154.849 101.201L159.708 100.023L158.531 95.1641ZM253.294 161.699L258.255 161.07L257.626 156.11L252.666 156.738L253.294 161.699ZM247.59 203.639L245.66 208.251L250.272 210.182L252.203 205.569ZM243.811 202.057L239.198 200.126L237.268 204.739L241.88 206.669ZM249.23 162.214L248.601 157.253L243.641 157.882L244.269 162.842ZM172 90.0557V85.0557H167V90.0557H172ZM208.528 98.6474L206.299 103.123L206.299 103.123L208.528 98.6474ZM237.396 122.621L240.409 126.611L244.399 123.598L241.386 119.608ZM234.126 125.09L230.136 128.103L233.149 132.093L237.139 129.08ZM206.701 102.315L204.473 106.791L204.473 106.791L206.701 102.315ZM172 94.1529H167V99.1529H172V94.1529ZM244.195 133.235L248.601 130.87L246.235 126.465L241.83 128.83ZM250.83 149.623L252.195 154.433L257.005 153.067L255.64 148.257ZM246.888 150.742L242.078 152.107L243.444 156.917L248.254 155.552ZM240.586 135.174L238.22 130.768L233.815 133.134L236.181 137.539ZM234.238 225.304L238.036 228.556L241.288 224.759L237.491 221.506ZM195.159 250.604L196.572 255.4L196.572 255.4L195.159 250.604ZM148.606 250.534L143.814 249.107L142.386 253.899L147.178 255.326ZM149.775 246.607L151.203 241.816L146.411 240.388L144.983 245.18ZM194.001 246.674L195.415 251.47L195.415 251.47L194.001 246.674ZM231.126 222.639L234.379 218.841L230.581 215.589L227.329 219.386ZM98.6752 125.28C88.5757 141.13 83.8844 159.826 85.304 178.567L95.2754 177.812ZM90.6674 183.175L94.7529 182.866L93.9976 172.895L89.912 173.204L90.6674 183.175ZM99.3609 177.503C98.1715 161.8 102.102 146.135 110.564 132.855ZM109.034 125.951L105.579 123.75L100.205 132.183L103.661 134.385L109.034 125.951ZM88.5405 196.369C93.8083 214.41 104.78 230.259 119.813 241.54L125.815 233.542C112.512 223.558 102.802 209.532 98.1397 193.566L88.5405 196.369ZM126.813 240.542L129.272 237.265L121.274 231.263L118.815 234.54L126.813 240.542ZM128.274 230.265C115.679 220.813 106.486 207.534 102.073 192.418L92.4735 195.221C97.493 212.412 107.948 227.513 122.272 238.263L128.274 230.265ZM95.8717 189.02L91.9387 190.168L94.7415 199.767L98.6745 198.619L95.8717 189.02ZM151.53 87.4998C138.398 90.681 126.188 96.8793 115.869 105.603L122.325 113.239C131.457 105.519 142.262 100.034 153.884 97.2187L151.53 87.4998ZM115.278 112.649L117.924 115.778L125.56 109.322L122.915 106.193L115.278 112.649ZM124.97 116.368C133.616 109.059 143.846 103.866 154.849 101.201L152.495 91.4818C139.981 94.5132 128.347 100.419 118.514 108.732L124.97 116.368ZM158.531 95.1641L157.567 91.182L147.848 93.5364L148.812 97.5185L158.531 95.1641ZM248.334 162.327C250.028 175.697 248.181 189.277 242.978 201.708L252.203 205.569C258.082 191.522 260.169 176.177 258.255 161.07L248.334 162.327ZM249.521 199.027L245.741 197.445L241.88 206.669L245.66 208.251L249.521 199.027ZM248.423 203.987C254.025 190.602 256.014 175.98 254.19 161.585L244.269 162.842C245.873 175.5 244.125 188.357 239.198 200.126L248.423 203.987ZM249.858 167.174L253.923 166.659L252.666 156.738L248.601 157.253L249.858 167.174ZM172 95.0557C183.903 95.0557 195.644 97.8172 206.299 103.123L210.757 94.1717C198.717 88.1761 185.45 85.0557 172 85.0557V95.0557ZM206.299 103.123C216.954 108.429 226.233 116.135 233.406 125.634L241.386 119.608C233.281 108.874 222.796 100.167 210.757 94.1717L206.299 103.123ZM234.383 118.631L231.113 121.1L237.139 129.08L240.409 126.611ZM238.116 122.077C230.393 111.849 220.403 103.552 208.93 97.8393L204.473 106.791C214.56 111.814 223.345 119.11 230.136 128.103L238.116 122.077ZM208.93 97.8393C197.458 92.1263 184.816 89.1529 172 89.1529V99.1529C183.269 99.1529 194.385 101.767 204.473 106.791L208.93 97.8393ZM177 94.1529V90.0557H167V94.1529H177ZM239.79 135.601C242.416 140.49 244.504 145.649 246.02 150.988L255.64 148.257C253.927 142.225 251.567 136.395 248.601 130.87L239.79 135.601ZM249.464 144.813L245.523 145.932L248.254 155.552L252.195 154.433L249.464 144.813ZM251.698 149.376C250.067 143.628 247.818 138.073 244.991 132.808L236.181 137.539C238.666 142.168 240.644 147.052 242.078 152.107L251.698 149.376ZM242.951 139.579L246.561 137.64L241.83 128.83L238.22 130.768ZM230.441 222.051C220.763 233.351 208.017 241.603 193.746 245.808L196.572 255.4ZM193.746 245.808C179.475 250.012 164.291 249.99 150.033 245.742L147.178 255.326C163.289 260.125 180.447 260.151 196.572 255.4L193.746 245.808ZM153.397 251.962L154.567 248.035L144.983 245.18L143.814 249.107L153.397 251.962ZM148.348 251.399C163.7 255.973 180.049 255.997 195.415 251.47L192.588 241.877C179.077 245.858 164.702 245.837 151.203 241.816L148.348 251.399ZM195.415 251.47C210.78 246.942 224.504 238.058 234.924 225.891L227.329 219.386ZM227.874 226.436L230.986 229.101L237.491 221.506L234.379 218.841L227.874 226.436ZM230.441 222.051C220.763 233.351 208.017 241.603 193.746 245.808L196.572 255.4L230.441 222.051ZM98.6752 125.28C88.5757 141.13 83.8844 159.826 85.304 178.567L95.2754 177.812C94.0191 161.227 98.1709 144.681 107.109 130.653L98.6752 125.28ZM90.6674 183.175L94.7529 182.866L93.9976 172.895L89.912 173.204L90.6674 183.175ZM99.3609 177.503C98.1715 161.8 102.102 146.135 110.564 132.855L102.131 127.481C92.5071 142.585 88.0368 160.4 89.3895 178.258L99.3609 177.503ZM109.034 125.951L105.579 123.75L100.205 132.183L103.661 134.385L109.034 125.951ZM88.5405 196.369C93.8083 214.41 104.78 230.259 119.813 241.54L125.815 233.542C112.512 223.558 102.802 209.532 98.1397 193.566L88.5405 196.369ZM126.813 240.542L129.272 237.265L121.274 231.263L118.815 234.54L126.813 240.542ZM128.274 230.265C115.679 220.813 106.486 207.534 102.073 192.418L92.4735 195.221C97.493 212.412 107.948 227.513 122.272 238.263L128.274 230.265ZM95.8717 189.02L91.9387 190.168L94.7415 199.767L98.6745 198.619L95.8717 189.02ZM151.53 87.4998C138.398 90.681 126.188 96.8793 115.869 105.603L122.325 113.239C131.457 105.519 142.262 100.034 153.884 97.2187L151.53 87.4998ZM115.278 112.649L117.924 115.778L125.56 109.322L122.915 106.193L115.278 112.649ZM124.97 116.368C133.616 109.059 143.846 103.866 154.849 101.201L152.495 91.4818C139.981 94.5132 128.347 100.419 118.514 108.732L124.97 116.368ZM158.531 95.1641L157.567 91.182L147.848 93.5364L148.812 97.5185L158.531 95.1641ZM248.334 162.327C250.028 175.697 248.181 189.277 242.978 201.708L252.203 205.569C258.082 191.522 260.169 176.177 258.255 161.07L248.334 162.327ZM249.521 199.027L245.741 197.445L241.88 206.669L245.66 208.251L249.521 199.027ZM248.423 203.987C254.025 190.602 256.014 175.98 254.19 161.585L244.269 162.842C245.873 175.5 244.125 188.357 239.198 200.126L248.423 203.987ZM249.858 167.174L253.923 166.659L252.666 156.738L248.601 157.253L249.858 167.174ZM172 95.0557C183.903 95.0557 195.644 97.8172 206.299 103.123L210.757 94.1717C198.717 88.1761 185.45 85.0557 172 85.0557V95.0557ZM206.299 103.123C216.954 108.429 226.233 116.135 233.406 125.634L241.386 119.608C233.281 108.874 222.796 100.167 210.757 94.1717L206.299 103.123ZM234.383 118.631L231.113 121.1L237.139 129.08L240.409 126.611ZM238.116 122.077C230.393 111.849 220.403 103.552 208.93 97.8393L204.473 106.791C214.56 111.814 223.345 119.11 230.136 128.103L238.116 122.077ZM208.93 97.8393C197.458 92.1263 184.816 89.1529 172 89.1529V99.1529C183.269 99.1529 194.385 101.767 204.473 106.791L208.93 97.8393ZM177 94.1529V90.0557H167V94.1529H177ZM239.79 135.601C242.416 140.49 244.504 145.649 246.02 150.988L255.64 148.257C253.927 142.225 251.567 136.395 248.601 130.87L239.79 135.601ZM249.464 144.813L245.523 145.932L248.254 155.552L252.195 154.433L249.464 144.813ZM251.698 149.376C250.067 143.628 247.818 138.073 244.991 132.808L236.181 137.539C238.666 142.168 240.644 147.052 242.078 152.107L251.698 149.376ZM242.951 139.579L246.561 137.64L241.83 128.83L238.22 130.768ZM230.441 222.051C220.763 233.351 208.017 241.603 193.746 245.808L196.572 255.4ZM193.746 245.808C179.475 250.012 164.291 249.99 150.033 245.742L147.178 255.326C163.289 260.125 180.447 260.151 196.572 255.4L193.746 245.808ZM153.397 251.962L154.567 248.035L144.983 245.18L143.814 249.107L153.397 251.962ZM148.348 251.399C163.7 255.973 180.049 255.997 195.415 251.47L192.588 241.877C179.077 245.858 164.702 245.837 151.203 241.816L148.348 251.399ZM195.415 251.47C210.78 246.942 224.504 238.058 234.924 225.891L227.329 219.386ZM227.874 226.436L230.986 229.101L237.491 221.506L234.379 218.841L227.874 226.436ZM230.441 222.051C220.763 233.351 208.017 241.603 193.746 245.808L196.572 255.4L230.441 222.051Z" />
          </g>
          <path stroke="#00FFFF" d="M240.944 172C240.944 187.951 235.414 203.408 225.295 215.738C215.176 228.068 201.095 236.508 185.45 239.62C169.806 242.732 153.567 240.323 139.5 232.804C125.433 225.285 114.408 213.12 108.304 198.384C102.2 183.648 101.394 167.25 106.024 151.987C110.654 136.723 120.434 123.537 133.696 114.675C146.959 105.813 162.884 101.824 178.758 103.388C194.632 104.951 209.472 111.97 220.751 123.249" id="out3" />
        </svg>

        {/* HUD Ring Layer 4 (Inner Ring inner1) */}
        <svg style={{ '--i': 1, '--j': 3 }}>
          <g id="inner1">
            <path fill="#00FFFF" d="M145.949 124.51L148.554 129.259C156.575 124.859 165.672 122.804 174.806 123.331C183.94 123.858 192.741 126.944 200.203 132.236C207.665 137.529 213.488 144.815 217.004 153.261C220.521 161.707 221.59 170.972 220.09 179.997L224.108 180.665L224.102 180.699L229.537 181.607C230.521 175.715 230.594 169.708 229.753 163.795L225.628 164.381C224.987 159.867 223.775 155.429 222.005 151.179C218.097 141.795 211.628 133.699 203.337 127.818C195.045 121.937 185.266 118.508 175.118 117.923C165.302 117.357 155.525 119.474 146.83 124.037C146.535 124.192 146.241 124.349 145.949 124.51ZM224.638 164.522C224.009 160.091 222.819 155.735 221.082 151.563C217.246 142.352 210.897 134.406 202.758 128.634C194.62 122.862 185.021 119.496 175.06 118.922C165.432 118.367 155.841 120.441 147.311 124.914L148.954 127.91C156.922 123.745 165.876 121.814 174.864 122.333C184.185 122.87 193.166 126.019 200.782 131.421C208.397 136.822 214.339 144.257 217.928 152.877C221.388 161.188 222.526 170.276 221.23 179.173L224.262 179.677C224.998 174.671 225.35 169.535 224.638 164.522ZM139.91 220.713C134.922 217.428 130.469 213.395 126.705 208.758L130.983 205.286L130.985 205.288L134.148 202.721C141.342 211.584 151.417 217.642 162.619 219.839C173.821 222.036 185.438 220.232 195.446 214.742L198.051 219.491C197.759 219.651 197.465 219.809 197.17 219.963C186.252 225.693 173.696 227.531 161.577 225.154C154.613 223.789 148.041 221.08 142.202 217.234L139.91 220.713ZM142.752 216.399C148.483 220.174 154.934 222.833 161.769 224.173C173.658 226.504 185.977 224.704 196.689 219.087L195.046 216.09C185.035 221.323 173.531 222.998 162.427 220.82C151.323 218.643 141.303 212.747 134.01 204.122L131.182 206.5C134.451 210.376 138.515 213.607 142.752 216.399Z" fillRule="evenodd" clipRule="evenodd" />
          </g>
        </svg>

        {/* HUD Ring Layer 5 (HUD center details + Plasma Filaments) */}
        <svg style={{ '--i': 2, '--j': 4 }}>
          {/* Micro engineering notches & alignment details */}
          <g id="sensor-micro-details" style={{ transformOrigin: 'center' }}>
            <circle cx="172" cy="172" r="38" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="0.5" strokeDasharray="1 3" />
            <circle cx="172" cy="172" r="44" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="0.5" strokeDasharray="6 2" />
            <path d="M142 142 L145 145 M202 142 L199 145 M142 202 L145 199 M202 202 L199 199" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="0.5" />
          </g>

          {/* Volumetric Plasma Filaments */}
          <g id="plasma-filaments">
            <path d="M152 172 A 20 20 0 0 1 192 172" stroke="#FFFFFF" strokeWidth="0.5" fill="none" transform="rotate(15 172 172)" />
            <path d="M172 152 A 20 20 0 0 1 172 192" stroke="#00FFFF" strokeWidth="0.5" fill="none" transform="rotate(135 172 172)" />
            <path d="M158 158 A 20 20 0 0 1 186 186" stroke="#7C3AED" strokeWidth="0.5" fill="none" transform="rotate(255 172 172)" />
          </g>

          <path fill="#00FFFF" d="M180.956 186.056C183.849 184.212 186.103 181.521 187.41 178.349C188.717 175.177 189.013 171.679 188.258 168.332C187.503 164.986 185.734 161.954 183.192 159.65C180.649 157.346 177.458 155.883 174.054 155.46C170.649 155.038 167.197 155.676 164.169 157.288C164.169 157.288 164.169 157.288 164.169 157.288ZM172 166.445C175.068 166.445 177.556 168.932 177.556 172C177.556 175.068 175.068 177.556 172 177.556C168.932 177.556 166.444 175.068 166.444 172C166.444 168.932 168.932 166.445 172 166.445Z" id="center" />
        </svg>
      </div>
    </div>
  );
};

export default AIKAVCore;
