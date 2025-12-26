import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'manager' | 'staff' | 'customer';
  tenantId: string;
  isActive: boolean;
  emailVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  // No refresh token - JWT Bearer only
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage key for JWT token (optional - for dev convenience)
const JWT_STORAGE_KEY = 'eliksir_jwt_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    // Load token from localStorage on init (optional)
    return localStorage.getItem(JWT_STORAGE_KEY);
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Create request headers with JWT Bearer token
  const createHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return headers;
  };

  // Fetch current user from /me endpoint (source of truth)
  const fetchCurrentUser = useCallback(async (token: string | null) => {
    if (!token) {
      setUser(null);
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const userData = data.user;
          setUser({
            id: userData.id.toString(),
            email: userData.email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            role: userData.role,
            tenantId: userData.tenantId?.toString() || '',
            isActive: true,
            emailVerified: true,
          });
          return true;
        }
      }
      // If /me fails, token is invalid
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem(JWT_STORAGE_KEY);
      return false;
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      setUser(null);
      return false;
    }
  }, [API_BASE_URL]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken) {
        await fetchCurrentUser(accessToken);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [accessToken, fetchCurrentUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Login with JWT Bearer (no cookies, no CSRF)
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      if (!data.success || !data.accessToken) {
        throw new Error('Invalid response from server');
      }

      // Store JWT token
      const token = data.accessToken;
      setAccessToken(token);
      localStorage.setItem(JWT_STORAGE_KEY, token);

      // Fetch user data from /me (source of truth)
      await fetchCurrentUser(token);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, fetchCurrentUser]);

  const logout = useCallback(async () => {
    try {
      setError(null);
      
      // Optional: call logout endpoint (though JWT is stateless)
      if (accessToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: createHeaders(),
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear token and user
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem(JWT_STORAGE_KEY);
    }
  }, [API_BASE_URL, accessToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
