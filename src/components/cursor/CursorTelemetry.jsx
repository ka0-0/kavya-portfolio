import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CursorTelemetry.css';

const STATUSES = [
  "AI CORE ONLINE",
  "NEURAL LINK ACTIVE",
  "MOTION TRACKING",
  "SYSTEM NOMINAL",
  "POSITION SYNCHRONIZED",
  "PORTFOLIO ONLINE",
  "INPUT DETECTED",
  "SECTION MAPPED"
];

export default function CursorTelemetry({ activeSection }) {
  const containerRef = useRef(null);
  const xRef = useRef(null);
  const yRef = useRef(null);
  
  const [statusMsg, setStatusMsg] = useState(STATUSES[0]);
  const [isHidden, setIsHidden] = useState(false);
  
  // Track coordinate states for Lerp math
  const coordsRef = useRef({ cx: 0, cy: 0, tx: 0, ty: 0 });
  const rafActiveRef = useRef(false);
  const idleTimeoutRef = useRef(null);

  // 1. Mouse Tracking & LCD Interpolation Loop (highly optimized, stops when idle)
  useEffect(() => {
    const handleMouseMove = (e) => {
      coordsRef.current.tx = e.clientX;
      coordsRef.current.ty = e.clientY;

      // Bring telemetry to moving opacity (0.75)
      if (containerRef.current && !isHidden) {
        containerRef.current.style.opacity = '0.75';
      }

      // Reset idle opacity timer (fades to 0.25 after 2 seconds)
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.opacity = '0.25';
        }
      }, 2000);

      // Start the Lerp animation loop if it's inactive
      if (!rafActiveRef.current) {
        rafActiveRef.current = true;
        const updateCoords = () => {
          const state = coordsRef.current;
          const dx = state.tx - state.cx;
          const dy = state.ty - state.cy;

          // Snap to target if difference is negligible to save CPU
          if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
            state.cx = state.tx;
            state.cy = state.ty;
            rafActiveRef.current = false;
          } else {
            state.cx += dx * 0.2; // Lerp factor
            state.cy += dy * 0.2; // Lerp factor
            requestAnimationFrame(updateCoords);
          }

          if (xRef.current) xRef.current.textContent = String(Math.round(state.cx)).padStart(4, '0');
          if (yRef.current) yRef.current.textContent = String(Math.round(state.cy)).padStart(4, '0');
        };
        requestAnimationFrame(updateCoords);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [isHidden]);

  // 2. Status message cycler (5 seconds interval, avoids repeats)
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusMsg(prev => {
        const candidates = STATUSES.filter(s => s !== prev);
        const randIdx = Math.floor(Math.random() * candidates.length);
        return candidates[randIdx];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 3. Occlusion listener: Hide HUD when the Theme Toggle Terminal panel is open
  useEffect(() => {
    const handlePanelToggle = (e) => {
      setIsHidden(e.detail.isOpen);
    };
    window.addEventListener('theme-panel-toggle', handlePanelToggle);
    return () => window.removeEventListener('theme-panel-toggle', handlePanelToggle);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`cursor-telemetry-container ${isHidden ? 'is-hidden' : ''}`}
    >
      <div className="telemetry-item">
        <span className="telemetry-label">X </span>
        <span ref={xRef} className="telemetry-value">0000</span>
      </div>
      
      <span className="telemetry-separator">•</span>
      
      <div className="telemetry-item">
        <span className="telemetry-label">Y </span>
        <span ref={yRef} className="telemetry-value">0000</span>
      </div>
      
      <span className="telemetry-separator">•</span>
      
      <div className="telemetry-item">
        <span className="telemetry-label">SEC </span>
        <span className="telemetry-value">
          <AnimatePresence mode="wait">
            <motion.span
              key={activeSection}
              initial={{ opacity: 0, y: 5, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -5, filter: 'blur(3px)' }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{ display: 'inline-block' }}
            >
              {activeSection ? activeSection.toUpperCase() : 'N/A'}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
      
      <span className="telemetry-separator">•</span>
      
      <div className="telemetry-item">
        <span className="telemetry-label">SYS </span>
        <span className="telemetry-value" style={{ minWidth: '120px', display: 'inline-block' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={statusMsg}
              initial={{ opacity: 0, filter: 'blur(2px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(2px)' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ display: 'inline-block' }}
            >
              {statusMsg}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
    </div>
  );
}
