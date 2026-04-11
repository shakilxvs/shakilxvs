/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // These MUST stay in sync with the CSS variables in app/globals.css.
        // If you change a CSS var there, change it here too.
        'bg-void':     '#05070f',
        'bg-base':     '#05070f',
        'bg-surface':  '#0b0e1a',
        'bg-elevated': '#10152a',
        'bg-overlay':  '#161d35',
        accent:        '#234DC2',
        fire:          '#ff4500',
        gold:          '#f5c518',
        'text-1':      '#e8eaf6',
        'text-2':      '#7986b0',
        'text-3':      '#3d4a72',
        'border-1':    '#0e1225',
        'border-2':    '#182040',
        'border-3':    '#243060',
      },
      fontFamily: {
        bebas:  ['Bebas Neue', 'sans-serif'],
        mono:   ['Space Mono', 'monospace'],
        outfit: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '22px',
      },
      animation: {
        'scan':        'scan 8s linear infinite',
        'spin-slow':   'spin 12s linear infinite',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'marquee':     'marquee 30s linear infinite',
        'marquee-rev': 'marqueeRev 30s linear infinite',
        'fade-up':     'fadeUp 0.5s ease forwards',
        'blink':       'blink 1s step-end infinite',
      },
      keyframes: {
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeRev: {
          '0%':   { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      boxShadow: {
        'card':    '0 4px 24px rgba(0,0,0,0.4)',
        'card-lg': '0 20px 40px rgba(0,0,0,0.35)',
        'glow':    '0 0 20px rgba(35,77,194,0.25)',
        'glow-lg': '0 0 40px rgba(35,77,194,0.3)',
      },
      aspectRatio: {
        '16/9': '16 / 9',
        '9/16': '9 / 16',
      },
    },
  },
  plugins: [],
};
