import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [ripple, setRipple] = useState(null);

  const handleToggle = (e) => {
    // Physical feedback ripple positioning
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y, id: Date.now() });
    
    toggleTheme();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTheme();
    }
  };

  return (
    <div 
      className="theme-toggle-wrapper"
      role="button"
      tabIndex={0}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      aria-pressed={theme === "dark"}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="theme-toggle-capsule"
        style={{ justifyContent: theme === "light" ? "flex-start" : "flex-end" }}
      >
        {/* Animated Sliding Thumb */}
        <motion.div 
          layout
          className="theme-toggle-thumb"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
        
        {/* Sun Icon */}
        <div className={`theme-toggle-icon-container ${theme === "light" ? "active" : ""}`}>
          <svg
            className="theme-icon sun-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        </div>

        {/* Moon Icon */}
        <div className={`theme-toggle-icon-container ${theme === "dark" ? "active" : ""}`}>
          <svg
            className="theme-icon moon-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </div>
      </div>

      {/* Luxury Ripple Indicator */}
      <AnimatePresence>
        {ripple && (
          <motion.span
            key={ripple.id}
            className="theme-ripple"
            initial={{ scale: 0, opacity: 0.35 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ left: ripple.x, top: ripple.y }}
            onAnimationComplete={() => setRipple(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
