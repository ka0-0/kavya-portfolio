export const connections = [
  // Outer Mech loop
  { from: 'solidworks', to: 'cad', type: 'progression', style: 'solid', weight: 1.6 },
  { from: 'cad', to: 'gd_t', type: 'progression', style: 'solid', weight: 1.0 },
  { from: 'gd_t', to: 'mfg', type: 'progression', style: 'solid', weight: 0.9 },
  { from: 'mfg', to: 'fea', type: 'progression', style: 'solid', weight: 1.0 },
  { from: 'fea', to: 'solidworks', type: 'progression', style: 'solid', weight: 1.6 },

  // Mech -> Transition Ring
  { from: 'solidworks', to: 'python', type: 'dependency', style: 'dashed', weight: 1.2 },
  { from: 'cad', to: 'python', type: 'dependency', style: 'dashed', weight: 1.2 },
  { from: 'fea', to: 'cpp', type: 'dependency', style: 'dashed', weight: 1.2 },
  { from: 'gd_t', to: 'cpp', type: 'dependency', style: 'dashed', weight: 1.0 },
  { from: 'mfg', to: 'cpp', type: 'dependency', style: 'dashed', weight: 1.0 },

  // Transition -> Inner Ring
  { from: 'python', to: 'pytorch', type: 'dependency', style: 'solid', weight: 1.8 },
  { from: 'python', to: 'ml', type: 'dependency', style: 'solid', weight: 1.8 },
  { from: 'python', to: 'react', type: 'dependency', style: 'solid', weight: 1.4 },
  { from: 'cpp', to: 'tensorflow', type: 'dependency', style: 'solid', weight: 1.2 },
  { from: 'cpp', to: 'fastapi', type: 'dependency', style: 'solid', weight: 1.4 },

  // Inner AI Ring loop
  { from: 'pytorch', to: 'ml', type: 'progression', style: 'solid', weight: 1.4 },
  { from: 'ml', to: 'dl', type: 'progression', style: 'solid', weight: 1.4 },
  { from: 'dl', to: 'cv', type: 'progression', style: 'solid', weight: 1.3 },
  { from: 'cv', to: 'fastapi', type: 'progression', style: 'solid', weight: 1.2 },
  { from: 'fastapi', to: 'tensorflow', type: 'progression', style: 'solid', weight: 1.0 },
  { from: 'tensorflow', to: 'react', type: 'progression', style: 'solid', weight: 1.0 },
  { from: 'react', to: 'pytorch', type: 'progression', style: 'solid', weight: 1.4 },

  // Inner AI nodes -> AI Core
  { from: 'pytorch', to: 'core', type: 'core-link', style: 'glow', weight: 2.2 },
  { from: 'ml', to: 'core', type: 'core-link', style: 'glow', weight: 2.2 },
  { from: 'dl', to: 'core', type: 'core-link', style: 'glow', weight: 2.2 },
  { from: 'cv', to: 'core', type: 'core-link', style: 'glow', weight: 1.5 },
  { from: 'fastapi', to: 'core', type: 'core-link', style: 'glow', weight: 1.5 },
  { from: 'tensorflow', to: 'core', type: 'core-link', style: 'glow', weight: 1.1 },
  { from: 'react', to: 'core', type: 'core-link', style: 'glow', weight: 1.5 }
];
