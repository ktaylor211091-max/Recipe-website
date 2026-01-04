"use client";

import { useEffect, useState } from "react";

export function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      const isDark = stored === "true";
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Check system preference
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
    }
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || darkMode === null) {
    return (
      <button className="rounded-lg border border-neutral-300 bg-white p-2 transition-colors hover:bg-neutral-50">
        <svg className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="rounded-lg border border-neutral-300 bg-white p-2 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
