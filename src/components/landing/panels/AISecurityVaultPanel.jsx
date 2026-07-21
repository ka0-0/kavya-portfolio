import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Audio feedback synthesizing sci-fi sound effects via Web Audio API (Lazy Singleton)
let globalAudioCtx = null;
const getAudioContext = () => {
  if (!globalAudioCtx && typeof window !== 'undefined') {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) globalAudioCtx = new AudioCtx();
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

const playAudioFX = (type) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'struggle') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(850, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'unlock') {
      const freqs = [440, 659.25, 880, 1318.51];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.35);
      });
    }
  } catch (e) {
    // Ignore audio policy restrictions
  }
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export default function AISecurityVaultPanel({
  className = '',
  isScanning = false,
  isComplete = false,
  progress = 0,
  onPhaseChange = () => {},
  onUnlock = () => {},
  onAttemptSubmit = () => {},
  style = {}
}) {
  const [code, setCode] = useState('');
  // Formal Finite State Machine: 'IDLE' | 'ENTERING_CODE' | 'HACKING' | 'FAILED' | 'SUCCESS'
  const [vaultState, setVaultState] = useState('IDLE');
  const [failureCount, setFailureCount] = useState(0);
  const [panelProgress, setPanelProgress] = useState(0);
  const [hackingSubstep, setHackingSubstep] = useState('CONNECTING'); // 'CONNECTING' | 'BYPASSING' | 'DECRYPTING' | 'VERIFYING'
  const [pressedBtn, setPressedBtn] = useState(null); // Active button visual glow during auto-typing

  const isProcessingRef = useRef(false);
  const autoHackingStartedRef = useRef(false);
  const progressAnimRef = useRef(null);
  const failedHoldTimerRef = useRef(null);

  // Safe callback notifier
  const notifyPhaseChange = useCallback((stateName, progressPercent) => {
    if (typeof onPhaseChange === 'function') {
      try {
        onPhaseChange(stateName, progressPercent);
      } catch (e) {
        // Ignore callback errors
      }
    }
  }, [onPhaseChange]);

  const notifyUnlock = useCallback(() => {
    if (typeof onUnlock === 'function') {
      try {
        onUnlock();
      } catch (e) {
        // Ignore callback errors
      }
    }
  }, [onUnlock]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      if (failedHoldTimerRef.current) clearTimeout(failedHoldTimerRef.current);
    };
  }, []);

  // Auto unlock ONLY if explicit complete signal is given and vault is not in active hacking or failure
  useEffect(() => {
    if (isComplete && vaultState !== 'SUCCESS' && vaultState !== 'HACKING' && vaultState !== 'FAILED') {
      setVaultState('SUCCESS');
      playAudioFX('unlock');
      notifyUnlock();
    }
  }, [isComplete, vaultState, notifyUnlock]);

  // FSM STATE TRANSITION: HACKING (1.4s 60 FPS animation loop)
  const startHackingSequence = useCallback((overrideAttemptIdx) => {
    if (isProcessingRef.current && overrideAttemptIdx === undefined) return;
    isProcessingRef.current = true;

    setVaultState('HACKING');
    setHackingSubstep('CONNECTING');
    notifyPhaseChange('HACKING', 10);
    playAudioFX('click');

    const currentAttempt = overrideAttemptIdx !== undefined ? overrideAttemptIdx : failureCount;
    const targetP = currentAttempt === 0 ? 85 : currentAttempt === 1 ? 95 : 100;
    const durationMs = 1400;
    const startTime = performance.now();

    return new Promise((resolve) => {
      const animateStep = (now) => {
        const elapsed = now - startTime;
        const progressRatio = Math.min(1.0, elapsed / durationMs);

        // Substep text updates over time
        if (elapsed < 300) {
          setHackingSubstep('CONNECTING');
        } else if (elapsed < 700) {
          setHackingSubstep('BYPASSING');
        } else if (elapsed < 1100) {
          setHackingSubstep('DECRYPTING');
        } else {
          setHackingSubstep('VERIFYING');
        }

        // Smooth progress calculation (ease-out cubic)
        const currentP = targetP * (1 - Math.pow(1 - progressRatio, 3));
        setPanelProgress(currentP);

        if (progressRatio < 1.0) {
          progressAnimRef.current = requestAnimationFrame(animateStep);
        } else {
          // HACKING animation finished! Determine FSM transition:
          setPanelProgress(targetP);

          if (currentAttempt < 2) {
            // Transitions to FAILED state!
            setVaultState('FAILED');
            notifyPhaseChange('FAILED', 0);
          } else {
            // Transitions to EXISTING SUCCESS state!
            setVaultState('SUCCESS');
            notifyPhaseChange('SUCCESS', 100);
            playAudioFX('unlock');
            notifyUnlock();
          }
          resolve();
        }
      };

      progressAnimRef.current = requestAnimationFrame(animateStep);
    });
  }, [failureCount, notifyPhaseChange, notifyUnlock]);

  // FSM STATE TRANSITION: FAILED (Hold visible on screen for 1.6 seconds in bold red)
  useEffect(() => {
    if (vaultState === 'FAILED') {
      playAudioFX('error');
      setPanelProgress(0);

      // Hold FAILED state visible on screen for 1600ms (1.6 seconds)
      failedHoldTimerRef.current = setTimeout(() => {
        setFailureCount((prev) => prev + 1);
        setCode('');
        setVaultState('IDLE');
        notifyPhaseChange('IDLE', 0);
        isProcessingRef.current = false;
      }, 1600);

      return () => {
        if (failedHoldTimerRef.current) clearTimeout(failedHoldTimerRef.current);
      };
    }
  }, [vaultState, notifyPhaseChange]);

  // Keep startHackingSequence in a ref for stable execution in async loop
  const startHackingSequenceRef = useRef(startHackingSequence);
  useEffect(() => {
    startHackingSequenceRef.current = startHackingSequence;
  });

  // AUTOMATED 3-ATTEMPT HACKING CONTROLLER (Runs ONCE per mount)
  useEffect(() => {
    let isCancelled = false;

    const passcodes = [
      ['4', '8', '1', '9', '3', '7'], // Attempt 1 -> FAILS with bold red error
      ['9', '2', '0', '5', '7', '4'], // Attempt 2 -> FAILS with bold red error
      ['7', '7', '7', '9', '9', '9']  // Attempt 3 -> SUCCESS & ENTERS INTO SITE
    ];

    const simulateTypingPasscode = async (passcodeDigits) => {
      if (isCancelled) return;

      // Type digits one by one with tactile clicks and button glows
      for (let i = 0; i < passcodeDigits.length; i++) {
        if (isCancelled) return;
        const digit = passcodeDigits[i];

        setPressedBtn(digit);
        setCode((prev) => prev + digit);
        setVaultState('ENTERING_CODE');
        playAudioFX('click');

        await delay(75);
        setPressedBtn(null);
        await delay(65);
      }

      // Highlight ENTER key and submit
      if (isCancelled) return;
      setPressedBtn('ENTER');
      playAudioFX('click');
      await delay(150);
      setPressedBtn(null);
    };

    const runAutomatedHackingFlow = async () => {
      // 1. Initial 0.6-second pause after panel loads
      await delay(600);

      // --- ATTEMPT 1 ---
      if (isCancelled) return;
      await simulateTypingPasscode(passcodes[0]);
      if (isCancelled) return;
      await startHackingSequenceRef.current(0); // Runs 1.4s hacking animation
      // Wait for 1.6s FAILED bold red error screen hold + reset
      await delay(1700);

      // --- 0.8 SECONDS PAUSE BEFORE ATTEMPT 2 ---
      if (isCancelled) return;
      await delay(800);

      // --- ATTEMPT 2 ---
      if (isCancelled) return;
      await simulateTypingPasscode(passcodes[1]);
      if (isCancelled) return;
      await startHackingSequenceRef.current(1); // Runs 1.4s hacking animation
      // Wait for 1.6s FAILED bold red error screen hold + reset
      await delay(1700);

      // --- 0.8 SECONDS PAUSE BEFORE FINAL ATTEMPT 3 ---
      if (isCancelled) return;
      await delay(800);

      // --- ATTEMPT 3 (FINAL / SUCCESS) ---
      if (isCancelled) return;
      await simulateTypingPasscode(passcodes[2]);
      if (isCancelled) return;
      await startHackingSequenceRef.current(2); // Runs 1.4s hacking animation -> triggers SUCCESS & ENTERS SITE!
    };

    runAutomatedHackingFlow();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Passcode Input Handler
  const handleKeyClick = (val) => {
    if (vaultState === 'HACKING' || vaultState === 'FAILED' || vaultState === 'SUCCESS') return;
    playAudioFX('click');

    if (val === 'CLR') {
      setCode('');
      setVaultState('IDLE');
    } else if (val === 'ENTER') {
      if (code.length > 0) {
        startHackingSequence();
      }
    } else {
      if (code.length < 6) {
        const nextCode = code + val;
        setCode(nextCode);
        if (vaultState === 'IDLE') {
          setVaultState('ENTERING_CODE');
        }
      }
    }
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (vaultState === 'HACKING' || vaultState === 'FAILED' || vaultState === 'SUCCESS') return;

      if (/^[0-9]$/.test(e.key)) {
        if (code.length < 6) {
          const nextCode = code + e.key;
          setCode(nextCode);
          if (vaultState === 'IDLE') setVaultState('ENTERING_CODE');
          playAudioFX('click');
        }
      } else if (e.key === 'Backspace') {
        const nextCode = code.slice(0, -1);
        setCode(nextCode);
        if (nextCode.length === 0) setVaultState('IDLE');
        playAudioFX('click');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (code.length > 0) {
          startHackingSequence();
        }
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        setCode('');
        setVaultState('IDLE');
        playAudioFX('click');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, vaultState, startHackingSequence]);

  // Derived Header & Status Display Text
  let mainStatusText = 'ENTER ACCESS CODE';
  let subStatusText = '';

  if (vaultState === 'HACKING') {
    if (hackingSubstep === 'CONNECTING') {
      mainStatusText = 'CONNECTING...';
      subStatusText = 'INITIALIZING LINK';
    } else if (hackingSubstep === 'BYPASSING') {
      mainStatusText = 'BYPASSING FIREWALL';
      subStatusText = 'SCANNING PORT & PROXY';
    } else if (hackingSubstep === 'DECRYPTING') {
      mainStatusText = 'DECRYPTING AI CORE';
      subStatusText = failureCount === 1 ? 'COUNTERMEASURES ENGAGED' : 'EXTRACTING MASTER KEYS';
    } else if (hackingSubstep === 'VERIFYING') {
      mainStatusText = 'VERIFYING RESPONSE...';
      subStatusText = 'HOLDING FOR DECISION';
    }
  } else if (vaultState === 'FAILED') {
    if (failureCount === 0) {
      mainStatusText = '✖ INCORRECT PASSWORD';
      subStatusText = 'ATTEMPT 1/3 FAILED - ACCESS DENIED';
    } else {
      mainStatusText = '✖ INCORRECT PASSWORD';
      subStatusText = 'ATTEMPT 2/3 FAILED - SECURITY CHECK FAILED';
    }
  } else if (vaultState === 'SUCCESS') {
    mainStatusText = 'AUTHORIZATION OVERRIDE';
    subStatusText = 'ROOT ACCESS GRANTED';
  }

  return (
    <motion.div
      animate={
        vaultState === 'FAILED'
          ? { x: [-14, 14, -10, 10, -5, 5, 0], y: [-5, 5, -2, 2, 0], rotate: [-2.5, 2.5, -1, 1, 0] }
          : vaultState === 'HACKING' && hackingSubstep === 'DECRYPTING'
          ? { x: [-3, 3, -2, 2, 0], y: [-2, 2, -1, 1, 0] }
          : { x: 0, y: 0, rotate: 0 }
      }
      transition={vaultState === 'FAILED' ? { duration: 0.45 } : { duration: 0.2 }}
      className={`cyber-holo-panel ${className} ${
        vaultState === 'SUCCESS'
          ? 'ring-4 ring-[var(--accent-color)] shadow-[0_0_60px_rgba(var(--accent-rgb),0.95)] border-[var(--accent-color)] bg-[var(--accent-color)]/15 scale-105'
          : vaultState === 'FAILED' && failureCount === 1
          ? 'ring-4 ring-red-500 bg-red-950/80 shadow-[0_0_55px_rgba(239,68,68,0.9)] animate-warning-pulse'
          : vaultState === 'FAILED'
          ? 'ring-4 ring-red-600 bg-red-950/70 shadow-[0_0_40px_rgba(239,68,68,0.8)]'
          : vaultState === 'HACKING'
          ? 'ring-2 ring-[var(--accent-color)] shadow-[0_0_30px_rgba(var(--accent-rgb),0.6)] opacity-100 scale-105'
          : 'opacity-90 border-[var(--accent-color)]/50'
      }`}
      style={{ width: '320px', minHeight: '330px', transition: 'border-color 0.3s, box-shadow 0.3s', zIndex: 30, ...style }}
    >
      {/* HUD Corner Brackets */}
      <div className="cyber-corner cyber-corner-tl" />
      <div className="cyber-corner cyber-corner-tr" />
      <div className="cyber-corner cyber-corner-bl" />
      <div className="cyber-corner cyber-corner-br" />
      <div className="cyber-scanline-overlay" />

      {/* Red Glitch Bar Overlay for Attempt 2 Failure */}
      {vaultState === 'FAILED' && failureCount === 1 && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
          <div className="w-full h-8 bg-red-500/40 animate-red-glitch-overlay" />
        </div>
      )}

      {/* Downward Scan Lines in Hacking / Success */}
      {(vaultState === 'HACKING' || vaultState === 'SUCCESS') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div className="w-full h-12 bg-gradient-to-b from-transparent via-[var(--accent-color)]/40 to-transparent animate-scanline-down" />
        </div>
      )}

      {/* Escaping Digital Particles on Success */}
      {vaultState === 'SUCCESS' && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 140, x: Math.random() * 280 }}
              animate={{ opacity: 0, y: -40, x: Math.random() * 280 }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}
              className="absolute w-1.5 h-1.5 rounded-full bg-[var(--accent-light)] shadow-[0_0_8px_var(--accent-light)]"
            />
          ))}
        </div>
      )}

      {/* 1. Panel Header */}
      <div className="cyber-panel-header flex items-center justify-between px-3 py-1.5 border-b border-[var(--accent-color)]/30 bg-black/60 relative z-20">
        <div className="title-badge flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              vaultState === 'SUCCESS'
                ? 'bg-[var(--accent-light)] shadow-[0_0_10px_var(--accent-light)]'
                : vaultState === 'FAILED'
                ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping'
                : 'bg-[var(--accent-color)] animate-pulse'
            }`}
          />
          <span className="text-[11px] font-mono font-bold tracking-wider text-[var(--accent-color)]">
            AI SECURITY VAULT
          </span>
        </div>
        <span
          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
            vaultState === 'SUCCESS'
              ? 'bg-[var(--accent-color)]/30 text-[var(--accent-light)] border-[var(--accent-color)]'
              : failureCount >= 2
              ? 'bg-red-950/80 text-red-400 border-red-500/50'
              : 'text-white/70 bg-black/60 border-[var(--accent-color)]/20'
          }`}
        >
          {vaultState === 'SUCCESS' ? 'ROOT GRANTED' : failureCount >= 2 ? '⚠️ WARN: L2 DEFENSE' : 'LEVEL VII'}
        </span>
      </div>

      {/* 2. Main Content View */}
      <div className="p-3 flex flex-col items-center gap-2 select-none relative z-20">
        {/* 3D Mechanical Vault Lock Core */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-16 h-16 overflow-visible" viewBox="0 0 100 100">
            {/* Outer Rotating Gear Ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={vaultState === 'FAILED' || failureCount === 2 ? '#ef4444' : 'var(--accent-color)'}
              strokeWidth="2"
              strokeDasharray="6 4"
              className={
                vaultState === 'FAILED' || hackingSubstep === 'VERIFYING'
                  ? ''
                  : vaultState === 'SUCCESS'
                  ? 'animate-[radar-rotate_1s_linear_infinite]'
                  : vaultState === 'HACKING'
                  ? 'animate-[radar-rotate_0.6s_linear_infinite]'
                  : 'animate-[radar-rotate_14s_linear_infinite]'
              }
              style={{ transformOrigin: 'center', opacity: 0.8 }}
            />
            {/* Counter-Rotating Tumbler Ring */}
            <circle
              cx="50"
              cy="50"
              r="36"
              fill="none"
              stroke={vaultState === 'FAILED' || failureCount === 2 ? '#ef4444' : 'rgba(var(--accent-rgb), 0.6)'}
              strokeWidth="1.5"
              strokeDasharray="12 6"
              className={
                vaultState === 'FAILED' || hackingSubstep === 'VERIFYING'
                  ? ''
                  : vaultState === 'SUCCESS'
                  ? 'animate-[radar-rotate_0.8s_linear_infinite_reverse]'
                  : vaultState === 'HACKING'
                  ? 'animate-[radar-rotate_0.3s_linear_infinite_reverse]'
                  : 'animate-[radar-rotate_10s_linear_infinite_reverse]'
              }
              style={{ transformOrigin: 'center' }}
            />

            {/* Inner Lock Core */}
            <circle
              cx="50"
              cy="50"
              r="24"
              fill={
                vaultState === 'FAILED' || failureCount === 2
                  ? 'rgba(239,68,68,0.25)'
                  : vaultState === 'SUCCESS'
                  ? 'rgba(var(--accent-rgb),0.4)'
                  : 'rgba(0,0,0,0.7)'
              }
              stroke={vaultState === 'FAILED' || failureCount === 2 ? '#ef4444' : 'var(--accent-color)'}
              strokeWidth="2"
            />
          </svg>

          {/* Lock Core Icon Morphing (Locked Padlock vs Red X vs Green Checkmark) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              {vaultState === 'SUCCESS' ? (
                <motion.div
                  key="unlocked-icon"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1.2, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light, #76FF03)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
              ) : vaultState === 'FAILED' ? (
                <motion.div
                  key="failure-x-icon"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: [0, 1.4, 1], rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="text-red-500 font-extrabold text-3xl drop-shadow-[0_0_15px_#ef4444]"
                >
                  ✖
                </motion.div>
              ) : (
                <motion.div
                  key="locked-padlock-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={failureCount === 2 ? '#ef4444' : 'var(--accent-color)'} strokeWidth="2.2">
                    <rect x="5" y="11" width="14" height="10" rx="2" fill={failureCount === 2 ? 'rgba(239,68,68,0.3)' : 'rgba(0,0,0,0.5)'} />
                    <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 3. Status Display Banner */}
        <div className="w-full text-center font-mono">
          <div
            className={`text-[10.5px] font-extrabold tracking-wider px-2 py-1 rounded border backdrop-blur-md transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
              vaultState === 'SUCCESS'
                ? 'bg-[var(--accent-color)]/25 text-[var(--accent-light)] border-[var(--accent-color)] shadow-[0_0_20px_rgba(var(--accent-rgb),0.5)]'
                : vaultState === 'HACKING' && hackingSubstep === 'DECRYPTING'
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 animate-glitch-text shadow-[0_0_15px_rgba(0,255,255,0.5)]'
                : vaultState === 'FAILED'
                ? 'bg-red-950/90 text-red-400 border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.6)]'
                : 'bg-black/70 text-[var(--accent-color)] border-[var(--accent-color)]/30'
            }`}
          >
            <span>{mainStatusText}</span>
            {subStatusText && (
              <span
                className={`text-[9px] font-bold tracking-widest ${
                  vaultState === 'SUCCESS'
                    ? 'text-white'
                    : vaultState === 'FAILED'
                    ? 'text-red-300'
                    : 'text-[var(--accent-color)]/80'
                }`}
              >
                {subStatusText}
              </span>
            )}
          </div>
        </div>

        {/* 4. Passcode Digit Input Box */}
        {vaultState !== 'FAILED' && vaultState !== 'SUCCESS' && (
          <div className="w-full bg-black/80 border border-[var(--accent-color)]/40 rounded px-2.5 py-1 flex items-center justify-between font-mono my-0.5 shadow-inner">
            <span className="text-[9px] font-bold text-[var(--accent-color)]/70 tracking-wider">PASSCODE:</span>
            <div className="flex items-center gap-1.5 font-bold tracking-widest text-xs text-[var(--accent-color)] drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.8)]">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const char = code[idx];
                return (
                  <span
                    key={idx}
                    className={`w-3.5 text-center transition-all duration-150 ${
                      char ? 'text-[var(--accent-color)] scale-110 font-extrabold' : 'text-white/20'
                    }`}
                  >
                    {char ? char : '•'}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. SWITCHABLE LOWER PANEL: KEYPAD vs DEDICATED FAILED SCREEN vs SUCCESS BANNER */}
        <AnimatePresence mode="wait">
          {vaultState === 'FAILED' ? (
            /* ================= DEDICATED BOLD RED FAILED SCREEN UI ================= */
            /* KEYPAD IS COMPLETELY HIDDEN, RENDER DEDICATED VIBRANT RED WARNING CARD */
            <motion.div
              key="failed-screen-ui"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="w-full py-3.5 px-2 bg-red-950/95 border-2 border-red-600 rounded-lg flex flex-col items-center justify-center text-center font-mono shadow-[0_0_30px_rgba(239,68,68,0.7)] animate-warning-pulse"
              style={{
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
              }}
            >
              <div className="text-red-500 font-extrabold text-[11px] tracking-widest animate-pulse select-none">
                ⚠️ ERROR: INVALID PASSWORD ⚠️
              </div>
              <div className="text-sm font-black text-red-500 tracking-widest my-1 drop-shadow-[0_0_18px_#ff0000] uppercase">
                {failureCount === 0 ? 'ACCESS DENIED' : 'SECURITY CHECK FAILED'}
              </div>
              <div className="text-[10px] font-extrabold text-red-300 tracking-wider mb-1 px-3 py-0.5 bg-red-900/80 rounded border border-red-500">
                {failureCount === 0 ? 'ATTEMPT 1 / 3 FAILED' : 'ATTEMPT 2 / 3 FAILED'}
              </div>
              <div className="text-[9px] font-bold text-red-400 tracking-widest animate-pulse mt-0.5">
                RE-TRYING AUTOMATIC OVERRIDE...
              </div>
            </motion.div>
          ) : vaultState === 'SUCCESS' ? (
            /* ================= SUCCESS BANNER UI ================= */
            <motion.div
              key="success-screen-ui"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 250, damping: 20 }}
              className="w-full py-3 bg-black/85 border-2 border-[var(--accent-color)] rounded-lg backdrop-blur-md flex flex-col items-center justify-center gap-1 font-mono text-center shadow-[0_0_35px_rgba(var(--accent-rgb),0.4)]"
            >
              <span className="text-xs font-extrabold text-[var(--accent-light)] tracking-widest drop-shadow-[0_0_8px_var(--accent-color)]">
                WELCOME ENGINEER
              </span>
              <span className="text-sm font-black text-white tracking-widest drop-shadow-[0_0_12px_rgba(255,255,255,0.95)]">
                KAVYA MAKHAN
              </span>
              <span className="text-[10px] font-bold text-[var(--accent-color)] tracking-wider mt-0.5 bg-[var(--accent-color)]/15 px-2.5 py-0.5 rounded border border-[var(--accent-color)]/30">
                SYSTEM ACCESS GRANTED
              </span>
            </motion.div>
          ) : (
            /* ================= NORMAL VIRTUAL KEYPAD UI ================= */
            <motion.div
              key="keypad-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full grid grid-cols-3 gap-1.5 font-mono"
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'ENTER'].map((btn) => {
                const isEnter = btn === 'ENTER';
                const isClr = btn === 'CLR';
                const isHacking = vaultState === 'HACKING';
                const isBeingPressed = pressedBtn === btn;

                return (
                  <button
                    key={btn}
                    onClick={() => handleKeyClick(btn)}
                    disabled={isHacking}
                    className={`py-1.5 rounded text-xs font-extrabold transition-all duration-150 active:scale-95 border ${
                      isBeingPressed
                        ? 'bg-[var(--accent-color)] text-black border-white scale-110 shadow-[0_0_15px_rgba(var(--accent-rgb),0.9)]'
                        : isHacking
                        ? 'bg-black/40 text-white/30 border-white/5 cursor-not-allowed'
                        : isEnter
                        ? 'bg-[var(--accent-color)]/25 text-[var(--accent-color)] border-[var(--accent-color)]/50 hover:bg-[var(--accent-color)]/40 hover:scale-105 shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)] cursor-pointer'
                        : isClr
                        ? 'bg-amber-950/30 text-amber-400 border-amber-500/40 hover:bg-amber-950/60 hover:scale-105 cursor-pointer'
                        : 'bg-black/60 text-white/90 border-white/10 hover:border-[var(--accent-color)]/50 hover:bg-[var(--accent-color)]/15 hover:text-[var(--accent-color)] hover:scale-105 cursor-pointer'
                    }`}
                  >
                    {isEnter ? '↵' : btn}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 6. Footer Diagnostics */}
        <div className="w-full flex items-center justify-between text-[9px] font-mono text-white/70 border-t border-white/10 pt-1 mt-0.5 bg-black/60 px-1 rounded relative z-20">
          <span className="font-bold">FAILURES: {String(failureCount).padStart(2, '0')}</span>
          <span className={vaultState === 'SUCCESS' ? 'text-[var(--accent-light)] font-bold' : 'text-[var(--accent-color)] font-bold'}>
            {vaultState === 'SUCCESS' ? 'ACCESS: UNRESTRICTED' : 'SECURITY: MAXIMUM'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
