import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "ob-bg":        "#111111",
        "ob-bg-2":      "#1A1A1A",
        "ob-surface":   "#222222",
        "ob-text":      "#FFFFFF",
        "ob-text-2":    "#AAAAAA",
        "ob-muted":     "#555555",
        "ob-border":    "#333333",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Pretendard", "Inter", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      letterSpacing: {
        widest: "0.2em",
        "ultra": "0.35em",
      },
    },
  },
  plugins: [],
};

export default config;
