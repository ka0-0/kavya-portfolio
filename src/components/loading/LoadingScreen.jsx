import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { SpaceBoi, CameraFitter } from '../outro/SpaceBoi';

export default function LoadingScreen({ onStartTransition, onComplete }) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [robotFinished, setRobotFinished] = useState(false);
  const [modelRadius, setModelRadius] = useState(0);
  const [pillVisible, setPillVisible] = useState(true);
  const [pillExpanded, setPillExpanded] = useState(true);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'welcome' | 'expanding'

  // Typewriter effect for BIOS header
  const line1Text = 'KAVYA BIOS v2.0.26';
  const line2Text = 'Copyright (C) 2026 Kavya Makhan. All Rights Reserved.';
  const line3Text = 'AI & Neural Systems Division';

  const [typedLine1, setTypedLine1] = useState('');
  const [typedLine2, setTypedLine2] = useState('');
  const [typedLine3, setTypedLine3] = useState('');

  const targetProgressRef = useRef(0);
  const isTransitioningRef = useRef(false);

  // Typewriter sequence triggered once pill expands
  useEffect(() => {
    if (!pillExpanded) return;

    let i = 0;
    let j = 0;
    let k = 0;

    const timer = setInterval(() => {
      if (i < line1Text.length) {
        i++;
        setTypedLine1(line1Text.slice(0, i));
      } else if (j < line2Text.length) {
        j++;
        setTypedLine2(line2Text.slice(0, j));
      } else if (k < line3Text.length) {
        k++;
        setTypedLine3(line3Text.slice(0, k));
      } else {
        clearInterval(timer);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [pillExpanded]);

  // Ensure loading pill capsule is visible and expanded immediately on mount
  useEffect(() => {
    setPillVisible(true);
    setPillExpanded(true);
  }, []);

  // Core transition handler: WELCOME (300ms pause) -> GPU-Accelerated Portal Circle Expansion (1000ms) -> Portfolio Reveal
  const triggerTransition = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    // 1. Display "WELCOME" inside pill
    setPhase('welcome');

    // 2. Pause 300ms
    setTimeout(() => {
      // 3. Start GPU-accelerated circular portal mask
      setPhase('expanding');

      // 4. Reveal portfolio underneath immediately as circle portal starts expanding
      if (onStartTransition) {
        onStartTransition();
      }

      // 5. Complete unmount after 1000ms when circle completely covers viewport
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 1000);
    }, 300);
  }, [onStartTransition, onComplete]);

  // Synchronized callback from Three.js frame progress
  const handleProgress = useCallback((percent) => {
    if (percent > targetProgressRef.current) {
      targetProgressRef.current = percent;
    }
  }, []);

  // Event callback triggered when AnimationMixer dispatches 'finished' event
  const handleFinished = useCallback(() => {
    setRobotFinished(true);
    targetProgressRef.current = 100;
  }, []);

  // Constant uniform progress counter: Every number from 1 to 100 has identical timing per step
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        }
        return 100;
      });
    }, 60); // 60ms per step for exactly 6 seconds total loading duration (100 steps * 60ms)

    return () => clearInterval(interval);
  }, []);

  // Finish condition: Trigger WELCOME and exit sequence when progress reaches 100%
  useEffect(() => {
    if (displayProgress >= 100) {
      if (isTransitioningRef.current) return;
      triggerTransition();
    }
  }, [displayProgress, triggerTransition]);

  // User Interaction Listeners: strictly Click or 'Enter' key press triggers transition
  useEffect(() => {
    const handleUserTrigger = (e) => {
      if (e.type === 'keydown' && e.key !== 'Enter') {
        return; // Only 'Enter' key triggers transition
      }
      setDisplayProgress(100);
      triggerTransition();
    };

    window.addEventListener('click', handleUserTrigger, { passive: true });
    window.addEventListener('keydown', handleUserTrigger, { passive: true });

    return () => {
      window.removeEventListener('click', handleUserTrigger);
      window.removeEventListener('keydown', handleUserTrigger);
    };
  }, [triggerTransition]);

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black text-white flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden"
      style={{
        clipPath:
          phase === 'expanding'
            ? 'circle(0px at 50% 50%)'
            : 'circle(180vmax at 50% 50%)',
        transition:
          phase === 'expanding'
            ? 'clip-path 1000ms cubic-bezier(0.22, 1, 0.36, 1)'
            : 'none',
        willChange: 'clip-path',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
        {/* Background Subtle Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(6,182,212,0.04)_45%,transparent_70%)] blur-3xl pointer-events-none z-0" />

        {/* Centered Loading SpaceBoi Canvas */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <Canvas
            camera={{ position: [0, 0, 10], fov: 45 }}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.05;
              gl.outputColorSpace = THREE.SRGBColorSpace;
            }}
          >
            <ambientLight intensity={0.5} color="#ffffff" />
            <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
            <Suspense fallback={null}>
              <SpaceBoi onModelLoaded={setModelRadius} rotationSpeedMultiplier={5.0} />
            </Suspense>
            <CameraFitter modelRadius={modelRadius} />
          </Canvas>
        </div>

        {/* Loading Indicator Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[70px] sm:translate-y-[85px] z-[10] flex flex-col items-center justify-center text-center px-6 max-w-lg w-full">
          {/* Futuristic Tech BIOS Header with Typewriter Effect */}
          <div
            className={`transition-all duration-300 ${
              pillExpanded
                ? 'opacity-85 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            } mb-6 font-mono text-[10px] sm:text-[11px] text-zinc-400 tracking-wider leading-relaxed text-center select-none space-y-0.5`}
          >
            <div className="text-zinc-200 font-bold tracking-widest uppercase">
              {typedLine1.startsWith('KAVYA BIOS') ? (
                <>
                  KAVYA BIOS{' '}
                  <span className="text-cyan-400 font-normal">
                    {typedLine1.replace('KAVYA BIOS ', '')}
                  </span>
                </>
              ) : (
                typedLine1
              )}
              {typedLine1.length < line1Text.length && (
                <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-0.5 animate-pulse" />
              )}
            </div>
            {typedLine1.length >= line1Text.length && (
              <div className="text-zinc-400">
                {typedLine2}
                {typedLine2.length < line2Text.length && (
                  <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-0.5 animate-pulse" />
                )}
              </div>
            )}
            {typedLine2.length >= line2Text.length && (
              <div className="text-cyan-400/80 uppercase font-semibold text-[9.5px]">
                {typedLine3}
                {typedLine3.length < line3Text.length && (
                  <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-0.5 animate-pulse" />
                )}
              </div>
            )}
          </div>

          {/* Loading Pill Capsule */}
          <div
            className="relative p-[1.5px] rounded-full animate-neon-border shadow-[0_12px_35px_-8px_rgba(37,99,235,0.4),_0_0_20px_rgba(var(--accent-rgb),0.3)] flex items-center justify-center overflow-hidden z-[10]"
            style={{
              width: pillExpanded
                ? typeof window !== 'undefined' && window.innerWidth < 640
                  ? '135px'
                  : '155px'
                : '80px',
              height: pillExpanded ? '58px' : '8px',
              borderRadius: '9999px',
              opacity: pillVisible ? 1 : 0,
              transformOrigin: 'center center',
              transition: 'all 500ms cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          >
            {/* Ambient Glow Background Blur */}
            <div className="absolute inset-0 rounded-full animate-neon-border blur-[10px] opacity-30 pointer-events-none" />

            {/* Inner Capsule Glass Core */}
            <div className="w-full h-full bg-[#070b16]/95 backdrop-blur-[18px] rounded-full flex items-center justify-center relative z-10 px-6 overflow-hidden">
              {/* Percentage Number (Slides out up when 100% is reached) */}
              <span
                className={`absolute transition-all duration-300 ease-out font-mono font-black text-lg sm:text-xl tracking-wider text-white select-none ${
                  phase === 'loading' && pillExpanded
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 -translate-y-5 scale-90 pointer-events-none'
                }`}
              >
                {displayProgress}
                <span className="text-cyan-400 text-sm font-bold ml-0.5">%</span>
              </span>

              {/* WELCOME Text (Slides in at 100%) */}
              <span
                className={`absolute font-mono font-extrabold text-xs sm:text-sm tracking-[0.25em] text-cyan-300 uppercase select-none transition-all duration-300 ease-out ${
                  phase === 'welcome' || phase === 'expanding'
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-5 scale-90 pointer-events-none'
                }`}
              >
                WELCOME
              </span>
            </div>
          </div>
        </div>
    </div>
  );
}
