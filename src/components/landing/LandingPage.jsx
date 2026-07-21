import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame, AnimatePresence } from 'framer-motion';
import AIKAVCore from '../effects/AIKAVCore';
import { useTheme } from '../theme/ThemeContext';
import { KAVAI_DIALOGUE_POOL } from '../../data/kavaiDialogue';
import HolographicProjection from './HolographicProjection';
import '../../styles/holographicProjection.css';
import '../../styles/cyberLabLanding.css';

// Cyber Intelligence Laboratory Background using custom generated bg, Vault Lock & Laser Connectors
import CyberLabImageBackground from './CyberLabImageBackground';
import CyberVaultLockMechanism from './CyberVaultLockMechanism';
import HoloLaserConnectors from './HoloLaserConnectors';
import TacticalNotifications from './TacticalNotifications';

// 7 Ultra-Crisp Hacker HUD Panels
import FingerprintPanel from './panels/FingerprintPanel';
import AISecurityVaultPanel from './panels/AISecurityVaultPanel';
import KavyaIdentityPanel from './panels/KavyaIdentityPanel';
import SatelliteTrackingPanel from './panels/SatelliteTrackingPanel';
import ThreatDetectionPanel from './panels/ThreatDetectionPanel';
import DataStreamPanel from './panels/DataStreamPanel';
import SystemDiagnosticsPanel from './panels/SystemDiagnosticsPanel';
import AICoreStatusPanel from './panels/AICoreStatusPanel';

const THEME_DETAILS = [
  { code: 'blue', name: 'Blue', color: '#22d3ee', shadow: '0 0 16px rgba(34, 211, 238, 0.75)' },
  { code: 'black', name: 'Black', color: '#ffffff', shadow: '0 0 16px rgba(255, 255, 255, 0.75)' },
  { code: 'pink', name: 'Pink', color: '#ec4899', shadow: '0 0 16px rgba(236, 72, 153, 0.75)' },
  { code: 'purple', name: 'Purple', color: '#a855f7', shadow: '0 0 16px rgba(168, 85, 247, 0.75)' },
  { code: 'orange', name: 'Orange', color: '#FF8C00', shadow: '0 0 16px rgba(255, 140, 0, 0.75)' },
  { code: 'red', name: 'Red', color: '#ef4444', shadow: '0 0 16px rgba(239, 68, 68, 0.75)' },
  { code: 'green', name: 'Green', color: '#00FF88', shadow: '0 0 16px rgba(0, 255, 136, 0.75)' }
];

const ThemeIcons = {
  blue: (
    <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
      <circle cx="7" cy="7" r="1.2" />
      <circle cx="17" cy="17" r="1.2" />
      <circle cx="7" cy="17" r="1.2" />
      <circle cx="17" cy="7" r="1.2" />
    </svg>
  ),
  black: (
    <div className="flex items-center gap-[2.5px]">
      <div className="w-1.5 h-1.5 rounded-full bg-black flex items-center justify-center">
        <div className="w-0.5 h-0.5 rounded-full bg-white" />
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-black flex items-center justify-center">
        <div className="w-0.5 h-0.5 rounded-full bg-white" />
      </div>
    </div>
  ),
  pink: (
    <svg className="w-4 h-4 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="6" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
    </svg>
  ),
  purple: (
    <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4a8 8 0 0 1 7.75 6" strokeLinecap="round" />
      <path d="M12 20a8 8 0 0 1-7.75-6" strokeLinecap="round" />
      <path d="M12 8a4 4 0 0 1 3.5 2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  orange: (
    <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="4" r="1.2" />
      <circle cx="12" cy="20" r="1.2" />
      <circle cx="4" cy="12" r="1.2" />
      <circle cx="20" cy="12" r="1.2" />
      <circle cx="6.34" cy="6.34" r="1.2" />
      <circle cx="17.66" cy="17.66" r="1.2" />
      <circle cx="6.34" cy="17.66" r="1.2" />
      <circle cx="17.66" cy="6.34" r="1.2" />
    </svg>
  ),
  red: (
    <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12h16M12 4v16" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="8" strokeDasharray="2 3" />
    </svg>
  ),
  green: (
    <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-25 12 12)" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  )
};

function LandingPillDock({ onBegin }) {
  const { currentThemeIndex, setTheme, nextTheme, previousTheme } = useTheme();
  const activeColor = THEME_DETAILS[currentThemeIndex]?.color || '#00FF88';

  return (
    <div className="fixed bottom-[68px] md:bottom-[80px] left-1/2 -translate-x-1/2 z-30 select-none pointer-events-auto">
      <div className="flex items-center gap-2 sm:gap-3 bg-black/90 backdrop-blur-xl border border-[var(--accent-color)]/30 rounded-full px-3 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(var(--accent-rgb),0.2)] transition-all duration-300">

        <button
          onClick={previousTheme}
          aria-label="Previous Theme"
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-white/5"
        >
          ‹
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 px-1">
          {THEME_DETAILS.map((t, idx) => {
            const isActive = idx === currentThemeIndex;
            return (
              <button
                key={t.name}
                onClick={() => setTheme(idx)}
                aria-label={`Select ${t.name} Theme`}
                title={`${t.name} Theme`}
                className={`relative rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${isActive
                  ? 'w-9 h-9 sm:w-10 sm:h-10 scale-105 shadow-lg'
                  : 'w-7 h-7 sm:w-8 sm:h-8 opacity-55 hover:opacity-100 hover:scale-110'
                  }`}
                style={{
                  backgroundColor: isActive ? (t.code === 'black' ? '#ffffff' : t.color) : 'rgba(255, 255, 255, 0.08)',
                  border: isActive ? `2px solid ${t.color}` : '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: isActive ? t.shadow : 'none',
                }}
              >
                {t.code === 'black' ? (
                  <div className="flex items-center gap-[2.5px] select-none pointer-events-none">
                    <div className={`rounded-full bg-black flex items-center justify-center ${isActive ? 'w-2 h-2' : 'w-1.5 h-1.5'}`}>
                      <div className="w-0.5 h-0.5 rounded-full bg-white" />
                    </div>
                    <div className={`rounded-full bg-black flex items-center justify-center ${isActive ? 'w-2 h-2' : 'w-1.5 h-1.5'}`}>
                      <div className="w-0.5 h-0.5 rounded-full bg-white" />
                    </div>
                  </div>
                ) : (
                  <div className={isActive ? 'text-black/85 filter drop-shadow-sm' : ''}>
                    {ThemeIcons[t.code]}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={nextTheme}
          aria-label="Next Theme"
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-white/5"
        >
          ›
        </button>

        <div className="w-[1px] h-6 bg-white/20 mx-1 sm:mx-1.5" />

        <button
          onClick={onBegin}
          className="group relative px-5 py-2.5 rounded-full font-sans text-xs sm:text-[13px] font-semibold tracking-wide text-black transition-all duration-300 cursor-pointer shadow-[0_0_18px_rgba(var(--accent-rgb),0.35)] hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.7)] hover:scale-[1.04] active:scale-[0.98] border border-[var(--accent-color)]/40 whitespace-nowrap flex items-center gap-1.5 overflow-hidden cyber-enter-btn-glow"
          style={{
            backgroundColor: activeColor,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
          <span className="relative z-10 font-bold">Enter Portfolio</span>
          <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-200 font-bold">&rarr;</span>
        </button>

      </div>
    </div>
  );
}

function PortfolioHeader() {
  const headingRef = useRef(null);
  const letterRefs = useRef([]);
  const letterFactorsRef = useRef([]);
  const lastFrameRef = useRef(0);
  const mousePositionRef = useRef({ x: -99999, y: -99999 });
  const isNearRef = useRef(false);

  const word1 = "PORTFOLIO".split("");
  const word2 = "2026".split("");

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReduced || isTouch) return;

    const updatePosition = (clientX, clientY) => {
      const el = headingRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mousePositionRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
      isNearRef.current = true;
    };

    const handleMouseMove = (ev) => {
      updatePosition(ev.clientX, ev.clientY);
    };

    const handleMouseLeave = () => {
      mousePositionRef.current = { x: -99999, y: -99999 };
      isNearRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useAnimationFrame((now) => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReduced || isTouch) return;

    const container = headingRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const mx = mousePositionRef.current.x;
    const my = mousePositionRef.current.y;

    const prevT = lastFrameRef.current || now;
    const dtSec = Math.min(0.1, Math.max(0, (now - prevT) / 1000));
    lastFrameRef.current = now;

    const tau = 0.25;
    const a = 1 - Math.exp(-dtSec / tau);
    const reach = 220;

    for (let i = 0; i < letterRefs.current.length; i++) {
      const letterEl = letterRefs.current[i];
      if (!letterEl) continue;

      const rect = letterEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2 - containerRect.left;
      const cy = rect.top + rect.height / 2 - containerRect.top;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const target = isNearRef.current ? Math.min(Math.max(1 - dist / reach, 0), 1) : 0;
      const prev = letterFactorsRef.current[i] || 0;
      const f = prev + (target - prev) * a;
      letterFactorsRef.current[i] = f;

      const fromWeight = 900;
      const toWeight = 300;

      if (f < 0.001) {
        const fromSettings = `'wght' ${fromWeight}`;
        if (letterEl.style.fontVariationSettings !== fromSettings) {
          letterEl.style.fontVariationSettings = fromSettings;
        }
      } else {
        const w = Math.round(fromWeight + (toWeight - fromWeight) * f);
        letterEl.style.fontVariationSettings = `'wght' ${w}`;
      }
    }
  });

  return (
    <div
      ref={headingRef}
      className="mb-2 md:mb-3 flex items-center gap-4 select-none pointer-events-auto cursor-default"
      style={{ filter: 'drop-shadow(0 0 25px rgba(var(--accent-rgb), 0.45))' }}
    >
      <div className="flex">
        {word1.map((char, idx) => (
          <span key={idx} className="relative inline-flex flex-col items-start select-none">
            <span
              ref={(el) => { letterRefs.current[idx] = el; }}
              style={{ fontWeight: 900, fontVariationSettings: '"wght" 900' }}
              className="hero-name-typography hero-letter hero-letter-white text-white inline-block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.9] hover:!transform-none"
            >
              {char}
            </span>
            <span
              className="hero-name-typography invisible select-none h-0 pointer-events-none text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
              style={{ fontWeight: 900, fontVariationSettings: '"wght" 900' }}
            >
              {char}
            </span>
          </span>
        ))}
      </div>

      <div className="flex">
        {word2.map((char, idx) => (
          <span key={idx} className="relative inline-flex flex-col items-start select-none">
            <span
              ref={(el) => { letterRefs.current[word1.length + idx] = el; }}
              style={{ fontWeight: 900, fontVariationSettings: '"wght" 900' }}
              className="hero-name-typography hero-letter marquee-filled-gradient inline-block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.9] hover:!transform-none"
            >
              {char}
            </span>
            <span
              className="hero-name-typography invisible select-none h-0 pointer-events-none text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
              style={{ fontWeight: 900, fontVariationSettings: '"wght" 900' }}
            >
              {char}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function HeaderContainer() {
  return (
    <div className="hidden md:flex flex-col items-center absolute left-1/2 -translate-x-1/2 top-[8%] md:top-[10%] z-20 select-none pointer-events-none">
      <PortfolioHeader />
      <div className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-[var(--accent-color)]/90 font-semibold uppercase bg-black/60 border border-[var(--accent-color)]/30 px-3.5 py-1 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)]">
        // AI ENGINEER • MECHANICAL ENGINEER • INNOVATOR
      </div>
    </div>
  );
}

export default function LandingPage({ onBegin }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const frameRef = useRef(null);
  const coreWrapperRef = useRef(null);

  // Decryption Loader Progress (0% to 100%) & Sequential Beam Target Step (0 -> 6)
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [activeScanStep, setActiveScanStep] = useState(0);
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [vaultPhase, setVaultPhase] = useState('idle');

  const [projectionState, setProjectionState] = useState('typing');
  const [selectedDialogue, setSelectedDialogue] = useState(
    "Target 1/7: Biometric Fingerprint Verification."
  );

  // Refs for smooth 60 FPS animation loop without stale closure issues
  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const activeScanStepRef = useRef(0);
  const isAccessGrantedRef = useRef(false);
  const lastProgressIntRef = useRef(-1);

  const handleVaultPhaseChange = React.useCallback((phaseName, targetPercent) => {
    setVaultPhase(phaseName || 'IDLE');

    if (phaseName === 'HACKING') {
      targetProgressRef.current = targetPercent || 0;
    } else if (phaseName === 'FAILED') {
      targetProgressRef.current = 0;
      currentProgressRef.current = 0;
      setDecryptProgress(0);
    }
  }, []);

  const handleVaultUnlock = React.useCallback(() => {
    isAccessGrantedRef.current = true;
    targetProgressRef.current = 100;
    currentProgressRef.current = 100;
    setDecryptProgress(100);
    setIsAccessGranted(true);
    setVaultPhase('SUCCESS');
    setSelectedDialogue("YOU ARE ENTERING INTO KAVYA'S PORTFOLIO.\nVAULT DECRYPTED // HACKING COMPLETE // ACCESS GRANTED");
    setProjectionState('typing');
  }, []);

  // 60 FPS Frame-Rate-Independent Continuous Boot Loading Engine
  useEffect(() => {
    const SCAN_MESSAGES = [
      "Target 1/7: Biometric Fingerprint Verification.",
      "Target 2/7: Injecting AI Payload & Live Code Feed.",
      "Target 3/7: Authenticating Kavya Makhan Core Identity.",
      "Target 4/7: Encrypting Satellite GPS Location Link.",
      "Target 5/7: Scanning Cyber SOC Defense & Firewall.",
      "Target 6/7: Streaming Raw Memory Hex Buffer.",
      "Target 7/7: Verifying AI Telemetry & Hardware Cores.",
    ];

    let animFrameId;
    let lastTime = performance.now();
    let accumulatedTime = 0;
    const TOTAL_BOOT_DURATION = 12.0; // 12 seconds synchronized with 3-attempt AI Security Vault sequence

    // Non-linear continuous progress generator:
    const calculateTargetProgress = (timeSec) => {
      const u = Math.min(1.0, Math.max(0, timeSec / TOTAL_BOOT_DURATION));
      if (u <= 0) return 0;
      if (u >= 1.0) return 95; // Hold at 95% until Vault Attempt 3 unlocks!

      let p;
      if (u < 0.25) {
        // Fast start (0% to 35%) using easeOutCubic
        const t = u / 0.25;
        const eased = 1 - Math.pow(1 - t, 3);
        p = eased * 35;
      } else if (u < 0.80) {
        // Detailed diagnostic scanning (35% to 80%)
        const t = (u - 0.25) / 0.55;
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
        p = 35 + eased * 45;
      } else {
        // Smooth finish to 95% (80% to 95%) using easeOutQuad
        const t = (u - 0.80) / 0.20;
        const eased = 1 - Math.pow(1 - t, 2);
        p = 80 + eased * 15;
      }
      return p;
    };

    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isAccessGrantedRef.current) {
        accumulatedTime += dt;
        const calcP = calculateTargetProgress(accumulatedTime);
        if (calcP > targetProgressRef.current) {
          targetProgressRef.current = calcP;
        }

        const lerpFactor = 1 - Math.exp(-dt * 14);
        currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * lerpFactor;

        const currentP = currentProgressRef.current;
        const roundedP = Math.floor(currentP);
        if (roundedP !== lastProgressIntRef.current) {
          lastProgressIntRef.current = roundedP;
          setDecryptProgress(roundedP);
        }

        const stepIndex = Math.min(6, Math.floor((currentP / 100) * 7));
        if (stepIndex !== activeScanStepRef.current && stepIndex <= 6) {
          activeScanStepRef.current = stepIndex;
          setActiveScanStep(stepIndex);
          setSelectedDialogue(SCAN_MESSAGES[stepIndex]);
          setProjectionState('typing');
        }
      }

      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  // AUTO-ENTER MAIN SITE ONCE DECRYPTION IS COMPLETE (100% / ACCESS GRANTED)
  useEffect(() => {
    if (isAccessGranted) {
      const autoEnterTimer = setTimeout(() => {
        onBegin();
      }, 1400); // Wait 1.4s after "VAULT DECRYPTED // ACCESS GRANTED" banner appears, then auto-enter
      return () => clearTimeout(autoEnterTimer);
    }
  }, [isAccessGranted, onBegin]);

  // ENTER MAIN SITE ONLY ON ENTER KEYPRESS (ONLY IF ACCESS ALREADY GRANTED)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && isAccessGrantedRef.current) {
        onBegin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBegin]);

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const W = size.width;
  const H = size.height;
  const C = 16;

  // Anchors for 7 HUD Panels (Targeting exact top-left corner brackets)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const panelAnchors = isDesktop && size.width && size.height ? [
    { x: size.width * 0.03 + 12, y: size.height * 0.15 + 12 },          // Box 0: Fingerprint
    { x: size.width * 0.97 - 320 + 12, y: size.height * 0.08 + 12 },    // Box 1: AI Security Vault
    { x: size.width * 0.03 + 12, y: size.height * 0.58 + 12 },          // Box 2: Kavya Identity
    { x: size.width * 0.97 - 593, y: size.height * 0.71 + 12 },         // Box 3: Visual Processor Panel (AICoreStatusPanel)
    { x: size.width * 0.97 - 258, y: size.height * 0.64 + 12 },         // Box 7: Satellite Tracking Panel
    { x: size.width * 0.26 + 12, y: size.height * 0.20 + 12 },          // Box 4: Threat SOC
    { x: size.width * 0.74 - 280 + 12, y: size.height * 0.20 + 12 },    // Box 5: Data Stream
    { x: size.width * 0.36 - 123, y: size.height * 0.63 + 12 },         // Box 6: System Diagnostics
  ] : [];

  // Derived Lock Mechanism Flags
  const isLockScanning = vaultPhase === 'HACKING';
  const isLockFrozen = vaultPhase === 'FAILED';
  const isLockFailure = vaultPhase === 'FAILED';
  const isLockStruggling = vaultPhase === 'HACKING';
  const lockAttemptCount = vaultPhase === 'FAILED' ? 2 : 0;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
      className="fixed inset-0 w-full h-full bg-[#020704] text-white flex flex-col justify-between p-8 md:p-10 z-[1000] overflow-hidden select-none"
    >
      {/* 1. Cyber Laboratory Image Background */}
      <CyberLabImageBackground />

      {/* 2. Central Cyber Vault Locker Mechanism (0% to 100% Loader) */}
      <CyberVaultLockMechanism
        progress={isLockFailure ? 0 : decryptProgress}
        isUnlocked={isAccessGranted}
        isScanning={isLockScanning}
        isFrozen={isLockFrozen}
        isFailure={isLockFailure}
        isStruggling={isLockStruggling}
        attemptCount={lockAttemptCount}
      />

      {/* 3. Single Scanning Laser Beam Targeting Active Box */}
      {isDesktop && (
        <HoloLaserConnectors
          panels={panelAnchors}
          activeStep={activeScanStep}
          isAccessGranted={isAccessGranted}
        />
      )}

      {/* 4. Dynamic Micro-Notifications Toast Queue */}
      <TacticalNotifications />

      {/* 5. Futuristic HUD Chamfer Frame */}
      <div ref={frameRef} className="absolute inset-6 md:inset-8 pointer-events-none z-10">
        {W && H && (
          <svg
            className="w-full h-full"
            style={{
              overflow: 'visible',
              filter: 'drop-shadow(0 0 3px rgba(var(--accent-rgb), 0.3))'
            }}
            width="100%"
            height="100%"
          >
            <g stroke="rgba(var(--accent-rgb), 0.15)" strokeWidth="1" fill="none">
              <line x1={C + 1} y1={1} x2={W - C - 1} y2={1} />
              <line x1={W - 1} y1={C + 1} x2={W - 1} y2={H - C - 1} />
              <line x1={C + 1} y1={H - 1} x2={W - C - 1} y2={H - 1} />
              <line x1={1} y1={C + 1} x2={1} y2={H - C - 1} />
            </g>
            <g stroke="rgba(var(--accent-rgb), 0.65)" strokeWidth="1.5" fill="none">
              <line x1={1} y1={C + 1} x2={C + 1} y2={1} />
              <line x1={W - C - 1} y1={1} x2={W - 1} y2={C + 1} />
              <line x1={W - 1} y1={H - C - 1} x2={W - C - 1} y2={H - 1} />
              <line x1={C + 1} y1={H - 1} x2={1} y2={H - C - 1} />
            </g>
            <g stroke="rgba(var(--accent-rgb), 0.65)" strokeWidth="1">
              <line x1={-5} y1={H * 0.2} x2={7} y2={H * 0.2} />
              <line x1={1} y1={H * 0.2 - 6} x2={1} y2={H * 0.2 + 6} />
              <line x1={-5} y1={H * 0.8} x2={7} y2={H * 0.8} />
              <line x1={1} y1={H * 0.8 - 6} x2={1} y2={H * 0.8 + 6} />
              <line x1={W - 7} y1={H * 0.2} x2={W + 5} y2={H * 0.2} />
              <line x1={W - 1} y1={H * 0.2 - 6} x2={W - 1} y2={H * 0.2 + 6} />
              <line x1={W - 7} y1={H * 0.8} x2={W + 5} y2={H * 0.8} />
              <line x1={W - 1} y1={H * 0.8 - 6} x2={W - 1} y2={H * 0.8 + 6} />
            </g>
          </svg>
        )}
      </div>

      {/* HEADER SPACE */}
      <header className="relative w-full h-[38px] z-20 pointer-events-none" />

      {/* 6. DRAMATIC "VAULT DECRYPTED // ACCESS GRANTED" BANNER */}
      <AnimatePresence>
        {isAccessGranted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="fixed top-[25%] left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center"
          >
            <div className="bg-[var(--accent-color)]/20 border-2 border-[var(--accent-color)] backdrop-blur-xl px-6 py-2 rounded-xl shadow-[0_0_40px_rgba(var(--accent-rgb),0.6)] text-center">
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-[var(--accent-light)] tracking-widest drop-shadow-[0_0_15px_var(--accent-color)]">
                VAULT DECRYPTED // ACCESS GRANTED
              </div>
              <div className="text-xs font-mono text-white/80 tracking-wider mt-0.5">
                ENTERING KAVYA MAKHAN'S PORTFOLIO...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. 7 PRO HACKER HUD SCREENS (DESKTOP LAYOUT) */}
      <div className="hidden lg:block absolute inset-0 z-20 pointer-events-none">
        {/* Box 0 (Step 0): Biometric Fingerprint Sensing */}
        <FingerprintPanel
          isScanning={activeScanStep === 0}
          isComplete={isAccessGranted || activeScanStep > 0}
          style={{ left: '3%', top: '15%' }}
        />

        {/* Box 1 (Step 1): AI Security Vault Terminal */}
        <AISecurityVaultPanel
          isScanning={activeScanStep === 1}
          isComplete={isAccessGranted}
          progress={decryptProgress}
          onPhaseChange={handleVaultPhaseChange}
          onAttemptSubmit={handleVaultPhaseChange}
          onUnlock={handleVaultUnlock}
          style={{ right: '3%', top: '8%' }}
        />

        {/* Box 2 (Step 2): Kavya Personal Details & Credentials */}
        <KavyaIdentityPanel
          isScanning={activeScanStep === 2}
          isComplete={isAccessGranted || activeScanStep > 2}
          style={{ left: '3%', top: '58%' }}
        />

        {/* Box 3 (Step 3): Satellite Location Map Trace */}
        <SatelliteTrackingPanel
          isScanning={activeScanStep === 3}
          isComplete={isAccessGranted || activeScanStep > 3}
          style={{ right: '3%', top: '64%' }}
        />

        {/* AI Core Status Panel (Positioned directly LEFT of Satellite Location Map) */}
        <AICoreStatusPanel
          isComplete={isAccessGranted}
          style={{ right: 'calc(3% + 335px)', top: '71%' }}
        />

        {/* Box 4 (Step 4): Threat Detection SOC Defense */}
        <ThreatDetectionPanel
          isScanning={activeScanStep === 4}
          isComplete={isAccessGranted || activeScanStep > 4}
          style={{ left: '26%', top: '20%' }}
        />

        {/* Box 5 (Step 5): Raw Hex Data Stream */}
        <DataStreamPanel
          isScanning={activeScanStep === 5}
          isComplete={isAccessGranted || activeScanStep > 5}
          style={{ right: '26%', top: '20%' }}
        />

        {/* Box 6 (Step 6): System Telemetry & AI Core Diagnostics */}
        <SystemDiagnosticsPanel
          isScanning={activeScanStep === 6}
          isComplete={isAccessGranted || activeScanStep > 6}
          style={{ left: '36%', top: '63%', transform: 'translateX(-50%)' }}
        />
      </div>

      {/* MOBILE / TABLET CAROUSEL LAYOUT */}
      {!isDesktop && (
        <div className="block lg:hidden absolute bottom-[140px] left-4 right-4 z-20 overflow-x-auto cyber-scrollbar pointer-events-auto">
          <div className="flex gap-3 w-max pb-2">
            <FingerprintPanel isComplete={true} />
            <AISecurityVaultPanel
              isScanning={activeScanStep === 1}
              isComplete={isAccessGranted}
              progress={decryptProgress}
              onPhaseChange={handleVaultPhaseChange}
              onAttemptSubmit={handleVaultPhaseChange}
              onUnlock={handleVaultUnlock}
            />
            <KavyaIdentityPanel isComplete={true} />
            <AICoreStatusPanel isComplete={true} />
            <SatelliteTrackingPanel isComplete={true} />
            <ThreatDetectionPanel isComplete={true} />
            <DataStreamPanel isComplete={true} />
            <SystemDiagnosticsPanel isComplete={true} />
          </div>
        </div>
      )}

      {/* 8. CENTRAL AI CORE ORB & DIALOGUE SYSTEM */}
      <div
        ref={coreWrapperRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
        style={{
          filter: 'drop-shadow(0 0 35px rgba(var(--accent-rgb), 0.65))',
          transition: 'filter 400ms ease-in-out',
        }}
      >
        {projectionState !== 'idle' && (
          <div className="hologram-projection-wrapper">
            <HolographicProjection
              text={selectedDialogue}
              state={projectionState}
              onTypewriterComplete={() => setProjectionState('holding')}
            />
          </div>
        )}
        <AIKAVCore
          size={140}
          lookDirection={
            (projectionState !== 'idle' && projectionState !== 'concluding')
              ? { x: 0, y: -6.5 }
              : null
          }
          className={`state-${projectionState}`}
        />
      </div>

      {/* 9. PORTFOLIO 2026 HERO HEADER */}
      <HeaderContainer />

      {/* FOOTER SPACE */}
      <footer className="relative w-full h-[20px] z-20 pointer-events-none" />
    </motion.div>
  );
}
