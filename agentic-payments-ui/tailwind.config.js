/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        golden: {
          50: '#fcfaf6',
          100: '#f7f1e3',
          200: '#efe0c1',
          300: '#e5c997',
          400: '#dbad66',
          500: '#d2933f',
          600: '#c37a32',
          700: '#a35f2a',
          800: '#844d27',
          900: '#6a3f23',
        },
        brown: {
          900: '#3A2618',
          800: '#4A3320',
          700: '#5C4028',
        }
      }
    },
  },
  plugins: [],
}
