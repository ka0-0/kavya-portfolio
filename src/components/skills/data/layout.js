export const layout = {
  cx: 500,
  cy: 300,
  nodes: {
    core: {
      position: { type: 'absolute', x: 500, y: 300 },
      visual: { size: 'large', ring: 'core', shape: 'circle', importance: 'core' }
    },
    // Inner AI Ring (Surrounding AI Core)
    ml: {
      position: { type: 'absolute', x: 580, y: 460 },
      visual: { size: 'medium', ring: 'inner', shape: 'circle', importance: 'primary' }
    },
    dl: {
      position: { type: 'absolute', x: 660, y: 380 },
      visual: { size: 'medium', ring: 'inner', shape: 'circle', importance: 'primary' }
    },
    cv: {
      position: { type: 'absolute', x: 680, y: 260 },
      visual: { size: 'medium', ring: 'inner', shape: 'circle', importance: 'secondary' }
    },
    fastapi: {
      position: { type: 'absolute', x: 420, y: 460 },
      visual: { size: 'medium', ring: 'inner', shape: 'circle', importance: 'secondary' }
    },
    pytorch: {
      position: { type: 'absolute', x: 640, y: 150 },
      visual: { size: 'medium', ring: 'inner', shape: 'circle', importance: 'primary' }
    },
    tensorflow: {
      position: { type: 'absolute', x: 520, y: 120 },
      visual: { size: 'medium', ring: 'inner', shape: 'circle', importance: 'supporting' }
    },
    react: {
      position: { type: 'absolute', x: 450, y: 140 },
      visual: { size: 'medium', ring: 'inner', shape: 'circle', importance: 'secondary' }
    },
    // Transition Programming Ring (Middle)
    python: {
      position: { type: 'absolute', x: 320, y: 320 },
      visual: { size: 'medium', ring: 'transition', shape: 'circle', importance: 'primary' }
    },
    cpp: {
      position: { type: 'absolute', x: 300, y: 180 },
      visual: { size: 'medium', ring: 'transition', shape: 'circle', importance: 'secondary' }
    },
    // Outer Mechanical Ring (Far Left)
    solidworks: {
      position: { type: 'absolute', x: 140, y: 380 },
      visual: { size: 'medium', ring: 'outer', shape: 'circle', importance: 'primary' }
    },
    cad: {
      position: { type: 'absolute', x: 120, y: 260 },
      visual: { size: 'medium', ring: 'outer', shape: 'circle', importance: 'primary' }
    },
    mfg: {
      position: { type: 'absolute', x: 110, y: 480 },
      visual: { size: 'medium', ring: 'outer', shape: 'circle', importance: 'supporting' }
    },
    fea: {
      position: { type: 'absolute', x: 240, y: 440 },
      visual: { size: 'medium', ring: 'outer', shape: 'circle', importance: 'secondary' }
    },
    gd_t: {
      position: { type: 'absolute', x: 100, y: 140 },
      visual: { size: 'medium', ring: 'outer', shape: 'circle', importance: 'supporting' }
    }
  }
};
