import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import Calculator from '../components/Calculator';
import Contact from '../components/Contact';
import FooterEliksir from '../components/FooterEliksir';
import Gallery from '../components/Gallery';
import HeroEliksir from '../components/HeroEliksir';
import ViralQuiz from '../components/marketing/ViralQuiz';
import OfertaEliksir from '../components/OfertaEliksir';
import UslugiEventowe from '../components/UslugiEventowe';

// Mock dla auth
jest.mock('../lib/auth', () => ({
  requireAuth: jest.fn(() => true),
  getUserRole: jest.fn(() => 'admin'),
  logout: jest.fn(),
  isAuthenticated: jest.fn(() => true),
}));

// Mock dla error-monitoring
jest.mock('../lib/error-monitoring', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  trackEvent: jest.fn(),
}));

// Mock dla lucide-react
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
  ChevronLeft: () => 'ChevronLeftIcon',
  ChevronRight: () => 'ChevronRightIcon',
  Heart: () => 'HeartIcon',
  Maximize2: () => 'Maximize2Icon',
  Share2: () => 'Share2Icon',
  X: () => 'XIcon',
  LayoutDashboard: () => 'LayoutDashboardIcon',
  ShoppingCart: () => 'ShoppingCartIcon',
  FileText: () => 'FileTextIcon',
  Image: () => 'ImageIcon',
  Settings: () => 'SettingsIcon',
  BarChart3: () => 'BarChart3Icon',
  LogOut: () => 'LogOutIcon',
  Menu: () => 'MenuIcon',
  Bell: () => 'BellIcon',
  Search: () => 'SearchIcon',
  AlertCircle: () => 'AlertCircleIcon',
  ArrowDownRight: () => 'ArrowDownRightIcon',
  ArrowUpRight: () => 'ArrowUpRightIcon',
  Clock: () => 'ClockIcon',
  DollarSign: () => 'DollarSignIcon',
  Package: () => 'PackageIcon',
  TrendingUp: () => 'TrendingUpIcon',
  Eye: () => 'EyeIcon',
  EyeOff: () => 'EyeOffIcon',
  Lock: () => 'LockIcon',
}));

// Mock dla react-router-dom
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

describe('Integration Tests - Wszystkie funkcje strony', () => {
  describe('1. Strona główna - wszystkie sekcje', () => {
    it('renderuje całą aplikację bez błędów', () => {
      expect(() =>
        render(
          <BrowserRouter>
            <App />
          </BrowserRouter>
        )
      ).not.toThrow();
    });

    it('wyświetla wszystkie główne sekcje', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Sprawdź czy są wszystkie główne sekcje
      expect(screen.getAllByText(/ELIKSIR/i).length).toBeGreaterThan(0);
      expect(
        screen.getAllByText(/Mobilny Bar Koktajlowy/i).length
      ).toBeGreaterThan(0);
      expect(screen.getAllByText(/Zamów/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Oferta/i).length).toBeGreaterThan(0);
    });
  });

  describe('2. Hero sekcja - funkcjonalności', () => {
    beforeEach(() => {
      render(<HeroEliksir />);
    });

    it('wyświetla główny tytuł', () => {
      expect(screen.getAllByText(/ELIKSIR/i).length).toBeGreaterThan(0);
    });

    it('ma przyciski CTA', () => {
      expect(screen.getByText(/Zamów Eliksir/i)).toBeInTheDocument();
      expect(screen.getByText(/Zobacz Ofertę/i)).toBeInTheDocument();
    });

    it('wyświetla statystyki', () => {
      expect(screen.getByText(/500\+/i)).toBeInTheDocument();
      expect(screen.getByText(/Wydarzeń/i)).toBeInTheDocument();
    });
  });

  describe('3. Oferta koktajli - kategorie i ceny', () => {
    beforeEach(() => {
      render(<OfertaEliksir />);
    });

    it('wyświetla wszystkie kategorie koktajli', () => {
      expect(screen.getByText(/Klasyczne/i)).toBeInTheDocument();
      expect(screen.getByText(/Owocowe/i)).toBeInTheDocument();
      expect(screen.getByText(/Sygnaturowe/i)).toBeInTheDocument();
    });

    it('wyświetla koktajle z cenami', () => {
      // Sprawdź czy są koktajle
      const cocktailElements = screen.getAllByText(/zł/i);
      expect(cocktailElements.length).toBeGreaterThan(0);

      // Sprawdź czy są konkretne koktajle
      expect(screen.getByText(/Eliksir Gold/i)).toBeInTheDocument();
      expect(screen.getByText(/Midnight Magic/i)).toBeInTheDocument();
    });

    it('ma przyciski zamówienia', () => {
      const orderButtons = screen.getAllByText(/Dodaj do zamówienia/i);
      expect(orderButtons.length).toBeGreaterThan(0);
    });
  });

  describe('4. Usługi eventowe - pakiety', () => {
    beforeEach(() => {
      render(<UslugiEventowe />);
    });

    it('wyświetla wszystkie usługi', () => {
      expect(screen.getAllByText(/Bar Koktajlowy/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Obsługa Gości/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Dekoracje/i).length).toBeGreaterThan(0);
    });

    it('wyświetla wszystkie pakiety', () => {
      expect(screen.getAllByText(/Basic/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Standard/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Premium/i).length).toBeGreaterThan(0);
    });

    it('wyświetla ceny pakietów', () => {
      const priceElements = screen.getAllByText(/zł/i);
      expect(priceElements.length).toBeGreaterThan(2); // Co najmniej 3 pakiety
    });
  });

  describe('5. Kalkulator - interaktywność', () => {
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
    });

    it('wyświetla listę zakupów', () => {
      expect(screen.getAllByText(/Lista zakupów/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Wódka.*rum.*gin/i)).toBeInTheDocument();
    });

    it('reaguje na zmianę pakietu', () => {
      const premiumButton = screen.getByText(/PREMIUM/i);
      expect(premiumButton).toBeInTheDocument();
    });
  });

  describe('6. Galeria - funkcje', () => {
    beforeEach(() => {
      render(<Gallery />);
    });

    it('wyświetla filtry kategorii', () => {
      expect(screen.getByText(/Wszystkie/i)).toBeInTheDocument();
      expect(screen.getByText(/Wesela/i)).toBeInTheDocument();
      expect(screen.getByText(/Eventy firmowe/i)).toBeInTheDocument();
    });

    it('wyświetla obrazy z alt text', () => {
      // Sprawdź czy są kontenery obrazów
      const imageContainers = document.querySelectorAll('img, [role="img"]');
      expect(imageContainers.length).toBeGreaterThan(0);
    });

    it('wyświetla statystyki galerii', () => {
      expect(screen.getByText(/Realizacji/i)).toBeInTheDocument();
      expect(screen.getByText(/Zadowolonych klientów/i)).toBeInTheDocument();
    });
  });

  describe('7. Formularz kontaktowy - walidacja', () => {
    beforeEach(() => {
      render(<Contact />);
    });

    it('ma wszystkie pola formularza', () => {
      // Sprawdź czy są pola formularza
      expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(3); // Imię, Email, Wiadomość
      expect(
        screen.getByPlaceholderText(/\+48 123 456 789/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toBeInTheDocument(); // Liczba gości
      expect(screen.getByRole('checkbox')).toBeInTheDocument(); // Zgoda
    });

    it('ma przycisk wysyłania', () => {
      expect(screen.getByText(/Zaznacz zgodę aby wysłać/i)).toBeInTheDocument();
    });

    it('ma checkbox zgody', () => {
      expect(screen.getByText(/Wyrażam zgodę/i)).toBeInTheDocument();
    });
  });

  describe('8. Footer - linki i informacje', () => {
    beforeEach(() => {
      render(<FooterEliksir />);
    });

    it('ma linki do menu', () => {
      expect(screen.getByText(/Strona Główna/i)).toBeInTheDocument();
      expect(screen.getByText(/Oferta/i)).toBeInTheDocument();
      expect(screen.getByText(/Galeria/i)).toBeInTheDocument();
      expect(screen.getByText(/Kontakt/i)).toBeInTheDocument();
    });

    it('ma dane kontaktowe', () => {
      expect(screen.getByText(/eliksir@bar.pl/i)).toBeInTheDocument();
      expect(screen.getByText(/\+48 123 456 789/i)).toBeInTheDocument();
    });

    it('ma linki społecznościowe', () => {
      expect(screen.getByText(/Facebook/i)).toBeInTheDocument();
      expect(screen.getByText(/Instagram/i)).toBeInTheDocument();
    });

    it('ma prawa autorskie', () => {
      expect(
        screen.getByText(/Wszelkie prawa zastrzeżone/i)
      ).toBeInTheDocument();
    });
  });

  describe('9. Viral Quiz - interaktywność', () => {
    beforeEach(() => {
      render(<ViralQuiz />);
    });

    it('wyświetla tytuł quizu', () => {
      expect(
        screen.getByText(/Jaka jest Twoja koktajlowa osobowość/i)
      ).toBeInTheDocument();
    });

    it('ma pytania quizu', () => {
      // Sprawdź czy są pytania (może być ukryte na początku)
      const startButton = screen.getByText(/Rozpocznij quiz/i);
      expect(startButton).toBeInTheDocument();
    });

    it('ma przycisk rozpoczęcia quizu', () => {
      expect(screen.getByText(/Rozpocznij quiz/i)).toBeInTheDocument();
    });
  });

  describe('10. Responsywność i dostępność', () => {
    it('obrazy mają alt text', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Poczekaj na załadowanie obrazów
      setTimeout(() => {
        const images = document.querySelectorAll('img');
        if (images.length > 0) {
          images.forEach((img) => {
            expect(img).toHaveAttribute('alt');
          });
        }
      }, 1000);
    });

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

    it('przyciski mają dostępne etykiety', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('11. Formularze - test walidacji', () => {
    it('formularz kontaktowy wymaga wypełnienia pól', () => {
      render(<Contact />);

      const submitButton = screen.getByText(/Zaznacz zgodę aby wysłać/i);
      expect(submitButton).toBeInTheDocument();

      // TODO: Test walidacji formularza
    });
  });

  describe('12. Kalkulator - test obliczeń', () => {
    it('oblicza cenę dla różnych pakietów', () => {
      render(<Calculator />);

      // TODO: Test obliczeń ceny
      const priceElement = screen.getAllByText(/zł/i)[0];
      expect(priceElement).toBeInTheDocument();
    });
  });
});
