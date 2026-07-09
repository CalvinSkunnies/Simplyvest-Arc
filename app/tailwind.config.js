/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#07030f",
          900: "#0a0720",
          800: "#100a1a",
          700: "#1a1228",
          600: "#241a36",
          500: "#2a1a40",
        },
        plum: {
          950: "#1a052e",
          900: "#2f0d50",
          800: "#410a86",
          700: "#5d0ec0",
          600: "#6e11b0",
          500: "#8200da",
          400: "#9810fa",
          300: "#b04aff",
          200: "#c07eff",
          100: "#d4a8ff",
        },
        bg: {
          DEFAULT: "#07030f",
          card: "#0f0a1e",
          elevated: "#1a1228",
          border: "#2a1a40",
        },
        text: {
          primary: "#e8e0f0",
          secondary: "#9a8ab0",
          muted: "#6a5a80",
        },
        success: { DEFAULT: "#047857", light: "#065f46" },
        error: { DEFAULT: "#991b1b", light: "#7f1d1d" },
        warning: { DEFAULT: "#b45309", light: "#92400e" },
      },
      fontFamily: {
        display: ["\"Space Grotesk\"", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["\"JetBrains Mono\"", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "progress-fill": "progressFill 1s ease-out forwards",
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
      },
    },
  },
  plugins: [],
};
