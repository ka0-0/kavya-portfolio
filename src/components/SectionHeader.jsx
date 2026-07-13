import React, { useRef, useEffect } from 'react';

export default function SectionHeader({ number, title, rightLabel }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let elementTop = 0;
    let elementHeight = 0;
    let targetTranslateX = 0;
    let currentTranslateX = 0;
    let rafId = null;
    let isIntersecting = false;

    // Measure the exact position of the header container relative to the document
    const measure = () => {
      const rect = container.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      elementTop = rect.top + scrollTop;
      elementHeight = rect.height;
    };

    const handleScroll = () => {
      if (!isIntersecting) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const scrollStart = elementTop - viewportHeight;
      const scrollRange = viewportHeight + elementHeight;

      if (scrollRange <= 0) return;

      // Calculate progress between 0 (enters bottom of viewport) and 1 (leaves top of viewport)
      const progress = (scrollTop - scrollStart) / scrollRange;
      const clampedProgress = Math.max(0, Math.min(1, progress));

      // Calculate translation: glide from right to left by 500% of viewport width
      const translateRange = window.innerWidth * 5.0;
      targetTranslateX = (0.5 - clampedProgress) * translateRange;
    };

    const animate = () => {
      if (!isIntersecting) return;

      // Premium linear interpolation (lerp) for smooth gliding physics
      currentTranslateX += (targetTranslateX - currentTranslateX) * 0.42;

      if (textRef.current) {
        textRef.current.style.transform = `translate3d(${currentTranslateX}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    // Use IntersectionObserver to start scroll listeners & animation loop only when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          measure();
          handleScroll();
          // Initialize position instantly on enter to prevent visual jumps
          currentTranslateX = targetTranslateX;
          if (textRef.current) {
            textRef.current.style.transform = `translate3d(${currentTranslateX}px, 0, 0)`;
          }

          window.addEventListener('scroll', handleScroll, { passive: true });
          window.addEventListener('resize', measure, { passive: true });
          rafId = requestAnimationFrame(animate);
        } else {
          window.removeEventListener('scroll', handleScroll);
          window.removeEventListener('resize', measure);
          if (rafId) {
            cancelAnimationFrame(rafId);
          }
        }
      },
      { threshold: 0 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measure);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Split title into two parts (first word is outline-only, rest is filled)
  const words = title.split(' ');
  const firstWord = words[0] || '';
  const secondWord = words.slice(1).join(' ') || '';

  // Repeat text to span far beyond standard viewport widths (e.g. 4K)
  const repetitions = Array(6).fill(null);

  return (
    <div
      ref={containerRef}
      className="section-header-root relative w-full pt-0 pb-4 mb-4 md:mb-16 overflow-hidden bg-transparent select-none z-20"
    >
      {/* Top Details bar with Thin Blueprint Divider Line */}
      <div className="section-header-details max-w-7xl mx-auto px-6 md:px-8 mb-12 md:mb-16">
        <div className="flex justify-between items-end pb-3 border-b border-zinc-800/40">
          <span className="font-mono text-xs tracking-[0.25em] text-cyan-400 font-bold">
            {number}
          </span>
          <span className="font-mono text-[9px] tracking-[0.25em] text-zinc-500 uppercase">
            {rightLabel}
          </span>
        </div>
      </div>

      {/* Oversized Kinetic Repeated Text Track (Sandwiched between twin divider lines) */}
      <div className="section-header-kinetic relative w-full overflow-hidden flex justify-center py-2 border-b border-zinc-800/40 mt-[-8px] sm:mt-[-16px] md:mt-[-24px] lg:mt-[-32px]">
        <div ref={textRef} style={{ willChange: 'transform' }}>
          <div className="flex whitespace-nowrap marquee-font-style leading-none text-[62px] sm:text-[96px] md:text-[184px] lg:text-[238px]">
            {repetitions.map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-6 md:gap-10 mr-16 md:mr-24"
              >
                <span 
                  className="marquee-outlined font-black"
                  style={{ fontWeight: 900, fontVariationSettings: '"wght" 900' }}
                >
                  {firstWord}
                </span>
                <span 
                  className="marquee-filled-gradient font-black"
                  style={{ fontWeight: 900, fontVariationSettings: '"wght" 900' }}
                >
                  {secondWord}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
