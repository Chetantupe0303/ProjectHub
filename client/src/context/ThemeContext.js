import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

let animationStyleElement = null;

const createAnimation = (buttonElement) => {
  const name = `theme-transition-${Math.random().toString(36).slice(2)}`;

  let rawX, rawY;
  if (buttonElement) {
    const rect = buttonElement.getBoundingClientRect();
    rawX = `${rect.left + rect.width / 2}px`;
    rawY = `${rect.top + rect.height / 2}px`;
  } else {
    rawX = "50vw";
    rawY = "0px";
  }

  // Orange primary for Nexus design
  const svg = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" overflow="visible"><defs><filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter></defs><circle cx="50" cy="50" r="40" fill="%23F24E1E" filter="url(%23blur)"/></svg>`;

  const css = `
::view-transition-group(root) {
  animation-timing-function ease-in-out;
}
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 1.0s;
  animation-timing-function ease-in-out;
  mix-blend-mode: normal;
}
::view-transition-old(root) {
  animation: none;
  z-index: -1;
}
::view-transition-new(root) {
  -webkit-mask: url('${svg.replace(/"/g, "%22").replace(/'/g, "%27")}') top left / 0vmax no-repeat;
  mask: url('${svg.replace(/"/g, "%22").replace(/'/g, "%27")}') top left / 0vmax no-repeat;
  -webkit-mask-origin: border-box;
  mask-origin: border-box;
  animation-name: ${name}-scale;
  animation-duration: 1.0s;
  animation-timing-function ease-in-out;
  animation-fill-mode: forwards;
  z-index: 1;
}
@keyframes ${name}-scale {
  0% {
    -webkit-mask-size: 0vmax;
    mask-size: 0vmax;
    -webkit-mask-position: calc(${rawX} - 0vmax) calc(${rawY} - 0vmax);
    mask-position: calc(${rawX} - 0vmax) calc(${rawY} - 0vmax);
  }
  100% {
    -webkit-mask-size: 300vmax;
    mask-size: 300vmax;
    -webkit-mask-position: calc(${rawX} - 150vmax) calc(${rawY} - 150vmax);
    mask-position: calc(${rawX} - 150vmax) calc(${rawY} - 150vmax);
  }
}
.dark::view-transition-old(root) { z-index: 1; }
.dark::view-transition-new(root) { z-index: 999; }
  `;

  const styleId = "theme-transition-styles";
  if (!animationStyleElement) {
    animationStyleElement = document.createElement("style");
    animationStyleElement.id = styleId;
    document.head.appendChild(animationStyleElement);
  }
  animationStyleElement.textContent = css;

  return { name, css };
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (stored === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = useCallback((buttonElement) => {
    const newMode = !isDarkMode;

    createAnimation(buttonElement);

    const switchTheme = () => {
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      setIsDarkMode(newMode);
    };

    if (document.startViewTransition) {
      document.startViewTransition(switchTheme);
    } else {
      switchTheme();
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};