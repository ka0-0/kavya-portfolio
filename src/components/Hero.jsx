import React, { useEffect, useRef, useState, memo } from 'react';
import { motion } from 'framer-motion';
import RobotModel from './RobotModel';

function Hero({ showRobot }) {
  const heroRef = useRef(null);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  const roles = [
    'AI ENGINEER',
    'MECHANICAL ENGINEER',
  ];

  const line1 = "KAVYA".split("");
  const line2 = "MAKHAN.".split("");

  const [hoveredL1, setHoveredL1] = useState(null);
  const [hoveredL2, setHoveredL2] = useState(null);

  useEffect(() => {
    // Role Switcher Interval
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [roles.length]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      if (window.lenis) {
        window.lenis.scrollTo(el, { duration: 0.45 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-between pt-[110px] md:pt-24 pb-12 px-6 md:px-12 lg:px-20 bg-[var(--bg-dark)] text-[var(--text-main)] overflow-hidden select-none z-[1] isolate transition-colors duration-300"
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(var(--accent-rgb),0.1)_0%,transparent_70%)] rounded-full pointer-events-none z-0" />

      {/* Main 2-Column Hero Grid (Text 45% | Hero 3D Model 55%) */}
      <div className="w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 lg:gap-8 items-center z-[5] relative py-8">
        
        {/* LEFT SIDE: Text & CTA Buttons (45% width -> 5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col items-start text-left space-y-6 translate-y-0 md:-translate-y-20 lg:-translate-y-28">
          {/* HI, I'M */}
          <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.25em] text-cyan-400 uppercase">
            HI, I'M
          </span>

          {/* KAVYA MAKHAN. */}
          <h1 className="flex flex-col items-start gap-y-0.5 md:gap-y-1 select-none">
            {/* KAVYA */}
            <div 
              className="flex flex-wrap"
              onMouseLeave={() => setHoveredL1(null)}
            >
              {line1.map((char, idx) => {
                const isHovered = hoveredL1 === idx;
                const weight = isHovered ? 900 : 350;
                return (
                  <span
                    key={idx}
                    onMouseEnter={() => setHoveredL1(idx)}
                    className="relative inline-flex flex-col items-start select-none"
                  >
                    {/* Visible Text */}
                    <span
                      style={{
                        fontWeight: weight,
                        fontVariationSettings: `"wght" ${weight}`,
                      }}
                      className="hero-name-typography hero-letter hero-letter-white text-white inline-block text-[2.6rem] sm:text-[3.3rem] md:text-[4rem] lg:text-[4rem] leading-[0.9]"
                    >
                      {char}
                    </span>
                    {/* Hidden Bold Width Reserve */}
                    <span 
                      className="hero-name-typography invisible select-none h-0 pointer-events-none text-[2.6rem] sm:text-[3.3rem] md:text-[4rem] lg:text-[4rem]"
                      style={{ fontWeight: 900, fontVariationSettings: '"wght" 900' }}
                    >
                      {char}
                    </span>
                  </span>
                );
              })}
            </div>

            {/* MAKHAN. */}
            <div 
              className="flex flex-wrap"
              onMouseLeave={() => setHoveredL2(null)}
            >
              {line2.map((char, idx) => {
                const isHovered = hoveredL2 === idx;
                const weight = isHovered ? 400 : 900;
                return (
                  <span
                    key={idx}
                    onMouseEnter={() => setHoveredL2(idx)}
                    className="relative inline-flex flex-col items-start select-none"
                  >
                    {/* Visible Text */}
                    <span
                      style={{
                        fontWeight: weight,
                        fontVariationSettings: `"wght" ${weight}`,
                      }}
                      className="hero-name-typography hero-letter marquee-filled-gradient inline-block text-[3.12rem] sm:text-[3.96rem] md:text-[4.8rem] lg:text-[4.8rem] leading-[0.9]"
                    >
                      {char}
                    </span>
                    {/* Hidden Bold Width Reserve */}
                    <span 
                      className="hero-name-typography invisible select-none h-0 pointer-events-none text-[3.12rem] sm:text-[3.96rem] md:text-[4.8rem] lg:text-[4.8rem]"
                      style={{ fontWeight: 900, fontVariationSettings: '"wght" 900' }}
                    >
                      {char}
                    </span>
                  </span>
                );
              })}
            </div>
          </h1>

          {/* Dynamic Role Subtitle */}
          <div className="h-7 flex items-center">
            <motion.p
              key={currentRoleIndex}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-xs sm:text-sm md:text-base font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase"
            >
              {roles[currentRoleIndex]}
            </motion.p>
          </div>

          {/* Short Description */}
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans max-w-lg">
            Crafting intelligent mechanical systems, high-performance AI models, and autonomous neural controllers for real-world applications.
          </p>

          {/* Single Premium Cyberpunk CTA Pill Button */}
          <div className="pt-2">
            <button
              onClick={() => scrollToSection('contact')}
              className="group relative inline-flex items-center justify-between w-[235px] h-[58px] pl-6 pr-2 rounded-full bg-gradient-to-r from-[rgba(var(--accent-rgb),0.12)] via-[var(--card-bg-alt)]/90 to-[rgba(var(--accent-rgb),0.08)] border border-[rgba(var(--accent-rgb),0.4)] hover:border-[rgba(var(--accent-rgb),0.8)] backdrop-blur-xl shadow-[0_0_calc(var(--glow-opacity)*25px)_rgba(var(--accent-rgb),calc(var(--glow-opacity)*0.3))] hover:shadow-[0_0_calc(var(--glow-opacity)*40px)_rgba(var(--accent-rgb),calc(var(--glow-opacity)*0.55))] hover:-translate-y-1 transition-all duration-300 ease-out select-none cursor-pointer overflow-hidden"
              data-interactive="true"
            >
              {/* Subtle Animated Ambient Neon Glow Overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[rgba(var(--accent-rgb),0.1)] via-[rgba(var(--accent-rgb),0.15)] to-[rgba(var(--accent-rgb),0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Left Side Text */}
              <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-main)] group-hover:text-[var(--accent-light)] transition-colors duration-300 z-10">
                LET'S CONNECT
              </span>

              {/* Right Side Circular Action Button Container */}
              <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[rgba(var(--accent-rgb),0.2)] to-[rgba(var(--accent-rgb),0.3)] border border-[rgba(var(--accent-rgb),0.4)] group-hover:border-[var(--accent-light)] group-hover:bg-[var(--accent-color)] group-hover:shadow-[0_0_calc(var(--glow-opacity)*20px)_rgba(var(--accent-rgb),var(--glow-opacity))] backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:translate-x-0.5 z-10">
                <svg
                  className="w-4 h-4 text-[var(--accent-light)] group-hover:text-[var(--bg-dark)] transition-all duration-300 transform group-hover:rotate-[15deg] group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Hero 3D Avatar (small_robot.glb) (55% width -> 7 cols on lg, shifted 48px right) */}
        <div className="lg:col-span-7 relative flex items-center justify-center min-h-[340px] md:min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] w-full lg:translate-x-12 -translate-y-4 md:translate-y-0">
          {/* Subtle Electric Blue Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] md:w-[350px] md:h-[350px] sm:w-[520px] sm:h-[520px] bg-[radial-gradient(circle,rgba(var(--accent-rgb),0.08)_0%,transparent_70%)] md:bg-[radial-gradient(circle,rgba(var(--accent-rgb),0.18)_0%,rgba(var(--accent-rgb),0.09)_50%,transparent_70%)] pointer-events-none z-0" />

          {/* Glowing Circular Platform Pedestal Beneath Model */}
          <div className="absolute bottom-[72px] md:bottom-28 sm:bottom-36 left-1/2 -translate-x-1/2 w-[150px] md:w-[300px] sm:w-[440px] h-[30px] md:h-[65px] sm:h-[95px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(var(--accent-rgb),0.18)_0%,transparent_80%)] md:bg-[radial-gradient(ellipse_at_center,rgba(var(--accent-rgb),0.35)_0%,rgba(var(--accent-rgb),0.2)_50%,transparent_80%)] border border-[rgba(var(--accent-rgb),0.1)] md:border-[rgba(var(--accent-rgb),0.3)] blur-[1px] md:blur-[2px] shadow-[0_0_calc(var(--glow-opacity)*15px)_rgba(var(--accent-rgb),calc(var(--glow-opacity)*0.15))] md:shadow-[0_0_calc(var(--glow-opacity)*50px)_rgba(var(--accent-rgb),calc(var(--glow-opacity)*0.4))] pointer-events-none animate-pulse z-0" />

          {/* Render ONLY the NEW Hero GLB Avatar (/models/small_robot.glb) */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {showRobot && <RobotModel />}
          </div>
        </div>

      </div>

      {/* Bottom Scroll Hint */}
      <div className="w-full flex justify-center items-center text-xs font-mono text-zinc-500 uppercase tracking-widest z-10 pt-4">
        <span className="animate-bounce">↓ SCROLL TO EXPLORE WORK</span>
      </div>
    </section>
  );
}

export default memo(Hero);
