import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import CustomCursor from './components/cursor/CustomCursor';
import ThemeToggle from './components/theme/ThemeToggle';
import CursorTelemetry from './components/cursor/CursorTelemetry';
import Navbar from './components/navigation/Navbar';
import SectionNavigator from './components/navigation/SectionNavigator';
import { ThemeProvider } from './components/theme/ThemeContext';
import MouseEffects from './components/effects/MouseEffects';
import AIKAVCore from './components/effects/AIKAVCore';
import AIKAVDialogueBubble from './components/effects/AIKAVDialogueBubble';


// Lazy-load mobile navigation to avoid increasing desktop bundle size or affecting desktop performance
const MobileNavbar = lazy(() => import('./components/navigation/MobileNavbar'));
import Hero from './components/home/Hero';
import AboutSection from './components/about/AboutSection';
import Skills from './components/skills/Skills';
import SectionHeader from './components/navigation/SectionHeader';
import SpaceBoiScene from './components/outro/SpaceBoiScene';
import Projects from './components/projects/Projects';
import Certificates from './components/certificates/Certificates';
import ContactSection from './components/contact/ContactSection';
import Lenis from 'lenis';
import { useGLTF, useEnvironment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/landing/LandingPage';

// Preload the Hero robot model asset and HDRI environment during the loading screen phase
useGLTF.preload('/models/small_robot.glb');
useEnvironment.preload({ preset: 'city' });

const sectionConfigs = {
  home: { placeholderId: 'aikav-placeholder-home' },
  about: { placeholderId: 'aikav-placeholder-dock' },
  skills: { placeholderId: 'aikav-placeholder-skills' },
  projects: { placeholderId: 'aikav-placeholder-dock' },
  certificates: { placeholderId: 'aikav-placeholder-certificates' },
  contact: { placeholderId: 'aikav-placeholder-dock' },
  resume: { placeholderId: 'aikav-placeholder-dock' }
};

import {
  trackPageView,
  trackSectionView,
  trackScrollDepth,
  trackSessionDuration,
  trackOutboundLink,
  trackNavigationClick
} from './utils/analytics';

export default function App() {
  const isTransitionComplete = true;
  const [showLanding, setShowLanding] = useState(true);

  // Disable scroll and stop Lenis during landing page overlay active phase
  useEffect(() => {
    const lockScroll = () => {
      if (showLanding) {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        if (window.lenis) {
          window.lenis.stop();
        } else {
          setTimeout(() => window.lenis?.stop(), 50);
        }
      } else {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        window.lenis?.start();
      }
    };
    lockScroll();
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [showLanding]);

  // Shared navigation state
  const [activeSection, setActiveSection] = useState('home');
  const targetSectionRef = useRef(null);
  const manualScrollTimeoutRef = useRef(null);
  const ratiosRef = useRef({});

  // Responsive device query using matchMedia
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const listener = (e) => setIsMobile(e.matches);
    setIsMobile(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const [coreSize, setCoreSize] = useState(120);

  const [coords, setCoords] = useState({});
  const targetPosition = activeSection === 'home' ? 'home' : 'dock';
  const [currentPosition, setCurrentPosition] = useState(targetPosition);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [glanceAtAIKAV, setGlanceAtAIKAV] = useState(false);
  const [lookAway, setLookAway] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Controlled AIKAV Home -> Dock transition states
  const [forceBlink, setForceBlink] = useState(false);
  const [lookDirection, setLookDirection] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  const [moveFrom, setMoveFrom] = useState(targetPosition);
  const [moveTo, setMoveTo] = useState(targetPosition);

  const coordsRef = useRef(coords);
  useEffect(() => {
    coordsRef.current = coords;
  }, [coords]);

  // Warp Thruster & Ring Speed Boost states
  const [ringSpeedBoost, setRingSpeedBoost] = useState(false);
  const [thrusterActive, setThrusterActive] = useState(false);
  const [thrusterAngle, setThrusterAngle] = useState(135);
  const [glowBoost, setGlowBoost] = useState(false);

  const updateCoords = useCallback(() => {
    const newCoords = {};
    Object.entries(sectionConfigs).forEach(([section, config]) => {
      const el = document.getElementById(config.placeholderId);
      if (el) {
        let targetSize = 120;
        if (section === 'home') {
          targetSize = 78; // 78px core size results in 52px outer ring, which is exactly 90% of 58px emblem container
        } else {
          targetSize = coreSize;
        }

        // Custom relative midpoint layout calculation for Skills section
        if (section === 'skills') {
          const skillsSection = document.getElementById('skills');
          const skillWheel = document.getElementById('skills-orbit-container');
          const skillsCard = document.getElementById('skills-card-panel');

          if (skillsSection && skillWheel && skillsCard) {
            const sectionRect = skillsSection.getBoundingClientRect();
            const wheelRect = skillWheel.getBoundingClientRect();
            const cardRect = skillsCard.getBoundingClientRect();
            const isMobileLayout = window.innerWidth < 1024;

            let centerX, centerY;
            if (isMobileLayout) {
              // Vertically center between bottom of wheel and top of card
              centerY = (wheelRect.bottom + cardRect.top) / 2;
              centerX = sectionRect.left + sectionRect.width / 2;
            } else {
              // Horizontally: midpoint between wheel.right and card.left, shifted 50px left
              centerX = (wheelRect.right + cardRect.left) / 2 - 50;
              // Vertically: level with FRONTEND title header, matching the cursor position
              centerY = cardRect.top + 45;
            }

            newCoords[section] = {
              centerX: centerX,
              centerY: centerY,
              size: targetSize
            };
            return; // Skip standard coordinate calculation
          }
        }

        // Custom relative midpoint layout calculation for Projects section
        if (section === 'projects') {
          const cards = document.querySelectorAll('.projects-card-item');
          if (cards.length > 0) {
            // Find the active sticky card
            let activeCard = cards[0];
            for (let i = 0; i < cards.length; i++) {
              const rect = cards[i].getBoundingClientRect();
              // Card is sticky at top: 120px, so we look for the card currently in view/pinned
              if (rect.top <= 130 && rect.bottom > 130) {
                activeCard = cards[i];
                break;
              }
            }

            const infoCol = activeCard.querySelector('.projects-info-column');
            const mediaCol = activeCard.querySelector('.projects-media-column');

            if (infoCol && mediaCol) {
              const infoRect = infoCol.getBoundingClientRect();
              const mediaRect = mediaCol.getBoundingClientRect();
              const isMobileLayout = window.innerWidth < 1024;

              let centerX, centerY;
              if (isMobileLayout) {
                // Centered horizontally, vertically between info and media
                centerX = infoRect.left + infoRect.width / 2;
                centerY = (infoRect.bottom + mediaRect.top) / 2;
              } else {
                // Horizontally: midpoint of the gap
                centerX = (infoRect.right + mediaRect.left) / 2;
                // Vertically: level with browser traffic lights / top bar of mockup
                centerY = mediaRect.top + 22;
              }

              newCoords[section] = {
                centerX: centerX,
                centerY: centerY,
                size: targetSize
              };
              return; // Skip standard coordinate calculation
            }
          }
        }

        // Custom relative midpoint layout calculation for Contact section
        if (section === 'contact') {
          const descEl = document.getElementById('contact-description');
          const btnEl = document.getElementById('contact-cta-button');
          const cardsEl = document.getElementById('contact-cards-panel');

          if (descEl && btnEl && cardsEl) {
            const descRect = descEl.getBoundingClientRect();
            const btnRect = btnEl.getBoundingClientRect();
            const cardsRect = cardsEl.getBoundingClientRect();
            const isMobileLayout = window.innerWidth < 1024;

            if (!isMobileLayout) {
              // Horizontally: midpoint between the right edge of description/button and the left edge of cards panel
              const leftEdge = Math.max(descRect.right, btnRect.right);
              const centerX = (leftEdge + cardsRect.left) / 2;

              // Vertically: midpoint between bottom of description and top of CTA button
              const centerY = (descRect.bottom + btnRect.top) / 2;

              newCoords[section] = {
                centerX: centerX,
                centerY: centerY,
                size: targetSize
              };
              return; // Skip standard coordinate calculation
            }
          }
        }

        // Custom relative layout calculation for Resume section
        if (section === 'resume') {
          const resumeEl = document.getElementById('resume');
          if (resumeEl) {
            const rect = resumeEl.getBoundingClientRect();
            const isMobileLayout = window.innerWidth < 1024;
            if (!isMobileLayout) {
              // centerX: left side of viewport, e.g. 15% of width or at least 160px from the left
              const centerX = rect.left + Math.max(160, window.innerWidth * 0.15);
              // centerY: vertical center of the section's viewport bounding box
              const centerY = rect.top + rect.height / 2;

              newCoords[section] = {
                centerX: centerX,
                centerY: centerY,
                size: 240 // Make him big!
              };
              return; // Skip standard coordinate calculation
            }
          }
        }

        const rect = el.getBoundingClientRect();
        newCoords[section] = {
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
          size: targetSize
        };
      }
    });

    if (Object.keys(newCoords).length > 0) {
      setCoords(prev => ({
        ...prev,
        ...newCoords
      }));
    }
  }, [coreSize]);

  // Sync coords on visibility, resize, scroll, and active section changes
  useEffect(() => {
    if (!isTransitionComplete) return;

    updateCoords();

    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
    };
  }, [isTransitionComplete, updateCoords, activeSection, showLanding]);

  // Single Continuous Spring Transition Effect
  useEffect(() => {
    if (targetPosition !== currentPosition) {
      setIsTransitioning(true);
      setMoveFrom(currentPosition);
      setMoveTo(targetPosition);
      setGlowBoost(true);
      setIsMoving(true);

      const tDone = setTimeout(() => {
        setIsMoving(false);
        setIsTransitioning(false);
        setGlowBoost(false);
        setCurrentPosition(targetPosition);
      }, 680);

      return () => {
        clearTimeout(tDone);
        setIsMoving(false);
        setIsTransitioning(false);
        setGlowBoost(false);
      };
    }
  }, [targetPosition, currentPosition]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setCoreSize(80);
      } else if (w < 1024) {
        setCoreSize(100);
      } else {
        setCoreSize(120);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  // Shared navigation click handler supporting the transition lock
  const handleNavClick = useCallback((e, id) => {
    if (e) e.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;

    // Track Navigation Click
    const sectionName = id === 'home' ? 'Hero' : id.charAt(0).toUpperCase() + id.slice(1);
    trackNavigationClick(sectionName);

    // Lock active section changes while scrolling
    targetSectionRef.current = id;

    // Calculate scroll destination (offset matching Navbar: -150px)
    const yOffset = -150;
    const targetY = element.getBoundingClientRect().top + window.scrollY + yOffset;

    if (window.lenis) {
      window.lenis.scrollTo(targetY, {
        duration: 0.45,
        onComplete: () => {
          setActiveSection(id);
          targetSectionRef.current = null;
        }
      });
    } else {
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth'
      });
      if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
      manualScrollTimeoutRef.current = setTimeout(() => {
        setActiveSection(id);
        targetSectionRef.current = null;
      }, 500);
    }
  }, []);

  // 2. Track page views, sections, scroll depth, and session duration after page loads
  useEffect(() => {
    if (!isTransitionComplete) return;

    // Trigger initial page view
    trackPageView();

    // A. Automatic section discovery, tracking, and active state spying
    const observer = new IntersectionObserver(
      (entries) => {
        // If we are currently navigating to a target section, lock the observer
        if (targetSectionRef.current) {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id === targetSectionRef.current) {
              setActiveSection(targetSectionRef.current);

              // Track in analytics
              let name = targetSectionRef.current.charAt(0).toUpperCase() + targetSectionRef.current.slice(1);
              if (targetSectionRef.current === 'home') name = 'Hero';
              if (targetSectionRef.current === 'resume') name = 'Resume';
              trackSectionView(name);

              targetSectionRef.current = null;
            }
          });
          return;
        }

        // Normal scroll-spy active section detection
        entries.forEach((entry) => {
          ratiosRef.current[entry.target.id] = entry.intersectionRatio;
        });

        let highestSectionId = null;
        let maxRatio = 0;

        Object.entries(ratiosRef.current).forEach(([id, ratio]) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            highestSectionId = id;
          }
        });

        // Hysteresis requirement: require significant visibility (ratio > 0.05) before changing sections
        if (highestSectionId && maxRatio > 0.05 && highestSectionId !== activeSection) {
          setActiveSection(highestSectionId);

          let name = highestSectionId.charAt(0).toUpperCase() + highestSectionId.slice(1);
          if (highestSectionId === 'home') name = 'Hero';
          if (highestSectionId === 'resume') name = 'Resume';
          trackSectionView(name);
        }
      },
      {
        // Multiple thresholds to get fine-grained ratio updates (especially at low visibility levels)
        threshold: [0, 0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '-10% 0px -15% 0px'
      }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((sec) => {
      observer.observe(sec);
      ratiosRef.current[sec.id] = 0;
    });

    // B. Scroll depth tracker (only tracks once per threshold)
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      const thresholds = [25, 50, 75, 100];
      thresholds.forEach((threshold) => {
        if (scrollPercent >= threshold) {
          trackScrollDepth(threshold);
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // C. Global click observer to instantly transition active pill for external page scroll triggers (e.g. Hero CTAs)
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

      const validSections = ['home', 'about', 'skills', 'projects', 'certificates', 'contact'];
      if (targetId && validSections.includes(targetId)) {
        handleNavClick(null, targetId);
      }
    };
    window.addEventListener('click', handleGlobalClick, { passive: true });

    // D. Outbound link click tracker
    const handleOutboundClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href) {
        const url = anchor.href;
        const isOutbound = url.startsWith('http') && !url.includes(window.location.hostname);
        if (isOutbound) {
          trackOutboundLink(url);
        }
      }
    };
    window.addEventListener('click', handleOutboundClick);

    // E. Session duration milestones
    const timers = [
      setTimeout(() => trackSessionDuration(30), 30000),
      setTimeout(() => trackSessionDuration(60), 60000),
      setTimeout(() => trackSessionDuration(120), 120000),
    ];

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('click', handleOutboundClick);
      timers.forEach((t) => clearTimeout(t));
      if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
    };
  }, [isTransitionComplete, activeSection, handleNavClick, showLanding]);

  useEffect(() => {
    // Initialize Lenis smooth scroll engine (optimized for high refresh rate displays with responsive physics)
    const lenis = new Lenis({
      lerp: 0.22, // Responsive linear interpolation (approx 0.18-0.25)
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.5, // Snappy wheel multiplier (approx 1.4-1.8)
      syncTouch: true, // Sync touch scroll if supported
      touchMultiplier: 1.1, // Responsiveness multiplier on touch screens (approx 1.0-1.2)
      infinite: false,
      prevent: (node) => {
        // Prevent smooth scroll hijacking on scrollable elements (e.g. resume modal, overflow areas)
        return node.closest('.modal-scroll-container') || node.closest('.overflow-auto') || node.closest('.overflow-y-auto');
      },
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    window.lenis = lenis;

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
      window.lenis = null;
    };
  }, []);



  // Single continuous movement calculator
  const getTransitionAnimation = () => {
    const endKey = moveTo === 'home' ? 'home' : 'about';

    if (!coords[endKey]) {
      return {
        x: (coords[activeSection]?.centerX ?? 0) - (coords[activeSection]?.size ?? 120) / 2,
        y: (coords[activeSection]?.centerY ?? 0) - (coords[activeSection]?.size ?? 120) / 2,
        scale: (coords[activeSection]?.size ?? 120) / 300,
        rotate: 0,
        opacity: 1,
      };
    }

    const endX = coords[endKey].centerX - coords[endKey].size / 2;
    const endY = coords[endKey].centerY - coords[endKey].size / 2;
    const endScale = (coords[endKey].size / 300) * 0.98;
    const isLeavingHome = moveFrom === 'home';
    const tilt = isLeavingHome ? 2 : -2;

    return {
      x: endX,
      y: endY,
      scale: endScale,
      rotate: tilt,
      opacity: 1,
    };
  };

  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-[var(--bg-dark)] text-[var(--text-main)] selection:bg-[var(--accent-color)] selection:text-black font-sans overflow-x-clip transition-colors duration-300">
        {/* Custom cursor and click effects are always active and render above the landing page overlay */}
        <CustomCursor />
        <MouseEffects />
        <ThemeToggle isLanding={showLanding} onClick={() => console.log('Theme toggle clicked!')} />
        <CursorTelemetry activeSection={showLanding ? 'landing page' : activeSection} />

        <AnimatePresence>
          {showLanding && (
            <LandingPage onBegin={() => setShowLanding(false)} />
          )}
        </AnimatePresence>

        {!showLanding && (
          <>
            <Navbar
              activeSection={activeSection}
              handleNavClick={handleNavClick}
              showEmblem={activeSection !== 'home' && !isTransitioning}
            />
            <main>
              <section id="home">
                <Hero showRobot={isTransitionComplete} glanceAtAIKAV={glanceAtAIKAV} activeSection={activeSection} />
              </section>

              {isTransitionComplete && (
                <>
                  <SectionNavigator activeSection={activeSection} handleNavClick={handleNavClick} />
                  {isMobile && (
                    <Suspense fallback={null}>
                      <MobileNavbar activeSection={activeSection} handleNavClick={handleNavClick} />
                    </Suspense>
                  )}
                  <AboutSection isTransitionComplete={isTransitionComplete} activeSection={activeSection} />
                  <Skills />

                  <Projects />

                  <Certificates />

                  <section
                    id="contact"
                    className="relative flex flex-col justify-center border-t border-[var(--border-color)] bg-[var(--bg-dark)] overflow-hidden pt-6 md:pt-8 pb-12 md:pb-16"
                  >
                    {/* Blueprint grid and radial glow */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none z-0" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.03),transparent_70%)] pointer-events-none z-0" />

                    <div className="relative z-10 w-full">
                      <SectionHeader
                        number="05"
                        title="LET'S TALK"
                        rightLabel="COMMUNICATION NODE"
                      />
                      <div className="px-6">
                        <ContactSection />
                      </div>
                    </div>
                  </section>

                  <SpaceBoiScene />
                </>
              )}

              {/* Stationary Dock Placeholder for other sections */}
              <div
                id="aikav-placeholder-dock"
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-[999] pointer-events-none"
                style={{
                  width: coreSize,
                  height: coreSize,
                }}
              />

              {/* Unified single AIKAVCore instance with dynamic positioning */}
              {isTransitionComplete && coords[activeSection] && (
                <>
                  <motion.div
                    initial={false}
                    animate={{
                      x: (coords[activeSection]?.centerX ?? 0) - (coords[activeSection]?.size ?? 120) / 2,
                      y: (coords[activeSection]?.centerY ?? 0) - (coords[activeSection]?.size ?? 120) / 2,
                      scale: (coords[activeSection]?.size ?? 120) / 300,
                      rotate: activeSection === 'home' ? 0 : 2,
                      opacity: 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 180,
                      damping: 24,
                      mass: 0.8,
                    }}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: 300,
                      height: 300,
                      transformOrigin: 'top left',
                      zIndex: 999,
                      pointerEvents: coords[activeSection] ? 'auto' : 'none',
                      filter: 'drop-shadow(0 0 20px rgba(var(--aikav-primary-rgb, 0, 255, 255), 0.15))',
                      transition: 'filter 400ms ease-in-out',
                      opacity: coords[activeSection] ? 1 : 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      willChange: 'transform',
                    }}
                  >
                    <AIKAVCore
                      size={300}
                      lookAway={lookAway}
                      forceBlink={forceBlink}
                      lookDirection={lookDirection}
                      isMoving={isMoving}
                      ringSpeedBoost={ringSpeedBoost}
                      thrusterActive={thrusterActive}
                      thrusterAngle={thrusterAngle}
                      glowBoost={glowBoost}
                      isSpeaking={isSpeaking}
                    />
                  </motion.div>

                  {/* AI.KAV Home Introduction Dialogue Bubble */}
                  <AIKAVDialogueBubble
                    homeCoords={coords['home']}
                    skillsCoords={coords['skills']}
                    projectsCoords={coords['projects']}
                    certificatesCoords={coords['certificates']}
                    contactCoords={coords['contact']}
                    resumeCoords={coords['resume']}
                    activeSection={activeSection}
                    isTransitioning={isTransitioning}
                    onRobotGlance={setGlanceAtAIKAV}
                    onAIKAVLookAway={setLookAway}
                    onSpeakingChange={setIsSpeaking}
                  />
                </>
              )}
            </main>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
