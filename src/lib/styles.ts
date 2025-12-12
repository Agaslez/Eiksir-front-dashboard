// Global styles for ELIKSIR - consistent design system
export const ELIKSIR_STYLES = {
  // Layout
  container: 'mx-auto px-section-mobile lg:px-section max-w-container',
  section: 'py-16 lg:py-24',
  sectionPadding: 'px-section-mobile lg:px-section',

  // Typography
  heading1:
    'font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white',
  heading2:
    'font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white',
  heading3: 'font-playfair text-2xl md:text-3xl font-bold text-white',
  body: 'font-montserrat text-white/70 text-base md:text-lg leading-relaxed',
  caption: 'font-montserrat text-white/50 text-sm uppercase tracking-wider',

  // Buttons
  buttonPrimary:
    'px-8 py-4 bg-gradient-to-r from-eliksir-gold to-eliksir-goldDark text-black font-bold uppercase tracking-wider rounded-eliksir hover:from-eliksir-goldLight hover:to-eliksir-gold transition-all duration-300 transform hover:scale-105 active:scale-95',
  buttonSecondary:
    'px-8 py-4 border-2 border-eliksir-gold text-eliksir-gold font-bold uppercase tracking-wider rounded-eliksir hover:bg-eliksir-gold/10 hover:border-eliksir-goldLight transition-all duration-300',
  buttonGhost:
    'px-8 py-4 text-white/70 font-medium uppercase tracking-wider hover:text-eliksir-gold transition-colors duration-300',

  // Cards
  card: 'bg-eliksir-dark/50 backdrop-blur-sm border border-white/10 rounded-eliksir-lg p-6 md:p-8',
  cardHover:
    'hover:border-eliksir-gold/30 hover:shadow-2xl hover:shadow-eliksir-gold/10 transition-all duration-500',

  // Forms
  input:
    'w-full px-4 py-3 bg-eliksir-gray border border-white/10 rounded-eliksir text-white placeholder-white/30 focus:border-eliksir-gold focus:outline-none transition-colors',
  label:
    'block text-white/70 text-sm font-medium mb-2 uppercase tracking-wider',

  // Dividers
  divider:
    'w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8',
  dividerShort:
    'w-20 h-px bg-gradient-to-r from-transparent via-eliksir-gold to-transparent mx-auto my-6',

  // Badges
  badge:
    'inline-block px-3 py-1 bg-eliksir-gold/20 text-eliksir-gold text-xs font-bold uppercase tracking-wider rounded-full',

  // Animations
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  float: 'animate-float',

  // Gradients
  textGradient:
    'bg-gradient-to-r from-eliksir-gold via-eliksir-goldLight to-eliksir-gold bg-clip-text text-transparent',
  bgGradient:
    'bg-gradient-to-br from-eliksir-dark via-eliksir-gray to-eliksir-dark',

  // Shadows
  shadowGold: 'shadow-2xl shadow-eliksir-gold/10',
  shadowDark: 'shadow-2xl shadow-black/30',
};

// Consistent spacing system
export const SPACING = {
  xs: '0.5rem', // 8px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '3rem', // 48px
  '2xl': '4rem', // 64px
  '3xl': '6rem', // 96px
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
};

// Z-index system
export const Z_INDEX = {
  base: 1,
  dropdown: 10,
  sticky: 100,
  modal: 1000,
  toast: 10000,
};

// Transition durations
export const TRANSITIONS = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  verySlow: '1000ms',
};

// Export all styles as default
export default {
  ...ELIKSIR_STYLES,
  SPACING,
  BREAKPOINTS,
  Z_INDEX,
  TRANSITIONS,
};
