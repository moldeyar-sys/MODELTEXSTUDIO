/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tokens de marca Modeltex (centralizados)
        brand: {
          blue: '#0048AD',
          magenta: '#CB6EE7',
          cream: '#E8E7D3',
          white: '#FFFFFF',
          text: '#0F172A',
        },
        // primary = azul de marca (#0048AD en 800). Re-skin global.
        primary: {
          50: '#e8f0fb',
          100: '#c7dbf5',
          200: '#93b9ea',
          300: '#5b92dd',
          400: '#2e6fcf',
          500: '#1257bf',
          600: '#084fb6',
          700: '#024bb0',
          800: '#0048AD',
          900: '#012f6f',
        },
        // accent = magenta de marca (#CB6EE7).
        accent: {
          50: '#fbf1fd',
          100: '#f5ddfa',
          200: '#ecc0f5',
          300: '#de9bee',
          400: '#cb6ee7',
          500: '#ba53d8',
          600: '#a23dc0',
          700: '#85309e',
          800: '#6b287e',
          900: '#481a55',
        },
        // petroleum = familia violeta (secundarios + fondos claros).
        petroleum: {
          50: '#f3f0fd',
          100: '#e6ddfb',
          200: '#cebdf6',
          300: '#b196ee',
          400: '#9670e4',
          500: '#7e52d6',
          600: '#6a3ec0',
          700: '#57339d',
          800: '#45297b',
          900: '#2e1b53',
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
