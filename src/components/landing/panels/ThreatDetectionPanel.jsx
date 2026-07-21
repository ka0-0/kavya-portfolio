import React, { useState, useEffect } from 'react';

export default function ThreatDetectionPanel({ className = '', isScanning = false, isComplete = false, style = {} }) {
  const [blockedCount, setBlockedCount] = useState(14920);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setBlockedCount((prev) => prev + Math.floor(Math.random() * 3 + 1));
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`cyber-holo-panel ${className} ${
        isScanning 
          ? 'ring-2 ring-[var(--accent-color)] shadow-[0_0_30px_rgba(var(--accent-rgb),0.6)] opacity-100 scale-105' 
          : isComplete 
          ? 'opacity-90 border-[var(--accent-color)]/50' 
          : 'opacity-40 filter grayscale-[40%]'
      }`} 
      style={{ width: '250px', transition: 'all 0.4s ease', ...style }}
    >
      {/* Corner Brackets */}
      <div className="cyber-corner cyber-corner-tl" />
      <div className="cyber-corner cyber-corner-tr" />
      <div className="cyber-corner cyber-corner-bl" />
      <div className="cyber-corner cyber-corner-br" />
      <div className="cyber-scanline-overlay" />

      {/* Header */}
      <div className="cyber-panel-header">
        <div className="title-badge">
          <div className={`status-dot ${isScanning ? 'animate-ping' : ''}`} />
          <span>CYBER SOC DEFENSE</span>
        </div>
        <span className="text-[9px] text-[var(--accent-color)]/70">
          {isComplete ? 'SECURE' : isScanning ? 'SCANNING' : 'IDLE'}
        </span>
      </div>

      {/* Content */}
      <div className="flex items-center gap-3 py-1">
        {/* Radar Scanning Grid */}
        <div className="relative w-16 h-16 rounded-full border border-[var(--accent-color)]/30 bg-black/50 flex items-center justify-center overflow-hidden shrink-0">
          <div className="absolute w-12 h-12 rounded-full border border-[var(--accent-color)]/20" />
          <div className="absolute w-6 h-6 rounded-full border border-[var(--accent-color)]/20" />
          <div className="absolute w-full h-px bg-[var(--accent-color)]/20" />
          <div className="absolute h-full w-px bg-[var(--accent-color)]/20" />

          {/* Rotating Radar Sweep Line */}
          <div className="absolute inset-0 radar-sweep-line pointer-events-none">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-[var(--accent-color)]/50 to-transparent origin-bottom-right" />
          </div>

          <circle cx="28" cy="18" r="1.5" fill="var(--accent-color)" className="animate-ping" />
          <circle cx="48" cy="42" r="1.5" fill="var(--accent-light)" />
        </div>

        {/* Status Metrics */}
        <div className="flex-1 space-y-1 font-mono text-[9.5px]">
          <div className="bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30 text-[var(--accent-color)] px-1.5 py-0.5 rounded text-center font-bold tracking-wide">
            0 ACTIVE THREATS
          </div>

          <div className="text-white/60 flex justify-between">
            <span>FIREWALL:</span>
            <span className="text-[var(--accent-color)]">AES-256</span>
          </div>

          <div className="text-white/60 flex justify-between">
            <span>BLOCKED:</span>
            <span className="text-[var(--accent-light)] font-bold">{blockedCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

