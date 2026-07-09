/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          50: '#F0F8FF',
          100: '#E6F3FF',
          200: '#CCE7FF',
          500: '#2196F3',
          600: '#1E88E5',
        },
        severity: {
          blue: '#1E90FF',
          yellow: '#FFD700',
          orange: '#FF8C00',
          red: '#FF0000',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
