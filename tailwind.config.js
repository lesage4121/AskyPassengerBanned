/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        asky: {
          brown: {
            50: '#faf8f6',
            100: '#f4f0eb',
            200: '#e8ddd2',
            300: '#d9c5b0',
            400: '#c7a688',
            500: '#b8906b',
            600: '#a67c5a',
            700: '#8b654a',
            800: '#6f5240',
            900: '#5a4335',
            950: '#2f221a',
          },
          orange: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03',
          }
        }
      }
    },
  },
  plugins: [],
};
