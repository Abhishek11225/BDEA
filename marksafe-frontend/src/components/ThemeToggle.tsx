"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Determine initial theme on mount
    const stored = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (stored === "dark" || (!stored && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
    
    setMounted(true);

    // Sync across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "theme") {
        if (e.newValue === "dark") {
          setIsDark(true);
          document.documentElement.classList.add("dark");
        } else if (e.newValue === "light") {
          setIsDark(false);
          document.documentElement.classList.remove("dark");
        } else {
           // fallback if cleared
           if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
             setIsDark(true);
             document.documentElement.classList.add("dark");
           }
        }
      }
    };
    
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    }
  };

  // Avoid hydration mismatch by rendering a placeholder button of exactly the same dimensions
  if (!mounted) {
    return (
      <button
        aria-hidden="true"
        className={`w-10 h-10 flex items-center justify-center rounded-lg opacity-0 pointer-events-none ${className}`}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`w-10 h-10 flex items-center justify-center rounded-lg border focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1 transition-colors duration-150 active:scale-95
        ${
          isDark
            ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
            : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
        }
        ${className}
      `}
    >
      {isDark ? (
        <Sun size={20} strokeWidth={1.5} className="text-amber-400" />
      ) : (
        <Moon size={20} strokeWidth={1.5} className="text-slate-600" />
      )}
    </button>
  );
}
