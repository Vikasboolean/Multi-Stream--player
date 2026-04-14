// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // optional: central color definitions
        border: "#e5e7eb", // choose the hex you want
        // other semantic colors...
      },
    },
  },
  plugins: [],
}
