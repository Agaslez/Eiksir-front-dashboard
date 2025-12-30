// System monitorowania błędów i logów

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

class ErrorMonitor {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Maksymalna liczba logów w pamięci
  private isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    // Inicjalizacja
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers();
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Przechwytywanie nieprzechwyconych błędów
    window.addEventListener('error', (event) => {
      this.log('error', 'Unhandled error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString(),
      });
    });

    // Przechwytywanie odrzuconych promise'ów
    window.addEventListener('unhandledrejection', (event) => {
      this.log('error', 'Unhandled promise rejection', {
        reason: event.reason?.toString(),
      });
    });

    // Monitorowanie wydajności
    if ('performance' in window) {
      this.setupPerformanceMonitoring();
    }
  }

  private setupPerformanceMonitoring(): void {
    // Monitorowanie czasu ładowania
    window.addEventListener('load', () => {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;

      this.log('info', 'Page load performance', {
        loadTime,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        redirectCount: performance.navigation.redirectCount,
        type: performance.navigation.type,
      });
    });
  }

  public log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    userId?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      userId,
      sessionId: this.getSessionId(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    // Dodaj do pamięci
    this.logs.push(entry);

    // Ogranicz rozmiar
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // W produkcji wysyłaj do backendu/Sentry
    if (this.isProduction && level !== 'debug') {
      this.sendToBackend(entry);
    }

    // Log do konsoli w development
    if (!this.isProduction) {
      const consoleMethod = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
        critical: console.error,
      }[level];

      consoleMethod(`[${level.toUpperCase()}] ${message}`, context || '');
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';

    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private async sendToBackend(entry: LogEntry): Promise<void> {
    // Disable remote logging for now - only use localStorage
    // TODO: Implement proper backend logging endpoint at ${BACKEND_API}/api/logs
    this.saveToLocalStorage(entry);
  }

  private saveToLocalStorage(entry: LogEntry): void {
    try {
      let storedLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      storedLogs.push(entry);

      // Ogranicz do 50 wpisów
      if (storedLogs.length > 50) {
        storedLogs = storedLogs.slice(-50);
      }

      localStorage.setItem('error_logs', JSON.stringify(storedLogs));
    } catch (error) {
      console.error('Failed to save log to localStorage:', error);
    }
  }

  public getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public trackEvent(eventName: string, properties?: Record<string, any>): void {
    this.log('info', `Event: ${eventName}`, properties);

    // Google Analytics (jeśli skonfigurowany)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
  }

  public trackError(error: Error, context?: Record<string, any>): void {
    this.log('error', error.message, {
      ...context,
      stack: error.stack,
      name: error.name,
    });

    // Sentry integration (przykład)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: context });
    }
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitor();

// Helper functions
export function logDebug(message: string, context?: Record<string, any>) {
  errorMonitor.log('debug', message, context);
}

export function logInfo(message: string, context?: Record<string, any>) {
  errorMonitor.log('info', message, context);
}

export function logWarning(message: string, context?: Record<string, any>) {
  errorMonitor.log('warn', message, context);
}

export function logError(message: string, context?: Record<string, any>) {
  errorMonitor.log('error', message, context);
}

export function logCritical(message: string, context?: Record<string, any>) {
  errorMonitor.log('critical', message, context);
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  errorMonitor.trackEvent(eventName, properties);
}

export function trackError(error: Error, context?: Record<string, any>) {
  errorMonitor.trackError(error, context);
}

// React Error Boundary
import { Component, ErrorInfo, ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Send to old errorMonitor (localStorage)
    trackError(error, {
      componentStack: errorInfo.componentStack,
    });
    
    // ALSO send to global-error-monitor (backend)
    import('./global-error-monitor').then(({ getErrorMonitor }) => {
      const monitor = getErrorMonitor();
      monitor?.captureError({
        type: 'error',
        message: error.message,
        stack: error.stack,
        context: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        },
      });
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800">
              Coś poszło nie tak
            </h3>
            <p className="text-red-600 mt-2">
              Przepraszamy, wystąpił błąd. Zespół został powiadomiony.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Odśwież stronę
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
