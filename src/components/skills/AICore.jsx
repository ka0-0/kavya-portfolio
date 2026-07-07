import React, { memo } from 'react';

const AICore = memo(({ position, onMouseEnter, onMouseLeave }) => {
  const { x, y } = position;
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute flex items-center justify-center z-10 w-16 h-16 rounded-full bg-[#070b16]/95 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)] cursor-default overflow-hidden skills-core group transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        left: `${(x / 1000) * 100}%`,
        top: `${(y / 600) * 100}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Soft inner radial gradient (pseudo-ambient light) */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-cyan-950/20 to-blue-950/20 z-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-60" />

      {/* Concentric rotating rings */}
      <div
        className="absolute inset-0.5 rounded-full border border-dashed border-cyan-500/15 skills-core-ring skills-core-ring-1 will-change-transform z-10 pointer-events-none"
      />
      <div
        className="absolute inset-2 rounded-full border border-dashed border-blue-500/10 skills-core-ring skills-core-ring-2 will-change-transform z-10 pointer-events-none"
      />

      {/* Pulsing energy nucleus */}
      <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white/25 shadow-[0_0_8px_rgba(6,182,212,0.65)] z-20 core-nucleus pointer-events-none transition-all duration-500" />
    </div>
  );
});

export default AICore;
