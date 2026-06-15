/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tokens de marca Moldey (centralizados)
        brand: {
          blue: '#1C3084',
          orange: '#F37D1D',
          lavender: '#BC9DF6',
          'lavender-light': '#CAAAFC',
          purple: '#AB8EEA',
          white: '#FFFFFF',
          text: '#0F172A',
        },
        // primary = azul de marca (#1C3084 en 800). Re-skin global.
        primary: {
          50: '#eef1fb',
          100: '#d4ddf4',
          200: '#aac0ea',
          300: '#7f9ddb',
          400: '#4f72c4',
          500: '#2f4faa',
          600: '#243f93',
          700: '#203885',
          800: '#1C3084',
          900: '#15235c',
        },
        // accent = naranja de marca (#F37D1D en 500).
        accent: {
          50: '#fef3e9',
          100: '#fde0c6',
          200: '#fbc28a',
          300: '#f9a455',
          400: '#f68d33',
          500: '#F37D1D',
          600: '#d96512',
          700: '#b44e12',
          800: '#8f3f15',
          900: '#743516',
        },
        // petroleum = familia lavanda/púrpura de marca (secundarios).
        petroleum: {
          50: '#f6f2fe',
          100: '#ece3fd',
          200: '#ddccfb',
          300: '#caaafc',
          400: '#bc9df6',
          500: '#ab8eea',
          600: '#9070d8',
          700: '#7855bd',
          800: '#5e4498',
          900: '#3f2e64',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
