import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import LoadingScreen from './components/LoadingScreen';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import SectionNavigator from './components/SectionNavigator';

// Lazy-load mobile navigation to avoid increasing desktop bundle size or affecting desktop performance
const MobileNavbar = lazy(() => import('./components/MobileNavbar'));
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import Skills from './components/skills/Skills';
import SectionHeader from './components/SectionHeader';
import SpaceBoiScene from './components/SpaceBoiScene';
import Projects from './components/Projects';
import Certificates from './components/Certificates';
import ContactSection from './components/ContactSection';
import Lenis from 'lenis';
import { useGLTF } from '@react-three/drei';

// Preload the Hero robot model asset during the loading screen phase
useGLTF.preload('/models/small_robot.glb');

import { 
  trackLoadingStarted,
  trackLoadingCompleted,
  trackPageView,
  trackSectionView,
  trackScrollDepth,
  trackSessionDuration,
  trackOutboundLink,
  trackNavigationClick
} from './utils/analytics';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPortfolioVisible, setIsPortfolioVisible] = useState(false);
  const [isTransitionComplete, setIsTransitionComplete] = useState(false);
  
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

  // 1. Track loading started on initial mount
  useEffect(() => {
    trackLoadingStarted();
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

  // 2. Track page views, sections, scroll depth, and session duration after loading transitions complete
  useEffect(() => {
    if (!isTransitionComplete) return;

    // Track loading complete
    trackLoadingCompleted();

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
  }, [isTransitionComplete, activeSection, handleNavClick]);

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

  useEffect(() => {
    if (isTransitionComplete) {
      let timer;
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          useGLTF.preload('/models/space_boi.glb');
        });
      } else {
        timer = setTimeout(() => {
          useGLTF.preload('/models/space_boi.glb');
        }, 1000);
      }
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isTransitionComplete]);

  return (
    <>
      {isLoading && (
        <LoadingScreen
          onStartTransition={() => setIsPortfolioVisible(true)}
          onComplete={() => {
            setIsTransitionComplete(true);
            setIsLoading(false);
          }}
        />
      )}

      {isPortfolioVisible && (
        <div className="relative min-h-screen bg-[#090909] text-white selection:bg-blue-600 selection:text-white font-sans overflow-x-clip">
          <CustomCursor />
          <Navbar activeSection={activeSection} handleNavClick={handleNavClick} />
          <main>
            <section id="home">
              <Hero showRobot={true} />
            </section>

            {isTransitionComplete && (
              <>
                <SectionNavigator activeSection={activeSection} handleNavClick={handleNavClick} />
                {isMobile && (
                  <Suspense fallback={null}>
                    <MobileNavbar activeSection={activeSection} handleNavClick={handleNavClick} />
                  </Suspense>
                )}
                <AboutSection />
                <Skills />

                <Projects />

                <Certificates />

                <section
                  id="contact"
                  className="relative flex flex-col justify-center border-t border-zinc-900 bg-[#0a0a0c] overflow-hidden px-6 pt-6 md:pt-8 pb-48 md:pb-80"
                >
                  <SectionHeader
                    number="05"
                    title="LET'S TALK"
                    rightLabel="COMMUNICATION NODE"
                  />
                  <ContactSection />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.03),transparent_70%)]" />
                </section>

                <SpaceBoiScene />
              </>
            )}

          </main>
        </div>
      )}
    </>
  );
}
