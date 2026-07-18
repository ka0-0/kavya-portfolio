import React, { useRef, useEffect, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Preload the SpaceBoi GLB model asset
useGLTF.preload('/models/space_boi.glb');

export const SpaceBoi = memo(function SpaceBoi({ onModelLoaded, rotationSpeedMultiplier = 1.0 }) {
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
      // Rotate 360 degrees (2 * Math.PI) over 25 seconds, scaled by rotationSpeedMultiplier
      meshRef.current.rotation.y = (elapsed * (2 * Math.PI) * rotationSpeedMultiplier) / 25;

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
export const CameraFitter = memo(function CameraFitter({ modelRadius }) {
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

export default SpaceBoi;
