import React from 'react';

// Make React globally available
(global as any).React = React;

// Mock import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'https://stefano-eliksir-backend.onrender.com',
        VITE_CLOUDINARY_CLOUD_NAME: 'dxanil4gc',
        VITE_GA_MEASUREMENT_ID: 'G-93QYC5BVDR',
        MODE: 'test',
      },
    },
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn((key: string) => {
    if (key === 'jwt_token') return 'fake-jwt-token';
    return null;
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock confirm dialog
global.confirm = jest.fn(() => true);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver for framer-motion
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;
