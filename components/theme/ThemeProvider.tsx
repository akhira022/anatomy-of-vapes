"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
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

interface ThemeOrigin {
  x: number;
  y: number;
}

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode, origin?: ThemeOrigin) => void;
  toggleTheme: (origin?: ThemeOrigin) => void;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function runThemeTransition(apply: () => void, origin?: ThemeOrigin) {
  const doc = document as Document & {
    startViewTransition?: (callback: () => void) => { finished: Promise<void> };
  };

  if (!doc.startViewTransition || prefersReducedMotion()) {
    apply();
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const root = document.documentElement;
  root.style.setProperty("--theme-x", `${x}px`);
  root.style.setProperty("--theme-y", `${y}px`);
  root.style.setProperty("--theme-r", `${radius}px`);

  doc.startViewTransition(apply);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Same default on server + client first paint — avoid hydration mismatch.
  // Actual preference is applied by themeInitScript (DOM) then synced on client.
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    typeof window === "undefined"
      ? DEFAULT_THEME
      : (getStoredTheme() ?? DEFAULT_THEME)
  );
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useServerInsertedHTML(() => (
    <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
  ));

  const setTheme = useCallback((next: ThemeMode, origin?: ThemeOrigin) => {
    runThemeTransition(() => {
      setThemeState(next);
      applyThemeClass(next);
      persistTheme(next);
    }, origin);
  }, []);

  const toggleTheme = useCallback(
    (origin?: ThemeOrigin) => {
      setTheme(theme === "dark" ? "light" : "dark", origin);
    },
    [setTheme, theme]
  );

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
