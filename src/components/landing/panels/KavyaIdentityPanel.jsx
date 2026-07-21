import React from 'react';

export default function KavyaIdentityPanel({ className = '', isScanning = false, isComplete = false, style = {} }) {
  return (
    <div 
      className={`cyber-holo-panel ${className} ${
        isScanning 
          ? 'ring-2 ring-[var(--accent-color)] shadow-[0_0_30px_rgba(var(--accent-rgb),0.6)] opacity-100 scale-105' 
          : isComplete 
          ? 'opacity-90 border-[var(--accent-color)]/50' 
          : 'opacity-40 filter grayscale-[40%]'
      }`} 
      style={{ width: '310px', transition: 'all 0.4s ease', ...style }}
    >
      {/* Corner Brackets */}
      <div className="cyber-corner cyber-corner-tl" />
      <div className="cyber-corner cyber-corner-tr" />
      <div className="cyber-corner cyber-corner-bl" />
      <div className="cyber-corner cyber-corner-br" />
      <div className="cyber-scanline-overlay" />
      <div className="cyber-laser-sweep" />

      {/* Header */}
      <div className="cyber-panel-header">
        <div className="title-badge">
          <div className={`status-dot ${isScanning ? 'animate-ping' : ''}`} />
          <span>CORE IDENTITY & CREDENTIALS</span>
        </div>
        <span className="text-[9px] text-[var(--accent-color)]/70">SYS_ID_01</span>
      </div>

      {/* Content */}
      <div className="py-1 space-y-2 font-mono">
        <div className="bg-black/50 border border-[var(--accent-color)]/30 rounded p-2 text-center">
          <div className="text-xs text-[var(--accent-color)]/70 uppercase tracking-widest text-[9px]">ENGINEER PROFILE</div>
          <div className="text-base font-extrabold text-white tracking-wider my-0.5 drop-shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]">
            KAVYA MAKHAN
          </div>
          <div className="text-[10px] text-[var(--accent-light)] font-semibold tracking-wide">
            ENGINEERING INTELLIGENCE x ARTIFICIAL INTELLIGENCE
          </div>
          <div className="text-[9px] text-white/60 mt-0.5">
            DESIGN x CODE x AUTOMATION
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[9.5px]">
          <div className="bg-black/40 border border-[var(--accent-color)]/20 px-2 py-1 rounded flex flex-col justify-between">
            <span className="text-white/50 text-[8px]">CLEARANCE</span>
            <span className="text-[var(--accent-color)] font-bold">LEVEL 7 ALPHA</span>
          </div>
          <div className="bg-black/40 border border-[var(--accent-color)]/20 px-2 py-1 rounded flex flex-col justify-between">
            <span className="text-white/50 text-[8px]">HACKING STATUS</span>
            <span className="text-[var(--accent-light)] font-bold">BYPASS DONE</span>
          </div>
        </div>

        <div className="bg-[var(--accent-color)]/15 border border-[var(--accent-color)]/40 text-[var(--accent-color)] text-center text-[10px] py-1 rounded font-bold tracking-wider">
          {isComplete ? 'PORTFOLIO ACCESS GRANTED // 100%' : isScanning ? 'AUTHENTICATING IDENTITY...' : 'WAITING FOR AUTH'}
        </div>
      </div>
    </div>
  );
}

