import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import AIKAVCore from '../effects/AIKAVCore';
import { useTheme } from '../theme/ThemeContext';
import { KAVAI_DIALOGUE_POOL } from '../../data/kavaiDialogue';
import HolographicProjection from './HolographicProjection';
import '../../styles/holographicProjection.css';

const THEME_DETAILS = [
  { code: 'blue', name: 'Blue', color: '#22d3ee', shadow: '0 0 16px rgba(34, 211, 238, 0.75)' },
  { code: 'black', name: 'Black', color: '#ffffff', shadow: '0 0 16px rgba(255, 255, 255, 0.75)' },
  { code: 'pink', name: 'Pink', color: '#ec4899', shadow: '0 0 16px rgba(236, 72, 153, 0.75)' },
  { code: 'purple', name: 'Purple', color: '#a855f7', shadow: '0 0 16px rgba(168, 85, 247, 0.75)' },
  { code: 'orange', name: 'Orange', color: '#FF8C00', shadow: '0 0 16px rgba(255, 140, 0, 0.75)' },
  { code: 'red', name: 'Red', color: '#ef4444', shadow: '0 0 16px rgba(239, 68, 68, 0.75)' },
  { code: 'green', name: 'Green', color: '#22c55e', shadow: '0 0 16px rgba(34, 197, 94, 0.75)' }
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
    <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-25 12 12)" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  )
};

function LandingPillDock({ onBegin }) {
  const { currentThemeIndex, setTheme, nextTheme, previousTheme } = useTheme();
  const activeColor = THEME_DETAILS[currentThemeIndex]?.color || '#22d3ee';

  return (
    <div className="fixed bottom-[68px] md:bottom-[80px] left-1/2 -translate-x-1/2 z-30 select-none pointer-events-auto">
      <div className="flex items-center gap-2 sm:gap-3 bg-black/90 backdrop-blur-xl border border-white/10 rounded-full px-3 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(34,211,238,0.15)] transition-all duration-300">

        {/* Previous Theme Button */}
        <button
          onClick={previousTheme}
          aria-label="Previous Theme"
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-white/5"
        >
          ‹
        </button>

        {/* Theme Dots / Circles */}
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
                  /* Dual Googly Eyes for White/Black Theme */
                  <div className="flex items-center gap-[2.5px] select-none pointer-events-none">
                    <div className={`rounded-full bg-black flex items-center justify-center ${isActive ? 'w-2 h-2' : 'w-1.5 h-1.5'}`}>
                      <div className="w-0.5 h-0.5 rounded-full bg-white" />
                    </div>
                    <div className={`rounded-full bg-black flex items-center justify-center ${isActive ? 'w-2 h-2' : 'w-1.5 h-1.5'}`}>
                      <div className="w-0.5 h-0.5 rounded-full bg-white" />
                    </div>
                  </div>
                ) : (
                  /* Theme Icon (Dark contrast when active, Accent color when inactive) */
                  <div className={isActive ? 'text-black/85 filter drop-shadow-sm' : ''}>
                    {ThemeIcons[t.code]}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Next Theme Button */}
        <button
          onClick={nextTheme}
          aria-label="Next Theme"
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-white/5"
        >
          ›
        </button>

        {/* Vertical Divider */}
        <div className="w-[1px] h-6 bg-white/20 mx-1 sm:mx-1.5" />

        {/* Enter Portfolio Action Button */}
        <button
          onClick={onBegin}
          className="group relative px-5 py-2.5 rounded-full font-sans text-xs sm:text-[13px] font-semibold tracking-wide text-black transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-[1.03] active:scale-[0.98] border-0 whitespace-nowrap flex items-center gap-1.5"
          style={{
            backgroundColor: activeColor,
          }}
        >
          <span>Enter Portfolio</span>
          <span className="group-hover:translate-x-0.5 transition-transform duration-200">&rarr;</span>
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
      style={{ filter: 'drop-shadow(0 0 25px rgba(var(--title-glow-rgb), 0.45))' }}
    >
      {/* PORTFOLIO */}
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

      {/* 2026 */}
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

// High-performance Canvas Particles Background
const ParticlesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    const count = 60; // 60 particles for visual richness

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();

    // Create particles
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.2 + 0.4, // ultra-fine particles
        speedY: -(Math.random() * 0.25 + 0.08), // slow, elegant ascension
        opacity: Math.random() * 0.4 + 0.05,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        pulseVal: Math.random() * Math.PI
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.pulseVal += p.pulseSpeed;

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        const currentOpacity = p.opacity + Math.sin(p.pulseVal) * 0.12;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        const computedStyle = getComputedStyle(document.documentElement);
        const rgb = computedStyle.getPropertyValue('--accent-rgb').trim() || '34, 211, 238';
        const color = computedStyle.getPropertyValue('--accent-color').trim() || '#22d3ee';
        ctx.fillStyle = `rgba(${rgb}, ${Math.max(0.02, Math.min(currentOpacity, 0.7))})`;
        ctx.shadowColor = color;
        ctx.shadowBlur = p.radius * 2.5;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

function HeaderContainer() {
  return (
    <div className="hidden md:flex flex-col items-center absolute left-1/2 -translate-x-1/2 top-[8%] md:top-[10%] z-10 select-none pointer-events-none">
      {/* PORTFOLIO 2026 HEADING (WITH HOME PAGE HOVER & PROXIMITY WEIGHT EFFECT) */}
      <PortfolioHeader />
    </div>
  );
}

const KAVAI_DIALOGUES = KAVAI_DIALOGUE_POOL; // local alias

export default function LandingPage({ onBegin }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const frameRef = useRef(null);
  const coreWrapperRef = useRef(null);

  const [projectionState, setProjectionState] = useState('typing'); // 'typing', 'holding'
  const [selectedDialogue, setSelectedDialogue] = useState(() => {
    const landingDialogues = KAVAI_DIALOGUE_POOL.filter(d => d.category === 'landing');
    if (landingDialogues && landingDialogues.length > 0) {
      return landingDialogues[Math.floor(Math.random() * landingDialogues.length)].text;
    }
    return "Welcome.\nI've been expecting you.";
  });

  useEffect(() => {
    let timerId = null;

    if (projectionState === 'holding') {
      timerId = setTimeout(() => {
        const landingDialogues = KAVAI_DIALOGUE_POOL.filter(d => d.category === 'landing');
        if (landingDialogues && landingDialogues.length > 0) {
          let nextDialogue = selectedDialogue;
          while (nextDialogue === selectedDialogue && landingDialogues.length > 1) {
            nextDialogue = landingDialogues[Math.floor(Math.random() * landingDialogues.length)].text;
          }
          setSelectedDialogue(nextDialogue);
        }
        setProjectionState('typing');
      }, 4000); // Wait 4 seconds on holding state before showing next message
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [projectionState, selectedDialogue]);

  useEffect(() => {
    const handleResize = () => {
      if (frameRef.current) {
        setSize({
          width: frameRef.current.clientWidth,
          height: frameRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();
    const timer = setTimeout(handleResize, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        onBegin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBegin]);

  const W = size.width;
  const H = size.height;
  const C = 16; // Diagonal chamfer cut size

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
      className="fixed inset-0 w-full h-full bg-[#000000] text-white flex flex-col justify-between p-8 md:p-10 z-[1000] overflow-hidden select-none"
    >
      {/* Background visual layers */}
      <ParticlesBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.015)_0%,transparent_75%)] pointer-events-none z-0" />

      {/* Futuristic Chamfered HUD border frame with vertical crosses */}
      <div ref={frameRef} className="absolute inset-6 md:inset-8 pointer-events-none z-10">
        {W && H && (
          <svg
            className="w-full h-full"
            style={{
              overflow: 'visible',
              filter: 'drop-shadow(0 0 1.5px rgba(var(--accent-rgb), 0.12))'
            }}
            width="100%"
            height="100%"
          >
            {/* 1. Main borders (most subtle: 7% opacity) */}
            <g stroke="rgba(var(--accent-rgb), 0.07)" strokeWidth="1" fill="none">
              {/* Top border */}
              <line x1={C + 1} y1={1} x2={W - C - 1} y2={1} />
              {/* Right border */}
              <line x1={W - 1} y1={C + 1} x2={W - 1} y2={H - C - 1} />
              {/* Bottom border */}
              <line x1={C + 1} y1={H - 1} x2={W - C - 1} y2={H - 1} />
              {/* Left border */}
              <line x1={1} y1={C + 1} x2={1} y2={H - C - 1} />
            </g>

            {/* 2. Corner chamfers (high visibility: 42% opacity matching plus markers) */}
            <g stroke="rgba(var(--accent-rgb), 0.42)" strokeWidth="1" fill="none">
              {/* Top-Left */}
              <line x1={1} y1={C + 1} x2={C + 1} y2={1} />
              {/* Top-Right */}
              <line x1={W - C - 1} y1={1} x2={W - 1} y2={C + 1} />
              {/* Bottom-Right */}
              <line x1={W - 1} y1={H - C - 1} x2={W - C - 1} y2={H - 1} />
              {/* Bottom-Left */}
              <line x1={C + 1} y1={H - 1} x2={1} y2={H - C - 1} />
            </g>

            {/* 3. Cross (+) markers (most visible: 42% opacity) */}
            <g stroke="rgba(var(--accent-rgb), 0.42)" strokeWidth="1">
              {/* Left top marker (20% from top) */}
              <line x1={-5} y1={H * 0.2} x2={7} y2={H * 0.2} />
              <line x1={1} y1={H * 0.2 - 6} x2={1} y2={H * 0.2 + 6} />

              {/* Left bottom marker (20% from bottom) */}
              <line x1={-5} y1={H * 0.8} x2={7} y2={H * 0.8} />
              <line x1={1} y1={H * 0.8 - 6} x2={1} y2={H * 0.8 + 6} />

              {/* Right top marker (20% from top) */}
              <line x1={W - 7} y1={H * 0.2} x2={W + 5} y2={H * 0.2} />
              <line x1={W - 1} y1={H * 0.2 - 6} x2={W - 1} y2={H * 0.2 + 6} />

              {/* Right bottom marker (20% from bottom) */}
              <line x1={W - 7} y1={H * 0.8} x2={W + 5} y2={H * 0.8} />
              <line x1={W - 1} y1={H * 0.8 - 6} x2={W - 1} y2={H * 0.8 + 6} />
            </g>
          </svg>
        )}
      </div>

      {/* HEADER SPACE FOR PERSISTENT THEME BUTTON */}
      <header className="relative w-full h-[38px] z-20 pointer-events-none">
        {/* Persistent ThemeToggle is positioned at bottom-center of landing page */}
      </header>

      {/* KAV AI CORE AT LANDING PAGE POSITION */}
      <div
        ref={coreWrapperRef}
        className="absolute left-[calc(50%-40px)] top-[calc(50%+50px)] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
        style={{
          filter: 'drop-shadow(0 0 30px rgba(var(--accent-rgb), 0.5))',
          transition: 'filter 400ms ease-in-out',
        }}
      >
        {/* Holographic Projection Overlays */}
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



      {/* PORTFOLIO 2026 HEADER */}
      <HeaderContainer />

      {/* HORIZONTAL THEME DOCK & ENTER PORTFOLIO PILL */}
      <LandingPillDock onBegin={onBegin} />



      {/* FOOTER SPACE */}
      <footer className="relative w-full h-[20px] z-20 pointer-events-none" />
    </motion.div>
  );
}
