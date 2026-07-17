import React, { Suspense, useRef, useMemo, useState, useEffect, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { downloadResume } from '../../utils/resume';


const SpaceBoi = memo(function SpaceBoi({ onModelLoaded }) {
  const { scene } = useGLTF('/models/space_boi.glb');
  const meshRef = useRef();

  // Run on mount or load to compute bounding box, center the model's geometry locally
  useEffect(() => {
    if (scene) {
      if (!scene.userData.isCentered) {
        // Reset position to (0,0,0) before computing bounding box to ensure original bounds are evaluated
        scene.position.set(0, 0, 0);

        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const sphere = box.getBoundingSphere(new THREE.Sphere());

        // Center geometry around (0,0,0) locally so rotation has no orbital wobble
        scene.position.set(-center.x, -center.y, -center.z);

        scene.userData.center = center;
        scene.userData.radius = sphere.radius;
        scene.userData.isCentered = true;
      }

      // Report model's bounding radius to frame the camera
      if (onModelLoaded) {
        onModelLoaded(scene.userData.radius);
      }
    }
  }, [scene, onModelLoaded]);

  // Linear Y-axis rotation (1 full rotation every ~100s) + subtle floating oscillation
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Rotate 360 degrees (2 * Math.PI) over 100 seconds
      meshRef.current.rotation.y = (elapsed * (2 * Math.PI)) / 25;

      // Calculate dynamic vertical offset (16% of viewport height down)
      const fovRad = (state.camera.fov * Math.PI) / 180;
      const distance = state.camera.position.z;
      const viewportHeight = 2 * distance * Math.tan(fovRad / 2);
      const baseSpace = -viewportHeight * 0.04;

      // Floating oscillation (amplitude: ~0.04 units, period: 10s)
      const floatOffset = Math.sin((elapsed * (2 * Math.PI)) / 10) * 0.04;

      meshRef.current.position.y = baseSpace + floatOffset;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={scene} />
    </group>
  );
});

// Dynamic camera framing component to scale fitting to 70% of the canvas
const CameraFitter = memo(function CameraFitter({ modelRadius }) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (modelRadius > 0) {
      const aspect = size.width / size.height;
      const fovRad = (camera.fov * Math.PI) / 180;

      // Half vertical angle
      const thetaV = fovRad / 2;

      // Half horizontal angle
      const thetaH = Math.atan(Math.tan(thetaV) * aspect);

      // Use the smaller of the two angles to ensure it fits in both dimensions
      const theta = Math.min(thetaV, thetaH);

      // Calculate camera distance to occupy 70% (0.70) of the viewport
      const distance = modelRadius / (3 * Math.sin(theta));

      camera.position.set(0, 0, distance);
      camera.near = distance / 20;
      camera.far = distance * 20;
      camera.updateProjectionMatrix();
    }
  }, [modelRadius, size.width, size.height, camera]);

  return null;
});

function SpaceBoiScene() {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [modelRadius, setModelRadius] = useState(0);
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
      { threshold: 0.01 }
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

  const glSettings = useMemo(
    () => ({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    }),
    []
  );

  return (
    <section
      id="resume"
      className="relative w-full bg-[var(--bg-dark)] flex flex-col items-center justify-center pt-20 md:pt-28 pb-0 overflow-hidden z-10 select-none transition-colors duration-300"
    >
      {/* Background Ambient Blue Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--accent-rgb),0.20)_0%,rgba(var(--accent-rgb),0.05)_50%,transparent_75%)] pointer-events-none z-0" />

      <div ref={containerRef} className="w-full h-[650px] sm:h-[750px] md:h-[850px] lg:h-[100vh] relative z-10">
        <Canvas
          frameloop={isInView ? "always" : "never"}
          dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2)]}
          gl={glSettings}
          camera={{ position: [0, 0, 10], fov: 45 }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          {/* Subtle fill ambient lighting */}
          <ambientLight intensity={0.5} color="#ffffff" />

          {/* Soft directional lighting to maintain mysterious monochrome tone */}
          <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />

          <Suspense fallback={null}>
            <SpaceBoi onModelLoaded={setModelRadius} />
          </Suspense>

          <CameraFitter modelRadius={modelRadius} />
        </Canvas>

        {/* Style block for cinematic transitions and animation timing sequence */}
        <style dangerouslySetInnerHTML={{ __html: `
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
        <div className={`absolute inset-0 flex flex-col justify-between items-center z-20 pointer-events-none px-6 pt-12 md:pt-0 pb-16 md:pb-[33vh] md:-translate-y-[10vh] ${animate ? 'animate-sequence' : ''}`}>
          
          {/* Top Block: Status Indicators, Heading, and Subtitle */}
          <div className="flex flex-col items-center text-center pointer-events-auto w-full">
            {/* Status Indicators */}
            <div className="flex flex-col items-center w-full">
              <span className="final-animate-fade-in delay-step-1 text-[10px] md:text-xs font-mono tracking-[0.3em] text-cyan-400 font-bold uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                SYSTEM STATUS
              </span>
              
              {/* gap 20px */}
              <div className="h-[20px]" />
              
              <div className="text-[10px] md:text-xs font-mono text-zinc-400 space-y-1 text-center font-medium leading-relaxed">
                <div className="final-animate-fade-in delay-step-2">
                  Portfolio ........ COMPLETE ✓
                </div>
                <div className="final-animate-fade-in delay-step-3">
                  Connection ...... ESTABLISHED ✓
                </div>
              </div>
            </div>

            {/* gap 36px */}
            <div className="h-[36px]" />

            {/* Heading */}
            <h2 className="final-animate-fade-up delay-step-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white uppercase leading-[1.1] w-full">
              THANK YOU<br />
              FOR EXPLORING<br />
              MY UNIVERSE
            </h2>

            {/* gap 24px */}
            <div className="h-[24px]" />

            {/* Subtitle */}
            <p className="final-animate-fade-in delay-step-5 text-[10px] sm:text-xs font-mono tracking-[0.2em] text-cyan-400/90 font-bold uppercase drop-shadow-[0_0_6px_rgba(34,211,238,0.2)]">
              Mechanical Engineer × AI Developer
            </p>
          </div>

          {/* Flexible Spacer for the 3D Character Silhouette (visually divides the layout) */}
          <div className="flex-grow min-h-[40px] md:min-h-[120px] lg:min-h-[180px]" />

          {/* Bottom Block: Body Text, Button, Social Links, and Footer */}
          <div className="flex flex-col items-center text-center pointer-events-auto w-full max-w-2xl">
            {/* Body Text */}
            <p className="final-animate-fade-in delay-step-6 text-zinc-200 text-xs sm:text-sm max-w-md mx-auto leading-relaxed tracking-wide font-sans">
              Building intelligent products,<br className="hidden sm:inline" /> one idea at a time.<br />
              Let's build something together.
            </p>

            {/* gap 36px */}
            <div className="h-[36px]" />

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

            {/* gap 32px */}
            <div className="h-[32px]" />

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

            {/* gap 36px */}
            <div className="h-[36px]" />

            {/* Bottom: Footer */}
            <div className="final-animate-fade-in delay-step-9 flex flex-col items-center w-full">
              <div className="text-zinc-800 select-none text-[8px] sm:text-[10px] tracking-tight mb-4 opacity-50">
                ────────────────────────
              </div>
              <div className="flex flex-col items-center text-[10px] font-mono tracking-[0.2em] text-zinc-500">
                <span>© 2026 Kavya Makhan</span>
                
                {/* gap 12px */}
                <div className="h-[12px]" />

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
      </div>
    </section>
  );
}

export default memo(SpaceBoiScene);
