/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        neon: {
          green: "#39ff14",
          blue: "#00f0ff",
          pink: "#ff00ff",
          orange: "#ff6600",
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(57, 255, 20, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(57, 255, 20, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};
