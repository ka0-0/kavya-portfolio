import React, { memo } from 'react';

const BackgroundLayer = memo(() => {
  return (
    <>
      {/* Background Ambience Pattern & Light Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.04)_0%,rgba(124,58,237,0.02)_40%,transparent_65%)] pointer-events-none z-0" />

      {/* Grid Scanline Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 18, 18, 0) 96%, rgba(6, 182, 212, 0.02) 98%, rgba(6, 182, 212, 0.02) 100%)',
          backgroundSize: '100% 40px',
        }}
      />
    </>
  );
}, () => true);

export default BackgroundLayer;
