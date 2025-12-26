// Nowy system auth z HttpOnly cookies
// Backend ustawia cookies, frontend tylko wysyła credentials: "include"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface User {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  name?: string;
}

// Sprawdź czy użytkownik jest zalogowany (zapytanie do backendu)
export async function checkAuthStatus(): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Auth status check error:", error);
    return null;
  }
}

// Logowanie - backend ustawia cookies
export async function login(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  return await response.json();
}

// Wylogowanie - backend czyści cookies
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// Helper do sprawdzania roli (dla kompatybilności)
export async function getUserRole(): Promise<string | null> {
  const user = await checkAuthStatus();
  return user?.role || null;
}

// Helper do sprawdzania autoryzacji (dla kompatybilności)
export async function checkAuth(requiredRole?: string): Promise<{
  isAuthenticated: boolean;
  hasPermission: boolean;
}> {
  const user = await checkAuthStatus();

  if (!user) {
    return { isAuthenticated: false, hasPermission: false };
  }

  if (requiredRole) {
    const hasPermission = user.role === requiredRole || user.role === "admin";
    return { isAuthenticated: true, hasPermission };
  }

  return { isAuthenticated: true, hasPermission: true };
}

// Stare funkcje dla kompatybilności (tylko dla testów)
export function isAuthenticated(): boolean {
  console.warn("isAuthenticated() is deprecated - use checkAuthStatus()");
  return false;
}

// Stare funkcje JWT tylko dla testów/developmentu
export async function createAuthToken(payload: any): Promise<string> {
  console.warn("createAuthToken() is for tests only - use backend in production");
  return "mock-token-for-tests-only";
}

export async function verifyAuthToken(token: string): Promise<any> {
  console.warn("verifyAuthToken() is for tests only - use backend in production");
  return null;
}