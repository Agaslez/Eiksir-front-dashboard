export type OfferId = 'basic' | 'premium' | 'exclusive';

export type AddonId = 'fountain' | 'lemonade' | 'ledbar' | 'hokery' | 'tapbeer';

export interface Offer {
  id: OfferId;
  name: string;
  description: string;
  price: number;
  baseGuests: number;
  features: string[];
  popular?: boolean;
}

export interface Addon {
  id: AddonId;
  name: string;
  description: string;
  price: number;
}

export interface Cocktail {
  name: string;
  ingredients: string;
  category: 'alcoholic' | 'non-alcoholic' | 'shot';
}

export interface GalleryImage {
  src: string;
  alt: string;
  category: string;
}
