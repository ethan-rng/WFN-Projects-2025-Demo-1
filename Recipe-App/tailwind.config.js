/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.js",
    // Add any other paths where you use Tailwind classes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

