/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:        "#1E40AF",
        "primary-light":"#3B82F6",
        "primary-dark": "#1E3A5F",
        secondary:      "#64748B",
        success:        "#059669",
        danger:         "#DC2626",
        warning:        "#D97706",
        background:     "#EEF2F7",
        surface:        "#FFFFFF",
        accent:         "#0EA5E9",
        gold:           "#F59E0B",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      backgroundImage: {
        'sidebar-gradient':  'linear-gradient(180deg, #0F2044 0%, #1E3A5F 50%, #1E40AF 100%)',
        'header-gradient':   'linear-gradient(90deg, #0F2044 0%, #1E3A5F 60%, #1E40AF 100%)',
        'hero-gradient':     'linear-gradient(135deg, #0F2044 0%, #1E3A5F 50%, #1E40AF 100%)',
        'card-gradient':     'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)',
        'gold-gradient':     'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'glass-gradient':    'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'card':        '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(30,64,175,0.06)',
        'card-hover':  '0 8px 30px rgba(30,64,175,0.14)',
        'card-lg':     '0 4px 24px rgba(30,64,175,0.10)',
        'sidebar':     '4px 0 24px rgba(15,32,68,0.25)',
        'header':      '0 2px 20px rgba(15,32,68,0.3)',
        'glow-blue':   '0 0 20px rgba(59,130,246,0.35)',
        'glow-green':  '0 0 20px rgba(5,150,105,0.35)',
        'glow-amber':  '0 0 20px rgba(245,158,11,0.35)',
        'glow-red':    '0 0 20px rgba(220,38,38,0.35)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.15)',
        'float':       '0 20px 60px rgba(30,64,175,0.2)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'bounce-slow':  'bounce 2s ease-in-out infinite',
        'glow':         'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 5px rgba(59,130,246,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(59,130,246,0.6)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
