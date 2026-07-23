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
      {/* Inline Keyframes for Gentle LED Pulses */}
      <style>{`
        @keyframes ledFlowTopLeft1 {
          0% { stroke-dashoffset: 1200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ledFlowTopRight1 {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 1300; }
        }
        @keyframes ledFlowBottomLeft {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ledFlowBottomRight {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 1100; }
        }
      `}</style>

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

      {/* 2. Primary SVG Circuit Layer */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ============================================================ */}
        {/* HAIRLINE PCB TRACES (Strict Minimal Geometry)               */}
        {/* ============================================================ */}
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Top Left Traces */}
          <path d="M 0 95 H 390 L 450 145 H 710 L 760 195 H 920" stroke="#0EA5E9" strokeWidth="0.8" opacity="0.25" />
          <path d="M 0 170 H 270 L 330 230 H 540" stroke="#22D3EE" strokeWidth="0.7" opacity="0.2" />

          {/* Top Right Traces */}
          <path d="M 1920 90 H 1540 L 1480 150 H 1260 L 1210 100 H 1060" stroke="#0EA5E9" strokeWidth="0.8" opacity="0.25" />
          <path d="M 1920 200 H 1700 L 1640 260 H 1440" stroke="#22D3EE" strokeWidth="0.7" opacity="0.2" />

          {/* Lower Left Traces */}
          <path d="M 0 640 H 240 L 300 700 H 460 L 510 750 H 640" stroke="#0EA5E9" strokeWidth="0.7" opacity="0.2" />
          <path d="M 0 810 H 190 L 240 860 H 410" stroke="#22D3EE" strokeWidth="0.7" opacity="0.2" />

          {/* Lower Right Traces (Faint & Out of Robot Center) */}
          <path d="M 1920 620 H 1720 L 1660 680 H 1500" stroke="#0EA5E9" strokeWidth="0.7" opacity="0.16" />
          <path d="M 1920 780 H 1640 L 1580 840 H 1420" stroke="#22D3EE" strokeWidth="0.7" opacity="0.16" />

          {/* PCB Hatch Pad Accents (///////) */}
          <g stroke="#22D3EE" strokeWidth="0.9" opacity="0.3">
            <line x1="140" y1="89" x2="146" y2="101" />
            <line x1="151" y1="89" x2="157" y2="101" />
            <line x1="162" y1="89" x2="168" y2="101" />
            <line x1="173" y1="89" x2="179" y2="101" />
          </g>

          <g stroke="#22D3EE" strokeWidth="0.9" opacity="0.3">
            <line x1="1740" y1="84" x2="1746" y2="96" />
            <line x1="1751" y1="84" x2="1757" y2="96" />
            <line x1="1762" y1="84" x2="1768" y2="96" />
            <line x1="1773" y1="84" x2="1779" y2="96" />
          </g>

          {/* Bottom Left Tech Label */}
          <g fill="#22D3EE" opacity="0.3" fontSize="9" fontFamily="monospace">
            <path d="M 40 965 h 8 M 44 961 v 8" stroke="#22D3EE" strokeWidth="0.7" />
            <text x="56" y="968" letterSpacing="1.5">SYS_OS // 0x4F</text>
          </g>
        </g>

        {/* ============================================================ */}
        {/* SUBTLE CONTINUOUS LED DATA FLOWS                             */}
        {/* ============================================================ */}
        <g fill="none" strokeLinecap="round" opacity="0.65">
          <path
            d="M 0 95 H 390 L 450 145 H 710 L 760 195 H 920"
            stroke="#22D3EE"
            strokeWidth="1.4"
            strokeDasharray="16 400"
            style={{ animation: 'ledFlowTopLeft1 8s infinite linear' }}
          />

          <path
            d="M 1920 90 H 1540 L 1480 150 H 1260 L 1210 100 H 1060"
            stroke="#22D3EE"
            strokeWidth="1.4"
            strokeDasharray="18 450"
            style={{ animation: 'ledFlowTopRight1 9.5s infinite linear' }}
          />

          <path
            d="M 0 640 H 240 L 300 700 H 460 L 510 750 H 640"
            stroke="#38BDF8"
            strokeWidth="1.3"
            strokeDasharray="15 380"
            style={{ animation: 'ledFlowBottomLeft 11s infinite linear' }}
          />

          <path
            d="M 1920 780 H 1640 L 1580 840 H 1420"
            stroke="#38BDF8"
            strokeWidth="1.3"
            strokeDasharray="16 400"
            style={{ animation: 'ledFlowBottomRight 12.5s infinite linear' }}
          />
        </g>
      </svg>

      {/* 3. Extremely Soft Bottom Volumetric Haze */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none opacity-10"
        style={{
          background: 'linear-gradient(to top, rgba(14, 165, 233, 0.06) 0%, transparent 100%)',
          filter: 'blur(20px)'
        }}
      />

      {/* 4. Canvas for Minimal Micro-Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
});

export default HeroCircuitBackground;
