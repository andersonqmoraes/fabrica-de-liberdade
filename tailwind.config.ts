import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand Colors — Fábrica de Liberdade
        brand: {
          50: "#f0fdf9",
          100: "#ccfbef",
          200: "#99f5de",
          300: "#5eeac8",
          400: "#2dd5ae",
          500: "#10b981", // primary
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        dark: {
          900: "#020203",
          800: "#0a0a0b",
          700: "#111113",
          600: "#18181b",
          500: "#1f1f23",
          400: "#27272b",
          300: "#3f3f46",
          200: "#52525b",
          100: "#71717a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "Sora", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient":
          "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(16,185,129,0.3), rgba(0,0,0,0))",
        "card-gradient":
          "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,0,0,0))",
        "glow-brand":
          "radial-gradient(circle at center, rgba(16,185,129,0.15), transparent 70%)",
      },
      boxShadow: {
        brand: "0 0 30px rgba(16,185,129,0.15)",
        "brand-lg": "0 0 60px rgba(16,185,129,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(16,185,129,0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(16,185,129,0.3)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#e4e4e7",
            a: { color: "#10b981", "&:hover": { color: "#34d399" } },
            h1: { color: "#f9fafb" },
            h2: { color: "#f3f4f6" },
            h3: { color: "#e5e7eb" },
            strong: { color: "#f9fafb" },
            code: {
              color: "#10b981",
              backgroundColor: "#18181b",
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
            },
            blockquote: {
              borderLeftColor: "#10b981",
              color: "#9ca3af",
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
