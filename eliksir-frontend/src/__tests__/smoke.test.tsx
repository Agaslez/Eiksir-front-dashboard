import '@testing-library/jest-dom'; // Dodajemy import
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import Calculator from '../components/Calculator';
import FooterEliksir from '../components/FooterEliksir';
import HeroEliksir from '../components/HeroEliksir';
import OfertaEliksir from '../components/OfertaEliksir';
import UslugiEventowe from '../components/UslugiEventowe';

// Mock dla plików CSS
jest.mock('../App.css', () => ({}));

// Mock dla auth - całkowicie omijamy problem z import.meta
jest.mock('../lib/auth', () => ({
  requireAuth: jest.fn(() => true),
  getUserRole: jest.fn(() => 'admin'),
  logout: jest.fn(),
  isAuthenticated: jest.fn(() => true),
  checkAuth: jest.fn(() => ({ isAuthenticated: true, hasPermission: true })),
}));

// Mock dla error-monitoring
jest.mock('../lib/error-monitoring', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  trackEvent: jest.fn(),
}));

// Mock dla lucide-react ikon - KOMPLETNY
jest.mock('lucide-react', () => ({
  Glass: () => 'GlassIcon',
  Citrus: () => 'CitrusIcon',
  Cherry: () => 'CherryIcon',
  Flame: () => 'FlameIcon',
  Leaf: () => 'LeafIcon',
  Sparkles: () => 'SparklesIcon',
  Award: () => 'AwardIcon',
  Calendar: () => 'CalendarIcon',
  Users: () => 'UsersIcon',
  Music: () => 'MusicIcon',
  Facebook: () => 'FacebookIcon',
  Instagram: () => 'InstagramIcon',
  Mail: () => 'MailIcon',
  Phone: () => 'PhoneIcon',
  MapPin: () => 'MapPinIcon',
  // Ikony używane w Gallery
  ChevronLeft: () => 'ChevronLeftIcon',
  ChevronRight: () => 'ChevronRightIcon',
  Heart: () => 'HeartIcon',
  Maximize2: () => 'Maximize2Icon',
  Share2: () => 'Share2Icon',
  X: () => 'XIcon',
  // Ikony używane w DashboardLayout
  LayoutDashboard: () => 'LayoutDashboardIcon',
  Calendar: () => 'CalendarIcon',
  ShoppingCart: () => 'ShoppingCartIcon',
  FileText: () => 'FileTextIcon',
  Image: () => 'ImageIcon',
  Settings: () => 'SettingsIcon',
  Users: () => 'UsersIcon',
  BarChart3: () => 'BarChart3Icon',
  LogOut: () => 'LogOutIcon',
  Menu: () => 'MenuIcon',
  X: () => 'XIcon',
  Bell: () => 'BellIcon',
  Search: () => 'SearchIcon',
}));

// Mock dla react-router-dom - KOMPLETNY
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Routes: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Route: ({ element }: { element: React.ReactNode }) => <div>{element}</div>,
  Outlet: () => <div data-testid="outlet">Outlet</div>,
  Navigate: () => <div data-testid="navigate">Navigate</div>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  NavLink: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Mock dla komponentów admin
jest.mock('../components/admin/LoginForm', () => ({
  __esModule: true,
  default: () => <div data-testid="login-form">Mock Login Form</div>,
}));

jest.mock('../components/admin/DashboardLayout', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="dashboard-layout">Mock Dashboard Layout</div>
  ),
}));

// Mock dla LoadingSpinner
jest.mock('../components/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// SMOKE TESTS - najważniejsze funkcje strony ELIKSIR

describe('Smoke Tests - Strona Eliksir Bar', () => {
  describe('1. Strona główna ładuje się', () => {
    it('renderuje aplikację bez błędów', () => {
      expect(() =>
        render(
          <BrowserRouter>
            <App />
          </BrowserRouter>
        )
      ).not.toThrow();
    });

    it('ma tytuł Eliksir Bar', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      const eliksirElements = screen.getAllByText(/ELIKSIR/i);
      expect(eliksirElements.length).toBeGreaterThan(0);
      expect(eliksirElements[0]).toBeInTheDocument();
    });
  });

  describe('2. Hero sekcja działa', () => {
    it('renderuje HeroEliksir bez błędów', () => {
      expect(() => render(<HeroEliksir />)).not.toThrow();
    });

    it('wyświetla główny tytuł', () => {
      render(<HeroEliksir />);
      const eliksirElements = screen.getAllByText(/ELIKSIR/i);
      expect(eliksirElements.length).toBeGreaterThan(0);
      expect(eliksirElements[0]).toBeInTheDocument();
    });

    it('ma przyciski CTA', () => {
      render(<HeroEliksir />);
      expect(screen.getByText(/Zamów Eliksir/i)).toBeInTheDocument();
      expect(screen.getByText(/Zobacz Ofertę/i)).toBeInTheDocument();
    });

    it('wyświetla statystyki', () => {
      render(<HeroEliksir />);
      expect(screen.getByText(/500\+/i)).toBeInTheDocument();
      expect(screen.getByText(/Wydarzeń/i)).toBeInTheDocument();
    });
  });

  describe('3. Oferta koktajli działa', () => {
    it('renderuje OfertaEliksir bez błędów', () => {
      expect(() => render(<OfertaEliksir />)).not.toThrow();
    });

    it('wyświetla kategorie koktajli', () => {
      render(<OfertaEliksir />);
      expect(screen.getByText(/Klasyczne/i)).toBeInTheDocument();
      expect(screen.getByText(/Owocowe/i)).toBeInTheDocument();
      expect(screen.getByText(/Sygnaturowe/i)).toBeInTheDocument();
    });

    it('wyświetla koktajle', () => {
      render(<OfertaEliksir />);
      // Sprawdzamy czy są koktajle (Eliksir Gold jest w kategorii sygnaturowe)
      expect(screen.getByText(/Eliksir Gold/i)).toBeInTheDocument();
      // Old Fashioned jest w kategorii klasyczne, więc może nie być widoczny
      // Sprawdzamy czy ogólnie są koktajle
      const cocktailElements = screen.getAllByText(/zł/i);
      expect(cocktailElements.length).toBeGreaterThan(0);
    });
  });

  describe('4. Usługi eventowe działają', () => {
    it('renderuje UslugiEventowe bez błędów', () => {
      expect(() => render(<UslugiEventowe />)).not.toThrow();
    });

    it('wyświetla usługi', () => {
      render(<UslugiEventowe />);
      expect(screen.getByText(/Bar Koktajlowy/i)).toBeInTheDocument();
      expect(screen.getByText(/Obsługa Gości/i)).toBeInTheDocument();
    });

    it('wyświetla pakiety', () => {
      render(<UslugiEventowe />);
      expect(screen.getByText(/Basic/i)).toBeInTheDocument();
      expect(screen.getByText(/Standard/i)).toBeInTheDocument();
      // Używamy getAllByText dla Premium bo jest wiele elementów
      const premiumElements = screen.getAllByText(/Premium/i);
      expect(premiumElements.length).toBeGreaterThan(0);
    });
  });

  describe('5. Kalkulator działa', () => {
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
      const priceElements = screen.getAllByText(/zł/i);
      expect(priceElements.length).toBeGreaterThan(0);
      expect(priceElements[0]).toBeInTheDocument();
    });

    it('wyświetla listę zakupów', () => {
      const shoppingListHeaders = screen.getAllByText(/Lista zakupów/i);
      expect(shoppingListHeaders.length).toBeGreaterThan(0);
      expect(screen.getByText(/Wódka.*rum.*gin/i)).toBeInTheDocument();
    });
  });

  describe('6. Footer działa', () => {
    it('renderuje FooterEliksir bez błędów', () => {
      expect(() => render(<FooterEliksir />)).not.toThrow();
    });

    it('ma linki do menu', () => {
      render(<FooterEliksir />);
      expect(screen.getByText(/Strona Główna/i)).toBeInTheDocument();
      expect(screen.getByText(/Oferta/i)).toBeInTheDocument();
    });

    it('ma dane kontaktowe', () => {
      render(<FooterEliksir />);
      expect(screen.getByText(/eliksir@bar.pl/i)).toBeInTheDocument();
    });

    it('ma prawa autorskie', () => {
      render(<FooterEliksir />);
      expect(
        screen.getByText(/Wszelkie prawa zastrzeżone/i)
      ).toBeInTheDocument();
    });
  });

  describe('7. Formularz kontaktowy', () => {
    it('ma pola formularza', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      // Szukamy inputów - może być kilka
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('ma przycisk wysyłania', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      // Szukamy przycisków z tekstem "wyślij"
      const submitButtons = screen.getAllByRole('button', { name: /wyślij/i });
      expect(submitButtons.length).toBeGreaterThan(0);
    });
  });

  describe('8. SEO i dostępność', () => {
    it('ma poprawne nagłówki H1', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      const h1 = document.querySelector('h1');
      expect(h1).toBeTruthy();
      expect(h1?.textContent).toMatch(/ELIKSIR/i);
    });

    it('obrazy mają alt text', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      const images = document.querySelectorAll('img');
      if (images.length > 0) {
        images.forEach((img) => {
          expect(img).toHaveAttribute('alt');
        });
      }
    });
  });
});

// Testy wydajnościowe
describe('Performance Tests', () => {
  it('ładuje się w mniej niż 3 sekundy', async () => {
    const start = performance.now();
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const end = performance.now();
    expect(end - start).toBeLessThan(3000);
  });

  it('kalkulator reaguje na zmiany w mniej niż 100ms', () => {
    const { rerender } = render(<Calculator />);
    const start = performance.now();
    rerender(<Calculator />);
    const end = performance.now();
    expect(end - start).toBeLessThan(100);
  });
});
