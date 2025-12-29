import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalculatorSettings from '../../components/admin/CalculatorSettings';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Calculator: () => <div>Calculator</div>,
  Save: () => <div>Save</div>,
}));

const mockConfig = {
  promoDiscount: 0.2,
  pricePerExtraGuest: {
    basic: 40,
    premium: 50,
    exclusive: 60,
    kids: 30,
    family: 35,
    business: 45,
  },
  addons: {
    fountain: { perGuest: 10, min: 600, max: 1200 },
    keg: { pricePerKeg: 550, guestsPerKeg: 50 },
    lemonade: { base: 250, blockGuests: 60 },
    hockery: 200,
    ledLighting: 500,
  },
  shoppingList: {
    vodkaRumGinBottles: 5,
    liqueurBottles: 2,
    aperolBottles: 2,
    proseccoBottles: 5,
    syrupsLiters: 12,
    iceKg: 8,
  },
};

describe('CalculatorSettings Component', () => {
  beforeEach(() => {
    localStorageMock.setItem('eliksir_jwt_token', 'fake-jwt-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, config: mockConfig }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Component Rendering', () => {
    it('renders calculator settings title', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/Konfiguracja Kalkulatora/i)).toBeInTheDocument();
      });
    });

    it('fetches config on mount', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/calculator/config'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-jwt-token',
            }),
          })
        );
      });
    });

    it('displays promo discount field', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Promo Discount/i)).toBeInTheDocument();
      });
    });

    it('displays price per guest fields', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Basic/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Premium/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Exclusive/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Kids/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Family/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Business/i)).toBeInTheDocument();
      });
    });
  });

  describe('Promo Discount Configuration', () => {
    it('displays current promo discount value', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        const input = screen.getByLabelText(/Promo Discount/i) as HTMLInputElement;
        expect(input.value).toBe('0.2');
      });
    });

    it('allows editing promo discount', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Promo Discount/i)).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/Promo Discount/i);
      await userEvent.clear(input);
      await userEvent.type(input, '0.25');

      expect(input).toHaveValue(0.25);
    });

    it('validates promo discount range (0-1)', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Promo Discount/i)).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/Promo Discount/i);
      await userEvent.clear(input);
      await userEvent.type(input, '1.5');

      // Should clamp to max 1 or show validation error
      await waitFor(() => {
        const value = parseFloat((input as HTMLInputElement).value);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Price Per Guest Configuration', () => {
    it('displays all package prices', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        const basicInput = screen.getByLabelText(/Basic/i) as HTMLInputElement;
        expect(basicInput.value).toBe('40');
        
        const premiumInput = screen.getByLabelText(/Premium/i) as HTMLInputElement;
        expect(premiumInput.value).toBe('50');
      });
    });

    it('allows editing package prices', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Family/i)).toBeInTheDocument();
      });

      const familyInput = screen.getByLabelText(/Family/i);
      await userEvent.clear(familyInput);
      await userEvent.type(familyInput, '40');

      expect(familyInput).toHaveValue(40);
    });

    it('updates multiple prices independently', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Basic/i)).toBeInTheDocument();
      });

      const basicInput = screen.getByLabelText(/Basic/i);
      const premiumInput = screen.getByLabelText(/Premium/i);

      await userEvent.clear(basicInput);
      await userEvent.type(basicInput, '45');

      await userEvent.clear(premiumInput);
      await userEvent.type(premiumInput, '55');

      expect(basicInput).toHaveValue(45);
      expect(premiumInput).toHaveValue(55);
    });
  });

  describe('Addons Configuration', () => {
    it('displays fountain addon settings', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/Fountain/i)).toBeInTheDocument();
      });
    });

    it('displays keg addon settings', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/Keg/i)).toBeInTheDocument();
      });
    });

    it('displays lemonade addon settings', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/Lemonade/i)).toBeInTheDocument();
      });
    });

    it('allows editing addon prices', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Hockery/i)).toBeInTheDocument();
      });

      const hockeryInput = screen.getByLabelText(/Hockery/i);
      await userEvent.clear(hockeryInput);
      await userEvent.type(hockeryInput, '250');

      expect(hockeryInput).toHaveValue(250);
    });
  });

  describe('Shopping List Configuration', () => {
    it('displays shopping list items', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/Lista zakupów/i)).toBeInTheDocument();
      });
    });

    it('allows editing shopping list quantities', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        const vodkaInput = screen.getByLabelText(/Wódka\/Rum\/Gin/i);
        expect(vodkaInput).toBeInTheDocument();
      });

      const vodkaInput = screen.getByLabelText(/Wódka\/Rum\/Gin/i);
      await userEvent.clear(vodkaInput);
      await userEvent.type(vodkaInput, '6');

      expect(vodkaInput).toHaveValue(6);
    });
  });

  describe('Save Functionality', () => {
    it('renders save button', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/Zapisz/i)).toBeInTheDocument();
      });
    });

    it('sends PUT request with JWT token', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/Zapisz/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/calculator/config'),
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-jwt-token',
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('promoDiscount'),
          })
        );
      });
    });

    it('shows success message after save', async () => {
      global.alert = jest.fn();
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/Zapisz/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('zapisana')
        );
      });
    });

    it('shows error message on save failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      global.alert = jest.fn();
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/Zapisz/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Błąd')
        );
      });
    });

    it('disables save button during save', async () => {
      // Mock slow save
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/Zapisz/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      expect(saveButton).toBeDisabled();
    });

    it('sends complete config object', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/Zapisz/i)).toBeInTheDocument();
      });

      // Edit a value
      const familyInput = screen.getByLabelText(/Family/i);
      await userEvent.clear(familyInput);
      await userEvent.type(familyInput, '38');

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      await waitFor(() => {
        const lastCall = (global.fetch as jest.Mock).mock.calls.find(
          call => call[1]?.method === 'PUT'
        );
        const body = JSON.parse(lastCall[1].body);
        
        expect(body).toHaveProperty('promoDiscount');
        expect(body).toHaveProperty('pricePerExtraGuest');
        expect(body.pricePerExtraGuest.family).toBe(38);
        expect(body).toHaveProperty('addons');
        expect(body).toHaveProperty('shoppingList');
      });
    });
  });

  describe('Authentication', () => {
    it('requires JWT token for fetch', async () => {
      localStorageMock.clear();
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/calculator/config'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer null',
            }),
          })
        );
      });
    });

    it('requires JWT token for save', async () => {
      localStorageMock.clear();
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/Zapisz/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/calculator/config'),
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': 'Bearer null',
            }),
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('handles fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        // Should not crash, may show default values
        expect(screen.getByText(/Konfiguracja Kalkulatora/i)).toBeInTheDocument();
      });
    });

    it('uses fallback config on fetch failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        const promoInput = screen.getByLabelText(/Promo Discount/i) as HTMLInputElement;
        // Should have default value
        expect(parseFloat(promoInput.value)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Data Persistence', () => {
    it('retains edited values before save', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Family/i)).toBeInTheDocument();
      });

      const familyInput = screen.getByLabelText(/Family/i);
      await userEvent.clear(familyInput);
      await userEvent.type(familyInput, '42');

      // Value should persist in state
      expect(familyInput).toHaveValue(42);
    });

    it('preserves all fields when editing one', async () => {
      render(<CalculatorSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Family/i)).toBeInTheDocument();
      });

      const familyInput = screen.getByLabelText(/Family/i);
      const basicInput = screen.getByLabelText(/Basic/i);

      const originalBasic = (basicInput as HTMLInputElement).value;

      await userEvent.clear(familyInput);
      await userEvent.type(familyInput, '42');

      // Basic should not change
      expect((basicInput as HTMLInputElement).value).toBe(originalBasic);
    });
  });
});
