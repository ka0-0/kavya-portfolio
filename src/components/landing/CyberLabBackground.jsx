import React, { useEffect, useRef } from 'react';

export default function CyberLabBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Create 70 floating particles & sparks
    const particleCount = 70;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.3,
      speedY: -(Math.random() * 0.35 + 0.1),
      speedX: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.6 + 0.1,
      pulse: Math.random() * Math.PI,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      isSpark: Math.random() > 0.85,
    }));

    // Server rack LED status lights simulation
    const ledCount = 28;
    const leds = Array.from({ length: ledCount }, () => ({
      x: Math.random() > 0.5 ? Math.random() * 180 + 20 : width - (Math.random() * 180 + 20),
      y: Math.random() * (height * 0.7) + height * 0.15,
      isPrimary: Math.random() > 0.15,
      state: Math.random() > 0.4,
      nextToggle: Math.random() * 120 + 20,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const computedStyle = getComputedStyle(document.documentElement);
      const accentRgb = computedStyle.getPropertyValue('--accent-rgb').trim() || '0, 255, 136';
      const accentColor = computedStyle.getPropertyValue('--accent-color').trim() || '#00FF88';
      const accentLight = computedStyle.getPropertyValue('--accent-light').trim() || '#76FF03';

      // Render lab server LED status lights (softly blurred in background)
      ctx.save();
      for (let i = 0; i < leds.length; i++) {
        const led = leds[i];
        led.nextToggle--;
        if (led.nextToggle <= 0) {
          led.state = !led.state;
          led.nextToggle = Math.random() * 150 + 30;
        }

        if (led.state) {
          const color = led.isPrimary ? accentColor : accentLight;
          ctx.beginPath();
          ctx.arc(led.x, led.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.globalAlpha = 0.65;
          ctx.fill();
        }
      }
      ctx.restore();

      // Render ambient dust particles & sparks
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

        const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.2;
        const alpha = Math.max(0.05, Math.min(0.85, currentOpacity));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(${accentRgb}, ${alpha})`;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = p.isSpark ? p.radius * 4 : p.radius * 2;

        ctx.fill();
      }
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Deep Cybernetic Base */}
      <div 
        className="absolute inset-0 bg-[var(--bg-dark,#090909)]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(var(--accent-rgb, 0, 255, 136), 0.06) 0%, transparent 70%),
            radial-gradient(circle at 15% 30%, rgba(var(--accent-rgb, 0, 255, 136), 0.15) 0%, transparent 50%),
            radial-gradient(circle at 85% 70%, rgba(var(--accent-rgb, 0, 255, 136), 0.15) 0%, transparent 50%)
          `
        }}
      />

      {/* 2. Blurred Laboratory Computer Racks & Infrastructure (Depth of Field) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-35 filter blur-[6px]" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="serverGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-dark, #002b18)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--bg-dark, #030906)" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Left Server Stack Silhouette */}
        <g stroke="rgba(var(--accent-rgb, 0, 255, 136), 0.15)" strokeWidth="1" fill="url(#serverGrad)">
          <rect x="2%" y="10%" width="160" height="75%" rx="4" />
          <line x1="2%" y1="25%" x2="calc(2% + 160px)" y2="25%" />
          <line x1="2%" y1="40%" x2="calc(2% + 160px)" y2="40%" />
          <line x1="2%" y1="55%" x2="calc(2% + 160px)" y2="55%" />
          <line x1="2%" y1="70%" x2="calc(2% + 160px)" y2="70%" />
        </g>

        {/* Right Server Stack Silhouette */}
        <g stroke="rgba(var(--accent-rgb, 0, 255, 136), 0.15)" strokeWidth="1" fill="url(#serverGrad)">
          <rect x="calc(98% - 160px)" y="10%" width="160" height="75%" rx="4" />
          <line x1="calc(98% - 160px)" y1="25%" x2="98%" y2="25%" />
          <line x1="calc(98% - 160px)" y1="40%" x2="98%" y2="40%" />
          <line x1="calc(98% - 160px)" y1="55%" x2="98%" y2="55%" />
          <line x1="calc(98% - 160px)" y1="70%" x2="98%" y2="70%" />
        </g>

        {/* Background Overhead Cabling Conduits */}
        <path 
          d="M 0 60 Q 300 120 600 60 T 1200 60 T 1920 60" 
          fill="none" 
          stroke="rgba(var(--accent-rgb, 0, 255, 136), 0.08)" 
          strokeWidth="2" 
          strokeDasharray="6 6"
        />
        <path 
          d="M 0 80 Q 400 140 800 80 T 1600 80 T 1920 80" 
          fill="none" 
          stroke="rgba(var(--accent-rgb, 0, 255, 136), 0.06)" 
          strokeWidth="1.5" 
        />
      </svg>

      {/* 3. Faint Animated Matrix Holographic Grid */}
      <div className="cyber-matrix-grid" />

      {/* 4. Canvas Particle & Spark Dynamic Simulation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 5. Vignette Blur Overlay for UI Readability Focus */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(var(--bg-dark-rgb, 9, 9, 9), 0.65) 100%)'
        }}
      />
    </div>
  );
}

