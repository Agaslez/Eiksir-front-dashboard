/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eliksir': {
          gold: '#D4AF37',
          goldLight: '#FBBF24',
          goldDark: '#B8860B',
          red: '#DC2626',
          purple: '#6B21A8',
          dark: '#0A0A0F',
          gray: '#1A1A2E',
          grayLight: '#2D3748',
        },
        'accent': {
          DEFAULT: '#8A2BE2', // BlueViolet - główny kolor akcentowy
          light: '#9370DB',   // MediumPurple - jaśniejszy odcień
          dark: '#4B0082',    // Indigo - ciemniejszy odcień
        }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      spacing: {
        'section': '5%', // Desktop margins
        'section-mobile': '3%', // Mobile margins
        'container': '90%', // Container width
        'container-mobile': '94%', // Mobile container width
      },
      maxWidth: {
        'container': '1200px', // Max container width
      },
      borderRadius: {
        'eliksir': '12px',
        'eliksir-lg': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      backgroundImage: {
        'gradient-eliksir': 'linear-gradient(135deg, #D4AF37 0%, #FBBF24 50%, #B8860B 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%)',
        'gradient-accent': 'linear-gradient(135deg, #8A2BE2 0%, #9370DB 50%, #4B0082 100%)',
      }
    },
  },
  plugins: [],
}
