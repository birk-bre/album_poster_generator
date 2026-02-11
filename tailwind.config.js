const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-syne)", ...defaultTheme.fontFamily.sans],
        sans: ["var(--font-dm-sans)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        spotify: {
          green: "#1DB954",
          hover: "#1ed760",
        },
        warm: {
          50: "#ede8e3",
          100: "#ddd5cc",
          200: "#c8bdb0",
          300: "#9b9590",
          400: "#7a746f",
          500: "#5c5753",
          600: "#3d3a36",
          700: "#28261f",
          800: "#1c1c18",
          850: "#161614",
          900: "#111110",
          950: "#0a0a08",
        },
        accent: {
          DEFAULT: "#c8a96e",
          light: "#d4bc8a",
          dark: "#a88d55",
          glow: "rgba(200, 169, 110, 0.12)",
        },
      },
    },
  },
  plugins: [],
};
