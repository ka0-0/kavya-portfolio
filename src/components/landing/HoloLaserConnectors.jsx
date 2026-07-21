import React from 'react';

export default function HoloLaserConnectors({ panels = [], activeStep = 0, isAccessGranted = false }) {
  const cx = typeof window !== 'undefined' ? window.innerWidth / 2 : 600;
  const cy = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
      <defs>
        {/* Intense Laser Glow filter */}
        <filter id="laserBeamGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="activeLaserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-color, #00FF88)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--accent-light, #76FF03)" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <g filter="url(#laserBeamGlow)">
        {panels.map((panel, idx) => {
          if (!panel.x || !panel.y) return null;

          // Crucial: Only draw scanning beam to active box (or all if access granted)
          const isTargeted = isAccessGranted || activeStep === idx;
          if (!isTargeted) return null;

          const px = panel.x;
          const py = panel.y;

          return (
            <g key={idx}>
              {/* Solid Scanning Laser Beam */}
              <line
                x1={cx}
                y1={cy}
                x2={px}
                y2={py}
                stroke="url(#activeLaserGrad)"
                strokeWidth="2.8"
                style={{
                  transition: 'all 0.35s ease-out',
                  opacity: 0.95
                }}
              />

              {/* Target Impact Node on active box */}
              <circle
                cx={px}
                cy={py}
                r="5"
                fill="#ffffff"
                stroke="var(--accent-color, #00FF88)"
                strokeWidth="2"
                className="animate-ping"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

