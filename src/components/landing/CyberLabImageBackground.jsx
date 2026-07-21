import React, { useEffect, useRef, memo } from 'react';

const CyberLabImageBackground = memo(
  function CyberLabImageBackground() {
    const videoRef = useRef(null);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      video.muted = true;
      video.playsInline = true;

      const playVideo = () => {
        if (video.paused) {
          video.play().catch(() => {});
        }
      };

      playVideo();

      // Seamless Loop Optimization:
      // Reset to 0.001s right before EOF (duration - 0.15s) to bypass browser EOF buffer flush pause
      const handleTimeUpdate = () => {
        if (video.duration && video.currentTime > video.duration - 0.15) {
          video.currentTime = 0.001;
        }
      };

      const handleEnded = () => {
        video.currentTime = 0.001;
        video.play().catch(() => {});
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }, []);

    return (
      <div className="absolute inset-0 w-full h-full bg-[#020704] pointer-events-none z-0 overflow-hidden select-none">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-[#020704]" />

        {/* Video Container physically clipped inside the chamfered HUD Frame */}
        <div
          className="absolute inset-6 md:inset-8 overflow-hidden pointer-events-none select-none z-0"
          style={{
            overflow: 'hidden',
            clipPath: 'polygon(16px 0px, calc(100% - 16px) 0px, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0px calc(100% - 16px), 0px 16px)',
            WebkitClipPath: 'polygon(16px 0px, calc(100% - 16px) 0px, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0px calc(100% - 16px), 0px 16px)',
          }}
        >
          {/* Main Fullscreen Background Video */}
          <video
            key="main-bg-video"
            ref={videoRef}
            src="/loading-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            controls={false}
            draggable={false}
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none transform-gpu z-0"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              willChange: 'transform',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          />

          {/* Dark transparent overlay for text readability */}
          <div
            className="absolute inset-0 pointer-events-none bg-black/30 z-[1]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.30)' }}
          />
        </div>
      </div>
    );
  },
  () => true // Never re-render background video component
);

export default CyberLabImageBackground;
