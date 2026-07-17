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
  const textRef = useRef(null);
  const isDesktopRef = useRef(checkIsDesktop());

  useEffect(() => {
    if (!isDesktopRef.current) return;

    let mouseX = -100;
    let mouseY = -100;
    let glowX = -100;
    let glowY = -100;
    let dotX = -100;
    let dotY = -100;
    let snapTarget = null;
    let snapX = 0;
    let snapY = 0;
    let snapSize = 60;

    let rafActive = false;
    let rafId = null;
    let lastMouseMoveTime = performance.now();

    // Deterministic state machine source of truth
    let cursorMode = 'default'; // 'default' | 'hover' | 'view' | 'snap'
    let leaveTimeout = null;
    let justEnteredView = false;

    const applyCursorStyles = (mode) => {
      cursorMode = mode;

      if (dotRef.current) {
        const isView = mode === 'view';
        const isHover = mode === 'hover';
        const isSnap = mode === 'snap';

        if (isSnap) {
          dotRef.current.style.transition = `width 0.26s cubic-bezier(0.25, 1, 0.5, 1), height 0.26s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.26s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.26s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.26s cubic-bezier(0.25, 1, 0.5, 1)`;
          dotRef.current.style.width = `${snapSize}px`;
          dotRef.current.style.height = `${snapSize}px`;
          dotRef.current.style.backgroundColor = 'transparent';
          dotRef.current.style.borderColor = 'var(--accent-color)';
          dotRef.current.style.boxShadow = '0 0 16px rgba(var(--accent-rgb), 0.5)';
          dotRef.current.style.backdropFilter = 'none';
          dotRef.current.style.webkitBackdropFilter = 'none';
          dotRef.current.style.mixBlendMode = 'normal';
        } else {
          // Restore default transition configuration
          dotRef.current.style.transition = transitionFast;

          if (isView) {
            dotRef.current.style.width = '72px';
            dotRef.current.style.height = '72px';
            dotRef.current.style.backgroundColor = 'rgba(8, 51, 68, 0.88)';
            dotRef.current.style.borderColor = 'var(--accent-color)';
            dotRef.current.style.boxShadow = '0 0 32px rgba(var(--accent-rgb), 0.85)';
            dotRef.current.style.backdropFilter = 'blur(12px)';
            dotRef.current.style.webkitBackdropFilter = 'blur(12px)';
            dotRef.current.style.mixBlendMode = 'normal';
          } else if (isHover) {
            dotRef.current.style.width = '28px';
            dotRef.current.style.height = '28px';
            dotRef.current.style.backgroundColor = 'rgb(255, 255, 255)';
            dotRef.current.style.borderColor = 'transparent';
            dotRef.current.style.boxShadow = 'none';
            dotRef.current.style.backdropFilter = 'none';
            dotRef.current.style.webkitBackdropFilter = 'none';
            dotRef.current.style.mixBlendMode = 'difference';
          } else {
            dotRef.current.style.width = '10px';
            dotRef.current.style.height = '10px';
            dotRef.current.style.backgroundColor = 'rgb(255, 255, 255)';
            dotRef.current.style.borderColor = 'transparent';
            dotRef.current.style.boxShadow = 'none';
            dotRef.current.style.backdropFilter = 'none';
            dotRef.current.style.webkitBackdropFilter = 'none';
            dotRef.current.style.mixBlendMode = 'difference';
          }
        }
      }

      if (textRef.current) {
        textRef.current.style.opacity = mode === 'view' ? '1' : '0';
      }

      if (glowRef.current) {
        if (mode === 'snap') {
          glowRef.current.style.width = '120px';
          glowRef.current.style.height = '120px';
        } else if (mode === 'view') {
          glowRef.current.style.width = '160px';
          glowRef.current.style.height = '160px';
        } else if (mode === 'hover') {
          glowRef.current.style.width = '144px';
          glowRef.current.style.height = '144px';
        } else {
          glowRef.current.style.width = '96px';
          glowRef.current.style.height = '96px';
        }
      }
    };

    const handleViewEnter = () => {
      // Clear any pending transition back to default/hover
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        leaveTimeout = null;
      }
      
      // Set flag to bypass interpolation on the first animation frame
      justEnteredView = true;

      // Snap coordinates instantly to the raw mouse coordinates
      glowX = mouseX;
      glowY = mouseY;
      dotX = mouseX;
      dotY = mouseY;

      // Force immediate DOM transform updates
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }

      applyCursorStyles('view');

      if (!rafActive) {
        rafActive = true;
        render();
      }
    };

    const handleViewLeave = () => {
      if (leaveTimeout) clearTimeout(leaveTimeout);

      // Start the 0ms leave timeout to handle rapid transitions between cards
      leaveTimeout = setTimeout(() => {
        leaveTimeout = null;

        // Execute exactly one document.elementFromPoint lookup to find the fallback state
        const hoveredEl = document.elementFromPoint(mouseX, mouseY);
        const isInteractive = hoveredEl && hoveredEl.closest && hoveredEl.closest('button, a, input, [data-interactive="true"]');
        applyCursorStyles(isInteractive ? 'hover' : 'default');
      }, 0);
    };

    const render = () => {
      const now = performance.now();
      const timeSinceLastMove = now - lastMouseMoveTime;

      if (justEnteredView) {
        // Skip interpolation for the first frame after entering VIEW
        glowX = mouseX;
        glowY = mouseY;
        dotX = mouseX;
        dotY = mouseY;
        justEnteredView = false;
      } else if (timeSinceLastMove > 24 && cursorMode !== 'snap') {
        glowX = mouseX;
        glowY = mouseY;
        dotX = mouseX;
        dotY = mouseY;
      } else if (cursorMode === 'view') {
        // High-speed responsiveness inside certificate to avoid trailing cursor latency
        glowX += (mouseX - glowX) * 0.50;
        glowY += (mouseY - glowY) * 0.50;
        dotX += (mouseX - dotX) * 0.85;
        dotY += (mouseY - dotY) * 0.85;
      } else if (cursorMode === 'snap') {
        if (snapTarget) {
          const rect = snapTarget.getBoundingClientRect();
          const currentSize = rect.width;
          snapX = rect.left + rect.width / 2;
          snapY = rect.top + rect.height / 2;
          if (currentSize !== snapSize) {
            snapSize = currentSize;
            if (dotRef.current) {
              dotRef.current.style.width = `${snapSize}px`;
              dotRef.current.style.height = `${snapSize}px`;
            }
          }
        }
        glowX += (snapX - glowX) * 0.15;
        glowY += (snapY - glowY) * 0.15;
        dotX += (snapX - dotX) * 0.22;
        dotY += (snapY - dotY) * 0.22;
      } else {
        glowX += (mouseX - glowX) * 0.25;
        glowY += (mouseY - glowY) * 0.25;
        dotX += (mouseX - dotX) * 0.50;
        dotY += (mouseY - dotY) * 0.50;
      }

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }

      const targetX = cursorMode === 'snap' ? snapX : mouseX;
      const targetY = cursorMode === 'snap' ? snapY : mouseY;
      const glowDist = Math.hypot(targetX - glowX, targetY - glowY);
      const dotDist = Math.hypot(targetX - dotX, targetY - dotY);

      if (glowDist < 0.08 && dotDist < 0.08) {
        glowX = targetX;
        glowY = targetY;
        dotX = targetX;
        dotY = targetY;

        if (glowRef.current) {
          glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
        }
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
        }

        rafActive = false;
        return;
      }

      rafId = requestAnimationFrame(render);
    };

    // mousemove ONLY updates coordinates. No hover checks!
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      lastMouseMoveTime = performance.now();

      if (!rafActive) {
        rafActive = true;
        render();
      }
    };

    const handlePointerOver = (e) => {
      // Locking state: Ignore interactive hover calculations if in "view" or "snap" mode
      // or if we are inside a transition timeout (leaveTimeout is active)
      if (cursorMode === 'view' || cursorMode === 'snap' || leaveTimeout) return;

      const isInteractive = e.target && e.target.closest && e.target.closest('button, a, input, [data-interactive="true"]');
      applyCursorStyles(isInteractive ? 'hover' : 'default');
    };

    const handleMouseLeaveDoc = () => {
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        leaveTimeout = null;
      }
      applyCursorStyles('default');
      mouseX = -100;
      mouseY = -100;

      if (!rafActive) {
        rafActive = true;
        render();
      }
    };

    const handleSnapEnter = (e) => {
      snapTarget = e.detail?.target;
      if (snapTarget) {
        const rect = snapTarget.getBoundingClientRect();
        snapX = rect.left + rect.width / 2;
        snapY = rect.top + rect.height / 2;
        snapSize = rect.width;
      }
      applyCursorStyles('snap');
      if (!rafActive) {
        rafActive = true;
        render();
      }
    };

    const handleSnapLeave = () => {
      snapTarget = null;
      const hoveredEl = document.elementFromPoint(mouseX, mouseY);
      const isInteractive = hoveredEl && hoveredEl.closest && hoveredEl.closest('button, a, input, [data-interactive="true"]');
      applyCursorStyles(isInteractive ? 'hover' : 'default');
      if (!rafActive) {
        rafActive = true;
        render();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveDoc, { passive: true });

    window.addEventListener('view-cursor-enter', handleViewEnter);
    window.addEventListener('view-cursor-leave', handleViewLeave);

    window.addEventListener('cursor-snap-enter', handleSnapEnter);
    window.addEventListener('cursor-snap-leave', handleSnapLeave);

    rafActive = true;
    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('mouseleave', handleMouseLeaveDoc);

      window.removeEventListener('view-cursor-enter', handleViewEnter);
      window.removeEventListener('view-cursor-leave', handleViewLeave);

      window.removeEventListener('cursor-snap-enter', handleSnapEnter);
      window.removeEventListener('cursor-snap-leave', handleSnapLeave);

      if (leaveTimeout) clearTimeout(leaveTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isDesktopRef.current) return null;

  const cubicBezierEase = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const transitionFast = `width 0.14s ${cubicBezierEase}, height 0.14s ${cubicBezierEase}, background-color 0.14s ${cubicBezierEase}, border-color 0.14s ${cubicBezierEase}, box-shadow 0.14s ${cubicBezierEase}, backdrop-filter 0.14s ${cubicBezierEase}, -webkit-backdrop-filter 0.14s ${cubicBezierEase}`;

  return (
    <>
      {/* Blurred Ambient Radial Glow Ring - Persistent DOM */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 z-[999998] hidden md:block rounded-full bg-gradient-to-r from-blue-500/25 via-cyan-400/20 to-blue-600/15 blur-xl will-change-transform"
        style={{
          transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)',
          width: '96px',
          height: '96px',
          transition: `width 0.14s ${cubicBezierEase}, height 0.14s ${cubicBezierEase}`,
          transitionDelay: '0ms',
          animationDelay: '0ms',
          pointerEvents: 'none'
        }}
      />

      {/* Single Global Pointer Dot - Morphing into VIEW Capsule */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[999999] hidden md:flex items-center justify-center rounded-full will-change-transform border border-transparent select-none overflow-hidden"
        style={{
          transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)',
          width: '10px',
          height: '10px',
          backgroundColor: 'rgb(255, 255, 255)',
          mixBlendMode: 'difference',
          transition: transitionFast,
          transitionDelay: '0ms',
          animationDelay: '0ms',
          pointerEvents: 'none'
        }}
      >
        <span
          ref={textRef}
          className="font-mono text-[11px] font-black text-cyan-300 tracking-[0.25em] drop-shadow-[0_0_8px_var(--accent-color)] opacity-0 pointer-events-none select-none pl-0.5"
          style={{
            transition: `opacity 0.14s ${cubicBezierEase}`,
            transitionDelay: '0ms',
            animationDelay: '0ms',
            pointerEvents: 'none'
          }}
        >
          VIEW
        </span>
      </div>
    </>
  );
});

export default CustomCursor;
