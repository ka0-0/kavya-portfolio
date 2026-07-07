import React, { memo } from 'react';

const SkillNode = memo(({ id, name, position, visual, onMouseEnter, onMouseLeave }) => {
  const { x, y } = position;
  const { nodeClass, importance } = visual;

  let sizeClass = 'w-12 h-12';
  let textSizeClass = 'text-[9px]';
  let targetOpacity = 0.85;
  let entryDelay = '1.2s';
  let importanceClass = '';

  if (importance === 'primary') {
    sizeClass = 'w-14 h-14';
    textSizeClass = 'text-[9px]';
    targetOpacity = 0.95;
    entryDelay = '1.0s';
    importanceClass = 'node-importance-primary border-opacity-60 text-zinc-300/90 hover:border-opacity-100 hover:text-white';
  } else if (importance === 'supporting') {
    sizeClass = 'w-10 h-10';
    textSizeClass = 'text-[8px]';
    targetOpacity = 0.6;
    entryDelay = '1.4s';
    importanceClass = 'node-importance-supporting border-opacity-30 text-zinc-400/80 hover:border-opacity-90 hover:text-white/90';
  } else {
    // Secondary / Default size
    sizeClass = 'w-12 h-12';
    textSizeClass = 'text-[9px]';
    targetOpacity = 0.85;
    entryDelay = '1.2s';
    importanceClass = 'node-importance-secondary border-opacity-45 text-zinc-300/85 hover:border-opacity-95 hover:text-white';
  }

  return (
    <button
      onMouseEnter={() => onMouseEnter(id)}
      onMouseLeave={() => onMouseLeave(id)}
      className={`absolute rounded-full border flex items-center justify-center cursor-pointer select-none group focus:outline-none focus:ring-1 focus:ring-cyan-500/30 z-10 will-change-transform bg-zinc-950/90 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] skills-node ${sizeClass} ${nodeClass} ${importanceClass} opacity-[var(--target-opacity)] hover:scale-[1.04] hover:opacity-100 hover:z-20`}
      style={{
        left: `${(x / 1000) * 100}%`,
        top: `${(y / 600) * 100}%`,
        '--target-scale': 1.0,
        '--target-opacity': targetOpacity,
        '--entry-delay': entryDelay,
      }}
      data-interactive="true"
    >
      <span className={`font-mono ${textSizeClass} font-semibold tracking-wider text-center leading-none transition-colors duration-300`}>
        {name.slice(0, 5)}
      </span>
      {/* Tooltip on Hover */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-200 font-bold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md">
        {name}
      </span>
    </button>
  );
});

export default SkillNode;
