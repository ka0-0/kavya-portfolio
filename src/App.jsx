import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
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

// Hoisted static style for the unified AIKAVCore wrapper (identical values, no per-frame object allocation)
const AIKAV_WRAPPER_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: 300,
  height: 300,
  transformOrigin: 'top left',
  zIndex: 999,
  pointerEvents: 'auto',
  filter: 'drop-shadow(0 0 20px rgba(var(--aikav-primary-rgb, 0, 255, 255), 0.15))',
  transition: 'filter 400ms ease-in-out',
  opacity: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  willChange: 'transform',
};

const AIKAV_WRAPPER_TRANSITION = {
  type: 'spring',
  stiffness: 180,
  damping: 24,
  mass: 0.8,
};

import {
  trackPageView,
  trackSectionView,
  trackScrollDepth,
  trackSessionDuration,
  trackOutboundLink,
  trackNavigationClick
} from './utils/analytics';

/**
 * AIKAVLayer
 *
 * Owns the per-frame AIKAV orb coordinate tracking. This lives in its own component so that
 * scroll-driven coordinate updates re-render ONLY the orb + dialogue bubble instead of the
 * entire App tree (Skills / Projects / Certificates / Contact / SpaceBoi were previously
 * reconciled on every single scroll frame).
 *
 * Positioning math, spring configuration and DOM output are byte-identical to the original.
 */
function AIKAVLayer({
  coreSize,
  activeSection,
  isTransitioning,
  // Defaults true so any caller that doesn't pass it (none currently) keeps prior behavior.
  // When false, the coordinate-tracking orb still mounts and settles its position (so it's
  // already correctly placed the instant it becomes visible), but the dialogue bubble is held
  // back — see the render below for why.
  isRevealed = true,
  lookAway,
  forceBlink,
  lookDirection,
  isMoving,
  ringSpeedBoost,
  thrusterActive,
  thrusterAngle,
  glowBoost,
  isSpeaking,
  onRobotGlance,
  onAIKAVLookAway,
  onSpeakingChange,
}) {
  const [coords, setCoords] = useState({});

  // Keep the active section readable from the rAF loop without re-creating the callback.
  // Declared before the measurement effect so the ref is always synced first.
  const activeSectionRef = useRef(activeSection);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // Cached DOM lookups — these nodes are stable for the lifetime of their section
  const elCacheRef = useRef(new Map());
  const projectCardsRef = useRef(null);
  const projectColsRef = useRef(new WeakMap());

  // Cached viewport width so the breakpoint check never reads layout during scroll
  const viewportWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const getEl = useCallback((id) => {
    const cache = elCacheRef.current;
    let el = cache.get(id);
    if (!el || !el.isConnected) {
      el = document.getElementById(id);
      if (el) {
        cache.set(id, el);
      } else {
        cache.delete(id);
      }
    }
    return el;
  }, []);

  const getProjectCards = useCallback(() => {
    const cached = projectCardsRef.current;
    if (cached && cached.length > 0) {
      let allConnected = true;
      for (let i = 0; i < cached.length; i++) {
        if (!cached[i].isConnected) {
          allConnected = false;
          break;
        }
      }
      if (allConnected) return cached;
    }
    const list = Array.from(document.querySelectorAll('.projects-card-item'));
    projectCardsRef.current = list;
    return list;
  }, []);

  const getProjectColumns = useCallback((card) => {
    const cache = projectColsRef.current;
    let cols = cache.get(card);
    if (
      !cols ||
      !cols.infoCol ||
      !cols.mediaCol ||
      !cols.infoCol.isConnected ||
      !cols.mediaCol.isConnected
    ) {
      const infoCol = card.querySelector('.projects-info-column');
      const mediaCol = card.querySelector('.projects-media-column');
      cols = { infoCol, mediaCol };
      if (infoCol && mediaCol) cache.set(card, cols);
    }
    return cols;
  }, []);

  /**
   * Measures ONLY the currently active section. The original measured all 7 sections every
   * frame, but `coords[activeSection]` is the sole value ever read (the dialogue bubble reads
   * only the coords prop matching the active section). Previously measured sections are kept
   * in state via the merge below, so every existing render gate still sees the same data.
   */
  const updateCoords = useCallback(() => {
    const section = activeSectionRef.current;
    const config = sectionConfigs[section];
    if (!config) return;

    const el = getEl(config.placeholderId);
    if (!el) return;

    const targetSize = section === 'home'
      ? 78 // 78px core size results in 52px outer ring, which is exactly 90% of 58px emblem container
      : coreSize;

    const viewportWidth = viewportWidthRef.current;
    let next = null;

    // Custom relative midpoint layout calculation for Skills section
    if (section === 'skills') {
      const skillsSection = getEl('skills');
      const skillWheel = getEl('skills-orbit-container');
      const skillsCard = getEl('skills-card-panel');

      if (skillsSection && skillWheel && skillsCard) {
        const sectionRect = skillsSection.getBoundingClientRect();
        const wheelRect = skillWheel.getBoundingClientRect();
        const cardRect = skillsCard.getBoundingClientRect();
        const isMobileLayout = viewportWidth < 1024;

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

        next = { centerX, centerY, size: targetSize };
      }
    }

    // Custom relative midpoint layout calculation for Projects section
    else if (section === 'projects') {
      const cards = getProjectCards();
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

        const { infoCol, mediaCol } = getProjectColumns(activeCard);

        if (infoCol && mediaCol) {
          const infoRect = infoCol.getBoundingClientRect();
          const mediaRect = mediaCol.getBoundingClientRect();
          const isMobileLayout = viewportWidth < 1024;

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

          next = { centerX, centerY, size: targetSize };
        }
      }
    }

    // Custom relative midpoint layout calculation for Contact section
    else if (section === 'contact') {
      const descEl = getEl('contact-description');
      const btnEl = getEl('contact-cta-button');
      const cardsEl = getEl('contact-cards-panel');

      if (descEl && btnEl && cardsEl) {
        const isMobileLayout = viewportWidth < 1024;

        if (!isMobileLayout) {
          const descRect = descEl.getBoundingClientRect();
          const btnRect = btnEl.getBoundingClientRect();
          const cardsRect = cardsEl.getBoundingClientRect();

          // Horizontally: midpoint between the right edge of description/button and the left edge of cards panel
          const leftEdge = Math.max(descRect.right, btnRect.right);
          const centerX = (leftEdge + cardsRect.left) / 2;

          // Vertically: midpoint between bottom of description and top of CTA button
          const centerY = (descRect.bottom + btnRect.top) / 2;

          next = { centerX, centerY, size: targetSize };
        }
      }
    }

    // Custom relative layout calculation for Resume section
    else if (section === 'resume') {
      const resumeEl = getEl('resume');
      if (resumeEl) {
        const isMobileLayout = viewportWidth < 1024;
        if (!isMobileLayout) {
          const rect = resumeEl.getBoundingClientRect();
          // centerX: left side of viewport, e.g. 15% of width or at least 160px from the left
          const centerX = rect.left + Math.max(160, viewportWidth * 0.15);
          // centerY: vertical center of the section's viewport bounding box
          const centerY = rect.top + rect.height / 2;

          next = {
            centerX,
            centerY,
            size: 240 // Make him big!
          };
        }
      }
    }

    if (!next) {
      const rect = el.getBoundingClientRect();
      next = {
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        size: targetSize
      };
    }

    setCoords((prev) => {
      const p = prev[section];
      if (
        p &&
        Math.abs(next.centerX - p.centerX) <= 0.5 &&
        Math.abs(next.centerY - p.centerY) <= 0.5 &&
        next.size === p.size
      ) {
        return prev;
      }
      return { ...prev, [section]: next };
    });
  }, [coreSize, getEl, getProjectCards, getProjectColumns]);

  // Sync coords on resize, scroll, and active section changes
  useEffect(() => {
    updateCoords();

    let rafId = null;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(() => {
          ticking = false;
          updateCoords();
        });
      }
    };

    const handleResize = () => {
      viewportWidthRef.current = window.innerWidth;
      updateCoords();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [updateCoords, activeSection]);

  const activeCoords = coords[activeSection];

  // Stable element identity keeps React from reconciling the 7-skin AIKAVCore subtree on every
  // coordinate frame — it only re-renders when one of its own props actually changes.
  const coreElement = useMemo(() => (
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
  ), [
    lookAway,
    forceBlink,
    lookDirection,
    isMoving,
    ringSpeedBoost,
    thrusterActive,
    thrusterAngle,
    glowBoost,
    isSpeaking,
  ]);

  if (!activeCoords) return null;

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          x: activeCoords.centerX - activeCoords.size / 2,
          y: activeCoords.centerY - activeCoords.size / 2,
          scale: activeCoords.size / 300,
          rotate: activeSection === 'home' ? 0 : 2,
          opacity: 1,
        }}
        transition={AIKAV_WRAPPER_TRANSITION}
        style={AIKAV_WRAPPER_STYLE}
      >
        {coreElement}
      </motion.div>

      {/* AI.KAV Home Introduction Dialogue Bubble.
          Gated on isRevealed: this component renders through a React portal straight to
          document.body (createPortal), so it sits OUTSIDE this tree's DOM nesting — a CSS
          visibility:hidden wrapper placed around the rest of the pre-warmed Hero content in
          App's return below has no effect on it. Left ungated, its dialogue-trigger effect
          would start typing out the "Hello! I'm AI.KAV..." intro the instant the orb's coords
          settle, which can happen while the landing screen is still covering the page —
          producing a stray, fixed-position bubble bleeding through the landing sequence. */}
      {isRevealed && (
        <AIKAVDialogueBubble
          homeCoords={coords['home']}
          skillsCoords={coords['skills']}
          projectsCoords={coords['projects']}
          certificatesCoords={coords['certificates']}
          contactCoords={coords['contact']}
          resumeCoords={coords['resume']}
          activeSection={activeSection}
          isTransitioning={isTransitioning}
          onRobotGlance={onRobotGlance}
          onAIKAVLookAway={onAIKAVLookAway}
          onSpeakingChange={onSpeakingChange}
        />
      )}
    </>
  );
}

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

  // Mirror of activeSection for the IntersectionObserver callback, so the observer no longer
  // has to be torn down and re-created (8 sections x 16 thresholds) on every section change.
  const activeSectionRef = useRef(activeSection);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

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

  // Warp Thruster & Ring Speed Boost states
  const [ringSpeedBoost, setRingSpeedBoost] = useState(false);
  const [thrusterActive, setThrusterActive] = useState(false);
  const [thrusterAngle, setThrusterAngle] = useState(135);
  const [glowBoost, setGlowBoost] = useState(false);

  // Single Continuous Spring Transition Effect
  useEffect(() => {
    if (targetPosition !== currentPosition) {
      setIsTransitioning(true);
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
        if (highestSectionId && maxRatio > 0.05 && highestSectionId !== activeSectionRef.current) {
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
    const thresholds = [25, 50, 75, 100];
    let nextThresholdIdx = 0;
    let scrollDepthTicking = false;
    const handleScroll = () => {
      if (scrollDepthTicking || nextThresholdIdx >= thresholds.length) return;
      scrollDepthTicking = true;
      requestAnimationFrame(() => {
        scrollDepthTicking = false;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;

        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        while (nextThresholdIdx < thresholds.length && scrollPercent >= thresholds[nextThresholdIdx]) {
          trackScrollDepth(thresholds[nextThresholdIdx]);
          nextThresholdIdx++;
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const validSections = ['home', 'about', 'skills', 'projects', 'certificates', 'contact'];

    // C. Global click observer: instantly transitions the active pill for external page scroll
    //    triggers (e.g. Hero CTAs) and reports outbound link clicks. Merged into a single
    //    listener so document clicks only walk the ancestor chain once.
    const handleGlobalClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href) {
        const url = anchor.href;
        const isOutbound = url.startsWith('http') && !url.includes(window.location.hostname);
        if (isOutbound) {
          trackOutboundLink(url);
        }
      }

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

      if (targetId && validSections.includes(targetId)) {
        handleNavClick(null, targetId);
      }
    };
    window.addEventListener('click', handleGlobalClick);

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
      timers.forEach((t) => clearTimeout(t));
      if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
    };
  }, [isTransitionComplete, handleNavClick, showLanding]);

  useEffect(() => {
    // Initialize Lenis smooth scroll engine (optimized for high refresh rate displays with responsive physics)
    const lenis = new Lenis({
      // Lenis damps continuous wheel/touch scroll exponentially (lambda = lerp * 60), so this
      // value is already frame-rate independent. 0.1 is Lenis's own library default and gives
      // the trailing, weighted glide of a premium scroll implementation (~500ms to settle)
      // rather than the near-instant snap of the previous 0.22 (~230ms to settle), while
      // staying well clear of the ~0.06 range where scrolling starts to read as laggy.
      lerp: 0.1,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      // Reduced from 1.5 alongside the slower lerp: a large per-tick distance amplification
      // paired with a slower catch-up compounds into the target overshooting far ahead of the
      // visible glide. 1.3 keeps travel brisk on this page's long scroll length without
      // fighting the smoother settle.
      wheelMultiplier: 1.3,
      syncTouch: true, // Sync touch scroll if supported
      touchMultiplier: 1.1, // Responsiveness multiplier on touch screens (approx 1.0-1.2)
      infinite: false,
      // Lenis only takes the fixed-duration eased path when BOTH `duration` and `easing` are
      // present (see Animate.advance: `if (duration && easing)`); otherwise it silently falls
      // back to lerp damping. The nav-click and Hero CTA scrollTo calls already pass
      // `duration: 0.45` but no easing was ever configured, so that duration has been inert —
      // those jumps have always been riding the wheel-scroll lerp instead. This activates it
      // with a standard ease-out-sine curve: fast launch (velocity = pi/2 at t=0), decelerating
      // smoothly to exactly zero velocity at arrival (t=1) rather than stopping abruptly, so
      // "jump to section" gets a proper soft landing over its intended fixed 450ms, decoupled
      // from the wheel lerp. Continuous wheel/touch scrolling is unaffected: those calls never
      // set `duration`, so they always take the lerp-damping branch regardless of this option.
      easing: (t) => Math.sin((t * Math.PI) / 2),
      prevent: (node) => {
        // Prevent smooth scroll hijacking on scrollable elements (e.g. resume modal, overflow areas)
        // Single ancestor walk instead of three.
        return !!node.closest('.modal-scroll-container, .overflow-auto, .overflow-y-auto');
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

  // Prop-less sections never need to be reconciled again once mounted
  const heavySections = useMemo(() => (
    <>
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
  ), []);

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

        {/*
          Navbar + Hero + the AIKAV orb are mounted unconditionally (not gated on showLanding)
          so the robot's Canvas, materials, shaders, environment/PMREM and the AIKAV orb's
          coordinate system are all built and settled WHILE the landing screen still visually
          covers them, instead of starting cold the instant it's dismissed. Visibility (not
          mount state) is what's gated here — see the style below — so this is purely about
          WHEN the work happens, not what's rendered.

          SectionNavigator / MobileNavbar / AboutSection / the below-the-fold sections stay
          exactly as before, gated behind showLanding: they're unrelated to the reported
          Hero-reveal hitch and each already has its own scroll-position-based lazy-activation
          gate (from earlier perf work), so pre-mounting them would do avoidable extra work
          for no benefit.
        */}
        <div
          style={showLanding ? { visibility: 'hidden', pointerEvents: 'none' } : undefined}
        >
          <Navbar
            activeSection={activeSection}
            handleNavClick={handleNavClick}
            showEmblem={activeSection !== 'home' && !isTransitioning}
          />
          <main>
            <section id="home">
              <Hero
                showRobot={isTransitionComplete}
                glanceAtAIKAV={glanceAtAIKAV}
                activeSection={activeSection}
                isRevealed={!showLanding}
              />
            </section>

            {!showLanding && isTransitionComplete && (
              <>
                <SectionNavigator activeSection={activeSection} handleNavClick={handleNavClick} />
                {isMobile && (
                  <Suspense fallback={null}>
                    <MobileNavbar activeSection={activeSection} handleNavClick={handleNavClick} />
                  </Suspense>
                )}
                <AboutSection isTransitionComplete={isTransitionComplete} activeSection={activeSection} />

                {heavySections}
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

            {/* Unified single AIKAVCore instance with dynamic positioning. Mounted
                unconditionally so its coords are already measured and settled by the time the
                landing screen is dismissed — eliminates the one-frame "pop in" gap that
                previously occurred while coords started empty and the first measurement effect
                had to run post-mount. */}
            {isTransitionComplete && (
              <AIKAVLayer
                coreSize={coreSize}
                activeSection={activeSection}
                isTransitioning={isTransitioning}
                isRevealed={!showLanding}
                lookAway={lookAway}
                forceBlink={forceBlink}
                lookDirection={lookDirection}
                isMoving={isMoving}
                ringSpeedBoost={ringSpeedBoost}
                thrusterActive={thrusterActive}
                thrusterAngle={thrusterAngle}
                glowBoost={glowBoost}
                isSpeaking={isSpeaking}
                onRobotGlance={setGlanceAtAIKAV}
                onAIKAVLookAway={setLookAway}
                onSpeakingChange={setIsSpeaking}
              />
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
