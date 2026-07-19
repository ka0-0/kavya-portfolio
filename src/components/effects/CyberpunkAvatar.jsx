import React, { useEffect, useRef } from 'react';

export default function CyberpunkAvatar({
  className = '',
  style = {},
  maskFadeBottom = true,
  revealRadius = 80
}) {
  const containerRef = useRef(null);
  const revealImgRef = useRef(null);

  const stateRef = useRef({
    targetX: -500,
    targetY: -500,
    currX: -500,
    currY: -500,
    currR: 0,
    isHovered: false,
    rafId: null,
    lastTime: null
  });

  useEffect(() => {
    const state = stateRef.current;

    const updateFrame = (time) => {
      if (!state.lastTime) state.lastTime = time;
      const dt = Math.min((time - state.lastTime) / 1000, 0.1);
      state.lastTime = time;

      // Smooth cursor lerp tracking (flashlight lags slightly for premium feel)
      const lerpSpeed = 15;
      state.currX += (state.targetX - state.currX) * (1 - Math.exp(-lerpSpeed * dt));
      state.currY += (state.targetY - state.currY) * (1 - Math.exp(-lerpSpeed * dt));

      // Ease radius: target radius when hovered, 0 when not hovered
      const targetR = state.isHovered ? revealRadius : 0;
      const fadeSpeed = state.isHovered ? 1 / 0.180 : 1 / 0.220;
      state.currR += (targetR - state.currR) * (1 - Math.exp(-fadeSpeed * dt));

      // Direct DOM updates for 60 FPS performance without React re-renders
      if (revealImgRef.current) {
        const r = Math.max(0, state.currR);
        const innerR = Math.max(0, r - 24); // 24px soft feathered edge
        const x = state.currX.toFixed(1);
        const y = state.currY.toFixed(1);

        if (r < 0.1) {
          revealImgRef.current.style.opacity = '0';
          revealImgRef.current.style.webkitMaskImage = 'none';
          revealImgRef.current.style.maskImage = 'none';
        } else {
          revealImgRef.current.style.opacity = '1';
          const maskStr = `radial-gradient(circle ${r.toFixed(1)}px at ${x}px ${y}px, black 0px, black ${innerR.toFixed(1)}px, transparent ${r.toFixed(1)}px)`;
          revealImgRef.current.style.webkitMaskImage = maskStr;
          revealImgRef.current.style.maskImage = maskStr;
        }
      }

      // Continue animation loop if active or expanding/shrinking
      if (state.isHovered || state.currR > 0.1) {
        state.rafId = requestAnimationFrame(updateFrame);
      } else {
        state.currR = 0;
        if (revealImgRef.current) {
          revealImgRef.current.style.opacity = '0';
        }
        state.rafId = null;
      }
    };

    const startLoop = () => {
      if (!state.rafId) {
        state.lastTime = performance.now();
        state.rafId = requestAnimationFrame(updateFrame);
      }
    };

    const handleMouseEnter = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      state.targetX = x;
      state.targetY = y;
      if (!state.isHovered && state.currR < 1) {
        state.currX = x;
        state.currY = y;
      }
      state.isHovered = true;
      startLoop();
    };

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      state.targetX = e.clientX - rect.left;
      state.targetY = e.clientY - rect.top;
      startLoop();
    };

    const handleMouseLeave = () => {
      state.isHovered = false;
      startLoop();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (state.rafId) cancelAnimationFrame(state.rafId);
    };
  }, [revealRadius]);

  const maskStyle = maskFadeBottom
    ? {
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 72%, rgba(0, 0, 0, 0) 97%)',
        maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 72%, rgba(0, 0, 0, 0) 97%)'
      }
    : {};

  return (
    <div
      ref={containerRef}
      className={`relative cursor-crosshair overflow-hidden pointer-events-auto ${className}`}
      style={{
        ...maskStyle,
        ...style
      }}
    >
      {/* Base Avatar Layer (White) - ALWAYS VISIBLE FOUNDATION */}
      <img
        src="/KAVYA.png"
        alt="Kavya Cyberpunk Avatar Base"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        style={{
          filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.22)) drop-shadow(0 0 28px rgba(34, 211, 238, 0.12))'
        }}
      />

      {/* Reveal Avatar Layer (Blue/Purple) - PERFECTLY ALIGNED STACKED LAYER */}
      <img
        ref={revealImgRef}
        src="/KAVYA2.png"
        alt="Kavya Cyberpunk Avatar Reveal Layer"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none opacity-0"
        style={{
          filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.22)) drop-shadow(0 0 28px rgba(34, 211, 238, 0.12))',
          transform: 'translateY(1.5%)'
        }}
      />
    </div>
  );
}
