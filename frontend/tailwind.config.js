/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          wish: '#22c55e',
        },
        blue: {
          wish: '#3b82f6',
        },
        red: {
          wish: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}