import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, animate, useReducedMotion, useTransform, useMotionTemplate, AnimatePresence } from 'framer-motion';
import SectionHeader from '../navigation/SectionHeader';
import {
  JsIcon,
  ReactIcon,
  HtmlIcon,
  CssIcon,
  PythonIcon,
  NodeIcon,
  GitIcon,
  GithubIcon,
  MongodbIcon,
  GsapIcon,
  VsCodeIcon,
  ThreeJsIcon,
  FigmaMark,
  LeetcodeIcon
} from './Icons';

// ==========================================
// 1. SkillPill Subcomponent (Apple VisionOS Physics)
// ==========================================
function SkillPill({ name, category, registerPill, unregisterPill, prefersReducedMotion }) {
  const ref = useRef(null);

  // Motion values for magnetic repulsion
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Critically damped springs for ultra-low latency, clean response (Apple VisionOS feel)
  const springX = useSpring(x, { stiffness: 280, damping: 28 });
  const springY = useSpring(y, { stiffness: 280, damping: 28 });

  // Motion values for dragging
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const isDraggingRef = useRef(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  // Register pill position triggers
  useEffect(() => {
    if (!prefersReducedMotion) {
      registerPill(name, ref.current, x, y, isDraggingRef);
      return () => unregisterPill(name);
    }
  }, [name, prefersReducedMotion, registerPill, unregisterPill, x, y]);

  // Subtle organic float animation offsets (2-4px)
  const floatX = useMemo(() => [0, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 0], []);
  const floatY = useMemo(() => [0, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 0], []);
  const floatDuration = useMemo(() => 5 + Math.random() * 4, []);
  const floatDelay = useMemo(() => Math.random() * 2, []);

  const handleDragStart = () => {
    isDraggingRef.current = true;
    setIsDraggingState(true);
    // Instantly collapse repulsion to home center so it doesn't drift during drag
    x.set(0);
    y.set(0);
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    setIsDraggingState(false);
    // Critically damped spring back (no overshoot/wobble)
    animate(dragX, 0, { type: 'spring', stiffness: 300, damping: 30 });
    animate(dragY, 0, { type: 'spring', stiffness: 300, damping: 30 });
  };

  // Color theme mapping for categories
  const theme = useMemo(() => {
    switch (category) {
      case 'frontend':
        return {
          borderGlow: 'hover:border-purple-500/30 hover:shadow-[0_0_12px_rgba(168,85,247,0.15)]',
          draggingGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)] border-purple-400/40',
          textColor: 'hover:text-purple-300'
        };
      case 'backend':
        return {
          borderGlow: 'hover:border-blue-500/30 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)]',
          draggingGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)] border-blue-400/40',
          textColor: 'hover:text-blue-300'
        };
      case 'ai':
        return {
          borderGlow: 'hover:border-violet-500/30 hover:shadow-[0_0_12px_rgba(139,92,246,0.15)]',
          draggingGlow: 'shadow-[0_0_20px_rgba(139,92,246,0.4)] border-violet-400/40',
          textColor: 'hover:text-violet-300'
        };
      default:
        return {
          borderGlow: 'hover:border-[rgba(var(--accent-rgb),0.3)] hover:shadow-[0_0_12px_rgba(var(--accent-rgb),0.15)]',
          draggingGlow: 'shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)] border-[rgba(var(--accent-rgb),0.4)]',
          textColor: 'hover:text-cyan-300'
        };
    }
  }, [category]);

  const pillVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 22,
      }
    }
  };

  return (
    <motion.div
      variants={pillVariants}
      className="touch-none select-none inline-block w-fit"
    >
      {/* Repulsion Layer */}
      <motion.div
        style={{
          x: prefersReducedMotion ? 0 : springX,
          y: prefersReducedMotion ? 0 : springY,
        }}
      >
        {/* Drag Layer */}
        <motion.div
          ref={ref}
          drag={!prefersReducedMotion}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{
            x: prefersReducedMotion ? 0 : dragX,
            y: prefersReducedMotion ? 0 : dragY,
          }}
          className={`cursor-grab ${isDraggingState ? 'cursor-grabbing z-30' : 'z-10'}`}
        >
          {/* Float Layer */}
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : {
                  x: floatX,
                  y: floatY,
                }
            }
            transition={
              prefersReducedMotion
                ? {}
                : {
                  duration: floatDuration,
                  delay: floatDelay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
            }
          >
            {/* Visual Pill Body */}
            <motion.div
              whileHover={
                prefersReducedMotion
                  ? {}
                  : {
                    y: -5,
                    scale: 1.03,
                    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
                  }
              }
              className={`px-4 py-2 text-xs md:text-sm text-zinc-400 bg-[var(--card-bg-alt)]/50 border border-[var(--border-color)] rounded-full backdrop-blur-md transition-all duration-300 font-sans-body ease-out ${isDraggingState
                ? theme.draggingGlow
                : `${theme.borderGlow} ${theme.textColor}`
                }`}
            >
              {name}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const OrbitIcon = React.memo(function OrbitIcon({ skill, index, total, radius, rotation, hoveredSkill, setHoveredSkill, activeSkill, setActiveSkill, isHoveredRef, hoverTimeoutRef }) {
  const angle = (index * 360) / total;
  const angleInRadians = (angle * Math.PI) / 180;

  // Base offset to center the absolute-positioned icon (using tailwind custom properties for responsiveness)
  const leftPos = `calc(50% + ${Math.cos(angleInRadians) * radius}px - var(--icon-half-size))`;
  const topPos = `calc(50% + ${Math.sin(angleInRadians) * radius}px - var(--icon-half-size))`;

  const hoverOffset = useMotionValue(0);
  const springHoverOffset = useSpring(hoverOffset, { stiffness: 300, damping: 20 });

  const isHovered = hoveredSkill?.name === skill.name;
  const isAnyHovered = hoveredSkill !== null;
  const isDimmed = isAnyHovered && !isHovered;

  // Radial translation on hover: translates outward by 8px along its respective radial angle
  const x = useTransform(springHoverOffset, (offset) => Math.cos(angleInRadians) * offset);
  const y = useTransform(springHoverOffset, (offset) => Math.sin(angleInRadians) * offset);

  // Inverted rotation to keep icons perfectly upright at all times
  const negRotation = useTransform(rotation, (r) => -r);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredSkill(skill);
    setActiveSkill(skill);
    hoverOffset.set(8); // Translate outward by 8px
    isHoveredRef.current = true; // Pause orbit rotation immediately
  };

  const handleMouseLeave = () => {
    hoverOffset.set(0);
    // Defer resetting hoveredSkill to see if we enter another icon immediately
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSkill(null);
      isHoveredRef.current = false;
    }, 50); // Small 50ms window to catch neighboring icon entry
  };

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'absolute',
        left: leftPos,
        top: topPos,
        x,
        y,
        rotate: negRotation,
        zIndex: isHovered ? 30 : 10,
      }}
      className="w-[62px] h-[62px] [--icon-half-size:31px] origin-center pointer-events-auto flex items-center justify-center"
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.15 : 1,
          opacity: isDimmed ? 0.7 : 1.0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          boxShadow: isHovered ? `0 0 25px ${skill.color}80` : 'none',
          borderColor: isHovered ? skill.color : 'rgba(255, 255, 255, 0.08)',
          color: isHovered ? skill.color : '#a1a1aa',
        }}
        className="w-[38px] h-[38px] md:w-[42px] md:h-[42px] lg:w-[46px] lg:h-[46px] rounded-full bg-[var(--card-bg-alt)]/95 border backdrop-blur-md flex items-center justify-center cursor-pointer transition-colors duration-300"
      >
        <div className="w-[50%] h-[50%] flex items-center justify-center">
          <skill.icon className="w-full h-full object-contain" />
        </div>
      </motion.div>
    </motion.div>
  );
});

// Data array for Orbit skills
const orbitSkills = [
  {
    name: 'React',
    icon: ReactIcon,
    color: '#61dafb',
    category: 'Frontend Library',
    description: 'Building interactive, component-driven user interfaces using modern React patterns.'
  },
  {
    name: 'JavaScript',
    icon: JsIcon,
    color: '#f7df1e',
    category: 'Programming Language',
    description: 'Core scripting language for web development, powering interactive client-side logic.'
  },
  {
    name: 'HTML5',
    icon: HtmlIcon,
    color: '#e34f26',
    category: 'Markup Language',
    description: 'Semantic markup structure for accessible and SEO-friendly modern web documents.'
  },
  {
    name: 'CSS3',
    icon: CssIcon,
    color: '#1572b6',
    category: 'Styling System',
    description: 'Premium responsive design systems using modern flexbox, grid, and variables.'
  },
  {
    name: 'Python',
    icon: PythonIcon,
    color: '#3776ab',
    category: 'General Purpose',
    description: 'Backend services, automated scripting, data engineering, and machine learning.'
  },
  {
    name: 'Node.js',
    icon: NodeIcon,
    color: '#339933',
    category: 'Runtime Environment',
    description: 'Scalable server-side applications built on Chrome\'s V8 JavaScript engine.'
  },
  {
    name: 'Git',
    icon: GitIcon,
    color: '#f05032',
    category: 'Version Control',
    description: 'Distributed version control system tracking source code history and revisions.'
  },
  {
    name: 'GitHub',
    icon: GithubIcon,
    color: '#ffffff',
    category: 'Collaborative Hub',
    description: 'Cloud repository hosting, automating actions, CI/CD, and pull request reviews.'
  },
  {
    name: 'MongoDB',
    icon: MongodbIcon,
    color: '#47a248',
    category: 'NoSQL Database',
    description: 'Document-oriented database storing scalable, schema-less JSON-like payloads.'
  },
  {
    name: 'GSAP',
    icon: GsapIcon,
    color: '#88ce02',
    category: 'Animation Engine',
    description: 'Professional-grade high-performance web animations and scroll timelines.'
  },
  {
    name: 'VS Code',
    icon: VsCodeIcon,
    color: '#007acc',
    category: 'Code Editor',
    description: 'Lightweight, extensible code editor customized for rapid web building.'
  },
  {
    name: 'Three.js',
    icon: ThreeJsIcon,
    color: '#ffffff',
    category: '3D Graphics Engine',
    description: 'GPU-accelerated 3D graphics rendering in web browsers utilizing WebGL.'
  },
  {
    name: 'Figma',
    icon: FigmaMark,
    color: '#ff3366',
    category: 'Design System',
    description: 'Vector-based interface mockup tool facilitating designer-to-developer handoff.'
  },
  {
    name: 'LeetCode',
    icon: LeetcodeIcon,
    color: '#ffa116',
    category: 'Problem Solving',
    description: 'Algorithmic puzzle platform for mastering data structures and efficiency.'
  }
];

// ==========================================
// 3. Main Skills Component
// ==========================================
export default function Skills() {
  const containerRef = useRef(null);
  const registryRef = useRef([]);
  const prefersReducedMotion = useReducedMotion() || false;

  const [activeSkill, setActiveSkill] = useState(orbitSkills[0]);
  const [hoveredSkill, setHoveredSkill] = useState(null);

  // Orbit rotation controls using requestAnimationFrame for smooth pause/resume
  const rotation = useMotionValue(0);
  const isHoveredRef = useRef(false);
  const angleRef = useRef(0);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let lastTime = performance.now();
    let animationFrameId;

    const updateRotation = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isHoveredRef.current) {
        // One full revolution (360 degrees) every 55 seconds (55000 ms)
        // Speed = 360 / 55000 = 0.006545 degrees per millisecond
        angleRef.current = (angleRef.current + 0.006545 * delta) % 360;
        rotation.set(angleRef.current);
      }

      animationFrameId = requestAnimationFrame(updateRotation);
    };

    animationFrameId = requestAnimationFrame(updateRotation);
    return () => cancelAnimationFrame(animationFrameId);
  }, [rotation]);

  // Window size tracking for responsive orbit radius
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const radius = isMobile ? 110 : isTablet ? 165 : 216;

  // 3D Perspective Tilt on mouse move
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { stiffness: 150, damping: 22 });
  const springTiltY = useSpring(tiltY, { stiffness: 150, damping: 22 });

  const handleOrbitMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const factorX = (y / (rect.height / 2)) * 5; // Max 5 degrees
    const factorY = -(x / (rect.width / 2)) * 5;
    tiltX.set(factorX);
    tiltY.set(factorY);
  };

  const handleOrbitMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    setHoveredSkill(null);
    isHoveredRef.current = false; // Resume orbit rotation smoothly
  };

  const categories = useMemo(() => [
    {
      id: 'frontend',
      title: 'FRONTEND',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'GSAP'],
    },
    {
      id: 'backend',
      title: 'BACKEND',
      skills: ['Python', 'FastAPI', 'Flask', 'Node.js', 'REST APIs'],
    },
    {
      id: 'ai',
      title: 'AI',
      skills: ['Prompt Engineering', 'Large Language Models (LLMs)', 'AI Agent Development', 'Machine Learning', 'Data Analysis'],
    },
    {
      id: 'dev_tools',
      title: 'DEVELOPMENT TOOLS',
      skills: ['Git', 'GitHub', 'VS Code', 'Cursor', 'Antigravity', 'Figma', 'Framer', 'Vercel', 'Railway', 'Render'],
    }
  ], []);

  // Registry managers
  const registerPill = React.useCallback((id, element, x, y, isDraggingRef) => {
    if (registryRef.current.some((p) => p.id === id)) return;
    registryRef.current.push({
      id,
      element,
      x,
      y,
      isDraggingRef,
      centerX: 0,
      centerY: 0,
    });
  }, []);

  const unregisterPill = React.useCallback((id) => {
    registryRef.current = registryRef.current.filter((p) => p.id !== id);
  }, []);

  // Compute original center of pills relative to document page coordinates
  const recalculateCenters = React.useCallback(() => {
    if (prefersReducedMotion) return;
    registryRef.current.forEach((pill) => {
      if (!pill.element) return;
      const rect = pill.element.getBoundingClientRect();
      const currentX = pill.x.get();
      const currentY = pill.y.get();
      pill.centerX = rect.left + rect.width / 2 + window.scrollX - currentX;
      pill.centerY = rect.top + rect.height / 2 + window.scrollY - currentY;
    });
  }, [prefersReducedMotion]);

  // Telemetry updates for magnetic repulsion (Apple VisionOS Tuning)
  const handleMouseMove = (e) => {
    if (prefersReducedMotion) return;
    const pageX = e.pageX;
    const pageY = e.pageY;
    const REPEL_RADIUS = 120; // repulsion boundary (px)
    const MAX_REPEL = 18;     // max displacement (px) - subtle & elegant

    registryRef.current.forEach((pill) => {
      if (pill.isDraggingRef.current) return;

      const dx = pill.centerX - pageX;
      const dy = pill.centerY - pageY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_RADIUS) {
        // Smooth non-linear decay
        const force = Math.pow((REPEL_RADIUS - dist) / REPEL_RADIUS, 1.6) * MAX_REPEL;
        const angle = Math.atan2(dy, dx);

        const targetX = Math.cos(angle) * force;
        const targetY = Math.sin(angle) * force;

        pill.x.set(targetX);
        pill.y.set(targetY);
      } else {
        // Reset when mouse exits boundaries
        if (pill.x.get() !== 0 || pill.y.get() !== 0) {
          pill.x.set(0);
          pill.y.set(0);
        }
      }
    });
  };

  const handleMouseEnter = () => {
    recalculateCenters();
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    registryRef.current.forEach((pill) => {
      pill.x.set(0);
      pill.y.set(0);
    });
  };

  // Recalculate coordinates after layout settles
  useEffect(() => {
    const timer = setTimeout(() => {
      recalculateCenters();
    }, 1200);

    window.addEventListener('resize', recalculateCenters);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', recalculateCenters);
    };
  }, [recalculateCenters]);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
      }
    }
  };

  const quadrantVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: 'easeOut',
      }
    }
  };

  return (
    <section
      id="skills"
      className="relative min-h-screen bg-[var(--bg-dark)] text-white flex flex-col pt-14 pb-8 overflow-hidden select-none skills-section"
      style={{
        contain: 'layout paint style',
      }}
    >
      <SectionHeader
        number="02"
        title="MY SKILLS"
        rightLabel="TECHNICAL INDEX"
      />

      {/* Balanced layout: centered flex container with visual placeholder and right-aligned skills panel */}
      <div className="mx-auto w-full max-w-7xl px-6 z-10 relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 my-auto lg:-translate-x-6">
        {/* Left Side: Interactive 3D Skill Orbit */}
        <div
          id="skills-orbit-container"
          className="flex-1 flex items-center justify-center w-full min-h-[330px] md:min-h-[460px] lg:min-h-[530px] relative"
        >
          <motion.div
            onMouseMove={handleOrbitMouseMove}
            onMouseLeave={handleOrbitMouseLeave}
            style={{
              rotateX: springTiltX,
              rotateY: springTiltY,
              transformStyle: "preserve-3d",
              perspective: 1000,
            }}
            className="relative flex items-center justify-center w-[276px] h-[276px] md:w-[405px] md:h-[405px] lg:w-[515px] lg:h-[515px] mx-auto select-none"
          >
            {/* Center Panel (Fixed, does not rotate but tilts) */}
            <div
              className="absolute w-[138px] h-[138px] md:w-[175px] md:h-[175px] lg:w-[212px] lg:h-[212px] rounded-full bg-[var(--card-bg-alt)]/95 border border-[var(--border-color)] backdrop-blur-xl flex items-center justify-center z-20 transition-all duration-500 ease-out overflow-hidden"
              style={{
                transform: 'translateZ(35px)',
                boxShadow: `0 0 45px ${activeSkill.color}15, inset 0 0 25px ${activeSkill.color}05`,
                borderColor: `${activeSkill.color}22`
              }}
            >
              {/* Radial glow background inside center panel */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none transition-all duration-500 ease-out"
                style={{
                  background: `radial-gradient(circle at center, ${activeSkill.color}, transparent 70%)`
                }}
              />

              <AnimatePresence>
                <motion.div
                  key={activeSkill.name}
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-6 w-full h-full select-none"
                >
                  <div
                    className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center mb-1.5 transition-colors duration-300"
                    style={{ color: activeSkill.color }}
                  >
                    <activeSkill.icon className="w-full h-full" />
                  </div>

                  <h4 className="font-sans font-bold text-[10px] md:text-[11px] lg:text-xs uppercase tracking-wider text-white">
                    {activeSkill.name}
                  </h4>

                  <span className="font-mono text-[7px] md:text-[8px] lg:text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5 mb-1">
                    {activeSkill.category}
                  </span>

                  <p className="font-sans text-[8.5px] md:text-[9px] lg:text-[11px] text-zinc-400 leading-normal max-w-[120px] md:max-w-[150px] lg:max-w-[190px]">
                    {activeSkill.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Rotating highlight dot */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ ease: "linear", duration: 16, repeat: Infinity }}
              className="absolute w-[86%] h-[86%] rounded-full pointer-events-none"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full blur-[1.5px]"
                style={{
                  backgroundColor: activeSkill.color,
                  boxShadow: `0 0 8px ${activeSkill.color}, 0 0 16px ${activeSkill.color}`
                }}
              />
            </motion.div>

            {/* Rotating Orbit Container */}
            <motion.div
              style={{
                rotate: rotation,
                transformStyle: "preserve-3d",
              }}
              className="absolute w-full h-full rounded-full flex items-center justify-center pointer-events-none"
            >
              {/* Outer glowing ring */}
              <div className="absolute w-[86%] h-[86%] rounded-full border border-[var(--border-color)] shadow-[0_0_50px_rgba(255,255,255,0.01)]" />

              {/* Inner dashed ring */}
              <div className="absolute w-[60%] h-[60%] rounded-full border border-dashed border-[var(--border-color)] opacity-40" />

              {/* Render Orbit Icons */}
              {orbitSkills.map((skill, index) => (
                <OrbitIcon
                  key={skill.name}
                  skill={skill}
                  index={index}
                  total={orbitSkills.length}
                  radius={radius}
                  rotation={rotation}
                  hoveredSkill={hoveredSkill}
                  setHoveredSkill={setHoveredSkill}
                  activeSkill={activeSkill}
                  setActiveSkill={setActiveSkill}
                  isHoveredRef={isHoveredRef}
                  hoverTimeoutRef={hoverTimeoutRef}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side Container with relative positioning for AIKAV placeholder */}
        <div className="relative shrink-0 self-center w-full lg:max-w-[560px] xl:max-w-[600px]">
          {/* Absolute Placeholder for KaviAICore */}
          <div
            id="aikav-placeholder-skills"
            className="absolute -top-36 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:-top-64 lg:-left-44 w-[120px] h-[120px] pointer-events-none"
            style={{
              zIndex: 998,
            }}
          />

          {/* Right Side Compact Glass Panel */}
          <motion.div
            ref={containerRef}
            id="skills-card-panel"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative rounded-3xl overflow-hidden bg-[var(--card-bg)]/60 border border-[var(--border-color)] backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] w-full grid grid-cols-1 md:grid-cols-2"
          >
            {/* Subtle background glow mapping */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.04),transparent_60%)] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.03),transparent_60%)] pointer-events-none" />

            {/* Overlay grid mesh */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.002)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.002)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

            {/* Corner highlights */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-purple-500/20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-blue-500/20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-blue-500/20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-purple-500/20 pointer-events-none" />

            {categories.map((cat, idx) => {
              // Soft inner borders for perfectly equal quadrants
              let borderClass = '';
              if (idx === 0) borderClass = 'border-b md:border-r border-[var(--border-color)]';
              else if (idx === 1) borderClass = 'border-b border-[var(--border-color)]';
              else if (idx === 2) borderClass = 'border-b md:border-b-0 md:border-r border-[var(--border-color)]';
              else if (idx === 3) borderClass = '';

              return (
                <motion.div
                  key={cat.id}
                  variants={quadrantVariants}
                  className={`py-5 px-6 md:py-6 md:px-7 flex flex-col justify-start min-h-[190px] md:min-h-[220px] relative group/quadrant ${borderClass}`}
                >
                  {/* Category Header */}
                  <motion.div variants={titleVariants} className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    <h3 className="font-mono-code text-[11px] font-semibold tracking-widest text-zinc-500 uppercase select-none">
                      {cat.title}
                    </h3>
                  </motion.div>

                  {/* Left Aligned, Non-stretching Skills Container */}
                  <div className="flex flex-wrap gap-2.5 max-w-md justify-start items-center">
                    {cat.skills.map((skill) => (
                      <SkillPill
                        key={skill}
                        name={skill}
                        category={cat.id}
                        registerPill={registerPill}
                        unregisterPill={unregisterPill}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
