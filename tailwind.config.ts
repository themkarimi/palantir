import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0d0f14',
        accent: '#00e5ff',
        surface: 'rgba(255,255,255,0.04)',
        'surface-hover': 'rgba(255,255,255,0.07)',
        border: 'rgba(255,255,255,0.08)',
        'border-hover': 'rgba(255,255,255,0.16)',
        muted: 'rgba(255,255,255,0.4)',
      },
      fontFamily: {
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(0,229,255,0.25)',
        'glow-sm': '0 0 12px rgba(0,229,255,0.12)',
        'glow-lg': '0 0 40px rgba(0,229,255,0.3)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      keyframes: {
        'ping-slow': {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'ping-slow': 'ping-slow 2s cubic-bezier(0,0,0.2,1) infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.2s ease-out',
        'toast-in': 'toast-in 0.25s ease-out',
      },
      backgroundImage: {
        'dot-pattern':
          'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        dots: '24px 24px',
      },
    },
  },
  plugins: [],
}
export default config
