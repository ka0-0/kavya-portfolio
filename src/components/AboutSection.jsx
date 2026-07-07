import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import DottedMap from 'dotted-map';

// ==========================================
// STATIC PROFILE DATA CONSTANTS
// ==========================================
const terminalData = [
  { label: "> Initializing Portfolio OS...", isHeader: true },
  { label: "System Core..........", value: "Vite v8.1.3 • React 19" },
  { label: "Identity.............", value: "Kavya Makhan" },
  { label: "Node Host............", value: "DELHI_NODE_IN" },
  { label: "Education............", value: "Mechanical Engineering" },
  { label: "Current Focus........", value: "Artificial Intelligence" },
  { label: "Learning.............", value: "React • Three.js • Python" },
  { label: "Primary GPU..........", value: "R3F_RENDER_ACCEL" },
  { label: "FPS Target...........", value: "60_FPS_LOCKED" },
  { label: "Network Mapping......", value: "DOTTED_MAP_PROJ" },
  { label: "Framer Motion........", value: "SPRING_STAGGER_ON" },
  { label: "Mouse Telemetry......", value: "LERP_INERTIA_ACTIVE" },
  { label: "Mission..............", value: "Building intelligent products" },
  { label: "Status...............", value: "ONLINE", isStatus: true }
];

let mapDots = [];
let delhiX = 217.5;
let delhiY = 93.75;

try {
  const map = new DottedMap({ height: 26, grid: 'vertical' });
  map.addPin({
    lat: 28.6139,
    lng: 77.2090,
    data: { isDelhi: true }
  });

  const rawPoints = map.getPoints();

  // Crop viewport to Europe, Africa, Middle East, India, Western Asia (Zooming 20-30%, cutting western Americas)
  const filteredPoints = rawPoints;

  const pointsX = filteredPoints.map(p => p.x);
  const pointsY = filteredPoints.map(p => p.y);
  const minX = Math.min(...pointsX);
  const maxX = Math.max(...pointsX);
  const minY = Math.min(...pointsY);
  const maxY = Math.max(...pointsY);

  mapDots = filteredPoints.map(p => {
    const isDelhi = p.data?.isDelhi || false;
    const normX = (p.x - minX) / (maxX - minX);
    const normY = (p.y - minY) / (maxY - minY);
    return {
      x: normX * 260 + 20, // generous padding: 20px on left/right (total width 300)
      y: normY * 140 + 20, // generous padding: 20px on top/bottom (total height 180)
      isDelhi
    };
  });

  const delhiDot = mapDots.find(d => d.isDelhi);
  if (delhiDot) {
    delhiX = delhiDot.x;
    delhiY = delhiDot.y;
  }
} catch (e) {
  console.warn('dotted-map generation failed, falling back to ASCII map dots:', e);
  const fallbackGrid = [
    "                  .###.                                         ",
    "               .#########.                                      ",
    "  .###.      .############.                   .##.     .###.    ",
    " #######.   .##############.      .###.      ######.  #######.  ",
    "#########. .################.    .#####.    #################.  ",
    "#########.##################.   .#######.   ##################. ",
    "#########.##################.  .#########. ###################. ",
    " #######. .################.   .#########.  #################.  ",
    "  #####.   .##############.     .#######.    ###############.   ",
    "   ###.     .############.       .#####.      #############.    ",
    "    #.       .##########.         .###.        ###########.     ",
    "              .########.          .###.         .########.      ",
    "             .##########.        .#####.         .######.       ",
    "            .############.       .######.         .####.        ",
    "            .############.      .#######.          .##.         ",
    "            .###########.       .######.            .           ",
    "             .#########.        .#####.                         ",
    "              .#######.          .###.                          ",
    "               .#####.            .#.            .####.         ",
    "                .###.                           ########.       ",
    "                 .#.                            .######.        ",
    "                                                 .####.         ",
    "                                                  .##.          ",
    "                                                   .            "
  ];
  const colCount = 60;
  const rowCount = 24;
  const colWidth = 300 / colCount;
  const rowHeight = 180 / rowCount;

  fallbackGrid.forEach((rowStr, r) => {
    for (let c = 0; c < rowStr.length; c++) {
      const char = rowStr[c];
      if (char === '#' || char === '.') {
        mapDots.push({
          x: c * colWidth + colWidth / 2,
          y: r * rowHeight + rowHeight / 2,
          isDelhi: false
        });
      }
    }
  });
  delhiX = 43 * colWidth + colWidth / 2;
  delhiY = 12 * rowHeight + rowHeight / 2;
}


const metricsData = [
  { label: "Projects Completed", value: 18, suffix: "+" },
  { label: "AI Models Trained", value: 14, suffix: "" },
  { label: "GitHub Repositories", value: 28, suffix: "" },
  { label: "Certificates Earned", value: 10, suffix: "" }
];


// ==========================================
// 1. Lightweight CountUp Animation Component
// ==========================================
function CountUp({ end, duration = 1500, trigger = false }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) {
      setCount(0);
      return;
    }

    let startTime = null;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress * (2 - progress); // Ease out quad
      
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [end, duration, trigger]);

  return <span>{count}</span>;
}

// ==========================================
// 2. Framer Motion Unified Variants
// ==========================================
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12, // Exact 120ms staggered delay
      delayChildren: 0.15,
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.96,
    filter: "blur(6px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      duration: 0.8,
      bounce: 0 // Smooth spring with no bounce
    }
  }
};

// ==========================================
// 3. Cyber HUD Card (Hover tilt & radial light, transform split)
// ==========================================
function CyberCard({ 
  children, 
  title = '', 
  nodeCode = '', 
  isBootComplete = false 
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    // Dynamic 3D tilt calculation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 3; 
    const rotateY = ((x - centerX) / centerX) * -3; 
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  };

  const handleMouseEnter = () => {
    const card = cardRef.current;
    if (card) {
      card.style.setProperty('--hover-opacity', '1');
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) {
      card.style.setProperty('--hover-opacity', '0');
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    }
  };

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className="relative rounded-xl overflow-hidden bg-[#0c0c0e]/85 border border-zinc-800/35 hover:border-cyan-500/30 focus-visible:border-cyan-400 focus-visible:ring-1 focus-visible:ring-cyan-400/50 outline-none backdrop-blur-md select-none group shadow-[0_4px_30px_rgba(0,0,0,0.85)] w-full h-full flex flex-col justify-between"
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease',
      }}
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-cyan-500/30 group-hover:border-cyan-400/80 focus-visible:border-cyan-400/80 transition-colors duration-300 pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-cyan-500/30 group-hover:border-cyan-400/80 focus-visible:border-cyan-400/80 transition-colors duration-300 pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-cyan-500/30 group-hover:border-cyan-400/80 focus-visible:border-cyan-400/80 transition-colors duration-300 pointer-events-none z-10" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-cyan-500/30 group-hover:border-cyan-400/80 focus-visible:border-cyan-400/80 transition-colors duration-300 pointer-events-none z-10" />

      {/* Fine grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.004)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.004)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />

      {/* Radial Hover Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(220px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(6, 182, 212, 0.07), transparent 65%)`,
        }}
      />

      {/* Card Header */}
      <div className="flex justify-between items-center px-5 py-3.5 border-b border-zinc-800/30 font-mono text-[9px] tracking-wider text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isBootComplete ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-700'}`} />
          <span className="uppercase text-zinc-400 font-semibold">{title}</span>
        </div>
        <span className="text-cyan-500/60 font-semibold">{nodeCode}</span>
      </div>

      {/* Card Content */}
      <div className="p-6 min-h-[220px] relative flex-1 flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}

// ==========================================
// 4. Futuristic Proximity Node Network Map
// ==========================================
function NetworkMap({ isBootComplete }) {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const targetMouseRef = useRef({ x: 150, y: 90 });
  const currentMouseRef = useRef({ x: 150, y: 90 });
  const hoverActiveRef = useRef(0);
  const isHoveredRef = useRef(false);

  // Tooltip Hover States
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const hideTimeoutRef = useRef(null);

  const handleMarkerMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsTooltipVisible(true);
  };

  const handleMarkerMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsTooltipVisible(false);
    }, 150);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsTooltipVisible(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isBootComplete) return;
    const card = containerRef.current;
    if (!card) return;

    let cachedDots = [];

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      cachedDots = Array.from(card.querySelectorAll('.map-dot')).map(el => ({
        el,
        x: parseFloat(el.getAttribute('cx')),
        y: parseFloat(el.getAttribute('cy')),
        isModified: false
      }));

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * 300;
      const y = (e.clientY - rect.top) / rect.height * 180;
      targetMouseRef.current = { x, y };
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
    };

    const tick = () => {
      const targetActive = isHoveredRef.current ? 1 : 0;
      hoverActiveRef.current += (targetActive - hoverActiveRef.current) * 0.12;

      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.12;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.12;

      const currentX = currentMouseRef.current.x;
      const currentY = currentMouseRef.current.y;
      const active = hoverActiveRef.current;

      // Update radial glow position and opacity directly
      const glowEl = card.querySelector('.map-cursor-glow');
      if (glowEl) {
        glowEl.style.opacity = active;
        glowEl.style.background = `radial-gradient(110px circle at ${(currentX / 300) * 100}% ${(currentY / 180) * 100}%, rgba(0, 242, 254, 0.18), transparent 70%)`;
      }

      cachedDots.forEach(dot => {
        const dist = Math.hypot(currentX - dot.x, currentY - dot.y);
        const threshold = 75;
        
        if (dist < threshold && active > 0.001) {
          const rawFactor = 1 - dist / threshold;
          const factor = rawFactor * rawFactor * active;

          // Opacity: base 0.55 to max 1.0
          dot.el.style.opacity = 0.55 + factor * 0.45;

          // Radius: base 1.2 to max 2.1
          dot.el.setAttribute('r', 1.2 + factor * 0.9);

          // Color transition: from #4a4f5d (RGB 74, 79, 93) to #00f2fe (RGB 0, 242, 254)
          const rVal = Math.round(74 + factor * (0 - 74));
          const gVal = Math.round(79 + factor * (242 - 79));
          const bVal = Math.round(93 + factor * (254 - 93));
          dot.el.style.fill = `rgb(${rVal}, ${gVal}, ${bVal})`;
          dot.isModified = true;
        } else if (dot.isModified) {
          // Smooth decay back to base state
          dot.el.style.opacity = 0.55;
          dot.el.setAttribute('r', 1.2);
          dot.el.style.fill = '#4a4f5d';
          dot.isModified = false;
        }
      });

      if (isHoveredRef.current || active > 0.005) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Reset all dots fully on shutdown
        cachedDots.forEach(dot => {
          dot.el.style.opacity = 0.55;
          dot.el.setAttribute('r', 1.2);
          dot.el.style.fill = '#4a4f5d';
          dot.isModified = false;
        });
        if (glowEl) glowEl.style.opacity = 0;
        rafRef.current = null;
      }
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isBootComplete]);

  // Delhi sits at x = 217.5 in 300 width map (which is center-right), so align left of the marker to prevent overflow.
  const alignLeft = delhiX > 150;

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col justify-between relative group">
      <div className="relative w-full h-[180px] border border-zinc-900/60 rounded bg-zinc-950/20 flex items-center justify-center">
        {/* Soft radial cyan cursor-following light */}
        <div 
          className="map-cursor-glow absolute inset-0 pointer-events-none opacity-0"
          style={{ mixBlendMode: 'screen' }}
        />

        <svg 
          className="w-full h-full" 
          viewBox="0 0 300 180" 
          preserveAspectRatio="xMidYMid meet"
          style={{
            opacity: isBootComplete ? 1 : 0,
            transition: 'opacity 0.8s ease-out 0.2s',
          }}
        >
          {/* Static Dotted World Map (Single Layer) */}
          <g className="map-dots-group">
            {mapDots.map((dot, idx) => (
              <circle
                key={idx}
                cx={dot.x}
                cy={dot.y}
                r={1.2}
                className="map-dot"
                style={{
                  fill: '#4a4f5d',
                  opacity: 0.55,
                }}
              />
            ))}
          </g>

          {/* Delhi, India Location Marker (Step 5) */}
          {isBootComplete && (
            <g 
              className="location-marker cursor-pointer"
              onMouseEnter={handleMarkerMouseEnter}
              onMouseLeave={handleMarkerMouseLeave}
            >
              {/* Outer pulsing ring (2.5s cycle) */}
              <circle
                cx={delhiX}
                cy={delhiY}
                r={4}
                className="delhi-pulse"
                style={{
                  fill: 'none',
                  stroke: 'rgba(6, 182, 212, 0.85)',
                  strokeWidth: 1.2,
                  transformOrigin: `${delhiX}px ${delhiY}px`,
                }}
              />
              {/* Soft glow */}
              <circle
                cx={delhiX}
                cy={delhiY}
                r={10}
                style={{
                  fill: 'rgba(6, 182, 212, 0.35)',
                  filter: 'blur(1px)',
                }}
              />
              {/* Cyan center dot */}
              <circle
                cx={delhiX}
                cy={delhiY}
                r={2.5}
                style={{
                  fill: '#00f2fe',
                }}
              />
            </g>
          )}
        </svg>

        {/* Premium cyber location tooltip */}
        {isTooltipVisible && (
          <div
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            className="absolute z-30 transition-all duration-220 ease-out"
            style={{
              left: alignLeft ? 'auto' : `${(delhiX / 300) * 100}%`,
              right: alignLeft ? `${100 - (delhiX / 300) * 100}%` : 'auto',
              top: `${(delhiY / 180) * 100}%`,
              transform: 'translateY(-100%)',
              paddingBottom: '12px',
            }}
          >
            {/* Tooltip inner card */}
            <div className="delhi-tooltip-card bg-[#111317] border border-[rgba(0,229,255,0.18)] rounded-[16px] p-[16px_18px] w-[250px] shadow-[0_4px_22px_rgba(6,182,212,0.22)] flex flex-col gap-1.5 text-left font-sans select-text pointer-events-auto">
              <div className="flex items-center gap-1.5 text-white font-black text-[11px] uppercase tracking-wide">
                <svg className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                DELHI, INDIA
              </div>
              <div className="text-cyan-400 font-bold text-[10px] tracking-wider uppercase font-mono leading-tight">
                AI Engineer & Mechanical Engineer
              </div>
              <div className="text-zinc-400 text-[10px] leading-relaxed font-light font-mono">
                Currently Building Intelligent AI Experiences
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 pt-2 uppercase">
        <span>LOC: DELHI, INDIA</span>
        <span>NODE STATE: ACTIVE</span>
      </div>
    </div>
  );
}

// ==========================================
// 5. Main Component: Redesigned About Section
// ==========================================
export default function AboutSection() {
  const sectionRef = useRef(null);

  // Time on Earth Refs
  const yearsRef = useRef(null);
  const monthsRef = useRef(null);
  const daysRef = useRef(null);
  const hoursRef = useRef(null);
  const minutesRef = useRef(null);
  const secondsRef = useRef(null);
  const msRef = useRef(null);

  // High-performance time-on-earth tick loop with direct DOM updates (60fps lock)
  useEffect(() => {
    const birthDate = new Date(2006, 8, 16, 0, 0, 0, 0); // Sept 16, 2006

    const updateTimer = () => {
      const now = new Date();
      let years = now.getFullYear() - birthDate.getFullYear();
      let months = now.getMonth() - birthDate.getMonth();
      let days = now.getDate() - birthDate.getDate();

      if (days < 0) {
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
      }
      if (months < 0) {
        months += 12;
        years--;
      }

      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();

      if (yearsRef.current) yearsRef.current.textContent = String(years).padStart(2, '0');
      if (monthsRef.current) monthsRef.current.textContent = String(months).padStart(2, '0');
      if (daysRef.current) daysRef.current.textContent = String(days).padStart(2, '0');
      if (hoursRef.current) hoursRef.current.textContent = String(hours).padStart(2, '0');
      if (minutesRef.current) minutesRef.current.textContent = String(minutes).padStart(2, '0');
      if (secondsRef.current) secondsRef.current.textContent = String(seconds).padStart(2, '0');
      if (msRef.current) msRef.current.textContent = String(milliseconds).padStart(3, '0');
    };

    let frameId;
    const tick = () => {
      updateTimer();
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, []);
  
  // Keep track of which card completed its Framer Motion spring reveal
  const [bootComplete, setBootComplete] = useState({
    profile: false,
    terminal: false,
    map: false,
    skills: false,
    metrics: false,
  });

  const handleRevealComplete = (cardKey) => {
    setBootComplete(p => ({ ...p, [cardKey]: true }));
  };

  const [activeTab, setActiveTab] = useState('education');

  const [completedLines, setCompletedLines] = useState([]);
  const [activeLineText, setActiveLineText] = useState('');
  const [activeLineIdx, setActiveLineIdx] = useState(0);

  // Typewriter effect logic loop for the Terminal Card
  useEffect(() => {
    if (!bootComplete.terminal) return;

    let timer;
    const activeLine = terminalData[activeLineIdx];
    if (!activeLine) {
      // Loop: Wait 6s, clear out text, restart boot-compile type effect
      timer = setTimeout(() => {
        setCompletedLines([]);
        setActiveLineText('');
        setActiveLineIdx(0);
      }, 6000);
      return () => clearTimeout(timer);
    }

    const targetText = activeLine.label + (activeLine.value || '');

    if (activeLineText.length < targetText.length) {
      const nextChar = targetText[activeLineText.length];
      timer = setTimeout(() => {
        setActiveLineText(prev => prev + nextChar);
      }, Math.random() * 15 + 10);
    } else {
      timer = setTimeout(() => {
        setCompletedLines(prev => [...prev, activeLineIdx]);
        setActiveLineText('');
        setActiveLineIdx(prev => prev + 1);
      }, 350);
    }

    return () => clearTimeout(timer);
  }, [bootComplete.terminal, activeLineIdx, activeLineText]);

  // Helper rendering terminal lines
  const renderTerminalLine = (idx, isCurrent = false) => {
    const item = terminalData[idx];
    if (!item) return null;

    if (item.isHeader) {
      return (
        <div key={idx} className="text-zinc-500 font-bold">
          {isCurrent ? activeLineText : item.label}
          {isCurrent && <span className="terminal-cursor-block inline-block w-1.5 h-3.5 bg-cyan-400 ml-1 align-middle" />}
        </div>
      );
    }

    const labelLen = item.label.length;
    let dispLabel = '';
    let dispValue = '';

    if (isCurrent) {
      if (activeLineText.length <= labelLen) {
        dispLabel = activeLineText;
      } else {
        dispLabel = item.label;
        dispValue = activeLineText.slice(labelLen);
      }
    } else {
      dispLabel = item.label;
      dispValue = item.value;
    }

    return (
      <div key={idx} className="flex flex-wrap items-center leading-relaxed">
        <span className="text-cyan-500/80">{dispLabel}</span>
        {dispValue && (
          <span className={item.isStatus 
            ? "text-cyan-400 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)] px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20 text-[10px] tracking-wider ml-1" 
            : "text-white ml-1 font-sans"}>
            {dispValue}
          </span>
        )}
        {isCurrent && <span className="terminal-cursor-block inline-block w-1.5 h-3.5 bg-cyan-400 ml-1 align-middle" />}
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full bg-[#0a0a0c] text-white flex flex-col justify-center px-6 pt-6 md:pt-8 pb-10 md:pb-12 overflow-hidden select-none border-t border-t-zinc-900/60"
    >
      {/* Background Blueprint Grid details - Completely static */}
      <div className="absolute inset-0 blueprint-grid opacity-[0.8] pointer-events-none" />
      
      {/* Ambient Radial background glows - Static */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-900/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-950/5 blur-[120px] pointer-events-none" />

      {/* Scoped CSS Style Tag for blinking cursor and pulse ring only */}
      <style>{`
        @keyframes delhiPulse {
          0% {
            transform: scale(1);
            opacity: 0.95;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes cursorBlink {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 1; }
        }

        @keyframes tooltipEntrance {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .delhi-tooltip-card {
          animation: tooltipEntrance 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .delhi-pulse {
          animation: delhiPulse 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        .terminal-cursor-block {
          animation: cursorBlink 1s infinite;
        }

        .blueprint-grid {
          background-image: 
            linear-gradient(rgba(6, 182, 212, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.02) 1px, transparent 1px);
          background-size: 44px 44px;
        }

        .skill-bar-progress {
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.45);
        }

        /* Keyboard focus visible rings */
        *:focus-visible {
          outline: none;
        }

        /* prefers-reduced-motion media query standards */
        @media (prefers-reduced-motion: reduce) {
          .delhi-pulse, 
          .terminal-cursor-block {
            animation: none !important;
            transition: none !important;
          }
          .skill-bar-progress {
            transition: none !important;
          }
        }
      `}</style>

      {/* Standard Section Header */}
      <SectionHeader
        number="01"
        title="ABOUT ME"
        rightLabel="ENGINEERING PROFILE"
      />

      {/* Main OS status panel bar */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 mb-8 font-mono text-[9px] flex flex-wrap justify-between items-center gap-4 border-b border-zinc-900 pb-4 text-zinc-500 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          <span>PORTFOLIO OS ENGINE: OPERATIONAL</span>
        </div>
        <div className="flex items-center gap-6">
          <span>IDENT_VERIFY: {bootComplete.profile ? 'COMPLETED' : 'PENDING'}</span>
          <span>NET_MAP: {bootComplete.map ? 'ACTIVE' : 'STANDBY'}</span>
          <span>CORE_TELEMETRY: {bootComplete.metrics ? 'ONLINE' : 'BOOTING'}</span>
        </div>
      </div>

      {/* Dashboard 12-Column Layout Grid staggered container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="max-w-7xl mx-auto w-full px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 z-10"
      >
        
        {/* ROW 1: Card 1 (Profile Info) & Card 2 (Network Map) */}
        
        {/* Card 1: Identity Profile (Span 8) */}
        <motion.div 
          variants={cardVariants}
          onAnimationComplete={(def) => def === 'visible' && handleRevealComplete('profile')}
          className="col-span-12 lg:col-span-8"
        >
          <CyberCard
            title="IDENTITY VERIFICATION"
            nodeCode="SECURE_NODE_01"
            isBootComplete={bootComplete.profile}
          >
            <div className="flex flex-col md:flex-row gap-6 items-start h-full justify-between w-full">
              <div className="flex-1 space-y-4">
                <div className="space-y-0.5">
                  <div className="text-zinc-500 font-mono text-[8px] tracking-widest uppercase">NODE REGISTERED ID</div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white font-sans uppercase">KAVYA MAKHAN</h2>
                  <div className="text-cyan-400 font-mono text-xs tracking-wider font-semibold">AI ENGINEER & MECHANICAL ENGINEER</div>
                </div>

                <p className="text-zinc-400 text-xs leading-relaxed max-w-xl font-sans">
                  I operate at the convergence of Artificial Intelligence and Mechanical Engineering. My core focus centers on mapping cognitive learning models directly onto hardware dynamics—constructing intelligent neural control loops, architecting computer vision networks, and engineering autonomous kinetic machinery.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800/40 text-xs font-sans">
                  <div>
                    <span className="block text-zinc-500 font-mono text-[8px] tracking-wider uppercase mb-0.5">CURRENT FOCUS</span>
                    <span className="text-zinc-300 font-semibold">Autonomous Controllers & Embedded AI</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 font-mono text-[8px] tracking-wider uppercase mb-0.5">CORE PHILOSOPHY</span>
                    <span className="text-zinc-300 font-semibold">Embodying virtual intelligence in hardware</span>
                  </div>
                </div>
              </div>

              {/* Visual Target Ring indicator */}
              <div className="flex flex-col items-center justify-center p-4 border border-zinc-800/40 rounded-lg bg-zinc-950/20 w-full md:w-auto self-stretch">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/20" />
                  <div className="absolute w-16 h-16 rounded-full border border-cyan-400/30 flex items-center justify-center bg-cyan-950/5">
                    <svg className="w-7 h-7 text-cyan-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-13.32 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
                    </svg>
                  </div>
                  <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />
                </div>
                <div className="mt-3 text-center font-mono">
                  <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">PROFILE LOADED</div>
                  <div className="text-[7px] text-zinc-500 mt-0.5">ACCESS: SYSTEM_A</div>
                </div>
              </div>
            </div>
          </CyberCard>
        </motion.div>

        {/* Card 2: Interactive Network Map (Span 4) */}
        <motion.div 
          variants={cardVariants}
          onAnimationComplete={(def) => def === 'visible' && handleRevealComplete('map')}
          className="col-span-12 lg:col-span-4"
        >
          <CyberCard
            title="NEURAL NETWORK MAP"
            nodeCode="SECURE_NODE_02"
            isBootComplete={bootComplete.map}
          >
            <NetworkMap isBootComplete={bootComplete.map} />
          </CyberCard>
        </motion.div>

        {/* ROW 2: Card 3 (Terminal), Card 4 (Skills), Card 5 (Metrics) */}

        {/* Card 3: AI Telemetry Terminal (Span 4) */}
        <motion.div 
          variants={cardVariants}
          onAnimationComplete={(def) => def === 'visible' && handleRevealComplete('terminal')}
          className="col-span-12 md:col-span-6 lg:col-span-4 h-[530px] flex flex-col"
        >
          <CyberCard
            title="AI CORE TELEMETRY"
            nodeCode="SECURE_NODE_03"
            isBootComplete={bootComplete.terminal}
          >
            <div className="w-full h-full flex flex-col justify-between font-mono text-[10.5px]">
              <div className="p-3 bg-zinc-950/45 border border-zinc-900/60 rounded flex-1 flex flex-col justify-start min-h-[380px] space-y-1.5 overflow-hidden pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {completedLines.map(idx => renderTerminalLine(idx))}
                {completedLines.length < terminalData.length && renderTerminalLine(activeLineIdx, true)}
              </div>
              <div className="flex justify-between items-center text-[8px] text-zinc-500 pt-2 uppercase border-t border-zinc-900/60 mt-1">
                <span>STREAM: ACTIVE_TTY</span>
                <span>TTY: RES_OK</span>
              </div>
            </div>
          </CyberCard>
        </motion.div>

        {/* Card 4: Skill Spectrum (Span 4) */}
        <motion.div 
          variants={cardVariants}
          onAnimationComplete={(def) => def === 'visible' && handleRevealComplete('skills')}
          className="col-span-12 md:col-span-6 lg:col-span-4 h-[530px] flex flex-col"
        >
          <CyberCard
            title="COGNITIVE SPECTRUM"
            nodeCode="SECURE_NODE_04"
            isBootComplete={bootComplete.skills}
          >
            <div className="w-full h-full flex flex-col justify-between relative">
              {/* Tab Header List */}
              <div 
                className="flex border-b border-zinc-900/60 pb-2 mb-5 gap-1.5 relative z-10" 
                role="tablist"
                aria-label="Cognitive spectrum sections"
              >
                {[
                  { id: 'education', label: 'EDUCATION' },
                  { id: 'interests', label: 'INTERESTS' },
                  { id: 'goals', label: 'GOALS' },
                  { id: 'mission', label: 'MISSION' }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveTab(tab.id)}
                      onKeyDown={(e) => {
                        const tabsList = ['education', 'interests', 'goals', 'mission'];
                        const currentIndex = tabsList.indexOf(activeTab);
                        let nextIndex;
                        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                          nextIndex = (currentIndex + 1) % tabsList.length;
                        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                          nextIndex = (currentIndex - 1 + tabsList.length) % tabsList.length;
                        } else if (e.key === 'Home') {
                          nextIndex = 0;
                        } else if (e.key === 'End') {
                          nextIndex = tabsList.length - 1;
                        } else {
                          return;
                        }
                        e.preventDefault();
                        setActiveTab(tabsList[nextIndex]);
                        // Focus the target button
                        const btn = e.currentTarget.parentNode?.children[nextIndex];
                        if (btn) btn.focus();
                      }}
                      className={`relative px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer rounded-md border ${
                        isActive 
                          ? 'text-white border-cyan-500/30 bg-cyan-950/20' 
                          : 'text-zinc-500 border-transparent hover:text-zinc-300'
                      }`}
                      style={{
                        outline: 'none',
                        boxShadow: isActive ? '0 0 8px rgba(6, 182, 212, 0.15)' : 'none',
                      }}
                    >
                      {/* Animated pill background */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 border border-cyan-500/40 rounded-md bg-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.25)] z-[-1]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Panel contents with Framer Motion transitions */}
              <div className="relative h-[395px] w-full z-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  {bootComplete.skills && (
                    <motion.div
                      key={activeTab}
                      role="tabpanel"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="h-[395px] overflow-y-auto text-left font-sans pr-1 scrollbar-thin scrollbar-thumb-zinc-800"
                    >
                      {activeTab === 'education' && (
                        <div className="space-y-6 font-sans text-xs pt-1">
                          {/* Card 1: B.Tech */}
                          <div className="border-l-2 border-cyan-500/40 pl-3.5 py-0.5 space-y-1 relative">
                            <div className="absolute w-2 h-2 rounded-full bg-cyan-400 -left-[5px] top-1.5 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                            <div className="flex justify-between items-baseline">
                              <h4 className="text-white font-bold text-[10.5px] uppercase tracking-wide">B.Tech Mechanical Engineering</h4>
                              <span className="text-[7.5px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-1.5 py-0.5 rounded uppercase">Current</span>
                            </div>
                            <div className="text-[8.5px] text-zinc-500 font-mono">2024 – 2028</div>
                            <div className="text-zinc-400 font-mono text-[9.5px]">Netaji Subhas University of Technology</div>
                          </div>

                          {/* Card 2: Class XII */}
                          <div className="border-l-2 border-zinc-800 pl-3.5 py-0.5 space-y-1 relative">
                            <div className="absolute w-2 h-2 rounded-full bg-zinc-700 -left-[5px] top-1.5" />
                            <div className="flex justify-between items-baseline">
                              <h4 className="text-zinc-300 font-bold text-[10.5px] uppercase tracking-wide">Higher Secondary (Class XII)</h4>
                              <span className="text-[8px] font-mono text-zinc-500 bg-zinc-950/20 border border-zinc-900 px-1.5 py-0.5 rounded">2024</span>
                            </div>
                            <div className="text-[9.5px] text-zinc-400 font-mono">Vivekanand International School</div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {['Physics', 'Chemistry', 'Mathematics', 'Computer Science'].map((sub, i) => (
                                <span key={i} className="text-[8px] font-mono text-zinc-500 bg-zinc-900/40 px-1.5 py-0.5 rounded border border-zinc-900">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Card 3: Class X */}
                          <div className="border-l-2 border-zinc-800 pl-3.5 py-0.5 space-y-1 relative">
                            <div className="absolute w-2 h-2 rounded-full bg-zinc-700 -left-[5px] top-1.5" />
                            <div className="flex justify-between items-baseline">
                              <h4 className="text-zinc-300 font-bold text-[10.5px] uppercase tracking-wide">Secondary (Class X)</h4>
                              <span className="text-[8px] font-mono text-zinc-500 bg-zinc-950/20 border border-zinc-900 px-1.5 py-0.5 rounded">2022</span>
                            </div>
                            <div className="text-[9.5px] text-zinc-400 font-mono">Vivekanand International School</div>
                            <p className="text-zinc-500 text-[9.5px] leading-relaxed">
                              Strong academic foundation in Mathematics and Science.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'interests' && (
                        <div className="space-y-4 font-sans text-xs pt-1">
                          {[
                            {
                              title: "AI & Large Language Models",
                              desc: "Exploring LLMs, AI agents, automation, and intelligent systems."
                            },
                            {
                              title: "Creative Frontend",
                              desc: "Building immersive interfaces using React, GSAP, Framer Motion and Three.js."
                            },
                            {
                              title: "Mechanical Design",
                              desc: "Interested in CAD, manufacturing, automation and intelligent machines."
                            }
                          ].map((interest, i) => (
                            <div key={i} className="p-4 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:border-cyan-500/20 transition-colors duration-300">
                              <h4 className="text-white font-bold text-[10px] uppercase tracking-wide flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                                {interest.title}
                              </h4>
                              <p className="text-zinc-400 text-[9.5px] mt-1 leading-relaxed">
                                {interest.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'goals' && (
                        <div className="space-y-5 font-sans text-xs pt-1">
                          {[
                            "Become an AI Engineer.",
                            "Build world-class AI products.",
                            "Create memorable interactive user experiences.",
                            "Bridge Mechanical Engineering with Artificial Intelligence.",
                            "Contribute to impactful real-world technology."
                          ].map((goal, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="text-cyan-400 font-bold text-[9px] select-none pt-0.5">▶</span>
                              <span className="text-zinc-300 leading-relaxed text-[11px] font-mono">{goal}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'mission' && (
                        <div className="space-y-5 font-sans text-xs pt-1">
                          {[
                            "Build intelligent software that solves real engineering problems.",
                            "Continuously learn emerging AI technologies.",
                            "Design experiences that combine performance with beautiful interaction.",
                            "Create products people genuinely enjoy using."
                          ].map((mission, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="text-cyan-500/60 font-bold text-[9px] select-none pt-0.5">⚡</span>
                              <span className="text-zinc-300 leading-relaxed text-[11px] font-mono">{mission}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card Footer status info */}
              <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 pt-2 uppercase border-t border-zinc-900/60 mt-1">
                <span>SPECTRUM: ACTIVE_TAB</span>
                <span className="text-cyan-500/70 font-semibold">{activeTab}</span>
              </div>
            </div>
          </CyberCard>
        </motion.div>

        {/* Card 5: Engineering Metrics (Span 4) */}
        <motion.div 
          variants={cardVariants}
          onAnimationComplete={(def) => def === 'visible' && handleRevealComplete('metrics')}
          className="col-span-12 lg:col-span-4 h-[530px] flex flex-col"
        >
          <CyberCard
            title="SYSTEM METRICS"
            nodeCode="SECURE_NODE_05"
            isBootComplete={bootComplete.metrics}
          >
            <div className="w-full h-full flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 flex-1 items-center py-4">
                {metricsData.map((m, idx) => (
                  <div 
                    key={idx} 
                    className="p-5 border border-zinc-900/60 rounded bg-zinc-950/20 flex flex-col justify-between min-h-[155px] hover:border-cyan-500/20 transition-colors duration-300"
                  >
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider leading-tight">{m.label}</span>
                    <div className="text-2xl font-black text-white font-sans mt-1">
                      <CountUp end={m.value} trigger={bootComplete.metrics} />
                      <span className="text-cyan-400 ml-0.5 font-mono">{m.suffix}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 pt-2 uppercase border-t border-zinc-900/60 mt-1">
                <span>STAT_GRID: ONLINE</span>
                <span>TELEMETRY: NOMINAL</span>
              </div>
            </div>
          </CyberCard>
        </motion.div>

      </motion.div>

      {/* TIME ON EARTH Live Telemetry Counter */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="max-w-7xl mx-auto w-full px-6 md:px-8 mt-8 z-10"
      >
        <CyberCard
          title="TIME ON EARTH"
          nodeCode="SECURE_NODE_06"
          isBootComplete={true}
        >
          {/* Content area */}
          <div className="w-full h-full flex flex-col justify-between text-left">
            <div className="flex flex-col gap-6">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                  <span>⌛ TIME ON EARTH</span>
                </h3>
                <p className="text-zinc-500 font-mono text-[10px] tracking-wider">
                  Present on this planet since September 16, 2006
                </p>
              </div>

              {/* Counter Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 w-full">
                {[
                  { label: 'YEARS', ref: yearsRef },
                  { label: 'MONTHS', ref: monthsRef },
                  { label: 'DAYS', ref: daysRef },
                  { label: 'HOURS', ref: hoursRef },
                  { label: 'MINUTES', ref: minutesRef },
                  { label: 'SECONDS', ref: secondsRef },
                  { label: 'MILLISECONDS', ref: msRef, isMs: true },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      type: 'spring',
                      stiffness: 120,
                      damping: 18,
                      delay: idx * 0.05
                    }}
                    className="p-4 border border-zinc-900/60 rounded-lg bg-zinc-950/20 flex flex-col items-center justify-center min-h-[90px] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] select-none"
                  >
                    <span 
                      ref={item.ref}
                      className={`font-sans font-black text-white ${item.isMs ? 'text-2xl min-w-[3.2rem]' : 'text-3xl min-w-[2.2rem]'} text-center tracking-tight`}
                    >
                      00
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider mt-1.5">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer status info */}
            <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 pt-2 uppercase border-t border-zinc-900/60 mt-6">
              <span>SYSTEM_TIME: RUNNING</span>
              <span>LIFE_CLOCK: ACTIVE</span>
            </div>
          </div>
        </CyberCard>
      </motion.div>
    </section>
  );
}
