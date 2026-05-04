"use client";

import { motion } from "framer-motion";
import React, { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ThemeToggleButton = ({ className = "" }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const buttonRef = useRef(null);

  const handleClick = () => {
    toggleTheme(buttonRef.current);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label="Toggle theme"
      className={cn(
        "flex items-center justify-center cursor-pointer p-0 transition-all duration-150",
        className,
      )}
      style={{
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: isDarkMode ? '#1A2536' : '#FDFEFF',
        border: isDarkMode ? '1px solid #273347' : '1px solid #D9E1EC',
        boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.28)' : '0 6px 18px rgba(22,32,51,0.08)',
      }}
    >
      <span className="sr-only">Toggle theme</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 32 32"
        style={{ width: 20, height: 20, color: isDarkMode ? '#E7EEF8' : '#172033' }}
      >
        <clipPath id="theme-btn-clip">
          <motion.path
            animate={{ y: isDarkMode ? 5 : 0, x: isDarkMode ? -20 : 0 }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
            d="M0-5h55v37h-55zm32 12a1 1 0 0025 0 1 1 0 00-25 0"
          />
        </clipPath>
        <g clipPath="url(#theme-btn-clip)">
          <circle cx="16" cy="16" r="15" />
        </g>
      </svg>
    </button>
  );
};

export { ThemeToggleButton };
