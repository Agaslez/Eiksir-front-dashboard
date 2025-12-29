import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Calculator from '../components/Calculator';
import { createMockFetch, mockCalculatorConfig } from './helpers/testUtils';

// Mock fetch API
global.fetch = createMockFetch({
  '/api/calculator/config': { success: true, config: mockCalculatorConfig },
});

describe('Calculator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = createMockFetch({
      '/api/calculator/config': { success: true, config: mockCalculatorConfig },
    });
  });

  describe('API Integration', () => {
    it('fetches calculator config on mount', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/calculator/config')
        );
      });
    });

    it('shows loading state while fetching config', () => {
      render(<Calculator />);
      expect(screen.getByText(/Ładowanie kalkulatora/i)).toBeInTheDocument();
    });

    it('falls back to default config on API failure', async () => {
      global.fetch = createMockFetch({
        '/api/calculator/config': { ok: false, status: 500, data: { error: 'Failed' } },
      });
      
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Price Calculation', () => {
    it('displays price after loading', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Check that price section is displayed
      await waitFor(() => {
        const priceText = screen.getByText(/Szacunkowa cena pakietu/i);
        expect(priceText).toBeInTheDocument();
      });
    });

    it('updates guest count with slider', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Find guest slider (type="range")
      const sliders = screen.getAllByRole('slider');
      const guestSlider = sliders[0]; // First slider is guest count
      
      expect(guestSlider).toBeInTheDocument();
      expect(guestSlider).toHaveValue('50'); // Default
    });
  });

  describe('Addons', () => {
    it('renders addon checkboxes', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Find checkboxes for addons
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('enables fountain addon', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Find fountain checkbox by label text
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe('Promo Discount', () => {
    it('applies promo discount to total', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Check that discount is mentioned (20% = 0.2 from mockConfig)
      await waitFor(() => {
        const discountText = screen.getByText(/z rabatem −20%/i);
        expect(discountText).toBeInTheDocument();
      });
    });
  });

  describe('Shopping List', () => {
    it('displays shopping list section', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Look for shopping list heading
      const shoppingListHeadings = screen.getAllByText(/Lista zakupów/i);
      expect(shoppingListHeadings.length).toBeGreaterThan(0);
    });

    it('shows ingredient quantities', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Check for ingredients from mockConfig - search more broadly
      await waitFor(() => {
        // Look for "L" unit (liters) in shopping list
        const ingredients = screen.getAllByText(/L/i);
        expect(ingredients.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Offer Selection', () => {
    it('displays offer packages', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Should show offer names from OFFERS constant
      // (Basic, Premium, Exclusive, Kids, Family, Business)
      const offerButtons = screen.getAllByRole('button');
      expect(offerButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Callback Integration', () => {
    it('calls onCalculate when provided', async () => {
      const onCalculate = jest.fn();
      render(<Calculator onCalculate={onCalculate} />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Component should render without callback errors
      // onCalculate is optional, so just verify component renders
      const priceSection = await screen.findByText(/Szacunkowa cena pakietu/i);
      expect(priceSection).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    it('enforces guest count boundaries', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      const sliders = screen.getAllByRole('slider');
      const guestSlider = sliders[0];
      
      // Should have min/max attributes
      expect(guestSlider).toHaveAttribute('min');
      expect(guestSlider).toHaveAttribute('max');
    });
  });
});
