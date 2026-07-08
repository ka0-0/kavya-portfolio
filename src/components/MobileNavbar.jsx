import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const rows = [
  [
    { id: 'home', label: 'HOME', fullWidth: true }
  ],
  [
    { id: 'about', label: 'ABOUT' },
    { id: 'skills', label: 'SKILLS' }
  ],
  [
    { id: 'projects', label: 'PROJECTS' },
    { id: 'certificates', label: 'CERTIFICATES' }
  ],
  [
    { id: 'contact', label: "LET'S TALK", fullWidth: true }
  ]
];

function MobileNavbar({ activeSection, handleNavClick }) {
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);

  // Long press haptic & interaction states
  const [isPressing, setIsPressing] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const pressTimeoutRef = useRef(null);

  // Spring transition curve mimicking Apple's motion language (with overshoot)
  const springTransition = shouldReduceMotion
    ? { duration: 0.25, ease: 'easeInOut' }
    : {
        type: 'spring',
        stiffness: 450,
        damping: 32,
        mass: 0.8,
      };

  const startPress = (e) => {
    // Prevent double triggers on touch devices firing mouse events
    if (e.type === 'mousedown' && 'ontouchstart' in window) return;

    setIsPressing(true);
    setIsLongPressed(false);

    pressTimeoutRef.current = setTimeout(() => {
      setIsLongPressed(true);
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
      setIsOpen((prev) => !prev);
    }
  };

  const cancelPress = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    setIsPressing(false);
    setIsLongPressed(false);
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
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      if (window.lenis) {
        window.lenis.start();
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      if (window.lenis) {
        window.lenis.start();
      }
    };
  }, [isOpen]);

  // 2. Dismiss logic: close on orientation change, window resize, hashchange, or scroll fallback
  useEffect(() => {
    if (!isOpen) return;

    const handleDismiss = () => setIsOpen(false);

    window.addEventListener('orientationchange', handleDismiss);
    window.addEventListener('resize', handleDismiss);
    window.addEventListener('hashchange', handleDismiss);
    window.addEventListener('scroll', handleDismiss, { passive: true });

    return () => {
      window.removeEventListener('orientationchange', handleDismiss);
      window.removeEventListener('resize', handleDismiss);
      window.removeEventListener('hashchange', handleDismiss);
      window.removeEventListener('scroll', handleDismiss);
    };
  }, [isOpen]);

  // Animation variants for floating menu reveal
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 22,
      },
    },
  };

  return (
    <>
      {/* 1. iOS-style Backdrop overlay (uses pure opacity for extreme performance on Android) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[95] bg-black/55 pointer-events-auto"
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
            setIsOpen(false);
          }
        }}
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 20px)',
          width: isOpen ? 310 : 64,
          height: isOpen ? 342 : 64,
          borderRadius: isOpen ? 28 : 32,
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                scale: !isOpen && isLongPressed ? 1.15 : !isOpen && isPressing ? 1.08 : 1,
                boxShadow: isOpen
                  ? '0 20px 40px rgba(0,0,0,0.55), 0 0 30px rgba(255,255,255,0.01)'
                  : isLongPressed
                  ? '0 0 20px 4px rgba(34, 211, 238, 0.4), 0 10px 30px rgba(0,0,0,0.5)'
                  : isPressing
                  ? '0 0 12px 2px rgba(34, 211, 238, 0.2), 0 10px 25px rgba(0,0,0,0.45)'
                  : '0 10px 30px rgba(0,0,0,0.45)',
              }
        }
        transition={springTransition}
        className="fixed left-1/2 -translate-x-1/2 z-[100] border border-white/10 bg-[#0c0c0e] shadow-2xl flex flex-col items-center justify-center overflow-hidden pointer-events-auto select-none touch-pan-y"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="menu-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full flex flex-col items-center px-5 pb-5 pt-3 gap-4"
            >
              {/* Drag indicator bar */}
              <div className="w-10 h-1 bg-white/20 rounded-full flex-shrink-0 cursor-grab active:cursor-grabbing" />

              {/* Staggered Navigation Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-3 w-full"
              >
                {rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-3 w-full justify-between">
                    {row.map((item) => {
                      const isActive = item.id === activeSection;
                      return (
                        <motion.button
                          key={item.id}
                          variants={itemVariants}
                          onClick={(e) => {
                            handleNavClick(e, item.id);
                            setIsOpen(false);
                          }}
                          className={`relative h-14 rounded-2xl flex items-center justify-center font-sans font-bold text-[10px] uppercase tracking-[0.15em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE] focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer select-none active:scale-[0.97] ${
                            isActive
                              ? 'text-black font-extrabold'
                              : 'text-zinc-400 bg-white/5 border border-white/5 hover:text-white'
                          } ${item.fullWidth ? 'w-full' : 'w-[calc(50%-6px)]'}`}
                          aria-label={`Go to ${item.label} section`}
                          aria-current={isActive ? 'true' : 'false'}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="active-mobile-pill-sheet"
                              className="absolute inset-0 bg-[#22D3EE] rounded-2xl -z-10 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                              transition={springTransition}
                            />
                          )}
                          <span className="relative z-10">{item.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="icon-content"
              onMouseDown={startPress}
              onMouseUp={endPress}
              onMouseLeave={cancelPress}
              onTouchStart={startPress}
              onTouchEnd={endPress}
              onTouchCancel={cancelPress}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full flex items-center justify-center relative cursor-pointer"
            >
              {/* Circular Touch Ripple Effect */}
              {isPressing && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.45, opacity: 0 }}
                  transition={{ duration: 0.65, ease: 'easeOut', repeat: Infinity }}
                  className="absolute inset-0 rounded-full border border-[#22D3EE]/40 pointer-events-none"
                />
              )}

              {/* Robot/AI Emblem Icon */}
              <img
                src="/emblem.png"
                className="w-[62%] h-[62%] object-contain select-none pointer-events-none filter drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]"
                alt="Robot AI Icon"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export default React.memo(MobileNavbar);
