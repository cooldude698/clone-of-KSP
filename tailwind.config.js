/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme variables mapping
        void: {
          000: 'var(--color-void-000)',
        },
        steel: {
          700: 'var(--color-steel-700)',
          600: 'var(--color-steel-600)',
        },
        phosphor: {
          500: 'var(--color-phosphor-500)',
        },
        warn: {
          500: 'var(--color-warn-500)',
        },
        critical: {
          500: 'var(--color-critical-500)',
        },
        stamp: {
          red: {
            500: 'var(--color-stamp-red-500)',
          },
        },
        success: {
          500: 'var(--color-success-500)',
        },
        paper: {
          100: 'var(--color-paper-100)',
        },
        // Legacy fallbacks mapped to CSS variables for instant app-wide color swapping
        navy: {
          950: 'var(--color-void-000)',
          900: 'var(--color-steel-700)',
          800: 'var(--color-steel-600)',
          700: 'var(--color-steel-600)', // border fallback
          600: 'var(--color-steel-600)', // muted fallback
        },
        accent: {
          500: 'var(--color-phosphor-500)',
          400: 'var(--color-phosphor-500)',
          300: 'var(--color-phosphor-500)',
        },
        alert: {
          500: 'var(--color-critical-500)',
          400: 'var(--color-warn-500)',
          300: 'var(--color-warn-500)',
        },
        saffron: {
          500: 'var(--color-warn-500)', // map saffron to warn for consistency or keep custom
        },
      },
      fontFamily: {
        sans: ['var(--font-google-sans)', '"Google Sans"', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'Montserrat', '"Google Sans"', 'sans-serif'],
        mono: ['var(--font-google-sans)', '"Google Sans"', '"Plus Jakarta Sans"', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
