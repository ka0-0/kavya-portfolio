import React, { useRef, useState, useEffect, memo } from 'react';
import LoadingPlanet from '../loading/LoadingPlanet';
import CursorImageTrail from './CursorImageTrail';

function SpaceBoiScene() {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Viewport Intersection Observer for triggering sequence animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '100px' }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView) {
      setAnimate(true);
    }
  }, [isInView]);

  return (
    <section
      id="resume"
      ref={containerRef}
      className="relative w-full h-screen min-h-[650px] bg-[var(--bg-dark)] flex flex-col items-center justify-between py-10 sm:py-16 md:py-20 overflow-hidden select-none z-10 transition-colors duration-300"
    >
      {/* Ambient Blue Light Glow (Larger & positioned slightly lower behind heading) */}
      <div className="absolute top-0 left-0 w-full h-[48vh] bg-[radial-gradient(ellipse_at_50%_15%,rgba(var(--accent-rgb),0.20)_0%,rgba(34,211,238,0.08)_45%,transparent_80%)] pointer-events-none z-0" />

      {/* Animation keyframes for sequence transitions */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes cinematicHeadingFadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes cinematicCopyrightFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes cinematicWatermarkFadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cinematic-heading-initial {
          opacity: 0;
          transform: translateY(25px);
          will-change: opacity, transform;
        }
        .cinematic-copyright-initial {
          opacity: 0;
          transform: translateY(20px);
          will-change: opacity, transform;
        }
        .cinematic-watermark-initial {
          opacity: 0;
          transform: translateY(25px);
          will-change: opacity, transform;
        }

        .animate-cinematic .cinematic-heading-animate {
          animation: cinematicHeadingFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0s forwards;
        }
        .animate-cinematic .cinematic-copyright-animate {
          animation: cinematicCopyrightFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }
        .animate-cinematic .cinematic-watermark-animate {
          animation: cinematicWatermarkFadeUp 1.0s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }
      `}} />

      {/* LAYER 1 (z-10): 3D Model Canvas (SpaceBoi) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <LoadingPlanet scale={1.15} yOffset={0.05} />
      </div>

      {/* LAYER 2 (z-20): Solid Text Watermark KAVYA (In front of 3D ground plane) with Cursor Image Trail */}
      <div
        className={`absolute bottom-[6vh] sm:bottom-[10vh] left-0 w-full flex justify-center items-center pointer-events-none z-20 ${animate ? 'animate-cinematic' : ''}`}
      >
        <CursorImageTrail animate={animate} />
      </div>

      {/* LAYER 3 (z-30): Main Content Overlay (Heading + Copyright) */}
      <div
        className={`relative z-30 flex flex-col items-center text-center pointer-events-none px-4 pt-2 sm:pt-4 md:pt-6 w-full max-w-4xl mx-auto mt-2 sm:mt-4 md:mt-6 lg:mt-8 mb-auto -translate-y-12 sm:-translate-y-18 md:-translate-y-24 lg:-translate-y-28 ${animate ? 'animate-cinematic' : ''}`}
      >
        {/* Main Heading */}
        <h2 className="cinematic-heading-initial cinematic-heading-animate font-display font-black text-white uppercase text-center tracking-tight leading-[1.0] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl drop-shadow-2xl">
          THANK YOU<br />
          FOR VISITING<br />
          MY UNIVERSE
        </h2>

        {/* Single Centered Copyright Line */}
        <p className="cinematic-copyright-initial cinematic-copyright-animate text-xs sm:text-sm md:text-base font-mono font-bold tracking-[0.35em] text-white uppercase text-center mt-4 sm:mt-5 drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
          © 2026 — ALL RIGHTS RESERVED
        </p>
      </div>
    </section>
  );
}

export default memo(SpaceBoiScene);
