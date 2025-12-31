/**
 * INTEGRATION TEST: Dashboard.tsx
 * 
 * KRYTYK #5: Dashboard routing and authentication
 * 
 * Tests critical admin dashboard functionality:
 * 1. No token → redirect to /login
 * 2. Valid token → shows navigation menu
 * 3. Menu navigation → route changes
 * 4. Logout → clears token and redirects
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Dashboard from '../../pages/admin/Dashboard';

// Mock lib/config to avoid import.meta.env issues
jest.mock('../../lib/config', () => ({
  config: {
    apiUrl: 'http://localhost:3001',
    cloudinaryCloudName: 'test-cloud',
    gaId: 'G-TEST',
  },
}));

// Mock DashboardHome to avoid import.meta.env issues
jest.mock('../../components/admin/DashboardHome', () => ({
  __esModule: true,
  default: () => <div>Dashboard Home Content</div>,
}));

// Mock components
const MockDashboardHome = () => <div>Dashboard Home Content</div>;
const MockLogin = () => <div>Login Page</div>;
const MockContentEditor = () => <div>Content Editor</div>;
const MockCalculatorSettings = () => <div>Calculator Settings</div>;
const MockEmailSettings = () => <div>Email Settings</div>;
const MockAnalytics = () => <div>Analytics</div>;

// Shared localStorage state (must be accessible by fetch mock)
const mockLocalStorage: { [key: string]: string } = {};

// Mock fetch for auth and stats  
global.fetch = jest.fn((url: string) => {
  if (url.includes('/api/auth/me')) {
    const token = mockLocalStorage['eliksir_jwt_token'];
    if (!token || token === 'invalid') {
      return Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      } as Response);
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        success: true,
        user: { 
          id: 1, 
          email: 'admin@eliksir.pl', 
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          tenantId: 1,
        },
      }),
    } as Response);
  }
  
  if (url.includes('/api/seo/stats')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        success: true,
        data: {
          totalViews: 1234,
          uniqueVisitors: 567,
          averageTimeOnPage: 45,
          bounceRate: 25,
          popularPages: [
            { path: '/oferta', views: 234 },
            { path: '/kontakt', views: 123 },
          ],
          trafficSources: [
            { referrer: 'Google', visits: 450 },
            { referrer: 'Direct', visits: 117 },
          ],
        },
      }),
    } as Response);
  }

  return Promise.reject(new Error('Unknown endpoint'));
}) as jest.Mock;

// Helper: Create valid JWT token (mock)
const createMockToken = (): string => {
  const payload = {
    userId: 1,
    email: 'admin@eliksir.pl',
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
  };
  
  // Simple base64 encoding for test (not real JWT)
  const encodedPayload = btoa(JSON.stringify(payload));
  return `header.${encodedPayload}.signature`;
};

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    // Reset shared state
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
    
    // Mock localStorage with shared state
    (localStorage.getItem as jest.Mock).mockImplementation((key: string) => mockLocalStorage[key] || null);
    (localStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    (localStorage.removeItem as jest.Mock).mockImplementation((key: string) => {
      delete mockLocalStorage[key];
    });
    (localStorage.clear as jest.Mock).mockImplementation(() => {
      Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
    });
    
    jest.clearAllMocks();
  });

  describe('Test 1: No token → redirect to login', () => {
    it('redirects unauthenticated user to /admin/login', async () => {
      // GIVEN: No token in localStorage
      expect(localStorage.getItem('eliksir_jwt_token')).toBeNull();

      // WHEN: User tries to access /admin
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <AuthProvider>
            <Routes>
              <Route path="/admin" element={<Dashboard />}>
                <Route index element={<MockDashboardHome />} />
              </Route>
              <Route path="/admin/login" element={<MockLogin />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // THEN: Should redirect to login page
      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });

      // AND: Should not show dashboard
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Wyloguj')).not.toBeInTheDocument();
    });
  });

  describe('Test 2: Valid token → shows navigation menu', () => {
    it('renders dashboard with menu for authenticated user', async () => {
      // GIVEN: Valid token in localStorage
      const token = createMockToken();
      localStorage.setItem('eliksir_jwt_token', token);

      // WHEN: User accesses /admin
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <AuthProvider>
            <Routes>
              <Route path="/admin" element={<Dashboard />}>
                <Route index element={<MockDashboardHome />} />
              </Route>
              <Route path="/admin/login" element={<MockLogin />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // THEN: Should show ELIKSIR branding
      await waitFor(() => {
        expect(screen.getByText('ELIKSIR')).toBeInTheDocument();
      });

      // AND: Should show navigation menu items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Treść')).toBeInTheDocument();
      expect(screen.getByText('Kalkulator')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();

      // AND: Should show user info
      expect(screen.getByText('admin@eliksir.pl')).toBeInTheDocument();

      // AND: Should show logout button
      expect(screen.getByText('Wyloguj')).toBeInTheDocument();

      // AND: Should not redirect to login
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('Test 3: Menu navigation → route changes', () => {
    it('navigates to different admin sections when clicking menu items', async () => {
      // GIVEN: Authenticated user on /admin
      const token = createMockToken();
      localStorage.setItem('eliksir_jwt_token', token);
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <AuthProvider>
            <Routes>
              <Route path="/admin" element={<Dashboard />}>
                <Route index element={<MockDashboardHome />} />
                <Route path="content" element={<MockContentEditor />} />
                <Route path="calculator" element={<MockCalculatorSettings />} />
                <Route path="email" element={<MockEmailSettings />} />
                <Route path="analytics" element={<MockAnalytics />} />
              </Route>
              <Route path="/admin/login" element={<MockLogin />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('ELIKSIR')).toBeInTheDocument();
      });

      // WHEN: Click "Treść" (Content) menu item
      const contentButton = screen.getByRole('button', { name: /Treść/i });
      await user.click(contentButton);

      // THEN: Should show Content Editor
      await waitFor(() => {
        expect(screen.getByText('Content Editor')).toBeInTheDocument();
      });

      // WHEN: Click "Kalkulator" menu item
      const calculatorButton = screen.getByRole('button', { name: /Kalkulator/i });
      await user.click(calculatorButton);

      // THEN: Should show Calculator Settings
      await waitFor(() => {
        expect(screen.getByText('Calculator Settings')).toBeInTheDocument();
      });

      // WHEN: Click "Email" menu item
      const emailButton = screen.getByRole('button', { name: /Email/i });
      await user.click(emailButton);

      // THEN: Should show Email Settings
      await waitFor(() => {
        expect(screen.getByText('Email Settings')).toBeInTheDocument();
      });

      // WHEN: Click "Analytics" menu item
      const analyticsButton = screen.getByRole('button', { name: /Analytics/i });
      await user.click(analyticsButton);

      // THEN: Should show Analytics mock component
      await waitFor(
        () => {
          expect(screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'div' && content === 'Analytics';
          })).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // WHEN: Click "Dashboard" menu item (back to home)
      const dashboardButton = screen.getByRole('button', { name: /^Dashboard$/i });
      await user.click(dashboardButton);

      // THEN: Should show Dashboard home content
      await waitFor(() => {
        expect(screen.getByText('Dashboard Home Content')).toBeInTheDocument();
      });
    });
  });

  describe('Test 4: Logout → clears token and redirects', () => {
    it('logs out user, clears localStorage, and redirects to login', async () => {
      // GIVEN: Authenticated user on dashboard
      const token = createMockToken();
      localStorage.setItem('eliksir_jwt_token', token);
      expect(localStorage.getItem('eliksir_jwt_token')).toBe(token);

      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <AuthProvider>
            <Routes>
              <Route path="/admin" element={<Dashboard />}>
                <Route index element={<MockDashboardHome />} />
              </Route>
              <Route path="/admin/login" element={<MockLogin />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // Wait for dashboard to render
      await waitFor(() => {
        expect(screen.getByText('ELIKSIR')).toBeInTheDocument();
      });

      // WHEN: Click "Wyloguj" (Logout) button
      const logoutButton = screen.getByRole('button', { name: /Wyloguj/i });
      await user.click(logoutButton);

      // THEN: Should clear localStorage token
      await waitFor(() => {
        expect(localStorage.getItem('eliksir_jwt_token')).toBeNull();
      });

      // AND: Should redirect to login page
      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });

      // AND: Should not show dashboard content
      expect(screen.queryByText('Wyloguj')).not.toBeInTheDocument();
      expect(screen.queryByText('admin@eliksir.pl')).not.toBeInTheDocument();
    });
  });

  describe('Test 5: Active route highlighting', () => {
    it('highlights current active menu item with golden background', async () => {
      // GIVEN: Authenticated user on /admin
      const token = createMockToken();
      localStorage.setItem('eliksir_jwt_token', token);

      const { container } = render(
        <MemoryRouter initialEntries={['/admin']}>
          <AuthProvider>
            <Routes>
              <Route path="/admin" element={<Dashboard />}>
                <Route index element={<MockDashboardHome />} />
                <Route path="content" element={<MockContentEditor />} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('ELIKSIR')).toBeInTheDocument();
      });

      // THEN: Dashboard button should have active styling (bg-eliksir-gold)
      const dashboardButton = screen.getByRole('button', { name: /^Dashboard$/i });
      expect(dashboardButton).toHaveClass('bg-eliksir-gold');

      // AND: Other buttons should NOT have active styling
      const contentButton = screen.getByRole('button', { name: /Treść/i });
      expect(contentButton).not.toHaveClass('bg-eliksir-gold');
    });
  });

  describe('Test 6: Footer copyright', () => {
    it('displays current year in footer', async () => {
      // GIVEN: Authenticated user
      const token = createMockToken();
      localStorage.setItem('eliksir_jwt_token', token);

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <AuthProvider>
            <Routes>
              <Route path="/admin" element={<Dashboard />}>
                <Route index element={<MockDashboardHome />} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('ELIKSIR')).toBeInTheDocument();
      });

      // THEN: Footer should show current year
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} ELIKSIR Bar`))).toBeInTheDocument();
    });
  });
});
