import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: "#E53935",
        primaryHover: "#C62828",
        background: "#080808",
        surface: "#141414",
        surface2: "#202020",
        card: "#1C1C1C",
        border: "#2A2A2A",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        toxic: "#8B5CF6",
        textPrimary: "#FFFFFF",
        textSecondary: "#9CA3AF",
        textDisabled: "#6B7280",
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-noto-sans-thai)", "Noto Sans Thai", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
        popup: "0 8px 32px rgba(0, 0, 0, 0.55)",
        glowRed: "0 0 20px rgba(229, 57, 53, 0.45)",
        glowGreen: "0 0 20px rgba(34, 197, 94, 0.4)",
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
