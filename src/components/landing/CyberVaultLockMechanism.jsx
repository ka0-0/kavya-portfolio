import React, { memo } from 'react';
import { motion } from 'framer-motion';

const CyberVaultLockMechanism = memo(
  function CyberVaultLockMechanism({
    progress = 0,
    isUnlocked = false,
    attemptCount = 0,
    isVerifying = false,
    isStruggling = false
  }) {
  // Calculate stroke dashoffset for circular progress ring (r=85, circumference=534.07)
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;
  const displayProgress = Math.floor(clampedProgress);

  // Determine ring speed & state styling
  let outerSpeed = 'animate-[radar-rotate_25s_linear_infinite]';
  let innerSpeed = 'animate-[radar-rotate_15s_linear_infinite_reverse]';

  if (isUnlocked) {
    outerSpeed = 'animate-[radar-rotate_1.2s_linear_infinite]';
    innerSpeed = 'animate-[radar-rotate_0.8s_linear_infinite_reverse]';
  } else if (isStruggling || attemptCount >= 3) {
    outerSpeed = 'animate-[radar-rotate_0.5s_linear_infinite]';
    innerSpeed = 'animate-[radar-rotate_0.3s_linear_infinite_reverse]';
  } else if (attemptCount === 2 || (isVerifying && attemptCount === 1)) {
    outerSpeed = 'animate-[radar-rotate_3s_linear_infinite]';
    innerSpeed = 'animate-[radar-rotate_2s_linear_infinite_reverse]';
  } else if (isVerifying) {
    outerSpeed = 'animate-[radar-rotate_6s_linear_infinite]';
    innerSpeed = 'animate-[radar-rotate_4s_linear_infinite_reverse]';
  }

  return (
    <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center justify-center ${isStruggling ? 'animate-micro-shake' : ''}`}>
      {/* 1. Cyber Vault Mechanical Locker Ring SVG */}
      <div className="relative w-[320px] h-[320px] flex items-center justify-center">
        {/* Cyan Energy Flood background glow during unlock */}
        {isUnlocked && (
          <div className="absolute inset-0 rounded-full bg-[var(--accent-color)]/20 shadow-[0_0_80px_rgba(var(--accent-rgb),0.85)] animate-cyan-flood pointer-events-none" />
        )}

        {/* Downward Scanline Sweep */}
        {(isVerifying || isUnlocked || isStruggling) && (
          <div className="absolute inset-4 overflow-hidden rounded-full z-20 pointer-events-none">
            <div className="w-full h-8 bg-gradient-to-b from-transparent via-[var(--accent-color)]/50 to-transparent animate-scanline-down" />
          </div>
        )}

        <svg className="w-[320px] h-[320px] overflow-visible" viewBox="0 0 240 240">
          <defs>
            <linearGradient id="vaultGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={attemptCount === 2 ? '#ef4444' : 'var(--accent-color, #00FF88)'} />
              <stop offset="50%" stopColor={attemptCount === 2 ? '#f87171' : 'var(--accent-light, #76FF03)'} />
              <stop offset="100%" stopColor={attemptCount === 2 ? '#dc2626' : 'var(--accent-color, #00F0FF)'} />
            </linearGradient>
            <filter id="gearShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Rotating Gear Tumblers */}
          <g stroke={isUnlocked ? 'var(--accent-color)' : attemptCount === 2 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(var(--accent-rgb, 0, 255, 136), 0.35)'} strokeWidth="1.4" fill="none">
            {/* Outer Dashed Gear Ring */}
            <circle
              cx="120"
              cy="120"
              r="110"
              strokeDasharray="4 8"
              className={outerSpeed}
              style={{ transformOrigin: 'center' }}
            />

            {/* Middle Counter-Rotating Tumbler Ring */}
            <circle
              cx="120"
              cy="120"
              r="98"
              strokeDasharray="12 6"
              className={innerSpeed}
              style={{ transformOrigin: 'center' }}
            />
          </g>

          {/* 0% to 100% Loading Progress Arc Ring */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke={attemptCount === 2 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(var(--accent-rgb, 0, 255, 136), 0.12)'}
            strokeWidth="6"
          />
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="url(#vaultGlow)"
            strokeWidth={isUnlocked ? '9' : '6'}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#gearShadow)"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: isStruggling ? 'none' : 'stroke-dashoffset 0.2s ease-out'
            }}
          />

          {/* Small Data Packets Traveling Around Ring */}
          {(isVerifying || isStruggling || isUnlocked) && (
            <g className={isStruggling ? 'animate-packet-orbit-fast' : 'animate-packet-orbit'}>
              <circle cx="120" cy="35" r="3" fill="var(--accent-color)" filter="drop-shadow(0 0 6px var(--accent-color))" />
              <circle cx="205" cy="120" r="2.5" fill="var(--accent-light)" filter="drop-shadow(0 0 6px var(--accent-light))" />
              <circle cx="120" cy="205" r="3" fill="var(--accent-color)" filter="drop-shadow(0 0 6px var(--accent-color))" />
              <circle cx="35" cy="120" r="2" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
            </g>
          )}

          {/* Inner Tumbler Notch Crosshair */}
          <g stroke={attemptCount === 2 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(var(--accent-rgb, 0, 255, 136), 0.45)'} strokeWidth="1">
            <line x1="120" y1="15" x2="120" y2="30" />
            <line x1="120" y1="210" x2="120" y2="225" />
            <line x1="15" y1="120" x2="30" y2="120" />
            <line x1="210" y1="120" x2="225" y2="120" />
          </g>
        </svg>

        {/* Digital Sparks / Glitch Particles in Attempt 3 & Unlock */}
        {(isStruggling || isUnlocked) && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                animate={{
                  opacity: [1, 0.8, 0],
                  scale: [0.5, 1.5, 0],
                  x: (i % 2 === 0 ? 1 : -1) * (20 + i * 15),
                  y: (i < 3 ? -1 : 1) * (20 + i * 12)
                }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00ffff]"
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Decryption Percentage Badge below AI Core Orb */}
      <div className="absolute top-[230px] flex flex-col items-center font-mono">
        <motion.div
          animate={isUnlocked ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5 }}
          className={`px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-2 border transition-colors duration-300 ${isUnlocked
            ? 'bg-[var(--accent-color)]/30 border-[var(--accent-color)] shadow-[0_0_25px_rgba(var(--accent-rgb),0.75)]'
            : attemptCount === 2
              ? 'bg-red-950/80 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
              : 'bg-black/80 border-[var(--accent-color)]/40 shadow-[0_0_15px_rgba(var(--accent-rgb),0.25)]'
            }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${isUnlocked
              ? 'bg-[var(--accent-light)] shadow-[0_0_8px_var(--accent-light)]'
              : attemptCount === 2
                ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping'
                : 'bg-[var(--accent-color)] animate-ping'
              }`}
          />
          <span
            className={`text-xs font-extrabold tracking-widest ${isUnlocked
              ? 'text-[var(--accent-light)]'
              : attemptCount === 2
                ? 'text-red-400'
                : 'text-[var(--accent-color)]'
              }`}
          >
            {isUnlocked ? 'ROOT ACCESS GRANTED' : `HACK MATCH: ${displayProgress}%`}
          </span>
        </motion.div>

        {/* Warning Indicator Badge on Attempt 2 */}
        {attemptCount === 2 && !isUnlocked && (
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[9px] font-mono text-red-400 font-bold tracking-widest mt-1 bg-red-950/90 px-2 py-0.5 rounded border border-red-500/40"
          >
            ⚠️ AI DEFENSE COUNTERMEASURES ACTIVE
          </motion.span>
        )}
      </div>
    </div>
  );
},
(prevProps, nextProps) => {
  return (
    Math.floor(prevProps.progress) === Math.floor(nextProps.progress) &&
    prevProps.isUnlocked === nextProps.isUnlocked &&
    prevProps.attemptCount === nextProps.attemptCount &&
    prevProps.isVerifying === nextProps.isVerifying &&
    prevProps.isStruggling === nextProps.isStruggling
  );
});

export default CyberVaultLockMechanism;
