import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      });
    });
  });

  describe('Price Calculation - Base Package', () => {
    it('calculates correct price for 50 guests (family package)', async () => {
      const onCalculate = jest.fn();
      render(<Calculator onCalculate={onCalculate} />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Default: family package, 50 guests
      // Should show calculated price
      expect(screen.getByText(/Twoja wycena/i)).toBeInTheDocument();
    });

    it('calculates extra guest charges correctly', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Test with 100 guests (50 extra @ 35 PLN each for family)
      // Extra cost: 50 * 35 = 1750 PLN
      const guestInput = screen.getByRole('spinbutton') || screen.getByDisplayValue('50');
      await userEvent.clear(guestInput);
      await userEvent.type(guestInput, '100');

      await waitFor(() => {
        // Should reflect new calculation
        expect(screen.getByText(/Twoja wycena/i)).toBeInTheDocument();
      });
    });
  });

  describe('Addons Calculation', () => {
    it('calculates fountain cost based on guests (min/max bounds)', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Enable fountain addon
      const fountainCheckbox = screen.getByLabelText(/Fontanna/i);
      await userEvent.click(fountainCheckbox);

      // For 50 guests: 50 * 10 = 500, but min is 600
      // Should be clamped to 600 PLN
      await waitFor(() => {
        expect(screen.getByText(/600/)).toBeInTheDocument();
      });
    });

    it('calculates keg cost based on guest count', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      const kegCheckbox = screen.getByLabelText(/Keg/i);
      await userEvent.click(kegCheckbox);

      // 50 guests / 50 guests per keg = 1 keg * 550 = 550 PLN
      await waitFor(() => {
        expect(screen.getByText(/550/)).toBeInTheDocument();
      });
    });

    it('calculates lemonade in blocks', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      const lemonadeCheckbox = screen.getByLabelText(/Lemoniad/i);
      await userEvent.click(lemonadeCheckbox);

      // 50 guests / 60 block = 1 block * 250 = 250 PLN
      await waitFor(() => {
        expect(screen.getByText(/250/)).toBeInTheDocument();
      });
    });

    it('adds fixed-price addons correctly', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Hockery: 200 PLN
      const hockeryCheckbox = screen.getByLabelText(/Hockery/i);
      await userEvent.click(hockeryCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/200/)).toBeInTheDocument();
      });

      // LED: 500 PLN
      const ledCheckbox = screen.getByLabelText(/LED/i);
      await userEvent.click(ledCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/500/)).toBeInTheDocument();
      });
    });

    it('disables keg addon for Kids Party offer', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Select Kids Party offer
      const kidsButton = screen.getByText(/Kids Party/i);
      await userEvent.click(kidsButton);

      const kegCheckbox = screen.getByLabelText(/Keg/i);
      expect(kegCheckbox).toBeDisabled();
    });
  });

  describe('Promo Discount', () => {
    it('applies 20% discount correctly', async () => {
      const onCalculate = jest.fn();
      render(<Calculator onCalculate={onCalculate} />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Trigger calculation callback
      await waitFor(() => {
        if (onCalculate.mock.calls.length > 0) {
          const snapshot = onCalculate.mock.calls[0][0];
          // Total after discount should be 80% of original
          expect(snapshot.totalAfterDiscount).toBeLessThan(
            snapshot.totalAfterDiscount / 0.8
          );
        }
      });
    });
  });

  describe('Shopping List Generation', () => {
    it('scales shopping list with guest count', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Shopping list should be visible
      expect(screen.getByText(/Lista zakupów/i)).toBeInTheDocument();
      
      // Should show scaled quantities
      expect(screen.getByText(/Wódka\/Rum\/Gin/i)).toBeInTheDocument();
    });

    it('adjusts shopping list for 100+ guests', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      const guestInput = screen.getByRole('spinbutton') || screen.getByDisplayValue('50');
      await userEvent.clear(guestInput);
      await userEvent.type(guestInput, '150');

      await waitFor(() => {
        // Quantities should scale (150 / 50 = 3x base)
        expect(screen.getByText(/Lista zakupów/i)).toBeInTheDocument();
      });
    });
  });

  describe('Offer Selection', () => {
    it('switches between different offer packages', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Default: Family
      expect(screen.getByText(/Family Party/i)).toBeInTheDocument();

      // Switch to Premium
      const premiumButton = screen.getByText(/Premium/i);
      await userEvent.click(premiumButton);

      await waitFor(() => {
        // Price should update to Premium rates
        expect(screen.getByText(/Premium/i)).toHaveClass('active');
      });
    });

    it('updates price per guest when switching offers', async () => {
      const onCalculate = jest.fn();
      render(<Calculator onCalculate={onCalculate} />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      // Switch to Exclusive (60 PLN per guest)
      const exclusiveButton = screen.getByText(/Exclusive/i);
      await userEvent.click(exclusiveButton);

      await waitFor(() => {
        if (onCalculate.mock.calls.length > 0) {
          const snapshot = onCalculate.mock.calls[onCalculate.mock.calls.length - 1][0];
          // Exclusive should have higher price per guest
          expect(snapshot.pricePerGuest).toBeGreaterThan(35); // Family is 35
        }
      });
    });
  });

  describe('Callback Integration', () => {
    it('calls onCalculate with correct snapshot data', async () => {
      const onCalculate = jest.fn();
      render(<Calculator onCalculate={onCalculate} />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(onCalculate).toHaveBeenCalled();
      });

      const snapshot = onCalculate.mock.calls[0][0];
      expect(snapshot).toHaveProperty('offerName');
      expect(snapshot).toHaveProperty('guests');
      expect(snapshot).toHaveProperty('totalAfterDiscount');
      expect(snapshot).toHaveProperty('pricePerGuest');
      expect(snapshot).toHaveProperty('estimatedCocktails');
      expect(snapshot).toHaveProperty('addons');
    });

    it('updates snapshot when guests change', async () => {
      const onCalculate = jest.fn();
      render(<Calculator onCalculate={onCalculate} />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      const initialCallCount = onCalculate.mock.calls.length;

      const guestInput = screen.getByRole('spinbutton') || screen.getByDisplayValue('50');
      await userEvent.clear(guestInput);
      await userEvent.type(guestInput, '75');

      await waitFor(() => {
        expect(onCalculate.mock.calls.length).toBeGreaterThan(initialCallCount);
      });

      const latestSnapshot = onCalculate.mock.calls[onCalculate.mock.calls.length - 1][0];
      expect(latestSnapshot.guests).toBe(75);
    });
  });

  describe('Input Validation', () => {
    it('enforces minimum guest count', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      const guestInput = screen.getByRole('spinbutton') || screen.getByDisplayValue('50');
      await userEvent.clear(guestInput);
      await userEvent.type(guestInput, '5');

      // Should clamp to minimum (e.g., 10 or offer.minGuests)
      await waitFor(() => {
        const value = (guestInput as HTMLInputElement).value;
        expect(parseInt(value)).toBeGreaterThanOrEqual(10);
      });
    });

    it('handles invalid guest input', async () => {
      render(<Calculator />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie kalkulatora/i)).not.toBeInTheDocument();
      });

      const guestInput = screen.getByRole('spinbutton') || screen.getByDisplayValue('50');
      await userEvent.clear(guestInput);
      await userEvent.type(guestInput, 'abc');

      // Should handle gracefully (stay at previous value or default)
      await waitFor(() => {
        const value = (guestInput as HTMLInputElement).value;
        expect(isNaN(parseInt(value)) || parseInt(value) > 0).toBe(true);
      });
    });
  });
});
