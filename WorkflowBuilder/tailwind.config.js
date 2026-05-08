/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#22c55e',
        'brand-red': '#ef4444',
      },
    },
  },
  plugins: [],
}

