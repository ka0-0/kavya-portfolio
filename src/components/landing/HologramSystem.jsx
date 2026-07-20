import React, { useState, useEffect, useRef } from 'react';
import ProjectionBeam from './ProjectionBeam';
import HolographicProjection from './HolographicProjection';

export default function HologramSystem({ text, state, onTypewriterComplete }) {
  const [frameData, setFrameData] = useState({ pupilX: 0, pupilY: 0, timeMs: 0 });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const animRef = useRef({
    currentX: 0,
    currentY: 0,
    startTimestamp: null,
  });

  useEffect(() => {
    let animId = null;

    const loop = (timestamp) => {
      if (!animRef.current.startTimestamp) {
        animRef.current.startTimestamp = timestamp;
      }

      const elapsed = timestamp - animRef.current.startTimestamp;

      // 1. Calculate target pupil displacement (targetY = -6.5 LERPed snappy upward glance)
      let targetX = 0;
      let targetY = 0;
      if (stateRef.current !== 'idle' && stateRef.current !== 'concluding') {
        targetY = -6.5;
      }

      // Spring LERP interpolation matching AIKAVCore 0.35 ease
      animRef.current.currentX += (targetX - animRef.current.currentX) * 0.35;
      animRef.current.currentY += (targetY - animRef.current.currentY) * 0.35;

      setFrameData({
        pupilX: animRef.current.currentX,
        pupilY: animRef.current.currentY,
        timeMs: elapsed,
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="hologram-projection-wrapper">
      <ProjectionBeam
        state={state}
        pupilX={frameData.pupilX}
        pupilY={frameData.pupilY}
        hologramY={0} // Freeze horizontal/vertical drift and float at 0
        timeMs={frameData.timeMs}
      />
      <HolographicProjection
        text={text}
        state={state}
        onTypewriterComplete={onTypewriterComplete}
        hologramY={0} // Freeze Y float position at 0
      />
    </div>
  );
}
