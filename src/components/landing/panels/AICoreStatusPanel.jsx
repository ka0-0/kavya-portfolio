import React, { useState, useEffect, useRef, memo } from 'react';
import styles from './AICoreStatusPanel.module.css';

const AICoreStatusPanel = memo(
  function AICoreStatusPanel({ className = '', style = {} }) {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

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
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`cyber-holo-panel ${styles.panelContainer} ${isHovered ? styles.hovered : ''} ${className}`}
        style={{
          width: '270px',
          height: '170px',
          ...style,
        }}
      >
        {/* Zoomed Monitoring Feed Video inside Panel */}
        <video
          key="ai-core-panel-video"
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
          className={styles.videoBg}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            willChange: 'transform',
            transform: 'scale(1.25) translateZ(0)',
            WebkitTransform: 'scale(1.25) translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        />
        <div className={styles.videoOverlay} />

        {/* Background Moving Grid Overlay */}
        <div className={styles.gridOverlay} />

        {/* Moving Vertical Scanline Beam */}
        <div className={styles.verticalScanline} />

        {/* Scanline Texture Overlay */}
        <div className={styles.scanlineTexture} />

        {/* Holographic Corner Brackets */}
        <div className={`${styles.corner} ${styles.cornerTL}`} />
        <div className={`${styles.corner} ${styles.cornerTR}`} />
        <div className={`${styles.corner} ${styles.cornerBL}`} />
        <div className={`${styles.corner} ${styles.cornerBR}`} />

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.statusDot} />
            <span className={styles.headerTitle}>VISUAL PROCESSOR</span>
          </div>
          <div className={styles.onlineBadge}>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-light,#76FF03)] animate-pulse" />
            <span>ONLINE</span>
          </div>
        </div>
      </div>
    );
  },
  () => true // Never re-render panel component during parent state updates
);

export default AICoreStatusPanel;
