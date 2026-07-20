import React from 'react';
import TypewriterText from './TypewriterText';
import ProjectionBeam from './ProjectionBeam';

export default function HolographicProjection({ text, state, onTypewriterComplete }) {
  // Determine if the hologram is active (materializing, typing, holding, beam-fading, concluding)
  const isHologramVisible = state !== 'idle' && state !== 'eye-moving' && state !== 'charging';

  // Trigger materialization stages once we enter 'materializing' or subsequent states
  const shouldMaterialize = isHologramVisible;

  // Add the concluding transition class when fading out
  const isConcluding = state === 'concluding';

  return (
    <div
      className={`hologram-hud ${isHologramVisible ? 'active' : ''} ${shouldMaterialize ? 'materialize' : ''
        } ${isConcluding ? 'state-concluding' : ''}`}
    >
      {/* Background Volumetric Glass Panel */}
      <div className="hologram-glass" />

      {/* Futuristic Grid Overlay */}
      <div className="hologram-grid" />

      {/* Persistent Scanline Grid */}
      <div className="hologram-scanlines" />

      {/* 5-Stage Materializing Scanline Sweep line */}
      <div className="hologram-sweep" />

      {/* High-Tech HUD Corner Brackets */}
      <div className="hologram-corner hologram-corner-tl" />
      <div className="hologram-corner hologram-corner-tr" />
      <div className="hologram-corner hologram-corner-bl" />
      <div className="hologram-corner hologram-corner-br" />

      {/* Muted Brand Identifier Signature */}
      <div className="hologram-signature">KAV.AI //</div>

      {/* Typewriter text renderer */}
      <TypewriterText
        text={text}
        state={state}
        onComplete={onTypewriterComplete}
      />

      {/* Clean triangular projection beam */}
      <ProjectionBeam state={state} />
    </div>
  );
}
