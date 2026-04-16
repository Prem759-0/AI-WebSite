/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cortex: {
          purple: "#a87ffb",
          light: "#f8f7fa",
          border: "#eae8f0",
        }
      }
    }
  },
  plugins: [],
}
