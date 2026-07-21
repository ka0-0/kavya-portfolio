import React, { useState, useEffect } from 'react';

export default function SatelliteTrackingPanel({ className = '', isScanning = false, isComplete = false, style = {} }) {
  const [pulseRefresh, setPulseRefresh] = useState(false);

  // Periodic satellite sweep & target pulse refresh every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseRefresh(true);
      const timer = setTimeout(() => setPulseRefresh(false), 650);
      return () => clearTimeout(timer);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const active = isScanning || isComplete;

  return (
    <div 
      className={`cyber-holo-panel ${className} relative overflow-hidden backdrop-blur-xl ${
        isScanning 
          ? 'ring-2 ring-[var(--accent-color)] shadow-[0_0_35px_rgba(var(--accent-rgb),0.7)] opacity-100 scale-105' 
          : isComplete 
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
      {/* 1. Engineering Grid & Holographic Scratch Texture Overlay */}
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
          <span className="font-mono text-[10px] tracking-wider font-extrabold text-white">SATELLITE LOCATION MAP</span>
        </div>
        <span className="text-[9px] font-mono font-bold text-[var(--accent-color)]/80 tracking-widest">
          {isComplete ? 'SATELLITE LOCK' : isScanning ? 'LINKING...' : 'IDLE'}
        </span>
      </div>

      {/* 4. Live Holographic Satellite ISR Feed Viewport (Delhi Top-Down Command Interface) */}
      <div className="relative w-full h-[115px] bg-black/90 border border-[var(--accent-color)]/35 rounded my-1.5 overflow-hidden shadow-[inset_0_0_25px_rgba(var(--accent-rgb),0.3)] flex items-center justify-center">
        
        {/* Ambient Radial Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-color)]/12 via-transparent to-[var(--accent-color)]/5 pointer-events-none" />

        {/* Floating HUD Micro Overlay Labels */}
        <div className="absolute top-1 left-1.5 z-20 flex gap-1 text-[7px] font-mono text-[var(--accent-color)]/85">
          <span className="bg-black/70 px-1 rounded border border-[var(--accent-color)]/30">GPS LOCK</span>
          <span className="bg-black/70 px-1 rounded border border-[var(--accent-color)]/30 animate-pulse">SATELLITE FEED</span>
        </div>
        <div className="absolute top-1 right-1.5 z-20 flex gap-1 text-[7px] font-mono text-[var(--accent-light)] font-bold">
          <span className="bg-black/70 px-1 rounded border border-[var(--accent-color)]/30">LIVE TRACK</span>
          <span className="bg-black/70 px-1 rounded border border-[var(--accent-color)]/30">SIGNAL STABLE</span>
        </div>

        <div className="absolute bottom-1 left-1.5 z-20 flex gap-1 text-[7px] font-mono text-white/70">
          <span className="bg-black/70 px-1 rounded border border-[var(--accent-color)]/20">AI TRACKING</span>
          <span className="bg-black/70 px-1 rounded border border-[var(--accent-color)]/20">TARGET LOCK</span>
        </div>
        <div className="absolute bottom-1 right-1.5 z-20 flex gap-1 text-[7px] font-mono text-[var(--accent-color)] font-bold">
          <span className="bg-black/70 px-1 rounded border border-[var(--accent-color)]/30">KAV-SAT-01</span>
          <span className="bg-black/70 px-1 rounded border border-[var(--accent-color)]/30">&lt;1ms</span>
        </div>

        {/* Top-Down Holographic Delhi City Grid & ISR Target SVG */}
        <svg className="w-full h-full relative z-10" viewBox="0 0 240 115">
          <defs>
            <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="beamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="var(--accent-color)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Latitude / Longitude Faint Grid Background */}
          <g stroke="rgba(var(--accent-rgb), 0.12)" strokeWidth="0.7" strokeDasharray="3 3">
            <line x1="0" y1="23" x2="240" y2="23" />
            <line x1="0" y1="46" x2="240" y2="46" />
            <line x1="0" y1="69" x2="240" y2="69" />
            <line x1="0" y1="92" x2="240" y2="92" />
            <line x1="48" y1="0" x2="48" y2="115" />
            <line x1="96" y1="0" x2="96" y2="115" />
            <line x1="144" y1="0" x2="144" y2="115" />
            <line x1="192" y1="0" x2="192" y2="115" />
          </g>

          {/* Yamuna River Corridor (Darker Holographic Curve) */}
          <path 
            d="M 165 0 Q 158 35, 172 58 T 185 115" 
            fill="none" 
            stroke="rgba(var(--accent-rgb), 0.2)" 
            strokeWidth="5" 
            strokeDasharray="6 3"
          />

          {/* Ridge Park & Greenbelt Zones (Subtle Darker Regions) */}
          <path d="M 85 15 Q 100 10 98 32 Z" fill="rgba(var(--accent-rgb), 0.05)" stroke="rgba(var(--accent-rgb), 0.15)" strokeWidth="0.5" />
          <path d="M 75 75 Q 92 68 88 95 Z" fill="rgba(var(--accent-rgb), 0.05)" stroke="rgba(var(--accent-rgb), 0.15)" strokeWidth="0.5" />

          {/* District Block Outlines & 3D Holographic Wireframe Buildings */}
          <g stroke="rgba(var(--accent-rgb), 0.35)" strokeWidth="0.8" fill="rgba(var(--accent-rgb), 0.08)">
            {/* North-East District */}
            <rect x="135" y="16" width="22" height="15" rx="1" />
            <rect x="162" y="22" width="16" height="12" rx="1" />
            {/* North-West District */}
            <rect x="68" y="20" width="26" height="18" rx="1" />
            <rect x="38" y="16" width="20" height="14" rx="1" />
            {/* South-East District */}
            <rect x="145" y="70" width="28" height="22" rx="1" />
            <rect x="178" y="75" width="20" height="16" rx="1" />
            {/* South-West District */}
            <rect x="62" y="72" width="24" height="20" rx="1" />
            <rect x="34" y="68" width="18" height="16" rx="1" />
          </g>

          {/* Secondary Side Streets Grid Lines */}
          <g stroke="rgba(var(--accent-rgb), 0.18)" strokeWidth="0.6">
            <line x1="30" y1="36" x2="210" y2="36" />
            <line x1="30" y1="78" x2="210" y2="78" />
            <line x1="72" y1="10" x2="72" y2="105" />
            <line x1="168" y1="10" x2="168" y2="105" />
          </g>

          {/* Neon Road Network (Central Connaught Place / Ring Road Loops & Arterials) */}
          <g stroke="var(--accent-color)" opacity="0.85">
            {/* Inner Ring Road Loop */}
            <circle cx="120" cy="52" r="22" fill="none" strokeWidth="1.6" filter="drop-shadow(0 0 4px var(--accent-color))" />
            {/* Outer Ring Road Loop */}
            <circle cx="120" cy="52" r="44" fill="none" strokeWidth="1.2" strokeDasharray="16 4 8 4" />

            {/* Radial Major Arterial Expressways (Brighter Neon Lines) */}
            <g strokeWidth="1.5" filter="drop-shadow(0 0 3px var(--accent-color))">
              <line x1="120" y1="52" x2="120" y2="4" />
              <line x1="120" y1="52" x2="120" y2="110" />
              <line x1="120" y1="52" x2="236" y2="52" />
              <line x1="120" y1="52" x2="4" y2="52" />
              <line x1="120" y1="52" x2="208" y2="12" />
              <line x1="120" y1="52" x2="32" y2="12" />
              <line x1="120" y1="52" x2="208" y2="98" />
              <line x1="120" y1="52" x2="32" y2="98" />
            </g>
          </g>

          {/* Animated Flowing Traffic Light Pulses & Neural Data Packets */}
          {active && (
            <g fill="var(--accent-light)">
              <circle cx="120" cy="22" r="1.6" className="animate-ping" />
              <circle cx="120" cy="85" r="1.6" className="animate-ping" />
              <circle cx="165" cy="52" r="1.6" className="animate-ping" />
              <circle cx="75" cy="52" r="1.6" className="animate-ping" />
              <circle cx="168" cy="28" r="1.6" className="animate-ping" />
              <circle cx="72" cy="78" r="1.6" className="animate-ping" />
            </g>
          )}

          {/* Vertical Holographic Light Beam at Delhi Center (120, 52) */}
          <line x1="120" y1="0" x2="120" y2="115" stroke="url(#beamGrad)" strokeWidth="1.5" />

          {/* Expanding Radar Rings from Delhi Center */}
          <g transform="translate(120, 52)">
            <circle cx="0" cy="0" r="14" fill="none" stroke="var(--accent-color)" strokeWidth="1" opacity="0.7" className="animate-ping" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" className="animate-ping" style={{ animationDuration: '2.4s' }} />
          </g>

          {/* Rotating Target Reticle around Delhi Center */}
          <g transform="translate(120, 52)" className="origin-center animate-[radar-rotate_7s_linear_infinite]">
            <circle cx="0" cy="0" r="16" fill="none" stroke="var(--accent-color)" strokeWidth="1.4" strokeDasharray="8 6 12 4" />
            <line x1="-20" y1="0" x2="-13" y2="0" stroke="var(--accent-color)" strokeWidth="1.2" />
            <line x1="13" y1="0" x2="20" y2="0" stroke="var(--accent-color)" strokeWidth="1.2" />
            <line x1="0" y1="-20" x2="0" y2="-13" stroke="var(--accent-color)" strokeWidth="1.2" />
            <line x1="0" y1="13" x2="0" y2="20" stroke="var(--accent-color)" strokeWidth="1.2" />
          </g>

          {/* Core Delhi Glowing AI Target Marker Dot & Orbiting Particles */}
          <g transform="translate(120, 52)">
            {pulseRefresh && (
              <circle cx="0" cy="0" r="28" fill="url(#pulseGrad)" className="animate-ping" />
            )}
            <circle cx="0" cy="0" r="4.5" fill="var(--accent-color)" className="shadow-[0_0_15px_var(--accent-color)]" />
            <circle cx="0" cy="0" r="2" fill="#ffffff" />
            {/* Orbiting particle */}
            <g className="origin-center animate-[radar-rotate_4s_linear_infinite]">
              <circle cx="10" cy="0" r="1.2" fill="var(--accent-light)" />
            </g>
          </g>

          {/* Floating Label: DELHI / LIVE LOCATION */}
          <g transform="translate(132, 34)">
            <rect x="0" y="0" width="76" height="22" fill="rgba(0,0,0,0.85)" stroke="var(--accent-color)" strokeWidth="0.9" rx="3" className="shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" />
            <text x="6" y="9" fill="var(--accent-color)" fontSize="7" fontWeight="bold" fontFamily="monospace" letterSpacing="0.5">DELHI</text>
            <text x="6" y="17" fill="#ffffff" opacity="0.9" fontSize="5.5" fontFamily="monospace" letterSpacing="0.2">LIVE LOCATION</text>
          </g>
        </svg>

        {/* Diagonal Sweeping Satellite Laser Beam Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-color)]/30 to-transparent animate-[laser-sweep-anim_3.5s_easeInOut_infinite] pointer-events-none z-20" />
      </div>

      {/* 5. Bottom Telemetry Bar */}
      <div className="space-y-1 font-mono text-[9.5px]">
        <div className="flex justify-between items-center bg-black/60 border border-[var(--accent-color)]/25 px-2 py-0.5 rounded">
          <div className="text-white/80">
            LOCATION: <span className="text-[var(--accent-color)] font-bold tracking-wider">Delhi, India</span>
          </div>
          <div className="text-[var(--accent-light)] font-bold text-[9px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-light)] animate-pulse shadow-[0_0_6px_var(--accent-light)]" />
            {isComplete ? 'Satellite Lock Established' : isScanning ? 'LINKING...' : 'IDLE'}
          </div>
        </div>

        <div className="flex justify-between items-center text-[8.5px] text-white/60 px-1">
          <span>GPS: <strong className="text-white/90">28.6139° N</strong></span>
          <span>LONGITUDE: <strong className="text-white/90">77.2090° E</strong></span>
          <span className="text-[var(--accent-color)] font-bold">SIGNAL: 100% | UPLINK: Stable</span>
        </div>
      </div>
    </div>
  );
}



