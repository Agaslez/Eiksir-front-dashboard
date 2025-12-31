/**
 * Authentication and Authorization Utilities
 * SECURITY: JWT token management, validation, and access control
 */

// Storage key for JWT token
export const JWT_STORAGE_KEY = 'eliksir_jwt_token';

// Token validation regex (basic JWT format check)
const JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

/**
 * SECURITY: Get JWT token from localStorage with validation
 * Prevents XSS by validating token format before use
 */
export function getToken(): string | null {
  try {
    const token = localStorage.getItem(JWT_STORAGE_KEY);
    
    if (!token) return null;
    
    // Validate JWT format (basic check)
    if (!JWT_REGEX.test(token)) {
      console.warn('Invalid JWT format detected, removing token');
      removeToken();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error reading token from storage:', error);
    return null;
  }
}

/**
 * SECURITY: Store JWT token securely in localStorage
 * Note: For production, consider httpOnly cookies for additional security
 */
export function setToken(token: string): void {
  try {
    if (!token || !JWT_REGEX.test(token)) {
      throw new Error('Invalid token format');
    }
    localStorage.setItem(JWT_STORAGE_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
    throw error;
  }
}

/**
 * SECURITY: Remove JWT token and cleanup
 * Called on logout or token invalidation
 */
export function removeToken(): void {
  try {
    localStorage.removeItem(JWT_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
}

/**
 * SECURITY: Check if user is authenticated
 * Returns true if valid token exists
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token;
}

/**
 * SECURITY: Decode JWT payload (without verification)
 * WARNING: This does NOT validate the signature - server must verify
 * Used only for reading claims like role, expiry
 */
export function decodeToken(token: string): any {
  try {
    if (!JWT_REGEX.test(token)) {
      throw new Error('Invalid token format');
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT structure');
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * SECURITY: Check if token is expired
 * Returns true if token is expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }
    
    // exp is in seconds, Date.now() is in milliseconds
    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    // Add 60s buffer to account for clock skew
    return currentTime >= (expiryTime - 60000);
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
}

/**
 * SECURITY: Get user role from token
 * Returns null if token is invalid or expired
 */
export function getUserRole(token?: string): string | null {
  try {
    const jwtToken = token || getToken();
    if (!jwtToken) return null;
    
    if (isTokenExpired(jwtToken)) {
      removeToken();
      return null;
    }
    
    const payload = decodeToken(jwtToken);
    return payload?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * SECURITY: Check if user has required role
 * Implements role-based access control (RBAC)
 */
export function hasRole(requiredRole: string, token?: string): boolean {
  const userRole = getUserRole(token);
  if (!userRole) return false;
  
  // Role hierarchy: owner > admin > manager > staff > customer
  const roleHierarchy: Record<string, number> = {
    owner: 5,
    admin: 4,
    manager: 3,
    staff: 2,
    customer: 1,
  };
  
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * SECURITY: Require authentication guard
 * Throws error if not authenticated - use in protected routes
 */
export function requireAuth(): void {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }
  
  const token = getToken();
  if (token && isTokenExpired(token)) {
    removeToken();
    throw new Error('Session expired');
  }
}

/**
 * SECURITY: Require specific role guard
 * Throws error if user doesn't have required role
 */
export function requireRole(role: string): void {
  requireAuth();
  
  if (!hasRole(role)) {
    throw new Error('Insufficient permissions');
  }
}

/**
 * SECURITY: Create authenticated fetch headers
 * Automatically includes Authorization header with JWT
 */
export function createAuthHeaders(additionalHeaders?: HeadersInit): HeadersInit {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
  
  if (token) {
    if (isTokenExpired(token)) {
      removeToken();
      throw new Error('Session expired');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * SECURITY: Authenticated fetch wrapper
 * Automatically handles token injection and expiry
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const headers = createAuthHeaders(options.headers);
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      removeToken();
      throw new Error('Session expired or unauthorized');
    }
    
    return response;
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
}

/**
 * SECURITY: Logout helper
 * Cleans up all session data
 */
export function logout(): void {
  removeToken();
  // Clear any other session-related storage
  sessionStorage.clear();
}

/**
 * SECURITY: Get user ID from token
 */
export function getUserId(token?: string): string | null {
  try {
    const jwtToken = token || getToken();
    if (!jwtToken) return null;
    
    if (isTokenExpired(jwtToken)) {
      removeToken();
      return null;
    }
    
    const payload = decodeToken(jwtToken);
    return payload?.userId || payload?.sub || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

/**
 * SECURITY: Sanitize error messages
 * Prevents information leakage in error messages
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose internal error details
    if (error.message.includes('database') || 
        error.message.includes('internal') ||
        error.message.includes('server')) {
      return 'An error occurred. Please try again.';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}
