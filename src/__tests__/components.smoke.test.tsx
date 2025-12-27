import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import CalculatorSettings from '../components/admin/CalculatorSettings';
import ContentEditor from '../components/admin/ContentEditor';
import DashboardHome from '../components/admin/DashboardHome';
import EmailSettings from '../components/admin/EmailSettings';
import ImageGallery from '../components/admin/ImageGallery';

// Mock fetch
global.fetch = vi.fn();

const mockFetch = (data: any) => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
};

describe('New Components - Smoke Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('eliksir_jwt_token', 'test-token');
  });

  describe('ImageGallery Component', () => {
    it('should render image gallery', async () => {
      mockFetch({ success: true, images: [] });

      render(
        <BrowserRouter>
          <ImageGallery />
        </BrowserRouter>
      );

      expect(screen.getByText('Galeria Zdjęć')).toBeInTheDocument();
      expect(screen.getByText('Dodaj Zdjęcie')).toBeInTheDocument();
    });

    it('should display images when loaded', async () => {
      mockFetch({
        success: true,
        images: [
          {
            filename: 'test.jpg',
            url: '/uploads/images/test.jpg',
            size: 102400,
            uploadedAt: new Date().toISOString(),
          },
        ],
      });

      render(
        <BrowserRouter>
          <ImageGallery />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });
    });

    it('should show empty state when no images', async () => {
      mockFetch({ success: true, images: [] });

      render(
        <BrowserRouter>
          <ImageGallery />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Brak zdjęć. Dodaj pierwsze zdjęcie.')).toBeInTheDocument();
      });
    });
  });

  describe('ContentEditor Component', () => {
    it('should render content editor', async () => {
      mockFetch({ success: true, sections: [] });

      render(
        <BrowserRouter>
          <ContentEditor />
        </BrowserRouter>
      );

      expect(screen.getByText('Edytor Treści')).toBeInTheDocument();
      expect(screen.getByText('Pokaż Galerię')).toBeInTheDocument();
    });

    it('should display content sections', async () => {
      mockFetch({
        success: true,
        sections: [
          {
            id: 'hero',
            name: 'Hero Section',
            title: 'Welcome',
            description: 'Test description',
            imageUrl: '/test.jpg',
          },
        ],
      });

      render(
        <BrowserRouter>
          <ContentEditor />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
    });

    it('should toggle preview mode', async () => {
      mockFetch({ success: true, sections: [] });

      render(
        <BrowserRouter>
          <ContentEditor />
        </BrowserRouter>
      );

      const previewButton = screen.getByText('Podgląd');
      fireEvent.click(previewButton);

      expect(screen.getByText('Edycja')).toBeInTheDocument();
    });
  });

  describe('DashboardHome Component', () => {
    it('should render dashboard with loading state', () => {
      mockFetch({ success: true, data: {} });

      render(
        <BrowserRouter>
          <DashboardHome />
        </BrowserRouter>
      );

      expect(screen.getByText('Ładowanie statystyk...')).toBeInTheDocument();
    });

    it('should display statistics when loaded', async () => {
      mockFetch({
        success: true,
        data: {
          totalViews: 1234,
          uniqueVisitors: 567,
          avgTimeOnSite: '2:34',
          bounceRate: '45%',
          topPages: [{ path: '/', views: 500 }],
          trafficSources: [{ source: 'Direct', count: 300 }],
        },
      });

      render(
        <BrowserRouter>
          <DashboardHome />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('1 234')).toBeInTheDocument();
      });
    });

    it('should have refresh button', async () => {
      mockFetch({
        success: true,
        data: {
          totalViews: 0,
          uniqueVisitors: 0,
          avgTimeOnSite: '0:00',
          bounceRate: '0%',
          topPages: [],
          trafficSources: [],
        },
      });

      render(
        <BrowserRouter>
          <DashboardHome />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Odśwież')).toBeInTheDocument();
      });
    });
  });

  describe('EmailSettings Component', () => {
    it('should render email settings form', () => {
      render(
        <BrowserRouter>
          <EmailSettings />
        </BrowserRouter>
      );

      expect(screen.getByText('Ustawienia Email')).toBeInTheDocument();
      expect(screen.getByText('Serwer SMTP')).toBeInTheDocument();
      expect(screen.getByText('Wyślij Test')).toBeInTheDocument();
      expect(screen.getByText('Zapisz Ustawienia')).toBeInTheDocument();
    });

    it('should have SMTP configuration fields', () => {
      render(
        <BrowserRouter>
          <EmailSettings />
        </BrowserRouter>
      );

      expect(screen.getByPlaceholderText('smtp.gmail.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('587')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your-email@gmail.com')).toBeInTheDocument();
    });

    it('should display Gmail instructions', () => {
      render(
        <BrowserRouter>
          <EmailSettings />
        </BrowserRouter>
      );

      expect(screen.getByText('📧 Instrukcja Gmail')).toBeInTheDocument();
      expect(screen.getByText(/weryfikację dwuetapową/i)).toBeInTheDocument();
    });
  });

  describe('CalculatorSettings Component', () => {
    it('should render calculator settings', async () => {
      mockFetch({
        success: true,
        settings: {
          basePrice: 150,
          drinkTypes: [
            { id: 'beer', name: 'Piwo', multiplier: 1.0 },
          ],
          eventTypes: [
            { id: 'corporate', name: 'Impreza Firmowa', multiplier: 1.2 },
          ],
          serviceOptions: [],
          discounts: [],
        },
      });

      render(
        <BrowserRouter>
          <CalculatorSettings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Kalkulator Cenowy')).toBeInTheDocument();
      });
    });

    it('should display live preview', async () => {
      mockFetch({
        success: true,
        settings: {
          basePrice: 150,
          drinkTypes: [
            { id: 'beer', name: 'Piwo', multiplier: 1.0 },
          ],
          eventTypes: [
            { id: 'corporate', name: 'Impreza Firmowa', multiplier: 1.2 },
          ],
          serviceOptions: [
            { id: 'bartender', name: 'Barman', price: 800 },
          ],
          discounts: [
            { minGuests: 50, discount: 5 },
          ],
        },
      });

      render(
        <BrowserRouter>
          <CalculatorSettings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Podgląd na Żywo')).toBeInTheDocument();
        expect(screen.getByText('Szacowana Cena')).toBeInTheDocument();
      });
    });

    it('should have all setting categories', async () => {
      mockFetch({
        success: true,
        settings: {
          basePrice: 150,
          drinkTypes: [],
          eventTypes: [],
          serviceOptions: [],
          discounts: [],
        },
      });

      render(
        <BrowserRouter>
          <CalculatorSettings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Cena Bazowa')).toBeInTheDocument();
        expect(screen.getByText('Rodzaje Napojów')).toBeInTheDocument();
        expect(screen.getByText('Rodzaje Wydarzeń')).toBeInTheDocument();
        expect(screen.getByText('Dodatkowe Usługi')).toBeInTheDocument();
      });
    });
  });
});
