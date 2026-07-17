import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Dynamic themes configuration with codes, names and shortcut letters
const THEME_OPTIONS = [
  { code: 'blue', name: 'Blue', shortcut: 'B', index: 0 },
  { code: 'black', name: 'Black', shortcut: 'L', index: 1 },
  { code: 'pink', name: 'Pink', shortcut: 'P', index: 2 },
  { code: 'purple', name: 'Purple', shortcut: 'U', index: 3 },
  { code: 'orange', name: 'Orange', shortcut: 'O', index: 4 },
  { code: 'red', name: 'Red', shortcut: 'R', index: 5 },
  { code: 'green', name: 'Green', shortcut: 'G', index: 6 }
];

// Helper to check if hover is supported by the device
const isHoverSupported = () => {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(hover: hover)').matches;
};

// Web Audio API sound synthesis disabled - completely silent terminal
const playSound = (type) => {
  // Silent execution - no audio context or sound effects as requested
};

// The command terminal panel component
function ThemeTerminalPanel({ currentThemeIndex, setTheme, onClose }) {
  const panelRef = useRef(null);
  const [isBooting, setIsBooting] = useState(false);
  const [bootLines, setBootLines] = useState([]);
  
  const [headerText, setHeaderText] = useState("");
  const [headerDone, setHeaderDone] = useState(false);
  const [activeThemeText, setActiveThemeText] = useState("");
  
  const [previewTheme, setPreviewTheme] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(currentThemeIndex);
  
  const [feedbackLines, setFeedbackLines] = useState([]);
  const feedbackTimeoutRef = useRef(null);
  const feedbackIntervalRef = useRef(null);
  
  const activeThemeCode = THEME_OPTIONS[currentThemeIndex]?.code || 'blue';
  const currentThemeName = THEME_OPTIONS[currentThemeIndex]?.name || '';

  // 1. Session Boot Sequence (runs only first time during browser session)
  useEffect(() => {
    const hasBooted = sessionStorage.getItem('theme-terminal-booted') === 'true';
    if (hasBooted) {
      setIsBooting(false);
      return;
    }

    setIsBooting(true);
    const bootSequence = [
      "Initializing Theme Module...",
      "Loading Palette Database...",
      "Synchronizing Accent Variables...",
      "Ready."
    ];
    let currentLine = 0;

    const interval = setInterval(() => {
      if (currentLine < bootSequence.length) {
        setBootLines(prev => [...prev, bootSequence[currentLine]]);
        playSound('keypress');
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsBooting(false);
          sessionStorage.setItem('theme-terminal-booted', 'true');
        }, 300);
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // 2. Typewriter Header title (plays when boot finishes)
  useEffect(() => {
    if (isBooting) return;

    const target = "Theme Settings";
    let idx = 0;
    setHeaderText("");
    setHeaderDone(false);

    const interval = setInterval(() => {
      idx++;
      setHeaderText(target.substring(0, idx));
      playSound('keypress');
      if (idx >= target.length) {
        clearInterval(interval);
        setHeaderDone(true);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isBooting]);

  // 3. Typewriter Sub-header (plays after title finishes)
  useEffect(() => {
    if (!headerDone) {
      setActiveThemeText("");
      return;
    }
    const target = `Active Theme : ${currentThemeName}`;
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setActiveThemeText(target.substring(0, idx));
      playSound('keypress');
      if (idx >= target.length) {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [headerDone, currentThemeName]);

  // 4. Status cycling & apply logger helper
  const startStatusCycling = () => {
    if (feedbackIntervalRef.current) clearInterval(feedbackIntervalRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    const statuses = [
      "Ready_",
      "Waiting for input_",
      "Select a theme_"
    ];
    let statusIdx = 0;

    const typeStatus = (text) => {
      let charIdx = 0;
      let currentText = "";
      const typeChar = () => {
        if (charIdx < text.length) {
          currentText += text[charIdx];
          setFeedbackLines([currentText]);
          charIdx++;
          feedbackTimeoutRef.current = setTimeout(typeChar, 30);
        }
      };
      typeChar();
    };

    typeStatus(statuses[0]);

    feedbackIntervalRef.current = setInterval(() => {
      statusIdx = (statusIdx + 1) % statuses.length;
      typeStatus(statuses[statusIdx]);
    }, 4500);
  };

  const runFeedbackAnimation = (shortcut, name) => {
    if (feedbackIntervalRef.current) clearInterval(feedbackIntervalRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    const linesToType = [
      `theme> ${shortcut.toLowerCase()}`,
      `Applying ${name}...`,
      `██████████████ 100%`,
      `✓ ${name} Activated`
    ];

    let lineIdx = 0;
    let charIdx = 0;
    let currentLines = ["", "", "", ""];

    setFeedbackLines([""]);

    const typeNextChar = () => {
      if (lineIdx < linesToType.length) {
        const fullLineText = linesToType[lineIdx];
        if (charIdx < fullLineText.length) {
          currentLines[lineIdx] += fullLineText[charIdx];
          setFeedbackLines(currentLines.slice(0, lineIdx + 1));
          playSound('keypress');
          charIdx++;

          let delay = 25;
          if (fullLineText.startsWith("█")) {
            delay = 10; // Draw progress bar faster
          }
          feedbackTimeoutRef.current = setTimeout(typeNextChar, delay);
        } else {
          lineIdx++;
          charIdx = 0;
          if (lineIdx < linesToType.length) {
            feedbackTimeoutRef.current = setTimeout(typeNextChar, 120);
          } else {
            feedbackTimeoutRef.current = setTimeout(() => {
              startStatusCycling();
            }, 1000);
          }
        }
      }
    };

    feedbackTimeoutRef.current = setTimeout(typeNextChar, 40);
  };

  // Start cycling status logs on boot completion
  useEffect(() => {
    if (!isBooting) {
      startStatusCycling();
    }
    return () => {
      if (feedbackIntervalRef.current) clearInterval(feedbackIntervalRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, [isBooting]);

  // Apply theme handler
  const applyTheme = (index, name, shortcut) => {
    setTheme(index);
    playSound('apply');
    runFeedbackAnimation(shortcut, name);
  };

  // Detect theme updates to play typewriter logs in real time
  const lastIndexRef = useRef(currentThemeIndex);
  useEffect(() => {
    if (!isBooting && lastIndexRef.current !== currentThemeIndex) {
      const selected = THEME_OPTIONS[currentThemeIndex];
      if (selected) {
        runFeedbackAnimation(selected.shortcut, selected.name);
      }
    }
    lastIndexRef.current = currentThemeIndex;
  }, [currentThemeIndex, isBooting]);

  // Sync focused index to active theme when opening
  useEffect(() => {
    setFocusedIndex(currentThemeIndex);
  }, [currentThemeIndex]);

  // 5. Keydown Handlers (shortcuts & arrows)
  useEffect(() => {
    if (isBooting) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = (prev + 1) % THEME_OPTIONS.length;
          playSound('keypress');
          return next;
        });
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = (prev - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;
          playSound('keypress');
          return next;
        });
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = THEME_OPTIONS[focusedIndex];
        if (selected) {
          applyTheme(selected.index, selected.name, selected.shortcut);
          if (!isHoverSupported()) {
            setTimeout(onClose, 300); // Close on mobile
          }
        }
        return;
      }

      // Shortcut letters (B, K, P, U, O, R, G)
      const keyUpper = e.key.toUpperCase();
      const matched = THEME_OPTIONS.find(t => t.shortcut === keyUpper);
      if (matched) {
        e.preventDefault();
        applyTheme(matched.index, matched.name, matched.shortcut);
        if (!isHoverSupported()) {
          setTimeout(onClose, 350); // Close on mobile
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBooting, focusedIndex, currentThemeIndex, onClose]);

  // Focus trap Tab wrapper
  const handlePanelKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusable = panelRef.current?.querySelectorAll('button');
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  // Set focus to the selected button on arrow/load
  useEffect(() => {
    if (!isBooting && panelRef.current) {
      const buttons = panelRef.current.querySelectorAll('.terminal-theme-row');
      if (buttons && buttons[focusedIndex]) {
        buttons[focusedIndex].focus();
      }
    }
  }, [focusedIndex, isBooting]);

  // List transition variants
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', stiffness: 180, damping: 14 }
    }
  };

  // Render booting sequence or active command terminal
  return (
    <div 
      ref={panelRef}
      onKeyDown={handlePanelKeyDown}
      className="theme-terminal-panel"
      data-theme-preview={previewTheme || activeThemeCode}
    >
      <div className="terminal-header">
        <div className="terminal-dots">
          <div className="terminal-dot"></div>
          <div className="terminal-dot"></div>
          <div className="terminal-dot"></div>
        </div>
        <div className="terminal-header-title-container">
          <div className="terminal-header-title">
            {isBooting ? "Booting OS..." : (headerText || "_")}
            {!isBooting && !headerDone && <span className="terminal-cursor" />}
          </div>
          {!isBooting && activeThemeText && (
            <div className="terminal-header-subtitle">
              {activeThemeText}
              <span className="terminal-cursor" />
            </div>
          )}
        </div>
      </div>

      {isBooting ? (
        <div className="terminal-feedback" style={{ height: 'auto', minHeight: '96px' }}>
          {bootLines.map((line, idx) => (
            <div key={idx} className="terminal-feedback-line">
              {line}
              {idx === bootLines.length - 1 && <span className="terminal-cursor" />}
            </div>
          ))}
        </div>
      ) : (
        <>
          <motion.div 
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="terminal-theme-list"
          >
            {THEME_OPTIONS.map((themeOption, idx) => {
              const isActive = themeOption.index === currentThemeIndex;
              const isFocused = themeOption.index === focusedIndex;
              return (
                <motion.button
                  key={themeOption.code}
                  variants={itemVariants}
                  onMouseEnter={() => {
                    setPreviewTheme(themeOption.code);
                    setFocusedIndex(themeOption.index);
                  }}
                  onMouseLeave={() => setPreviewTheme(null)}
                  onClick={() => {
                    applyTheme(themeOption.index, themeOption.name, themeOption.shortcut);
                    if (!isHoverSupported()) {
                      setTimeout(onClose, 300);
                    }
                  }}
                  className={`terminal-theme-row ${isActive ? 'is-active' : ''} ${isFocused ? 'is-focused' : ''}`}
                  type="button"
                >
                  <span className="theme-name-group">
                    {themeOption.name}
                    {isActive && <span className="active-label"> ✓ Active</span>}
                  </span>
                  <span className="theme-shortcut">[{themeOption.shortcut}]</span>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="terminal-feedback">
            {feedbackLines.map((line, idx) => {
              let lineClass = "terminal-feedback-line";
              if (line.startsWith("theme>")) {
                lineClass += " command";
              } else if (line.startsWith("✓")) {
                lineClass += " success";
              } else if (line.startsWith("Applying")) {
                lineClass += " loading";
              }
              return (
                <div key={idx} className={lineClass}>
                  {line}
                  {idx === feedbackLines.length - 1 && <span className="terminal-cursor" />}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Define Gear icon SVG matching MoonIcon style
const GearIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--text-main)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="theme-toggle-icon"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// Main ThemeToggle wrapper component
export default function ThemeToggle({ onClick }) {
  const { currentThemeIndex, setTheme, nextTheme } = useTheme();
  
  // Settings speed-dial state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  
  // Hover states for tooltips
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const [isThemeHovered, setIsThemeHovered] = useState(false);
  
  // Individual magnetic positions
  const [settingsPos, setSettingsPos] = useState({ x: 0, y: 0 });
  const [themePos, setThemePos] = useState({ x: 0, y: 0 });
  
  // Dynamic positioning states for Theme Terminal
  const [coords, setCoords] = useState(null);
  const [side, setSide] = useState('right');
  const panelRef = useRef(null);
  
  const containerRef = useRef(null);
  const settingsRef = useRef(null);
  const buttonRef = useRef(null); // Keep pointing to Theme button for panel coordinates calculation
  
  // Terminal open/close hover timeouts
  const openTimeoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Subtle magnetic hover effect: translate 2–4px toward the pointer
  const handleMouseMove = (e, targetKey) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    
    const maxDisplacement = 3;
    const sensitivity = 0.15;
    
    const targetX = Math.max(-maxDisplacement, Math.min(maxDisplacement, x * sensitivity));
    const targetY = Math.max(-maxDisplacement, Math.min(maxDisplacement, y * sensitivity));
    
    if (targetKey === 'settings') {
      setSettingsPos({ x: targetX, y: targetY });
    } else if (targetKey === 'theme') {
      setThemePos({ x: targetX, y: targetY });
    }
  };

  const handleMouseEnter = (targetKey, ref) => {
    if (targetKey === 'settings') {
      setIsSettingsHovered(true);
    } else if (targetKey === 'theme') {
      setIsThemeHovered(true);
      if (isHoverSupported()) {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }

        if (!isTerminalOpen && !openTimeoutRef.current) {
          openTimeoutRef.current = setTimeout(() => {
            setIsTerminalOpen(true);
            playSound('open');
            openTimeoutRef.current = null;
          }, 120);
        }
      }
    }

    // Notify custom cursor to snap
    window.dispatchEvent(
      new CustomEvent('cursor-snap-enter', {
        detail: { target: ref.current }
      })
    );
  };

  const handleMouseLeave = (targetKey) => {
    if (targetKey === 'settings') {
      setIsSettingsHovered(false);
      setSettingsPos({ x: 0, y: 0 });
    } else if (targetKey === 'theme') {
      setIsThemeHovered(false);
      setThemePos({ x: 0, y: 0 });
      if (isHoverSupported()) {
        if (openTimeoutRef.current) {
          clearTimeout(openTimeoutRef.current);
          openTimeoutRef.current = null;
        }

        if (isTerminalOpen && !closeTimeoutRef.current) {
          closeTimeoutRef.current = setTimeout(() => {
            setIsTerminalOpen(false);
            closeTimeoutRef.current = null;
          }, 200);
        }
      }
    }

    window.dispatchEvent(new CustomEvent('cursor-snap-leave'));
  };

  const handlePanelMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handlePanelMouseLeave = () => {
    if (isTerminalOpen && !closeTimeoutRef.current) {
      closeTimeoutRef.current = setTimeout(() => {
        setIsTerminalOpen(false);
        closeTimeoutRef.current = null;
      }, 200);
    }
  };

  const handleTerminalClose = () => {
    setIsTerminalOpen(false);
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  const handleSettingsClick = (e) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
    playSound('open');
  };

  const handleThemeButtonClick = (e) => {
    if (!isHoverSupported()) {
      if (isTerminalOpen) {
        handleTerminalClose();
      } else {
        setIsTerminalOpen(true);
        playSound('open');
      }
    } else {
      nextTheme();
      setIsMenuOpen(false);
      setIsTerminalOpen(false);
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Dispatch event when panel toggle state changes so external widgets can adapt
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('theme-panel-toggle', { detail: { isOpen: isTerminalOpen } }));
  }, [isTerminalOpen]);

  // Close on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isMenuOpen) {
        const clickedInsideContainer = containerRef.current && containerRef.current.contains(e.target);
        const clickedInsidePanel = panelRef.current && panelRef.current.contains(e.target);
        if (!clickedInsideContainer && !clickedInsidePanel) {
          setIsMenuOpen(false);
          setIsTerminalOpen(false);
        }
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isMenuOpen]);

  // Escape key listener to close menu and terminal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsTerminalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Recalculate panel positioning dynamically to be viewport-safe and aligned with Theme button
  const updatePanelCoords = () => {
    if (!buttonRef.current) return;
    const btnRect = buttonRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    
    const panelWidth = 340;
    const panelHeight = panelRef.current ? panelRef.current.getBoundingClientRect().height : 415;
    const gap = 18; // Gap of 16-20px
    
    const hasSpaceRight = (viewportW - btnRect.right) >= (panelWidth + gap + 16);
    const hasSpaceLeft = btnRect.left >= (panelWidth + gap + 16);
    
    let selectedSide = 'right';
    if (hasSpaceRight) {
      selectedSide = 'right';
    } else if (hasSpaceLeft) {
      selectedSide = 'left';
    } else {
      selectedSide = 'above';
    }
    
    let left = 0;
    let top = 0;
    
    if (selectedSide === 'right') {
      left = btnRect.right + gap;
      top = btnRect.top + btnRect.height / 2 - panelHeight / 2 - 50;
      top = Math.max(24, Math.min(viewportH - panelHeight - 56, top));
    } else if (selectedSide === 'left') {
      left = btnRect.left - panelWidth - gap;
      top = btnRect.top + btnRect.height / 2 - panelHeight / 2 - 50;
      top = Math.max(24, Math.min(viewportH - panelHeight - 56, top));
    } else {
      left = btnRect.left + btnRect.width / 2 - panelWidth / 2;
      left = Math.max(16, Math.min(viewportW - panelWidth - 16, left));
      top = btnRect.top - panelHeight - gap;
      top = Math.max(24, top);
    }
    
    setSide(selectedSide);
    setCoords({ left, top });
  };

  useEffect(() => {
    if (!isTerminalOpen) return;
    
    updatePanelCoords();
    const timer = setTimeout(updatePanelCoords, 30);
    
    window.addEventListener('resize', updatePanelCoords);
    window.addEventListener('scroll', updatePanelCoords);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePanelCoords);
      window.removeEventListener('scroll', updatePanelCoords);
    };
  }, [isTerminalOpen]);

  // Clean cursor snap on unmount
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('cursor-snap-leave'));
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const iconVariants = {
    hover: { 
      rotate: 15, 
      scale: 1.05,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const slideOffset = 10;
  let initialX = 0;
  let initialY = 0;
  
  if (!isMobile) {
    if (side === 'right') {
      initialX = -slideOffset;
    } else if (side === 'left') {
      initialX = slideOffset;
    } else if (side === 'above') {
      initialY = slideOffset;
    }
  } else {
    initialY = slideOffset;
  }

  const panelVariants = {
    hidden: { 
      opacity: 0, 
      x: initialX, 
      y: initialY, 
      scale: 0.96 
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.2, 
        ease: [0.25, 1, 0.5, 1] 
      }
    },
    exit: { 
      opacity: 0, 
      x: initialX, 
      y: initialY, 
      scale: 0.96,
      transition: { 
        duration: 0.18, 
        ease: [0.25, 1, 0.5, 1] 
      }
    }
  };

  // Speed-dial y-translation values
  const themeY = isMobile ? -60 : -68;

  // Tooltip visibility
  const isSettingsTooltipVisible = isSettingsHovered && !isMenuOpen && isHoverSupported();
  const isThemeTooltipVisible = isThemeHovered && isHoverSupported();

  return (
    <div 
      ref={containerRef}
      className="theme-toggle-container"
    >
      {/* Speed dial list */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Theme Button */}
            <motion.div
              key="theme-item"
              initial={{ y: 0, opacity: 0, scale: 0.9 }}
              animate={{ y: themeY, opacity: 1, scale: 1 }}
              exit={{ y: 0, opacity: 0, scale: 0.9 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 22,
                delay: 0
              }}
              style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%' }}
            >
              {isThemeTooltipVisible && (
                <div className="theme-tooltip">Theme Settings</div>
              )}
              <motion.button
                ref={buttonRef}
                animate={{ x: themePos.x, y: themePos.y }}
                transition={{ type: 'spring', stiffness: 250, damping: 25, mass: 0.8 }}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                onMouseMove={(e) => handleMouseMove(e, 'theme')}
                onMouseEnter={() => handleMouseEnter('theme', buttonRef)}
                onMouseLeave={() => handleMouseLeave('theme')}
                onClick={handleThemeButtonClick}
                className="theme-toggle-btn speed-dial-btn"
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings FAB Button */}
      {isSettingsTooltipVisible && (
        <div className="theme-tooltip">Settings</div>
      )}
      <motion.button
        ref={settingsRef}
        animate={{ 
          scale: isMenuOpen ? 1.05 : 1,
          x: settingsPos.x, 
          y: settingsPos.y 
        }}
        transition={{ type: 'spring', stiffness: 250, damping: 25, mass: 0.8 }}
        whileHover="hover"
        whileTap={{ scale: 0.95 }}
        onMouseMove={(e) => handleMouseMove(e, 'settings')}
        onMouseEnter={() => handleMouseEnter('settings', settingsRef)}
        onMouseLeave={() => handleMouseLeave('settings')}
        onClick={handleSettingsClick}
        className={`theme-toggle-btn settings-fab ${isMenuOpen ? 'is-open' : ''}`}
        aria-label="Settings Menu"
        title="Settings Menu"
        type="button"
      >
        <motion.div 
          className="theme-toggle-icon-wrapper"
          animate={{ rotate: isMenuOpen ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          variants={iconVariants}
        >
          <GearIcon />
        </motion.div>
      </motion.button>

      {/* Theme Terminal Panel */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            ref={panelRef}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={(!isMobile && coords) ? {
              left: `${coords.left}px`,
              top: `${coords.top}px`
            } : {
              position: 'absolute',
              pointerEvents: 'auto'
            }}
            onMouseEnter={handlePanelMouseEnter}
            onMouseLeave={handlePanelMouseLeave}
            className="theme-panel-motion-wrapper"
          >
            <ThemeTerminalPanel 
              currentThemeIndex={currentThemeIndex}
              setTheme={setTheme}
              onClose={handleTerminalClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
