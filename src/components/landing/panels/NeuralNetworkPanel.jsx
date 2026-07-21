import React, { useEffect, useState } from 'react';

export default function NeuralNetworkPanel({ className = '', style = {} }) {
  const [pulseOffset, setPulseOffset] = useState(0);
  const [confidence, setConfidence] = useState(99.6);
  const [latency, setLatency] = useState(2.1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseOffset((prev) => (prev + 1) % 100);
      setConfidence((99.4 + Math.random() * 0.5).toFixed(1));
      setLatency((1.9 + Math.random() * 0.4).toFixed(1));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`cyber-holo-panel ${className}`} style={{ width: '270px', height: '190px', ...style }}>
      {/* Corner Brackets */}
      <div className="cyber-corner cyber-corner-tl" />
      <div className="cyber-corner cyber-corner-tr" />
      <div className="cyber-corner cyber-corner-bl" />
      <div className="cyber-corner cyber-corner-br" />
      <div className="cyber-scanline-overlay" />

      {/* Header */}
      <div className="cyber-panel-header">
        <div className="title-badge">
          <div className="status-dot" />
          <span>NEURAL TOPOLOGY</span>
        </div>
        <span className="text-[9px] text-[var(--accent-color)]/60">AI_CORE_NET</span>
      </div>

      {/* Neural Network SVG Visualizer */}
      <div className="relative w-full h-[100px] bg-black/30 border border-[var(--accent-color)]/15 rounded my-1 overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 240 100">
          {/* Synaptic Connection Lines */}
          <g stroke="rgba(var(--accent-rgb, 0, 255, 136), 0.25)" strokeWidth="1">
            {/* Input to Hidden 1 */}
            <line x1="30" y1="25" x2="90" y2="20" />
            <line x1="30" y1="25" x2="90" y2="50" />
            <line x1="30" y1="50" x2="90" y2="20" />
            <line x1="30" y1="50" x2="90" y2="50" />
            <line x1="30" y1="50" x2="90" y2="80" />
            <line x1="30" y1="75" x2="90" y2="50" />
            <line x1="30" y1="75" x2="90" y2="80" />

            {/* Hidden 1 to Hidden 2 */}
            <line x1="90" y1="20" x2="150" y2="20" />
            <line x1="90" y1="20" x2="150" y2="50" />
            <line x1="90" y1="50" x2="150" y2="20" />
            <line x1="90" y1="50" x2="150" y2="50" />
            <line x1="90" y1="50" x2="150" y2="80" />
            <line x1="90" y1="80" x2="150" y2="50" />
            <line x1="90" y1="80" x2="150" y2="80" />

            {/* Hidden 2 to Output */}
            <line x1="150" y1="20" x2="210" y2="35" />
            <line x1="150" y1="50" x2="210" y2="35" />
            <line x1="150" y1="50" x2="210" y2="65" />
            <line x1="150" y1="80" x2="210" y2="65" />
          </g>

          {/* Synaptic Pulse Travelling Dots */}
          <circle cx={30 + (pulseOffset / 100) * 60} cy={25 + (pulseOffset / 100) * 25} r="2" fill="var(--accent-light)" />
          <circle cx={90 + (pulseOffset / 100) * 60} cy={20 + (pulseOffset / 100) * 30} r="2" fill="var(--accent-color)" />
          <circle cx={150 + (pulseOffset / 100) * 60} cy={50 + (pulseOffset / 100) * 15} r="2" fill="var(--accent-light)" />

          {/* Layer Nodes */}
          {/* Input Layer (X: 30) */}
          <circle cx="30" cy="25" r="4.5" fill="var(--accent-color)" stroke="#ffffff" strokeWidth="1" />
          <circle cx="30" cy="50" r="4.5" fill="var(--accent-color)" stroke="#ffffff" strokeWidth="1" />
          <circle cx="30" cy="75" r="4.5" fill="var(--accent-color)" stroke="#ffffff" strokeWidth="1" />

          {/* Hidden 1 Layer (X: 90) */}
          <circle cx="90" cy="20" r="4" fill="var(--accent-dark)" stroke="var(--accent-color)" strokeWidth="1.5" />
          <circle cx="90" cy="50" r="4" fill="var(--accent-dark)" stroke="var(--accent-color)" strokeWidth="1.5" />
          <circle cx="90" cy="80" r="4" fill="var(--accent-dark)" stroke="var(--accent-color)" strokeWidth="1.5" />

          {/* Hidden 2 Layer (X: 150) */}
          <circle cx="150" cy="20" r="4" fill="var(--accent-dark)" stroke="var(--accent-color)" strokeWidth="1.5" />
          <circle cx="150" cy="50" r="4" fill="var(--accent-dark)" stroke="var(--accent-color)" strokeWidth="1.5" />
          <circle cx="150" cy="80" r="4" fill="var(--accent-dark)" stroke="var(--accent-color)" strokeWidth="1.5" />

          {/* Output Layer (X: 210) */}
          <circle cx="210" cy="35" r="5" fill="var(--accent-light)" stroke="#ffffff" strokeWidth="1" />
          <circle cx="210" cy="65" r="5" fill="var(--accent-light)" stroke="#ffffff" strokeWidth="1" />
        </svg>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-1 pt-1 font-mono text-[9.5px]">
        <div className="bg-black/40 border border-[var(--accent-color)]/20 px-1.5 py-0.5 rounded flex justify-between">
          <span className="text-white/60">CONFIDENCE</span>
          <span className="text-[var(--accent-color)] font-bold">{confidence}%</span>
        </div>
        <div className="bg-black/40 border border-[var(--accent-color)]/20 px-1.5 py-0.5 rounded flex justify-between">
          <span className="text-white/60">LATENCY</span>
          <span className="text-[var(--accent-light)] font-bold">{latency} ms</span>
        </div>
      </div>
    </div>
  );
}

