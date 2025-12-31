/**
 * Professional Logger - Production-grade logging system
 * Inspired by Sentry, Datadog, Prometheus
 * 
 * Features:
 * - Structured logging with context
 * - Log levels (DEBUG, INFO, WARN, ERROR, FATAL)
 * - Correlation IDs for request tracking
 * - Performance metrics
 * - Breadcrumbs (user action trail)
 * - Automatic error reporting to backend
 * - Console output in development
 * - Silent in production (only backend)
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogContext {
  [key: string]: any;
  // Common fields
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  component?: string;
  action?: string;
  duration?: number;
  httpStatus?: number;
  httpMethod?: string;
  endpoint?: string;
  errorCode?: string;
  stackTrace?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  context: LogContext;
  breadcrumbs: Breadcrumb[];
}

export interface Breadcrumb {
  timestamp: number;
  category: 'navigation' | 'user-action' | 'api-call' | 'state-change' | 'render' | 'error';
  message: string;
  data?: any;
}

class Logger {
  private minLevel: LogLevel = LogLevel.INFO;
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private backendUrl: string;
  private sessionId: string;
  private correlationId: string;

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;
    this.sessionId = this.generateId();
    this.correlationId = this.generateId();

    // Set min level based on environment
    if (import.meta.env.DEV) {
      this.minLevel = LogLevel.DEBUG;
    } else {
      this.minLevel = LogLevel.INFO;
    }

    console.log(`[Logger] Initialized - session: ${this.sessionId}, min level: ${LogLevel[this.minLevel]}`);
  }

  /**
   * Generate unique ID for correlation/session tracking
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add breadcrumb (user action trail)
   */
  addBreadcrumb(
    category: Breadcrumb['category'],
    message: string,
    data?: any
  ) {
    const breadcrumb: Breadcrumb = {
      timestamp: Date.now(),
      category,
      message,
      data,
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Get new correlation ID for new request chain
   */
  newCorrelationId(): string {
    this.correlationId = this.generateId();
    return this.correlationId;
  }

  /**
   * DEBUG level log
   */
  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * INFO level log
   */
  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * WARN level log
   */
  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * ERROR level log
   */
  error(message: string, context?: LogContext) {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * FATAL level log (critical errors)
   */
  fatal(message: string, context?: LogContext) {
    this.log(LogLevel.FATAL, message, context);
  }

  /**
   * Log API call (with performance tracking)
   */
  logApiCall(
    method: string,
    endpoint: string,
    status: number,
    duration: number,
    error?: string
  ) {
    const level = status >= 500 ? LogLevel.ERROR : status >= 400 ? LogLevel.WARN : LogLevel.INFO;

    this.log(level, `API ${method} ${endpoint} ${status}`, {
      httpMethod: method,
      endpoint,
      httpStatus: status,
      duration,
      errorCode: error,
      correlationId: this.correlationId,
    });

    // Add breadcrumb
    this.addBreadcrumb('api-call', `${method} ${endpoint} ${status}`, {
      method,
      endpoint,
      status,
      duration,
    });
  }

  /**
   * Log component lifecycle
   */
  logComponentLifecycle(
    component: string,
    event: 'mount' | 'unmount' | 'render' | 'error',
    context?: LogContext
  ) {
    const level = event === 'error' ? LogLevel.ERROR : LogLevel.DEBUG;

    this.log(level, `Component ${component} ${event}`, {
      component,
      action: event,
      ...context,
    });

    this.addBreadcrumb('render', `${component} ${event}`, context);
  }

  /**
   * Log user action
   */
  logUserAction(action: string, context?: LogContext) {
    this.info(`User: ${action}`, {
      action,
      ...context,
    });

    this.addBreadcrumb('user-action', action, context);
  }

  /**
   * Log navigation
   */
  logNavigation(from: string, to: string) {
    this.info(`Navigation: ${from} → ${to}`, {
      action: 'navigation',
      from,
      to,
    });

    this.addBreadcrumb('navigation', `${from} → ${to}`, { from, to });
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context: LogContext = {}) {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      level,
      message,
      context: {
        ...context,
        sessionId: this.sessionId,
        correlationId: this.correlationId,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
      breadcrumbs: [...this.breadcrumbs], // Copy current breadcrumbs
    };

    // Console output in development
    if (import.meta.env.DEV) {
      this.consoleLog(entry);
    }

    // Send to backend (async, don't block)
    if (level >= LogLevel.WARN) {
      this.sendToBackend(entry).catch((err) => {
        console.warn('[Logger] Failed to send to backend:', err);
      });
    }
  }

  /**
   * Console output with colors
   */
  private consoleLog(entry: LogEntry) {
    const colors = {
      [LogLevel.DEBUG]: 'color: gray',
      [LogLevel.INFO]: 'color: blue',
      [LogLevel.WARN]: 'color: orange',
      [LogLevel.ERROR]: 'color: red',
      [LogLevel.FATAL]: 'color: white; background: red; font-weight: bold',
    };

    const timestamp = new Date(entry.timestamp).toLocaleTimeString('pl-PL');
    const levelName = LogLevel[entry.level];

    console.log(
      `%c[${timestamp}] ${levelName}`,
      colors[entry.level],
      entry.message,
      entry.context
    );

    // Show breadcrumbs for errors
    if (entry.level >= LogLevel.ERROR && entry.breadcrumbs.length > 0) {
      console.groupCollapsed('🍞 Breadcrumbs (last 10)');
      entry.breadcrumbs.slice(-10).forEach((b) => {
        const time = new Date(b.timestamp).toLocaleTimeString('pl-PL');
        console.log(`[${time}] ${b.category}: ${b.message}`, b.data || '');
      });
      console.groupEnd();
    }
  }

  /**
   * Send log to backend /api/logs
   */
  private async sendToBackend(entry: LogEntry) {
    try {
      const response = await fetch(`${this.backendUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: LogLevel[entry.level].toLowerCase(),
          message: `[Frontend] ${entry.message}`,
          context: {
            ...entry.context,
            breadcrumbs: entry.breadcrumbs.slice(-10), // Last 10 breadcrumbs
          },
          timestamp: new Date(entry.timestamp).toISOString(),
        }),
      });

      if (!response.ok) {
        console.warn('[Logger] Backend returned non-ok:', response.status);
      }
    } catch (err) {
      // Silent fail - don't throw errors in logger
      console.warn('[Logger] Network error sending to backend:', err);
    }
  }

  /**
   * Get breadcrumbs for debugging
   */
  getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  /**
   * Clear breadcrumbs
   */
  clearBreadcrumbs() {
    this.breadcrumbs = [];
  }
}

// Singleton instance
let instance: Logger | null = null;

export const initLogger = (backendUrl: string): Logger => {
  if (!instance) {
    instance = new Logger(backendUrl);
  }
  return instance;
};

export const getLogger = (): Logger => {
  if (!instance) {
    throw new Error('[Logger] Not initialized - call initLogger first');
  }
  return instance;
};

// Convenience exports
export const logger = {
  debug: (msg: string, ctx?: LogContext) => getLogger().debug(msg, ctx),
  info: (msg: string, ctx?: LogContext) => getLogger().info(msg, ctx),
  warn: (msg: string, ctx?: LogContext) => getLogger().warn(msg, ctx),
  error: (msg: string, ctx?: LogContext) => getLogger().error(msg, ctx),
  fatal: (msg: string, ctx?: LogContext) => getLogger().fatal(msg, ctx),
  apiCall: (method: string, endpoint: string, status: number, duration: number, error?: string) =>
    getLogger().logApiCall(method, endpoint, status, duration, error),
  component: (component: string, event: 'mount' | 'unmount' | 'render' | 'error', ctx?: LogContext) =>
    getLogger().logComponentLifecycle(component, event, ctx),
  userAction: (action: string, ctx?: LogContext) => getLogger().logUserAction(action, ctx),
  navigation: (from: string, to: string) => getLogger().logNavigation(from, to),
  breadcrumb: (category: Breadcrumb['category'], message: string, data?: any) =>
    getLogger().addBreadcrumb(category, message, data),
};
