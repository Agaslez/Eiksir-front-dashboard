export type ThemeName = 'eliksir' | 'wedding' | 'neon' | 'light' | 'gold';

export interface Theme {
  name: string;
  bg: string;
  text: string;
  accent: string;
  gradient: string;
  easing: [number, number, number, number];
}

export const themes: Record<ThemeName, Theme> = {
  eliksir: {
    name: 'Eliksir',
    bg: 'bg-black',
    text: 'text-white',
    accent: 'amber-400',
    gradient: 'from-amber-400 to-yellow-500',
    easing: [0.16, 1, 0.3, 1]
  },
  wedding: {
    name: 'Wedding',
    bg: 'bg-rose-50',
    text: 'text-rose-900',
    accent: 'rose-500',
    gradient: 'from-rose-400 to-pink-500',
    easing: [0.22, 1, 0.36, 1]
  },
  neon: {
    name: 'Neon',
    bg: 'bg-black',
    text: 'text-white',
    accent: 'cyan-400',
    gradient: 'from-cyan-400 to-purple-600',
    easing: [0.1, 1, 0.3, 1]
  },
  light: {
    name: 'Light',
    bg: 'bg-white',
    text: 'text-black',
    accent: 'emerald-600',
    gradient: 'from-emerald-500 to-teal-600',
    easing: [0.4, 0, 0.2, 1]
  },
  gold: {
    name: 'Gold',
    bg: 'bg-neutral-900',
    text: 'text-white',
    accent: 'yellow-600',
    gradient: 'from-yellow-600 to-amber-700',
    easing: [0.16, 1, 0.3, 1]
  }
};

export const defaultTheme: ThemeName = 'eliksir';