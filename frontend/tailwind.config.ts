import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // White base — page background stays white per the brand brief.
        navy: '#FFFFFF', // page background (white base)

        // Chad flag tricolor — the brand palette.
        chad: {
          blue: '#002664',
          yellow: '#FECB00',
          red: '#C8102E',
        },

        // Accent tokens remapped onto the Chad palette so the ~30 files using
        // the original token names re-theme automatically (no content moved).
        teal: {
          electric: '#002664', // primary accent → Chad blue
        },
        steel: '#EEF1F7', // soft cool surface
        frost: '#0B1220', // primary ink (near-black, faint navy)
        indigo: {
          pulse: '#C8102E', // secondary accent → Chad red
        },
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 6vw, 5.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.5rem, 2.5vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(to right, rgba(0, 38, 100, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 38, 100, 0.05) 1px, transparent 1px)',
        'hero-gradient':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 38, 100, 0.16), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(254, 203, 0, 0.12), transparent 55%)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'node-ping': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '70%, 100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'node-ping': 'node-ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
