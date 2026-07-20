import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeContext';

export default function ProjectionBeam({ state }) {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const isDualEye = theme !== 'blue';

  const [beamCoords, setBeamCoords] = useState({
    leftX: 154, leftY: 115,
    rightX: 166, rightY: 115,
    singleX: 160, singleY: 115
  });

  // The beam is permanently active and visible.
  const isActive = true;

  // Derive the active theme container class to prevent querying hidden skin elements
  const prefix = 
    theme === 'blue' ? '.aikav-circle-skin-container' :
    theme === 'black' ? '.aikav-capsule-skin-container' :
    theme === 'pink' ? '.aikav-pink-skin-container' :
    theme === 'purple' ? '.aikav-purple-skin-container' :
    theme === 'orange' ? '.aikav-orange-skin-container' :
    theme === 'green' ? '.aikav-green-skin-container' :
    theme === 'red' ? '.aikav-red-skin-container' : '';

  useEffect(() => {
    let animFrame;
    const update = () => {
      const container = containerRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const midX = containerRect.width / 2;
        const fallbackY = 115;

        if (isDualEye) {
          let leftPupil = document.querySelector(`${prefix} .eye-left .eye-pupil-emitter, ${prefix} .eye-left .eye-pupil`);
          let rightPupil = document.querySelector(`${prefix} .eye-right .eye-pupil-emitter, ${prefix} .eye-right .eye-pupil`);
          
          if (!leftPupil || !rightPupil) {
            const orangeEyes = document.querySelectorAll(`${prefix} .orange-eyes-group .orange-eye`);
            if (orangeEyes && orangeEyes.length >= 2) {
              leftPupil = orangeEyes[0];
              rightPupil = orangeEyes[1];
            }
          }

          if (!leftPupil || !rightPupil) {
            const purpleEyes = document.querySelectorAll(`${prefix} .eye-socket-purple .pixel-accent`);
            if (purpleEyes && purpleEyes.length >= 2) {
              leftPupil = purpleEyes[0];
              rightPupil = purpleEyes[1];
            }
          }

          if (leftPupil && rightPupil) {
            const leftRect = leftPupil.getBoundingClientRect();
            const rightRect = rightPupil.getBoundingClientRect();

            setBeamCoords({
              leftX: leftRect.left + leftRect.width / 2 - containerRect.left,
              leftY: leftRect.top + leftRect.height / 2 - containerRect.top,
              rightX: rightRect.left + rightRect.width / 2 - containerRect.left,
              rightY: rightRect.top + rightRect.height / 2 - containerRect.top,
              singleX: midX,
              singleY: fallbackY
            });
          } else {
            setBeamCoords({
              leftX: midX - 6,
              leftY: fallbackY,
              rightX: midX + 6,
              rightY: fallbackY,
              singleX: midX,
              singleY: fallbackY
            });
          }
        } else {
          const singlePupil = document.querySelector(`${prefix} .aikav-pupil-emitter, ${prefix} .aikav-pupil`);
          if (singlePupil) {
            const singleRect = singlePupil.getBoundingClientRect();
            setBeamCoords({
              leftX: midX - 6,
              leftY: fallbackY,
              rightX: midX + 6,
              rightY: fallbackY,
              singleX: singleRect.left + singleRect.width / 2 - containerRect.left,
              singleY: singleRect.top + singleRect.height / 2 - containerRect.top
            });
          } else {
            setBeamCoords({
              leftX: midX - 6,
              leftY: fallbackY,
              rightX: midX + 6,
              rightY: fallbackY,
              singleX: midX,
              singleY: fallbackY
            });
          }
        }
      }
      animFrame = requestAnimationFrame(update);
    };
    animFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrame);
  }, [isDualEye, prefix]);

  // Left pupil beam
  const leftClip = `polygon(0 0, calc(50% - 6px) 0, ${beamCoords.leftX}px ${beamCoords.leftY}px)`;
  const leftBg = `radial-gradient(circle at ${beamCoords.leftX}px ${beamCoords.leftY}px, rgba(var(--holo-accent-rgb, var(--accent-rgb)), 0.15) 0%, rgba(var(--holo-accent-rgb, var(--accent-rgb)), 0.02) 80%, transparent 100%)`;

  // Right pupil beam
  const rightClip = `polygon(calc(50% + 6px) 0, 100% 0, ${beamCoords.rightX}px ${beamCoords.rightY}px)`;
  const rightBg = `radial-gradient(circle at ${beamCoords.rightX}px ${beamCoords.rightY}px, rgba(var(--holo-accent-rgb, var(--accent-rgb)), 0.15) 0%, rgba(var(--holo-accent-rgb, var(--accent-rgb)), 0.02) 80%, transparent 100%)`;

  // Single pupil beam (blue theme)
  const singleClip = `polygon(0 0, 100% 0, ${beamCoords.singleX}px ${beamCoords.singleY}px)`;
  const singleBg = `radial-gradient(circle at ${beamCoords.singleX}px ${beamCoords.singleY}px, rgba(var(--holo-accent-rgb, var(--accent-rgb)), 0.15) 0%, rgba(var(--holo-accent-rgb, var(--accent-rgb)), 0.02) 80%, transparent 100%)`;

  return (
    <div ref={containerRef} className={`projection-beam-container ${isActive ? 'active' : ''}`}>
      {isDualEye ? (
        <>
          {/* Symmetrical dual-eye projection beams (independent light sources) */}
          <div className="projection-beam-triangle left" style={{ clipPath: leftClip, background: leftBg }} />
          <div className="projection-beam-triangle right" style={{ clipPath: rightClip, background: rightBg }} />
        </>
      ) : (
        /* Single central projection beam */
        <div className="projection-beam-triangle" style={{ clipPath: singleClip, background: singleBg }} />
      )}
    </div>
  );
}
