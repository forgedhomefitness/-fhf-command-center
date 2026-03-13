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
          50: "#fffdf0",
          100: "#fff9d6",
          200: "#fff3ad",
          300: "#ffec85",
          400: "#ffe45c",
          500: "#FED402",
          600: "#d4b002",
          700: "#aa8d01",
          800: "#806a01",
          900: "#554701",
        },
        navy: {
          50: "#e6eaf0",
          100: "#b3bfcf",
          200: "#8094ae",
          300: "#4d698d",
          400: "#26446b",
          500: "#001F3F",
          600: "#001a36",
          700: "#00152d",
          800: "#001024",
          900: "#000b1b",
        },
        dark: {
          50: "#f5f5f6",
          100: "#e5e5e7",
          200: "#d1d1d4",
          300: "#a9a9ae",
          400: "#7c7c83",
          500: "#5c5c63",
          600: "#4a4a50",
          700: "#1e2a3a",
          800: "#0d1929",
          900: "#091420",
          950: "#060e18",
        },
      },
      fontFamily: {
        heading: ['"Oswald"', 'sans-serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
