import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentEditor from '../../pages/admin/ContentEditor';

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
  Save: () => <div>Save</div>,
}));

const mockSections = [
  {
    id: '1',
    title: 'Hero Section',
    content: {
      heading: 'ELIKSIR',
      subheading: 'Mobilny Bar Koktajlowy',
      description: 'Profesjonalna obsługa barmańska',
    },
  },
  {
    id: '2',
    title: 'About Section',
    content: {
      heading: 'Kim jesteśmy?',
      description: 'Jesteśmy profesjonalnym zespołem...',
    },
  },
  {
    id: '3',
    title: 'Services Section',
    content: {
      heading: 'Nasze Usługi',
      description: 'Oferujemy kompleksową obsługę...',
    },
  },
];

describe('ContentEditor Component', () => {
  beforeEach(() => {
    localStorageMock.setItem('eliksir_jwt_token', 'fake-jwt-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, sections: mockSections }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Component Rendering', () => {
    it('renders content editor title', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText(/Content Editor/i)).toBeInTheDocument();
      });
    });

    it('shows loading state initially', () => {
      render(<ContentEditor />);
      expect(screen.getByText(/Ładowanie/i)).toBeInTheDocument();
    });

    it('fetches and displays sections on mount', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/content/sections')
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
        expect(screen.getByText('About Section')).toBeInTheDocument();
        expect(screen.getByText('Services Section')).toBeInTheDocument();
      });
    });
  });

  describe('Section Display', () => {
    it('displays section titles', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
        expect(screen.getByText('About Section')).toBeInTheDocument();
        expect(screen.getByText('Services Section')).toBeInTheDocument();
      });
    });

    it('displays section content preview', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText(/ELIKSIR/i)).toBeInTheDocument();
        expect(screen.getByText(/Mobilny Bar Koktajlowy/i)).toBeInTheDocument();
      });
    });

    it('shows edit button for each section', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        const editButtons = screen.getAllByText(/Edytuj/i);
        expect(editButtons.length).toBe(3);
      });
    });
  });

  describe('Section Editing', () => {
    it('opens edit modal when edit button clicked', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/Heading/i)).toBeInTheDocument();
      });
    });

    it('populates form with current section data', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      await waitFor(() => {
        const headingInput = screen.getByLabelText(/Heading/i) as HTMLInputElement;
        expect(headingInput.value).toBe('ELIKSIR');
      });
    });

    it('allows editing section heading', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      const headingInput = screen.getByLabelText(/Heading/i);
      await userEvent.clear(headingInput);
      await userEvent.type(headingInput, 'New Heading');

      expect(headingInput).toHaveValue('New Heading');
    });

    it('allows editing section subheading', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      const subheadingInput = screen.getByLabelText(/Subheading/i);
      await userEvent.clear(subheadingInput);
      await userEvent.type(subheadingInput, 'New Subheading');

      expect(subheadingInput).toHaveValue('New Subheading');
    });

    it('allows editing section description', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      const descriptionInput = screen.getByLabelText(/Description/i);
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'New Description');

      expect(descriptionInput).toHaveValue('New Description');
    });
  });

  describe('Section Saving', () => {
    it('sends PUT request with JWT token', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      const headingInput = screen.getByLabelText(/Heading/i);
      await userEvent.clear(headingInput);
      await userEvent.type(headingInput, 'Updated Heading');

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/content/sections/1'),
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-jwt-token',
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('Updated Heading'),
          })
        );
      });
    });

    it('shows success message after save', async () => {
      global.alert = jest.fn();
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Sekcja zapisana')
        );
      });
    });

    it('refreshes sections after save', async () => {
      global.alert = jest.fn();
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const initialCallCount = (global.fetch as jest.Mock).mock.calls.length;

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(
          initialCallCount
        );
      });
    });

    it('closes modal after successful save', async () => {
      global.alert = jest.fn();
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/Heading/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByLabelText(/Heading/i)).not.toBeInTheDocument();
      });
    });

    it('handles save errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      global.alert = jest.fn();
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Błąd zapisu')
        );
      });
    });

    it('disables save button during save', async () => {
      // Mock slow save
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      expect(saveButton).toBeDisabled();
    });
  });

  describe('Modal Behavior', () => {
    it('closes modal when cancel clicked', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/Heading/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByText(/Anuluj/i);
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByLabelText(/Heading/i)).not.toBeInTheDocument();
      });
    });

    it('does not save changes when cancelled', async () => {
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      const headingInput = screen.getByLabelText(/Heading/i);
      await userEvent.clear(headingInput);
      await userEvent.type(headingInput, 'Changed');

      const cancelButton = screen.getByText(/Anuluj/i);
      await userEvent.click(cancelButton);

      // Should not call PUT
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/content/sections/1'),
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  describe('Authentication', () => {
    it('requires JWT token for save', async () => {
      localStorageMock.clear();
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edytuj/i);
      await userEvent.click(editButtons[0]);

      const saveButton = screen.getByText(/Zapisz/i);
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/content/sections/1'),
          expect.objectContaining({
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
      
      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie/i)).not.toBeInTheDocument();
      });

      // Should not crash
      expect(screen.queryByText('Hero Section')).not.toBeInTheDocument();
    });

    it('handles empty sections list', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, sections: [] }),
      });

      render(<ContentEditor />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie/i)).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Hero Section')).not.toBeInTheDocument();
    });
  });
});
