/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        beat: {
          bg: '#09090b',
          surface: '#18181b',
          surfaceLight: '#27272a',
          pink: '#FF007F',
          pinkLight: '#FF3399',
          cyan: '#00F0FF',
          cyanLight: '#66F7FF',
          yellow: '#FFF000',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
};
