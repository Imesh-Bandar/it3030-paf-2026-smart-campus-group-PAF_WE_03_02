/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        campus: {
          navy: '#132137',
          sky: '#edf4ff',
          accent: '#007f8c',
        },
      },
    },
  },
  plugins: [],
};
