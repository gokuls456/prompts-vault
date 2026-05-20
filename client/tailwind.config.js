/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      colors: {
        dark: {
          950: '#030712',
          900: '#050816',
          800: '#0a0f1e',
          700: '#0d1530',
          600: '#111827',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139,92,246,0.3), transparent)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-24px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'orb-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        'orb-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-40px, 30px) scale(0.9)' },
          '66%': { transform: 'translate(30px, -40px) scale(1.1)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'orb-1': 'orb-1 12s ease-in-out infinite',
        'orb-2': 'orb-2 15s ease-in-out infinite',
        'gradient-x': 'gradient-x 4s ease infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(139,92,246,0.4)',
        'glow-lg': '0 0 40px rgba(139,92,246,0.5)',
        glass: '0 8px 32px rgba(0,0,0,0.4)',
        card: '0 4px 24px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
