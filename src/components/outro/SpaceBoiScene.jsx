import React, { useRef, useState, useEffect, memo } from 'react';
import { downloadResume } from '../../utils/resume';
import LoadingRobot from '../loading/LoadingRobot';

function SpaceBoiScene() {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [downloadState, setDownloadState] = useState('idle');
  const [animate, setAnimate] = useState(false);

  const handleDownload = (e) => {
    e.preventDefault();
    if (downloadState !== 'idle') return;
    setDownloadState('downloading');

    setTimeout(() => {
      downloadResume();
      setDownloadState('completed');
      setTimeout(() => setDownloadState('idle'), 1500);
    }, 600);
  };

  const handleBackToTop = (e) => {
    e.preventDefault();
    if (window.lenis) {
      window.lenis.scrollTo('#home', {
        duration: 1.5,
      });
    } else {
      const heroSection = document.getElementById('home');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Viewport Intersection Observer to freeze Canvas rendering when out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '200px' }
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
      className="relative w-full bg-[var(--bg-dark)] flex flex-col items-center justify-center pt-20 md:pt-28 pb-0 overflow-hidden z-10 select-none transition-colors duration-300"
    >
      {/* Background Ambient Blue Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--accent-rgb),0.20)_0%,rgba(var(--accent-rgb),0.05)_50%,transparent_75%)] pointer-events-none z-0" />

      <div ref={containerRef} className="w-full h-[650px] sm:h-[750px] md:h-[850px] lg:h-[100vh] relative z-10">
        {isInView && <LoadingRobot />}

        {/* Style block for cinematic transitions and animation timing sequence */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes finalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes finalFadeUp {
            from {
              opacity: 0;
              transform: translateY(15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .final-animate-fade-in {
            opacity: 0;
            will-change: opacity;
          }
          .final-animate-fade-up {
            opacity: 0;
            transform: translateY(15px);
            will-change: opacity, transform;
          }
          .animate-sequence .final-animate-fade-in {
            animation: finalFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-sequence .final-animate-fade-up {
            animation: finalFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .delay-step-1 { animation-delay: 0.1s; }
          .delay-step-2 { animation-delay: 0.4s; }
          .delay-step-3 { animation-delay: 0.7s; }
          .delay-step-4 { animation-delay: 1.0s; }
          .delay-step-5 { animation-delay: 1.3s; }
          .delay-step-6 { animation-delay: 1.6s; }
          .delay-step-7 { animation-delay: 1.9s; }
          .delay-step-8 { animation-delay: 2.2s; }
          .delay-step-9 { animation-delay: 2.5s; }
        `}} />

        {/* HTML Content Overlay */}
        <div className={`absolute inset-0 flex flex-col justify-center items-center z-20 pointer-events-none px-6 pt-8 pb-8 md:py-12 ${animate ? 'animate-sequence' : ''}`}>
          
          <div className="flex flex-col items-center text-center pointer-events-auto w-full max-w-2xl justify-center gap-4 sm:gap-6 lg:gap-8 -translate-y-8 md:-translate-y-16">
            {/* Status Indicators */}
            <div className="flex flex-col items-center gap-2">
              <span className="final-animate-fade-in delay-step-1 text-[10px] md:text-xs font-mono tracking-[0.3em] text-cyan-400 font-bold uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                SYSTEM STATUS
              </span>
              
              <div className="text-[10px] md:text-xs font-mono text-zinc-400 space-y-1 text-center font-medium leading-relaxed">
                <div className="final-animate-fade-in delay-step-2">
                  Portfolio ........ COMPLETE ✓
                </div>
                <div className="final-animate-fade-in delay-step-3">
                  Connection ...... ESTABLISHED ✓
                </div>
              </div>
            </div>

            {/* Heading */}
            <h2 className="final-animate-fade-up delay-step-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white uppercase leading-[1.3] w-full">
              THANK YOU<br />
              FOR EXPLORING<br />
              MY UNIVERSE
            </h2>

            {/* Subtitle */}
            <p className="final-animate-fade-in delay-step-5 text-[10px] sm:text-xs font-mono tracking-[0.2em] text-cyan-400/90 font-bold uppercase drop-shadow-[0_0_6px_rgba(34,211,238,0.2)]">
              Mechanical Engineer × AI Developer
            </p>

            {/* Body Text */}
            <p className="final-animate-fade-in delay-step-6 text-zinc-200 text-xs sm:text-sm max-w-md mx-auto leading-relaxed tracking-wide font-sans">
              Building intelligent products,<br className="hidden sm:inline" /> one idea at a time.<br />
              Let's build something together.
            </p>

            {/* Primary Button */}
            <div className="final-animate-fade-up delay-step-7">
              <a
                href="#"
                onClick={handleDownload}
                className="inline-flex items-center justify-center px-8 py-3 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white border border-[rgba(var(--accent-rgb),0.3)] hover:border-cyan-400 hover:text-cyan-300 bg-[var(--bg-dark)]/60 hover:bg-cyan-500/5 transition-all duration-300 shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] hover:shadow-[0_0_25px_rgba(var(--accent-rgb),0.4)] cursor-pointer select-none"
                data-interactive="true"
              >
                {downloadState === 'idle' && 'Download Resume'}
                {downloadState === 'downloading' && 'Downloading...'}
                {downloadState === 'completed' && 'Download Completed'}
              </a>
            </div>

            {/* Secondary Links */}
            <div className="final-animate-fade-in delay-step-8 flex items-center justify-center gap-4 text-[10px] sm:text-xs font-mono tracking-widest text-zinc-500">
              <a
                href="https://github.com/ka0-0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-cyan-400 transition-colors duration-300"
                data-interactive="true"
              >
                GitHub
              </a>
              <span className="text-zinc-700 select-none">•</span>
              <a
                href="https://www.linkedin.com/in/kavya-makhan-800451370/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-cyan-400 transition-colors duration-300"
                data-interactive="true"
              >
                LinkedIn
              </a>
              <span className="text-zinc-700 select-none">•</span>
              <a
                href="mailto:kav.1609.ya@gmail.com"
                className="text-zinc-400 hover:text-cyan-400 transition-colors duration-300"
                data-interactive="true"
              >
                Email
              </a>
            </div>

            {/* Divider line */}
            <div className="text-zinc-800 select-none text-[8px] sm:text-[10px] tracking-tight opacity-50">
              ────────────────────────
            </div>

            {/* Bottom: Footer Info */}
            <div className="final-animate-fade-in delay-step-9 flex flex-col items-center gap-3 text-[10px] font-mono tracking-[0.2em] text-zinc-500 w-full">
              <span>© 2026 Kavya Makhan</span>

              <button
                onClick={handleBackToTop}
                className="group flex flex-col items-center gap-1 text-zinc-400 hover:text-cyan-400 transition-colors duration-300 focus:outline-none"
                data-interactive="true"
              >
                <span className="text-sm font-bold transition-transform duration-300 group-hover:-translate-y-1">↑</span>
                <span className="text-[9px] uppercase tracking-[0.15em] font-semibold mt-0.5">Back to Top</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(SpaceBoiScene);
