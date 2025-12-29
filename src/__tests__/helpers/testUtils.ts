// Shared test utilities and mocks
import { waitFor } from '@testing-library/react';

/**
 * Mock fetch helper with predefined responses
 */
export const createMockFetch = (responses: Record<string, any>) => {
  return jest.fn((url: string, options?: any) => {
    const method = options?.method || 'GET';
    const key = `${method}:${url}`;
    
    // Find matching response
    for (const [pattern, response] of Object.entries(responses)) {
      if (url.includes(pattern) || key.includes(pattern)) {
        return Promise.resolve({
          ok: response.ok !== false,
          status: response.status || 200,
          json: async () => response.data || response,
          text: async () => JSON.stringify(response.data || response),
        });
      }
    }
    
    // Default 404
    return Promise.resolve({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    });
  }) as jest.Mock;
};

/**
 * Wait for element and perform action
 */
export const waitForAndGet = async (getElement: () => HTMLElement, timeout = 3000) => {
  let element: HTMLElement | null = null;
  await waitFor(() => {
    element = getElement();
    expect(element).toBeInTheDocument();
  }, { timeout });
  return element!;
};

/**
 * Mock localStorage with preset values
 */
export const createMockLocalStorage = (initialValues: Record<string, string> = {}) => {
  const store: Record<string, string> = { ...initialValues, jwt_token: 'fake-jwt-token' };
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
};

/**
 * Default calculator config for tests
 */
export const mockCalculatorConfig = {
  promoDiscount: 0.2,
  pricePerExtraGuest: {
    basic: 45,
    premium: 55,
    exclusive: 65,
    kids: 35,
    family: 40,
    business: 70,
  },
  addons: {
    fountain: {
      perGuest: 10,
      min: 600,
      max: 1500,
    },
    keg: {
      pricePerKeg: 550,
      guestsPerKeg: 50,
    },
    lemonade: {
      base: 150,
      blockGuests: 20,
    },
    hockery: 300,
    ledLighting: 500,
  },
  shoppingList: {
    juiceL: 12,
    syrupML: 500,
    sugarKg: 2,
    iceKg: 8,
  },
};

/**
 * Default gallery images for tests
 */
export const mockGalleryImages = [
  {
    id: 1,
    url: 'https://res.cloudinary.com/test/image1.jpg',
    title: 'Wesele 1',
    description: 'Bar na weselu',
    category: 'wesela',
    displayOrder: 1,
    filename: 'image1.jpg',
  },
  {
    id: 2,
    url: 'https://res.cloudinary.com/test/image2.jpg',
    title: 'Event 1',
    description: 'Bar na evencie',
    category: 'eventy',
    displayOrder: 2,
    filename: 'image2.jpg',
  },
  {
    id: 3,
    url: 'https://res.cloudinary.com/test/image3.jpg',
    title: 'Wesele 2',
    description: 'Bar koktajlowy',
    category: 'wesela',
    displayOrder: 3,
    filename: 'image3.jpg',
  },
];

/**
 * Default content sections for tests
 */
export const mockContentSections = [
  {
    id: 'hero',
    title: 'Hero Section',
    content: {
      heading: 'ELIKSIR',
      subheading: 'Mobilny Bar Koktajlowy',
      description: 'Profesjonalna obsługa barmańska',
    },
  },
  {
    id: 'about',
    title: 'About Section',
    content: {
      heading: 'Kim jesteśmy?',
      description: 'Zespół profesjonalnych barmanów...',
    },
  },
  {
    id: 'services',
    title: 'Services Section',
    content: {
      heading: 'Nasze Usługi',
      description: 'Oferujemy kompleksową obsługę...',
    },
  },
];
