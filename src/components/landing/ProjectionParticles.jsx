import React, { useMemo } from 'react';

export default function ProjectionParticles({ active }) {
  // Generate a fixed particle pool once, avoiding recreation and re-renders
  const particlePool = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => {
      const tx = (Math.random() * 100 - 50).toFixed(1) + 'px'; // horizontal drift spread (-50px to 50px)
      const delay = (i * 0.22).toFixed(2) + 's';              // staggered delay increments
      const duration = (1.3 + Math.random() * 0.8).toFixed(2) + 's'; // flight speed duration (1.3s to 2.1s)
      const r = (Math.random() * 1.3 + 0.6).toFixed(1);       // particle size radius (0.6px to 1.9px)
      return { tx, delay, duration, r };
    });
  }, []);

  if (!active) return null;

  return (
    <g className="projection-particles">
      {particlePool.map((p, idx) => (
        <circle
          key={idx}
          cx="160"
          cy="107"
          r={p.r}
          fill="var(--holo-accent-color, var(--accent-color))"
          className="beam-particle"
          style={{
            '--tx': p.tx,
            '--delay': p.delay,
            '--duration': p.duration,
          }}
        />
      ))}
    </g>
  );
}
