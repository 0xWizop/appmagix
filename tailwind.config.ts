import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand: professional green + tech accent
        brand: {
          green: "#22c55e",
          "green-dark": "#16a34a",
          "green-light": "#4ade80",
        },
        // Use CSS variables for theme-aware colors
        background: "rgb(var(--background))",
        surface: "rgb(var(--surface))",
        "surface-hover": "rgb(var(--surface-hover))",
        border: "rgb(var(--border))",
        "text-primary": "rgb(var(--text-primary))",
        "text-secondary": "rgb(var(--text-secondary))",
        "text-muted": "rgb(var(--text-muted))",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
        brand: ["var(--font-brand)", "Georgia", "serif"],
      },
      letterSpacing: {
        tight: "-0.02em",
        tightest: "-0.03em",
      },
      borderRadius: {
        "panel": "6px",
        "card": "8px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-in-from-top-full": "slide-in-from-top-full 0.3s ease-out",
        "slide-in-from-bottom-full": "slide-in-from-bottom-full 0.3s ease-out",
        "slide-out-to-right-full": "slide-out-to-right-full 0.3s ease-in",
        "fade-out-80": "fade-out-80 0.3s ease-in",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
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
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-from-top-full": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-bottom-full": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-out-to-right-full": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-out-80": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
