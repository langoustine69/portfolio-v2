/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      // Neo-Brutalism: 0 border radius by default
      borderRadius: {
        'none': '0',
        'brutal': '0',
        DEFAULT: '0',
      },
      colors: {
        // Neo-Brutalist palette - bold primaries
        lobster: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        // Brutal blacks
        shell: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#000000',
        },
        // Brutal accent colors
        brutal: {
          yellow: '#FFDE59',
          cyan: '#00D9FF',
          lime: '#B8FF57',
          pink: '#FF6B9D',
          orange: '#FF914D',
          purple: '#9B5DE5',
        },
        // Keep coral
        coral: {
          400: '#ff6b6b',
          500: '#ff5252',
          600: '#ff3838',
        },
      },
      boxShadow: {
        // Neo-Brutalist hard shadows
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-sm': '2px 2px 0px 0px #000000',
        'brutal-lg': '6px 6px 0px 0px #000000',
        'brutal-xl': '8px 8px 0px 0px #000000',
        'brutal-hover': '6px 6px 0px 0px #000000',
        'brutal-active': '2px 2px 0px 0px #000000',
        // Colored brutal shadows
        'brutal-lobster': '4px 4px 0px 0px #e11d48',
        'brutal-yellow': '4px 4px 0px 0px #FFDE59',
        'brutal-cyan': '4px 4px 0px 0px #00D9FF',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#18181b',
            a: {
              color: '#e11d48',
              fontWeight: '700',
              textDecoration: 'underline',
              textDecorationThickness: '2px',
              '&:hover': {
                color: '#f43f5e',
                backgroundColor: '#FFDE59',
              },
            },
            h1: { color: '#000000', fontWeight: '900' },
            h2: { color: '#000000', fontWeight: '800' },
            h3: { color: '#000000', fontWeight: '700' },
            h4: { color: '#000000', fontWeight: '700' },
            strong: { color: '#000000' },
            code: { 
              color: '#e11d48',
              backgroundColor: '#FFDE59',
              padding: '2px 4px',
              fontWeight: '600',
            },
            blockquote: {
              color: '#18181b',
              borderLeftColor: '#000000',
              borderLeftWidth: '4px',
              fontWeight: '500',
            },
          },
        },
        dark: {
          css: {
            color: '#fafafa',
            a: {
              color: '#fb7185',
              '&:hover': {
                color: '#000000',
                backgroundColor: '#FFDE59',
              },
            },
            h1: { color: '#ffffff', fontWeight: '900' },
            h2: { color: '#ffffff', fontWeight: '800' },
            h3: { color: '#ffffff', fontWeight: '700' },
            h4: { color: '#ffffff', fontWeight: '700' },
            strong: { color: '#ffffff' },
            code: { 
              color: '#000000',
              backgroundColor: '#FFDE59',
            },
            blockquote: {
              color: '#fafafa',
              borderLeftColor: '#FFDE59',
            },
          },
        },
      },
      animation: {
        'brutal-shake': 'brutal-shake 0.5s ease-in-out',
        'brutal-bounce': 'brutal-bounce 0.3s ease-out',
      },
      keyframes: {
        'brutal-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        'brutal-bounce': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
