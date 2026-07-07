import React, { Suspense, useRef, useMemo, useState, useEffect, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { downloadResume } from '../utils/resume';


const SpaceBoi = memo(function SpaceBoi({ onModelLoaded }) {
  const { scene } = useGLTF('/models/space_boi.glb');
  const meshRef = useRef();

  // Run on mount or load to compute bounding box, center the model's geometry locally
  useEffect(() => {
    if (scene) {
      if (!scene.userData.isCentered) {
        // Reset position to (0,0,0) before computing bounding box
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

  const handleDownload = (e) => {
    e.preventDefault();
    if (downloadState !== 'idle') return;
    setDownloadState('downloading');

    setTimeout(() => {
      downloadResume();
      setDownloadState('completed');
      setTimeout(() => {
        setDownloadState('idle');
      }, 1500);
    }, 600);
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
      className="relative w-full bg-[#000000] flex flex-col items-center justify-center pt-20 md:pt-28 pb-0 overflow-hidden z-10 select-none"
    >
      {/* Background Ambient Blue Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.20)_0%,rgba(29,78,216,0.05)_50%,transparent_75%)] pointer-events-none z-0" />

      <div ref={containerRef} className="w-full h-[420px] sm:h-[550px] md:h-[650px] lg:h-[800px] relative z-10">
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

        {/* HTML Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-6">
          <div className="text-center space-y-4 pointer-events-auto">
            <h2 className="text-sm font-mono tracking-[0.2em] text-cyan-400 uppercase">06 / CURRICULUM VITAE</h2>
            <p className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white uppercase">
              RESUME ARCHIVE
            </p>
            <p className="text-zinc-500 max-w-xl mx-auto text-sm leading-relaxed tracking-wide font-sans mb-6">
              Download my comprehensive professional curriculum vitae outlining complete academic records and technical project logs.
            </p>
            <a
              href="#"
              onClick={handleDownload}
              className="btn-gradient-pill inline-flex items-center space-x-2 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer"
              data-interactive="true"
            >
              {downloadState === 'idle' && 'DOWNLOAD RESUME PDF'}
              {downloadState === 'downloading' && 'DOWNLOADING...'}
              {downloadState === 'completed' && 'DOWNLOAD COMPLETED'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(SpaceBoiScene);
