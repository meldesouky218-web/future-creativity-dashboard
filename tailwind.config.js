/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        royalGreen: "#0B5C4A",
        matteGold: "#C2A14A",
        darkBg: "#0C0C0C",
        lightText: "#EAEAEA"
      }
    }
  },
  plugins: [],
};
