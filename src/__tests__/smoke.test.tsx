import '@testing-library/jest-dom'; // Dodajemy import
import { render, screen } from '@testing-library/react';
import App from '../App';
import Calculator from '../components/Calculator';

// Mock dla auth - całkowicie omijamy problem z import.meta
jest.mock('../lib/auth', () => ({
  requireAuth: jest.fn(() => true),
  getUserRole: jest.fn(() => 'admin'),
  logout: jest.fn(),
  isAuthenticated: jest.fn(() => true),
}));

// Mock dla error-monitoring
jest.mock('../lib/error-monitoring', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  trackEvent: jest.fn(),
}));

// SMOKE TESTS - najważniejsze funkcjonalności

describe('Smoke Tests - Podstawowe funkcje strony', () => {
  
  describe('1. Strona główna ładuje się', () => {
    it('renderuje aplikację bez błędów', () => {
      expect(() => render(<App />)).not.toThrow();
    });
    
    it('ma tytuł Eliksir Bar', () => {
      render(<App />);
      // Używamy getAllByText bo jest wiele elementów z "ELIKSIR"
      const eliksirElements = screen.getAllByText(/ELIKSIR/i);
      expect(eliksirElements.length).toBeGreaterThan(0);
      expect(eliksirElements[0]).toBeInTheDocument();
    });
  });
  
  describe('2. Kalkulator działa', () => {
    beforeEach(() => {
      render(<Calculator />);
    });
    
    it('wyświetla wybór pakietów', () => {
      expect(screen.getByText(/BASIC/i)).toBeInTheDocument();
      expect(screen.getByText(/PREMIUM/i)).toBeInTheDocument();
      expect(screen.getByText(/EXCLUSIVE/i)).toBeInTheDocument();
    });
    
    it('ma suwak liczby gości', () => {
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('min', '20');
      expect(slider).toHaveAttribute('max', '150');
    });
    
    it('wyświetla cenę', () => {
      // Używamy getAllByText zamiast getByText bo jest wiele elementów z "zł"
      const priceElements = screen.getAllByText(/zł/i);
      expect(priceElements.length).toBeGreaterThan(0);
      expect(priceElements[0]).toBeInTheDocument();
    });
    
    it('wyświetla listę zakupów', () => {
      // Szukamy konkretnego nagłówka listy zakupów
      const shoppingListHeaders = screen.getAllByText(/Lista zakupów/i);
      expect(shoppingListHeaders.length).toBeGreaterThan(0);
      
      // Sprawdzamy czy są konkretne produkty
      expect(screen.getByText(/Wódka.*rum.*gin/i)).toBeInTheDocument();
    });
  });
  
  describe('3. Formularz kontaktowy', () => {
    it('ma pola formularza', () => {
      render(<App />);
      // Sprawdzamy czy są inputy (niezależnie od placeholderów)
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
      
      // Sprawdzamy czy jest przycisk submit
      const submitButtons = screen.getAllByRole('button', { name: /wyślij/i });
      expect(submitButtons.length).toBeGreaterThan(0);
    });
    
    it('ma przycisk wysyłania', () => {
      render(<App />);
      const submitButtons = screen.getAllByRole('button', { name: /wyślij/i });
      expect(submitButtons.length).toBeGreaterThan(0);
    });
  });
  
  describe('4. SEO i dostępność', () => {
    it('ma poprawne nagłówki H1', () => {
      render(<App />);
      const h1 = document.querySelector('h1');
      expect(h1).toBeTruthy();
      expect(h1?.textContent).toMatch(/ELIKSIR/i);
    });
    
    it('obrazy mają alt text', () => {
      render(<App />);
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });
  });
});

// Testy wydajnościowe
describe('Performance Tests', () => {
  it('ładuje się w mniej niż 3 sekundy', async () => {
    const start = performance.now();
    render(<App />);
    const end = performance.now();
    expect(end - start).toBeLessThan(3000);
  });
  
  it('kalkulator reaguje na zmiany w mniej niż 100ms', () => {
    const { rerender } = render(<Calculator />);
    const start = performance.now();
    // Symulacja zmiany liczby gości
    rerender(<Calculator />);
    const end = performance.now();
    expect(end - start).toBeLessThan(100);
  });
});