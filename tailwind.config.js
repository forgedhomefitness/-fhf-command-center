/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef3e2",
          100: "#fde4b9",
          200: "#fcd38c",
          300: "#fbc15e",
          400: "#fab43c",
          500: "#f9a825",
          600: "#f59100",
          700: "#e07c00",
          800: "#c96800",
          900: "#a35200",
        },
        dark: {
          50: "#f5f5f6",
          100: "#e5e5e7",
          200: "#d1d1d4",
          300: "#a9a9ae",
          400: "#7c7c83",
          500: "#5c5c63",
          600: "#4a4a50",
          700: "#3a3a3f",
          800: "#2a2a2f",
          900: "#1a1a1f",
          950: "#0f0f12",
        },
      },
    },
  },
  plugins: [],
};
