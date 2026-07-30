import React, { Suspense, useEffect, useState, useCallback, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { SpaceBoi, CameraFitter } from '../outro/SpaceBoi';

// `isActive` defaults to true so any consumer that does not pass it keeps rendering continuously.
const LoadingPlanet = memo(function LoadingPlanet({ onReady, scale = 0.38, yOffset = -0.18, isActive = true }) {
  const [modelRadius, setModelRadius] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const handleReady = useCallback(() => {
    setIsReady(true);
    if (onReady) onReady();
  }, [onReady]);

  useEffect(() => {
    if (modelRadius > 0) {
      handleReady();
    }
  }, [modelRadius, handleReady]);

  return (
    <div className="w-full h-full relative flex items-center justify-center pointer-events-none bg-transparent">
      <Canvas
        // Freeze the WebGL render loop entirely while the outro section is out of view.
        // SpaceBoi drives rotation/float from the shared clock's elapsed time, so on resume it
        // lands on exactly the pose it would have held had the loop never paused.
        frameloop={isActive ? 'always' : 'never'}
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ambientLight intensity={0.7} color="#ffffff" />
        <directionalLight position={[5, 5, 5]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-5, 5, -5]} intensity={2.0} color="#00aaff" />
        <Suspense fallback={null}>
          <SpaceBoi onModelLoaded={setModelRadius} rotationSpeedMultiplier={0.5} scale={scale} yOffset={yOffset} />
        </Suspense>
        <CameraFitter modelRadius={modelRadius} />
      </Canvas>
    </div>
  );
});

export default LoadingPlanet;
