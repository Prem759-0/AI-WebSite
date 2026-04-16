import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", 
    "./components/**/*.{js,ts,jsx,tsx}"
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
} satisfies Config;
