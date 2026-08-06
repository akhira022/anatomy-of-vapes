export const THEME_STORAGE_KEY = "aov-theme";

export type ThemeMode = "light" | "dark";

/** Default theme used for SSR + first client render (must stay in sync). */
export const DEFAULT_THEME: ThemeMode = "dark";

/** Blocking FOUC script — inject via useServerInsertedHTML, not a raw <script> in JSX. */
export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark")t=${JSON.stringify(DEFAULT_THEME)};var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(t);r.style.colorScheme=t;}catch(e){document.documentElement.classList.add(${JSON.stringify(DEFAULT_THEME)});document.documentElement.style.colorScheme=${JSON.stringify(DEFAULT_THEME)};}})();`;

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function applyThemeClass(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function persistTheme(theme: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore quota / private mode
  }
}
