import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeContext';
import './ThemeToggle.css';

// A simple minimalist crescent moon / theme icon in single-color white with thin 2px strokes
const MoonIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--text-main)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="theme-toggle-icon"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

export default function ThemeToggle({ onClick }) {
  const { nextTheme } = useTheme();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Subtle magnetic hover effect: translate 2–4px toward the pointer
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    
    // Calculate displacement relative to button boundaries
    // Limit displacement to a maximum of 3px for high refinement
    const maxDisplacement = 3;
    const sensitivity = 0.15;
    
    const targetX = Math.max(-maxDisplacement, Math.min(maxDisplacement, x * sensitivity));
    const targetY = Math.max(-maxDisplacement, Math.min(maxDisplacement, y * sensitivity));
    
    setPosition({ x: targetX, y: targetY });
  };

  const handleMouseEnter = (e) => {
    // Notify the custom cursor to snap to this element
    window.dispatchEvent(
      new CustomEvent('cursor-snap-enter', {
        detail: { target: e.currentTarget }
      })
    );
  };

  const handleMouseLeave = () => {
    // Reset magnetic positioning and restore default cursor
    setPosition({ x: 0, y: 0 });
    window.dispatchEvent(new CustomEvent('cursor-snap-leave'));
  };

  const handleClick = (e) => {
    nextTheme();
    if (onClick) {
      onClick(e);
    }
  };

  useEffect(() => {
    return () => {
      // Ensure cursor doesn't get stuck in snap state on unmount
      window.dispatchEvent(new CustomEvent('cursor-snap-leave'));
    };
  }, []);

  // Framer Motion variants to animate child elements on parent hover
  const iconVariants = {
    hover: { 
      rotate: 15, 
      scale: 1.05,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };

  return (
    <div className="theme-toggle-container">
      <motion.button
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', stiffness: 250, damping: 25, mass: 0.8 }}
        whileHover="hover"
        whileTap={{ scale: 0.95 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="theme-toggle-btn"
        aria-label="Toggle Theme"
        title="Toggle Theme"
        type="button"
      >
        <motion.div 
          className="theme-toggle-icon-wrapper"
          variants={iconVariants}
        >
          <MoonIcon />
        </motion.div>
      </motion.button>
    </div>
  );
}
