"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useServerInsertedHTML } from "next/navigation";
import {
  DEFAULT_THEME,
  applyThemeClass,
  getStoredTheme,
  persistTheme,
  themeInitScript,
  type ThemeMode,
} from "@/lib/theme";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Same default on server + client first paint — avoid hydration mismatch.
  // Actual preference is applied by themeInitScript (DOM) then synced in useEffect.
  const [theme, setThemeState] = useState<ThemeMode>(DEFAULT_THEME);
  const [ready, setReady] = useState(false);

  useServerInsertedHTML(() => (
    <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
  ));

  useEffect(() => {
    const stored = getStoredTheme() ?? DEFAULT_THEME;
    setThemeState(stored);
    applyThemeClass(stored);
    setReady(true);
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    applyThemeClass(next);
    persistTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, ready }),
    [theme, setTheme, toggleTheme, ready]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
