import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GalleryManager from '../../pages/admin/GalleryManager';

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

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Image: () => <div>Image</div>,
  RefreshCw: () => <div>RefreshCw</div>,
  Trash2: () => <div>Trash2</div>,
  Upload: () => <div>Upload</div>,
}));

const mockImages = [
  {
    id: 1,
    url: 'https://res.cloudinary.com/test/image1.jpg',
    title: 'Wesele 1',
    description: 'Test image 1',
    category: 'wesela',
    displayOrder: 1,
    filename: 'image1.jpg',
  },
  {
    id: 2,
    url: 'https://res.cloudinary.com/test/image2.jpg',
    title: 'Event 1',
    description: 'Test image 2',
    category: 'eventy',
    displayOrder: 2,
    filename: 'image2.jpg',
  },
];

describe('GalleryManager Component', () => {
  beforeEach(() => {
    localStorageMock.setItem('eliksir_jwt_token', 'fake-jwt-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, images: mockImages }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Component Rendering', () => {
    it('renders gallery manager title', async () => {
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.getByText(/Gallery Manager/i)).toBeInTheDocument();
      });
    });

    it('shows loading state initially', () => {
      render(<GalleryManager />);
      expect(screen.getByText(/Ładowanie/i)).toBeInTheDocument();
    });

    it('fetches and displays images on mount', async () => {
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/content/gallery/public')
        );
      });

      await waitFor(() => {
        expect(screen.getByText('image1.jpg')).toBeInTheDocument();
        expect(screen.getByText('image2.jpg')).toBeInTheDocument();
      });
    });
  });

  describe('Image Upload', () => {
    it('renders upload button', async () => {
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.getByText(/Upload/i)).toBeInTheDocument();
      });
    });

    it('uploads images with JWT token', async () => {
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie/i)).not.toBeInTheDocument();
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/content/gallery/upload'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-jwt-token',
            }),
          })
        );
      });
    });

    it('shows success message after upload', async () => {
      global.alert = jest.fn();
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie/i)).not.toBeInTheDocument();
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('uploaded successfully')
        );
      });
    });

    it('handles upload errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Upload failed' }),
      });

      global.alert = jest.fn();
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie/i)).not.toBeInTheDocument();
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Upload failed')
        );
      });
    });

    it('disables upload during uploading', async () => {
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie/i)).not.toBeInTheDocument();
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

      // Mock slow upload
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      await userEvent.upload(input, file);

      // Upload button should be disabled
      expect(input).toBeDisabled();
    });

    it('supports multiple file upload', async () => {
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie/i)).not.toBeInTheDocument();
      });

      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

      await userEvent.upload(input, files);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Image Deletion', () => {
    it('shows delete button for each image', async () => {
      render(<GalleryManager />);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByText(/Trash2/i);
        expect(deleteButtons.length).toBe(2);
      });
    });

    it('confirms before deleting image', async () => {
      global.confirm = jest.fn(() => true);
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.getByText('image1.jpg')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText(/Trash2/i);
      await userEvent.click(deleteButtons[0]);

      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('image1.jpg')
      );
    });

    it('cancels deletion if not confirmed', async () => {
      global.confirm = jest.fn(() => false);
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.getByText('image1.jpg')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText(/Trash2/i);
      await userEvent.click(deleteButtons[0]);

      // Should not call delete API
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/content/gallery/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('deletes image with JWT token', async () => {
      global.confirm = jest.fn(() => true);
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.getByText('image1.jpg')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText(/Trash2/i);
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/content/gallery/1'),
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-jwt-token',
            }),
          })
        );
      });
    });

    it('refreshes list after successful deletion', async () => {
      global.confirm = jest.fn(() => true);
      global.alert = jest.fn();
      
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.getByText('image1.jpg')).toBeInTheDocument();
      });

      const initialFetchCount = (global.fetch as jest.Mock).mock.calls.length;

      const deleteButtons = screen.getAllByText(/Trash2/i);
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => {
        // Should fetch images again
        expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(
          initialFetchCount
        );
      });
    });

    it('shows error message on deletion failure', async () => {
      global.confirm = jest.fn(() => true);
      global.alert = jest.fn();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.getByText('image1.jpg')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText(/Trash2/i);
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Błąd usuwania')
        );
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('renders refresh button', async () => {
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.getByText(/RefreshCw/i)).toBeInTheDocument();
      });
    });

    it('refetches images when refresh clicked', async () => {
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie/i)).not.toBeInTheDocument();
      });

      const initialCallCount = (global.fetch as jest.Mock).mock.calls.length;

      const refreshButton = screen.getByText(/RefreshCw/i);
      await userEvent.click(refreshButton);

      await waitFor(() => {
        expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(
          initialCallCount
        );
      });
    });
  });

  describe('Authentication', () => {
    it('requires JWT token for upload', async () => {
      localStorageMock.clear();
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie/i)).not.toBeInTheDocument();
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/content/gallery/upload'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer null',
            }),
          })
        );
      });
    });

    it('requires JWT token for delete', async () => {
      localStorageMock.clear();
      global.confirm = jest.fn(() => true);
      
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.getByText('image1.jpg')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText(/Trash2/i);
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/content/gallery/1'),
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
      
      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie/i)).not.toBeInTheDocument();
      });

      // Should not crash, show empty state
      expect(screen.queryByText('image1.jpg')).not.toBeInTheDocument();
    });

    it('handles empty image list', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, images: [] }),
      });

      render(<GalleryManager />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Ładowanie/i)).not.toBeInTheDocument();
      });

      // Should show empty state
      expect(screen.queryByText('image1.jpg')).not.toBeInTheDocument();
    });
  });
});
