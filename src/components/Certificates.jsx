import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring, useTransform, useMotionValueEvent, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, FileText, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import SectionHeader from './SectionHeader';

function getPdfFilename(title) {
  if (!title) return "DOCUMENT.PDF";
  let name = title
    .replace(/Job Simulation|Workshop|Getting Started with/gi, "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${name}.PDF`;
}

const certificatesData = [
  {
    id: 1,
    cylinderTitle: "Google AI Essentials",
    title: "Google AI Essentials",
    organization: "Google",
    date: "July 2025",
    image: "/certificates/Google Al Essentials.jpg",
    description: "Mastered foundational AI concepts including generative AI tools, prompt engineering techniques, and frameworks for utilizing AI responsibly and ethically in professional workflows.",
    verifyUrl: "https://coursera.org"
  },
  {
    id: 2,
    cylinderTitle: "Google Prompting Essentials",
    title: "Google Prompting Essentials",
    organization: "Google",
    date: "June 2026",
    image: "/certificates/Google Prompting Essentials.jpg",
    description: "Acquired advanced prompt engineering capabilities, designing prompts to automate data analysis, generate high-quality summaries, and assist in creative processes.",
    verifyUrl: "https://coursera.org/verify/specialization/UT5MKNOE93O6"
  },
  {
    id: 3,
    cylinderTitle: "Deloitte Data Analytics",
    title: "Deloitte Data Analytics Job Simulation",
    organization: "Deloitte",
    date: "July 2025",
    image: "/certificates/Data Analytics Job Simulation.jpg",
    description: "Successfully completed the Data Analytics Job Simulation, focusing on data structure verification, database query optimizations, and visual communication of forensic insights.",
    verifyUrl: "https://www.theforage.com"
  },
  {
    id: 4,
    cylinderTitle: "HP AI For Beginners",
    title: "AI for Beginners",
    organization: "HP LIFE",
    date: "July 2025",
    image: "/certificates/Al for Beginners.jpg",
    description: "Gained a solid understanding of artificial intelligence and machine learning applications, exploring how businesses leverage technology and analyzing its societal impacts.",
    verifyUrl: "https://www.life-global.org"
  },
  {
    id: 5,
    cylinderTitle: "Microsoft Excel",
    title: "Getting Started with Microsoft Excel",
    organization: "Coursera",
    date: "July 2025",
    image: "/certificates/Getting Started with Microsoft Excel.jpg",
    description: "Gained proficiency in advanced Microsoft Excel techniques, covering formulas, pivot tables, lookup functions, data filtering, and high-impact spreadsheet visualizations.",
    verifyUrl: "https://coursera.org/verify/5GKBQ1SUWS8J"
  },
  {
    id: 6,
    cylinderTitle: "Design & 3D Printing",
    title: "Design & 3D Printing Workshop",
    organization: "Delhi Technological University",
    date: "August 2025",
    image: "/certificates/Design & 3D Printing.jpg",
    description: "Participated in a hands-on technical workshop focused on CAD design methodologies, slicing engine optimizations, and operating desktop FDM 3D printers.",
    verifyUrl: null
  }
];

function TiltCard({ image, title, onOpenViewer }) {
  const cardRef = useRef(null);

  const handlePointerEnter = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('view-cursor-enter'));
    }
  };

  const handlePointerLeave = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('view-cursor-leave'));
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setHasError(false);

    if (!image) {
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.src = image;

    if (img.complete && img.naturalWidth !== 0) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
      img.onload = () => {
        if (isMounted) setIsLoading(false);
      };
      img.onerror = () => {
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      };
    }

    return () => {
      isMounted = false;
    };
  }, [image]);

  const isDeloitte = title?.toLowerCase().includes("deloitte") || image?.includes("Data Analytics Job Simulation");
  const isGoogle = title?.toLowerCase().includes("google") || image?.toLowerCase().includes("google");

  return (
    <div
      ref={cardRef}
      data-cursor="view"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={() => image && !hasError && onOpenViewer && onOpenViewer(image, title)}
      className="w-full max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-md xl:max-w-lg aspect-[1.41] cursor-none relative flex items-center justify-center select-none"
    >
      <motion.div
        animate={{
          y: [0, -4, 0, 4, 0],
          rotateX: [0, 0.7, 0, -0.7, 0],
          rotateY: [0, -0.7, 0, 0.7, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          transformStyle: 'preserve-3d',
          pointerEvents: 'none',
        }}
        className="w-full h-full bg-zinc-950/60 border border-white/10 backdrop-blur-xl rounded-[24px] shadow-[0_0_30px_rgba(59,130,246,0.12)] hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] hover:border-cyan-400/50 p-1.5 relative group transition-all duration-500 overflow-hidden flex items-center justify-center"
      >
      <div className="absolute inset-y-0 -left-[100%] w-1/2 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none z-30 group-hover:animate-glass-sheen" style={{ pointerEvents: 'none' }} />

      {/* Darkening Overlay for Contrast */}
      <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" style={{ pointerEvents: 'none' }} />

      {(!image || hasError) ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/40 rounded-[20px] pointer-events-none" style={{ pointerEvents: 'none' }}>
          <span className="font-mono text-[9px] tracking-widest text-cyan-400 mb-2 font-bold pointer-events-none" style={{ pointerEvents: 'none' }}>[ PREVIEW_OFFLINE ]</span>
          <h4 className="text-xs font-display text-zinc-500 font-bold uppercase tracking-wider text-center pointer-events-none" style={{ pointerEvents: 'none' }}>{title}</h4>
        </div>
      ) : (
        <div className="relative w-full h-full rounded-[20px] overflow-hidden flex items-center justify-center pointer-events-none" style={{ pointerEvents: 'none' }}>
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/85 z-20 pointer-events-none" style={{ pointerEvents: 'none' }}>
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin pointer-events-none" style={{ pointerEvents: 'none' }} />
            </div>
          )}
          <img
            key={image}
            src={image}
            alt={title}
            loading="lazy"
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            onLoad={() => setIsLoading(false)}
            style={{ pointerEvents: 'none' }}
            className={`w-full h-full select-none object-center transition-transform duration-300 pointer-events-none ${
              isDeloitte
                ? 'object-contain scale-[1.10] rounded-[16px] group-hover:scale-[1.13]'
                : isGoogle
                ? 'object-contain scale-[1.20] translate-x-[14px] translate-y-[34px] rounded-[16px] group-hover:scale-[1.23]'
                : 'object-cover rounded-[18px] scale-[1.01] group-hover:scale-[1.04]'
            }`}
          />
        </div>
      )}
    </motion.div>
    </div>
  );
}

function CertificateViewerImage({ src, alt }) {
  return (
    <div 
      className="rounded-[16px] overflow-hidden"
      style={{ borderRadius: 'inherit', overflow: 'hidden' }}
    >
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[70dvh] sm:max-h-[75vh] w-auto h-auto select-none shadow-2xl"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 'inherit',
          overflow: 'hidden',
          display: 'block',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

{/* Certificate Viewer Modal matching Resume Viewer Architecture 1:1 */}
function CertificateViewerModal({ selectedCert, onClose }) {
  const [zoomScale, setZoomScale] = useState(1.0);
  const modalContainerRef = useRef(null);

  // Reset zoom on certificate change
  useEffect(() => {
    setZoomScale(1.0);
  }, [selectedCert]);

  // Lock body scroll, Lenis pause, touchmove prevent, outside click and Escape key handler
  useEffect(() => {
    if (!selectedCert) return;

    const handleOutsideClick = (e) => {
      if (modalContainerRef.current && !modalContainerRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    const preventTouchMove = (e) => {
      if (e.target.closest('.modal-scroll-container')) return;
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    if (window.lenis) {
      window.lenis.stop();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.removeEventListener('touchmove', preventTouchMove);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      if (window.lenis) {
        window.lenis.start();
      }
    };
  }, [selectedCert, onClose]);

  if (!selectedCert) return null;

  const filename = getPdfFilename(selectedCert.title);

  return createPortal(
    <AnimatePresence>
      {selectedCert && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Certificate Viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 backdrop-blur-md bg-zinc-950/60 pointer-events-auto modal-backdrop select-none"
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* Modal Bounding Window matching Resume Viewer */}
          <motion.div
            ref={modalContainerRef}
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-zinc-900/90 border border-[var(--border-color)] w-full max-w-5xl h-[88dvh] sm:h-[88vh] rounded-[24px] flex flex-col shadow-[0_30px_70px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Toolbar Header matching Resume Viewer design */}
            <div className="h-16 border-b border-zinc-800/75 px-4 sm:px-6 flex items-center justify-between bg-zinc-950/60 backdrop-blur-[10px] modal-toolbar">
              {/* Left Side: Document Name */}
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 truncate max-w-[100px] xs:max-w-[180px] sm:max-w-xs">
                  {filename}
                </span>
              </div>

              {/* Right Side: Toolbar Operations */}
              <div className="flex items-center gap-1 sm:gap-2 font-sans shrink-0">
                {/* Zoom Controls: hidden on mobile */}
                <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                  {/* Zoom Out */}
                  <button
                    onClick={() => setZoomScale(prev => Math.max(prev - 0.15, 0.6))}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  {/* Current Zoom */}
                  <span className="text-[10px] font-mono text-zinc-500 w-10 text-center uppercase tracking-wide select-none">
                    {Math.round(zoomScale * 100)}%
                  </span>

                  {/* Zoom In */}
                  <button
                    onClick={() => setZoomScale(prev => Math.min(prev + 0.15, 1.8))}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  {/* Reset Zoom */}
                  <button
                    onClick={() => setZoomScale(1.0)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors mr-2 cursor-pointer"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="w-[1px] h-4 bg-zinc-800/80 mx-1" />
                </div>

                {/* Download Button */}
                <a
                  href={selectedCert.image}
                  download
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer flex items-center justify-center"
                  title="Download Certificate"
                >
                  <Download className="w-4 h-4" />
                </a>

                <div className="w-[1px] h-4 bg-zinc-800/80 mx-1" />

                {/* Exit Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 border border-transparent transition-all ml-1 cursor-pointer"
                  title="Close Viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Viewing Area */}
            <div 
              className="flex-1 overflow-auto bg-zinc-950/70 p-4 sm:p-6 md:p-10 flex items-start justify-center modal-scroll-container"
              style={{ overscrollBehavior: 'contain' }}
            >
              <div 
                className="transition-transform duration-200 ease-out origin-top shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-[16px] overflow-hidden"
                style={{ 
                  transform: `scale(${zoomScale})`,
                  borderRadius: 'inherit',
                  overflow: 'hidden'
                }}
              >
                <CertificateViewerImage
                  src={selectedCert.image}
                  alt={selectedCert.title}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function CylinderItem({ cert, i, activeIdx, radius, angleStep, activeIndex, handleClickItem }) {
  const diff = useTransform(activeIdx, (val) => i - val);
  const absDiff = useTransform(diff, (val) => Math.abs(val));

  // Radian angle based on index step
  const angleRad = useTransform(diff, (d) => d * angleStep); 
  
  // Calculate X, Y coordinates around the pivot point on the left (compact radius)
  const x = useTransform(angleRad, (a) => radius * Math.cos(a) - radius);
  const y = useTransform(angleRad, (a) => radius * Math.sin(a));
  
  // Calculate rotation (tangent to curve)
  const rotateVal = useTransform(angleRad, (a) => a * (180 / Math.PI));
  
  // Calculate depth Z (inactive items recede)
  const z = useTransform(absDiff, (d) => -d * 40);

  // Aggressive falloff: only keep 3-4 items visible near the active index
  const opacity = useTransform(absDiff, [0, 0.8, 1.6, 2.3], [1, 0.7, 0.2, 0]);
  const scale = useTransform(absDiff, [0, 1.5], [1.08, 0.85]);

  // Dot opacity fades as the item moves away
  const dotOpacity = useTransform(absDiff, [0, 0.35], [1, 0]);

  const isActive = activeIndex === i;

  const transformTemplate = useMotionTemplate`translate3d(${x}px, ${y}px, ${z}px) rotate(${rotateVal}deg) rotateY(-15deg)`;

  return (
    <motion.div
      style={{
        position: 'absolute',
        transform: transformTemplate,
        opacity,
        scale,
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
      }}
      className={`flex items-center gap-3 cursor-pointer py-2 pl-4 pr-3 whitespace-nowrap transition-colors duration-300 ${
        isActive
          ? 'text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
          : 'text-zinc-500 hover:text-zinc-300 font-medium'
      }`}
      onClick={() => handleClickItem(i)}
    >
      {/* Cyan Highlight Indicator Dot */}
      <motion.div
        style={{
          opacity: dotOpacity,
        }}
        className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(var(--accent-rgb),0.8)] shrink-0"
      />
      <span className="font-display text-xs sm:text-sm md:text-base tracking-wider uppercase">
        {cert.cylinderTitle}
      </span>
    </motion.div>
  );
}

export default function Certificates() {
  const sectionRef = useRef(null);
  const pinContainerRef = useRef(null);
  const timelineRef = useRef(null);
  const scrollTriggerInstanceRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedViewerCert, setSelectedViewerCert] = useState(null);

  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const listener = (e) => setIsMobileViewport(e.matches);
    setIsMobileViewport(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const handleOpenViewer = (image, title) => {
    setSelectedViewerCert({ image, title });
  };

  const handleCloseViewer = () => {
    setSelectedViewerCert(null);
  };

  useEffect(() => {
    if (selectedViewerCert) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('view-cursor-leave'));
      }
    }
  }, [selectedViewerCert]);

  // Compact radius (35-45% smaller) to keep cylinder subtle and on the left edge
  const [radius, setRadius] = useState(250);
  const [angleStep, setAngleStep] = useState(0.26);

  // Handle responsive compact wheel geometry parameters
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setRadius(120); // reduced by 25% on mobile to tighten the cylinder
        setAngleStep(0.42); // compensated angle step to preserve physical label spacing
      } else if (window.innerWidth < 1024) {
        setRadius(200); // compact radius for tablet
        setAngleStep(0.28);
      } else {
        setRadius(250); // 44% smaller standard radius for desktop (was 450)
        setAngleStep(0.26);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Motion value for independent timeline entry progress
  const timelineDotProgress = useMotionValue(0);

  // Motion value for dedicated pinned carousel progress
  const rotationProgress = useMotionValue(0);

  // 1. Independent Timeline Progress: Starts at 2023 (0%) when timeline appears in viewport,
  // finishes smoothly at 2026 (100%) BEFORE certificate preview card becomes fully visible at pin start.
  const timelineDotLeft = useTransform(timelineDotProgress, [0, 1], ["0%", "100%"]);

  // Spring smoothing applied EXCLUSIVELY to pinned carousel progress for silky inertia wheel rotation
  const smoothCarouselProgress = useSpring(rotationProgress, {
    stiffness: 60,
    damping: 26,
    mass: 0.8
  });

  // 2. Pinned Carousel Rotation: Carousel rotates ONLY after section pins (when dot is already resting on 2026)
  const activeIdx = useTransform(smoothCarouselProgress, [0, 0.85], [0, certificatesData.length - 1]);

  // Update active index state for details & previews changes during carousel pinning
  useMotionValueEvent(rotationProgress, "change", (latest) => {
    const totalItems = certificatesData.length;
    let currentIdx = 0;
    if (latest > 0 && latest < 0.85) {
      const normalizedProgress = latest / 0.85;
      currentIdx = Math.round(normalizedProgress * (totalItems - 1));
    } else if (latest >= 0.85) {
      currentIdx = totalItems - 1;
    }
    const clampedIdx = Math.max(0, Math.min(totalItems - 1, currentIdx));
    if (clampedIdx !== activeIndex) {
      setActiveIndex(clampedIdx);
    }
  });

  // Synchronized Dual ScrollTrigger setup
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Trigger A (Timeline Dot): Begins moving as timeline enters viewport (top 85%),
      // completes travel to 2026 BEFORE the certificate preview cards become the main focus (at top 70%)
      ScrollTrigger.create({
        trigger: timelineRef.current,
        start: "top 85%",
        endTrigger: pinContainerRef.current,
        end: "top 70%",
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = gsap.utils.clamp(0, 1, self.progress);
          timelineDotProgress.set(progress);
        }
      });

      // Trigger B (Carousel Showcase): Begins rotating ONLY after section pins, while dot remains fixed at 2026
      scrollTriggerInstanceRef.current = ScrollTrigger.create({
        trigger: pinContainerRef.current,
        start: "top top",
        end: "+=220%",
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          rotationProgress.set(self.progress);
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [timelineDotProgress, rotationProgress]);

  // Click title: smooth scroll & cylinder rotation
  const handleClickItem = (i) => {
    const trigger = scrollTriggerInstanceRef.current;
    if (!trigger) return;
    const progress = (i / (certificatesData.length - 1)) * 0.85;
    const targetScroll = trigger.start + progress * (trigger.end - trigger.start);
    
    if (window.lenis) {
      window.lenis.scrollTo(targetScroll, { duration: 0.8 });
    } else {
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const activeCert = certificatesData[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="certificates"
      className="relative w-full bg-[var(--bg-dark)] border-t border-[var(--border-color)] overflow-hidden z-20 select-none"
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
      `}</style>

      {/* 1. Header Area: Scrolls in naturally and leaves top of screen before pin activates */}
      <div className="w-full flex-none z-10 pt-12 md:pt-16 pb-4 md:pb-6">
        <SectionHeader
          number="04"
          title="RECENT CERTIFICATES"
          rightLabel="CREDENTIAL LOGS"
        />

        {/* Minimalist Premium Timeline with Side Anchors (FOUNDATION and EVOLUTION) */}
        <motion.div
          ref={timelineRef}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl md:max-w-3xl mx-auto mt-6 md:mt-8 flex flex-col items-center pointer-events-none select-none overflow-visible relative z-20"
        >
          {/* Top Row: FOUNDATION   2023 ------- ● ------- 2026   EVOLUTION */}
          <div className="w-full flex items-center justify-center gap-2 sm:gap-6 md:gap-10 lg:gap-14 overflow-visible">
            {/* Left Anchor Label: FOUNDATION */}
            <span className="font-mono text-[9px] min-[380px]:text-[11px] sm:text-[12px] md:text-[13px] font-semibold uppercase tracking-[0.4em] text-white/70 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] shrink-0 select-none">
              FOUNDATION
            </span>

            {/* Inner Timeline: 2023 ------- ● ------- 2026 */}
            <div className="w-full max-w-[120px] xs:max-w-[180px] sm:max-w-sm md:max-w-md flex items-center justify-between gap-4 overflow-visible">
              <span className="font-mono text-[11px] sm:text-[13px] md:text-sm font-medium text-white/70 tracking-wider shrink-0 leading-none py-1">
                2023
              </span>

              <div className="flex-1 flex items-center justify-center relative">
                <div className="w-full h-[1px] bg-gradient-to-r from-cyan-500/20 via-cyan-400/60 to-cyan-500/20 shadow-[0_0_8px_rgba(var(--accent-rgb),0.4)]" />
                <motion.div
                  style={{ left: timelineDotLeft }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] border border-cyan-300/90 pointer-events-none z-10"
                />
              </div>

              <span className="font-mono text-[11px] sm:text-[13px] md:text-sm font-medium text-white/70 tracking-wider shrink-0 leading-none py-1">
                2026
              </span>
            </div>

            {/* Right Anchor Label: EVOLUTION */}
            <span className="font-mono text-[9px] min-[380px]:text-[11px] sm:text-[12px] md:text-[13px] font-semibold uppercase tracking-[0.4em] text-white/70 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] shrink-0 select-none">
              EVOLUTION
            </span>
          </div>

          {/* Bottom Row: Learning | Building | Growing */}
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex items-center justify-between mt-2 px-1 text-[11px] md:text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest leading-none py-1">
            <span>Learning</span>
            <span>Building</span>
            <span>Growing</span>
          </div>
        </motion.div>
      </div>

      {/* 2. Pinned Interactive Display: Centers hero certificate vertically in viewport & pins */}
      <div
        ref={pinContainerRef}
        className="w-full h-screen relative flex items-center justify-center overflow-hidden bg-[var(--bg-dark)]"
      >
        {/* Blueprint grid and radial glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.03),transparent_70%)] pointer-events-none" />

        {/* Grid Layout Container */}
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 z-10">
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-center">
            
            {/* Left Column (Subtle compact rotating wheel navigation) */}
            <div 
              className="col-span-1 md:col-span-5 h-[170px] sm:h-[190px] md:h-[360px] relative flex items-center justify-center md:justify-start select-none"
              style={{ 
                perspective: "1200px", 
                transformStyle: "preserve-3d" 
              }}
            >
              <div
                style={{
                  transformStyle: 'preserve-3d',
                }}
                className="relative w-full h-[60px] flex items-center justify-center md:justify-start pl-0 md:pl-6"
              >
                {certificatesData.map((cert, i) => (
                  <CylinderItem
                    key={cert.id}
                    cert={cert}
                    i={i}
                    activeIdx={activeIdx}
                    radius={radius}
                    angleStep={angleStep}
                    activeIndex={activeIndex}
                    handleClickItem={handleClickItem}
                  />
                ))}
              </div>
            </div>

            {/* Right Column (Hero certificate preview - shifted downward by 60-80px for generous top breathing room) */}
            <div className="col-span-1 md:col-span-7 flex flex-col justify-center items-center md:items-start pt-6 md:pt-16 lg:pt-20">
              <div className="relative w-full min-h-[420px] max-[374px]:min-h-[390px] xs:min-h-[450px] sm:min-h-[500px] md:min-h-[480px] lg:min-h-[520px] xl:min-h-[580px]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.97, z: -30 }}
                    animate={{ opacity: 1, scale: 1, z: 0 }}
                    exit={{ opacity: 0, scale: 0.97, z: -30 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full flex flex-col justify-center items-center md:items-start"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Ambient Floating Glass Card */}
                    <div className="w-full flex justify-center">
                      <TiltCard image={activeCert.image} title={activeCert.title} onOpenViewer={handleOpenViewer} />
                    </div>

                    {/* Detail Text Logs (Increased vertical spacing by ~24px below preview) */}
                    <div className="w-full text-center md:text-left mt-8 md:mt-16 lg:mt-20 px-4 md:px-1">
                      <span className="font-mono text-[9px] tracking-[0.25em] text-cyan-400 font-bold uppercase block">
                        {activeCert.organization}
                      </span>
                      <h3 className="font-display text-lg sm:text-xl md:text-2xl text-white font-black tracking-wide uppercase leading-tight mt-1">
                        {activeCert.title}
                      </h3>
                      <span className="font-mono text-[10px] text-zinc-500 tracking-wider block mt-1">
                        ISSUED: {activeCert.date}
                      </span>
                      <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl mx-auto md:mx-0 mt-3">
                        {activeCert.description}
                      </p>
                    </div>

                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Premium Fullscreen Certificate Viewer Modal */}
      <CertificateViewerModal selectedCert={selectedViewerCert} onClose={handleCloseViewer} />
    </section>
  );
}

