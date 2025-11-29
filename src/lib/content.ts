// src/lib/content.ts

// ==== Typy ====

export type CocktailCategory = "alcoholic" | "non-alcoholic" | "shot";

export interface Cocktail {
  name: string;
  ingredients: string;
  category: CocktailCategory;
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  price: number; // cena bazowa usługi (bez alkoholu)
  minGuests: number;
  maxGuests: number;
  hours: number; // liczba godzin pracy baru
  drinksPerGuest: number; // średnia liczba koktajli na osobę
  shotsPerGuest?: number; // dla opcji ze shot barem
  features: string[];
  popular?: boolean;
  tag?: string;
}

// ==== Koktajle – do sekcji MENU ====

export const COCKTAILS: Cocktail[] = [
  // Koktajle alkoholowe
  {
    category: "alcoholic",
    name: "Mojito",
    ingredients: "rum, limonka, mięta, cukier trzcinowy, woda gazowana",
  },
  {
    category: "alcoholic",
    name: "Cuba Libre",
    ingredients: "rum, cola, limonka",
  },
  {
    category: "alcoholic",
    name: "Vodka Sour",
    ingredients: "wódka, sok z cytryny, syrop cukrowy",
  },
  {
    category: "alcoholic",
    name: "Sex on the Beach",
    ingredients: "wódka, likier brzoskwiniowy, sok pomarańczowy, żurawina",
  },
  {
    category: "alcoholic",
    name: "Aperol Spritz",
    ingredients: "Aperol, prosecco, woda gazowana, pomarańcza",
  },
  {
    category: "alcoholic",
    name: "Hugo Spritz",
    ingredients: "prosecco, syrop z kwiatów bzu, mięta, limonka, woda gazowana",
  },

  // Bezalkoholowe
  {
    category: "non-alcoholic",
    name: "Virgin Mojito",
    ingredients: "mięta, limonka, cukier trzcinowy, woda gazowana",
  },
  {
    category: "non-alcoholic",
    name: "Domowa Lemoniada",
    ingredients: "cytryna, pomarańcza, syrop/miód, woda",
  },
  {
    category: "non-alcoholic",
    name: "Owocowy Fizz",
    ingredients: "malina lub marakuja, lemoniada, świeże owoce",
  },

  // Shoty
  {
    category: "shot",
    name: "Kamikaze",
    ingredients: "wódka, triple sec / blue curaçao, sok z limonki",
  },
  {
    category: "shot",
    name: "Wściekły Pies",
    ingredients: "wódka, syrop malinowy / grenadina, kropla tabasco",
  },
  {
    category: "shot",
    name: "Cytrynowy",
    ingredients: "wódka, sok z cytryny, syrop cukrowy / likier cytrynowy",
  },
];

// ==== Pakiety – spójne z kalkulatorem ====

export const OFFERS: Record<string, Offer> = {
  basic: {
    id: "basic",
    name: "BASIC",
    description: "Idealny dla kameralnych przyjęć od 20 do 50 osób.",
    price: 2900,
    minGuests: 20,
    maxGuests: 50,
    hours: 5,
    drinksPerGuest: 3, // średnio 3 koktajle / osoba
    features: [
      "Barman",
      "Szkło koktajlowe i 0%",
      "Lód, owoce, dekoracje",
      "6 koktajli signature + 2 bezalkoholowe",
      "Karta koktajli na ladzie",
    ],
  },
  premium: {
    id: "premium",
    name: "PREMIUM",
    description: "Najpopularniejszy wybór – wesela 50–80 gości.",
    price: 3900,
    minGuests: 50,
    maxGuests: 80,
    hours: 6,
    drinksPerGuest: 3.5,
    shotsPerGuest: 1,
    popular: true,
    tag: "Najpopularniejszy",
    features: [
      "2 barmanów (lub barman + barback)",
      "Rozszerzona karta (gin / whisky na życzenie)",
      "Stacja lemoniad 0%",
      "Dekoracje premium",
      "Dostosowanie karty do motywu wesela / eventu",
    ],
  },
  exclusive: {
    id: "exclusive",
    name: "EXCLUSIVE",
    description: "Duże wesela i eventy – pełny efekt WOW.",
    price: 5200,
    minGuests: 80,
    maxGuests: 120,
    hours: 7,
    drinksPerGuest: 4,
    shotsPerGuest: 1.5,
    features: [
      "Barman + barback",
      "Personalizacja baru (LED / branding)",
      "Welcome prosecco / spritz (na życzenie)",
      "Rozbudowana karta koktajli & 0%",
      "Większa ilość szkła i dekoracji w cenie",
    ],
  },
  kids: {
    id: "kids",
    name: "Kids Party 0%",
    description: "Kolorowe mocktaile, lemoniady, bez alkoholu.",
    price: 1900,
    minGuests: 15,
    maxGuests: 40,
    hours: 3,
    drinksPerGuest: 2.5,
    features: [
      "Mocktaile w kolorach tęczy",
      "Stacja lemoniad",
      "Słomki papierowe, confetti-bar",
      "Opcja personalizowanych nazw koktajli",
    ],
  },
  family: {
    id: "family",
    name: "Family & Seniors",
    description: "Łagodne miksy, więcej 0% – komunie, rocznice.",
    price: 2600,
    minGuests: 25,
    maxGuests: 60,
    hours: 4,
    drinksPerGuest: 2.5,
    features: [
      "Łagodne koktajle z niższą zawartością alkoholu",
      "Duży udział napojów 0% dla kierowców",
      "Szybki serwis i wygoda obsługi",
    ],
  },
  business: {
    id: "business",
    name: "Event firmowy",
    description: "Szybki serwis dopasowany do charakteru wydarzenia.",
    price: 3400,
    minGuests: 30,
    maxGuests: 100,
    hours: 4,
    drinksPerGuest: 2.5,
    features: [
      "Karta dopasowana do profilu wydarzenia",
      "Możliwość stacji kawowej / lemoniad",
      "Konfiguracja pod integracje, gale, targi",
    ],
  },
};

// ==== Galeria – zdjęcia bez twarzy ====

export const GALLERY_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&q=80",
  "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=900&q=80",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&q=80",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&q=80",
  "https://images.unsplash.com/photo-1536964549204-655d2a431434?w=900&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80",
  "https://images.unsplash.com/photo-1468465236047-6aac20937e92?w=900&q=80",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&q=80",
];
