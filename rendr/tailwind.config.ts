import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1ED760',
          50: '#E8FBEF',
          100: '#C9F6D9',
          400: '#37DE73',
          500: '#1ED760',
          600: '#16BC51',
          700: '#12A044',
        },
        ink: {
          DEFAULT: '#101014',
          soft: '#1A1A1F',
          900: '#0B0B0E',
        },
        slatey: '#6B7280',
        cloud: '#F4F5F3',
        line: '#E9EAE7',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h-xl': ['clamp(2.5rem, 5.5vw, 4.25rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'h-lg': ['clamp(2rem, 4vw, 3.25rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'h-md': ['clamp(1.5rem, 2.6vw, 2.25rem)', { lineHeight: '1.12', letterSpacing: '-0.01em' }],
      },
      maxWidth: {
        container: '1180px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        card: '0 24px 60px -28px rgba(16, 16, 20, 0.25)',
        soft: '0 18px 40px -24px rgba(16, 16, 20, 0.30)',
        pill: '0 14px 30px -12px rgba(30, 215, 96, 0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '70%, 100%': { transform: 'scale(1.7)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        marquee: 'marquee 28s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
