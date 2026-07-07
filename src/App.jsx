import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import Skills from './components/skills/Skills';
import SectionHeader from './components/SectionHeader';
import SpaceBoiScene from './components/SpaceBoiScene';
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
  trackOutboundLink
} from './utils/analytics';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPortfolioVisible, setIsPortfolioVisible] = useState(false);
  const [isTransitionComplete, setIsTransitionComplete] = useState(false);

  // 1. Track loading started on initial mount
  useEffect(() => {
    trackLoadingStarted();
  }, []);

  // 2. Track page views, sections, scroll depth, and session duration after loading transitions complete
  useEffect(() => {
    if (!isTransitionComplete) return;

    // Track loading complete
    trackLoadingCompleted();

    // Trigger initial page view
    trackPageView();

    // A. Automatic section discovery and tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            let name = id.charAt(0).toUpperCase() + id.slice(1);
            if (id === 'home') name = 'Hero';
            if (id === 'resume') name = 'Resume';
            trackSectionView(name);
          }
        });
      },
      { threshold: 0.2 }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((sec) => observer.observe(sec));

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

    // C. Outbound link click tracker
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

    // D. Session duration milestones
    const timers = [
      setTimeout(() => trackSessionDuration(30), 30000),
      setTimeout(() => trackSessionDuration(60), 60000),
      setTimeout(() => trackSessionDuration(120), 120000),
    ];

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleOutboundClick);
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isTransitionComplete]);

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
        <div className="relative min-h-screen bg-[#090909] text-white selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden">
          <CustomCursor />
          <Navbar />
          <main>
            <section id="home">
              <Hero showRobot={true} />
            </section>

            {/* Portfolio Content Sections (Deferred until transition completes to ensure a smooth reveal) */}
            {isTransitionComplete && (
              <>
                <AboutSection />
                <Skills />

                <section
                  id="projects"
                  className="relative flex flex-col justify-center border-t border-zinc-900 bg-[#09090a] overflow-hidden px-6 pt-6 md:pt-8 pb-48 md:pb-80"
                >
                  <SectionHeader
                    number="03"
                    title="RECENT PROJECTS"
                    rightLabel="SYSTEM ARCHITECTURE"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.03),transparent_70%)]" />
                </section>

                <section
                  id="certificates"
                  className="relative flex flex-col justify-center border-t border-zinc-900 bg-[#09090a] overflow-hidden px-6 pt-6 md:pt-8 pb-48 md:pb-80"
                >
                  <SectionHeader
                    number="04"
                    title="RECENT CERTIFICATES"
                    rightLabel="CREDENTIAL LOGS"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.03),transparent_70%)]" />
                </section>

                <section
                  id="contact"
                  className="relative flex flex-col justify-center border-t border-zinc-900 bg-[#0a0a0c] overflow-hidden px-6 pt-6 md:pt-8 pb-48 md:pb-80"
                >
                  <SectionHeader
                    number="05"
                    title="LET'S TALK"
                    rightLabel="COMMUNICATION NODE"
                  />
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
