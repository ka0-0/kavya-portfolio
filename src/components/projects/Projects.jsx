import React, { useEffect, useRef, useState } from 'react';
import SectionHeader from '../navigation/SectionHeader';
import { isTouchOnlyDevice } from '../../utils/device';

// GSAP's ScrollTrigger was registered here and refreshed on mount, but this file (and the whole
// codebase) never creates a single ScrollTrigger instance — the sticky card stack is pure CSS
// `position: sticky`. Registering the plugin installs global scroll + resize listeners, a
// ResizeObserver, and a permanent gsap.ticker callback that keeps GSAP's rAF loop awake for the
// entire session. All of that was pure overhead on every scroll frame for zero triggers, so the
// registration and its ScrollTrigger.refresh() call are removed. `gsap` itself is still used
// elsewhere (MouseEffects click ripple) and is untouched.

export const projectsData = [
  {
    id: 1,
    number: "01",
    category: "E-COMMERCE SYSTEM",
    title: "Shagun Fashion",
    description: "A modern, high-performance fashion e-commerce storefront with a sleek UI, optimized loading states, and seamless checkout experience.",
    technologies: ["Next.js", "React", "Tailwind CSS", "Framer Motion"],
    image: "/projects/shagun.png",
    url: "https://shagun-fashion.vercel.app"
  },
  {
    id: 2,
    number: "02",
    category: "CREATIVE AI NODE",
    title: "SoundWave AI",
    description: "An intelligent audio generation platform leveraging advanced AI models to synthesize music, speech, and sound effects.",
    technologies: ["React", "Vite", "Node.js", "GSAP", "Tailwind CSS"],
    image: "/projects/soundwave.png",
    url: "https://soundwave-ai-ioik.vercel.app"
  },
  {
    id: 3,
    number: "03",
    category: "AUTOMATION ENGINE",
    title: "DOMIQ AI",
    description: "A next-generation smart home and automation intelligence platform offering real-time control, analytics, and autonomous scheduling.",
    technologies: ["React", "Vite", "Tailwind CSS", "Python", "Flask"],
    image: "/projects/domiq.png",
    url: "https://domiq-ai-seven.vercel.app"
  }
];

// Hoisted so the keyframe CSS string is allocated once instead of on every render
const PROJECTS_KEYFRAMES = `
        @keyframes floatMockup {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .animate-float-mockup {
          animation: floatMockup 7s ease-in-out infinite;
        }
        @keyframes glassSheen {
          0% {
            transform: translateX(-150%) rotate(25deg);
          }
          50% {
            transform: translateX(150%) rotate(25deg);
          }
          100% {
            transform: translateX(-150%) rotate(25deg);
          }
        }
        .animate-glass-sheen {
          animation: glassSheen 15s ease-in-out infinite;
        }
`;

function ProjectImage({ src, title }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-full bg-[#121214] select-none pointer-events-none">
      {(!src || hasError) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
          <span className="font-mono text-[9px] tracking-widest text-cyan-400 mb-2 font-bold">[ PREVIEW_OFFLINE ]</span>
          <h4 className="text-xs font-display text-zinc-500 font-bold uppercase tracking-wider">{title}</h4>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/85">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={src}
            alt={title}
            onError={() => setHasError(true)}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        </>
      )}
    </div>
  );
}

function VisitButton({ url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex items-center justify-between w-[190px] h-[48px] pl-5 pr-2 rounded-full bg-gradient-to-r from-blue-950/80 via-zinc-900/90 to-cyan-950/80 border border-[rgba(var(--accent-rgb),0.4)] hover:border-cyan-400/80 backdrop-blur-md shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:-translate-y-0.5 transition-all duration-300 select-none cursor-pointer overflow-hidden z-10 animate-pulse hover:animate-none"
      data-interactive="true"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/10 via-cyan-500/15 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white group-hover:text-cyan-300 transition-colors duration-300 z-10">
        VISIT WEBSITE
      </span>
      <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-[rgba(var(--accent-rgb),0.4)] group-hover:border-cyan-300 group-hover:bg-cyan-400 group-hover:shadow-[0_0_12px_rgba(var(--accent-rgb),0.8)] flex items-center justify-center transition-all duration-300 group-hover:scale-105 z-10">
        <svg className="w-3 h-3 text-cyan-300 group-hover:text-black transition-all duration-300 transform group-hover:rotate-[15deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </a>
  );
}

function BrowserMockup({ project }) {
  let domain = "";
  let metricVal = "";
  let metricSub = "";

  if (project.title === "Shagun Fashion") {
    domain = "shagun-fashion.vercel.app";
    metricVal = "99.9%";
    metricSub = "Checkout Success";
  } else if (project.title === "SoundWave AI") {
    domain = "soundwave-ai.vercel.app";
    metricVal = "AI Music";
    metricSub = "Recommendations";
  } else {
    domain = "domiq-ai.vercel.app";
    metricVal = "24/7";
    metricSub = "Smart Automation";
  }

  return (
    <div className="relative w-full max-w-[680px] p-2 md:p-8 lg:p-12 flex items-center justify-center overflow-hidden">
      {/* Background radial glow & faint blueprint grid behind the card */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Floating Browser Mockup Window */}
      <div className="relative w-full aspect-[16/10] bg-[var(--card-bg-alt)] border border-[var(--border-color)] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(var(--accent-rgb),0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(var(--accent-rgb),0.15)] transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] flex flex-col group overflow-hidden select-none animate-float-mockup cursor-default">
        {/* Soft animated diagonal reflection overlay */}
        <div className="absolute inset-y-0 -left-[100%] w-1/2 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none z-30 animate-glass-sheen" />

        {/* 1. macOS Browser Top Bar */}
        <div className="h-10 md:h-11 bg-[var(--bg-dark)] border-b border-[var(--border-color)] px-4 flex items-center justify-between flex-none relative z-20 select-none">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#ff5f56]/90" />
            <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#ffbd2e]/90" />
            <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#27c93f]/90" />
          </div>

          {/* Domain name */}
          <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[9px] md:text-[10px] tracking-wide text-zinc-500 select-none pointer-events-none">
            {domain}
          </span>

          {/* Empty spacer for right aligned content in flexbox */}
          <div className="w-10 flex-none" />
        </div>

        {/* 2. Browser Content Area (Screenshot image) */}
        <div className="flex-1 w-full relative overflow-hidden bg-zinc-950">
          <ProjectImage src={project.image} title={project.title} />

          {/* 3. Bottom Information Strip Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/75 to-transparent pt-12 pb-4 px-5 md:px-6 flex items-end justify-between z-20 pointer-events-none select-none">
            {/* Left side: Project name */}
            <span className="font-sans text-xs md:text-sm font-semibold tracking-wider text-zinc-350">
              {project.title}
            </span>

            {/* Right side: Unique metrics */}
            <div className="flex flex-col items-end text-right gap-0.5">
              <span className="font-display text-base md:text-lg lg:text-xl text-white font-black tracking-wide leading-none">
                {metricVal}
              </span>
              <span className="font-mono text-[8px] md:text-[9px] tracking-widest text-cyan-400 font-bold uppercase">
                {metricSub}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Shared cursor position and layout epoch for every ProjectCard.
 *
 * Previously each of the three cards installed its own `mousemove` listener and ran its own
 * unconditional rAF loop that called getBoundingClientRect() every frame. These module-level
 * subscriptions collapse that to a single mousemove + scroll + resize listener total, and the
 * epoch counter lets each card re-read its button rect only after the layout could have moved.
 */
const sharedPointer = { x: -9999, y: -9999 };
let layoutEpoch = 0;
let globalSubscribers = 0;

const onSharedPointerMove = (e) => {
  sharedPointer.x = e.clientX;
  sharedPointer.y = e.clientY;
};
const onSharedLayoutChange = () => {
  layoutEpoch++;
};

// MOBILE-ONLY: the heading glow is driven purely by cursor proximity to the Visit button. A
// touch-only device has no cursor, so `sharedPointer` never leaves its (-9999, -9999) init and
// the computed factor is permanently 0 — the effect is unobservable by construction. On phones
// we therefore skip the rAF loop, its per-frame getBoundingClientRect, and the shared pointer /
// scroll / resize subscriptions entirely. Desktop keeps the full effect unchanged.
const SKIP_POINTER_EFFECTS = isTouchOnlyDevice();

function subscribeCardGlobals() {
  globalSubscribers++;
  if (globalSubscribers === 1) {
    window.addEventListener('mousemove', onSharedPointerMove, { passive: true });
    window.addEventListener('scroll', onSharedLayoutChange, { passive: true });
    window.addEventListener('resize', onSharedLayoutChange, { passive: true });
  }
  return () => {
    globalSubscribers--;
    if (globalSubscribers === 0) {
      window.removeEventListener('mousemove', onSharedPointerMove);
      window.removeEventListener('scroll', onSharedLayoutChange);
      window.removeEventListener('resize', onSharedLayoutChange);
    }
  };
}

function ProjectCard({ project, idx, addToCardRefs }) {
  const headingWordsRef = useRef([]);
  const buttonRef = useRef(null);
  const cardElRef = useRef(null);
  const currentIllumination = useRef(0);

  useEffect(() => {
    if (SKIP_POINTER_EFFECTS) return;
    return subscribeCardGlobals();
  }, []);

  useEffect(() => {
    if (SKIP_POINTER_EFFECTS) return;

    let animId = null;
    let cachedRect = null;
    let cachedEpoch = -1;
    let lastWritten = -1;

    const update = () => {
      const button = buttonRef.current;
      const words = headingWordsRef.current;
      if (button && words.length > 0) {
        // Re-measure only when a scroll or resize could have moved the sticky card
        if (cachedRect === null || cachedEpoch !== layoutEpoch) {
          cachedRect = button.getBoundingClientRect();
          cachedEpoch = layoutEpoch;
        }
        const rect = cachedRect;
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;

        const dx = sharedPointer.x - buttonCenterX;
        const dy = sharedPointer.y - buttonCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxDistance = 350; // Proximity influence radius
        let targetFactor = 0;
        if (distance < maxDistance) {
          const norm = 1 - (distance / maxDistance);
          targetFactor = norm;
        }

        currentIllumination.current += (targetFactor - currentIllumination.current) * 0.15;
        const factor = currentIllumination.current;

        // Once the eased value has effectively converged, stop rewriting identical styles.
        // The final written value is the settled value, so the rendered result is unchanged.
        if (Math.abs(factor - lastWritten) > 0.001) {
          lastWritten = factor;

          words.forEach(el => {
            if (el) {
              el.style.setProperty('-webkit-text-fill-color', `rgba(var(--title-glow-rgb), ${factor * 0.18})`);

              if (factor > 0.01) {
                el.style.setProperty('text-shadow', `0 0 4px rgba(255, 255, 255, ${factor * 0.35}), 0 0 16px rgba(var(--title-glow-rgb), ${factor * 0.6})`);
              } else {
                el.style.setProperty('text-shadow', 'none');
              }
            }
          });
        }
      }
      animId = requestAnimationFrame(update);
    };

    const startLoop = () => {
      if (animId === null) {
        cachedRect = null; // force a fresh measurement on resume
        animId = requestAnimationFrame(update);
      }
    };

    const stopLoop = () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    // The proximity glow is only observable while the card is on screen
    let observer = null;
    if (typeof IntersectionObserver !== 'undefined' && cardElRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) startLoop();
          else stopLoop();
        },
        { rootMargin: '100px' }
      );
      observer.observe(cardElRef.current);
    } else {
      startLoop();
    }

    return () => {
      if (observer) observer.disconnect();
      stopLoop();
    };
  }, []);

  const words = project.title.split(' ');

  return (
    <div
      ref={(el) => {
        cardElRef.current = el;
        addToCardRefs(el);
      }}
      className="sticky top-[120px] w-[94vw] h-[80vh] bg-[var(--card-bg-alt)] border border-[rgba(var(--accent-rgb),0.2)] rounded-3xl shadow-[0_0_50px_rgba(var(--accent-rgb),0.15)] overflow-hidden flex flex-col justify-between mx-auto projects-card-item"
      style={{
        zIndex: idx + 10,
        marginBottom: '40vh',
        willChange: 'transform'
      }}
    >
      <div className="h-10 flex-none w-full" />
      <div className="flex-1 w-full relative overflow-hidden max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 flex items-center justify-center z-10">
        <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-4 sm:py-8 z-10">
          <div className="w-full lg:w-[35%] lg:max-w-[35%] flex-shrink-0 flex flex-col justify-center items-start text-left gap-2 sm:gap-4 md:gap-5 order-2 lg:order-1 projects-info-column">
            <div className="flex flex-col gap-1 md:gap-2">
              <span className="font-mono text-cyan-400 text-xs md:text-sm font-bold tracking-[0.25em]">
                {project.number} / 03
              </span>
              <span className="font-mono text-zinc-500 text-[10px] md:text-xs tracking-[0.2em] uppercase">
                {project.category}
              </span>
            </div>
            <h3
              className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] uppercase tracking-wide"
            >
              {words.map((word, wIdx) => (
                <span
                  key={wIdx}
                  className="word-hover-fill"
                  style={{ marginRight: wIdx < words.length - 1 ? '0.25em' : '0' }}
                  ref={el => {
                    headingWordsRef.current[wIdx] = el;
                  }}
                >
                  {word}
                </span>
              ))}
            </h3>
            <p className="font-sans text-xs md:text-sm text-zinc-400 leading-relaxed max-w-sm">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {project.technologies.map((t, tidx) => (
                <span key={tidx} className="font-mono text-[9px] md:text-[10px] text-cyan-400/80 bg-cyan-950/20 border border-[rgba(var(--accent-rgb),0.1)] px-2 py-0.5 rounded uppercase">
                  {t}
                </span>
              ))}
            </div>
            <div className="pt-2 md:pt-4">
              <a
                ref={buttonRef}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-between w-[190px] h-[48px] pl-5 pr-2 rounded-full bg-gradient-to-r from-blue-950/80 via-zinc-900/90 to-cyan-950/80 border border-[rgba(var(--accent-rgb),0.4)] backdrop-blur-md shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)] hover:-translate-y-0.5 transition-all duration-300 select-none cursor-pointer overflow-hidden z-10"
                data-interactive="true"
              >
                <div className="button-sheen absolute inset-0 rounded-full bg-gradient-to-r from-[rgba(var(--accent-rgb),0.08)] via-[rgba(var(--accent-rgb),0.15)] to-[rgba(var(--accent-rgb),0.08)] opacity-0 transition-opacity duration-500 pointer-events-none" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white group-hover:text-cyan-300 transition-colors duration-300 z-10">
                  VISIT WEBSITE
                </span>
                <div className="arrow-wrapper relative w-8 h-8 rounded-full bg-gradient-to-br from-[rgba(var(--accent-rgb),0.2)] to-[rgba(var(--accent-rgb),0.1)] border border-[rgba(var(--accent-rgb),0.4)] flex items-center justify-center transition-all duration-300 group-hover:scale-105 z-10">
                  <svg className="arrow-svg w-3 h-3 text-cyan-300 transition-all duration-300 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
          <div className="w-full lg:w-[65%] lg:max-w-[65%] flex-shrink-0 flex items-center justify-center order-1 lg:order-2 projects-media-column">
            <BrowserMockup project={project} />
          </div>
        </div>
      </div>
      <div className="h-8 flex-none w-full" />
    </div>
  );
}

export default function Projects() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const cardRefs = useRef([]);

  cardRefs.current = [];

  const addToCardRefs = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative bg-[var(--bg-dark)] w-full select-none pb-0"
    >
      <style>{PROJECTS_KEYFRAMES}</style>

      <div
        ref={headerRef}
        className="relative w-full z-5 bg-[var(--bg-dark)] pt-6 pb-2"
      >
        <SectionHeader
          number="03"
          title="RECENT PROJECTS"
          rightLabel="SYSTEM ARCHITECTURE"
        />
      </div>

      <div className="relative w-full block px-4 md:px-8">
        {projectsData.map((project, idx) => (
          <ProjectCard
            key={project.id}
            project={project}
            idx={idx}
            addToCardRefs={addToCardRefs}
          />
        ))}

        <div className="h-[20vh] w-full" />

        <div className="absolute bottom-8 inset-x-0 flex flex-col items-center justify-center text-center px-6 select-none pointer-events-none">
          <div className="flex flex-col items-center gap-4 pointer-events-auto">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/20 border border-[rgba(var(--accent-rgb),0.3)] backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(var(--accent-rgb),0.8)]" />
              <span className="font-mono text-[9px] tracking-[0.25em] text-cyan-400 font-bold uppercase">SYSTEM STATUS</span>
            </div>

            <h4 className="font-display text-2xl sm:text-3xl md:text-[40px] text-white font-black tracking-[0.15em] leading-tight select-none mt-2">
              NEXT PROJECT
              <br />
              <span className="text-zinc-400">IN PROGRESS</span>
            </h4>

            <p className="font-sans text-xs sm:text-sm text-zinc-500 max-w-sm leading-relaxed tracking-wide mt-2">
              Currently engineering the next AI-powered experience.
              <br />
              More innovations are coming soon.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
