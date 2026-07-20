import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../theme/ThemeContext';


const CORE_STYLES = `
        .aikav-core-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;

          /* Shared Design Tokens - Default Blue Palette */
          --kav-primary: #00ffff;
          --kav-secondary: #7c3aed;
          --kav-highlight: #ffffff;
          --kav-glow: rgba(0, 255, 255, 0.45);
          --kav-bg-glow-start: rgba(37, 99, 235, 0.15);
          --kav-bg-glow-mid: rgba(6, 182, 212, 0.05);
          
          --kav-primary-alpha25: rgba(6, 182, 212, 0.25);
          --kav-primary-alpha20: rgba(6, 182, 212, 0.2);
          --kav-primary-alpha30: rgba(6, 182, 212, 0.3);
          --kav-primary-alpha15: rgba(0, 255, 255, 0.15);
          --kav-primary-alpha22: rgba(0, 255, 255, 0.22);
          --kav-primary-alpha12: rgba(6, 182, 212, 0.12);
          --kav-primary-alpha18: rgba(6, 182, 212, 0.18);
          --kav-primary-alpha38: rgba(0, 255, 255, 0.38);
          --kav-primary-alpha60: rgba(0, 255, 255, 0.6);
          --kav-primary-alpha90: rgba(0, 255, 255, 0.9);
          
          --kav-secondary-alpha35: rgba(124, 58, 237, 0.35);
          --kav-secondary-alpha25: rgba(124, 58, 237, 0.25);
          --kav-secondary-alpha18: rgba(124, 58, 237, 0.18);
          --kav-secondary-alpha08: rgba(124, 58, 237, 0.08);
          --kav-secondary-glow: rgba(124, 58, 237, 0.8);
          
          --kav-primary-dark: #0066ff;
          --kav-eye-glow: rgba(0, 102, 255, 0.42);
        }

        /* Orange Theme Overrides (Premium Amber/Orange) */
        .aikav-theme-orange {
          --kav-primary: #FF8C00;
          --kav-secondary: #FFA726;
          --kav-highlight: #FFF3E0;
          --kav-glow: rgba(255, 140, 0, 0.45);
          --kav-bg-glow-start: rgba(255, 140, 0, 0.2);
          --kav-bg-glow-mid: rgba(255, 167, 38, 0.08);
          
          --kav-primary-alpha25: rgba(255, 140, 0, 0.25);
          --kav-primary-alpha20: rgba(255, 140, 0, 0.2);
          --kav-primary-alpha30: rgba(255, 140, 0, 0.3);
          --kav-primary-alpha15: rgba(255, 140, 0, 0.15);
          --kav-primary-alpha22: rgba(255, 140, 0, 0.22);
          --kav-primary-alpha12: rgba(255, 167, 38, 0.12);
          --kav-primary-alpha18: rgba(255, 167, 38, 0.18);
          --kav-primary-alpha38: rgba(255, 140, 0, 0.38);
          --kav-primary-alpha60: rgba(255, 140, 0, 0.6);
          --kav-primary-alpha90: rgba(255, 140, 0, 0.9);
          
          --kav-secondary-alpha35: rgba(255, 167, 38, 0.35);
          --kav-secondary-alpha25: rgba(255, 167, 38, 0.25);
          --kav-secondary-alpha18: rgba(255, 167, 38, 0.18);
          --kav-secondary-alpha08: rgba(255, 167, 38, 0.08);
          --kav-secondary-glow: rgba(255, 167, 38, 0.8);
          
          --kav-primary-dark: #E65100;
          --kav-eye-glow: rgba(255, 167, 38, 0.45);

          --kav-accent-gold: #FFD700;
          --kav-deep-burnt: #D35400;
        }

        .aikav-theme-orange .aikav-thruster-trail {
          background: radial-gradient(ellipse at right center, rgba(255, 140, 0, 0.85) 0%, rgba(255, 167, 38, 0.45) 35%, rgba(230, 81, 0, 0.15) 70%, transparent 100%) !important;
        }

        /* Orange, Green, and Red skin container wrappers style */
        .aikav-orange-skin-container,
        .aikav-green-skin-container,
        .aikav-red-skin-container {
          position: absolute;
          inset: 0;
          width: 300px;
          height: 300px;
          transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          opacity: 0;
        }

        .aikav-theme-orange .aikav-orange-skin-container {
          opacity: 1;
          pointer-events: auto;
        }

        .aikav-theme-green .aikav-green-skin-container {
          opacity: 1;
          pointer-events: auto;
        }

        .aikav-theme-red .aikav-red-skin-container {
          opacity: 1;
          pointer-events: auto;
        }

        /* 🟢 Green Theme ("DNA Core") specific animations */
        .helix-rotate-cw {
          animation: orbit-rotate-cw-kf 14s linear infinite;
          transform-origin: 172px 172px;
          will-change: transform;
        }

        .helix-rotate-ccw {
          animation: reactor-rotate-ccw-kf 14s linear infinite;
          transform-origin: 172px 172px;
          will-change: transform;
        }

        .green-flow-cw {
          animation: green-flow-cw-kf 6s linear infinite;
        }

        .green-flow-ccw {
          animation: green-flow-ccw-kf 6s linear infinite;
        }

        @keyframes green-flow-cw-kf {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -240; }
        }

        @keyframes green-flow-ccw-kf {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 240; }
        }

        /* 🔴 Red Theme ("Sentinel Lock") specific animations */
        .red-radar-sweep {
          animation: orbit-rotate-cw-kf 3.5s linear infinite;
          transform-origin: 172px 172px;
          will-change: transform;
        }

        .red-target-brackets {
          animation: red-brackets-pulse-kf 2s ease-in-out infinite alternate;
          transform-origin: 172px 172px;
        }

        @keyframes red-brackets-pulse-kf {
          0% {
            transform: scale(0.97);
            opacity: 0.55;
          }
          100% {
            transform: scale(1.02);
            opacity: 0.95;
          }
        }

        .red-indicator-blink-1 { animation: red-indicator-blink-kf 2s step-start infinite; }
        .red-indicator-blink-2 { animation: red-indicator-blink-kf 2s step-start 0.7s infinite; }
        .red-indicator-blink-3 { animation: red-indicator-blink-kf 2s step-start 1.4s infinite; }
        
        @keyframes red-indicator-blink-kf {
          0%, 100% { fill: rgba(239, 68, 68, 0.15); filter: none; }
          50% { fill: #FFEAEA; filter: drop-shadow(0 0 2.5px #EF4444); }
        }

        /* 3D ambient Fusion core glow - completely transparent to avoid background disc */
        .reactor-energy-sphere {
          display: none;
        }

        /* Center Matte Black Core styling (floating body) */
        .reactor-glossy-core {
          position: absolute;
          top: 84px;
          left: 84px;
          width: 132px;
          height: 132px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #141312 0%, #060505 70%, #000000 100%);
          border: 1px solid rgba(255, 255, 255, 0.04);
          box-shadow: 
            inset 0 4px 8px rgba(0, 0, 0, 0.95),
            inset 0 -2px 4px rgba(255, 255, 255, 0.02);
          z-index: 5;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          transition: border-color 0.3s ease;
        }

        .aikav-theme-orange.aikav-active-hover .reactor-glossy-core {
          border-color: rgba(255, 140, 0, 0.25);
        }

        /* Diagonal Glossy Highlight overlay on the core */
        .reactor-gloss-highlight {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 35%, transparent 60%);
          pointer-events: none;
          z-index: 6;
        }

        /* Orbit light rotation (Clockwise at constant speed) */
        .orbit-light-group {
          animation: orbit-rotate-cw-kf 4.0s linear infinite;
          transform-origin: 172px 172px;
          will-change: transform;
        }

        @keyframes orbit-rotate-cw-kf {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Spark trailing loops rotating (subtle or static) */
        .reactor-spark-loop-cw {
          transform-origin: 172px 172px;
        }

        .reactor-spark-loop-ccw {
          transform-origin: 172px 172px;
        }

        @keyframes reactor-rotate-ccw-kf {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* Orange eyes group styling and animations */
        .orange-eyes-group {
          display: flex;
          gap: 16px;
          z-index: 7;
          pointer-events: none;
          will-change: transform;
        }

        .orange-eye {
          width: 10px;
          height: 36px;
          background-color: var(--kav-primary);
          border-radius: 5px;
          filter: drop-shadow(0 0 5px var(--kav-glow)) drop-shadow(0 0 1.5px var(--kav-highlight));
          transition: transform 0.06s cubic-bezier(0.4, 0, 0.2, 1), height 0.06s ease;
          transform-origin: center;
        }

        /* Blink vertical squeeze */
        .blinking-eye-active .orange-eye {
          transform: scaleY(0.06) !important;
        }

        /* Speaking animation: scale vertically around centers */
        .orange-eyes-group.speaking-active .orange-eye {
          animation: orange-eyes-speak-kf 0.16s ease-in-out infinite alternate;
        }

        @keyframes orange-eyes-speak-kf {
          0% {
            transform: scaleY(0.85);
          }
          100% {
            transform: scaleY(1.15);
          }
        }

        /* Thinking State Dashed Ring */
        .reactor-thinking-ring {
          opacity: 0;
          transition: opacity 0.3s ease, stroke 0.3s ease;
          transform-origin: 172px 172px;
          will-change: transform, opacity;
        }

        .reactor-thinking-ring.active {
          opacity: 0.9;
          animation: reactor-rotate-ccw-kf 15s linear infinite;
        }

        /* Wake Up Crown Solar Spikes */
        .reactor-wake-flares {
          transform-origin: 172px 172px;
          animation: orbit-rotate-cw-kf 18s linear infinite;
          will-change: transform;
        }

        .reactor-wake-flares line {
          animation: reactor-wake-pulse-kf 0.4s ease-out infinite alternate;
        }

        @keyframes reactor-wake-pulse-kf {
          0% {
            stroke-width: 1px;
            opacity: 0.35;
          }
          100% {
            stroke-width: 2.5px;
            opacity: 0.9;
            filter: drop-shadow(0 0 3px var(--kav-accent-gold));
          }
        }


        /* Smooth color interpolation transition on all skin components */
        .aikav-svg-frame path, 
        .aikav-svg-frame circle, 
        .aikav-optical-lens div,
        .aikav-energy-sphere,
        .aikav-energy-sphere span,
        .aikav-thruster-trail {
          transition: stroke 0.6s ease, fill 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease, background 0.6s ease, filter 0.6s ease;
        }

        /* 300px Symmetrical container frame */
        .aikav-svg-frame {
          position: relative;
          width: 300px;
          height: 300px;
          flex-shrink: 0;
          transform-style: preserve-3d;
          display: block;
          overflow: visible;
        }

        /* Perfectly Centered 3D Ambient Rear Halo cushion */
        .aikav-svg-frame::before {
          content: "";
          position: absolute;
          width: 280px;
          height: 280px;
          top: 10px;
          left: 10px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--kav-bg-glow-start) 0%, var(--kav-bg-glow-mid) 50%, transparent 80%);
          filter: blur(15px);
          z-index: 0;
          pointer-events: none;
          animation: aikav-halo-breath 6s ease-in-out infinite alternate;
        }

        /* Perfectly Centered SVG gauged rings */
        .aikav-svg-frame svg {
          position: absolute;
          top: -22px;
          left: -22px;
          transition: transform 0.5s, animation-duration 0.5s ease;
          z-index: calc(10 - (2 * var(--j)));
          transform-origin: center;
          width: 344px;
          height: 344px;
          fill: none;
          will-change: transform;
          transform-style: preserve-3d;
        }

        /* -------------------------------------------------------------
           INDEPENDENT SLOW COGNITIVE ROTATIONS (NON-HARMONIC PRIMES)
           ------------------------------------------------------------- */
        
        /* SVG 1 (Outer containment ring: 54s clockwise + subtle glow breath) */
        .aikav-svg-frame svg[style*="--j: 0"] {
          animation: aikav-rotate-clockwise 54s linear infinite, aikav-outer-glow-breath 4.5s ease-in-out infinite;
          opacity: 0.55;
        }

        /* SVG 2 (Outer segment reactor coils: 26s clockwise) */
        .aikav-svg-frame svg[style*="--j: 1"] {
          animation: aikav-rotate-clockwise 26s linear infinite;
          opacity: 0.65;
          filter: drop-shadow(0 0 6px var(--kav-eye-glow)); /* Glowing accent */
        }

        /* SVG 3 (Technical gauges / ticks: 82s counter-clockwise) */
        .aikav-svg-frame svg[style*="--j: 2"] {
          animation: aikav-rotate-counter-clockwise 82s linear infinite;
          opacity: 0.7;
          filter: drop-shadow(0 0 4px var(--kav-primary-alpha30));
        }
        
        /* out3 - elegant secondary accent highlights: 72s counter-clockwise */
        .aikav-svg-frame #out3 {
          stroke: var(--kav-secondary) !important;
          opacity: 0.9;
          filter: drop-shadow(0 0 8px var(--kav-secondary-glow));
          animation: aikav-rotate-counter-clockwise 72s linear infinite;
          transform-origin: center;
        }

        /* SVG 4 (Inner segmented markings ring: 120s counter-clockwise slow drift) */
        .aikav-svg-frame svg[style*="--j: 3"] {
          animation: aikav-rotate-counter-clockwise 120s linear infinite;
          opacity: 0.75;
          filter: drop-shadow(0 0 5px var(--kav-primary-alpha30));
        }

        /* SVG 5 (HUD center details: 40s clockwise) */
        .aikav-svg-frame svg[style*="--j: 4"] {
          animation: aikav-rotate-clockwise 40s linear infinite;
          opacity: 0.95;
          filter: drop-shadow(0 0 6px var(--kav-primary-alpha30)); /* Primary glow shadow */
        }
        
        /* Hide static HUD center circles and calibration ticks from SVG 5 to keep the lens clean */
        .aikav-svg-frame #center1,
        .aikav-svg-frame #center,
        .aikav-svg-frame #sensor-micro-details {
          display: none !important;
          opacity: 0 !important;
        }

        /* Volumetric Plasma Filaments animation */
        .aikav-svg-frame #plasma-filaments path {
          animation: aikav-filament-drift 5s ease-in-out infinite alternate;
          transform-origin: center;
        }

        /* Rotations */
        @keyframes aikav-rotate-clockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes aikav-rotate-counter-clockwise {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* Outer ring glow breathing: subtle 10-15% increase */
        @keyframes aikav-outer-glow-breath {
          0%, 100% {
            filter: drop-shadow(0 0 4px var(--kav-primary-alpha25));
          }
          50% {
            filter: drop-shadow(0 0 8px var(--kav-primary-alpha38));
          }
        }

        /* -------------------------------------------------------------
           VOLUMETRIC FLUID PLASMA ENGINE (100% SYMMETRICAL GLOW)
           ------------------------------------------------------------- */
        .aikav-energy-sphere {
          position: absolute;
          top: 102px;
          left: 102px;
          border-radius: 50%;
          height: 96px;
          width: 96px;
          animation: aikav-rotate-sphere 12s linear infinite, aikav-shimmer-sweep 15s ease-in-out infinite;
          background: radial-gradient(circle at center, var(--kav-primary-alpha15) 0%, var(--kav-bg-glow-mid) 50%, transparent 100%);
          z-index: 1;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Perfectly Symmetrical Radial Energy Layers (Capped Blur) */
        .aikav-energy-sphere span {
          position: absolute;
          border-radius: 50%;
          height: 100%;
          width: 100%;
        }

        .aikav-energy-sphere span:nth-of-type(1) {
          background: radial-gradient(circle, var(--kav-primary-alpha22) 0%, var(--kav-bg-glow-mid) 50%, transparent 80%);
          filter: blur(6px);
          animation: aikav-span-breath 5s ease-in-out infinite alternate;
        }

        .aikav-energy-sphere span:nth-of-type(2) {
          background: radial-gradient(circle, var(--kav-secondary-alpha18) 0%, var(--kav-primary-alpha12) 50%, transparent 80%);
          filter: blur(12px);
          animation: aikav-span-breath 4.2s ease-in-out infinite alternate;
          opacity: 0.8;
        }

        .aikav-energy-sphere span:nth-of-type(3) {
          background: radial-gradient(circle, var(--kav-bg-glow-start) 0%, var(--kav-secondary-alpha08) 60%, transparent 80%);
          filter: blur(20px);
          animation: aikav-span-breath 6.2s ease-in-out infinite alternate;
          opacity: 0.6;
        }

        .aikav-energy-sphere span:nth-of-type(4) {
          background: radial-gradient(circle, var(--kav-primary-alpha18) 0%, var(--kav-bg-glow-mid) 60%, transparent 80%);
          filter: blur(24px);
          animation: aikav-span-breath 5.2s ease-in-out infinite alternate;
          opacity: 0.4;
        }

        /* -------------------------------------------------------------
           PREMIUM RECESSED AI OPTICAL LENS
           ------------------------------------------------------------- */
        .aikav-optical-lens {
          position: absolute;
          top: 112px;
          left: 112px;
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 12;
        }

        /* Large recessed black circular lens with deep inset shadows & radial layers */
        .aikav-lens-aperture {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: radial-gradient(circle at center, #07070b 0%, #010102 70%, #000000 100%);
          border: solid 2px var(--kav-primary-alpha90);
          box-shadow: 
            0 0 10px var(--kav-glow),
            inset 0 5px 10px rgba(0, 0, 0, 0.98),
            inset 0 -2px 5px rgba(255, 255, 255, 0.07),
            inset 0 0 16px rgba(0, 0, 0, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: transform 0.06s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease;
        }

        /* Micro Engineering Details (alignment cardinal notches) */
        .aikav-lens-tick {
          position: absolute;
          background-color: var(--kav-primary-alpha25);
          pointer-events: none;
          z-index: 8;
        }

        .tick-n {
          width: 1px;
          height: 4px;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
        }

        .tick-s {
          width: 1px;
          height: 4px;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
        }

        .tick-e {
          width: 4px;
          height: 1px;
          right: 2px;
          top: 50%;
          transform: translateY(-50%);
        }

        .tick-w {
          width: 4px;
          height: 1px;
          left: 2px;
          top: 50%;
          transform: translateY(-50%);
        }

        /* Fixed Lens Reflections (Cyan & White specular reflections) */
        .aikav-lens-reflection {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 10;
        }

        .reflection-white {
          width: 3px;
          height: 3px;
          background-color: rgba(255, 255, 255, 0.4);
          top: 14px;
          left: 14px;
          filter: blur(0.2px);
        }

        .reflection-cyan {
          width: 7px;
          height: 3px;
          background: linear-gradient(135deg, var(--kav-primary-alpha15) 0%, transparent 100%);
          transform: rotate(-35deg);
          top: 12px;
          left: 16px;
          filter: blur(0.5px);
        }

        /* Secondary accent arc segment bordering right side */
        .aikav-violet-accent {
          position: absolute;
          width: 69px;
          height: 69px;
          border-radius: 50%;
          border: solid 2.5px transparent;
          border-top-color: var(--kav-secondary-alpha35);
          border-right-color: var(--kav-secondary-alpha35);
          transform: rotate(-15deg);
          pointer-events: none;
          z-index: 9;
          filter: drop-shadow(0 0 4px var(--kav-secondary-alpha25));
        }

        /* Pupil container translated by cursor LERP */
        .aikav-pupil-container {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }

        /* Small glowing pupil wrapper for blink transitions */
        .aikav-pupil {
          position: relative;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.06s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Pupil Emitter: Gradient & slow low-intensity heartbeat keyframe */
        .aikav-pupil-emitter {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, var(--kav-highlight) 0%, var(--kav-primary) 45%, var(--kav-primary-dark) 100%);
          box-shadow: 
            0 0 6px var(--kav-primary-alpha60),
            0 0 11px var(--kav-eye-glow);
          animation: aikav-heartbeat 9.5s ease-in-out infinite;
        }

        /* Tiny white specular highlight inside the pupil */
        .aikav-specular {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background-color: #ffffff;
          top: 2.5px;
          left: 2.5px;
          z-index: 5;
        }

        /* Heartbeat cycle: scale +1.05 and brightens emitter */
        @keyframes aikav-heartbeat {
          0%, 93%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          96% {
            transform: scale(1.05);
            filter: brightness(1.15);
          }
        }

        /* -------------------------------------------------------------
           MECHANICAL APERTURE BLINK TRANSITIONS
           ------------------------------------------------------------- */
        
        /* Shutter Ellipse Compression (ScaleY) on aperture */
        .aikav-optical-lens.aikav-recalibrating .aikav-lens-aperture {
          transform: scaleY(0.06);
          box-shadow: 
            0 0 4px rgba(0, 255, 255, 0.3),
            inset 0 0 12px rgba(0, 0, 0, 0.98);
        }

        /* Smooth pupil shrinking inside the contracting aperture */
        .aikav-optical-lens.aikav-recalibrating .aikav-pupil {
          transform: scale(0.18);
        }

        /* -------------------------------------------------------------
           FIRST LOAD WAKE-UP SEQUENCE STYLES
           ------------------------------------------------------------- */
        
        /* Step 1: Dim core, static paused rings, closed aperture, hidden pupil */
        .aikav-wake-step-1 .aikav-svg-frame {
          opacity: 0.25;
          filter: brightness(0.4) blur(1px);
        }
        .aikav-wake-step-1 svg {
          animation-play-state: paused !important;
        }
        .aikav-wake-step-1 .aikav-lens-aperture {
          transform: scaleY(0.06) !important;
        }
        .aikav-wake-step-1 .aikav-pupil {
          transform: scale(0) !important;
          opacity: 0 !important;
        }

        /* Step 2: Pupil visible/powered on inside closed aperture, rings paused */
        .aikav-wake-step-2 .aikav-svg-frame {
          opacity: 0.55;
          filter: brightness(0.7) blur(0.5px);
          transition: opacity 0.6s ease, filter 0.6s ease;
        }
        .aikav-wake-step-2 svg {
          animation-play-state: paused !important;
        }
        .aikav-wake-step-2 .aikav-lens-aperture {
          transform: scaleY(0.06) !important;
        }
        .aikav-wake-step-2 .aikav-pupil {
          transform: scale(1) !important;
          opacity: 1 !important;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
        }

        /* Step 3: Rings start spinning, outer glow appears, lens still closed */
        .aikav-wake-step-3 .aikav-svg-frame {
          opacity: 1;
          filter: brightness(1);
          transition: opacity 0.6s ease, filter 0.6s ease;
        }
        .aikav-wake-step-3 .aikav-lens-aperture {
          transform: scaleY(0.06) !important;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Steps 4, 5, 6: Lens opens */
        .aikav-wake-step-4 .aikav-lens-aperture,
        .aikav-wake-step-5 .aikav-lens-aperture,
        .aikav-wake-step-6 .aikav-lens-aperture {
          transform: scaleY(1);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Start-of-hover micro acknowledgement pulse (250ms, scale +4%) */
        .aikav-hover-pulse {
          animation: aikav-micro-pulse-keyframes 0.25s ease-out !important;
        }
        @keyframes aikav-micro-pulse-keyframes {
          0% {
            transform: scale(1);
            filter: brightness(1);
          }
          40% {
            transform: scale(1.04);
            filter: brightness(1.1);
          }
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
        }

        /* Keyframes */
        @keyframes aikav-rotate-sphere {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes aikav-span-breath {
          0% {
            opacity: 0.3;
            transform: scale(0.95);
          }
          100% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes aikav-halo-breath {
          0% {
            opacity: 0.5;
            transform: scale(0.93);
          }
          100% {
            opacity: 0.9;
            transform: scale(1.07);
          }
        }

        /* Periodic cognitive shimmer sweep */
        @keyframes aikav-shimmer-sweep {
          0% { filter: brightness(1); }
          44% { filter: brightness(1); }
          47% { filter: brightness(1.12) contrast(1.03); }
          50% { filter: brightness(1); }
          100% { filter: brightness(1); }
        }

        /* Morphing electrical filament animation keyframes */
        @keyframes aikav-filament-drift {
          0% {
            opacity: 0.25;
            transform: rotate(0deg) scale(0.95);
            stroke-width: 0.5px;
          }
          50% {
            opacity: 0.7;
            transform: rotate(180deg) scale(1.05);
            stroke-width: 0.75px;
          }
          100% {
            opacity: 0.35;
            transform: rotate(360deg) scale(0.95);
            stroke-width: 0.5px;
          }
        }

        /* -------------------------------------------------------------
           LIGHTWEIGHT SINGLE CSS WARP THRUSTER TRAIL
           ------------------------------------------------------------- */
        .aikav-thruster-trail {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 140px;
          height: 48px;
          margin-top: -24px;
          margin-left: -70px;
          border-radius: 50%;
          background: radial-gradient(ellipse at right center, rgba(0, 255, 255, 0.85) 0%, rgba(6, 182, 212, 0.45) 35%, rgba(37, 99, 235, 0.15) 70%, transparent 100%);
          filter: blur(8px);
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transform-origin: center right;
          transition: opacity 120ms ease-out, transform 120ms ease-out;
          will-change: transform, opacity;
        }

        .aikav-thruster-active {
          opacity: 1;
          animation: aikav-thruster-pulse 200ms ease-out forwards;
        }

        @keyframes aikav-thruster-pulse {
          0% {
            opacity: 0;
            transform: rotate(var(--trail-angle, 135deg)) translate(20px, 0) scaleX(0.3) scaleY(0.5);
          }
          35% {
            opacity: 0.95;
            transform: rotate(var(--trail-angle, 135deg)) translate(-40px, 0) scaleX(1.15) scaleY(1.0);
          }
          100% {
            opacity: 0;
            transform: rotate(var(--trail-angle, 135deg)) translate(-80px, 0) scaleX(1.4) scaleY(0.3);
          }
        }

        /* Temporary CSS ring rotation speed boost (~2x speed) */
        .aikav-rings-boosted svg {
          transition: animation-duration 120ms ease-in-out !important;
        }

        .aikav-rings-boosted svg[style*="--j: 0"] {
          animation-duration: 27s !important;
        }

        .aikav-rings-boosted svg[style*="--j: 1"] {
          animation-duration: 13s !important;
        }

        .aikav-rings-boosted svg[style*="--j: 2"] {
          animation-duration: 41s !important;
        }

        .aikav-rings-boosted #out3 {
          animation-duration: 36s !important;
        }

        .aikav-rings-boosted svg[style*="--j: 3"] {
          animation-duration: 60s !important;
        }

        .aikav-rings-boosted svg[style*="--j: 4"] {
          animation-duration: 20s !important;
        }

        /* 10% Flight Glow Boost */
        .aikav-glow-boosted .aikav-svg-frame::before {
          filter: blur(18px) brightness(1.2) !important;
          opacity: 0.95 !important;
          transition: filter 150ms ease-out, opacity 150ms ease-out;
        }

        /* -------------------------------------------------------------
           PREMIUM PINK HALO SKIN (PINK THEME ONLY)
           ------------------------------------------------------------- */

        .aikav-pink-skin-container {
          position: absolute;
          inset: 0;
          width: 300px;
          height: 300px;
          transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          opacity: 0;
        }

        .aikav-theme-pink .aikav-pink-skin-container {
          opacity: 1;
          pointer-events: auto;
        }

        /* Ambient Pink Glow */
        .aikav-theme-pink .aikav-svg-frame::before {
          background: radial-gradient(circle, rgba(255, 79, 216, 0.25) 0%, rgba(255, 79, 216, 0.05) 50%, transparent 80%) !important;
          animation: aikav-halo-breath 6s ease-in-out infinite alternate;
        }

        /* Rotating SVGs inside Pink Skin */
        .aikav-theme-pink .pink-rotate-cw {
          animation: aikav-rotate-clockwise 24s linear infinite;
          transform-origin: 172px 172px;
        }
        .aikav-theme-pink .pink-rotate-ccw {
          animation: aikav-rotate-counter-clockwise 30s linear infinite;
          transform-origin: 172px 172px;
        }
        .aikav-theme-pink .pink-rotate-ccw-slow {
          animation: aikav-rotate-counter-clockwise 45s linear infinite;
          transform-origin: 172px 172px;
        }

        /* Glow Breath animation for outer paths */
        .aikav-theme-pink .pink-glow-breath {
          animation: aikav-pink-glow-breath-kf 4s ease-in-out infinite alternate;
        }
        @keyframes aikav-pink-glow-breath-kf {
          0%, 100% {
            filter: drop-shadow(0 0 5px rgba(255, 79, 216, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 11px rgba(255, 79, 216, 0.85));
          }
        }

        /* Scanning Sweep line */
        .aikav-theme-pink .pink-scan-sweep {
          animation: aikav-pink-scan-move-kf 5s linear infinite;
        }
        @keyframes aikav-pink-scan-move-kf {
          from { stroke-dashoffset: 691; }
          to { stroke-dashoffset: 0; }
        }

        /* Matte Black Body (Static, float/breath only) */
        .aikav-pink-body {
          position: absolute;
          top: 95px;
          left: 95px;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: radial-gradient(circle at center, #0e0e0e 0%, #050505 70%, #000000 100%);
          border: 1px solid rgba(255, 79, 216, 0.25);
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.95),
            inset 0 4px 10px rgba(255, 255, 255, 0.05),
            inset 0 -4px 8px rgba(0, 0, 0, 0.85),
            0 0 15px rgba(255, 79, 216, 0.1);
          z-index: 5;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          animation: aikav-pink-body-breath 5s ease-in-out infinite alternate;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .aikav-theme-pink.aikav-active-hover .aikav-pink-body {
          border-color: rgba(255, 79, 216, 0.55);
          box-shadow: 
            0 12px 36px rgba(0, 0, 0, 0.95),
            inset 0 4px 10px rgba(255, 255, 255, 0.08),
            0 0 25px rgba(255, 79, 216, 0.3);
        }

        @keyframes aikav-pink-body-breath {
          0% {
            transform: translateY(2px) scale(0.98);
          }
          100% {
            transform: translateY(-4px) scale(1.02);
          }
        }

        .aikav-pink-glass {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 60%);
          pointer-events: none;
          z-index: 6;
        }

        /* High-tech Camera Eyes Layout */
        .aikav-pink-eyes-container {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          z-index: 7;
          pointer-events: none;
        }

        .aikav-pink-eye {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;
          transition: transform 0.06s linear;
        }

        /* Miniature Lens Aperture for Pink Eye */
        .aikav-pink-eye .eye-lens-aperture {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: radial-gradient(circle at center, #07070b 0%, #000000 100%);
          border: 1px solid rgba(255, 79, 216, 0.35);
          box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.8),
            0 0 6px rgba(255, 79, 216, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: transform 0.12s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .aikav-pink-eye .eye-outer-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 0.6px dashed rgba(255, 79, 216, 0.55);
          animation: aikav-hud-crawl-cw 10s linear infinite;
        }

        .aikav-pink-eye .eye-concentric-1 {
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          border: 0.5px dashed rgba(255, 79, 216, 0.25);
        }

        .aikav-pink-eye .eye-concentric-2 {
          position: absolute;
          inset: 3.5px;
          border-radius: 50%;
          border: 0.5px solid rgba(255, 79, 216, 0.15);
          background: radial-gradient(circle, rgba(255, 79, 216, 0.04) 0%, transparent 75%);
        }

        /* Cardinal points for Pink Eye */
        .aikav-pink-eye .eye-lens-tick {
          position: absolute;
          background-color: rgba(255, 79, 216, 0.5);
          pointer-events: none;
          z-index: 5;
        }
        .aikav-pink-eye .tick-n { width: 0.8px; height: 2px; top: 1px; left: 50%; transform: translateX(-50%); }
        .aikav-pink-eye .tick-s { width: 0.8px; height: 2px; bottom: 1px; left: 50%; transform: translateX(-50%); }
        .aikav-pink-eye .tick-e { width: 2px; height: 0.8px; right: 1px; top: 50%; transform: translateY(-50%); }
        .aikav-pink-eye .tick-w { width: 2px; height: 0.8px; left: 1px; top: 50%; transform: translateY(-50%); }

        /* Rotating inner segments inside eye */
        .aikav-pink-eye .eye-rotating-inner-segment-cw {
          position: absolute;
          inset: 4.5px;
          border-radius: 50%;
          border: 0.8px solid transparent;
          border-top-color: rgba(255, 79, 216, 0.45);
          border-right-color: rgba(255, 79, 216, 0.45);
          animation: aikav-hud-crawl-cw 7s linear infinite;
        }

        .aikav-pink-eye .eye-rotating-inner-segment-ccw {
          position: absolute;
          inset: 6px;
          border-radius: 50%;
          border: 0.8px solid transparent;
          border-bottom-color: rgba(255, 79, 216, 0.3);
          border-left-color: rgba(255, 79, 216, 0.3);
          animation: aikav-hud-crawl-ccw 9s linear infinite;
        }

        /* Specular reflections for Pink Eye */
        .aikav-pink-eye .eye-lens-reflection {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 6;
        }
        .aikav-pink-eye .reflection-white {
          width: 1.5px;
          height: 1.5px;
          background-color: rgba(255, 255, 255, 0.5);
          top: 5px;
          left: 5px;
          filter: blur(0.1px);
        }
        .aikav-pink-eye .reflection-pink {
          width: 3px;
          height: 1.5px;
          background: linear-gradient(135deg, rgba(255, 79, 216, 0.35) 0%, transparent 100%);
          transform: rotate(-35deg);
          top: 4px;
          left: 6px;
          filter: blur(0.2px);
        }

        /* Pupil Tracking Container */
        .aikav-pink-eye .eye-pupil-container {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }

        .aikav-pink-eye .eye-pupil {
          position: relative;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .aikav-pink-eye .eye-pupil-emitter {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #ffffff 0%, #ff8ae7 50%, #be185d 100%);
          box-shadow: 0 0 4px rgba(255, 79, 216, 0.85);
          animation: aikav-pink-eye-pulse-kf 3s ease-in-out infinite alternate;
        }

        @keyframes aikav-pink-eye-pulse-kf {
          0% {
            filter: brightness(0.9);
            box-shadow: 0 0 3px rgba(255, 79, 216, 0.7);
          }
          100% {
            filter: brightness(1.2);
            box-shadow: 0 0 8px rgba(255, 79, 216, 1);
          }
        }

        .aikav-pink-eye .eye-specular {
          position: absolute;
          width: 1px;
          height: 1px;
          border-radius: 50%;
          background-color: #ffffff;
          top: 1px;
          left: 1px;
          z-index: 5;
        }

        /* Blink squeeze transition */
        .aikav-pink-eye.blinking .eye-lens-aperture {
          transform: scaleY(0.06) !important;
          box-shadow: 
            0 0 4px rgba(255, 79, 216, 0.3),
            inset 0 0 6px rgba(0, 0, 0, 0.98) !important;
        }
        .aikav-pink-eye.blinking .eye-pupil {
          transform: scale(0.18) !important;
        }

        /* Micro LEDs */
        .pink-led-blink-1 { animation: pink-led-blink-kf 2s step-start infinite; }
        .pink-led-blink-2 { animation: pink-led-blink-kf 2s step-start 0.5s infinite; }
        .pink-led-blink-3 { animation: pink-led-blink-kf 2s step-start 1.0s infinite; }

        @keyframes pink-led-blink-kf {
          0%, 100% { fill: rgba(255, 79, 216, 0.2); }
          50% { fill: #ffffff; filter: drop-shadow(0 0 3px rgba(255, 79, 216, 0.8)); }
        }

        /* -------------------------------------------------------------
           PREMIUM BLACK CAPSULE HUD SKIN (BLACK THEME ONLY)
           ------------------------------------------------------------- */

        .aikav-circle-skin-container,
        .aikav-capsule-skin-container {
          position: absolute;
          inset: 0;
          width: 300px;
          height: 300px;
          transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          opacity: 0;
        }

        .aikav-theme-blue .aikav-circle-skin-container {
          opacity: 1;
          pointer-events: auto;
        }

        .aikav-theme-black .aikav-capsule-skin-container {
          opacity: 1;
          pointer-events: auto;
        }

        .aikav-theme-black .aikav-svg-frame::before {
          opacity: 0 !important;
        }

        .aikav-capsule-skin-container svg {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          transform: none !important;
          animation: none !important;
          z-index: 1 !important;
          fill: none !important;
        }

        .aikav-capsule-wrapper {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;
          width: 300px;
          height: 300px;
        }

        /* Float animation for the entire black theme core */
        .aikav-theme-black {
          animation: aikav-capsule-float 6s ease-in-out infinite alternate;
        }

        @keyframes aikav-capsule-float {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-6px);
          }
        }

        /* Matte Black body with glassmorphic properties & metallic reflection */
        .aikav-capsule-body {
          position: absolute;
          width: 220px;
          height: 80px;
          border-radius: 40px;
          background: linear-gradient(135deg, #080808 0%, #111111 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.8),
            0 0 12px rgba(255, 255, 255, 0.02),
            inset 0 1px 2px rgba(255, 255, 255, 0.2);
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          z-index: 2;
          /* Breathing micro-animation */
          animation: aikav-capsule-breath 4s ease-in-out infinite alternate;
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .aikav-theme-black.aikav-active-hover .aikav-capsule-body {
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 
            0 12px 36px rgba(0, 0, 0, 0.95),
            0 0 18px rgba(0, 243, 255, 0.08),
            inset 0 1px 3px rgba(255, 255, 255, 0.35);
        }

        /* Breathing keyframes */
        @keyframes aikav-capsule-breath {
          0% {
            transform: scale(1.0);
          }
          100% {
            transform: scale(1.02);
          }
        }

        /* Glass specular diagonal sweep glare */
        .aikav-capsule-glass-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 60%, rgba(255, 255, 255, 0.02) 100%);
          pointer-events: none;
        }

        /* Horizontal scanline sweep */
        .aikav-capsule-scanline {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, transparent 5%, rgba(255, 255, 255, 0.5) 50%, transparent 95%);
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
          opacity: 0;
          animation: aikav-capsule-scan-h 5s ease-in-out infinite;
        }

        @keyframes aikav-capsule-scan-h {
          0% { left: 0%; opacity: 0; }
          15% { opacity: 0.5; }
          50% { left: 100%; opacity: 0.5; }
          85% { opacity: 0.5; }
          100% { left: 100%; opacity: 0; }
        }

        /* Symmetrical outer capsule HUD ring animations */
        .aikav-capsule-hud-ring-1 {
          animation: aikav-hud-crawl-dash-cw 30s linear infinite;
        }

        .aikav-capsule-hud-ring-2 {
          animation: aikav-hud-crawl-dash-ccw 45s linear infinite;
        }

        @keyframes aikav-hud-crawl-dash-cw {
          to { stroke-dashoffset: -200; }
        }

        @keyframes aikav-hud-crawl-dash-ccw {
          to { stroke-dashoffset: 200; }
        }

        /* Rotating dial gear animations concentric with caps */
        .aikav-capsule-dial-left {
          animation: aikav-hud-crawl-cw 20s linear infinite;
          transform-origin: 80px 150px;
        }

        .aikav-capsule-dial-right {
          animation: aikav-hud-crawl-ccw 22s linear infinite;
          transform-origin: 220px 150px;
        }

        /* Upper/lower sliding technical rail notches */
        .aikav-capsule-slider-1 {
          animation: aikav-slider-crawl-1 8s ease-in-out infinite alternate;
        }

        .aikav-capsule-slider-2 {
          animation: aikav-slider-crawl-2 11s ease-in-out infinite alternate;
        }

        @keyframes aikav-slider-crawl-1 {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 150; }
        }

        @keyframes aikav-slider-crawl-2 {
          0% { stroke-dashoffset: 150; }
          100% { stroke-dashoffset: 0; }
        }

        /* Neon circuit track crawling pulses */
        .aikav-capsule-circuit-pulse-1 {
          animation: aikav-circuit-pulse 6s linear infinite;
        }

        .aikav-capsule-circuit-pulse-2 {
          animation: aikav-circuit-pulse 8s linear infinite;
        }
        .aikav-capsule-circuit-pulse-3 {
          animation: aikav-circuit-pulse 7s linear infinite;
        }
        .aikav-capsule-circuit-pulse-4 {
          animation: aikav-circuit-pulse 9s linear infinite;
        }

        @keyframes aikav-circuit-pulse {
          0% { stroke-dashoffset: 80; }
          100% { stroke-dashoffset: -80; }
        }

        /* Interactive Circuit Neon coloring on active hover */
        .aikav-theme-black.aikav-active-hover .aikav-capsule-circuit-pulse-1,
        .aikav-theme-black.aikav-active-hover .aikav-capsule-circuit-pulse-2,
        .aikav-theme-black.aikav-active-hover .aikav-capsule-circuit-pulse-3,
        .aikav-theme-black.aikav-active-hover .aikav-capsule-circuit-pulse-4 {
          stroke: #00ffff !important;
          filter: drop-shadow(0 0 3px rgba(0, 255, 255, 0.8));
          transition: stroke 0.3s ease, filter 0.3s ease;
        }

        /* Crawling Dots animations */
        .aikav-dots-crawl-right {
          animation: aikav-crawl-r 4s linear infinite;
        }
        
        .aikav-dots-crawl-left {
          animation: aikav-crawl-l 4s linear infinite;
        }

        @keyframes aikav-crawl-r {
          to { stroke-dashoffset: -20; }
        }

        @keyframes aikav-crawl-l {
          to { stroke-dashoffset: 20; }
        }

        /* Symmetrical miniature high-tech HUD eyes container */
        .aikav-capsule-eyes-container {
          position: absolute;
          top: 110px;
          left: 40px;
          width: 220px;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 3;
          pointer-events: none;
        }

        .aikav-capsule-eye-hud {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;
          transition: transform 0.06s linear;
        }

        .aikav-capsule-eye-hud.eye-left {
          left: 53px;
        }

        .aikav-capsule-eye-hud.eye-right {
          left: 123px;
        }

        /* Miniature Lens Aperture */
        .aikav-capsule-eye-hud .eye-lens-aperture {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: radial-gradient(circle at center, #050508 0%, #000000 100%);
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.8),
            0 0 8px rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: transform 0.12s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease;
        }

        /* Outer HUD dial ring */
        .aikav-capsule-eye-hud .eye-outer-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 0.8px dashed rgba(255, 255, 255, 0.35);
          animation: aikav-hud-crawl-cw 8s linear infinite;
        }

        /* Concentric aperture levels */
        .aikav-capsule-eye-hud .eye-concentric-1 {
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          border: 0.5px dashed rgba(255, 255, 255, 0.15);
        }

        .aikav-capsule-eye-hud .eye-concentric-2 {
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          border: 0.5px solid rgba(255, 255, 255, 0.08);
          background: radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 75%);
        }

        /* Cardinal points */
        .aikav-capsule-eye-hud .eye-lens-tick {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
          z-index: 5;
        }

        .aikav-capsule-eye-hud .tick-n { width: 0.8px; height: 3px; top: 1px; left: 50%; transform: translateX(-50%); }
        .aikav-capsule-eye-hud .tick-s { width: 0.8px; height: 3px; bottom: 1px; left: 50%; transform: translateX(-50%); }
        .aikav-capsule-eye-hud .tick-e { width: 3px; height: 0.8px; right: 1px; top: 50%; transform: translateY(-50%); }
        .aikav-capsule-eye-hud .tick-w { width: 3px; height: 0.8px; left: 1px; top: 50%; transform: translateY(-50%); }

        /* Rotating inner segments inside eye */
        .aikav-capsule-eye-hud .eye-rotating-inner-segment-cw {
          position: absolute;
          inset: 6px;
          border-radius: 50%;
          border: 1px solid transparent;
          border-top-color: rgba(255, 255, 255, 0.25);
          border-right-color: rgba(255, 255, 255, 0.25);
          animation: aikav-hud-crawl-cw 6s linear infinite;
        }

        .aikav-capsule-eye-hud .eye-rotating-inner-segment-ccw {
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          border: 1px solid transparent;
          border-bottom-color: rgba(255, 255, 255, 0.15);
          border-left-color: rgba(255, 255, 255, 0.15);
          animation: aikav-hud-crawl-ccw 8s linear infinite;
        }

        /* Specular reflections */
        .aikav-capsule-eye-hud .eye-lens-reflection {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 6;
        }

        .aikav-capsule-eye-hud .reflection-white {
          width: 2px;
          height: 2px;
          background-color: rgba(255, 255, 255, 0.35);
          top: 8px;
          left: 8px;
          filter: blur(0.1px);
        }

        .aikav-capsule-eye-hud .reflection-cyan {
          width: 4px;
          height: 2px;
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, transparent 100%);
          transform: rotate(-35deg);
          top: 7px;
          left: 9px;
          filter: blur(0.3px);
        }

        /* Pupil Tracking Container */
        .aikav-capsule-eye-hud .eye-pupil-container {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }

        .aikav-capsule-eye-hud .eye-pupil {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Symmetrical white/gray pupil dot with soft bloom */
        .aikav-capsule-eye-hud .eye-pupil-emitter {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #ffffff 0%, #dcdcdc 55%, #555555 100%);
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }

        /* Soft white/gray accent color highlight on active hover */
        .aikav-theme-black.aikav-active-hover .eye-pupil-emitter {
          background: radial-gradient(circle at 35% 35%, #ffffff 0%, #e4e4e7 50%, #a1a1aa 100%);
          box-shadow: 
            0 0 8px rgba(255, 255, 255, 0.85),
            0 0 16px rgba(255, 255, 255, 0.45);
        }

        .aikav-capsule-eye-hud .eye-specular {
          position: absolute;
          width: 1.5px;
          height: 1.5px;
          border-radius: 50%;
          background-color: #ffffff;
          top: 1.5px;
          left: 1.5px;
          z-index: 5;
        }

        /* Blink vertical squeeze transition */
        .aikav-capsule-eye-hud.blinking .eye-lens-aperture {
          transform: scaleY(0.06) !important;
          box-shadow: 
            0 0 4px rgba(255, 255, 255, 0.2),
            inset 0 0 8px rgba(0, 0, 0, 0.95) !important;
        }

        .aikav-capsule-eye-hud.blinking .eye-pupil {
          transform: scale(0.18) !important;
        }

        /* Symmetrical indicator LED blinks */
        .aikav-capsule-indicators {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          z-index: 5;
        }

        .aikav-indicator-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }

        .aikav-indicator-dot.dot-1 { animation: aikav-dot-pulse 2s step-start infinite; }
        .aikav-indicator-dot.dot-2 { animation: aikav-dot-pulse 2s step-start 0.5s infinite; }
        .aikav-indicator-dot.dot-3 { animation: aikav-dot-pulse 2s step-start 1.0s infinite; }
        .aikav-indicator-dot.dot-4 { animation: aikav-dot-pulse 2s step-start 1.5s infinite; }

        @keyframes aikav-dot-pulse {
          0%, 100% { background: rgba(255, 255, 255, 0.18); box-shadow: none; }
          50% { background: #ffffff; box-shadow: 0 0 4px #ffffff; }
        }

        /* Micro industrial tech label markings */
        .aikav-capsule-markings-left,
        .aikav-capsule-markings-right {
          position: absolute;
          bottom: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 5px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.22);
          text-transform: uppercase;
          z-index: 5;
        }

        .aikav-capsule-markings-left { left: 24px; }
        .aikav-capsule-markings-right { right: 24px; }
        .aikav-glow-boosted .aikav-svg-frame::before {
          filter: blur(18px) brightness(1.2) !important;
          opacity: 0.95 !important;
          transition: filter 150ms ease-out, opacity 150ms ease-out;
        }

        /* -------------------------------------------------------------
           PREMIUM PURPLE DYNAMIC PIXEL MATRIX SKIN (PURPLE THEME ONLY)
           ------------------------------------------------------------- */

        .aikav-purple-skin-container {
          position: absolute;
          inset: 0;
          width: 300px;
          height: 300px;
          transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1), transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(0.55);
          transform-origin: center;
        }

        .aikav-theme-purple .aikav-purple-skin-container {
          opacity: 1;
          pointer-events: auto;
        }

        /* Ambient Purple Glow Behind Matrix */
        .aikav-theme-purple .aikav-svg-frame::before {
          background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 80%) !important;
          animation: aikav-halo-breath 6s ease-in-out infinite alternate;
        }

        /* 3D Floating Matrix Wrapper (Inline SVG element) */
        .aikav-pixel-matrix {
          position: absolute;
          top: 50px;
          left: 50px;
          width: 200px;
          height: 200px;
          background: rgba(10, 6, 18, 0.75);
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: 12px;
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.95),
            inset 0 0 16px rgba(168, 85, 247, 0.08),
            0 0 20px rgba(168, 85, 247, 0.1);
          transform-style: preserve-3d;
          perspective: 1000px;
          transition: border-color 0.4s, box-shadow 0.4s, transform 0.1s ease-out;
          will-change: transform;
        }

        .aikav-theme-purple.aikav-active-hover .aikav-pixel-matrix {
          border-color: rgba(168, 85, 247, 0.45);
          box-shadow: 
            0 16px 48px rgba(0, 0, 0, 0.95),
            inset 0 0 24px rgba(168, 85, 247, 0.15),
            0 0 30px rgba(168, 85, 247, 0.25);
        }

        /* Cursor Glow Highlight Overlay */
        .matrix-cursor-highlight {
          opacity: 0;
          transition: opacity 0.3s ease;
          mix-blend-mode: screen;
          pointer-events: none;
        }

        /* Background Pixels inside SVG */
        rect.bg-pixel {
          fill: rgba(60, 20, 100, 0.16);
          stroke: rgba(168, 85, 247, 0.06);
          stroke-width: 0.5px;
          transform-box: fill-box;
          transform-origin: center;
        }

        /* Active face pixels: eyes and mouth */
        rect.pixel-active {
          fill: #c084fc;
          stroke: #e879f9;
          stroke-width: 0.5px;
          filter: drop-shadow(0 0 4px rgba(192, 132, 252, 0.8));
        }

        rect.pixel-accent {
          fill: #ffffff;
          stroke: #ffffff;
          stroke-width: 0.5px;
          filter: drop-shadow(0 0 6px #ffffff);
        }

        /* Scan line sweep layer (Uses GPU transform-only animations) */
        .matrix-scan-line {
          fill: none;
          stroke: rgba(192, 132, 252, 0.35);
          stroke-width: 2px;
          filter: drop-shadow(0 0 6px rgba(192, 132, 252, 0.5));
          opacity: 0.65;
          animation: matrix-scan-sweep 4.5s linear infinite;
          will-change: transform;
          pointer-events: none;
        }

        .aikav-pixel-matrix.state-thinking .matrix-scan-line {
          animation-duration: 2s !important;
          opacity: 0.85;
        }

        @keyframes matrix-scan-sweep {
          0% {
            transform: translate3d(0, -10px, 0);
          }
          100% {
            transform: translate3d(0, 210px, 0);
          }
        }

        /* Eye groups tracking translation */
        .eye-socket-purple {
          transform-box: fill-box;
          transform-origin: center;
          will-change: transform;
        }

        /* Nested blinking group (GPU scaleY only) */
        .eye-blink-purple {
          transform-box: fill-box;
          transform-origin: center;
          transition: transform 0.08s ease-out;
          will-change: transform;
        }

        .eye-blink-purple.blinking {
          transform: scaleY(0.06) !important;
          transition: transform 0.12s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Mouth group layout and speaking procedural animation */
        /* Mouth group layout */
        .aikav-matrix-mouth {
          transform-box: fill-box;
          transform-origin: center;
          transition: transform 0.15s ease-out, opacity 0.3s ease;
          will-change: transform, opacity;
        }

        /* Thinking mode: scatter pixels and hide mouth */
        .aikav-pixel-matrix.state-thinking .aikav-matrix-mouth {
          opacity: 0;
          transform: scale(0);
        }

        .aikav-pixel-matrix.state-thinking rect.bg-pixel {
          animation: svg-thinking-scatter 3.5s ease-in-out infinite alternate;
          animation-delay: calc(var(--rand) * -3.5s);
        }

        @keyframes svg-thinking-scatter {
          0%, 100% {
            transform: translate3d(0, 0, 0);
            fill: rgba(124, 58, 237, 0.24);
            stroke: rgba(168, 85, 247, 0.12);
            filter: brightness(1.0);
          }
          50% {
            transform: translate3d(calc(var(--rand-x) * 11px), calc(var(--rand-y) * 11px), 0);
            fill: rgba(168, 85, 247, 0.35);
            stroke: rgba(192, 132, 252, 0.2);
            filter: brightness(1.3);
          }
        }
`;


const injectCoreStyles = () => {
  if (typeof document !== 'undefined') {
    let styleEl = document.getElementById('aikav-core-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'aikav-core-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = CORE_STYLES;
  }
};

// Ensure styles are injected once globally on module load
injectCoreStyles();

const AIKAVCore = ({ 
  size = 320, 
  className = '', 
  style = {}, 
  lookAway = false,
  forceBlink = false,
  lookDirection = null,
  isMoving = false,
  ringSpeedBoost = false,
  thrusterActive = false,
  thrusterAngle = 135,
  glowBoost = false,
  isSpeaking = false
}) => {
  const { theme } = useTheme();
  const scale = size / 300;
  const wrapperRef = useRef(null);
  const circlePupilRef = useRef(null);
  const orangePupilRef = useRef(null);
  const greenPupilRef = useRef(null);
  const redPupilRef = useRef(null);
  const capsulePupilsRef = useRef([]);
  const hudRef = useRef(null);
  const pinkPupilsRef = useRef([]);
  const pinkHudRef = useRef(null);
  const purplePupilsRef = useRef([]);
  const purpleMatrixRef = useRef(null);
  const purpleGlowRef = useRef(null);
  const isTrackingPausedRef = useRef(false);
  const [isBlinking, setIsBlinking] = useState(false);
  
  // Lazy initial state prevents mount-time setWakeUpStep re-render pass
  const [wakeUpStep, setWakeUpStep] = useState(() => {
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('aikav-woke')) {
      return 1;
    }
    return 0;
  });
  const wakeUpStepRef = useRef(wakeUpStep);
  wakeUpStepRef.current = wakeUpStep;

  const lastMouseMoveTimeRef = useRef(performance.now());

  // Hover awareness & controlled transition states
  const [isHovered, setIsHovered] = useState(false);
  const [isHoverPulsing, setIsHoverPulsing] = useState(false);
  const isHoveredRef = useRef(false);
  const lookAwayRef = useRef(lookAway);
  const lookDirectionRef = useRef(lookDirection);
  const isMovingRef = useRef(isMoving);

  // Directly sync state & props with mutable refs for requestAnimationFrame tracking loop
  isHoveredRef.current = isHovered;
  lookAwayRef.current = lookAway;
  lookDirectionRef.current = lookDirection;
  isMovingRef.current = isMoving;
  const lastPupilPosRef = useRef({ x: '', y: '' });

  // Safety fallback to ensure styles are attached
  useEffect(() => {
    injectCoreStyles();
  }, []);

  // Controlled single blink trigger during transition pre-movement
  useEffect(() => {
    if (forceBlink) {
      setIsBlinking(true);
      isTrackingPausedRef.current = true;
      const t1 = setTimeout(() => {
        setIsBlinking(false);
        const t2 = setTimeout(() => {
          isTrackingPausedRef.current = false;
        }, 60);
      }, 120);
      return () => {
        clearTimeout(t1);
      };
    }
  }, [forceBlink]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsHoverPulsing(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsHoverPulsing(false);
  };

  // Reset micro pulse acknowledgement after 250ms
  useEffect(() => {
    if (isHoverPulsing) {
      const timer = setTimeout(() => setIsHoverPulsing(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isHoverPulsing]);

  // Timed session-gated Wake-up sequence on first page load (no mount re-render)
  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('aikav-woke')) {
      sessionStorage.setItem('aikav-woke', 'true');

      const t1 = setTimeout(() => setWakeUpStep(2), 600);  // Step 2: Pupil powers on (visible inside slit)
      const t2 = setTimeout(() => setWakeUpStep(3), 1200); // Step 3: Rings start spinning, outer glow appears
      const t3 = setTimeout(() => setWakeUpStep(4), 1600); // Step 4: Lens opens, pupil looks LEFT
      const t4 = setTimeout(() => setWakeUpStep(5), 2100); // Step 5: Pupil looks RIGHT
      const t5 = setTimeout(() => setWakeUpStep(6), 2600); // Step 6: Pupil returns CENTER
      const t6 = setTimeout(() => setWakeUpStep(0), 3000); // Step 0: Wake-up ends, tracking active

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
        clearTimeout(t6);
      };
    }
  }, []);

  // High-performance, scroll-aware LERP pupil cursor tracking & idle focus loop
  useEffect(() => {
    let clientX = null;
    let clientY = null;
    let currentX = 0;
    let currentY = 0;
    let cachedRect = null;
    let isRectDirty = true;

    const handleMouseMove = (e) => {
      clientX = e.clientX;
      clientY = e.clientY;
      lastMouseMoveTimeRef.current = performance.now();
      isRectDirty = true;
    };

    const handleMouseLeaveViewport = (e) => {
      if (!e.relatedTarget) {
        clientX = null;
        clientY = null;
      }
    };

    const handleWindowBlur = () => {
      clientX = null;
      clientY = null;
    };

    const markRectDirty = () => {
      isRectDirty = true;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveViewport);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('resize', markRectDirty, { passive: true });
    window.addEventListener('scroll', markRectDirty, { passive: true, capture: true });

    let animId;
    let startFrameId;

    const updatePosition = () => {
      let targetX = 0;
      let targetY = 0;
      let ease = 0.15;
      const timeMs = performance.now();

      const isCursorActive = clientX !== null && clientY !== null;
      const currentWakeUpStep = wakeUpStepRef.current;
      // Pause cursor tracking during blinks, wake-up sequence, dialogue reaction, relocation movement, or explicit look direction
      const isPaused = isTrackingPausedRef.current || currentWakeUpStep > 0 || lookAwayRef.current || isMovingRef.current || !!lookDirectionRef.current;

      if (!isPaused && isCursorActive && wrapperRef.current) {
        if (isRectDirty || !cachedRect) {
          cachedRect = wrapperRef.current.getBoundingClientRect();
          isRectDirty = false;
        }
        const lensCenterX = cachedRect.left + cachedRect.width / 2;
        const lensCenterY = cachedRect.top + cachedRect.height / 2;

        const dx = clientX - lensCenterX;
        const dy = clientY - lensCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          const dirX = dx / dist;
          const dirY = dy / dist;

          // Proximity Factor: 0 when cursor is at 40px, 1 when cursor is at 180px or further
          const proximityFactor = Math.min(Math.max((dist - 40) / 140, 0), 1);
          
          // Hover Awareness: increase max radius limits by exactly 1px (from 7.5px to 8.5px) when hovered
          const radiusMultiplier = 3.0;
          const baseRadius = 4.5;
          const maxRadius = (baseRadius + proximityFactor * radiusMultiplier) + (isHoveredRef.current ? 1.0 : 0.0);

          const targetDist = Math.min(dist * 0.045, maxRadius);
          targetX = dirX * targetDist;
          targetY = dirY * targetDist;

          // Hover Awareness Easing: track exactly 15% faster when hovered
          const normalEase = 0.11 + proximityFactor * 0.04;
          ease = normalEase * (isHoveredRef.current ? 1.15 : 1.0);

          // Idle Focus Twitch: when cursor is stationary for 2s, perform a tiny 1px autofocus twitch every 15s
          const isStationary = (timeMs - lastMouseMoveTimeRef.current) >= 2000;
          if (isStationary) {
            const cycle = (timeMs / 1000) % 15;
            if (cycle < 1.8) {
              const pulse = Math.sin((cycle * Math.PI) / 1.8); // 0 -> 1 -> 0 rise and fall
              const intervalIndex = Math.floor(timeMs / 15000);
              const angle = (intervalIndex * 115) * (Math.PI / 180);
              targetX += Math.cos(angle) * 1.0 * pulse;
              targetY += Math.sin(angle) * 1.0 * pulse;
            }
          }
        }
      } else if (lookDirectionRef.current) {
        // Pre-movement glance toward relocation destination
        if (lookDirectionRef.current === 'bottom-right') {
          targetX = 6.0;
          targetY = 6.0;
        } else if (lookDirectionRef.current === 'top-left') {
          targetX = -6.0;
          targetY = -6.0;
        } else if (typeof lookDirectionRef.current === 'object') {
          targetX = lookDirectionRef.current.x ?? 0;
          targetY = lookDirectionRef.current.y ?? 0;
        }
        ease = 0.35; // Snappy glance
      } else if (isMovingRef.current) {
        // Hold natural center position during high-speed arc movement
        targetX = 0;
        targetY = 0;
        ease = 0.2;
      } else if (isPaused && currentWakeUpStep > 0) {
        // Wake-up look around calibration timeline steps
        if (currentWakeUpStep === 4) {
          targetX = -6; // Look left
          targetY = 0;
        } else if (currentWakeUpStep === 5) {
          targetX = 6;  // Look right
          targetY = 0;
        } else {
          targetX = 0;  // Center
          targetY = 0;
        }
        ease = 0.08; // Ultra smooth look around speed
      } else if (isPaused && lookAwayRef.current) {
        // Look away briefly during the dialogue joke calibration
        targetX = 7.5; // Look away (e.g. to the right/up)
        targetY = -2;
        ease = 0.22; // Snappy look away
      } else if (!isCursorActive && !isTrackingPausedRef.current) {
        // Idle focus adjustments when cursor is out of viewport: 1.0px correction every 15 seconds
        const cycle = (timeMs / 1000) % 15;
        if (cycle < 1.8) {
          const pulse = Math.sin((cycle * Math.PI) / 1.8);
          const intervalIndex = Math.floor(timeMs / 15000);
          const angle = (intervalIndex * 115) * (Math.PI / 180);
          targetX = Math.cos(angle) * 1.0 * pulse; // Max 1px correction
          targetY = Math.sin(angle) * 1.0 * pulse;
        }
        ease = 0.08; // Smooth idle correction speed
      }

      // Spring interpolation: current += (target - current) * ease
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      const pxStr = currentX.toFixed(2);
      const pyStr = currentY.toFixed(2);

      const hasChanged = lastPupilPosRef.current.x !== pxStr || lastPupilPosRef.current.y !== pyStr;
      if (hasChanged) {
        lastPupilPosRef.current.x = pxStr;
        lastPupilPosRef.current.y = pyStr;
        if (circlePupilRef.current) {
          circlePupilRef.current.style.transform = 'translate(' + pxStr + 'px, ' + pyStr + 'px)';
        }
        if (orangePupilRef.current) {
          orangePupilRef.current.style.transform = 'translate(' + pxStr + 'px, ' + pyStr + 'px)';
        }
        if (greenPupilRef.current) {
          greenPupilRef.current.style.transform = 'translate(' + pxStr + 'px, ' + pyStr + 'px)';
        }
        if (redPupilRef.current) {
          redPupilRef.current.style.transform = 'translate(' + pxStr + 'px, ' + pyStr + 'px)';
        }
        if (capsulePupilsRef.current) {
          capsulePupilsRef.current.forEach(el => {
            if (el) {
              el.style.transform = 'translate(' + pxStr + 'px, ' + pyStr + 'px)';
            }
          });
        }
        if (pinkPupilsRef.current) {
          pinkPupilsRef.current.forEach(el => {
            if (el) {
              el.style.transform = 'translate(' + pxStr + 'px, ' + pyStr + 'px)';
            }
          });
        }
        if (purplePupilsRef.current) {
          purplePupilsRef.current.forEach(el => {
            if (el) {
              el.style.transform = 'translate(' + pxStr + 'px, ' + pyStr + 'px)';
            }
          });
        }
        if (hudRef.current) {
          const hudX = (currentX * -0.15).toFixed(2);
          const hudY = (currentY * -0.15).toFixed(2);
          hudRef.current.style.transform = 'translate(' + hudX + 'px, ' + hudY + 'px)';
        }
        if (pinkHudRef.current) {
          const hudX = (currentX * -0.15).toFixed(2);
          const hudY = (currentY * -0.15).toFixed(2);
          pinkHudRef.current.style.transform = 'translate(' + hudX + 'px, ' + hudY + 'px)';
        }
        if (purpleMatrixRef.current) {
          const rotX = (currentY * -1.5).toFixed(2);
          const rotY = (currentX * 1.5).toFixed(2);
          purpleMatrixRef.current.style.transform = 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
          
          if (purpleGlowRef.current) {
            if (isCursorActive && cachedRect) {
              const rx = ((clientX - cachedRect.left) / cachedRect.width * 100).toFixed(1);
              const ry = ((clientY - cachedRect.top) / cachedRect.height * 100).toFixed(1);
              purpleGlowRef.current.setAttribute('cx', rx + '%');
              purpleGlowRef.current.setAttribute('cy', ry + '%');
              purpleGlowRef.current.style.opacity = '1';
            } else {
              purpleGlowRef.current.style.opacity = '0';
            }
          }
        }
      }

      animId = requestAnimationFrame(updatePosition);
    };

    startFrameId = requestAnimationFrame(() => {
      updatePosition();
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveViewport);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('resize', markRectDirty);
      window.removeEventListener('scroll', markRectDirty, { capture: true });
      cancelAnimationFrame(startFrameId);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Periodic camera aperture mechanical blinks (with nested double blinks)
  useEffect(() => {
    let blinkTimeout;
    let openTimeout;

    const triggerBlink = (isDouble = false) => {
      setIsBlinking(true);
      isTrackingPausedRef.current = true;

      // Close transition: 60ms. Hold: 80ms. Total: 140ms.
      blinkTimeout = setTimeout(() => {
        setIsBlinking(false);

        // Open transition: 60ms. Total: 200ms.
        openTimeout = setTimeout(() => {
          isTrackingPausedRef.current = false;

          // Occasionally perform a double blink (22% chance, only if not already a double)
          const shouldDouble = !isDouble && Math.random() < 0.22;

          if (shouldDouble) {
            const doubleDelay = 150 + Math.random() * 100; // 150-250ms
            blinkTimeout = setTimeout(() => triggerBlink(true), doubleDelay);
          } else {
            // Schedule next standard blink in 4s ± 500ms (3.5s to 4.5s)
            const nextDelay = 3500 + Math.random() * 1000;
            blinkTimeout = setTimeout(() => triggerBlink(false), nextDelay);
          }
        }, 60);
      }, 140);
    };

    // Stagger first blink if wake-up sequence is active on initial load
    const hasWoke = sessionStorage.getItem('aikav-woke');
    const initialDelay = hasWoke ? (3500 + Math.random() * 1000) : (6500 + Math.random() * 1000);
    blinkTimeout = setTimeout(() => triggerBlink(false), initialDelay);

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(openTimeout);
    };
  }, []);

  const wakeUpClass = wakeUpStep > 0 ? ('aikav-wake-step-' + wakeUpStep) : '';
  const activeHoverClass = isHovered ? 'aikav-active-hover' : '';
  const ringSpeedClass = ringSpeedBoost ? 'aikav-rings-boosted' : '';
  const glowBoostClass = glowBoost ? 'aikav-glow-boosted' : '';
  const themeClass = theme === 'black' ? 'aikav-theme-black' : theme === 'pink' ? 'aikav-theme-pink' : theme === 'purple' ? 'aikav-theme-purple' : theme === 'orange' ? 'aikav-theme-orange' : theme === 'green' ? 'aikav-theme-green' : theme === 'red' ? 'aikav-theme-red' : 'aikav-theme-blue';
  const containerClassName = ['aikav-core-wrapper', className, wakeUpClass, activeHoverClass, ringSpeedClass, glowBoostClass, themeClass].filter(Boolean).join(' ');

  return (
    <div
      className={containerClassName}
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        width: size + 'px',
        height: size + 'px',
      }}
    >
      <div
        className="aikav-svg-frame"
        style={{
          transform: 'scale(' + scale + ')',
        }}
      >
        <div className="aikav-circle-skin-container">
          <CircleSkin
            isBlinking={isBlinking}
            isHoverPulsing={isHoverPulsing}
            pupilRef={circlePupilRef}
            theme={theme}
            thrusterActive={thrusterActive}
            thrusterAngle={thrusterAngle}
          />
        </div>
        <div className="aikav-capsule-skin-container">
          <CapsuleSkin
            isBlinking={isBlinking}
            pupilRef={capsulePupilsRef}
            hudRef={hudRef}
            thrusterActive={thrusterActive}
            thrusterAngle={thrusterAngle}
          />
        </div>
        <div className="aikav-pink-skin-container">
          <PinkHaloSkin
            isBlinking={isBlinking}
            pupilRef={pinkPupilsRef}
            hudRef={pinkHudRef}
            thrusterActive={thrusterActive}
            thrusterAngle={thrusterAngle}
          />
        </div>
        <div className="aikav-purple-skin-container">
          <PixelMatrixSkin
            isBlinking={isBlinking}
            pupilRef={purplePupilsRef}
            matrixRef={purpleMatrixRef}
            glowRef={purpleGlowRef}
            isSpeaking={isSpeaking}
            isThinking={isMoving || ringSpeedBoost || glowBoost}
            isHovered={isHovered}
          />
        </div>
        <div className="aikav-orange-skin-container">
          <ReactorSkin
            isBlinking={isBlinking}
            isHoverPulsing={isHoverPulsing}
            pupilRef={orangePupilRef}
            theme={theme}
            thrusterActive={thrusterActive}
            thrusterAngle={thrusterAngle}
            isSpeaking={isSpeaking}
            isThinking={isMoving || ringSpeedBoost || glowBoost}
            wakeUpStep={wakeUpStep}
          />
        </div>
        <div className="aikav-green-skin-container">
          <DNACoreSkin
            isBlinking={isBlinking}
            isHoverPulsing={isHoverPulsing}
            pupilRef={greenPupilRef}
            theme={theme}
            thrusterActive={thrusterActive}
            thrusterAngle={thrusterAngle}
            isSpeaking={isSpeaking}
            isThinking={isMoving || ringSpeedBoost || glowBoost}
            wakeUpStep={wakeUpStep}
          />
        </div>
        <div className="aikav-red-skin-container">
          <SentinelLockSkin
            isBlinking={isBlinking}
            isHoverPulsing={isHoverPulsing}
            pupilRef={redPupilRef}
            theme={theme}
            thrusterActive={thrusterActive}
            thrusterAngle={thrusterAngle}
            isSpeaking={isSpeaking}
            isThinking={isMoving || ringSpeedBoost || glowBoost}
            wakeUpStep={wakeUpStep}
          />
        </div>
      </div>
    </div>
  );
};

const CircleSkin = ({
  isBlinking,
  isHoverPulsing,
  pupilRef,
  theme,
  thrusterActive,
  thrusterAngle
}) => {
  return (
    <>
      {/* Single lightweight CSS radial-gradient warp thruster exhaust trail */}
      <div
        className={'aikav-thruster-trail' + (thrusterActive ? ' aikav-thruster-active' : '')}
        style={{
          '--trail-angle': (thrusterAngle ?? 135) + 'deg',
          transform: 'rotate(' + (thrusterAngle ?? 135) + 'deg)'
        }}
      />
      {/* Volumetric Fluid Plasma Engine */}
      <div className="aikav-energy-sphere">
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* AI Premium Optical Lens Unit (Sibling to Energy Sphere, completely static) */}
      <div className={'aikav-optical-lens' + (isBlinking ? ' aikav-recalibrating' : '')}>
        {/* Violet accent arc segment */}
        <div className="aikav-violet-accent" />
        
        {/* The lens aperture (cyan border, recessed dark gradient face) */}
        <div className="aikav-lens-aperture">
          {/* Cardinal calibration ticks */}
          <div className="aikav-lens-tick tick-n" />
          <div className="aikav-lens-tick tick-e" />
          <div className="aikav-lens-tick tick-s" />
          <div className="aikav-lens-tick tick-w" />

          {/* Fixed Lens Reflections */}
          <div className="aikav-lens-reflection reflection-white" />
          <div className="aikav-lens-reflection reflection-cyan" />
          
          {/* Specular highlight is inside the pupil */}
          <div className="aikav-pupil-container" ref={pupilRef}>
            <div className="aikav-pupil">
              <div className={'aikav-pupil-emitter' + (isHoverPulsing ? ' aikav-hover-pulse' : '')}>
                <div className="aikav-specular" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HUD Ring Layer 1 (Outer Ring out1) */}
      <svg style={{ '--i': 0, '--j': 0 }}>
        <g id="out1">
          <path d="M72 172C72 116.772 116.772 72 172 72C227.228 72 272 116.772 272 172C272 227.228 227.228 272 172 272C116.772 272 72 227.228 72 172ZM197.322 172C197.322 158.015 185.985 146.678 172 146.678C158.015 146.678 146.678 158.015 146.678 172C146.678 185.985 158.015 197.322 172 197.322C185.985 197.322 197.322 185.985 197.322 172Z" />
          <path mask="url(#path-1-inside-1_111_3212)" strokeMiterlimit={16} strokeWidth={2} stroke="var(--kav-primary)" d="M72 172C72 116.772 116.772 72 172 72C227.228 72 272 116.772 272 172C272 227.228 227.228 272 172 272C116.772 272 72 227.228 72 172ZM197.322 172C197.322 158.015 185.985 146.678 172 146.678C158.015 146.678 146.678 158.015 146.678 172C146.678 185.985 158.015 197.322 172 197.322C185.985 197.322 197.322 185.985 197.322 172Z" />
        </g>
      </svg>
 
      {/* HUD Ring Layer 2 (Outer Segmented Reactor Coils) */}
      <svg style={{ '--i': 1, '--j': 1 }}>
        <g id="out2">
          <mask fill="white" id="path-2-inside-2_111_3212">
            <path d="M102.892 127.966C93.3733 142.905 88.9517 160.527 90.2897 178.19L94.3752 177.88C93.1041 161.1 97.3046 144.36 106.347 130.168L102.892 127.966Z" />
            <path d="M93.3401 194.968C98.3049 211.971 108.646 226.908 122.814 237.541L125.273 234.264C111.814 224.163 101.99 209.973 97.2731 193.819L93.3401 194.968Z" />
            <path d="M152.707 92.3592C140.33 95.3575 128.822 101.199 119.097 109.421L121.742 112.55C130.981 104.739 141.914 99.1897 153.672 96.3413L152.707 92.3592Z" />
            <path d="M253.294 161.699C255.099 175.937 253.132 190.4 247.59 203.639L243.811 202.057C249.075 189.48 250.944 175.74 249.23 162.214L253.294 161.699Z" />
            <path d="M172 90.0557C184.677 90.0557 197.18 92.9967 208.528 98.6474C219.875 104.298 229.757 112.505 237.396 122.621L234.126 125.09C226.869 115.479 217.481 107.683 206.701 102.315C195.921 96.9469 184.043 94.1529 172 94.1529V90.0557Z" />
            <path d="M244.195 133.235C246.991 138.442 249.216 143.937 250.83 149.623L246.888 150.742C245.355 145.34 243.242 140.12 240.586 135.174L244.195 133.235Z" />
            <path d="M234.238 225.304C223.932 237.338 210.358 246.126 195.159 250.604C179.961 255.082 163.7 255.058 148.606 250.534L149.775 246.607C164.201 250.905 179.563 250.928 194.001 246.674C208.44 242.42 221.335 234.071 231.126 222.639L234.238 225.304Z" />
          </mask>
          <path mask="url(#path-2-inside-2_111_3212)" fill="var(--kav-primary)" d="M102.892 127.966L105.579 123.75L101.362 121.063L98.6752 125.28L102.892 127.966ZM90.2897 178.19L85.304 178.567L85.6817 183.553L90.6674 183.175L90.2897 178.19ZM94.3752 177.88L94.7529 182.866L99.7386 182.488L99.3609 177.503L94.3752 177.88ZM106.347 130.168L110.564 132.855L113.251 128.638L109.034 125.951L106.347 130.168ZM93.3401 194.968L91.9387 190.168L87.1391 191.569L88.5405 196.369L93.3401 194.968ZM122.814 237.541L119.813 241.54L123.812 244.541L126.813 240.542ZM125.273 234.264L129.272 237.265L132.273 233.266L128.274 230.265L125.273 234.264ZM97.2731 193.819L102.073 192.418L100.671 187.618L95.8717 189.02L97.2731 193.819ZM152.707 92.3592L157.567 91.182L156.389 86.3226L151.53 87.4998L152.707 92.3592ZM119.097 109.421L115.869 105.603L112.05 108.831L115.278 112.649ZM121.742 112.55L117.924 115.778L121.152 119.596L124.97 116.368ZM153.672 96.3413L154.849 101.201L159.708 100.023L158.531 95.1641ZM253.294 161.699L258.255 161.07L257.626 156.11L252.666 156.738L253.294 161.699ZM247.59 203.639L245.66 208.251L250.272 210.182L252.203 205.569ZM243.811 202.057L239.198 200.126L237.268 204.739L241.88 206.669ZM249.23 162.214L248.601 157.253L243.641 157.882L244.269 162.842ZM172 90.0557V85.0557H167V90.0557H172ZM208.528 98.6474L206.299 103.123L206.299 103.123L208.528 98.6474ZM237.396 122.621L240.409 126.611L244.399 123.598L241.386 119.608ZM234.126 125.09L230.136 128.103L233.149 132.093L237.139 129.08ZM206.701 102.315L204.473 106.791L204.473 106.791L206.701 102.315ZM172 94.1529H167V99.1529H172V94.1529ZM244.195 133.235L248.601 130.87L246.235 126.465L241.83 128.83ZM250.83 149.623L252.195 154.433L257.005 153.067L255.64 148.257ZM246.888 150.742L242.078 152.107L243.444 156.917L248.254 155.552ZM240.586 135.174L238.22 130.768L233.815 133.134L236.181 137.539ZM234.238 225.304L238.036 228.556L241.288 224.759L237.491 221.506ZM195.159 250.604L196.572 255.4L196.572 255.4L195.159 250.604ZM148.606 250.534L143.814 249.107L142.386 253.899L147.178 255.326ZM149.775 246.607L151.203 241.816L146.411 240.388L144.983 245.18ZM194.001 246.674L195.415 251.47L195.415 251.47L194.001 246.674ZM231.126 222.639L234.379 218.841L230.581 215.589L227.329 219.386ZM98.6752 125.28C88.5757 141.13 83.8844 159.826 85.304 178.567L95.2754 177.812ZM90.6674 183.175L94.7529 182.866L93.9976 172.895L89.912 173.204L90.6674 183.175ZM99.3609 177.503C98.1715 161.8 102.102 146.135 110.564 132.855ZM109.034 125.951L105.579 123.75L100.205 132.183L103.661 134.385L109.034 125.951ZM88.5405 196.369C93.8083 214.41 104.78 230.259 119.813 241.54L125.815 233.542C112.512 223.558 102.802 209.532 98.1397 193.566L88.5405 196.369ZM126.813 240.542L129.272 237.265L121.274 231.263L118.815 234.54L126.813 240.542ZM128.274 230.265C115.679 220.813 106.486 207.534 102.073 192.418L92.4735 195.221C97.493 212.412 107.948 227.513 122.272 238.263L128.274 230.265ZM95.8717 189.02L91.9387 190.168L94.7415 199.767L98.6745 198.619L95.8717 189.02ZM151.53 87.4998C138.398 90.681 126.188 96.8793 115.869 105.603L122.325 113.239C131.457 105.519 142.262 100.034 153.884 97.2187L151.53 87.4998ZM115.278 112.649L117.924 115.778L125.56 109.322L122.915 106.193L115.278 112.649ZM124.97 116.368C133.616 109.059 143.846 103.866 154.849 101.201L152.495 91.4818C139.981 94.5132 128.347 100.419 118.514 108.732L124.97 116.368ZM158.531 95.1641L157.567 91.182L147.848 93.5364L148.812 97.5185L158.531 95.1641ZM248.334 162.327C250.028 175.697 248.181 189.277 242.978 201.708L252.203 205.569C258.082 191.522 260.169 176.177 258.255 161.07L248.334 162.327ZM249.521 199.027L245.741 197.445L241.88 206.669L245.66 208.251L249.521 199.027ZM248.423 203.987C254.025 190.602 256.014 175.98 254.19 161.585L244.269 162.842C245.873 175.5 244.125 188.357 239.198 200.126L248.423 203.987ZM249.858 167.174L253.923 166.659L252.666 156.738L248.601 157.253L249.858 167.174ZM172 95.0557C183.903 95.0557 195.644 97.8172 206.299 103.123L210.757 94.1717C198.717 88.1761 185.45 85.0557 172 85.0557V95.0557ZM206.299 103.123C216.954 108.429 226.233 116.135 233.406 125.634L241.386 119.608C233.281 108.874 222.796 100.167 210.757 94.1717L206.299 103.123ZM234.383 118.631L231.113 121.1L237.139 129.08L240.409 126.611ZM238.116 122.077C230.393 111.849 220.403 103.552 208.93 97.8393L204.473 106.791C214.56 111.814 223.345 119.11 230.136 128.103L238.116 122.077ZM208.93 97.8393C197.458 92.1263 184.816 89.1529 172 89.1529V99.1529C183.269 99.1529 194.385 101.767 204.473 106.791L208.93 97.8393ZM177 94.1529V90.0557H167V94.1529H177ZM239.79 135.601C242.416 140.49 244.504 145.649 246.02 150.988L255.64 148.257C253.927 142.225 251.567 136.395 248.601 130.87L239.79 135.601ZM249.464 144.813L245.523 145.932L248.254 155.552L252.195 154.433L249.464 144.813ZM251.698 149.376C250.067 143.628 247.818 138.073 244.991 132.808L236.181 137.539C238.666 142.168 240.644 147.052 242.078 152.107L251.698 149.376ZM242.951 139.579L246.561 137.64L241.83 128.83L238.22 130.768ZM230.441 222.051C220.763 233.351 208.017 241.603 193.746 245.808L196.572 255.4ZM193.746 245.808C179.475 250.012 164.291 249.99 150.033 245.742L147.178 255.326C163.289 260.125 180.447 260.151 196.572 255.4L193.746 245.808ZM153.397 251.962L154.567 248.035L144.983 245.18L143.814 249.107L153.397 251.962ZM148.348 251.399C163.7 255.973 180.049 255.997 195.415 251.47L192.588 241.877C179.077 245.858 164.702 245.837 151.203 241.816L148.348 251.399ZM195.415 251.47C210.78 246.942 224.504 238.058 234.924 225.891L227.329 219.386ZM227.874 226.436L230.986 229.101L237.491 221.506L234.379 218.841L227.874 226.436ZM230.441 222.051C220.763 233.351 208.017 241.603 193.746 245.808L196.572 255.4L230.441 222.051Z" />
        </g>
        <path stroke="var(--kav-primary)" d="M240.944 172C240.944 187.951 235.414 203.408 225.295 215.738C215.176 228.068 201.095 236.508 185.45 239.62C169.806 242.732 153.567 240.323 139.5 232.804C125.433 225.285 114.408 213.12 108.304 198.384C102.2 183.648 101.394 167.25 106.024 151.987C110.654 136.723 120.434 123.537 133.696 114.675C146.959 105.813 162.884 101.824 178.758 103.388C194.632 104.951 209.472 111.97 220.751 123.249" id="out3" />
      </svg>
 
      {/* HUD Ring Layer 4 (Inner Ring inner1) */}
      <svg style={{ '--i': 1, '--j': 3 }}>
        <g id="inner1">
          <path fill="var(--kav-primary)" d="M145.949 124.51L148.554 129.259C156.575 124.859 165.672 122.804 174.806 123.331C183.94 123.858 192.741 126.944 200.203 132.236C207.665 137.529 213.488 144.815 217.004 153.261C220.521 161.707 221.59 170.972 220.09 179.997L224.108 180.665L224.102 180.699L229.537 181.607C230.521 175.715 230.594 169.708 229.753 163.795L225.628 164.381C224.987 159.867 223.775 155.429 222.005 151.179C218.097 141.795 211.628 133.699 203.337 127.818C195.045 121.937 185.266 118.508 175.118 117.923C165.302 117.357 155.525 119.474 146.83 124.037C146.535 124.192 146.241 124.349 145.949 124.51ZM224.638 164.522C224.009 160.091 222.819 155.735 221.082 151.563C217.246 142.352 210.897 134.406 202.758 128.634C194.62 122.862 185.021 119.496 175.06 118.922C165.432 118.367 155.841 120.441 147.311 124.914L148.954 127.91C156.922 123.745 165.876 121.814 174.864 122.333C184.185 122.87 193.166 126.019 200.782 131.421C208.397 136.822 214.339 144.257 217.928 152.877C221.388 161.188 222.526 170.276 221.23 179.173L224.262 179.677C224.998 174.671 225.35 169.535 224.638 164.522ZM139.91 220.713C134.922 217.428 130.469 213.395 126.705 208.758L130.983 205.286L130.985 205.288L134.148 202.721C141.342 211.584 151.417 217.642 162.619 219.839C173.821 222.036 185.438 220.232 195.446 214.742L198.051 219.491C197.759 219.651 197.465 219.809 197.17 219.963C186.252 225.693 173.696 227.531 161.577 225.154C154.613 223.789 148.041 221.08 142.202 217.234L139.91 220.713ZM142.752 216.399C148.483 220.174 154.934 222.833 161.769 224.173C173.658 226.504 185.977 224.704 196.689 219.087L195.046 216.09C185.035 221.323 173.531 222.998 162.427 220.82C151.323 218.643 141.303 212.747 134.01 204.122L131.182 206.5C134.451 210.376 138.515 213.607 142.752 216.399Z" fillRule="evenodd" clipRule="evenodd" />
        </g>
      </svg>
 
      {/* HUD Ring Layer 5 (HUD center details + Plasma Filaments) */}
      <svg style={{ '--i': 2, '--j': 4 }}>
        {/* Micro engineering notches & alignment details */}
        <g id="sensor-micro-details" style={{ transformOrigin: 'center' }}>
          <circle cx="172" cy="172" r="38" stroke="var(--kav-primary-alpha25)" strokeWidth="0.5" strokeDasharray="1 3" />
          <circle cx="172" cy="172" r="44" stroke="var(--kav-primary-alpha20)" strokeWidth="0.5" strokeDasharray="6 2" />
          <path d="M142 142 L145 145 M202 142 L199 145 M142 202 L145 199 M202 202 L199 199" stroke="var(--kav-primary-alpha30)" strokeWidth="0.5" />
        </g>
 
        {/* Volumetric Plasma Filaments */}
        <g id="plasma-filaments">
          <path d="M152 172 A 20 20 0 0 1 192 172" stroke="var(--kav-highlight)" strokeWidth="0.5" fill="none" transform="rotate(15 172 172)" />
          <path d="M172 152 A 20 20 0 0 1 172 192" stroke="var(--kav-primary)" strokeWidth="0.5" fill="none" transform="rotate(135 172 172)" />
          <path d="M158 158 A 20 20 0 0 1 186 186" stroke="var(--kav-secondary)" strokeWidth="0.5" fill="none" transform="rotate(255 172 172)" />
        </g>
 
        <path fill="var(--kav-primary)" d="M180.956 186.056C183.849 184.212 186.103 181.521 187.41 178.349C188.717 175.177 189.013 171.679 188.258 168.332C187.503 164.986 185.734 161.954 183.192 159.65C180.649 157.346 177.458 155.883 174.054 155.46C170.649 155.038 167.197 155.676 164.169 157.288C164.169 157.288 164.169 157.288 164.169 157.288ZM172 166.445C175.068 166.445 177.556 168.932 177.556 172C177.556 172 177.556 172 177.556 172ZM172 166.445C175.068 166.445 177.556 168.932 177.556 172C177.556 175.068 175.068 177.556 172 177.556C168.932 177.556 166.444 175.068 166.444 172C166.444 168.932 168.932 166.445 172 166.445Z" id="center" />
      </svg>
    </>
  );
};

const CapsuleSkin = ({
  isBlinking,
  pupilRef,
  hudRef,
  thrusterActive,
  thrusterAngle
}) => {
  return (
    <div className="aikav-capsule-wrapper">
      {/* Thruster exhaust trail (oriented along --trail-angle) */}
      <div
        className={'aikav-thruster-trail' + (thrusterActive ? ' aikav-thruster-active' : '')}
        style={{
          '--trail-angle': (thrusterAngle ?? 135) + 'deg',
          transform: 'rotate(' + (thrusterAngle ?? 135) + 'deg)'
        }}
      />

      {/* SVG HUD Elements (Segmented outer rings, rotating side dials, circuitry, etc.) */}
      <svg
        viewBox="0 0 300 300"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none'
        }}
      >
        {/* Parallax HUD elements container (translated by hudRef) */}
        <g ref={hudRef} style={{ transition: 'transform 0.08s cubic-bezier(0.25, 1, 0.5, 1)' }}>
          {/* Segmented outer capsule HUD ring 1 (creeping white/gray dash) */}
          <rect
            x="24"
            y="99"
            width="252"
            height="102"
            rx="51"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="40 25 15 25 50 30"
            className="aikav-capsule-hud-ring-1"
          />

          {/* Segmented outer capsule HUD ring 2 (creeping dim white/gray dash) */}
          <rect
            x="18"
            y="93"
            width="264"
            height="114"
            rx="57"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="90 140"
            className="aikav-capsule-hud-ring-2"
          />

          {/* Inner alignment capsule border */}
          <rect
            x="36"
            y="106"
            width="228"
            height="88"
            rx="44"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1"
            fill="none"
          />

          {/* Upper Technical Rail Slider Track */}
          <line x1="80" y1="104" x2="220" y2="104" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.8" />
          <line x1="80" y1="104" x2="220" y2="104" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1.2" strokeDasharray="12 138" className="aikav-capsule-slider-1" />

          {/* Lower Technical Rail Slider Track */}
          <line x1="80" y1="196" x2="220" y2="196" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.8" />
          <line x1="80" y1="196" x2="220" y2="196" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1.2" strokeDasharray="12 138" className="aikav-capsule-slider-2" />

          {/* Technical dot crawl arrays at top and bottom */}
          <g stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" strokeDasharray="1 6">
            <line x1="95" y1="92" x2="205" y2="92" className="aikav-dots-crawl-right" />
            <line x1="95" y1="208" x2="205" y2="208" className="aikav-dots-crawl-left" />
          </g>

          {/* Circuit Trace Lines with active hover coloring */}
          {/* Left Circuit 1 */}
          <path
            d="M 30 150 H 55 L 65 140 H 85"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 30 150 H 55 L 65 140 H 85"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="6 60"
            className="aikav-capsule-circuit-pulse-1"
          />
          <circle cx="85" cy="140" r="1.5" fill="rgba(255, 255, 255, 0.3)" />

          {/* Left Circuit 2 */}
          <path
            d="M 30 150 H 50 L 58 158 H 78"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 30 150 H 50 L 58 158 H 78"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="6 60"
            className="aikav-capsule-circuit-pulse-2"
          />
          <circle cx="78" cy="158" r="1.5" fill="rgba(255, 255, 255, 0.3)" />

          {/* Right Circuit 1 */}
          <path
            d="M 270 150 H 245 L 235 160 H 215"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 270 150 H 245 L 235 160 H 215"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="6 60"
            className="aikav-capsule-circuit-pulse-3"
          />
          <circle cx="215" cy="160" r="1.5" fill="rgba(255, 255, 255, 0.3)" />

          {/* Right Circuit 2 */}
          <path
            d="M 270 150 H 250 L 242 142 H 222"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 270 150 H 250 L 242 142 H 222"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="6 60"
            className="aikav-capsule-circuit-pulse-4"
          />
          <circle cx="222" cy="142" r="1.5" fill="rgba(255, 255, 255, 0.3)" />

          {/* Technical tick marks at sides */}
          <path d="M 50 142 V 158 M 54 145 V 155 M 58 147 V 153" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" fill="none" />
          <path d="M 250 142 V 158 M 246 145 V 155 M 242 147 V 153" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" fill="none" />
        </g>

        {/* Rotating Dial elements concentric with capsule cap ends */}
        {/* Left Dial */}
        <g transform="translate(80, 150)" className="aikav-capsule-dial-left">
          <circle r="38" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.8" fill="none" strokeDasharray="3 5" />
          <circle r="34" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" fill="none" strokeDasharray="12 25" />
          <circle r="28" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.8" fill="none" />
        </g>
        {/* Right Dial */}
        <g transform="translate(220, 150)" className="aikav-capsule-dial-right">
          <circle r="38" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.8" fill="none" strokeDasharray="3 5" />
          <circle r="34" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" fill="none" strokeDasharray="12 25" />
          <circle r="28" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.8" fill="none" />
        </g>
      </svg>

      {/* Capsule Body container (breathes) */}
      <div className="aikav-capsule-body">
        {/* Glass specular diagonal sweep glare */}
        <div className="aikav-capsule-glass-overlay" />

        {/* Horizontal scanline */}
        <div className="aikav-capsule-scanline" />

        {/* Micro Indicators */}
        <div className="aikav-capsule-indicators">
          <span className="aikav-indicator-dot dot-1" />
          <span className="aikav-indicator-dot dot-2" />
          <span className="aikav-indicator-dot dot-3" />
          <span className="aikav-indicator-dot dot-4" />
        </div>

        {/* Micro tech markings */}
        <div className="aikav-capsule-markings-left">SYS.ACTIVE</div>
        <div className="aikav-capsule-markings-right">KAV-CORE v4.0.2</div>
      </div>

      {/* Symmetrical miniature high-tech HUD eyes */}
      <div className="aikav-capsule-eyes-container">
        {/* Left AI Eye Camera */}
        <div className={`aikav-capsule-eye-hud eye-left ${isBlinking ? 'blinking' : ''}`}>
          <div className="eye-outer-ring" />
          <div className="eye-lens-aperture">
            <div className="eye-concentric-1" />
            <div className="eye-concentric-2" />
            
            <div className="eye-lens-tick tick-n" />
            <div className="eye-lens-tick tick-s" />
            <div className="eye-lens-tick tick-e" />
            <div className="eye-lens-tick tick-w" />

            <div className="eye-lens-reflection reflection-white" />
            <div className="eye-lens-reflection reflection-cyan" />

            <div className="eye-rotating-inner-segment-cw" />
            <div className="eye-rotating-inner-segment-ccw" />

            <div className="eye-pupil-container" ref={el => { if (pupilRef) pupilRef.current[0] = el; }}>
              <div className="eye-pupil">
                <div className="eye-pupil-emitter">
                  <div className="eye-specular" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right AI Eye Camera */}
        <div className={`aikav-capsule-eye-hud eye-right ${isBlinking ? 'blinking' : ''}`}>
          <div className="eye-outer-ring" />
          <div className="eye-lens-aperture">
            <div className="eye-concentric-1" />
            <div className="eye-concentric-2" />
            
            <div className="eye-lens-tick tick-n" />
            <div className="eye-lens-tick tick-s" />
            <div className="eye-lens-tick tick-e" />
            <div className="eye-lens-tick tick-w" />

            <div className="eye-lens-reflection reflection-white" />
            <div className="eye-lens-reflection reflection-cyan" />

            <div className="eye-rotating-inner-segment-cw" />
            <div className="eye-rotating-inner-segment-ccw" />

            <div className="eye-pupil-container" ref={el => { if (pupilRef) pupilRef.current[1] = el; }}>
              <div className="eye-pupil">
                <div className="eye-pupil-emitter">
                  <div className="eye-specular" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const PinkHaloSkin = ({
  isBlinking,
  pupilRef,
  hudRef,
  thrusterActive,
  thrusterAngle
}) => {
  return (
    <>
      {/* Pink radial-gradient thruster exhaust trail */}
      <div
        className={'aikav-thruster-trail' + (thrusterActive ? ' aikav-thruster-active' : '')}
        style={{
          '--trail-angle': (thrusterAngle ?? 135) + 'deg',
          transform: 'rotate(' + (thrusterAngle ?? 135) + 'deg)',
          background: 'radial-gradient(ellipse at right center, rgba(255, 79, 216, 0.85) 0%, rgba(255, 79, 216, 0.45) 35%, rgba(255, 79, 216, 0.15) 70%, transparent 100%)'
        }}
      />

      {/* SVG HUD Elements (Segmented outer rings, rotating dial, etc.) */}
      <svg
        viewBox="0 0 344 344"
        style={{
          position: 'absolute',
          top: '-22px',
          left: '-22px',
          width: '344px',
          height: '344px',
          overflow: 'visible',
          pointerEvents: 'none'
        }}
      >
        {/* Parallax HUD elements container (translated by hudRef) */}
        <g ref={hudRef} style={{ transition: 'transform 0.08s cubic-bezier(0.25, 1, 0.5, 1)' }}>
          {/* Static calibration crosshairs & text markings */}
          <g stroke="rgba(255, 79, 216, 0.4)" strokeWidth="0.8" fill="none">
            {/* North tick */}
            <line x1="172" y1="20" x2="172" y2="28" />
            {/* South tick */}
            <line x1="172" y1="316" x2="172" y2="324" />
            {/* East tick */}
            <line x1="316" y1="172" x2="324" y2="172" />
            {/* West tick */}
            <line x1="20" y1="172" x2="28" y2="172" />
          </g>

          <g fill="rgba(255, 79, 216, 0.55)" fontSize="6.5" textAnchor="middle" fontFamily="'Space Grotesk', monospace" fontWeight="600">
            <text x="172" y="14">00°</text>
            <text x="334" y="174">90°</text>
            <text x="172" y="337">180°</text>
            <text x="10" y="174">270°</text>
          </g>

          {/* Micro LEDs (random blinking dots) */}
          <g>
            <circle cx="162" cy="286" r="1.5" className="pink-led-blink-1" />
            <circle cx="172" cy="286" r="1.5" className="pink-led-blink-2" />
            <circle cx="182" cy="286" r="1.5" className="pink-led-blink-3" />
          </g>

          {/* HUD Ring Layer 1 (Outer Ring out1 - clockwise) */}
          <g id="out1-pink" className="pink-rotate-cw pink-glow-breath">
            <path strokeWidth={2} stroke="rgba(255, 79, 216, 0.8)" fill="none" d="M72 172C72 116.772 116.772 72 172 72C227.228 72 272 116.772 272 172C272 227.228 227.228 272 172 272C116.772 272 72 227.228 72 172ZM197.322 172C197.322 158.015 185.985 146.678 172 146.678C158.015 146.678 146.678 158.015 146.678 172C146.678 185.985 158.015 197.322 172 197.322C185.985 197.322 197.322 185.985 197.322 172Z" />
          </g>

          {/* HUD Ring Layer 2 (Outer Segmented Reactor Coils - clockwise) */}
          <g id="out2-pink" className="pink-rotate-cw" fill="rgba(255, 79, 216, 0.8)">
            <path d="M102.892 127.966C93.3733 142.905 88.9517 160.527 90.2897 178.19L94.3752 177.88C93.1041 161.1 97.3046 144.36 106.347 130.168L102.892 127.966Z" />
            <path d="M93.3401 194.968C98.3049 211.971 108.646 226.908 122.814 237.541L125.273 234.264C111.814 224.163 101.99 209.973 97.2731 193.819L93.3401 194.968Z" />
            <path d="M152.707 92.3592C140.33 95.3575 128.822 101.199 119.097 109.421L121.742 112.55C130.981 104.739 141.914 99.1897 153.672 96.3413L152.707 92.3592Z" />
            <path d="M253.294 161.699C255.099 175.937 253.132 190.4 247.59 203.639L243.811 202.057C249.075 189.48 250.944 175.74 249.23 162.214L253.294 161.699Z" />
            <path d="M172 90.0557C184.677 90.0557 197.18 92.9967 208.528 98.6474C219.875 104.298 229.757 112.505 237.396 122.621L234.126 125.09C226.869 115.479 217.481 107.683 206.701 102.315C195.921 96.9469 184.043 94.1529 172 94.1529V90.0557Z" />
            <path d="M244.195 133.235C246.991 138.442 249.216 143.937 250.83 149.623L246.888 150.742C245.355 145.34 243.242 140.12 240.586 135.174L244.195 133.235Z" />
            <path d="M234.238 225.304C223.932 237.338 210.358 246.126 195.159 250.604C179.961 255.082 163.7 255.058 148.606 250.534L149.775 246.607C164.201 250.905 179.563 250.928 194.001 246.674C208.44 242.42 221.335 234.071 231.126 222.639L234.238 225.304Z" />
          </g>

          {/* HUD Ring Layer 3 (Technical ticks & scan sweep highlight - counter-clockwise) */}
          <g id="out3-pink" className="pink-rotate-ccw">
            {/* Background broken ring stroke */}
            <path stroke="rgba(255, 79, 216, 0.4)" strokeWidth={1} fill="none" d="M240.944 172C240.944 187.951 235.414 203.408 225.295 215.738C215.176 228.068 201.095 236.508 185.45 239.62C169.806 242.732 153.567 240.323 139.5 232.804C125.433 225.285 114.408 213.12 108.304 198.384C102.2 183.648 101.394 167.25 106.024 151.987C110.654 136.723 120.434 123.537 133.696 114.675C146.959 105.813 162.884 101.824 178.758 103.388C194.632 104.951 209.472 111.97 220.751 123.249" />
            {/* Bright white moving sweep highlight */}
            <path stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" className="pink-scan-sweep" d="M240.944 172C240.944 187.951 235.414 203.408 225.295 215.738C215.176 228.068 201.095 236.508 185.45 239.62C169.806 242.732 153.567 240.323 139.5 232.804C125.433 225.285 114.408 213.12 108.304 198.384C102.2 183.648 101.394 167.25 106.024 151.987C110.654 136.723 120.434 123.537 133.696 114.675C146.959 105.813 162.884 101.824 178.758 103.388C194.632 104.951 209.472 111.97 220.751 123.249" strokeDasharray="50 641" />
          </g>

          {/* HUD Ring Layer 4 (Inner Ring inner1 - counter-clockwise slow) */}
          <g id="inner1-pink" className="pink-rotate-ccw-slow" fill="rgba(255, 79, 216, 0.75)">
            <path d="M145.949 124.51L148.554 129.259C156.575 124.859 165.672 122.804 174.806 123.331C183.94 123.858 192.741 126.944 200.203 132.236C207.665 137.529 213.488 144.815 217.004 153.261C220.521 161.707 221.59 170.972 220.09 179.997L224.108 180.665L224.102 180.699L229.537 181.607C230.521 175.715 230.594 169.708 229.753 163.795L225.628 164.381C224.987 159.867 223.775 155.429 222.005 151.179C218.097 141.795 211.628 133.699 203.337 127.818C195.045 121.937 185.266 118.508 175.118 117.923C165.302 117.357 155.525 119.474 146.83 124.037C146.535 124.192 146.241 124.349 145.949 124.51ZM224.638 164.522C224.009 160.091 222.819 155.735 221.082 151.563C217.246 142.352 210.897 134.406 202.758 128.634C194.62 122.862 185.021 119.496 175.06 118.922C165.432 118.367 155.841 120.441 147.311 124.914L148.954 127.91C156.922 123.745 165.876 121.814 174.864 122.333C184.185 122.87 193.166 126.019 200.782 131.421C208.397 136.822 214.339 144.257 217.928 152.877C221.388 161.188 222.526 170.276 221.23 179.173L224.262 179.677C224.998 174.671 225.35 169.535 224.638 164.522ZM139.91 220.713C134.922 217.428 130.469 213.395 126.705 208.758L130.983 205.286L130.985 205.288L134.148 202.721C141.342 211.584 151.417 217.642 162.619 219.839C173.821 222.036 185.438 220.232 195.446 214.742L198.051 219.491C197.759 219.651 197.465 219.809 197.17 219.963C186.252 225.693 173.696 227.531 161.577 225.154C154.613 223.789 148.041 221.08 142.202 217.234L139.91 220.713ZM142.752 216.399C148.483 220.174 154.934 222.833 161.769 224.173C173.658 226.504 185.977 224.704 196.689 219.087L195.046 216.09C185.035 221.323 173.531 222.998 162.427 220.82C151.323 218.643 141.303 212.747 134.01 204.122L131.182 206.5C134.451 210.376 138.515 213.607 142.752 216.399Z" fillRule="evenodd" clipRule="evenodd" />
          </g>

          {/* HUD Ring Layer 5 (Plasma Filaments & sensor details - clockwise) */}
          <g className="pink-rotate-cw">
            {/* Calibration micro details */}
            <circle cx="172" cy="172" r="38" stroke="rgba(255, 79, 216, 0.35)" strokeWidth="0.5" strokeDasharray="1 3" fill="none" />
            <circle cx="172" cy="172" r="44" stroke="rgba(255, 79, 216, 0.25)" strokeWidth="0.5" strokeDasharray="6 2" fill="none" />
            <path d="M142 142 L145 145 M202 142 L199 145 M142 202 L145 199 M202 202 L199 199" stroke="rgba(255, 79, 216, 0.4)" strokeWidth="0.5" />

            {/* Plasma Filaments */}
            <g id="plasma-filaments-pink" opacity="0.8">
              <path d="M152 172 A 20 20 0 0 1 192 172" stroke="#FFFFFF" strokeWidth="0.5" fill="none" transform="rotate(15 172 172)" />
              <path d="M172 152 A 20 20 0 0 1 172 192" stroke="#FF4FD8" strokeWidth="0.5" fill="none" transform="rotate(135 172 172)" />
              <path d="M158 158 A 20 20 0 0 1 186 186" stroke="#FFFFFF" strokeWidth="0.5" fill="none" transform="rotate(255 172 172)" />
            </g>

            <path fill="rgba(255, 79, 216, 0.85)" d="M180.956 186.056C183.849 184.212 186.103 181.521 187.41 178.349C188.717 175.177 189.013 171.679 188.258 168.332C187.503 164.986 185.734 161.954 183.192 159.65C180.649 157.346 177.458 155.883 174.054 155.46C170.649 155.038 167.197 155.676 164.169 157.288C164.169 157.288 164.169 157.288 164.169 157.288ZM172 166.445C175.068 166.445 177.556 168.932 177.556 172C177.556 172 177.556 172 177.556 172ZM172 166.445C175.068 166.445 177.556 168.932 177.556 172C177.556 175.068 175.068 177.556 172 177.556C168.932 177.556 166.444 175.068 166.444 172C166.444 168.932 168.932 166.445 172 166.445Z" />
          </g>
        </g>
      </svg>

      {/* Static Matte Black Body (with float & breath) */}
      <div className="aikav-pink-body">
        {/* Glass specular sweep glare */}
        <div className="aikav-pink-glass" />

        {/* Symmetrical miniature high-tech AI camera eyes */}
        <div className="aikav-pink-eyes-container">
          {/* Left AI Eye Camera */}
          <div className={`aikav-pink-eye eye-left ${isBlinking ? 'blinking' : ''}`}>
            <div className="eye-outer-ring" />
            <div className="eye-lens-aperture">
              <div className="eye-concentric-1" />
              <div className="eye-concentric-2" />
              
              <div className="eye-lens-tick tick-n" />
              <div className="eye-lens-tick tick-s" />
              <div className="eye-lens-tick tick-e" />
              <div className="eye-lens-tick tick-w" />

              <div className="eye-lens-reflection reflection-white" />
              <div className="eye-lens-reflection reflection-pink" />

              <div className="eye-rotating-inner-segment-cw" />
              <div className="eye-rotating-inner-segment-ccw" />

              <div className="eye-pupil-container" ref={el => { if (pupilRef) pupilRef.current[0] = el; }}>
                <div className="eye-pupil">
                  <div className="eye-pupil-emitter">
                    <div className="eye-specular" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right AI Eye Camera */}
          <div className={`aikav-pink-eye eye-right ${isBlinking ? 'blinking' : ''}`}>
            <div className="eye-outer-ring" />
            <div className="eye-lens-aperture">
              <div className="eye-concentric-1" />
              <div className="eye-concentric-2" />
              
              <div className="eye-lens-tick tick-n" />
              <div className="eye-lens-tick tick-s" />
              <div className="eye-lens-tick tick-e" />
              <div className="eye-lens-tick tick-w" />

              <div className="eye-lens-reflection reflection-white" />
              <div className="eye-lens-reflection reflection-pink" />

              <div className="eye-rotating-inner-segment-cw" />
              <div className="eye-rotating-inner-segment-ccw" />

              <div className="eye-pupil-container" ref={el => { if (pupilRef) pupilRef.current[1] = el; }}>
                <div className="eye-pupil">
                  <div className="eye-pupil-emitter">
                    <div className="eye-specular" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
const MATRIX_GRID_SIZE = 17;
const MATRIX_CENTER = 8;
const GRID_SPACING = 11;
const PIXEL_OFFSET = 8;

const PRECOMPUTED_GRID = (() => {
  const grid = [];
  const isLeftEyeArea = (r, c) => r >= 4 && r <= 6 && c >= 3 && c <= 5;
  const isRightEyeArea = (r, c) => r >= 4 && r <= 6 && c >= 11 && c <= 13;
  const isMouthArea = (r, c) => r === 11 && c >= 6 && c <= 10;

  for (let r = 0; r < MATRIX_GRID_SIZE; r++) {
    for (let c = 0; c < MATRIX_GRID_SIZE; c++) {
      const dx = c - MATRIX_CENTER;
      const dy = r - MATRIX_CENTER;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.sqrt(MATRIX_CENTER * MATRIX_CENTER + MATRIX_CENTER * MATRIX_CENTER);
      const normDist = (dist / maxDist).toFixed(3);
      const isPruned = dist > 8.0;

      if (isLeftEyeArea(r, c) || isRightEyeArea(r, c) || isMouthArea(r, c) || isPruned) {
        grid.push({ isEmpty: true });
      } else {
        const x = PIXEL_OFFSET + c * GRID_SPACING;
        const y = PIXEL_OFFSET + r * GRID_SPACING;
        grid.push({
          x,
          y,
          normDist,
          rand: Math.random().toFixed(2),
          randX: (Math.random() * 2 - 1).toFixed(2),
          randY: (Math.random() * 2 - 1).toFixed(2),
          isEmpty: false
        });
      }
    }
  }
  return grid;
})();

const PixelMatrixSkin = ({
  isBlinking,
  pupilRef,
  matrixRef,
  glowRef,
  isSpeaking,
  isThinking
}) => {
  const mouthCols = [-22, -11, 0, 11, 22];

  return (
    <svg
      ref={matrixRef}
      viewBox="0 0 200 200"
      className={`aikav-pixel-matrix ${isThinking ? 'state-thinking' : ''} ${isSpeaking ? 'state-speaking' : ''}`}
    >
      <defs>
        <radialGradient id="purpleCursorGlow" cx="50%" cy="50%" r="50%" ref={glowRef}>
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.32" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Render Precomputed Static Background Pixels */}
      {PRECOMPUTED_GRID.map((p, idx) => {
        if (p.isEmpty) return null;
        return (
          <rect
            key={idx}
            x={p.x}
            y={p.y}
            width="8"
            height="8"
            rx="2.5"
            ry="2.5"
            className="bg-pixel"
            style={{
              opacity: 1.0 - p.normDist * 0.7,
              '--rand': p.rand,
              '--rand-x': p.randX,
              '--rand-y': p.randY,
            }}
          />
        );
      })}

      {/* Shared Horizontal Scanning line sweep */}
      <line x1="0" y1="0" x2="200" y2="0" className="matrix-scan-line" />

      {/* Left Eye Group (Translates and Blinks under separate nodes) */}
      <g className="eye-socket-purple" ref={el => { if (pupilRef) pupilRef.current[0] = el; }}>
        <g className={`eye-blink-purple ${isBlinking ? 'blinking' : ''}`} style={{ transformOrigin: '52px 63px' }}>
          {/* Row -1 */}
          <rect x="41" y="52" width="8" height="8" rx="2.5" className="pixel-active" />
          <rect x="52" y="52" width="8" height="8" rx="2.5" className="pixel-active" />
          <rect x="63" y="52" width="8" height="8" rx="2.5" className="pixel-active" />
          {/* Row 0 */}
          <rect x="41" y="63" width="8" height="8" rx="2.5" className="pixel-active" />
          <rect x="52" y="63" width="8" height="8" rx="2.5" className="pixel-accent" />
          <rect x="63" y="63" width="8" height="8" rx="2.5" className="pixel-active" />
          {/* Row +1 */}
          <rect x="41" y="74" width="8" height="8" rx="2.5" className="pixel-active" />
          <rect x="52" y="74" width="8" height="8" rx="2.5" className="pixel-active" />
          <rect x="63" y="74" width="8" height="8" rx="2.5" className="pixel-active" />
        </g>
      </g>

      {/* Right Eye Group (Translates and Blinks under separate nodes) */}
      <g className="eye-socket-purple" ref={el => { if (pupilRef) pupilRef.current[1] = el; }}>
        <g className={`eye-blink-purple ${isBlinking ? 'blinking' : ''}`} style={{ transformOrigin: '140px 63px' }}>
          {/* Row -1 */}
          <rect x="129" y="52" width="8" height="8" rx="2.5" className="pixel-active" />
          <rect x="140" y="52" width="8" height="8" rx="2.5" className="pixel-active" />
          <rect x="151" y="52" width="8" height="8" rx="2.5" className="pixel-active" />
          {/* Row 0 */}
          <rect x="129" y="63" width="8" height="8" rx="2.5" className="pixel-active" />
          <rect x="140" y="63" width="8" height="8" rx="2.5" className="pixel-accent" />
          <rect x="151" y="63" width="8" height="8" rx="2.5" className="pixel-active" />
          {/* Row +1 */}
          <rect x="129" y="74" width="8" height="8" rx="2.5" className="pixel-active" />
          <rect x="140" y="74" width="8" height="8" rx="2.5" className="pixel-active" />
          <rect x="151" y="74" width="8" height="8" rx="2.5" className="pixel-active" />
        </g>
      </g>

      {/* Mouth (Static layout, floats and breathes with parent) */}
      <g className="aikav-matrix-mouth" style={{ transformOrigin: '96px 129px' }}>
        {mouthCols.map((offset, idx) => (
          <rect
            key={idx}
            x={96 + offset}
            y="129"
            width="8"
            height="8"
            rx="2.5"
            className="pixel-active"
          />
        ))}
      </g>

      {/* Screen Mode Cursor Proximity Glow layer */}
      <rect width="200" height="200" rx="12" fill="url(#purpleCursorGlow)" className="matrix-cursor-highlight" />
    </svg>
  );
};

const ReactorSkin = ({
  isBlinking,
  isHoverPulsing,
  pupilRef,
  theme,
  thrusterActive,
  thrusterAngle,
  isSpeaking = false,
  isThinking = false,
  wakeUpStep = 0
}) => {
  return (
    <>
      {/* Thruster exhaust trail (Orange themed) */}
      <div
        className={'aikav-thruster-trail' + (thrusterActive ? ' aikav-thruster-active' : '')}
        style={{
          '--trail-angle': (thrusterAngle ?? 135) + 'deg',
          transform: 'rotate(' + (thrusterAngle ?? 135) + 'deg)',
          background: 'radial-gradient(ellipse at right center, rgba(255, 140, 0, 0.85) 0%, rgba(255, 167, 38, 0.45) 35%, rgba(230, 81, 0, 0.15) 70%, transparent 100%)'
        }}
      />

      {/* Volumetric Reactor Fusion Glow chamber (completely transparent background layer) */}
      <div className="reactor-energy-sphere" />

      {/* Center Matte Black Face with tracking eyes */}
      <div className="reactor-glossy-core">
        <div className="reactor-gloss-highlight" />
        
        {/* Tracking group of two vertical rounded strokes */}
        <div 
          className={`orange-eyes-group ${isBlinking ? 'blinking-eye-active' : ''} ${isSpeaking ? 'speaking-active' : ''}`}
          ref={pupilRef}
        >
          <div className="orange-eye" />
          <div className="orange-eye" />
        </div>
      </div>

      {/* SVG Reactor HUD Elements */}
      <svg
        viewBox="0 0 344 344"
        style={{
          position: 'absolute',
          top: '-22px',
          left: '-22px',
          width: '344px',
          height: '344px',
          overflow: 'visible',
          pointerEvents: 'none'
        }}
      >
        <defs>
          <linearGradient id="orbitArcGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255, 140, 0, 0)" />
            <stop offset="60%" stopColor="rgba(255, 140, 0, 0.35)" />
            <stop offset="100%" stopColor="#FF8C00" />
          </linearGradient>
          <filter id="orbitHeadGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Subtle Concentric Guide Rings */}
        <circle cx="172" cy="172" r="74" stroke="rgba(255, 140, 0, 0.08)" strokeWidth="0.8" fill="none" />
        <circle cx="172" cy="172" r="82" stroke="rgba(255, 140, 0, 0.04)" strokeWidth="0.8" strokeDasharray="2 6" fill="none" />
        <circle cx="172" cy="172" r="90" stroke="rgba(255, 140, 0, 0.05)" strokeWidth="0.8" fill="none" />

        {/* Technical Calibration tick marks at cardinal angles on the 90px ring */}
        <g opacity="0.3">
          <line x1="172" y1="78" x2="172" y2="82" stroke="var(--kav-primary)" strokeWidth="1" />
          <line x1="172" y1="262" x2="172" y2="266" stroke="var(--kav-primary)" strokeWidth="1" />
          <line x1="78" y1="172" x2="82" y2="172" stroke="var(--kav-primary)" strokeWidth="1" />
          <line x1="262" y1="172" x2="266" y2="172" stroke="var(--kav-primary)" strokeWidth="1" />
        </g>

        {/* 2. Outer Orbit Light Group (Close to the black core: radius 74px) */}
        <g className="orbit-light-group">
          {/* Arc path of radius 74px */}
          <path
            d="M 172 98 A 74 74 0 0 1 246 172"
            stroke="url(#orbitArcGradient)"
            strokeWidth="2.0"
            fill="none"
            strokeLinecap="round"
          />
          {/* Glowing head dot */}
          <circle cx="246" cy="172" r="4.0" fill="#FFF3E0" filter="url(#orbitHeadGlow)" />
        </g>

        {/* 3. Thinking State concentric dashed circle */}
        <circle
          cx="172"
          cy="172"
          r="76"
          stroke="var(--kav-accent-gold)"
          strokeWidth="1.5"
          strokeDasharray="2 4"
          fill="none"
          className={`reactor-thinking-ring ${isThinking ? 'active' : ''}`}
        />

        {/* 4. Wake Up State radiating ray spikes */}
        {wakeUpStep > 0 && (
          <g className="reactor-wake-flares">
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={i}
                x1="172"
                y1="106"
                x2="172"
                y2="86"
                stroke="var(--kav-accent-gold)"
                strokeWidth="1.8"
                strokeLinecap="round"
                transform={`rotate(${i * 22.5}, 172, 172)`}
                opacity="0.8"
              />
            ))}
          </g>
        )}
      </svg>
    </>
  );
};

const DNACoreSkin = ({
  isBlinking,
  isHoverPulsing,
  pupilRef,
  theme,
  thrusterActive,
  thrusterAngle,
  isSpeaking = false,
  isThinking = false,
  wakeUpStep = 0
}) => {
  // Generate circular helix waves centered at (172, 172)
  // R: base radius, A: wave amplitude, F: frequency (number of lobes)
  const generateHelixPath = (R, A, F, phase = 0) => {
    const pts = [];
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const theta = (i * 2 * Math.PI) / steps;
      const r = R + A * Math.sin(F * theta + phase);
      const x = 172 + r * Math.cos(theta);
      const y = 172 + r * Math.sin(theta);
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return pts.join(' ');
  };

  const path1 = generateHelixPath(82, 6, 8, 0);
  const path2 = generateHelixPath(82, 6, 8, Math.PI);

  return (
    <>
      {/* Thruster exhaust trail (Green themed) */}
      <div
        className={'aikav-thruster-trail' + (thrusterActive ? ' aikav-thruster-active' : '')}
        style={{
          '--trail-angle': (thrusterAngle ?? 135) + 'deg',
          transform: 'rotate(' + (thrusterAngle ?? 135) + 'deg)',
          background: 'radial-gradient(ellipse at right center, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.4) 35%, rgba(20, 83, 45, 0.1) 70%, transparent 100%)'
        }}
      />

      {/* Volumetric Reactor Fusion Glow chamber (completely transparent background layer) */}
      <div className="reactor-energy-sphere" />

      {/* Center Matte Black Core with tracking eyes */}
      <div className="reactor-glossy-core" style={{ border: '1px solid rgba(34, 197, 94, 0.15)' }}>
        <div className="reactor-gloss-highlight" />
        
        {/* Tracking group of two vertical rounded strokes */}
        <div 
          className={`orange-eyes-group ${isBlinking ? 'blinking-eye-active' : ''} ${isSpeaking ? 'speaking-active' : ''}`}
          ref={pupilRef}
        >
          <div className="orange-eye" style={{ backgroundColor: '#22C55E', filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.7)) drop-shadow(0 0 1.5px #E8FFF2)' }} />
          <div className="orange-eye" style={{ backgroundColor: '#22C55E', filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.7)) drop-shadow(0 0 1.5px #E8FFF2)' }} />
        </div>
      </div>

      {/* SVG HUD Elements */}
      <svg
        viewBox="0 0 344 344"
        style={{
          position: 'absolute',
          top: '-22px',
          left: '-22px',
          width: '344px',
          height: '344px',
          overflow: 'visible',
          pointerEvents: 'none'
        }}
      >
        <defs>
          <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Thin circular guide ring behind the strands */}
        <circle cx="172" cy="172" r="82" stroke="rgba(34, 197, 94, 0.12)" strokeWidth="0.8" fill="none" />
        <circle cx="172" cy="172" r="92" stroke="rgba(34, 197, 94, 0.04)" strokeWidth="0.8" fill="none" />

        {/* 2. DNA Helix CW Strand */}
        <g className="helix-rotate-cw">
          {/* The continuous strand path */}
          <path
            d={path1}
            stroke="rgba(34, 197, 94, 0.45)"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Dot particles traveling CW along path */}
          <path
            d={path1}
            stroke="#E8FFF2"
            strokeWidth="2.5"
            strokeDasharray="4 24"
            strokeLinecap="round"
            fill="none"
            className="green-flow-cw"
            filter="url(#greenGlow)"
          />
        </g>

        {/* 3. DNA Helix CCW Strand */}
        <g className="helix-rotate-ccw">
          {/* The continuous strand path */}
          <path
            d={path2}
            stroke="rgba(34, 197, 94, 0.35)"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Dot particles traveling CCW along path */}
          <path
            d={path2}
            stroke="#E8FFF2"
            strokeWidth="2.5"
            strokeDasharray="4 24"
            strokeLinecap="round"
            fill="none"
            className="green-flow-ccw"
            filter="url(#greenGlow)"
          />
        </g>

        {/* 4. Thinking state: faint rotating outer dashed ring */}
        <circle
          cx="172"
          cy="172"
          r="74"
          stroke="#22C55E"
          strokeWidth="1.5"
          strokeDasharray="3 5"
          fill="none"
          className={`reactor-thinking-ring ${isThinking ? 'active' : ''}`}
          opacity="0.8"
        />

        {/* 5. Wake Up State: 16 small radial green dashes */}
        {wakeUpStep > 0 && (
          <g className="reactor-wake-flares">
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={i}
                x1="172"
                y1="106"
                x2="172"
                y2="92"
                stroke="#22C55E"
                strokeWidth="1.8"
                strokeLinecap="round"
                transform={`rotate(${i * 22.5}, 172, 172)`}
                opacity="0.75"
              />
            ))}
          </g>
        )}
      </svg>
    </>
  );
};

const SentinelLockSkin = ({
  isBlinking,
  isHoverPulsing,
  pupilRef,
  theme,
  thrusterActive,
  thrusterAngle,
  isSpeaking = false,
  isThinking = false,
  wakeUpStep = 0
}) => {
  return (
    <>
      {/* Thruster exhaust trail (Red themed) */}
      <div
        className={'aikav-thruster-trail' + (thrusterActive ? ' aikav-thruster-active' : '')}
        style={{
          '--trail-angle': (thrusterAngle ?? 135) + 'deg',
          transform: 'rotate(' + (thrusterAngle ?? 135) + 'deg)',
          background: 'radial-gradient(ellipse at right center, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.4) 35%, rgba(127, 29, 29, 0.1) 70%, transparent 100%)'
        }}
      />

      {/* Center Matte Black Core with tracking eyes */}
      <div className="reactor-glossy-core" style={{ border: '1px solid rgba(239, 68, 68, 0.15)' }}>
        <div className="reactor-gloss-highlight" />
        
        {/* Tracking group of two vertical rounded strokes */}
        <div 
          className={`orange-eyes-group ${isBlinking ? 'blinking-eye-active' : ''} ${isSpeaking ? 'speaking-active' : ''}`}
          ref={pupilRef}
        >
          <div className="orange-eye" style={{ backgroundColor: '#EF4444', filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.7)) drop-shadow(0 0 1.5px #FFEAEA)' }} />
          <div className="orange-eye" style={{ backgroundColor: '#EF4444', filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.7)) drop-shadow(0 0 1.5px #FFEAEA)' }} />
        </div>
      </div>

      {/* SVG HUD Elements */}
      <svg
        viewBox="0 0 344 344"
        style={{
          position: 'absolute',
          top: '-22px',
          left: '-22px',
          width: '344px',
          height: '344px',
          overflow: 'visible',
          pointerEvents: 'none'
        }}
      >
        <defs>
          <linearGradient id="redRadarWedge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0.35)" />
          </linearGradient>
        </defs>

        {/* 1. Four red corner brackets (Targeting Reticle) */}
        <g className="red-target-brackets">
          {/* Top-Left Bracket */}
          <path d="M 94 110 L 94 94 L 110 94" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="square" />
          {/* Top-Right Bracket */}
          <path d="M 234 94 L 250 94 L 250 110" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="square" />
          {/* Bottom-Left Bracket */}
          <path d="M 94 234 L 94 250 L 110 250" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="square" />
          {/* Bottom-Right Bracket */}
          <path d="M 234 250 L 250 250 L 250 234" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="square" />
        </g>

        {/* 2. Rotating Radar Sweep (line and cone wedge) */}
        <g className="red-radar-sweep">
          {/* Faint trailing cone sector */}
          <path d="M 172 172 L 172 62 A 110 110 0 0 1 250 94 Z" fill="url(#redRadarWedge)" opacity="0.2" />
          {/* Needle sweep line */}
          <line x1="172" y1="172" x2="172" y2="62" stroke="#EF4444" strokeWidth="1.2" opacity="0.8" />
        </g>

        {/* 3. Subtle outer segmented HUD ring */}
        <circle cx="172" cy="172" r="110" stroke="rgba(239, 68, 68, 0.12)" strokeWidth="0.8" strokeDasharray="30 80 40 50" fill="none" />
        <circle cx="172" cy="172" r="118" stroke="rgba(239, 68, 68, 0.04)" strokeWidth="0.8" fill="none" />

        {/* 4. Small warning indicator dots blinking occasionally */}
        <circle cx="172" cy="54" r="2.0" fill="#EF4444" className="red-indicator-blink-1" />
        <circle cx="282" cy="200" r="2.0" fill="#EF4444" className="red-indicator-blink-2" />
        <circle cx="85" cy="245" r="1.5" fill="#EF4444" className="red-indicator-blink-3" opacity="0.7" />

        {/* 5. Thinking state: faint CCW rotating target circle */}
        <circle
          cx="172"
          cy="172"
          r="76"
          stroke="#EF4444"
          strokeWidth="1.2"
          strokeDasharray="4 8"
          fill="none"
          className={`reactor-thinking-ring ${isThinking ? 'active' : ''}`}
          opacity="0.75"
        />

        {/* 6. Wake Up State: simple corner bracket pop expansion */}
        {wakeUpStep > 0 && (
          <circle cx="172" cy="172" r="85" stroke="#EF4444" strokeWidth="1" strokeDasharray="10 15" fill="none" opacity="0.6" className="reactor-pulse-ring" style={{ animationDuration: '0.8s' }} />
        )}
      </svg>
    </>
  );
};

export default AIKAVCore;
