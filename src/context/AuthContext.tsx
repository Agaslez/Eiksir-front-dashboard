import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  name?: string;
  tenantId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  csrfToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Helper to get CSRF token from cookies
const getCSRFToken = (): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrfToken=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Helper to add CSRF token to request headers
const createHeaders = (csrfToken: string | null) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }
  return headers;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCSRFToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const csrfFromCookie = getCSRFToken();
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          headers: createHeaders(csrfFromCookie),
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setCSRFToken(csrfFromCookie);
        } else {
          setUser(null);
          setCSRFToken(null);
        }
      } catch (error) {
        console.error("Błąd sprawdzania statusu autoryzacji:", error);
        setUser(null);
        setCSRFToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const refreshToken = async () => {
    try {
      const csrfFromCookie = getCSRFToken();
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: createHeaders(csrfFromCookie),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.csrfToken) {
          setCSRFToken(data.csrfToken);
        }
      }
    } catch (error) {
      console.error("Token refresh error:", error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Logowanie nie powiodło się");
      }

      const userData = await response.json();
      setUser(userData.user);
      setCSRFToken(userData.csrfToken);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const csrfFromCookie = getCSRFToken();
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: createHeaders(csrfFromCookie),
        credentials: "include",
      });
    } finally {
      setUser(null);
      setCSRFToken(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    csrfToken,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};