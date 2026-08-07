import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        primaryHover: "var(--primary-hover)",
        background: "var(--background)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        card: "var(--card)",
        border: "var(--border)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
        toxic: "var(--toxic)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textDisabled: "var(--text-disabled)",
      },
      fontFamily: {
        heading: [
          "var(--font-ibm-plex-sans-thai)",
          "IBM Plex Sans Thai",
          "sans-serif",
        ],
        body: [
          "var(--font-ibm-plex-sans-thai)",
          "IBM Plex Sans Thai",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        popup: "var(--shadow-popup)",
        glowRed: "var(--shadow-glow-red)",
        glowGreen: "var(--shadow-glow-green)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
        slower: "500ms",
      },
      borderRadius: {
        ds: "0.5rem",
        "ds-md": "0.75rem",
        "ds-lg": "1.25rem",
        "ds-xl": "1.5rem",
      },
    },
  },
};

export default config;
