import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const navItems = [
  { id: 'home', label: 'HOME' },
  { id: 'about', label: 'ABOUT' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'certificates', label: 'CERTIFICATES' },
  { id: 'contact', label: "LET'S TALK" }
];

function MobileNavbar({ activeSection, handleNavClick }) {
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);

  // Animation and interaction lock state (prevents accidental double taps)
  const isAnimatingRef = useRef(false);

  // Long press haptic & interaction states (only active when closed)
  const [isPressing, setIsPressing] = useState(false);
  const pressTimeoutRef = useRef(null);

  // Snappy spring transition curve mimicking Apple/VisionOS/Nothing OS (completing in ~220ms)
  const springTransition = shouldReduceMotion
    ? { duration: 0.20, ease: 'easeInOut' }
    : {
        type: 'spring',
        stiffness: 480,
        damping: 35,
        mass: 0.8,
      };

  const toggleMenu = () => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsOpen((prev) => !prev);

    // Cooldown duration matches the animation transition timeframe (220ms)
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 220);
  };

  const startPress = (e) => {
    if (isAnimatingRef.current) return;
    // Prevent double triggers on touch devices firing mouse events
    if (e.type === 'mousedown' && 'ontouchstart' in window) return;

    setIsPressing(true);

    pressTimeoutRef.current = setTimeout(() => {
      // Trigger haptic vibration on long press activation
      if (navigator.vibrate) {
        try {
          navigator.vibrate(10);
        } catch (err) {
          console.warn('Vibration blocked or unsupported:', err);
        }
      }
    }, 250);
  };

  const endPress = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }

    if (isPressing) {
      setIsPressing(false);
      toggleMenu();
    }
  };

  const cancelPress = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    setIsPressing(false);
  };

  const releaseScrollLock = () => {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    if (window.lenis) {
      window.lenis.start();
    }
  };

  const handleItemClick = (e, sectionId) => {
    if (isAnimatingRef.current) return;
    
    // Release scroll lock synchronously BEFORE scroll is triggered
    releaseScrollLock();
    // Scroll to section
    handleNavClick(e, sectionId);
    // Morph back into circular hamburger trigger
    toggleMenu();
  };

  // 1. Manage scroll locking, touch-action locking, and Lenis scroll engine locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      if (window.lenis) {
        window.lenis.stop();
      }
    } else {
      releaseScrollLock();
    }

    return () => {
      releaseScrollLock();
    };
  }, [isOpen]);

  // 2. Dismiss logic: close on orientation change, window resize, or hashchange
  useEffect(() => {
    if (!isOpen) return;

    const handleDismiss = () => {
      releaseScrollLock();
      toggleMenu();
    };

    window.addEventListener('orientationchange', handleDismiss);
    window.addEventListener('resize', handleDismiss);
    window.addEventListener('hashchange', handleDismiss);

    return () => {
      window.removeEventListener('orientationchange', handleDismiss);
      window.removeEventListener('resize', handleDismiss);
      window.removeEventListener('hashchange', handleDismiss);
    };
  }, [isOpen]);

  // Animation variants for floating menu reveal (slides/fades upward on open, down on close)
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 16,
      transition: {
        duration: 0.18,
        ease: 'easeInOut',
      },
      transitionEnd: {
        display: 'none',
      },
    },
    visible: {
      display: 'flex',
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05,
        duration: 0.20,
        ease: 'easeOut',
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <>
      {/* 1. iOS-style Backdrop overlay (uses pure opacity and subtle dimming for performance on Android) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            onClick={() => toggleMenu()}
            className="fixed inset-0 z-[95] bg-black/35 pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* 2. Morphing Button & Expanded Menu container */}
      <motion.div
        layout
        drag={isOpen ? 'y' : false}
        dragConstraints={{ top: -10, bottom: 200 }}
        dragElastic={0.12}
        onDragEnd={(e, info) => {
          if (info.offset.y > 60) {
            toggleMenu();
          }
        }}
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 20px)',
          width: isOpen ? 240 : 74,
          height: isOpen ? 328 : 52,
          borderRadius: isOpen ? 18 : 26,
        }}
        animate={
          isOpen
            ? {
                scale: 1.00,
              }
            : {
                scale: isPressing ? 1.05 : [0.96, 1.00, 0.96],
              }
        }
        transition={
          isOpen
            ? springTransition
            : {
                default: springTransition,
                scale: isPressing
                  ? { type: 'spring', stiffness: 400, damping: 25 }
                  : {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
              }
        }
        className={`fixed left-1/2 -translate-x-1/2 z-[100] border border-[var(--border-color)] bg-[var(--card-bg-alt)]/90 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.5)] flex flex-col items-center justify-start overflow-hidden pointer-events-auto select-none touch-pan-y ${
          !isOpen ? 'subtle-cyan-pulse' : 'pt-4 px-3 pb-3'
        }`}
      >
        {/* A. Navigation Grid (Stays above the Close pill in open state) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isOpen ? "visible" : "hidden"}
          className="w-full flex flex-col gap-y-1 overflow-hidden"
          style={{
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
        >
          {navItems.map((item) => {
            const isActive = item.id === activeSection;
            return (
              <motion.button
                key={item.id}
                variants={itemVariants}
                onClick={(e) => handleItemClick(e, item.id)}
                className={`relative h-9 rounded-[12px] flex items-center justify-start font-sans font-bold text-[12px] uppercase tracking-[0.05em] px-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-dark)] cursor-pointer select-none active:scale-[0.98] w-full border border-transparent ${
                  isActive
                    ? 'text-[var(--accent-color)] bg-[rgba(var(--accent-rgb),0.1)] border-[rgba(var(--accent-rgb),0.2)] font-extrabold shadow-[0_0_12px_rgba(var(--accent-rgb),0.05)]'
                    : 'text-zinc-400 bg-transparent hover:text-[var(--text-main)] hover:bg-[rgba(var(--accent-rgb),0.05)]'
                }`}
                aria-label={`Go to ${item.label} section`}
                aria-current={isActive ? 'true' : 'false'}
              >
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* B. Bottom Close Pill (Fills container when closed, matches centered Close pill at bottom when open) */}
        <motion.button
          layout
          onClick={toggleMenu}
          onMouseDown={!isOpen ? startPress : undefined}
          onMouseUp={!isOpen ? endPress : undefined}
          onMouseLeave={!isOpen ? cancelPress : undefined}
          onTouchStart={!isOpen ? startPress : undefined}
          onTouchEnd={!isOpen ? endPress : undefined}
          onTouchCancel={!isOpen ? cancelPress : undefined}
          style={{
            width: isOpen ? 74 : '100%',
            height: isOpen ? 52 : '100%',
          }}
          transition={springTransition}
          className={`flex items-center justify-center gap-2 cursor-pointer select-none transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-dark)] flex-shrink-0 active:scale-95 rounded-full ${
            isOpen
              ? 'bg-white/5 border border-[var(--border-color)] shadow-md mt-3'
              : 'bg-transparent border-none'
          }`}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
        >
          {/* Hamburger -> X Morph Icon Lines */}
          <div className="relative w-5 h-5 flex flex-col items-center justify-center">
            <motion.span
              animate={{
                y: isOpen ? 0 : -6,
                rotate: isOpen ? 45 : 0,
              }}
              transition={springTransition}
              className="absolute w-5 h-0.5 bg-white rounded-full"
            />
            <motion.span
              animate={{
                opacity: isOpen ? 0 : 1,
                scaleX: isOpen ? 0 : 1,
              }}
              transition={springTransition}
              className="absolute w-5 h-0.5 bg-white rounded-full"
            />
            <motion.span
              animate={{
                y: isOpen ? 0 : 6,
                rotate: isOpen ? -45 : 0,
              }}
              transition={springTransition}
              className="absolute w-5 h-0.5 bg-white rounded-full"
            />
          </div>
        </motion.button>
      </motion.div>
    </>
  );
}

export default React.memo(MobileNavbar);
