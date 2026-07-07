import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const glowRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;
    let glowX = -100;
    let glowY = -100;
    let dotX = -100;
    let dotY = -100;

    let isHovered = false;
    let lastHovered = null;
    let rafActive = false;
    let rafId = null;

    let currentOffset = 40;
    let currentDotOffset = 4;
    let currentScale = 1;

    const render = () => {
      // Smooth lerp (0.15 for ambient glow, 0.4 for pointer dot)
      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;

      dotX += (mouseX - dotX) * 0.4;
      dotY += (mouseY - dotY) * 0.4;

      // Lazy DOM layout writes (only apply width/height styles on hover state changes)
      if (isHovered !== lastHovered) {
        lastHovered = isHovered;
        const size = isHovered ? 120 : 80;
        const offset = size / 2;
        const dotSize = isHovered ? 24 : 8;
        const dotOffset = dotSize / 2;

        if (dotRef.current) {
          dotRef.current.style.width = `${dotSize}px`;
          dotRef.current.style.height = `${dotSize}px`;
        }
        currentOffset = offset;
        currentDotOffset = dotOffset;
        currentScale = isHovered ? 1.2 : 1;
      }

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowX - currentOffset}px, ${glowY - currentOffset}px, 0) scale(${currentScale})`;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX - currentDotOffset}px, ${dotY - currentDotOffset}px, 0)`;
      }

      // Check if coordinates have settled near the target
      const glowDist = Math.hypot(mouseX - glowX, mouseY - glowY);
      const dotDist = Math.hypot(mouseX - dotX, mouseY - dotY);

      if (glowDist < 0.15 && dotDist < 0.15) {
        // Snap coordinates to target to stop micro-calculations
        glowX = mouseX;
        glowY = mouseY;
        dotX = mouseX;
        dotY = mouseY;

        if (glowRef.current) {
          glowRef.current.style.transform = `translate3d(${glowX - currentOffset}px, ${glowY - currentOffset}px, 0) scale(${currentScale})`;
        }
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${dotX - currentDotOffset}px, ${dotY - currentDotOffset}px, 0)`;
        }

        rafActive = false;
        return; // Pause the animation loop (Auto-sleep)
      }

      rafId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target;
      isHovered = target ? !!target.closest('button, a, input, [data-interactive="true"]') : false;

      if (!rafActive) {
        rafActive = true;
        render();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Trigger initial frame
    rafActive = true;
    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Blurred Ambient Radial Glow Ring - Direct RAF Transform */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 z-[9990] hidden md:block rounded-full bg-gradient-to-r from-blue-500/25 via-cyan-400/20 to-blue-600/15 blur-xl w-[80px] h-[80px] will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />

      {/* Solid Small Pointer Dot - Direct RAF Transform */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9991] hidden md:block rounded-full bg-white mix-blend-difference will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)', width: '8px', height: '8px' }}
      />
    </>
  );
}
