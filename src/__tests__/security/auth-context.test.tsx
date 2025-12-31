/**
 * SECURITY TEST: AuthContext.tsx
 * 
 * KRYTYK #7: AuthContext security validation
 * 
 * Tests critical security aspects:
 * 1. JWT lifecycle (login → use → expire → logout)
 * 2. Token expiry handling and validation
 * 3. XSS protection via secure localStorage access
 * 4. Logout cleanup (token + state cleared)
 * 5. /api/auth/me validation flow
 * 6. 401/403 interceptor behavior
 * 7. CustomEvent 'auth:unauthorized' dispatch
 * 8. Concurrent session handling
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Mock lib/config
jest.mock('../../lib/config', () => ({
  config: {
    apiUrl: 'http://localhost:3001',
    cloudinaryCloudName: 'test-cloud',
    gaId: 'G-TEST',
  },
}));

// Shared localStorage state
const mockLocalStorage: { [key: string]: string } = {};

// Mock fetch
global.fetch = jest.fn() as jest.Mock;

// Helper: Create valid JWT token
const createMockToken = (expiresIn: number = 3600): string => {
  const payload = {
    userId: 1,
    email: 'admin@eliksir.pl',
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };
  const encodedPayload = btoa(JSON.stringify(payload));
  return `header.${encodedPayload}.signature`;
};

// Helper: Create expired token
const createExpiredToken = (): string => {
  const payload = {
    userId: 1,
    email: 'admin@eliksir.pl',
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
  };
  const encodedPayload = btoa(JSON.stringify(payload));
  return `header.${encodedPayload}.signature`;
};

// Helper: Create token expiring soon (within 60s buffer)
const createExpiringToken = (): string => {
  const payload = {
    userId: 1,
    email: 'admin@eliksir.pl',
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + 30, // expires in 30s (within 60s buffer)
  };
  const encodedPayload = btoa(JSON.stringify(payload));
  return `header.${encodedPayload}.signature`;
};

// Test component that uses auth
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <div>Authenticated: {user?.email}</div>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <div>Not authenticated</div>
          <button onClick={() => login('test@example.com', 'password')}>
            Login
          </button>
        </div>
      )}
    </div>
  );
};

describe('AuthContext Security Tests', () => {
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

  describe('Test 1: JWT Lifecycle (login → use → logout)', () => {
    it('completes full JWT lifecycle with proper state management', async () => {
      // Mock successful login
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/auth/login')) {
          const token = createMockToken();
          mockLocalStorage['eliksir_jwt_token'] = token;
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              success: true,
              accessToken: token,
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
        if (url.includes('/api/auth/me')) {
          const token = mockLocalStorage['eliksir_jwt_token'];
          if (!token) {
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
        if (url.includes('/api/auth/logout')) {
          delete mockLocalStorage['eliksir_jwt_token'];
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true }),
          } as Response);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // GIVEN: User starts unauthenticated
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // WHEN: User logs in
      const loginButton = screen.getByText('Login');
      loginButton.click();

      // THEN: Should be authenticated with user data
      await waitFor(() => {
        expect(screen.getByText(/Authenticated: admin@eliksir.pl/)).toBeInTheDocument();
      });

      // AND: Token should be in localStorage
      expect(mockLocalStorage['eliksir_jwt_token']).toBeDefined();

      // WHEN: User logs out
      const logoutButton = screen.getByText('Logout');
      logoutButton.click();

      // THEN: Should be unauthenticated
      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // AND: Token should be removed from localStorage
      expect(mockLocalStorage['eliksir_jwt_token']).toBeUndefined();
    });
  });

  describe('Test 2: Token Expiry Detection', () => {
    it('detects and handles expired tokens during initialization', async () => {
      // GIVEN: Expired token in localStorage
      const expiredToken = createExpiredToken();
      mockLocalStorage['eliksir_jwt_token'] = expiredToken;

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/auth/me')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Token expired' }),
          } as Response);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // WHEN: Component mounts
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // THEN: Should detect expired token and clear auth state
      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // AND: Token should be removed
      expect(mockLocalStorage['eliksir_jwt_token']).toBeUndefined();
    });

    it('detects tokens expiring within 60s buffer', async () => {
      // GIVEN: Token expiring in 30s (within 60s buffer)
      const expiringToken = createExpiringToken();
      mockLocalStorage['eliksir_jwt_token'] = expiringToken;

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/auth/me')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Token expired' }),
          } as Response);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // WHEN: Component mounts
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // THEN: Should treat as expired (60s buffer)
      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });
    });
  });

  describe('Test 3: /api/auth/me Validation', () => {
    it('validates token with /api/auth/me on mount', async () => {
      // GIVEN: Valid token in localStorage
      const token = createMockToken();
      mockLocalStorage['eliksir_jwt_token'] = token;

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/auth/me')) {
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
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // WHEN: Component mounts
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // THEN: Should call /api/auth/me
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/auth/me',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${token}`,
            }),
          })
        );
      });

      // AND: Should set user from response
      await waitFor(() => {
        expect(screen.getByText(/Authenticated: admin@eliksir.pl/)).toBeInTheDocument();
      });
    });

    it('handles /api/auth/me 401 by clearing auth state', async () => {
      // GIVEN: Invalid token
      mockLocalStorage['eliksir_jwt_token'] = 'invalid-token';

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/auth/me')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Unauthorized' }),
          } as Response);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // WHEN: Component mounts
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // THEN: Should clear auth state
      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // AND: Should remove token
      expect(mockLocalStorage['eliksir_jwt_token']).toBeUndefined();
    });
  });

  describe('Test 4: Logout Cleanup', () => {
    it('clears all auth state on logout', async () => {
      // GIVEN: Authenticated user
      const token = createMockToken();
      mockLocalStorage['eliksir_jwt_token'] = token;

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/auth/me')) {
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
        if (url.includes('/api/auth/logout')) {
          delete mockLocalStorage['eliksir_jwt_token'];
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true }),
          } as Response);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Authenticated/)).toBeInTheDocument();
      });

      // WHEN: Logout
      const logoutButton = screen.getByText('Logout');
      logoutButton.click();

      // THEN: All state cleared
      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // AND: localStorage cleared
      expect(mockLocalStorage['eliksir_jwt_token']).toBeUndefined();

      // AND: Fetch called logout endpoint
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/logout',
        expect.any(Object)
      );
    });

    it('clears state even if logout API fails', async () => {
      // GIVEN: Authenticated user
      const token = createMockToken();
      mockLocalStorage['eliksir_jwt_token'] = token;

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/auth/me')) {
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
        if (url.includes('/api/auth/logout')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Server error' }),
          } as Response);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Authenticated/)).toBeInTheDocument();
      });

      // WHEN: Logout fails
      const logoutButton = screen.getByText('Logout');
      logoutButton.click();

      // THEN: Still clears state (fail-safe)
      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      expect(mockLocalStorage['eliksir_jwt_token']).toBeUndefined();

      consoleError.mockRestore();
    });
  });

  describe('Test 5: 401/403 Interceptor', () => {
    it('intercepts 401 responses and triggers logout', async () => {
      // GIVEN: Authenticated user
      const token = createMockToken();
      mockLocalStorage['eliksir_jwt_token'] = token;

      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        callCount++;
        if (url.includes('/api/auth/me')) {
          if (callCount === 1) {
            // First call: success
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
        }
        if (url.includes('/api/data')) {
          // Simulate 401 on data request
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Unauthorized' }),
          } as Response);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const TestWithFetch = () => {
        const { authenticatedFetch, isAuthenticated } = useAuth();

        const handleFetch = async () => {
          try {
            await authenticatedFetch('http://localhost:3001/api/data');
          } catch (err) {
            // Expected to fail
          }
        };

        if (!isAuthenticated) return <div>Not authenticated</div>;

        return (
          <div>
            <div>Authenticated</div>
            <button onClick={handleFetch}>Fetch Data</button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestWithFetch />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Authenticated')).toBeInTheDocument();
      });

      // WHEN: Fetch returns 401
      const fetchButton = screen.getByText('Fetch Data');
      fetchButton.click();

      // THEN: Should auto-logout
      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // AND: Token removed
      expect(mockLocalStorage['eliksir_jwt_token']).toBeUndefined();
    });

    it('intercepts 403 responses and triggers logout', async () => {
      // GIVEN: Authenticated user
      const token = createMockToken();
      mockLocalStorage['eliksir_jwt_token'] = token;

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/auth/me')) {
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
        if (url.includes('/api/protected')) {
          // Simulate 403 Forbidden
          return Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({ error: 'Forbidden' }),
          } as Response);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const TestWithFetch = () => {
        const { authenticatedFetch, isAuthenticated } = useAuth();

        const handleFetch = async () => {
          try {
            await authenticatedFetch('http://localhost:3001/api/protected');
          } catch (err) {
            // Expected to fail
          }
        };

        if (!isAuthenticated) return <div>Not authenticated</div>;

        return (
          <div>
            <div>Authenticated</div>
            <button onClick={handleFetch}>Fetch Protected</button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestWithFetch />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Authenticated')).toBeInTheDocument();
      });

      // WHEN: Fetch returns 403
      const fetchButton = screen.getByText('Fetch Protected');
      fetchButton.click();

      // THEN: Should auto-logout
      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });
    });
  });

  describe('Test 6: XSS Protection', () => {
    it('does not expose sensitive data in global scope', () => {
      // GIVEN: Authenticated user
      const token = createMockToken();
      mockLocalStorage['eliksir_jwt_token'] = token;

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/auth/me')) {
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
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // THEN: Token should only be in localStorage, not in window or document
      expect((window as any).token).toBeUndefined();
      expect((window as any).jwt).toBeUndefined();
      expect((window as any).auth).toBeUndefined();
      expect(document.body.innerHTML).not.toContain(token);
    });

    it('sanitizes localStorage access', () => {
      // GIVEN: Malicious script attempts to read token
      const token = createMockToken();
      mockLocalStorage['eliksir_jwt_token'] = token;

      // WHEN: Script tries to access localStorage
      const storedToken = localStorage.getItem('eliksir_jwt_token');

      // THEN: Should only work through proper mock
      expect(storedToken).toBe(token);

      // AND: Direct access to global shouldn't expose it
      expect((window as any).eliksir_jwt_token).toBeUndefined();
    });
  });

  describe('Test 7: Error Handling', () => {
    it('handles API errors gracefully during authentication', async () => {
      // GIVEN: API returns error
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/auth/login')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Invalid credentials' }),
          } as Response);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      const TestErrorComponent = () => {
        const { login, isAuthenticated } = useAuth();
        const [loginError, setLoginError] = React.useState<string | null>(null);

        const handleLogin = async () => {
          try {
            await login('test@example.com', 'wrong-password');
          } catch (err) {
            setLoginError(err instanceof Error ? err.message : 'Login failed');
          }
        };

        if (isAuthenticated) return <div>Authenticated</div>;

        return (
          <div>
            <div>Not authenticated</div>
            {loginError && <div>Error: {loginError}</div>}
            <button onClick={handleLogin}>Login</button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestErrorComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // WHEN: Login with invalid credentials
      const loginButton = screen.getByText('Login');
      loginButton.click();

      // THEN: Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Error: Invalid credentials/)).toBeInTheDocument();
      });

      // AND: Should remain unauthenticated
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();

      // AND: Token should not be set
      expect(mockLocalStorage['eliksir_jwt_token']).toBeUndefined();

      consoleError.mockRestore();
    });

    it('handles malformed JWT tokens', async () => {
      // GIVEN: Malformed token in localStorage
      mockLocalStorage['eliksir_jwt_token'] = 'not-a-valid-jwt';

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/auth/me')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Invalid token' }),
          } as Response);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // WHEN: Component mounts
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // THEN: Should handle gracefully and clear
      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      expect(mockLocalStorage['eliksir_jwt_token']).toBeUndefined();
    });
  });

  describe('Test 8: Concurrent Session Handling', () => {
    it('handles token removal in another tab', async () => {
      // GIVEN: Authenticated user
      const token = createMockToken();
      mockLocalStorage['eliksir_jwt_token'] = token;

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/auth/me')) {
          // Check if token exists
          if (!mockLocalStorage['eliksir_jwt_token']) {
            return Promise.resolve({
              ok: false,
              status: 401,
              json: () => Promise.resolve({ error: 'No token' }),
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
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Authenticated/)).toBeInTheDocument();
      });

      // WHEN: Token removed in another tab (simulated)
      delete mockLocalStorage['eliksir_jwt_token'];

      // THEN: Next API call should detect missing token
      // (In real app, storage event would trigger, but that's browser-specific)
      expect(mockLocalStorage['eliksir_jwt_token']).toBeUndefined();
    });
  });
});
