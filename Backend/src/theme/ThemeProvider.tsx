import React, { useEffect, useState, createContext, useContext } from "react";

type Theme = "light" | "dark" | "system";
type ThemeCtx = { theme: Theme; setTheme: (t: Theme) => void };

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);
const STORAGE_KEY = "theme-choice";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const effective: "light" | "dark" =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  root.classList.toggle("dark", effective === "dark");

  const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (meta) meta.setAttribute("content", effective === "dark" ? "#0b0b0b" : "#ffffff");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved ?? "system";
  });

  useEffect(() => {
    applyTheme(theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => theme === "system" && applyTheme("system");
    mq.addEventListener?.("change", listener);
    return () => mq.removeEventListener?.("change", listener);
  }, [theme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
