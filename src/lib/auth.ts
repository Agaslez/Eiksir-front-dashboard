import { jwtVerify, SignJWT } from 'jose';

// Proste rozwiązanie - zawsze używaj fallbacka w testach
const getJwtSecret = () => {
  // W środowisku testowym (Jest) - zawsze fallback
  if (typeof jest !== 'undefined') {
    return 'test-secret-key-for-jest-tests';
  }
  
  // W środowisku Vite (przeglądarka)
  try {
    if (import.meta.env?.VITE_JWT_SECRET) {
      return import.meta.env.VITE_JWT_SECRET;
    }
  } catch (e) {
    // Ignoruj błędy w testach
  }
  
  // Fallback
  return 'eliksir-bar-secret-key-min-32-chars-change-in-prod';
};

const JWT_SECRET = new TextEncoder().encode(getJwtSecret());

const TOKEN_EXPIRY = '7d';

interface UserPayload {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  [key: string]: unknown;
}

export async function createAuthToken(payload: UserPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (
      payload &&
      typeof payload === 'object' &&
      'id' in payload &&
      'email' in payload &&
      'role' in payload
    ) {
      return {
        id: String(payload.id),
        email: String(payload.email),
        role: payload.role as 'admin' | 'editor' | 'viewer'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  
  if (!token || !userData) return false;
  
  try {
    // Podstawowa weryfikacja - w produkcji verifyAuthToken(token)
    const user = JSON.parse(userData);
    return !!user.id && !!user.email && !!user.role;
  } catch {
    return false;
  }
}

export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user_data');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return user.role || null;
  } catch {
    return null;
  }
}

export function requireAuth(requiredRole?: string): boolean {
  // DEBUG: Sprawdź co jest w localStorage
  console.log('requireAuth called, localStorage:', {
    auth_token: localStorage.getItem('auth_token'),
    user_data: localStorage.getItem('user_data'),
    isAuthenticated: isAuthenticated()
  });
  
  if (!isAuthenticated()) {
    console.log('Not authenticated, redirecting to login');
    window.location.href = '/admin/login';
    return false;
  }
  
  if (requiredRole) {
    const userRole = getUserRole();
    console.log('User role:', userRole, 'Required role:', requiredRole);
    
    if (userRole !== requiredRole && userRole !== 'admin') {
      console.log('Insufficient permissions, redirecting to unauthorized');
      window.location.href = '/admin/unauthorized';
      return false;
    }
  }
  
  console.log('Authentication successful');
  return true;
}

export function logout(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  window.location.href = '/admin/login';
}