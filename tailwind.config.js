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
        // Theme system - colors dynamically set via CSS variables
        theme: {
          primary: 'var(--theme-primary)',
          secondary: 'var(--theme-secondary)',
          accent: 'var(--theme-accent)',
          background: 'var(--theme-background)',
          surface: 'var(--theme-surface)',
          text: 'var(--theme-text)',
          'text-secondary': 'var(--theme-text-secondary)',
          'text-muted': 'var(--theme-text-muted)',
          border: 'var(--theme-border)',
          'border-light': 'var(--theme-border-light)',
        },
        // GEM (Golden Era Marketplace) brand colors
        primary: {
          50: '#FDFDF5',
          100: '#FAFAEB',
          200: '#F2F1D4',
          300: '#E5E3B0',
          400: '#D4C65A',
          500: '#A69F3C',
          600: '#8A8432',
          700: '#6E6928',
          800: '#524E1E',
          900: '#363414',
        },
        secondary: {
          50: '#F7F7F7',
          100: '#E8E8E8',
          200: '#D4D4D4',
          300: '#A8A8A8',
          400: '#6E6E6E',
          500: '#1A1A1A',
          600: '#161616',
          700: '#121212',
          800: '#0E0E0E',
          900: '#0A0A0A',
        },
        accent: {
          gold: '#C4B84D',
          'gold-light': '#E8DC6A',
          'gold-dark': '#8A8432',
          black: '#1A1A1A',
          white: '#FAFAF8',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
