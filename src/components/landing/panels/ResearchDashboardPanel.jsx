import React, { useState, useEffect } from 'react';

export default function ResearchDashboardPanel({ className = '', style = {} }) {
  const [epoch, setEpoch] = useState(148);
  const [loss, setLoss] = useState(0.0142);
  const [acc, setAcc] = useState(99.82);

  useEffect(() => {
    const interval = setInterval(() => {
      setEpoch((prev) => (prev >= 200 ? 1 : prev + 1));
      setLoss((prev) => Math.max(0.005, +(prev - Math.random() * 0.0003).toFixed(4)));
      setAcc((prev) => Math.min(99.98, +(prev + Math.random() * 0.01).toFixed(2)));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`cyber-holo-panel ${className}`} style={{ width: '270px', ...style }}>
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
          <span>RESEARCH LAB METRICS</span>
        </div>
        <span className="text-[9px] text-[var(--accent-color)]/60">MODEL_TRAIN</span>
      </div>

      {/* Training Accuracy/Loss SVG Graph */}
      <div className="relative w-full h-[65px] bg-black/40 border border-[var(--accent-color)]/15 rounded my-1 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 240 65" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="20" x2="240" y2="20" stroke="rgba(var(--accent-rgb, 0, 255, 136), 0.1)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="40" x2="240" y2="40" stroke="rgba(var(--accent-rgb, 0, 255, 136), 0.1)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Loss Curve Path (Descending) */}
          <path
            d="M 0 15 Q 40 35, 80 45 T 160 52 T 240 56"
            fill="none"
            stroke="#ff3366"
            strokeWidth="1.8"
            opacity="0.85"
          />

          {/* Accuracy Curve Path (Ascending) */}
          <path
            d="M 0 50 Q 40 30, 80 20 T 160 12 T 240 8"
            fill="none"
            stroke="var(--accent-color)"
            strokeWidth="2"
          />

          {/* Gradient Fill under Accuracy Curve */}
          <path
            d="M 0 50 Q 40 30, 80 20 T 160 12 T 240 8 L 240 65 L 0 65 Z"
            fill="url(#accGrad)"
            opacity="0.15"
          />
          <defs>
            <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-color)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute top-1 left-2 text-[8px] font-mono text-[var(--accent-color)]">ACC: {acc}%</div>
        <div className="absolute bottom-1 right-2 text-[8px] font-mono text-[#ff3366]">LOSS: {loss}</div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center font-mono text-[9px] pt-0.5">
        <span className="text-white/60">EPOCH: <strong className="text-[var(--accent-color)]">{epoch} / 200</strong></span>
        <span className="text-white/60">DATASET: <strong className="text-[var(--accent-light)]">10M SAMPLES</strong></span>
      </div>
    </div>
  );
}

