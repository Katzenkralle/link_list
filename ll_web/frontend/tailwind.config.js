/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    './templates/index.html',
    './templates/login.html',
    './src/**/*.{js,jsx,ts,tsx}',],
    theme: {
      extend: {
        // Set dark mode as the default
        defaultMode: 'dark',
          outlineWidth: {
            5: '5px',
          },
          borderRadius: {
            'eml': '1em',
          }
      },
      screens: {
        'sm': {'max': '768px'},
        // => @media (max-width: 1535px) { ... }
        'lg': {'min': '769px'},
        // => @media (min-width: 768px) { ... }
      }
    },
    darkMode: 'media',
    plugins: [],
  }
  
  