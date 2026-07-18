import React, { Suspense, useEffect, useRef, useState, useCallback, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Preload the GLB model asset
useGLTF.preload('/models/robot.glb');

function RobotScene({ onProgress, onFinished, onReady }) {
  const { scene, animations } = useGLTF('/models/robot.glb');
  const { actions, mixer } = useAnimations(animations, scene);
  const { gl, camera } = useThree();
  const actionRef = useRef(null);
  const clipDurationRef = useRef(0);
  const isInitializedRef = useRef(false);

  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  // Position and setup Three.js scene bounds centered behind UI
  useEffect(() => {
    if (!scene) return;

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;

      // Reset scale and position to default before measuring bounds, since useGLTF caches the scene object globally
      scene.scale.set(1, 1, 1);
      scene.position.set(0, 0, 0);

      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const scaleMultiplier = 2.0 / maxDim;
        scene.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
        // Position model closer to text (Y = -0.18), shifted to the right on desktop (X = 1.6)
        const isDesktop = window.innerWidth >= 1024;
        scene.position.set(isDesktop ? 1.6 : 0, -0.18, 0);
      }
    }

    // Pre-compile scene materials and textures to avoid any initial frame glitch
    try {
      gl.compile(scene, camera);
    } catch (e) {
      console.warn('gl.compile error:', e);
    }

    // Wait two animation frames to ensure GPU has rendered the first frame cleanly behind opacity 0
    let raf1, raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (onReadyRef.current) onReadyRef.current();
      });
    });

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [scene, gl, camera]);

  // Configure animation playback and resource disposal on unmount
  useEffect(() => {
    if (!animations || animations.length === 0 || !actions || !mixer) return;

    const clip = animations[0];
    const firstClipName = clip?.name || Object.keys(actions)[0];
    const action = firstClipName ? actions[firstClipName] : null;

    if (action) {
      actionRef.current = action;
      clipDurationRef.current = clip?.duration || 1;

      action.reset();
      action.setLoop(THREE.LoopRepeat);
      action.fadeIn(0.3).play();

      const handleFinished = (e) => {
        if (e.action === action || !e.action) {
          if (onFinished) onFinished();
        }
      };

      mixer.addEventListener('finished', handleFinished);

      return () => {
        mixer.removeEventListener('finished', handleFinished);
        if (action) action.stop();
        if (mixer) mixer.stopAllAction();

        // Complete GPU resources cleanup before unmounting
        scene.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      };
    }
  }, [actions, animations, mixer, scene, onFinished]);

  // Real-time synchronization of progress bar with AnimationAction.time
  useFrame(() => {
    const action = actionRef.current;
    const duration = clipDurationRef.current;

    if (action && duration > 0 && onProgress) {
      const currentProgress = Math.min((action.time / duration) * 100, 100);
      onProgress(currentProgress);
    }
  });

  return <primitive object={scene} />;
}

const LoadingRobot = memo(function LoadingRobot({ onProgress, onFinished, onReady }) {
  const [isReady, setIsReady] = useState(false);

  const handleReady = useCallback(() => {
    setIsReady(true);
    if (onReady) onReady();
  }, [onReady]);

  return (
    <div
      className="w-full h-full relative flex items-center justify-center pointer-events-none bg-transparent"
      style={{
        opacity: isReady ? 1 : 0,
        transition: 'opacity 400ms ease-in-out',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.25, 4.8], fov: 30 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight position={[5, 5, 5]} intensity={1.6} color="#ffffff" />
        <directionalLight position={[-5, 5, -5]} intensity={1.8} color="#00aaff" />

        <Suspense fallback={null}>
          <RobotScene onProgress={onProgress} onFinished={onFinished} onReady={handleReady} />
        </Suspense>
      </Canvas>
    </div>
  );
});

export default LoadingRobot;
