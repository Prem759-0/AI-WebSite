/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f4f3f7",
        foreground: "#1a1a1a",
        cortex: {
          purple: "#a87ffb",
          light: "#f8f7fa",
          border: "#eae8f0",
          card: "#ffffff"
        }
      },
    },
  },
  plugins: [],
}
