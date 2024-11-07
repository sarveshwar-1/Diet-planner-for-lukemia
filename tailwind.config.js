/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#E0F7FA", // Light blue background color
        main: "#1E90FF",     // Primary blue color for buttons or accents
        black: {
          DEFAULT: "#0D1B2A",   // Dark blue-black for text
          100: "#1B263B",       // Slightly lighter blue-black
          200: "#2C3E50",       // Lighter blue-black for backgrounds
        },
        gray: {
          100: "#B0C4DE", // Light gray-blue
          200: "#5D737E", // Medium blue-gray
          300: "#7A8A97"  // Darker blue-gray for subtle text
        },
      },
      fontFamily: {
        pbold: ["SF-Bold", "sans-serif"],
        psemibold: ["SF-Semi-Bold", "sans-serif"],
        pmedium: ["SF-Medium", "sans-serif"]
      },
    },
  },
  plugins: [],
};
