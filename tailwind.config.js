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
      borderRadius: {
        'none': '0',
        DEFAULT: '0',
      },
      colors: {
        // Lobster accent - the only color
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
        // Terminal greys
        term: {
          black: '#0a0a0a',
          dark: '#121212',
          mid: '#1a1a1a',
          border: '#2a2a2a',
          muted: '#666666',
          text: '#a0a0a0',
          light: '#e0e0e0',
          white: '#f5f5f5',
        },
        // Legacy aliases for shell-* and brutal-* classes
        shell: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#a0a0a0',
          300: '#a0a0a0',
          400: '#666666',
          500: '#666666',
          600: '#2a2a2a',
          700: '#1a1a1a',
          800: '#121212',
          900: '#0a0a0a',
          950: '#0a0a0a',
        },
        brutal: {
          yellow: '#f43f5e',
          cyan: '#f43f5e',
          lime: '#a0a0a0',
          pink: '#f43f5e',
          orange: '#f43f5e',
          purple: '#f43f5e',
        },
      },
      boxShadow: {
        'none': 'none',
        'glow': '0 0 10px rgba(244, 63, 94, 0.3)',
        'glow-sm': '0 0 5px rgba(244, 63, 94, 0.2)',
      },
      borderWidth: {
        '1': '1px',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.7' }],
        'lg': ['1.125rem', { lineHeight: '1.7' }],
        'xl': ['1.25rem', { lineHeight: '1.6' }],
        '2xl': ['1.5rem', { lineHeight: '1.5' }],
        '3xl': ['1.875rem', { lineHeight: '1.4' }],
        '4xl': ['2.25rem', { lineHeight: '1.3' }],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#a0a0a0',
            fontFamily: 'JetBrains Mono, monospace',
            a: {
              color: '#f43f5e',
              textDecoration: 'none',
              borderBottom: '1px solid #f43f5e',
              '&:hover': {
                color: '#fb7185',
                borderBottomColor: '#fb7185',
              },
            },
            h1: { color: '#f5f5f5', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' },
            h2: { color: '#f5f5f5', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' },
            h3: { color: '#e0e0e0', fontWeight: '500', fontFamily: 'JetBrains Mono, monospace' },
            h4: { color: '#e0e0e0', fontWeight: '500', fontFamily: 'JetBrains Mono, monospace' },
            strong: { color: '#f5f5f5' },
            code: { 
              color: '#f43f5e',
              backgroundColor: '#1a1a1a',
              padding: '2px 6px',
              borderRadius: '0',
              border: '1px solid #2a2a2a',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              border: 'none',
            },
            blockquote: {
              color: '#a0a0a0',
              borderLeftColor: '#f43f5e',
              borderLeftWidth: '2px',
              fontStyle: 'normal',
            },
          },
        },
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'type': 'type 0.5s steps(10)',
      },
      keyframes: {
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'type': {
          from: { width: '0' },
          to: { width: '100%' },
        },
      },
    },
  },
  plugins: [],
}
