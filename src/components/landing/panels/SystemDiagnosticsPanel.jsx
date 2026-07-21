import React, { useState, useEffect } from 'react';

export default function SystemDiagnosticsPanel({ className = '', isScanning = false, isComplete = false, style = {} }) {
  const [stats, setStats] = useState({
    cpu: 42,
    gpu: 88,
    vram: 21.4,
    ram: 48.2,
    temp: 68,
    fps: 60.0,
    power: 318,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(38 + Math.random() * 14),
        gpu: Math.floor(84 + Math.random() * 10),
        vram: +(21.2 + Math.random() * 0.5).toFixed(1),
        ram: +(48.0 + Math.random() * 0.8).toFixed(1),
        temp: Math.floor(67 + Math.random() * 3),
        fps: +(59.8 + Math.random() * 0.4).toFixed(1),
        power: Math.floor(312 + Math.random() * 15),
      });
    }, 450);
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
      style={{ width: '270px', transition: 'all 0.4s ease', ...style }}
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
          <span>SYSTEM DIAGNOSTICS</span>
        </div>
        <span className="text-[9px] text-[var(--accent-color)]/70">HW_MONITOR</span>
      </div>

      {/* Hardware Telemetry Progress Bars */}
      <div className="space-y-1.5 font-mono text-[10px] py-1">
        {/* CPU */}
        <div>
          <div className="flex justify-between text-white/70 mb-0.5">
            <span>CPU UTILIZATION</span>
            <span className="text-[var(--accent-color)] font-bold">{stats.cpu}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/60 border border-[var(--accent-color)]/20 rounded-full overflow-hidden p-0.5">
            <div className="h-full bg-[var(--accent-color)] rounded-full transition-all duration-300" style={{ width: `${stats.cpu}%` }} />
          </div>
        </div>

        {/* GPU */}
        <div>
          <div className="flex justify-between text-white/70 mb-0.5">
            <span>GPU TENSOR CORE</span>
            <span className="text-[var(--accent-light)] font-bold">{stats.gpu}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/60 border border-[var(--accent-color)]/20 rounded-full overflow-hidden p-0.5">
            <div className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-light)] rounded-full transition-all duration-300" style={{ width: `${stats.gpu}%` }} />
          </div>
        </div>

        {/* VRAM & RAM */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <div className="bg-black/40 border border-[var(--accent-color)]/20 p-1 rounded">
            <div className="text-[8.5px] text-white/50">VRAM</div>
            <div className="text-[var(--accent-color)] font-bold text-[10.5px]">{stats.vram} GB / 24G</div>
          </div>
          <div className="bg-black/40 border border-[var(--accent-color)]/20 p-1 rounded">
            <div className="text-[8.5px] text-white/50">RAM</div>
            <div className="text-[var(--accent-color)] font-bold text-[10.5px]">{stats.ram} GB / 64G</div>
          </div>
        </div>

        {/* Telemetry Indicators */}
        <div className="grid grid-cols-3 gap-1 text-center pt-0.5 text-[9px]">
          <div className="bg-black/40 border border-[var(--accent-color)]/20 py-0.5 rounded">
            <span className="text-white/40 block text-[8px]">TEMP</span>
            <span className="text-[var(--accent-color)] font-bold">{stats.temp}°C</span>
          </div>
          <div className="bg-black/40 border border-[var(--accent-color)]/20 py-0.5 rounded">
            <span className="text-white/40 block text-[8px]">FPS</span>
            <span className="text-[var(--accent-light)] font-bold">{stats.fps}</span>
          </div>
          <div className="bg-black/40 border border-[var(--accent-color)]/20 py-0.5 rounded">
            <span className="text-white/40 block text-[8px]">POWER</span>
            <span className="text-[var(--accent-light)] font-bold">{stats.power}W</span>
          </div>
        </div>
      </div>
    </div>
  );
}

