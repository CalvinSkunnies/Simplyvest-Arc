/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "rgb(var(--color-base-950) / <alpha-value>)",
          900: "rgb(var(--color-base-900) / <alpha-value>)",
          800: "rgb(var(--color-base-800) / <alpha-value>)",
          700: "rgb(var(--color-base-700) / <alpha-value>)",
          600: "rgb(var(--color-base-600) / <alpha-value>)",
          500: "rgb(var(--color-base-500) / <alpha-value>)",
        },
        plum: {
          950: "rgb(var(--color-plum-950) / <alpha-value>)",
          900: "rgb(var(--color-plum-900) / <alpha-value>)",
          800: "rgb(var(--color-plum-800) / <alpha-value>)",
          700: "rgb(var(--color-plum-700) / <alpha-value>)",
          600: "rgb(var(--color-plum-600) / <alpha-value>)",
          500: "rgb(var(--color-plum-500) / <alpha-value>)",
          400: "rgb(var(--color-plum-400) / <alpha-value>)",
          300: "rgb(var(--color-plum-300) / <alpha-value>)",
          200: "rgb(var(--color-plum-200) / <alpha-value>)",
          100: "rgb(var(--color-plum-100) / <alpha-value>)",
        },
        bg: {
          DEFAULT: "rgb(var(--color-bg) / <alpha-value>)",
          card: "rgb(var(--color-bg-card) / <alpha-value>)",
          elevated: "rgb(var(--color-bg-elevated) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
        },
        error: {
          DEFAULT: "rgb(var(--color-error) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "progress-fill": "progressFill 1s ease-out forwards",
        "reveal": "reveal 0.6s ease-out forwards",
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
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(130, 0, 218, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(130, 0, 218, 0.6)" },
        },
        progressFill: {
          "0%": { width: "0%" },
        },
        reveal: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
