import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// 7 accent color presets (always dark background)
const themes = ['blue', 'black', 'pink', 'purple', 'orange', 'red', 'green'];

export function ThemeProvider({ children }) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio-theme-index');
      if (saved !== null) {
        const index = parseInt(saved, 10);
        if (index >= 0 && index < themes.length) {
          return index;
        }
      }
    } catch (e) {
      console.warn('LocalStorage theme lookup failed:', e);
    }
    return 0;
  });

  const accent = themes[currentIndex];

  // Apply theme attributes to documentElement immediately
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', accent);
  }, [accent]);

  const setTheme = (index) => {
    if (index >= 0 && index < themes.length) {
      // Glow transition: fade out (150ms), change state, fade in (150ms)
      document.body.classList.add('theme-changing');
      setTimeout(() => {
        setCurrentIndex(index);
        localStorage.setItem('portfolio-theme-index', index.toString());
        setTimeout(() => {
          document.body.classList.remove('theme-changing');
        }, 150);
      }, 150);
    }
  };

  const nextTheme = () => {
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(nextIndex);
  };

  const previousTheme = () => {
    const prevIndex = (currentIndex - 1 + themes.length) % themes.length;
    setTheme(prevIndex);
  };

  return (
    <ThemeContext.Provider value={{
      theme: accent,
      accent,
      currentThemeIndex: currentIndex,
      setTheme,
      nextTheme,
      previousTheme,
      themesList: themes
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
