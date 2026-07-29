import { createContext, useContext, useEffect, useState } from "react";
import { useSiteSettings } from "./SiteSettingsContext";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { settings, loading } = useSiteSettings();
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  const toggleTheme = () => {
    if (settings.theme_mode === "always-dark" || settings.theme_mode === "always-light") {
      return; // Locked by admin settings
    }
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Sync theme state with database configurations
  useEffect(() => {
    if (loading) return;

    const root = document.documentElement;
    
    const applyTheme = (newTheme) => {
      setThemeState(newTheme);
      root.setAttribute("data-theme", newTheme);
    };

    if (settings.theme_mode === "always-dark") {
      applyTheme("dark");
    } else if (settings.theme_mode === "always-light") {
      applyTheme("light");
    } else if (settings.theme_mode === "system-preference") {
      const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      applyTheme(systemPreference);
    } else { // user-controlled
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        applyTheme(savedTheme);
      } else {
        const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        applyTheme(systemPreference);
      }
    }
  }, [settings.theme_mode, loading]);

  // Sync with dynamic system/OS level preference updates
  useEffect(() => {
    if (loading || settings.theme_mode !== "system-preference") return;

    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleSystemThemeChange = (e) => {
      const newTheme = e.matches ? "dark" : "light";
      setThemeState(newTheme);
      root.setAttribute("data-theme", newTheme);
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [settings.theme_mode, loading]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
