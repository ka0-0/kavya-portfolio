import React, { memo } from 'react';

const ConnectionLayer = memo(() => {
  return (
    <svg viewBox="0 0 1000 600" className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <defs>
        {/* Dotted Blueprint Grid */}
        <pattern id="blueprint-grid-v2" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6, 182, 212, 0.008)" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="1.0" fill="rgba(6, 182, 212, 0.04)" />
        </pattern>

        {/* Tapered Trace Gradients (from Core to Panels) */}
        <linearGradient id="taper-top" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="taper-bottom" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="taper-left" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="taper-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.03" />
        </linearGradient>

        {/* Energy Pulse Gradient */}
        <linearGradient id="pulse-grad-v2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Blueprint Grid Overlay */}
      <rect width="1000" height="600" fill="url(#blueprint-grid-v2)" />

      {/* Decorative Blueprint Micro-labels */}
      <g className="font-mono text-[8px] fill-cyan-400/40 opacity-[0.04] select-none" letterSpacing="2.5">
        <text x="50" y="40" textAnchor="start">SYS_REV: A.02</text>
        <text x="950" y="40" textAnchor="end">LAB-02 // SYSTEM_MATRIX</text>
        <text x="50" y="560" textAnchor="start">NODE_REF: INT_09</text>
        <text x="950" y="560" textAnchor="end">STATUS: SYNC_ONLINE</text>
        <text x="500" y="50" textAnchor="middle">V_AXIS [X: 500]</text>
        <text x="940" y="300" textAnchor="end">H_AXIS [Y: 300]</text>
        <text x="60" y="300" textAnchor="start">LOC_REF: 09/PORT</text>
      </g>

      {/* Tapered Structural Waveguide Paths */}
      {/* Top -> Frontend (Bottom edge of panel is y = 180, reactor top is y = 268) */}
      <polygon points="497,268 499,180 501,180 503,268" fill="url(#taper-top)" />
      {/* Bottom -> Tools (Top edge of panel is y = 420, reactor bottom is y = 332) */}
      <polygon points="497,332 499,420 501,420 503,332" fill="url(#taper-bottom)" />
      {/* Left -> Backend (Right edge of panel is x = 380, reactor left is x = 468) */}
      <polygon points="468,297 380,299 380,301 468,303" fill="url(#taper-left)" />
      {/* Right -> AI (Left edge of panel is x = 620, reactor right is x = 532) */}
      <polygon points="532,297 620,299 620,301 532,303" fill="url(#taper-right)" />

      {/* Static Waveguide central trace signals */}
      <line x1="500" y1="268" x2="500" y2="180" className="skills-line conn-core conn-frontend" stroke="rgba(6, 182, 212, 0.08)" strokeWidth="1" />
      <line x1="468" y1="300" x2="380" y2="300" className="skills-line conn-core conn-backend" stroke="rgba(6, 182, 212, 0.08)" strokeWidth="1" />
      <line x1="532" y1="300" x2="620" y2="300" className="skills-line conn-core conn-ai" stroke="rgba(6, 182, 212, 0.08)" strokeWidth="1" />
      <line x1="500" y1="332" x2="500" y2="420" className="skills-line conn-core conn-tools" stroke="rgba(6, 182, 212, 0.08)" strokeWidth="1" />

      {/* Travelling Energy Pulses */}
      {/* Top (Frontend) */}
      <path
        d="M 500 268 V 180"
        className="skills-pulse-path pulse-core pulse-frontend"
        fill="none"
        stroke="url(#pulse-grad-v2)"
        style={{ '--stagger-delay': '0ms' }}
      />
      {/* Bottom (Tools) */}
      <path
        d="M 500 332 V 420"
        className="skills-pulse-path pulse-core pulse-tools"
        fill="none"
        stroke="url(#pulse-grad-v2)"
        style={{ '--stagger-delay': '180ms' }}
      />
      {/* Left (Backend) */}
      <path
        d="M 468 300 H 380"
        className="skills-pulse-path pulse-core pulse-backend"
        fill="none"
        stroke="url(#pulse-grad-v2)"
        style={{ '--stagger-delay': '90ms' }}
      />
      {/* Right (AI) */}
      <path
        d="M 532 300 H 620"
        className="skills-pulse-path pulse-core pulse-ai"
        fill="none"
        stroke="url(#pulse-grad-v2)"
        style={{ '--stagger-delay': '90ms' }}
      />

      {/* Subtle copper junction points at endpoints */}
      <circle cx="500" cy="180" r="3" fill="#00f2fe" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="2" />
      <circle cx="500" cy="420" r="3" fill="#00f2fe" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="2" />
      <circle cx="380" cy="300" r="3" fill="#00f2fe" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="2" />
      <circle cx="620" cy="300" r="3" fill="#00f2fe" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="2" />
    </svg>
  );
});

export default ConnectionLayer;
