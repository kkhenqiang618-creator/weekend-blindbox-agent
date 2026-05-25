/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        magic: {
          purple: '#7C3AED',
          'purple-dark': '#5B21B6',
          'purple-light': '#A78BFA',
          'purple-soft': '#EDE9FE',
          gold: '#FBBF24',
          'gold-dark': '#D97706',
          'gold-light': '#FDE68A',
          'gold-soft': '#FEF3C7',
          dark: '#1E1B4B',
          surface: '#FAF5FF',
          card: '#FFFFFF',
          glow: '#C084FC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        logo: ['Fredoka', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        bounceIn: { '0%': { opacity:'0', transform:'scale(0.3)' }, '50%': { transform:'scale(1.05)' }, '70%': { transform:'scale(0.95)' }, '100%': { opacity:'1', transform:'scale(1)' } },
        pulseSoft: { '0%,100%': { opacity:'1' }, '50%': { opacity:'0.7' } },
        shimmer: { '0%': { backgroundPosition:'-200% 0' }, '100%': { backgroundPosition:'200% 0' } },
        float: { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-10px)' } },
        sparkle: { '0%,100%': { opacity:'0', transform:'scale(0) rotate(0deg)' }, '50%': { opacity:'1', transform:'scale(1) rotate(180deg)' } },
        glowPulse: { '0%,100%': { opacity:'0.4', transform:'scale(1)' }, '50%': { opacity:'0.8', transform:'scale(1.05)' } },
      },
      backgroundImage: {
        'magic-gradient': 'linear-gradient(135deg, #FAF5FF 0%, #FEF3C7 30%, #FDF2F8 50%, #EDE9FE 70%, #FAF5FF 100%)',
        'magic-card': 'linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(251,191,36,0.04) 100%)',
      },
    },
  },
  plugins: [],
};
