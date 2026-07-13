import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { downloadResume } from '../utils/resume';

// SVG Icons
const GithubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ResumeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2H12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// Magnetic button helper for premium desktop cursor pull
function MagneticButton({ children, href, onClick, className, shouldReduceMotion, ...props }) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    // Limit pull to 28% of cursor distance
    setPosition({ x: x * 0.28, y: y * 0.28 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  if (href) {
    return (
      <motion.a
        ref={buttonRef}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ x: position.x, y: position.y }}
        transition={
          shouldReduceMotion 
            ? { duration: 0.15 } 
            : { type: 'spring', stiffness: 140, damping: 15, mass: 0.15 }
        }
        className={className}
        {...props}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={
        shouldReduceMotion 
          ? { duration: 0.15 } 
          : { type: 'spring', stiffness: 140, damping: 15, mass: 0.15 }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default function ContactSection() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Copy Email states & handler
  const [copied, setCopied] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('Click to copy');

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const emailStr = 'kav.1609.ya@gmail.com';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(emailStr);
        setCopied(true);
        setCopyFeedback('Copied!');
        setTimeout(() => {
          setCopied(false);
          setCopyFeedback('Click to copy');
        }, 2000);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (err) {
      console.warn('Failed to copy using navigator.clipboard:', err);
      setCopyFeedback('Press Ctrl+C to copy');
      const tempTextarea = document.createElement('textarea');
      tempTextarea.value = emailStr;
      document.body.appendChild(tempTextarea);
      tempTextarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setCopyFeedback('Click to copy');
        }, 2000);
      } catch {
        setTimeout(() => {
          setCopyFeedback('Click to copy');
        }, 3000);
      }
      document.body.removeChild(tempTextarea);
    }
  };

  // Resume download state & handler
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      downloadResume();
      setDownloaded(true);
      setTimeout(() => {
        setDownloaded(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to download resume:', err);
    }
  };

  // Focus trap refs
  const modalBoxRef = useRef(null);
  const nameInputRef = useRef(null);
  const closeButtonRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Handle body scroll locking and Lenis pausing
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      if (window.lenis) {
        window.lenis.stop();
      }
    } else {
      document.body.style.overflow = '';
      if (window.lenis) {
        window.lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = '';
      if (window.lenis) {
        window.lenis.start();
      }
    };
  }, [isModalOpen]);

  // Focus the name input automatically when modal triggers open
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  const openModal = () => {
    setIsSuccess(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Keyboard accessibility and focus trap handler
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      if (!modalBoxRef.current) return;
      const focusable = modalBoxRef.current.querySelectorAll(
        'button, input, textarea, a, [tabindex="0"]'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  };

  // Input field updates
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Form validations
  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        tempErrors.email = 'Please enter a valid email address';
      }
    }
    if (!formData.subject.trim()) {
      tempErrors.subject = 'Subject is required';
    }
    if (!formData.message.trim()) {
      tempErrors.message = 'Message is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to deliver message.');
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Contact form submission error:', err);
      setErrors({ submit: err.message || 'Failed to deliver message. Please check connection and try again.' });
    } finally {
      setIsSending(false);
    }
  };

  // Particles
  const particles = Array.from({ length: 8 });

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const labelVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const headlineVariants = (index) => ({
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 90,
        damping: 14,
        delay: shouldReduceMotion ? 0 : 0.15 + index * 0.1,
      },
    },
  });

  const paragraphVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 90,
        damping: 15,
        delay: shouldReduceMotion ? 0 : 0.25,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 90,
        damping: 15,
        delay: shouldReduceMotion ? 0 : 0.35,
      },
    },
  };

  const rightPanelVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 16,
        delay: shouldReduceMotion ? 0 : 0.5,
      },
    },
  };

  const cardVariants = (index) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: shouldReduceMotion ? 0 : 0.55 + index * 0.08,
      },
    },
  });

  const bottomRowVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 16,
        delay: shouldReduceMotion ? 0 : 0.7,
      },
    },
  };

  const bottomCardVariants = (index) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 90,
        damping: 15,
        delay: shouldReduceMotion ? 0 : 0.75 + index * 0.08,
      },
    },
  });

  // Modal Animation Variants (Opacity & Scale spring only)
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalBoxVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 350, 
        damping: 28, 
        mass: 0.8 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 10, 
      transition: { duration: 0.2 } 
    },
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-7xl mx-auto mt-20 px-3 md:px-8 z-10 select-none"
    >
      {/* Inline styles for custom drift, rotate, and pulse animations */}
      <style>{`
        @keyframes drift {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          12% { opacity: 0.35; }
          88% { opacity: 0.35; }
          100% { transform: translate3d(32px, -80px, 0); opacity: 0; }
        }
        .animate-particle-drift {
          animation: drift 16s linear infinite;
        }
        @keyframes slowGlowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.04); }
        }
        .animate-slow-glow {
          animation: slowGlowPulse 9s ease-in-out infinite;
        }
      `}</style>

      {/* BACKGROUND EFFECTS: Radial glow & neural grid */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[radial-gradient(circle,rgba(6,182,212,0.05)_0%,transparent_70%)] rounded-full blur-[70px] pointer-events-none z-0 animate-slow-glow" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.002)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.002)_1px,transparent_1px)] bg-[size:32px_32px] opacity-15 pointer-events-none z-0" />

      {/* Floating particles */}
      {!shouldReduceMotion && particles.map((_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/20 pointer-events-none z-0 animate-particle-drift"
          style={{
            top: `${20 + i * 10}%`,
            left: `${8 + (i * 13) % 85}%`,
            animationDuration: `${13 + i * 2.5}s`,
            animationDelay: `${i * -1.8}s`,
          }}
        />
      ))}

      {/* Main 2-Column Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-16 items-start z-10 relative"
      >
        {/* LEFT COLUMN */}
        <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6 md:space-y-8">
          <motion.span 
            variants={labelVariants}
            className="font-mono text-xs font-semibold tracking-[0.25em] text-cyan-400 uppercase select-none"
          >
            GET IN TOUCH
          </motion.span>

          <h2 className="flex flex-col items-start leading-[0.9] select-none">
            <span className="overflow-hidden block py-1.5">
              <motion.span
                custom={0}
                variants={headlineVariants(0)}
                className="font-display text-[6.8vw] min-[380px]:text-[7.2vw] min-[480px]:text-[2.8rem] sm:text-[4rem] md:text-[5.4rem] lg:text-[5.5rem] xl:text-[6.6rem] font-black uppercase text-white block tracking-tight"
                style={{ 
                  textShadow: '0 0 24px rgba(6, 182, 212, 0.42)',
                  willChange: 'transform, opacity'
                }}
              >
                Let's build
              </motion.span>
            </span>
            <span className="overflow-hidden block py-1.5">
              <motion.span
                custom={1}
                variants={headlineVariants(1)}
                className="font-display text-[6.8vw] min-[380px]:text-[7.2vw] min-[480px]:text-[2.8rem] sm:text-[4rem] md:text-[5.4rem] lg:text-[5.5rem] xl:text-[6.6rem] font-black uppercase text-white block tracking-tight"
                style={{ 
                  textShadow: '0 0 24px rgba(6, 182, 212, 0.42)',
                  willChange: 'transform, opacity'
                }}
              >
                something intelligent.
              </motion.span>
            </span>
          </h2>

          <motion.p
            variants={paragraphVariants}
            className="font-sans text-[14px] sm:text-[15px] md:text-[16px] text-zinc-400 leading-relaxed max-w-[90%] md:max-w-[560px] px-0"
            style={{ willChange: 'transform, opacity' }}
          >
            Whether it's AI applications, intelligent automation, or premium web experiences, let's create something that's fast, beautiful, and built for the future.
          </motion.p>

          <motion.div
            variants={buttonVariants}
            style={{ willChange: 'transform, opacity' }}
            className="w-full flex justify-start"
          >
            <MagneticButton
              onClick={openModal}
              shouldReduceMotion={shouldReduceMotion}
              className="group relative inline-flex items-center justify-center sm:justify-between w-full max-w-[340px] sm:max-w-none sm:w-[280px] h-[58px] px-8 rounded-full bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/40 hover:border-cyan-400 backdrop-blur-md transition-colors duration-300 select-none cursor-pointer"
            >
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-md"
                style={{ willChange: 'opacity' }}
              />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-white group-hover:text-cyan-300 transition-colors duration-300 z-10">
                Start a Conversation
              </span>
              <span className="font-mono text-sm text-cyan-400 group-hover:text-cyan-300 ml-3 transition-transform duration-300 transform group-hover:translate-x-1.5 z-10">
                →
              </span>
            </MagneticButton>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <motion.div
          rightPanelVariants
          variants={rightPanelVariants}
          style={{ willChange: 'transform, opacity' }}
          className="lg:col-span-4 relative rounded-3xl overflow-hidden bg-[#0a0a0c]/60 border border-white/5 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] w-full p-6 md:p-8 flex flex-col justify-start"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.03),transparent_60%)] pointer-events-none" />
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/20 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/20 pointer-events-none" />

          <span className="font-mono text-[10px] sm:text-xs font-bold tracking-[0.25em] text-zinc-500 uppercase select-none mb-6 block">
            CONNECT
          </span>

          <div className="flex flex-col gap-4">
            {/* GitHub */}
            <motion.a
              custom={0}
              variants={cardVariants(0)}
              whileTap={shouldReduceMotion ? {} : { scale: 0.985, y: -1 }}
              href="https://github.com/ka0-0"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl bg-white/[0.02] border border-white/5 p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden"
              style={{ willChange: 'transform, border-color' }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-md"
                style={{ willChange: 'opacity' }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/50 group-hover:text-cyan-300 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.35)] transition-all duration-300">
                    <GithubIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase font-bold">GITHUB</span>
                    <h4 className="text-xs sm:text-sm font-sans font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">Repository</h4>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-3 pt-3 border-t border-white/[0.03] flex justify-between items-center text-[11px] sm:text-xs">
                <span className="font-mono text-zinc-500">Open Source</span>
                <span className="font-mono text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform duration-300 flex items-center">
                  View Profile <span className="ml-1">→</span>
                </span>
              </div>
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              custom={1}
              variants={cardVariants(1)}
              whileTap={shouldReduceMotion ? {} : { scale: 0.985, y: -1 }}
              href="https://www.linkedin.com/in/kavya-makhan-800451370/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl bg-white/[0.02] border border-white/5 p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden"
              style={{ willChange: 'transform, border-color' }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-md"
                style={{ willChange: 'opacity' }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/50 group-hover:text-cyan-300 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.35)] transition-all duration-300">
                    <LinkedinIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase font-bold">LINKEDIN</span>
                    <h4 className="text-xs sm:text-sm font-sans font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">Professional Network</h4>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-3 pt-3 border-t border-white/[0.03] flex justify-between items-center text-[11px] sm:text-xs">
                <span className="font-mono text-zinc-500">Connections</span>
                <span className="font-mono text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform duration-300 flex items-center">
                  Let's Connect <span className="ml-1">→</span>
                </span>
              </div>
            </motion.a>

            {/* Email (Click to copy) */}
            <motion.div
              custom={2}
              variants={cardVariants(2)}
              whileTap={shouldReduceMotion ? {} : { scale: 0.985, y: -1 }}
              onClick={handleCopy}
              className={`group relative rounded-2xl bg-white/[0.02] border p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden ${copied ? 'border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-cyan-500/[0.02]' : 'border-white/5 hover:border-cyan-500/30'}`}
              style={{ willChange: 'transform, border-color' }}
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent transition-opacity duration-300 pointer-events-none blur-md ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                style={{ willChange: 'opacity' }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-cyan-950/40 border flex items-center justify-center transition-all duration-300 ${copied ? 'border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]' : 'border-cyan-500/20 text-cyan-400 group-hover:border-cyan-400/50 group-hover:text-cyan-300 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.35)]'}`}>
                    <EmailIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase font-bold">EMAIL</span>
                    <h4 className="text-xs sm:text-sm font-sans font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">kav.1609.ya@gmail.com</h4>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-3 pt-3 border-t border-white/[0.03] flex justify-between items-center text-[11px] sm:text-xs">
                <span className={`font-mono transition-colors duration-300 ${copied ? 'text-cyan-400' : 'text-zinc-500'}`}>
                  {copyFeedback}
                </span>
                <span className={`font-mono font-semibold transition-all duration-300 flex items-center ${copied ? 'text-cyan-400' : 'text-cyan-400 group-hover:translate-x-1'}`}>
                  {copied ? (
                    <>
                      Copied <span className="ml-1 text-xs">✓</span>
                    </>
                  ) : (
                    <>
                      Copy <span className="ml-1">→</span>
                    </>
                  )}
                </span>
              </div>
            </motion.div>

            {/* Resume (Click to download) */}
            <motion.div
              custom={3}
              variants={cardVariants(3)}
              whileTap={shouldReduceMotion ? {} : { scale: 0.985, y: -1 }}
              onClick={handleDownload}
              className={`group relative rounded-2xl bg-white/[0.02] border p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden ${downloaded ? 'border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-cyan-500/[0.02]' : 'border-white/5 hover:border-cyan-500/30'}`}
              style={{ willChange: 'transform, border-color' }}
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent transition-opacity duration-300 pointer-events-none blur-md ${downloaded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                style={{ willChange: 'opacity' }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-cyan-950/40 border flex items-center justify-center transition-all duration-300 ${downloaded ? 'border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]' : 'border-cyan-500/20 text-cyan-400 group-hover:border-cyan-400/50 group-hover:text-cyan-300 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.35)]'}`}>
                    <ResumeIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase font-bold">RESUME</span>
                    <h4 className="text-xs sm:text-sm font-sans font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">Download Resume</h4>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-3 pt-3 border-t border-white/[0.03] flex justify-between items-center text-[11px] sm:text-xs">
                <span className={`font-mono transition-colors duration-300 ${downloaded ? 'text-cyan-400' : 'text-zinc-500'}`}>
                  Latest CV (PDF)
                </span>
                <span className={`font-mono font-semibold transition-all duration-300 flex items-center ${downloaded ? 'text-cyan-400' : 'text-cyan-400 group-hover:translate-x-1'}`}>
                  {downloaded ? (
                    <>
                      Downloaded <span className="ml-1 text-xs">✓</span>
                    </>
                  ) : (
                    <>
                      Download <span className="ml-1">→</span>
                    </>
                  )}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* BOTTOM INFO ROW */}
      <motion.div
        variants={bottomRowVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 md:mt-16 lg:mt-20 z-10 relative"
      >
        {/* Bottom Card 1: Current Status */}
        <motion.div
          custom={0}
          variants={bottomCardVariants(0)}
          className="group relative rounded-2xl bg-[#0a0a0c]/40 border border-white/5 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-cyan-500/20 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          style={{ willChange: 'transform, border-color' }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-t from-cyan-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-md"
            style={{ willChange: 'opacity' }}
          />
          <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-mono text-[10px] tracking-widest text-cyan-400 font-bold mb-4 block select-none">
              CURRENT STATUS
            </span>
            <ul className="font-sans text-xs sm:text-sm text-zinc-300 space-y-2 select-none text-left">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 inline-block mr-2.5" />
                Open to AI Projects
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 inline-block mr-2.5" />
                Internships
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 inline-block mr-2.5" />
                Freelance
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Bottom Card 2: Location */}
        <motion.div
          custom={1}
          variants={bottomCardVariants(1)}
          className="group relative rounded-2xl bg-[#0a0a0c]/40 border border-white/5 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-cyan-500/20 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          style={{ willChange: 'transform, border-color' }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-t from-cyan-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-md"
            style={{ willChange: 'opacity' }}
          />
          <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-mono text-[10px] tracking-widest text-cyan-400 font-bold mb-4 block select-none">
              LOCATION
            </span>
            <ul className="font-sans text-xs sm:text-sm text-zinc-300 space-y-2 select-none text-left">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 inline-block mr-2.5" />
                Delhi, India
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 inline-block mr-2.5" />
                Remote Worldwide
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Bottom Card 3: Work Style */}
        <motion.div
          custom={2}
          variants={bottomCardVariants(2)}
          className="group relative rounded-2xl bg-[#0a0a0c]/40 border border-white/5 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-cyan-500/20 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          style={{ willChange: 'transform, border-color' }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-t from-cyan-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-md"
            style={{ willChange: 'opacity' }}
          />
          <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-mono text-[10px] tracking-widest text-cyan-400 font-bold mb-4 block select-none">
              WORK STYLE
            </span>
            <ul className="font-sans text-xs sm:text-sm text-zinc-300 space-y-2 select-none text-left">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 inline-block mr-2.5" />
                Fast Communication
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 inline-block mr-2.5" />
                Clean Code
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 inline-block mr-2.5" />
                Long-term Collaboration
              </li>
            </ul>
          </div>
        </motion.div>
      </motion.div>

      {/* PREMIUM INTERACTIVE MODAL DIALOG */}
      {mounted && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeModal}
              onKeyDown={handleKeyDown}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-[#05070c]/55 backdrop-blur-[18px] overflow-y-auto"
            >
              {/* Modal Body Container */}
              <motion.div
                ref={modalBoxRef}
                variants={modalBoxVariants}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[700px] rounded-t-[24px] sm:rounded-[32px] bg-[#09090B] border-t border-x sm:border border-cyan-500/25 p-5 sm:p-8 md:p-10 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-8 md:pb-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-y-auto max-h-[88dvh] sm:max-h-[92vh]"
                style={{ scrollbarWidth: 'thin', willChange: 'transform, opacity' }}
              >
                {/* Subtle top-center background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                  ref={closeButtonRef}
                  onClick={closeModal}
                  className="absolute top-5 right-5 sm:top-6 sm:right-6 w-9 h-9 sm:w-8 sm:h-8 rounded-full border border-white/5 hover:border-cyan-500/30 flex items-center justify-center text-zinc-400 hover:text-white bg-white/[0.02] cursor-pointer transition-colors duration-300 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20"
                  aria-label="Close modal"
                >
                  <motion.div 
                    whileHover={shouldReduceMotion ? {} : { rotate: 90 }} 
                    transition={{ duration: 0.25 }} 
                    className="w-5 h-5 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.div>
                </button>

                {/* Success View */}
                {isSuccess ? (
                  <div className="flex flex-col items-center text-center py-8">
                    {/* Animated Success Checkmark Icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={
                        shouldReduceMotion 
                          ? { duration: 0.2 } 
                          : { type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }
                      }
                      className="w-16 h-16 rounded-full bg-cyan-950/50 border border-cyan-400/40 flex items-center justify-center text-cyan-455 mb-6 shadow-[0_0_24px_rgba(6,182,212,0.2)]"
                    >
                      <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>

                    <h3 id="modal-title" className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-wider mb-2">
                      Message Sent Successfully
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-zinc-400 max-w-[340px] mb-8 leading-relaxed">
                      Thanks for reaching out. I'll reply as soon as possible.
                    </p>

                    <button
                      onClick={closeModal}
                      className="w-full sm:w-[180px] h-[48px] rounded-full bg-cyan-950/30 hover:bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20"
                      aria-label="Close modal"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  /* Form View */
                  <div className="flex flex-col space-y-6">
                    {/* Header Titles */}
                    <div className="pr-12 text-left">
                      <h3 id="modal-title" className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mb-2">
                        Start a Conversation
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        Tell me about your idea, project, or opportunity. I'll get back to you as soon as possible.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 text-left">
                      {/* Name & Email Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col space-y-2">
                          <label htmlFor="form-name" className="font-mono text-[10px] tracking-wider text-zinc-400 font-bold uppercase">
                            Name <span className="text-cyan-400">*</span>
                          </label>
                          <input
                            ref={nameInputRef}
                            id="form-name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Your full name"
                            aria-required="true"
                            className={`h-[52px] sm:h-[56px] md:h-[60px] rounded-2xl bg-black/45 border ${errors.name ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/60'} px-5 font-sans text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-cyan-500/20`}
                          />
                          {errors.name && (
                            <span className="font-sans text-[10px] text-red-400 mt-1 select-none">
                              {errors.name}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2">
                          <label htmlFor="form-email" className="font-mono text-[10px] tracking-wider text-zinc-400 font-bold uppercase">
                            Email <span className="text-cyan-400">*</span>
                          </label>
                          <input
                            id="form-email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            aria-required="true"
                            className={`h-[52px] sm:h-[56px] md:h-[60px] rounded-2xl bg-black/45 border ${errors.email ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/60'} px-5 font-sans text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-cyan-500/20`}
                          />
                          {errors.email && (
                            <span className="font-sans text-[10px] text-red-400 mt-1 select-none">
                              {errors.email}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="flex flex-col space-y-2">
                        <label htmlFor="form-subject" className="font-mono text-[10px] tracking-wider text-zinc-400 font-bold uppercase">
                          Subject <span className="text-cyan-400">*</span>
                        </label>
                        <input
                          id="form-subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="What's this about?"
                          aria-required="true"
                          className={`h-[52px] sm:h-[56px] md:h-[60px] rounded-2xl bg-black/45 border ${errors.subject ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/60'} px-5 font-sans text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-cyan-500/20`}
                        />
                        {errors.subject && (
                          <span className="font-sans text-[10px] text-red-400 mt-1 select-none">
                            {errors.subject}
                          </span>
                        )}
                      </div>

                      {/* Message Textarea */}
                      <div className="flex flex-col space-y-2">
                        <label htmlFor="form-message" className="font-mono text-[10px] tracking-wider text-zinc-400 font-bold uppercase">
                          Message <span className="text-cyan-400">*</span>
                        </label>
                        <textarea
                          id="form-message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Your project details or inquiry message..."
                          aria-required="true"
                          className={`h-[140px] sm:h-[180px] md:h-[220px] py-4 rounded-2xl bg-black/45 border ${errors.message ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/60'} px-5 font-sans text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all duration-300 resize-none focus:ring-1 focus:ring-cyan-500/20`}
                        />
                        {errors.message && (
                          <span className="font-sans text-[10px] text-red-400 mt-1 select-none">
                            {errors.message}
                          </span>
                        )}
                      </div>

                      {errors.submit && (
                        <div className="bg-red-950/20 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-2xl">
                          {errors.submit}
                        </div>
                      )}

                      {/* Submit Button */}
                      <div className="flex justify-end pt-2">
                        <button
                          ref={submitButtonRef}
                          type="submit"
                          disabled={isSending}
                          className="group relative w-full sm:w-auto min-w-[200px] h-[54px] px-8 rounded-full bg-cyan-950/20 hover:bg-cyan-950/30 border border-cyan-500/40 hover:border-cyan-400 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center cursor-pointer transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20"
                          aria-label="Submit message"
                        >
                          <div 
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-md"
                            style={{ willChange: 'opacity' }}
                          />
                          {isSending ? (
                            <div className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>SENDING...</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span>Send Message</span>
                              <span className="font-mono text-sm text-cyan-400 group-hover:text-cyan-300 ml-2.5 transition-transform duration-300 transform group-hover:translate-x-1.5">
                                →
                              </span>
                            </div>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
