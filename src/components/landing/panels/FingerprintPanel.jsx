import React, { useState, useEffect } from 'react';

export default function FingerprintPanel({ className = '', isScanning = false, isComplete = false, style = {} }) {
  const [matchPercent, setMatchPercent] = useState(0);

  useEffect(() => {
    if (isScanning || isComplete) {
      const interval = setInterval(() => {
        setMatchPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [isScanning, isComplete]);

  // Progress ring calculations (r=52, C=326.7)
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (matchPercent / 100) * circumference;

  const verified = isComplete || matchPercent === 100;
  const active = isScanning || matchPercent > 0;

  return (
    <div 
      className={`cyber-holo-panel ${className} relative overflow-hidden backdrop-blur-xl ${
        isScanning 
          ? 'ring-2 ring-[var(--accent-color)] shadow-[0_0_35px_rgba(var(--accent-rgb),0.7)] opacity-100 scale-105' 
          : verified 
          ? 'opacity-95 border-[var(--accent-color)]/70 shadow-[0_0_25px_rgba(var(--accent-rgb),0.4)]' 
          : 'opacity-40 filter grayscale-[40%]'
      }`} 
      style={{ 
        width: '270px', 
        backgroundColor: 'rgba(3, 8, 5, 0.85)',
        transition: 'all 0.4s ease', 
        ...style 
      }}
    >
      {/* 1. Engineering Grid & Glass Scratch Background Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(var(--accent-rgb), 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--accent-rgb), 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '12px 12px'
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent" />

      {/* 2. Soft Corner Brackets */}
      <div className="cyber-corner cyber-corner-tl" />
      <div className="cyber-corner cyber-corner-tr" />
      <div className="cyber-corner cyber-corner-bl" />
      <div className="cyber-corner cyber-corner-br" />
      <div className="cyber-scanline-overlay" />
      <div className="cyber-laser-sweep" />

      {/* 3. Header */}
      <div className="cyber-panel-header relative z-10 border-b border-[var(--accent-color)]/20 pb-1">
        <div className="title-badge flex items-center gap-1.5">
          <div className={`status-dot ${isScanning ? 'animate-ping' : ''}`} />
          <span className="font-mono text-[10px] tracking-wider font-extrabold text-white">BIOMETRIC AUTHENTICATION</span>
        </div>
        <span className="text-[9px] font-mono font-bold text-[var(--accent-color)]/80 tracking-widest">
          {verified ? 'VERIFIED' : isScanning ? 'SCANNING' : 'IDLE'}
        </span>
      </div>

      {/* 4. Ultra-Premium Holographic Scanner Core */}
      <div className="flex flex-col items-center gap-2 py-1.5 relative z-10">
        <div className={`relative w-28 h-32 border border-[var(--accent-color)]/40 rounded-lg flex items-center justify-center overflow-hidden bg-black/70 shadow-[inset_0_0_20px_rgba(var(--accent-rgb),0.2)] transition-all duration-300 ${
          verified ? 'shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)] border-[var(--accent-color)]' : ''
        }`}>
          
          {/* Volumetric Upward Light Beam */}
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[var(--accent-color)]/25 via-[var(--accent-color)]/5 to-transparent pointer-events-none" />

          {/* Hexagonal HUD Corner Indicators */}
          <div className="absolute top-1 left-1 text-[7px] font-mono text-[var(--accent-color)]/60">HEX_0x4F</div>
          <div className="absolute top-1 right-1 text-[7px] font-mono text-[var(--accent-color)]/60">SYS_V4</div>
          <div className="absolute bottom-1 left-1 text-[7px] font-mono text-[var(--accent-color)]/60">NODE_A1</div>
          <div className="absolute bottom-1 right-1 text-[7px] font-mono text-[var(--accent-color)]/60">BIO_77</div>

          {/* Rotating Circular Biometric HUD Rings & Scanner Arc */}
          <svg className="absolute w-28 h-28 pointer-events-none" viewBox="0 0 120 120">
            {/* Outer Static Track */}
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(var(--accent-rgb), 0.12)" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* Outer Rotating Segment Ring */}
            <circle 
              cx="60" 
              cy="60" 
              r="52" 
              fill="none" 
              stroke="rgba(var(--accent-rgb), 0.3)" 
              strokeWidth="1.2" 
              strokeDasharray="8 16 24 8" 
              className={`origin-center ${active ? 'animate-[radar-rotate_16s_linear_infinite]' : ''}`}
            />

            {/* Middle Counter-Rotating HUD Arc Ring */}
            <circle 
              cx="60" 
              cy="60" 
              r="46" 
              fill="none" 
              stroke="rgba(var(--accent-rgb), 0.25)" 
              strokeWidth="1" 
              strokeDasharray="4 12 8 16" 
              className={`origin-center ${active ? 'animate-[radar-rotate_10s_linear_infinite_reverse]' : ''}`}
            />

            {/* 0% to 100% Authentication Progress Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--accent-color)"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
                transition: 'stroke-dashoffset 0.1s linear',
                filter: 'drop-shadow(0 0 6px var(--accent-color))'
              }}
            />
          </svg>

          {/* Vertical Laser Scan Beam */}
          {active && !verified && (
            <div 
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent-light)] to-transparent shadow-[0_0_12px_var(--accent-light)] z-20 pointer-events-none animate-[laser-sweep-anim_2.2s_easeInOut_infinite]"
            />
          )}

          {/* High-Detail Holographic Vector Fingerprint */}
          <div className={`relative w-20 h-24 flex items-center justify-center transition-transform duration-500 ${
            verified ? 'scale-105 filter drop-shadow-[0_0_16px_var(--accent-light)]' : 'drop-shadow-[0_0_10px_rgba(var(--accent-rgb),0.6)]'
          }`}>
            <svg 
              className={`w-full h-full transition-colors duration-300 ${active ? 'text-[var(--accent-color)]' : 'text-white/20'}`} 
              viewBox="0 0 100 120" 
              fill="none" 
              stroke="currentColor" 
              strokeLinecap="round"
            >
              {/* Outer Ridge Loops */}
              <path d="M 20 65 C 20 32 34 16 50 16 C 66 16 80 32 80 65 C 80 88 70 102 58 108" strokeWidth="1.6" opacity={matchPercent >= 10 ? 0.9 : 0.2} />
              <path d="M 25 68 C 25 38 36 22 50 22 C 64 22 75 38 75 68 C 75 88 66 98 50 98 C 38 98 28 88 28 75" strokeWidth="1.5" opacity={matchPercent >= 20 ? 0.95 : 0.2} />
              <path d="M 30 70 C 30 44 38 28 50 28 C 62 28 70 44 70 70 C 70 82 62 90 50 90 C 42 90 34 82 34 70" strokeWidth="1.4" opacity={matchPercent >= 35 ? 1 : 0.2} />
              <path d="M 35 70 C 35 48 41 34 50 34 C 59 34 65 48 65 70 C 65 78 59 83 50 83 C 44 83 40 78 40 70" strokeWidth="1.3" opacity={matchPercent >= 50 ? 1 : 0.2} />
              <path d="M 40 68 C 40 54 44 40 50 40 C 56 40 60 54 60 68 C 60 74 56 77 50 77 C 46 77 44 74 44 68" strokeWidth="1.2" opacity={matchPercent >= 65 ? 1 : 0.2} />
              
              {/* Core Whorls & Micro Ridges */}
              <path d="M 45 66 C 45 60 47 46 50 46 C 53 46 55 60 55 66 C 55 70 53 72 50 72 C 48 72 47 70 47 66" strokeWidth="1.2" opacity={matchPercent >= 80 ? 1 : 0.2} />
              <circle cx="50" cy="65" r="2.5" fill="currentColor" opacity={matchPercent >= 90 ? 1 : 0.2} />

              {/* Bifurcations & Detail Lines */}
              <path d="M 28 42 C 34 32 44 26 56 27" strokeWidth="1.2" opacity={matchPercent >= 25 ? 0.85 : 0.15} />
              <path d="M 72 52 C 77 62 76 76 68 86" strokeWidth="1.2" opacity={matchPercent >= 45 ? 0.85 : 0.15} />
              <path d="M 32 82 C 40 90 52 94 62 90" strokeWidth="1.2" opacity={matchPercent >= 75 ? 0.85 : 0.15} />

              {/* Ridge Particle Pulse Nodes */}
              {active && (
                <>
                  <circle cx="50" cy="22" r="1.5" fill="var(--accent-light)" className="animate-ping" />
                  <circle cx="75" cy="68" r="1.5" fill="var(--accent-light)" className="animate-pulse" />
                  <circle cx="28" cy="75" r="1.5" fill="var(--accent-color)" className="animate-ping" />
                </>
              )}
            </svg>
          </div>
        </div>

        {/* 5. Authentication Status Meter & Indicators */}
        <div className="w-full space-y-1 text-center font-mono">
          <div className="flex justify-between items-center text-[9.5px] px-1 font-bold">
            <span className="text-white/70">MATCH INDEX</span>
            <span className="text-[var(--accent-color)] drop-shadow-[0_0_6px_var(--accent-color)]">{matchPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-black/80 border border-[var(--accent-color)]/40 rounded-full overflow-hidden p-0.5 shadow-[inset_0_0_6px_rgba(0,0,0,0.8)]">
            <div 
              className="h-full bg-gradient-to-r from-[var(--accent-color)] via-[var(--accent-light)] to-[var(--accent-color)] rounded-full transition-all duration-75 shadow-[0_0_10px_var(--accent-color)]" 
              style={{ width: `${matchPercent}%` }} 
            />
          </div>

          {/* Verified / Scanning Status Text */}
          <div className="pt-1 flex flex-col items-center">
            {verified ? (
              <div className="w-full bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/60 text-[var(--accent-light)] py-1 rounded flex flex-col items-center justify-center font-bold tracking-wider text-[9px] shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] animate-[pulse_2s_infinite]">
                <span>✓ BIOMETRIC VERIFIED</span>
                <span className="text-[8px] text-white/90 font-semibold">✓ AI CORE AUTHORIZED</span>
              </div>
            ) : (
              <span className={`text-[9px] font-bold px-2 py-1 rounded tracking-wider w-full block border ${
                isScanning
                  ? 'text-[var(--accent-color)] bg-[var(--accent-color)]/10 border-[var(--accent-color)]/30 animate-pulse'
                  : 'text-white/40 bg-black/40 border-white/10'
              }`}>
                {isScanning ? 'Scanning Neural Biometrics...' : 'INITIALIZING BIOMETRIC SCAN...'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
