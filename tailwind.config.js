/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        soga: {
          50: "#fbf6ee",
          100: "#f2e3ce",
          200: "#dfc29c",
          300: "#c99966",
          400: "#a96c3e",
          500: "#794327",
          600: "#5c2f21",
          700: "#3b211b",
        },
        heritage: {
          ink: "#17120f",
          charcoal: "#2a2521",
          maroon: "#5c2024",
          gold: "#b88a4a",
          ivory: "#fffaf1",
          indigo: "#1d3a48",
        },
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 22px 70px rgba(23, 18, 15, 0.12)",
      },
    },
  },
  plugins: [],
};
