import React, { memo } from 'react';

const InfoPanel = memo(({ skill, onClose }) => {
  if (!skill) return null;

  const { name, category, details } = skill;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6 backdrop-blur-sm bg-black/45 transition-all duration-200 animate-fade-in">
      <div className="bg-[#0b0c10]/95 border border-cyan-500/25 p-6 rounded-2xl w-full max-w-sm shadow-[0_15px_40px_rgba(0,0,0,0.5),_0_0_25px_rgba(6,182,212,0.1)] relative animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white focus:outline-none p-1 rounded-full cursor-pointer font-sans text-lg font-semibold"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-4 text-left">
          <span className="font-mono text-[9px] text-cyan-400 tracking-widest uppercase font-bold">
            {category === 'ai' ? '01 / SOFTWARE & AI' : category === 'trans' ? '02 / INTERMEDIATE' : '03 / MECHANICAL'}
          </span>
          <h3 className="text-xl font-display font-black text-white tracking-tight uppercase mt-0.5">
            {name}
          </h3>
        </div>

        {/* Experience Track Bar */}
        <div className="space-y-1 mb-4 font-sans text-xs">
          <div className="flex justify-between text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Experience Level</span>
            <span className="text-cyan-400">{details.level}</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              style={{ width: details.level === 'Expert' ? '90%' : details.level === 'Advanced' ? '75%' : '55%' }}
            />
          </div>
        </div>

        {/* Meta Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 font-mono text-[10px] tracking-wide text-zinc-400 text-left">
          <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-900">
            <span className="block text-[8px] uppercase text-zinc-500 font-bold mb-0.5">Project Logs</span>
            <span className="text-white font-bold">{details.projects} Completed</span>
          </div>
          <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-900">
            <span className="block text-[8px] uppercase text-zinc-500 font-bold mb-0.5">Libraries / APIs</span>
            <span className="text-white font-bold">{details.libs} Integrated</span>
          </div>
        </div>

        {/* Frameworks & Tools Tag Capsules */}
        <div className="mb-4 text-left">
          <span className="block font-mono text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-1.5">
            Core Modules
          </span>
          <div className="flex flex-wrap gap-1.5">
            {details.tools.map((t, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-sans text-[10px] text-zinc-300 font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-900 font-mono text-[10px] text-zinc-500">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>STATUS: <span className="text-zinc-300 font-semibold">{details.level === 'Expert' ? 'SYSTEM MATURED' : 'CONTINUOUS REFINEMENT'}</span></span>
        </div>
      </div>
    </div>
  );
});

export default InfoPanel;
