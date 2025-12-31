/**
 * Global Error Monitor - Centralized error tracking for frontend
 * Captures unhandled errors, promise rejections, and manual error reports
 * Sends to backend /api/logs for persistent storage
 */

interface ErrorEntry {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  url?: string;
  line?: number;
  column?: number;
  type: 'error' | 'unhandledRejection' | 'manual' | 'fetch' | 'network';
  context?: Record<string, any>;
  httpStatus?: number;
  httpMethod?: string;
  endpoint?: string;
}

class GlobalErrorMonitor {
  private errors: ErrorEntry[] = [];
  private maxErrors = 50; // Keep last 50 errors in memory
  private backendUrl: string;
  private isInitialized = false;

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;
  }

  /**
   * Initialize error monitoring listeners
   * Call once in main.tsx before React render
   */
  init() {
    if (this.isInitialized) return;
    
    // Capture unhandled errors
    window.addEventListener('error', (event: ErrorEvent) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        type: 'error',
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const error = event.reason;
      this.captureError({
        message: error?.message || String(error),
        stack: error?.stack,
        type: 'unhandledRejection',
        context: { reason: String(error) },
      });
    });

    // Intercept all fetch calls to capture HTTP errors
    this.interceptFetch();

    this.isInitialized = true;
    console.log('[GlobalErrorMonitor] Initialized - capturing errors + fetch interceptor active');
  }

  /**
   * Intercept native fetch to capture HTTP errors (400, 500, etc.)
   */
  private interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [resource, config] = args;
      const url = typeof resource === 'string' ? resource : resource.url;
      const method = config?.method || 'GET';
      const startTime = Date.now();

      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;

        // Log API call with performance metrics
        try {
          const { getLogger } = await import('./logger');
          getLogger().logApiCall(
            method,
            url,
            response.status,
            duration,
            !response.ok ? response.statusText : undefined
          );
        } catch {
          // Logger not available yet
        }

        // Capture HTTP errors (400-599)
        if (!response.ok) {
          const clonedResponse = response.clone();
          let responseText = '';
          try {
            responseText = await clonedResponse.text();
          } catch {
            responseText = '(unable to read response)';
          }

          this.captureFetchError(method, url, response.status, responseText);
        }

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        // Log network error
        try {
          const { getLogger } = await import('./logger');
          getLogger().logApiCall(method, url, 0, duration, String(error));
        } catch {
          // Logger not available
        }

        // Network error (no response)
        this.captureFetchError(method, url, 0, String(error));
        throw error; // Re-throw to maintain normal error flow
      }
    };
  }

  /**
   * Manually capture an error with optional context
   */
  captureError(error: Partial<ErrorEntry>) {
    const entry: ErrorEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      line: error.line,
      column: error.column,
      type: error.type || 'manual',
      context: error.context,
      httpStatus: error.httpStatus,
      httpMethod: error.httpMethod,
      endpoint: error.endpoint,
    };

    // Add to memory (FIFO - remove oldest if over limit)
    this.errors.push(entry);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Send to backend async (don't block UI)
    this.sendToBackend(entry).catch((err) => {
      console.warn('[GlobalErrorMonitor] Failed to send error to backend:', err);
    });
  }

  /**
   * Capture fetch/network error with HTTP details
   */
  captureFetchError(method: string, url: string, status: number, responseText?: string) {
    this.captureError({
      message: `${method} ${url} ${status} ${responseText || ''}`,
      type: status >= 500 ? 'network' : 'fetch',
      httpStatus: status,
      httpMethod: method,
      endpoint: url,
      context: {
        responseText: responseText?.substring(0, 200), // First 200 chars
        userAction: 'API call failed',
      },
    });
  }

  /**
   * Send error to backend /api/logs
   */
  private async sendToBackend(error: ErrorEntry) {
    try {
      const response = await fetch(`${this.backendUrl}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: 'error',
          message: `[Frontend] ${error.message}`,
          context: {
            ...error.context,
            stack: error.stack,
            url: error.url,
            line: error.line,
            column: error.column,
            errorType: error.type,
            userAgent: navigator.userAgent,
          },
          timestamp: new Date(error.timestamp).toISOString(),
        }),
      });

      if (!response.ok) {
        console.warn('[GlobalErrorMonitor] Backend returned non-ok status:', response.status);
      }
    } catch (err) {
      // Silent fail - don't throw errors in error handler
      console.warn('[GlobalErrorMonitor] Network error sending to backend:', err);
    }
  }

  /**
   * Get recent errors for health dashboard
   */
  getRecentErrors(limit = 10): ErrorEntry[] {
    return this.errors.slice(-limit);
  }

  /**
   * Get error count in last N minutes
   */
  getErrorCount(minutes = 60): number {
    const threshold = Date.now() - minutes * 60 * 1000;
    return this.errors.filter((e) => e.timestamp > threshold).length;
  }

  /**
   * Get most common error types
   */
  getErrorSummary(): { type: string; count: number }[] {
    const summary = new Map<string, number>();
    
    this.errors.forEach((error) => {
      const key = error.message.split('\n')[0]; // First line only
      summary.set(key, (summary.get(key) || 0) + 1);
    });

    return Array.from(summary.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Clear old errors (older than 24h)
   */
  clearOldErrors() {
    const threshold = Date.now() - 24 * 60 * 60 * 1000;
    this.errors = this.errors.filter((e) => e.timestamp > threshold);
  }

  /**
   * Clear all errors
   */
  clearAll() {
    this.errors = [];
  }
}

// Singleton instance
let instance: GlobalErrorMonitor | null = null;

export const initErrorMonitor = (backendUrl: string) => {
  if (!instance) {
    instance = new GlobalErrorMonitor(backendUrl);
    instance.init();
  }
  return instance;
};

export const getErrorMonitor = (): GlobalErrorMonitor | null => {
  return instance;
};

// Auto-clear old errors every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    instance?.clearOldErrors();
  }, 60 * 60 * 1000);
}
