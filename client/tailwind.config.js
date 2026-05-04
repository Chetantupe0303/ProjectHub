/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['"Hal Gap"', 'serif'],
        'subheading': ['"Shinka"', 'sans-serif'],
        'paragraph': ['"Shink Mano"', 'serif'],
      },
    },
  },
  plugins: [],
}
