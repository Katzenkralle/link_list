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
      screens: {
        'sm': {'max': '768px'},
        // => @media (max-width: 1535px) { ... }
        'lg': '769px',
        // => @media (min-width: 768px) { ... }
      }
    },
    darkMode: 'media',
    plugins: [],
  }
  
  