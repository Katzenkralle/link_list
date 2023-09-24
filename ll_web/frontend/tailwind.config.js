/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    './templates/index.html',
    './src/**/*.{js,jsx,ts,tsx}',],
    theme: {
      extend: {
        // Set dark mode as the default
        defaultMode: 'dark',
      },
    },
    darkMode: 'media',
    plugins: [],
  }
  
  