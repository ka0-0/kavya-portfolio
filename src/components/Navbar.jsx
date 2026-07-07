import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, FileText, Eye, Download, Printer, Copy, 
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Loader2, Check 
} from 'lucide-react';
import { 
  trackNavigationClick, 
  trackResumeViewed, 
  trackResumeDownload, 
  trackEmailClick, 
  trackGitHubClick, 
  trackLinkedInClick, 
  trackProjectClick 
} from '../utils/analytics';
import { downloadResume } from '../utils/resume';

const navLinks = [
  { name: 'Home', id: 'home' },
  { name: 'About', id: 'about' },
  { name: 'Skills', id: 'skills' },
  { name: 'Projects', id: 'projects' },
  { name: 'Certificates', id: 'certificates' },
  { name: 'Contact', id: 'contact' },
];

function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle
  const [hoveredSection, setHoveredSection] = useState(null);

  // Resume Widget States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHoveringResume, setIsHoveringResume] = useState(false);
  const [downloadState, setDownloadState] = useState('idle'); // 'idle' | 'downloading' | 'completed'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const isManualScrollRef = useRef(false);
  const manualScrollTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const modalContainerRef = useRef(null);
  const resumeButtonRef = useRef(null);

  const sectionBoundsRef = useRef([]);
  const scrollHeightRef = useRef(0);
  const lastIsScrolledRef = useRef(false);
  const lastActiveSectionRef = useRef('home');

  const updateSectionBounds = useCallback(() => {
    const bounds = [];
    for (let i = 0; i < navLinks.length; i++) {
      const el = document.getElementById(navLinks[i].id);
      if (el) {
        bounds.push({
          id: navLinks[i].id,
          top: el.offsetTop,
          height: el.offsetHeight,
        });
      }
    }
    sectionBoundsRef.current = bounds;
    scrollHeightRef.current = document.documentElement.scrollHeight - window.innerHeight;
  }, []);

  // Update bounds on mount, load, and resize to avoid measuring during scroll frames
  useEffect(() => {
    // Delay first measurement to next animation frame to prevent layout thrashing on mount
    const rafId = requestAnimationFrame(() => {
      updateSectionBounds();
    });
    window.addEventListener('resize', updateSectionBounds, { passive: true });
    window.addEventListener('load', updateSectionBounds, { passive: true });

    // Run a deferred check to account for dynamically loaded assets (like the 3D model)
    const timer = setTimeout(updateSectionBounds, 1000);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateSectionBounds);
      window.removeEventListener('load', updateSectionBounds);
      clearTimeout(timer);
    };
  }, [updateSectionBounds]);
  // Dropdown Close Handlers
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsModalOpen(false);
      }
    };

    if (isDropdownOpen || isModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen, isModalOpen]);

  // Scroll Lock & Lenis Control for Resume Modal
  useEffect(() => {
    if (isModalOpen) {
      // 1. Lock body scrolling in all major browsers
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      
      // 2. Prevent iOS overscroll / rubber-band effect by blocking touchmove on body
      const preventTouchMove = (e) => {
        if (e.target.closest('.modal-scroll-container')) return;
        e.preventDefault();
      };
      document.addEventListener('touchmove', preventTouchMove, { passive: false });

      // 3. Pause Lenis smooth-scroll
      if (window.lenis) {
        window.lenis.stop();
      }

      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.removeEventListener('touchmove', preventTouchMove);
        if (window.lenis) {
          window.lenis.start();
        }
      };
    }
  }, [isModalOpen]);

  // Focus Trapping & Accessibility for Resume Modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        return;
      }

      if (e.key === 'Tab') {
        if (!modalContainerRef.current) return;

        const focusableElements = modalContainerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    // Auto-focus the first element inside modal
    const focusTimer = setTimeout(() => {
      if (modalContainerRef.current) {
        const focusableElements = modalContainerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    }, 50);

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);

      // Restore focus to the Resume button after closing
      if (resumeButtonRef.current) {
        resumeButtonRef.current.focus();
      }
    };
  }, [isModalOpen]);

  // Scroll Progress and Scroll Spy tracking
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolledVal = window.scrollY > 20;
          if (isScrolledVal !== lastIsScrolledRef.current) {
            lastIsScrolledRef.current = isScrolledVal;
            setIsScrolled(isScrolledVal);
          }

          // Scroll Spy to set active link (fully optimized with cached layout properties)
          if (!isManualScrollRef.current) {
            const navbarHeight = 96;
            const targetY = window.scrollY + navbarHeight + (window.innerHeight - navbarHeight) / 2;
            
            let closestSectionId = navLinks[0].id;
            let minDistance = Infinity;

            const bounds = sectionBoundsRef.current;
            for (let i = 0; i < bounds.length; i++) {
              const { id, top, height } = bounds[i];
              const bottom = top + height;
              
              let distance = 0;
              if (targetY < top) {
                distance = top - targetY;
              } else if (targetY > bottom) {
                distance = targetY - bottom;
              } else {
                distance = 0;
              }
              
              if (distance < minDistance) {
                minDistance = distance;
                closestSectionId = id;
              }
            }

            if (closestSectionId !== lastActiveSectionRef.current) {
              lastActiveSectionRef.current = closestSectionId;
              setActiveSection(closestSectionId);
            }
          }

          ticking = false;
        });
        ticking = true;
      }

      // Handle locking of scroll spy during smooth scroll
      if (isManualScrollRef.current) {
        if (manualScrollTimeoutRef.current) {
          clearTimeout(manualScrollTimeoutRef.current);
        }
        manualScrollTimeoutRef.current = setTimeout(() => {
          isManualScrollRef.current = false;
        }, 150);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial load check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
    };
  }, []);

  // Global click observer to instantly transition active pill for external page scroll triggers (e.g. Hero CTAs)
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const button = e.target.closest('button, a');
      if (!button) return;

      let targetId = '';
      if (button.tagName === 'A' && button.hash) {
        targetId = button.hash.slice(1);
      } else if (button.textContent) {
        const text = button.textContent.toUpperCase();
        if (text.includes("LET'S CONNECT") || text.includes("CONTACT")) {
          targetId = 'contact';
        }
      }

      if (targetId && navLinks.some(link => link.id === targetId)) {
        isManualScrollRef.current = true;
        setActiveSection(targetId);
        
        const sectionName = targetId === 'home' ? 'Hero' : targetId.charAt(0).toUpperCase() + targetId.slice(1);
        trackNavigationClick(sectionName);

        if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
        manualScrollTimeoutRef.current = setTimeout(() => {
          isManualScrollRef.current = false;
        }, 450); // Matches snappy smooth scroll duration
      }
    };

    window.addEventListener('click', handleGlobalClick, { passive: true });
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;

    const sectionName = id === 'home' ? 'Hero' : id.charAt(0).toUpperCase() + id.slice(1);
    trackNavigationClick(sectionName);

    // Temporarily bypass scroll spy observer to allow direct slide animation to clicked item
    isManualScrollRef.current = true;
    setActiveSection(id);

    if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);

    // 96px navbar height + 54px landing gap (approx 50-60px landing offset)
    const yOffset = -150;
    const targetY = element.getBoundingClientRect().top + window.scrollY + yOffset;

    if (window.lenis) {
      window.lenis.scrollTo(targetY, {
        duration: 0.45, // Snappy scroll duration
      });
    } else {
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth'
      });
    }

    manualScrollTimeoutRef.current = setTimeout(() => {
      isManualScrollRef.current = false;
    }, 450); // Matches snappy smooth scroll duration
  };

  // Action: Copy Summary
  const handleCopySummary = () => {
    const summaryText = "Kavya Makhan — AI Developer & Mechanical Engineering Student specializing in Python, React, FastAPI, Artificial Intelligence and Desktop AI Systems.";
    navigator.clipboard.writeText(summaryText).then(() => {
      setToast({ show: true, message: "Summary copied" });
      setIsDropdownOpen(false);
      setTimeout(() => setToast({ show: false, message: "" }), 2500);
    });
  };

  // Action: Print Resume
  const handlePrintResume = () => {
    setIsDropdownOpen(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Action: Download PDF (Mock animation & file download)
  const handleDownloadResume = () => {
    if (downloadState !== 'idle') return;
    setDownloadState('downloading');
    
    setTimeout(() => {
      downloadResume();
      setDownloadState('completed');
      
      // Reset button state
      setTimeout(() => {
        setDownloadState('idle');
        setIsDropdownOpen(false);
      }, 1500);
    }, 600); // 600ms matching fold/spinner loading
  };

  // Toggle Fullscreen modal state
  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      if (modalContainerRef.current?.requestFullscreen) {
        modalContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Sync internal fullscreen state with browser exit events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] pointer-events-none w-full">
        {/* Outer content boundary matching the max-w-7xl px-6 md:px-4 grid alignment of the page */}
        <div className="max-w-7xl mx-auto px-6 md:px-4 h-24 flex items-center justify-between relative">
          
          {/* 1. Brand Logo Floating Capsule - Far Left (Aligned to left page margin) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.15 }}
            className="pointer-events-auto select-none md:-translate-x-6"
          >
            <div
              className={`relative p-[1.5px] rounded-full animate-neon-border w-[125px] h-[58px] transition-all duration-500 ease-in-out shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.85),_inset_0_-1px_1px_rgba(0,0,0,0.03),_0_12px_30px_-10px_rgba(0,0,0,0.25)]`}
            >
              <div className="absolute inset-0 rounded-full animate-neon-border blur-[8px] opacity-15 pointer-events-none" />

              <div className="w-full h-full bg-white/95 backdrop-blur-[18px] rounded-full flex items-center justify-center pl-3.5 pr-4">
                <div className="w-2.5 h-2.5 rounded-full animate-blue-pulse mr-2.5 flex-shrink-0" />
                <a
                  href="#home"
                  onClick={(e) => handleNavClick(e, 'home')}
                  className="font-display text-sm tracking-widest text-zinc-900 leading-none hover:text-cyan-600 transition-colors"
                >
                  KAVYA<span className="text-cyan-500 font-extrabold font-sans">.</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* 2. Center Floating Navigation - Desktop & Tablet (Centering navigation with responsive widths) */}
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
            className="hidden md:block absolute left-1/2 -translate-x-1/2 pointer-events-auto"
          >
            <div
              className={`relative p-[1.5px] rounded-full animate-neon-border transition-all duration-500 ease-in-out md:w-[360px] lg:w-[630px] xl:w-[886px] h-[58px]`}
            >
              <div className="absolute inset-0 rounded-full animate-neon-border blur-[12px] opacity-18 pointer-events-none" />

              <div
                className={`w-full h-full bg-white/95 backdrop-blur-[18px] rounded-full shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.85),_inset_0_-1px_1px_rgba(0,0,0,0.03),_0_15px_45px_-12px_rgba(0,0,0,0.22)] transition-all duration-500 ease-in-out px-4`}
              >
                <nav className="flex items-center justify-between w-full h-full relative z-10">
                  {navLinks.map((link) => {
                    const isActive = activeSection === link.id;
                    return (
                      <a
                        key={link.id}
                        href={`#${link.id}`}
                        onClick={(e) => handleNavClick(e, link.id)}
                        onMouseEnter={() => setHoveredSection(link.id)}
                        onMouseLeave={() => setHoveredSection(null)}
                        className="relative cursor-pointer group flex-grow flex-1 flex items-center justify-center h-full active:scale-98 transition-transform duration-100"
                      >
                        {/* Inner padded container centering active pill & text */}
                        <div className="relative px-[14px] py-[6px] md:px-[16px] md:py-[8px] lg:px-[20px] lg:py-[10px] flex items-center justify-center">
                          
                          {/* Single Shared Layout Capsule */}
                          {isActive && (
                            <motion.div
                              layoutId="active-pill"
                              className="absolute inset-0 bg-[#ebf5ff]/65 backdrop-blur-[18px] border border-[rgba(100,200,255,0.4)] rounded-full -z-10 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.9),_0_0_24px_rgba(0,170,255,0.18),_0_4px_12px_rgba(59,130,246,0.12)]"
                              style={{ 
                                willChange: 'transform, opacity',
                                transform: 'translateZ(0)',
                                backfaceVisibility: 'hidden',
                              }}
                              transition={{
                                type: 'spring',
                                stiffness: 700,
                                damping: 50,
                                mass: 0.55,
                              }}
                            />
                          )}

                          <span
                            className={`relative z-10 block font-sans font-bold text-[10px] lg:text-xs uppercase tracking-[0.15em] select-none transition-[color,transform] duration-300 ease-out group-hover:-translate-y-[2px] ${
                              isActive ? 'text-black' : 'text-zinc-500 group-hover:text-zinc-950'
                            }`}
                          >
                            {link.name}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </nav>
              </div>
            </div>
          </motion.div>

          {/* 3. Center Floating Menu - Mobile Menu Trigger */}
          <div className="md:hidden absolute left-1/2 -translate-x-1/2 pointer-events-auto">
            <motion.div
              layout
              initial={{ borderRadius: 9999 }}
              animate={{
                width: isOpen ? 220 : 50,
                height: isOpen ? 300 : 50,
                borderRadius: isOpen ? 24 : 9999,
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className={`relative p-[1.5px] animate-neon-border shadow-[0_12px_30px_-10px_rgba(0,0,0,0.22)] ${
                isScrolled ? 'top-1' : 'top-0'
              }`}
            >
              <div className="absolute inset-0 rounded-[inherit] animate-neon-border blur-[8px] opacity-15 pointer-events-none" />

              <div className="w-full h-full bg-white/95 backdrop-blur-[18px] flex flex-col items-center justify-start p-1.5 rounded-[inherit] shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.85),_inset_0_-1px_1px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="w-full flex justify-center items-center h-[38px] relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-zinc-800 hover:text-black transition-colors focus:outline-none cursor-pointer flex items-center justify-center w-8 h-8 z-20"
                  >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center justify-start space-y-2.5 w-full px-2 pb-4 overflow-y-auto mt-2"
                    >
                      {navLinks.map((link) => {
                        const isActive = activeSection === link.id;
                        return (
                          <a
                            key={link.id}
                            href={`#${link.id}`}
                            onClick={(e) => {
                              handleNavClick(e, link.id);
                              setIsOpen(false);
                            }}
                            className="relative w-full py-2 flex items-center justify-center cursor-pointer group active:scale-98 transition-transform duration-100"
                          >
                            {isActive && (
                              <motion.div
                                layoutId="active-mobile-pill"
                                className="absolute inset-0 bg-[#ebf5ff]/65 backdrop-blur-[18px] border border-[rgba(100,200,255,0.4)] rounded-full -z-10 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.9),_0_0_24px_rgba(0,170,255,0.18),_0_2px_8px_rgba(59,130,246,0.12)]"
                                transition={{
                                  type: 'spring',
                                  stiffness: 700,
                                  damping: 50,
                                  mass: 0.55,
                                }}
                              />
                            )}
                            <span
                              className={`relative z-10 transition-transform duration-300 group-hover:-translate-y-[1px] font-sans font-bold text-[10px] uppercase tracking-[0.12em] select-none ${
                                isActive ? 'text-black font-extrabold' : 'text-zinc-500 group-hover:text-zinc-950'
                              }`}
                            >
                              {link.name}
                            </span>
                          </a>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* 4. Resume Floating Widget Capsule - Far Right (Aligned to right page margin) */}
          <div className="relative pointer-events-auto" ref={dropdownRef}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.15 }}
              className="relative select-none"
            >
              <button
                ref={resumeButtonRef}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onMouseEnter={() => setIsHoveringResume(true)}
                onMouseLeave={() => setIsHoveringResume(false)}
                className={`relative p-[1.5px] rounded-full animate-neon-border w-[125px] h-[58px] transition-all duration-500 ease-in-out cursor-pointer hover:-translate-y-[2px] active:scale-98 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.85),_inset_0_-1px_1px_rgba(0,0,0,0.03),_0_12px_30px_-10px_rgba(0,0,0,0.25)] flex items-center justify-center ${
                  isHoveringResume ? 'shadow-[0_15px_35px_-8px_rgba(59,130,246,0.3)] brightness-[1.02]' : ''
                }`}
                style={{ transitionDuration: '180ms' }}
              >
                <div className={`absolute inset-0 rounded-full animate-neon-border blur-[8px] opacity-15 pointer-events-none transition-opacity duration-300 ${
                  isHoveringResume ? 'opacity-30' : ''
                }`} />

                <div className="w-full h-full bg-white/95 backdrop-blur-[18px] rounded-full flex items-center justify-center gap-2 px-4">
                  <FileText className="w-4 h-4 text-cyan-500" />
                  <span className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-900">
                    Resume
                  </span>
                </div>
              </button>
            </motion.div>

            {/* Dropdown Menu attached to Resume Capsule */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 8 }}
                  exit={{ opacity: 0, scale: 0.96, y: 15 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  className="absolute right-0 top-full w-[240px] p-[1.5px] rounded-[20px] animate-neon-border shadow-[0_20px_50px_rgba(0,0,0,0.3),_0_4px_16px_rgba(59,130,246,0.12)] z-40"
                >
                  <div className="absolute inset-0 rounded-[20px] animate-neon-border blur-[6px] opacity-15 pointer-events-none" />

                  {/* Dropdown Inner Glass Grid */}
                  <div className="w-full bg-white/95 backdrop-blur-[18px] rounded-[18px] p-2 flex flex-col gap-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.85)]">
                    
                    <button
                      onClick={() => {
                        trackResumeViewed();
                        setIsModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-[12px] cursor-pointer hover:bg-zinc-100/90 text-zinc-700 hover:text-black font-sans text-xs font-semibold select-none transition-colors"
                    >
                      <Eye className="w-4 h-4 text-cyan-500" />
                      <span>View Resume</span>
                    </button>

                    <button
                      onClick={handleDownloadResume}
                      disabled={downloadState !== 'idle'}
                      className="flex items-center gap-3 px-4 py-3 rounded-[12px] cursor-pointer hover:bg-zinc-100/90 text-zinc-700 hover:text-black font-sans text-xs font-semibold select-none transition-colors w-full text-left"
                    >
                      <AnimatePresence mode="wait">
                        {downloadState === 'idle' && (
                          <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="w-4 h-4 flex-shrink-0"
                          >
                            <Download className="w-4 h-4 text-cyan-500" />
                          </motion.div>
                        )}
                        {downloadState === 'downloading' && (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="w-4 h-4 flex-shrink-0"
                          >
                            <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                          </motion.div>
                        )}
                        {downloadState === 'completed' && (
                          <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="w-4 h-4 flex-shrink-0"
                          >
                            <Check className="w-4 h-4 text-emerald-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <span>
                        {downloadState === 'idle' && 'Download PDF'}
                        {downloadState === 'downloading' && 'Downloading...'}
                        {downloadState === 'completed' && 'Resume Downloaded'}
                      </span>
                    </button>

                    <button
                      onClick={handlePrintResume}
                      className="flex items-center gap-3 px-4 py-3 rounded-[12px] cursor-pointer hover:bg-zinc-100/90 text-zinc-700 hover:text-black font-sans text-xs font-semibold select-none transition-colors"
                    >
                      <Printer className="w-4 h-4 text-cyan-500" />
                      <span>Print Resume</span>
                    </button>

                    <button
                      onClick={handleCopySummary}
                      className="flex items-center gap-3 px-4 py-3 rounded-[12px] cursor-pointer hover:bg-zinc-100/90 text-zinc-700 hover:text-black font-sans text-xs font-semibold select-none transition-colors"
                    >
                      <Copy className="w-4 h-4 text-cyan-500" />
                      <span>Copy Summary</span>
                    </button>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </header>

      {/* Recruiter Summary Glass Clipboard Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-[9999] pointer-events-auto"
          >
            <div className="relative p-[1px] rounded-2xl animate-neon-border shadow-[0_15px_40px_-10px_rgba(0,0,0,0.35),_0_4px_12px_rgba(59,130,246,0.15)]">
              <div className="bg-white/95 backdrop-blur-[12px] px-5 py-3.5 rounded-[15px] border border-white/80 flex items-center gap-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.85)]">
                <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-600 font-extrabold text-xs select-none">
                  ✓
                </div>
                <span className="font-sans text-xs font-bold text-zinc-800 tracking-wide uppercase select-none">
                  {toast.message}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Interactive Document Viewer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4 backdrop-blur-md bg-zinc-950/60 pointer-events-auto modal-backdrop"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Modal Bounding Window */}
            <motion.div
              ref={modalContainerRef}
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-zinc-900/90 border border-zinc-800/80 w-full max-w-5xl h-[88vh] rounded-[24px] flex flex-col shadow-[0_30px_70px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Toolbar Header (Hides in window printing) */}
              <div className="h-16 border-b border-zinc-800/75 px-6 flex items-center justify-between bg-zinc-950/60 backdrop-blur-[10px] modal-toolbar">
                {/* Left side: Document Name */}
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
                    KAVYA_MAKHAN_CV.pdf
                  </span>
                </div>

                {/* Right side: Operations Menu Bar */}
                <div className="flex items-center gap-2 font-sans">
                  
                  {/* Zoom Operations */}
                  <button
                    onClick={() => setZoomScale(prev => Math.max(prev - 0.15, 0.6))}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <span className="text-[10px] font-mono text-zinc-500 w-10 text-center uppercase tracking-wide select-none">
                    {Math.round(zoomScale * 100)}%
                  </span>

                  <button
                    onClick={() => setZoomScale(prev => Math.min(prev + 0.15, 1.8))}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setZoomScale(1.0)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors mr-2"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="w-[1px] h-4 bg-zinc-800/80 mx-1" />

                  {/* Actions Operations */}
                  <button
                    onClick={handleDownloadResume}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                    title="Download Copy"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handlePrintResume}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleFullscreenToggle}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors mr-2"
                    title="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  <div className="w-[1px] h-4 bg-zinc-800/80 mx-1" />

                  {/* Exit Close operation */}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 border border-transparent transition-all ml-1"
                    title="Close Viewer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                </div>
              </div>

              {/* Document Viewing Page container */}
              <div 
                className="flex-1 overflow-auto bg-zinc-950/70 p-10 flex items-start justify-center modal-scroll-container"
                style={{ overscrollBehavior: 'contain' }}
              >
                <div 
                  className="transition-transform duration-200 ease-out origin-top shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                  style={{ transform: `scale(${zoomScale})` }}
                >
                  
                  {/* Styled PDF Paper Page Sheet */}
                  <div 
                    id="resume-print-area"
                    className="w-[812px] min-h-[1130px] bg-white text-zinc-900 p-16 font-sans relative flex flex-col justify-between"
                  >
                    
                    <div>
                      {/* CV Header details */}
                      <div className="border-b-2 border-zinc-900 pb-5 mb-8">
                        <h1 className="text-4xl font-display font-black tracking-tight text-zinc-900 leading-none">
                          KAVYA MAKHAN
                        </h1>
                        <p className="text-xs font-mono font-bold tracking-[0.15em] text-cyan-600 uppercase mt-2">
                          Mechanical Engineer & AI Algorithms Developer
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[10px] font-mono text-zinc-500 mt-4 uppercase tracking-wide">
                          <span>India</span>
                          <span>•</span>
                          <a 
                            href="mailto:kavya.makhan@example.com" 
                            className="hover:text-cyan-600 transition-colors pointer-events-auto cursor-pointer"
                            onClick={() => trackEmailClick('Resume Modal Email')}
                          >
                            kavya.makhan@example.com
                          </a>
                          <span>•</span>
                          <a 
                            href="https://github.com/kavya-makhan" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:text-cyan-600 transition-colors pointer-events-auto cursor-pointer"
                            onClick={() => trackGitHubClick('Resume Modal GitHub')}
                          >
                            github.com/kavya-makhan
                          </a>
                          <span>•</span>
                          <a 
                            href="https://linkedin.com/in/kavya-makhan" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:text-cyan-600 transition-colors pointer-events-auto cursor-pointer"
                            onClick={() => trackLinkedInClick('Resume Modal LinkedIn')}
                          >
                            linkedin.com/in/kavya-makhan
                          </a>
                        </div>
                      </div>

                      {/* 01. EDUCATION */}
                      <div className="mb-6">
                        <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-600 uppercase mb-2">
                          01 / Education
                        </h2>
                        <div className="border-t border-zinc-300 pt-2 flex justify-between items-start">
                          <div>
                            <h3 className="text-xs font-bold uppercase text-zinc-800">
                              Bachelor of Mechanical Engineering, Minor in Artificial Intelligence
                            </h3>
                            <p className="text-[11px] text-zinc-500 mt-1">
                              Specialization: Cyber-Physical Systems, Neural Control Design, FEA Modeling
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                            GPA: 3.9 / 4.0
                          </span>
                        </div>
                      </div>

                      {/* 02. TECHNICAL SKILLS */}
                      <div className="mb-6">
                        <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-600 uppercase mb-2">
                          02 / Technical Skills
                        </h2>
                        <div className="border-t border-zinc-300 pt-2 grid grid-cols-2 gap-x-8 gap-y-2 text-[11px]">
                          <div>
                            <span className="font-bold text-zinc-800 uppercase block mb-0.5">Software & Algorithms:</span>
                            <span className="text-zinc-600">Python, PyTorch, TensorFlow, ROS2, C++, React.js, FastAPI</span>
                          </div>
                          <div>
                            <span className="font-bold text-zinc-800 uppercase block mb-0.5">Mechanical Engineering:</span>
                            <span className="text-zinc-600">SolidWorks (CSWP), Finite Element Analysis (FEA), Fluid Dynamics (CFD)</span>
                          </div>
                        </div>
                      </div>

                      {/* 03. PROJECTS LOGS */}
                      <div className="mb-6">
                        <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-600 uppercase mb-2">
                          03 / Selected Projects
                        </h2>
                        <div className="border-t border-zinc-300 pt-2 space-y-4">
                          
                          <div>
                            <div className="flex justify-between items-baseline">
                              <h3 
                                className="text-xs font-bold uppercase text-zinc-800 hover:text-cyan-600 transition-colors cursor-pointer pointer-events-auto"
                                onClick={() => trackProjectClick('Cybernetic Neural Robotic Controller', 'Open')}
                              >
                                Cybernetic Neural Robotic Controller
                              </h3>
                              <span className="text-[10px] font-mono text-zinc-400 font-bold">PyTorch, ROS2, SolidWorks</span>
                            </div>
                            <div className="flex gap-3 text-[9px] font-mono text-cyan-600 mt-1.5 pointer-events-auto">
                              <a 
                                href="https://github.com/kavya-makhan/robotic-controller" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:underline cursor-pointer"
                                onClick={() => trackProjectClick('Cybernetic Neural Robotic Controller', 'GitHub Repository')}
                              >
                                [GITHUB REPOSITORY]
                              </a>
                              <a 
                                href="https://demo.kavya-makhan.dev/robotic-controller" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:underline cursor-pointer"
                                onClick={() => trackProjectClick('Cybernetic Neural Robotic Controller', 'Live Demo')}
                              >
                                [LIVE DEMO]
                              </a>
                            </div>
                            <p className="text-[11px] text-zinc-600 mt-1.5 leading-relaxed">
                              Designed and programmed a deep reinforcement learning model in PyTorch to optimize stability margins in a 3-DOF robot manipulator assembly. Created precise component meshes and dynamics parameters in SolidWorks, exporting directly to ROS2 nodes for real-time physics testing.
                            </p>
                          </div>

                          <div>
                            <div className="flex justify-between items-baseline">
                              <h3 
                                className="text-xs font-bold uppercase text-zinc-800 hover:text-cyan-600 transition-colors cursor-pointer pointer-events-auto"
                                onClick={() => trackProjectClick('Thermally-Optimized Computing Chassis', 'Open')}
                              >
                                Thermally-Optimized Computing Chassis
                              </h3>
                              <span className="text-[10px] font-mono text-zinc-400 font-bold">SolidWorks FEA & CFD, Matlab</span>
                            </div>
                            <div className="flex gap-3 text-[9px] font-mono text-cyan-600 mt-1.5 pointer-events-auto">
                              <a 
                                href="https://github.com/kavya-makhan/thermal-chassis" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:underline cursor-pointer"
                                onClick={() => trackProjectClick('Thermally-Optimized Computing Chassis', 'GitHub Repository')}
                              >
                                [GITHUB REPOSITORY]
                              </a>
                              <a 
                                href="https://demo.kavya-makhan.dev/thermal-chassis" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:underline cursor-pointer"
                                onClick={() => trackProjectClick('Thermally-Optimized Computing Chassis', 'Live Demo')}
                              >
                                [LIVE DEMO]
                              </a>
                            </div>
                            <p className="text-[11px] text-zinc-600 mt-1.5 leading-relaxed">
                              Modeled high-performance heat sink fins and optimized spatial airflow geometries for edge AI computing cards. Performed rigorous fluid-structure thermal coupling analyses, demonstrating a 14.2% reduction in junction hot spots compared to benchmark server chassis.
                            </p>
                          </div>

                          <div>
                            <div className="flex justify-between items-baseline">
                              <h3 
                                className="text-xs font-bold uppercase text-zinc-800 hover:text-cyan-600 transition-colors cursor-pointer pointer-events-auto"
                                onClick={() => trackProjectClick('Autonomous Pathfinder Obstacle Avoidance UAV', 'Open')}
                              >
                                Autonomous Pathfinder Obstacle Avoidance UAV
                              </h3>
                              <span className="text-[10px] font-mono text-zinc-400 font-bold">Python, ARM Microcontrollers, OpenCV</span>
                            </div>
                            <div className="flex gap-3 text-[9px] font-mono text-cyan-600 mt-1.5 pointer-events-auto">
                              <a 
                                href="https://github.com/kavya-makhan/obstacle-avoidance-uav" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:underline cursor-pointer"
                                onClick={() => trackProjectClick('Autonomous Pathfinder Obstacle Avoidance UAV', 'GitHub Repository')}
                              >
                                [GITHUB REPOSITORY]
                              </a>
                              <a 
                                href="https://demo.kavya-makhan.dev/obstacle-avoidance-uav" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:underline cursor-pointer"
                                onClick={() => trackProjectClick('Autonomous Pathfinder Obstacle Avoidance UAV', 'Live Demo')}
                              >
                                [LIVE DEMO]
                              </a>
                            </div>
                            <p className="text-[11px] text-zinc-600 mt-1.5 leading-relaxed">
                              Developed a lightweight computer vision pipeline using Python and OpenCV for obstacle detection and map routing in real-time, compiled and optimized for resource-constrained ARM Cortex flight controllers.
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* 04. CERTIFICATIONS & AWARDS */}
                      <div className="mb-6">
                        <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-600 uppercase mb-2">
                          04 / Credentials & Achievements
                        </h2>
                        <div className="border-t border-zinc-300 pt-2 space-y-2 text-[11px] text-zinc-600">
                          <p>
                            <span className="font-bold text-zinc-800 uppercase">AWS Certified Machine Learning - Specialty</span> — Credential Validation ID: AWS-ML-SPEC-2025
                          </p>
                          <p>
                            <span className="font-bold text-zinc-800 uppercase">Certified SolidWorks Professional (CSWP)</span> — Dassault Systèmes Validation #C-SWPRO-2024
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CV Footer */}
                    <div className="border-t border-zinc-200 pt-4 flex justify-between items-center text-[9px] font-mono text-zinc-400 uppercase tracking-widest mt-12">
                      <span>Kavya Makhan CV Portfolio</span>
                      <span>Verified Live Document</span>
                    </div>

                  </div>

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(Navbar);
