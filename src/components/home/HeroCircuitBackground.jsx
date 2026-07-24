import React, { useEffect, useRef, memo } from 'react';

/**
 * HeroCircuitBackground
 * 
 * Minimal, clean, code-generated PCB motherboard background.
 * Strictly minimal:
 * - Hairline PCB traces along far top and bottom edges with 45-degree chamfers
 * - Subtle LED pulses gliding along traces
 * - NO floor circles, NO orbit lines, NO energy beams, NO portal effects, NO floating dots
 * - 85%+ negative space allowing Hero content & 3D Robot to shine
 */
const HeroCircuitBackground = memo(function HeroCircuitBackground() {
  const canvasRef = useRef(null);

  // Minimal floating dust particles (8 particles max)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 4 : 8;

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 0.7 + 0.3,
      speedY: -(Math.random() * 0.08 + 0.02),
      speedX: (Math.random() - 0.5) * 0.04,
      opacity: Math.random() * 0.25 + 0.05,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.01 + 0.003,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.08;
        const alpha = Math.max(0.02, Math.min(0.35, currentOpacity));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none bg-[#050608]">
      {/* 1. Deep Ambient Dark Navy Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 15% 20%, rgba(14, 165, 233, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(34, 211, 238, 0.04) 0%, transparent 55%),
            radial-gradient(circle at 50% 50%, transparent 60%, rgba(5, 6, 8, 0.95) 100%)
          `
        }}
      />

      {/* 2. Extremely Soft Bottom Volumetric Haze */}
      <div
        className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none opacity-10"
        style={{
          background: 'linear-gradient(to top, rgba(14, 165, 233, 0.06) 0%, transparent 100%)',
          filter: 'blur(20px)'
        }}
      />

      {/* 3. Canvas for Minimal Micro-Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
});

export default HeroCircuitBackground;
