import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const sections = [
  { id: 'home', label: 'HOME' },
  { id: 'about', label: 'ABOUT ME' },
  { id: 'skills', label: 'MY SKILLS' },
  { id: 'projects', label: 'RECENT PROJECTS' },
  { id: 'certificates', label: 'CERTIFICATES' },
  { id: 'contact', label: "LET'S TALK" },
];

export default function SectionNavigator({ activeSection, handleNavClick }) {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredId, setHoveredId] = useState(null);

  // Spring transition curve mimicking Apple's motion language (with overshoot)
  const springTransition = shouldReduceMotion
    ? { duration: 0.25, ease: 'easeInOut' }
    : {
        type: 'spring',
        stiffness: 320,
        damping: 24,
        mass: 0.7,
      };

  return (
    <div 
      className="fixed right-[36px] top-1/2 -translate-y-1/2 z-[90] hidden md:flex flex-col items-center select-none"
      role="navigation"
      aria-label="Section navigation"
    >
      <div className="relative flex flex-col gap-[28px] items-center">
        {/* Interactive dots representing portfolio sections */}
        {sections.map((item) => {
          const isActive = item.id === activeSection;
          const isHovered = hoveredId === item.id;
          const showLabel = isActive || isHovered;

          return (
            <div 
              key={item.id} 
              className="relative flex items-center justify-end w-[14px] h-[14px]"
            >
              {/* Dynamic sliding text label */}
              <AnimatePresence>
                {showLabel && (
                  <motion.span
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
                    transition={springTransition}
                    className={`absolute right-[28px] whitespace-nowrap text-[11px] font-semibold tracking-[0.35em] uppercase font-sans pointer-events-none select-none transition-colors duration-200 ${
                      isActive ? 'text-white/90' : 'text-white/65'
                    }`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Dot Button */}
              <button
                onClick={(e) => handleNavClick(e, item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative flex items-center justify-center w-[14px] h-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--bg-dark)] rounded-full transition-shadow duration-200 cursor-pointer"
                aria-label={`Go to ${item.label} section`}
                aria-current={isActive ? 'true' : 'false'}
              >
                {/* Visual Circle Indicator */}
                <motion.div
                  className="rounded-full bg-zinc-400 opacity-40"
                  animate={
                    isActive
                      ? {
                          scale: 1,
                          width: 12,
                          height: 12,
                          backgroundColor: 'var(--accent-color)',
                          opacity: 1,
                          boxShadow:
                            '0 0 6px rgba(var(--accent-rgb), 0.6), 0 0 18px rgba(var(--accent-rgb), 0.25)',
                        }
                      : {
                          scale: 1,
                          width: 6,
                          height: 6,
                          backgroundColor: '#a1a1aa',
                          opacity: 0.40,
                          boxShadow: '0 0 0px rgba(0,0,0,0)',
                        }
                  }
                  whileHover={
                    !isActive
                      ? {
                          scale: 1,
                          width: 8,
                          height: 8,
                          opacity: 0.8,
                          backgroundColor: '#ffffff',
                        }
                      : {}
                  }
                  transition={springTransition}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
