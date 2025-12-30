/**
 * Safe Auto-Healing Utilities
 * Provides retry logic, auth token refresh, and localStorage management
 * SAFE: Only retries read operations, never modifies data automatically
 */

import { getErrorMonitor } from './global-error-monitor';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Fetch with exponential backoff retry
 * SAFE: Only retries on network errors or 5xx server errors
 * Does NOT retry on 4xx client errors (those indicate bad requests)
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = retryOptions;

  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Success or client error (4xx) - don't retry
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Server error (5xx) - retry
      if (response.status >= 500) {
        lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      // Network error - retry
      lastError = error instanceof Error ? error : new Error('Network error');
    }

    // Don't wait after last attempt
    if (attempt < maxRetries) {
      if (onRetry) {
        onRetry(attempt + 1, lastError!);
      }

      // Log retry attempt
      getErrorMonitor()?.captureError({
        message: `Retry attempt ${attempt + 1}/${maxRetries} for ${url}`,
        type: 'manual',
        context: { url, attempt, error: lastError?.message },
      });

      // Wait with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.min(delay, maxDelay)));
      delay *= backoffMultiplier;
    }
  }

  // All retries failed
  throw lastError || new Error('Fetch failed after retries');
}

/**
 * Fetch with automatic JWT token refresh
 * SAFE: Only refreshes on 401 Unauthorized, preserves original request
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('eliksir_jwt_token');

  // Add auth header if token exists
  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  // Try initial request
  let response = await fetch(url, authOptions);

  // If 401, try to refresh token
  if (response.status === 401) {
    const refreshed = await refreshAuthToken();

    if (refreshed) {
      // Retry with new token
      const newToken = localStorage.getItem('eliksir_jwt_token');
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...(newToken && { Authorization: `Bearer ${newToken}` }),
        },
      });
    }
  }

  return response;
}

/**
 * Refresh JWT token
 * SAFE: Only reads from server, doesn't modify user data
 */
async function refreshAuthToken(): Promise<boolean> {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Send refresh token cookie
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    if (data.accessToken) {
      localStorage.setItem('eliksir_jwt_token', data.accessToken);
      getErrorMonitor()?.captureError({
        message: 'JWT token auto-refreshed successfully',
        type: 'manual',
        context: { action: 'token_refresh' },
      });
      return true;
    }

    return false;
  } catch (error) {
    getErrorMonitor()?.captureError({
      message: 'Failed to refresh JWT token',
      type: 'manual',
      context: { error: error instanceof Error ? error.message : String(error) },
    });
    return false;
  }
}

/**
 * Safe localStorage write with quota management
 * SAFE: Auto-clears old analytics data, preserves auth tokens
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    // QuotaExceededError - try to free space
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        // Clear old analytics data (safe - not critical)
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i);
          if (storageKey?.startsWith('analytics_') || 
              storageKey?.startsWith('temp_') ||
              storageKey?.startsWith('cache_')) {
            keysToRemove.push(storageKey);
          }
        }

        keysToRemove.forEach((k) => localStorage.removeItem(k));

        // Try again
        localStorage.setItem(key, value);

        getErrorMonitor()?.captureError({
          message: `localStorage quota exceeded - cleared ${keysToRemove.length} old items`,
          type: 'manual',
          context: { clearedKeys: keysToRemove.length },
        });

        return true;
      } catch (retryError) {
        getErrorMonitor()?.captureError({
          message: 'localStorage quota exceeded - unable to free space',
          type: 'manual',
          context: { 
            error: retryError instanceof Error ? retryError.message : String(retryError) 
          },
        });
        return false;
      }
    }

    // Other localStorage error
    getErrorMonitor()?.captureError({
      message: 'localStorage write failed',
      type: 'manual',
      context: { 
        key, 
        error: error instanceof Error ? error.message : String(error) 
      },
    });
    return false;
  }
}

/**
 * Combine retry + auth for admin API calls
 * SAFE: Handles both token refresh and network retries
 */
export async function fetchWithRetryAndAuth(
  url: string,
  options: RequestInit = {},
  retryOptions?: RetryOptions
): Promise<Response> {
  return fetchWithRetry(
    url,
    options,
    {
      ...retryOptions,
      maxRetries: retryOptions?.maxRetries ?? 2, // Lower retries for auth calls
    }
  ).then(async (response) => {
    // If 401, try auth refresh
    if (response.status === 401) {
      return fetchWithAuth(url, options);
    }
    return response;
  });
}
