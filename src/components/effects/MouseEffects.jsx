import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Helper: Dynamically play the sniper click effect directly in the DOM for peak 60fps performance
const triggerSniperEffect = (x, y) => {
  const container = document.getElementById("global-click-effects");
  if (!container) return;

  const effectSize = 80;
  const duration = 0.26; // Crisp animation speed (220-300ms range)

  // Fetch current active portfolio theme accent color from document styling variables
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#22d3ee';

  // Create absolute positioned container for this click instance
  const wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.left = `${x}px`;
  wrapper.style.top = `${y}px`;
  wrapper.style.width = '0px';
  wrapper.style.height = '0px';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.overflow = 'visible';
  container.appendChild(wrapper);

  // 1. Center expanding core circle (target ring)
  const ring = document.createElement('div');
  ring.style.position = 'absolute';
  ring.style.left = '-10px';
  ring.style.top = '-10px';
  ring.style.width = '20px';
  ring.style.height = '20px';
  ring.style.border = `1.5px solid ${accentColor}`;
  ring.style.borderRadius = '50%';
  ring.style.opacity = '0.86';
  ring.style.boxShadow = `0 0 8px ${accentColor}`;
  ring.style.pointerEvents = 'none';
  wrapper.appendChild(ring);

  gsap.to(ring, {
    scale: 2.2,
    opacity: 0,
    duration: duration,
    ease: "power2.out"
  });

  // 2. 4-directional sniper crosshair lines
  const crosshairAngles = [0, 90, 180, 270];
  crosshairAngles.forEach((deg) => {
    // Wrapper handles axis rotation so standard 'left' sliding translates outward correctly
    const lineWrapper = document.createElement('div');
    lineWrapper.style.position = 'absolute';
    lineWrapper.style.left = '0px';
    lineWrapper.style.top = '0px';
    lineWrapper.style.width = '0px';
    lineWrapper.style.height = '0px';
    lineWrapper.style.transform = `rotate(${deg}deg)`;
    lineWrapper.style.pointerEvents = 'none';
    wrapper.appendChild(lineWrapper);

    const line = document.createElement('div');
    line.style.position = 'absolute';
    line.style.backgroundColor = accentColor;
    line.style.width = '12px';
    line.style.height = '1.5px';
    line.style.left = '6px';
    line.style.top = '-0.75px';
    line.style.transformOrigin = 'left center';
    line.style.boxShadow = `0 0 4px ${accentColor}`;
    line.style.pointerEvents = 'none';
    lineWrapper.appendChild(line);

    gsap.to(line, {
      left: 28,     // Slide out along local rotated axis
      scaleX: 0,    // Shrink dash length
      opacity: 0,
      duration: duration,
      ease: "power2.out"
    });
  });

  // 3. 8-point radial particle burst
  const particleAngles = [
    Math.PI / 6, Math.PI / 3,
    (2 * Math.PI) / 3, (5 * Math.PI) / 6,
    (7 * Math.PI) / 6, (4 * Math.PI) / 3,
    (5 * Math.PI) / 3, (11 * Math.PI) / 6
  ];

  particleAngles.forEach((rad) => {
    const dot = document.createElement('div');
    dot.style.position = 'absolute';
    dot.style.backgroundColor = accentColor;
    dot.style.width = '3px';
    dot.style.height = '3px';
    dot.style.borderRadius = '50%';
    dot.style.left = '-1.5px';
    dot.style.top = '-1.5px';
    dot.style.boxShadow = `0 0 3px ${accentColor}`;
    dot.style.pointerEvents = 'none';
    wrapper.appendChild(dot);

    const flyDistance = effectSize * 0.35;
    gsap.timeline()
      .to(dot, {
        x: Math.cos(rad) * flyDistance,
        y: Math.sin(rad) * flyDistance,
        duration: duration,
        ease: "power2.out"
      }, 0)
      .to(dot, {
        scale: 0,
        opacity: 0,
        duration: duration * 0.5,
        ease: "linear"
      }, duration * 0.5);
  });

  // Clean DOM elements immediately upon animation completion
  gsap.delayedCall(duration + 0.05, () => {
    wrapper.remove();
  });
};

export default function MouseEffects() {
  const startPosRef = useRef(null);

  useEffect(() => {
    // Record drag start coordinate
    const handleStart = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      startPosRef.current = { x: clientX, y: clientY };
    };

    // Analyze click coordinates and process viewport exclusions
    const handleClick = (e) => {
      if (!startPosRef.current) return;

      const clientX = e.clientX;
      const clientY = e.clientY;

      const dx = clientX - startPosRef.current.x;
      const dy = clientY - startPosRef.current.y;
      const dragDistance = Math.sqrt(dx * dx + dy * dy);
      startPosRef.current = null;

      // 1. Exclude drag / scroll / swipe interactions (mouse drag or touch scroll threshold)
      if (dragDistance > 8) return;

      // 2. Exclude text selection clicks
      if (window.getSelection && window.getSelection().toString()) return;

      // 3. Exclude click targeting interactive panels
      const target = e.target;
      if (!target) return;
      if (target.closest('.theme-terminal-panel')) return;
      if (target.closest('.globe-container-wrapper') || target.closest('.globe-canvas')) return;

      // 4. Exclude scrollbar gutter clicks
      if (clientX >= document.documentElement.clientWidth || clientY >= document.documentElement.clientHeight) return;

      // Fire the premium sniper click pulse
      triggerSniperEffect(clientX, clientY);
    };

    document.addEventListener('mousedown', handleStart, { passive: true });
    document.addEventListener('touchstart', handleStart, { passive: true });
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('mousedown', handleStart);
      document.removeEventListener('touchstart', handleStart);
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);

  return (
    <div
      id="global-click-effects"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 999950,
        overflow: 'visible'
      }}
    />
  );
}
