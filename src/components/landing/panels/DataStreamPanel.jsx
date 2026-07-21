import React, { useState, useEffect } from 'react';

const generateHexRow = () => {
  const hex = () => Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
  const speed = (5.0 + Math.random() * 8.5).toFixed(1);
  return {
    addr: `0x${hex()}`,
    rate: `${speed} GB/s`,
    status: Math.random() > 0.1 ? 'ACTIVE' : 'SYNC',
  };
};

export default function DataStreamPanel({ className = '', isScanning = false, isComplete = false, style = {} }) {
  const [rows, setRows] = useState(() => [
    generateHexRow(),
    generateHexRow(),
    generateHexRow(),
    generateHexRow(),
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRows((prev) => [generateHexRow(), ...prev.slice(0, 3)]);
    }, 280);
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
      style={{ width: '230px', transition: 'all 0.4s ease', ...style }}
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
          <span>DATA STREAM</span>
        </div>
        <span className="text-[9px] text-[var(--accent-color)]/70">HEX_BUFFER</span>
      </div>

      {/* Rows Stream */}
      <div className="space-y-1 font-mono text-[9.5px]">
        {rows.map((row, idx) => (
          <div key={idx} className="flex justify-between items-center bg-black/40 border border-[var(--accent-color)]/15 px-1.5 py-0.5 rounded">
            <span className="text-white/80 font-bold">{row.addr}</span>
            <span className="text-[var(--accent-color)]">{row.rate}</span>
            <span className="text-[8.5px] text-[var(--accent-light)]/80">{row.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

