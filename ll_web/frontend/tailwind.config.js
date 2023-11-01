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
          },
          colors: {
            'cat-bg': '#303446',
            'cat-input': '#232634',
            'cat-inputColor': '#c89ce4',
            'cat-bg2': '#292C3C',
            'cat-surface': '#414559',
            'cat-overlay': '#949cbb',
            'cat-main': '#c6d0f5',
            'cat-sub': '#b5bfe2',
            'cat-light': '#838ba7',
            'cat-link': '#8caaee',
            'cat-linkHover': '#99d1db',
            'cat-success': '#a6d189',
            'cat-warning': '#e5c890',
            'cat-error': '#e78284',
            'cat-border': '#babbf1',
            'cat-borderInactive': '#a6a6a6',
            'cat-bordeBell': '#e5c890',
          },
          fontFamily: {
            'ubuntuMono': ['Ubuntu Mono', 'monospace'],
            'dejavuSansMono': ['dejavu_sans_monobook', 'monospace'],
          },
      },
      screens: {
        'sm': {'max': '768px'},
        // => @media (max-width: 1535px) { ... }
        'lg': {'min': '769px'},
        // => @media (min-width: 768px) { ... }
      },
    },
    darkMode: 'media',
    plugins: [],
  }