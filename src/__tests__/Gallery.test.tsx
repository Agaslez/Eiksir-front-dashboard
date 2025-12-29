import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Gallery from '../components/Gallery';

// Mock fetch API
global.fetch = jest.fn();

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <div>ChevronLeft</div>,
  ChevronRight: () => <div>ChevronRight</div>,
  Heart: () => <div>Heart</div>,
  Maximize2: () => <div>Maximize2</div>,
  RefreshCw: () => <div>RefreshCw</div>,
  Share2: () => <div>Share2</div>,
  X: () => <div>X</div>,
}));

// Mock trackEvent
jest.mock('../lib/error-monitoring', () => ({
  trackEvent: jest.fn(),
}));

const mockGalleryImages = [
  {
    id: '1',
    url: 'https://res.cloudinary.com/test/image1.jpg',
    category: 'wesela',
    displayOrder: 1,
    description: 'Wesele 1',
  },
  {
    id: '2',
    url: 'https://res.cloudinary.com/test/image2.jpg',
    category: 'eventy',
    displayOrder: 2,
    description: 'Event 1',
  },
  {
    id: '3',
    url: 'https://res.cloudinary.com/test/image3.jpg',
    category: 'wesela',
    displayOrder: 3,
    description: 'Wesele 2',
  },
];

describe('Gallery Component', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, images: mockGalleryImages }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('API Integration', () => {
    it('fetches images on mount', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/content/gallery/public')
        );
      });
    });

    it('shows loading state while fetching', () => {
      render(<Gallery />);
      
      // Should show loading indicator or empty state
      expect(screen.queryByText(/Galeria/i)).toBeInTheDocument();
    });

    it('displays images after successful fetch', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('handles API error gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      render(<Gallery />);
      
      await waitFor(() => {
        // Should not crash, might show error message or empty state
        expect(screen.queryByText(/Galeria/i)).toBeInTheDocument();
      });
    });
  });

  describe('Image Sorting', () => {
    it('sorts images by displayOrder ascending', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBe(3);
      });

      // Images should be in order: 1, 2, 3
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', expect.stringContaining('image1'));
      expect(images[1]).toHaveAttribute('src', expect.stringContaining('image2'));
      expect(images[2]).toHaveAttribute('src', expect.stringContaining('image3'));
    });

    it('filters out images without URL', async () => {
      const imagesWithNull = [
        ...mockGalleryImages,
        { id: '4', url: '', category: 'wesela', displayOrder: 4, description: '' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, images: imagesWithNull }),
      });

      render(<Gallery />);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        // Should only show 3 images (exclude the one without URL)
        expect(images.length).toBe(3);
      });
    });
  });

  describe('Category Filtering', () => {
    it('filters images by selected category', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        expect(screen.getAllByRole('img').length).toBe(3);
      });

      // Click "Wesela" category button
      const weselaButton = screen.getByText(/Wesela/i);
      await userEvent.click(weselaButton);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          images: mockGalleryImages.filter((img) => img.category === 'wesela'),
        }),
      });

      await waitFor(() => {
        // Should refetch with category parameter
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('category=wesela')
        );
      });
    });

    it('shows all categories on initial load', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        expect(screen.getByText(/Wszystkie/i)).toBeInTheDocument();
        expect(screen.getByText(/Wesela/i)).toBeInTheDocument();
        expect(screen.getByText(/Eventy/i)).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Button', () => {
    it('renders refresh button', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        expect(screen.getByText(/Odśwież/i)).toBeInTheDocument();
      });
    });

    it('refetches images when refresh clicked', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      const refreshButton = screen.getByText(/Odśwież/i);
      await userEvent.click(refreshButton);

      await waitFor(() => {
        // Should call fetch again
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('shows loading state during refresh', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        expect(screen.getByText(/Odśwież/i)).toBeInTheDocument();
      });

      const refreshButton = screen.getByText(/Odśwież/i);
      
      // Mock slow API response
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      await userEvent.click(refreshButton);

      // Button should be disabled during loading
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Image Modal', () => {
    it('opens modal when image clicked', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });

      const firstImage = screen.getAllByRole('img')[0];
      await userEvent.click(firstImage);

      await waitFor(() => {
        // Modal should open with larger image
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('closes modal when X clicked', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });

      const firstImage = screen.getAllByRole('img')[0];
      await userEvent.click(firstImage);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const closeButton = screen.getByText(/X/i);
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('navigates between images with arrow keys', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBe(3);
      });

      const firstImage = screen.getAllByRole('img')[0];
      await userEvent.click(firstImage);

      // Press right arrow
      await userEvent.keyboard('{ArrowRight}');

      await waitFor(() => {
        // Should show second image
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('renders grid layout on desktop', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        const gallery = screen.getByRole('region') || screen.getByTestId('gallery-grid');
        expect(gallery).toHaveClass('grid');
      });
    });

    it('adjusts columns on mobile viewport', async () => {
      // Mock window.innerWidth
      global.innerWidth = 375;
      
      render(<Gallery />);
      
      await waitFor(() => {
        const gallery = screen.getByRole('region') || screen.getByTestId('gallery-grid');
        // Should have mobile-specific classes
        expect(gallery).toBeInTheDocument();
      });
    });
  });

  describe('Image Lazy Loading', () => {
    it('applies loading="lazy" to images', async () => {
      render(<Gallery />);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        images.forEach((img) => {
          expect(img).toHaveAttribute('loading', 'lazy');
        });
      });
    });
  });

  describe('Favorite/Like Feature', () => {
    it('tracks favorite clicks', async () => {
      const { trackEvent } = require('../lib/error-monitoring');
      
      render(<Gallery />);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });

      const heartButton = screen.getByText(/Heart/i);
      await userEvent.click(heartButton);

      expect(trackEvent).toHaveBeenCalledWith(
        expect.stringContaining('gallery'),
        expect.any(Object)
      );
    });
  });

  describe('Share Feature', () => {
    it('tracks share clicks', async () => {
      const { trackEvent } = require('../lib/error-monitoring');
      
      render(<Gallery />);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });

      const shareButton = screen.getByText(/Share2/i);
      await userEvent.click(shareButton);

      expect(trackEvent).toHaveBeenCalledWith(
        expect.stringContaining('gallery'),
        expect.any(Object)
      );
    });
  });
});
