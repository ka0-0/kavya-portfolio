export const skillsData = {
  // Mechanical Ring
  solidworks: {
    name: 'SolidWorks',
    category: 'mech',
    type: 'skill',
    details: {
      level: 'Expert',
      experience: 9,
      projects: 5,
      libs: 4,
      tools: ['Parts & Assembly', 'Sheet Metal', '3D Mates']
    }
  },
  cad: {
    name: 'CAD Modeling',
    category: 'mech',
    type: 'skill',
    details: {
      level: 'Expert',
      experience: 8,
      projects: 6,
      libs: 3,
      tools: ['Drafting', 'Product Design', 'Assemblies']
    }
  },
  mfg: {
    name: 'Manufacturing',
    category: 'mech',
    type: 'skill',
    details: {
      level: 'Advanced',
      experience: 7,
      projects: 4,
      libs: 2,
      tools: ['CNC Setup', 'Machining Parts', 'CAM Tools']
    }
  },
  fea: {
    name: 'FEA Simulation',
    category: 'mech',
    type: 'skill',
    details: {
      level: 'Advanced',
      experience: 8,
      projects: 4,
      libs: 3,
      tools: ['Static Stress Analysis', 'Thermal FEA']
    }
  },
  gd_t: {
    name: 'GD&T Standards',
    category: 'mech',
    type: 'skill',
    details: {
      level: 'Advanced',
      experience: 8,
      projects: 5,
      libs: 2,
      tools: ['ASME Y14.5', 'Tolerance Analysis']
    }
  },

  // Transition Ring
  python: {
    name: 'Python',
    category: 'trans',
    type: 'transition',
    details: {
      level: 'Expert',
      experience: 9,
      projects: 12,
      libs: 15,
      tools: ['FastAPI', 'NumPy', 'Pandas', 'PyTorch']
    }
  },
  cpp: {
    name: 'C++',
    category: 'trans',
    type: 'transition',
    details: {
      level: 'Intermediate',
      experience: 7,
      projects: 3,
      libs: 4,
      tools: ['STL Structures', 'OOP Logic', 'Embedded systems']
    }
  },

  // Inner Ring (AI / Software)
  ml: {
    name: 'Machine Learning',
    category: 'ai',
    type: 'skill',
    details: {
      level: 'Advanced',
      experience: 8,
      projects: 8,
      libs: 6,
      tools: ['Scikit-Learn', 'XGBoost', 'Feature Eng.']
    }
  },
  dl: {
    name: 'Deep Learning',
    category: 'ai',
    type: 'skill',
    details: {
      level: 'Advanced',
      experience: 8,
      projects: 6,
      libs: 5,
      tools: ['PyTorch Models', 'CNNs', 'NLP Models']
    }
  },
  cv: {
    name: 'Computer Vision',
    category: 'ai',
    type: 'skill',
    details: {
      level: 'Advanced',
      experience: 8,
      projects: 5,
      libs: 4,
      tools: ['OpenCV', 'YOLO Models', 'Object Detection']
    }
  },
  fastapi: {
    name: 'FastAPI',
    category: 'ai',
    type: 'skill',
    details: {
      level: 'Advanced',
      experience: 8,
      projects: 4,
      libs: 5,
      tools: ['REST APIs', 'Pydantic', 'Async/Await']
    }
  },
  pytorch: {
    name: 'PyTorch',
    category: 'ai',
    type: 'skill',
    details: {
      level: 'Advanced',
      experience: 8,
      projects: 7,
      libs: 6,
      tools: ['Tensors', 'Autograd', 'CUDA Compute']
    }
  },
  tensorflow: {
    name: 'TensorFlow',
    category: 'ai',
    type: 'skill',
    details: {
      level: 'Intermediate',
      experience: 7,
      projects: 3,
      libs: 4,
      tools: ['Keras Models', 'TensorBoard', 'Data Loaders']
    }
  },
  react: {
    name: 'React.js',
    category: 'ai',
    type: 'skill',
    details: {
      level: 'Advanced',
      experience: 8,
      projects: 5,
      libs: 8,
      tools: ['Vite Setup', 'Framer Motion', 'React Context']
    }
  },

  // Central Core Node
  core: {
    name: 'AI Core',
    category: 'core',
    type: 'hub',
    details: {
      level: 'Hub',
      experience: 0,
      projects: 0,
      libs: 0,
      tools: []
    }
  }
};
