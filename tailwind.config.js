/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}', // optional if you have a separate /components folder
  ],
  theme: {
    extend: {
      fontFamily: {
        amiri: ['Amiri', 'serif'],
      },
      colors: {
        emerald: {
          900: '#064e3b',
        },
      },
    },
  },
  plugins: [],
};
