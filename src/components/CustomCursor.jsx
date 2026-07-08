import React, { useEffect, useRef, memo } from 'react';

const checkIsDesktop = () => {
  if (typeof window === 'undefined') return false;
  const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  return !hasTouch && supportsHover;
};

const CustomCursor = memo(function CustomCursor() {
  const glowRef = useRef(null);
  const dotRef = useRef(null);
  const isDesktopRef = useRef(checkIsDesktop());

  useEffect(() => {
    if (!isDesktopRef.current) return;

    // Positioning coordinates
    let mouseX = -100;
    let mouseY = -100;
    let glowX = -100;
    let glowY = -100;
    let dotX = -100;
    let dotY = -100;

    // Hover states and RAF controls
    let isHovered = false;
    let rafActive = false;
    let rafId = null;
    let lastMouseMoveTime = performance.now();

    // Size and Scale interpolation values (Slightly increased by ~20% for visibility)
    let targetGlowSize = 96;
    let currentGlowSize = 96;

    let targetDotSize = 10;
    let currentDotSize = 10;

    let targetScale = 1;
    let currentScale = 1;

    const render = () => {
      const now = performance.now();
      const timeSinceLastMove = now - lastMouseMoveTime;

      // Set targets depending on hover status
      targetGlowSize = isHovered ? 144 : 96;
      targetDotSize = isHovered ? 28 : 10;
      targetScale = isHovered ? 1.2 : 1;

      // 1. Adaptive Smoothing: If the physical mouse has stopped moving for > 24ms,
      // snap immediately to targets to prevent drifting, overshooting, or micro-movements.
      if (timeSinceLastMove > 24) {
        glowX = mouseX;
        glowY = mouseY;
        dotX = mouseX;
        dotY = mouseY;
        currentGlowSize = targetGlowSize;
        currentDotSize = targetDotSize;
        currentScale = targetScale;
      } else {
        // Smoothly interpolate coordinates and dimensions while moving
        glowX += (mouseX - glowX) * 0.15;
        glowY += (mouseY - glowY) * 0.15;

        dotX += (mouseX - dotX) * 0.40;
        dotY += (mouseY - dotY) * 0.40;

        currentGlowSize += (targetGlowSize - currentGlowSize) * 0.15;
        currentDotSize += (targetDotSize - currentDotSize) * 0.20;
        currentScale += (targetScale - currentScale) * 0.15;
      }

      const glowOffset = currentGlowSize / 2;
      const dotOffset = currentDotSize / 2;

      // 2. Update DOM using translate3d and GPU-accelerated properties
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowX - glowOffset}px, ${glowY - glowOffset}px, 0) scale(${currentScale})`;
      }

      if (dotRef.current) {
        dotRef.current.style.width = `${currentDotSize}px`;
        dotRef.current.style.height = `${currentDotSize}px`;
        dotRef.current.style.transform = `translate3d(${dotX - dotOffset}px, ${dotY - dotOffset}px, 0)`;
      }

      // 3. Evaluate if the animation has fully settled to stop calculation overhead
      const glowDist = Math.hypot(mouseX - glowX, mouseY - glowY);
      const dotDist = Math.hypot(mouseX - dotX, mouseY - dotY);
      const glowSizeDist = Math.abs(targetGlowSize - currentGlowSize);
      const dotSizeDist = Math.abs(targetDotSize - currentDotSize);

      if (glowDist < 0.08 && dotDist < 0.08 && glowSizeDist < 0.08 && dotSizeDist < 0.08) {
        // Snap directly to target coordinates to sleep cleanly
        glowX = mouseX;
        glowY = mouseY;
        dotX = mouseX;
        dotY = mouseY;
        currentGlowSize = targetGlowSize;
        currentDotSize = targetDotSize;
        currentScale = targetScale;

        const finalGlowOffset = currentGlowSize / 2;
        const finalDotOffset = currentDotSize / 2;

        if (glowRef.current) {
          glowRef.current.style.transform = `translate3d(${glowX - finalGlowOffset}px, ${glowY - finalGlowOffset}px, 0) scale(${currentScale})`;
        }
        if (dotRef.current) {
          dotRef.current.style.width = `${currentDotSize}px`;
          dotRef.current.style.height = `${currentDotSize}px`;
          dotRef.current.style.transform = `translate3d(${dotX - finalDotOffset}px, ${dotY - finalDotOffset}px, 0)`;
        }

        rafActive = false;
        return; // Auto-sleep
      }

      rafId = requestAnimationFrame(render);
    };

    // Global event handlers using event delegation to completely bypass mousemove DOM traversal overhead
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      lastMouseMoveTime = performance.now();

      if (!rafActive) {
        rafActive = true;
        render();
      }
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      // Event delegation handles state changes only when crossing boundaries
      const interactive = target.closest('button, a, input, [data-interactive="true"]');
      isHovered = !!interactive;

      if (!rafActive) {
        rafActive = true;
        render();
      }
    };

    const handleMouseLeaveDoc = () => {
      isHovered = false;
      mouseX = -100;
      mouseY = -100;

      if (!rafActive) {
        rafActive = true;
        render();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveDoc, { passive: true });

    // Initial positioning kickstart
    rafActive = true;
    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveDoc);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isDesktopRef.current) return null;

  return (
    <>
      {/* Blurred Ambient Radial Glow Ring - Direct RAF Transform */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 z-[999998] hidden md:block rounded-full bg-gradient-to-r from-blue-500/25 via-cyan-400/20 to-blue-600/15 blur-xl w-[96px] h-[96px] will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />

      {/* Solid Small Pointer Dot - Direct RAF Transform */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[999999] hidden md:block rounded-full bg-white mix-blend-difference will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)', width: '10px', height: '10px' }}
      />
    </>
  );
});

export default CustomCursor;
