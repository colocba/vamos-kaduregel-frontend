/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Archivo"', '"Heebo"', "system-ui", "sans-serif"],
        body: ['"Manrope"', '"Heebo"', "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0b1220",
        paper: "#f6f3ec",
        line: "#e9e5dc",
        ash: {
          DEFAULT: "#5b6470",
          soft: "#8b94a1",
        },
        pitch: {
          50: "#e8f6ee",
          100: "#cdebd9",
          200: "#9fd6b5",
          300: "#6cbe8e",
          400: "#3fa470",
          500: "#1e8a58",
          600: "#0f6b45",
          700: "#0a5237",
          800: "#08402b",
          900: "#04261a",
        },
        stadium: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      boxShadow: {
        card: "0 1px 0 rgba(11,18,32,0.04), 0 8px 24px -12px rgba(11,18,32,0.18)",
        ring: "0 0 0 1px rgba(11,18,32,0.06), 0 6px 20px -10px rgba(11,18,32,0.25)",
      },
      backgroundImage: {
        "pitch-mesh":
          "radial-gradient(1200px 600px at 0% 0%, rgba(15,107,69,0.08), transparent 60%), radial-gradient(900px 500px at 100% 0%, rgba(245,158,11,0.06), transparent 60%)",
        dots: "radial-gradient(rgba(11,18,32,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        dots: "18px 18px",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rise-in": "rise-in 280ms ease-out both",
      },
    },
  },
  plugins: [],
};
