import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CyberLabBackground3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer, Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020704);
    scene.fog = new THREE.FogExp2(0x020704, 0.032);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 11);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x052014, 1.5);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0x00ff88, 3.5, 30, Math.PI / 4, 0.5, 1);
    mainSpot.position.set(0, 8, 2);
    mainSpot.target.position.set(0, 0, -10);
    scene.add(mainSpot);
    scene.add(mainSpot.target);

    const cyanSpot = new THREE.SpotLight(0x00f0ff, 2.0, 25, Math.PI / 3, 0.6, 1);
    cyanSpot.position.set(-6, 6, -5);
    scene.add(cyanSpot);

    // 3. Dynamic Canvases for 3D Monitor Textures
    // --- Canvas A: Live Code Terminal ---
    const termCanvas = document.createElement('canvas');
    termCanvas.width = 512;
    termCanvas.height = 256;
    const termCtx = termCanvas.getContext('2d');
    const termTexture = new THREE.CanvasTexture(termCanvas);

    const termLines = [
      '// KAV.AI CLASSIFIED CORE INITIALIZATION',
      'import torch',
      'import torch.nn as nn',
      'class KAVAI_Core(nn.Module):',
      '  def __init__(self): super().__init__()',
      '  def forward(self, x): return self.encoder(x)',
      'model = KAVAI_Core().cuda()',
      '[OK] Tensor Cores locked @ 100%',
      '[SYS] AES-256 Quantum Tunnel Active',
      '$ docker run -d kavai/neural-v4:latest',
      '[LOG] Status: 100% OPTIMAL',
    ];
    let termLineIdx = 0;

    // --- Canvas B: Neural Network Topology ---
    const neuralCanvas = document.createElement('canvas');
    neuralCanvas.width = 512;
    neuralCanvas.height = 256;
    const neuralCtx = neuralCanvas.getContext('2d');
    const neuralTexture = new THREE.CanvasTexture(neuralCanvas);

    // --- Canvas C: Biometric Fingerprint ---
    const bioCanvas = document.createElement('canvas');
    bioCanvas.width = 256;
    bioCanvas.height = 256;
    const bioCtx = bioCanvas.getContext('2d');
    const bioTexture = new THREE.CanvasTexture(bioCanvas);

    // --- Canvas D: Hardware Telemetry ---
    const hwCanvas = document.createElement('canvas');
    hwCanvas.width = 512;
    hwCanvas.height = 256;
    const hwCtx = hwCanvas.getContext('2d');
    const hwTexture = new THREE.CanvasTexture(hwCanvas);

    // 4. 3D Geometries & Materials
    // Metallic Dark Floor
    const floorGeo = new THREE.PlaneGeometry(40, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050e09,
      roughness: 0.35,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.5;
    scene.add(floor);

    // Grid helper on floor
    const gridHelper = new THREE.GridHelper(60, 60, 0x00ff88, 0x002b18);
    gridHelper.position.y = -1.49;
    scene.add(gridHelper);

    // Ceiling Mesh
    const ceilingGeo = new THREE.PlaneGeometry(40, 60);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x030805,
      roughness: 0.8,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 7;
    scene.add(ceiling);

    // 3D Server Racks & Blinking LEDs
    const rackGeo = new THREE.BoxGeometry(1.6, 4.5, 1.2);
    const rackMat = new THREE.MeshStandardMaterial({
      color: 0x0b1410,
      roughness: 0.4,
      metalness: 0.7,
    });

    const ledGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const ledCount = 140;
    const ledInstanced = new THREE.InstancedMesh(
      ledGeo,
      new THREE.MeshBasicMaterial({ color: 0x00ff88 }),
      ledCount
    );

    const dummy = new THREE.Object3D();
    let ledIdx = 0;

    // Create 12 server racks on Left and 12 on Right
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 10; i++) {
        const rack = new THREE.Mesh(rackGeo, rackMat);
        const rx = side * (5.5 + Math.sin(i * 0.3) * 0.3);
        const rz = -i * 3 + 2;
        rack.position.set(rx, 0.75, rz);
        scene.add(rack);

        // Add LEDs on front face of rack
        for (let l = 0; l < 7; l++) {
          if (ledIdx < ledCount) {
            dummy.position.set(
              rx + (side < 0 ? 0.7 : -0.7),
              -0.8 + l * 0.6,
              rz + (Math.random() - 0.5) * 0.8
            );
            dummy.updateMatrix();
            ledInstanced.setMatrixAt(ledIdx++, dummy.matrix);
          }
        }
      }
    }
    ledInstanced.instanceMatrix.needsUpdate = true;
    scene.add(ledInstanced);

    // Central Supercomputer Core (Far Background z = -18)
    const coreCylinderGeo = new THREE.CylinderGeometry(2.2, 2.2, 5.5, 32);
    const coreCylinderMat = new THREE.MeshStandardMaterial({
      color: 0x061810,
      roughness: 0.2,
      metalness: 0.9,
    });
    const superCore = new THREE.Mesh(coreCylinderGeo, coreCylinderMat);
    superCore.position.set(0, 1.2, -18);
    scene.add(superCore);

    // Supercomputer Inner Glowing Glass Ring
    const innerCoreGeo = new THREE.CylinderGeometry(1.6, 1.6, 4.8, 24);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    superCore.add(innerCore);

    // Glowing Liquid Cooling Pipes
    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3, -1.4, -16),
      new THREE.Vector3(-2, 1, -17),
      new THREE.Vector3(0, 2.5, -18),
      new THREE.Vector3(2, 1, -17),
      new THREE.Vector3(3, -1.4, -16),
    ]);
    const pipeGeo = new THREE.TubeGeometry(pipeCurve, 32, 0.12, 12, false);
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.6,
      roughness: 0.1,
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    scene.add(pipe);

    // 3D Workstations & Glass Displays in 3D Space
    // --- Screen 1: Wall Display Left (Live Code) ---
    const wallScreenGeo1 = new THREE.PlaneGeometry(4.5, 2.25);
    const wallScreenMat1 = new THREE.MeshBasicMaterial({
      map: termTexture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const wallScreen1 = new THREE.Mesh(wallScreenGeo1, wallScreenMat1);
    wallScreen1.position.set(-4.2, 2.8, -7);
    wallScreen1.rotation.y = Math.PI / 6;
    scene.add(wallScreen1);

    // --- Screen 2: Wall Display Right (Hardware Telemetry) ---
    const wallScreenGeo2 = new THREE.PlaneGeometry(4.5, 2.25);
    const wallScreenMat2 = new THREE.MeshBasicMaterial({
      map: hwTexture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const wallScreen2 = new THREE.Mesh(wallScreenGeo2, wallScreenMat2);
    wallScreen2.position.set(4.2, 2.8, -7);
    wallScreen2.rotation.y = -Math.PI / 6;
    scene.add(wallScreen2);

    // --- Screen 3: Left Workstation Glass (Biometric Fingerprint) ---
    const deskScreenGeo1 = new THREE.PlaneGeometry(2.2, 2.2);
    const deskScreenMat1 = new THREE.MeshBasicMaterial({
      map: bioTexture,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    });
    const deskScreen1 = new THREE.Mesh(deskScreenGeo1, deskScreenMat1);
    deskScreen1.position.set(-3.2, 0.4, -1);
    deskScreen1.rotation.y = Math.PI / 4;
    deskScreen1.rotation.x = -Math.PI / 12;
    scene.add(deskScreen1);

    // --- Screen 4: Right Workstation Glass (Neural Network Topology) ---
    const deskScreenGeo2 = new THREE.PlaneGeometry(3.6, 1.8);
    const deskScreenMat2 = new THREE.MeshBasicMaterial({
      map: neuralTexture,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    });
    const deskScreen2 = new THREE.Mesh(deskScreenGeo2, deskScreenMat2);
    deskScreen2.position.set(3.2, 0.4, -1);
    deskScreen2.rotation.y = -Math.PI / 4;
    deskScreen2.rotation.x = -Math.PI / 12;
    scene.add(deskScreen2);

    // 3D Laser Scanning Sweep Plane on Floor
    const laserPlaneGeo = new THREE.PlaneGeometry(16, 0.08);
    const laserPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const laserSweep = new THREE.Mesh(laserPlaneGeo, laserPlaneMat);
    laserSweep.rotation.x = -Math.PI / 2;
    laserSweep.position.y = -1.48;
    scene.add(laserSweep);

    // 3D Floating Dust Particles (Points)
    const partCount = 350;
    const partGeo = new THREE.BufferGeometry();
    const partPositions = new Float32Array(partCount * 3);
    for (let p = 0; p < partCount * 3; p += 3) {
      partPositions[p] = (Math.random() - 0.5) * 30;
      partPositions[p + 1] = Math.random() * 8 - 1;
      partPositions[p + 2] = (Math.random() - 0.5) * 30;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // Mouse Movement Parallax State
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // 5. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Rotate inner supercomputer core
      innerCore.rotation.y = elapsed * 0.4;
      superCore.rotation.y = Math.sin(elapsed * 0.1) * 0.05;

      // Laser sweep back and forth
      laserSweep.position.z = -15 + Math.sin(elapsed * 0.8) * 10;

      // Floating dust particles
      const positions = partGeo.attributes.position.array;
      for (let i = 1; i < partCount * 3; i += 3) {
        positions[i] += 0.003;
        if (positions[i] > 7) positions[i] = -1;
      }
      partGeo.attributes.position.needsUpdate = true;

      // Smooth Camera Idle Motion + Mouse Parallax
      const targetCamX = mouseX * 0.8;
      const targetCamY = 1.2 - mouseY * 0.4 + Math.sin(elapsed * 0.7) * 0.12;

      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(0, 0.5, -12);

      // --- Update Texture Canvas 2D Renders ---
      // A. Live Code Terminal
      if (Math.floor(elapsed * 4) % 3 === 0) {
        termCtx.fillStyle = '#020d07';
        termCtx.fillRect(0, 0, 512, 256);
        termCtx.strokeStyle = '#00ff88';
        termCtx.strokeRect(4, 4, 504, 248);

        termCtx.font = '13px monospace';
        termCtx.fillStyle = '#00ff88';

        for (let i = 0; i < termLines.length; i++) {
          termCtx.fillText(termLines[i], 16, 32 + i * 20);
        }
        termTexture.needsUpdate = true;
      }

      // B. Neural Network Visualizer
      neuralCtx.fillStyle = '#020d07';
      neuralCtx.fillRect(0, 0, 512, 256);
      neuralCtx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
      neuralCtx.lineWidth = 1.5;

      const offset = (elapsed * 40) % 100;
      // Draw nodes and lines
      neuralCtx.beginPath();
      neuralCtx.moveTo(60, 60); neuralCtx.lineTo(200, 40);
      neuralCtx.moveTo(60, 130); neuralCtx.lineTo(200, 130);
      neuralCtx.moveTo(60, 200); neuralCtx.lineTo(200, 200);
      neuralCtx.moveTo(200, 40); neuralCtx.lineTo(360, 80);
      neuralCtx.moveTo(200, 130); neuralCtx.lineTo(360, 180);
      neuralCtx.stroke();

      neuralCtx.fillStyle = '#00ff88';
      neuralCtx.font = 'bold 16px monospace';
      neuralCtx.fillText('AI NEURAL TOPOLOGY // CONFIDENCE: 99.8%', 20, 28);
      neuralTexture.needsUpdate = true;

      // C. Biometric Fingerprint
      bioCtx.fillStyle = '#020d07';
      bioCtx.fillRect(0, 0, 256, 256);
      bioCtx.strokeStyle = '#00ff88';
      bioCtx.strokeRect(4, 4, 248, 248);

      const scanY = 40 + Math.abs(Math.sin(elapsed * 2)) * 170;
      bioCtx.fillStyle = 'rgba(0, 255, 136, 0.2)';
      bioCtx.fillRect(20, scanY, 216, 4);

      bioCtx.fillStyle = '#00ff88';
      bioCtx.font = 'bold 12px monospace';
      bioCtx.fillText('BIOMETRIC SCAN', 24, 30);
      bioCtx.fillText('ID: KAVYA_MAKHAN', 24, 225);
      bioCtx.fillStyle = '#76ff03';
      bioCtx.fillText('ACCESS GRANTED', 24, 242);
      bioTexture.needsUpdate = true;

      // D. Hardware Telemetry
      hwCtx.fillStyle = '#020d07';
      hwCtx.fillRect(0, 0, 512, 256);
      hwCtx.fillStyle = '#00ff88';
      hwCtx.font = 'bold 16px monospace';
      hwCtx.fillText('SYSTEM DIAGNOSTICS & TELEMETRY', 20, 30);

      const cpu = Math.floor(40 + Math.sin(elapsed * 2) * 15);
      const gpu = Math.floor(88 + Math.cos(elapsed * 1.5) * 8);

      hwCtx.font = '14px monospace';
      hwCtx.fillText(`CPU UTILIZATION: ${cpu}%`, 20, 70);
      hwCtx.fillRect(20, 80, cpu * 3.5, 12);

      hwCtx.fillText(`GPU TENSOR CORES: ${gpu}%`, 20, 135);
      hwCtx.fillRect(20, 145, gpu * 3.5, 12);

      hwCtx.fillText(`VRAM: 21.4 GB / 24.0 GB | TEMP: 68°C | FPS: 60.0`, 20, 200);
      hwTexture.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none"
    />
  );
}
