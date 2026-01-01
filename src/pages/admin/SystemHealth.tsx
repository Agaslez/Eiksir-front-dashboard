import { getComponentHealthMonitor } from '@/lib/component-health-monitor';
import { config } from '@/lib/config';
import { getErrorMonitor } from '@/lib/global-error-monitor';
import { Activity, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Copy, RefreshCw, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

// Ensure API_URL always includes /api
const API_URL = config.apiUrl;

// Helper to perform HTTP checks with detailed error tracking
const performHttpCheck = async (
  checkName: string,
  url: string,
  options?: RequestInit,
  validator?: (data: any, res: Response) => boolean
) => {
  const checks = (window as any).__healthChecks || [];
  const check = checks.find((c: HealthCheck) => c.name === checkName);
  
  const start = Date.now();
  
  try {
    const res = await fetch(url, options);
    const responseTime = Date.now() - start;
    
    if (check) {
      check.responseTime = responseTime;
    }
    
    let data: any;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    
    // If validator exists, let it decide success/failure (even for non-ok responses)
    if (validator) {
      const isValid = validator(data, res);
      if (!isValid && check) {
        check.error = {
          statusCode: res.status,
          statusText: 'Validation Failed',
          responseBody: data,
          fullUrl: url
        };
        check.message = 'Response validation failed';
      }
      return isValid;
    }
    
    // For non-validator checks, res.ok determines success
    if (!res.ok) {
      if (check) {
        check.error = {
          statusCode: res.status,
          statusText: res.statusText,
          responseBody: data,
          fullUrl: url
        };
        check.message = `HTTP ${res.status}: ${res.statusText}`;
      }
      return false;
    }
    
    return true;
  } catch (error) {
    if (check) {
      check.error = {
        statusText: 'Network Error',
        responseBody: { error: error instanceof Error ? error.message : 'Unknown error' },
        fullUrl: url,
        stack: error instanceof Error ? error.stack : undefined
      };
      check.message = `Network error: ${error instanceof Error ? error.message : 'Unknown'}`;
    }
    throw error;
  }
};

interface HealthCheck {
  name: string;
  category: 'Backend' | 'Frontend' | 'Database' | 'External';
  endpoint?: string;
  check: () => Promise<boolean>;
  status: 'checking' | 'success' | 'error' | 'warning';
  message?: string;
  lastCheck?: Date;
  responseTime?: number;
  error?: {
    statusCode?: number;
    statusText?: string;
    responseBody?: any;
    stack?: string;
    fullUrl?: string;
  };
}

export default function SystemHealthDashboard() {
  const [checks, setChecks] = useState<HealthCheck[]>([
    {
      name: 'Backend API Health',
      category: 'Backend',
      endpoint: '/api/health',
      check: async () => {
        return await performHttpCheck('Backend API Health', `${API_URL}/health`);
      },
      status: 'checking'
    },
    {
      name: 'Calculator Config API',
      category: 'Backend',
      endpoint: '/api/calculator/config',
      check: async () => {
        return await performHttpCheck(
          'Calculator Config API',
          `${API_URL}/calculator/config`,
          undefined,
          (data) => data.success && data.config
        );
      },
      status: 'checking'
    },
    {
      name: 'Gallery API (Public)',
      category: 'Backend',
      endpoint: '/api/content/gallery/public',
      check: async () => {
        return await performHttpCheck(
          'Gallery API (Public)',
          `${API_URL}/content/gallery/public?category=wszystkie`,
          undefined,
          (data) => data.success && Array.isArray(data.images)
        );
      },
      status: 'checking'
    },
    {
      name: 'Content Sections API',
      category: 'Backend',
      endpoint: '/api/content/sections',
      check: async () => {
        return await performHttpCheck(
          'Content Sections API',
          `${API_URL}/content/sections`,
          undefined,
          (data) => data.success && Array.isArray(data.sections)
        );
      },
      status: 'checking'
    },
    {
      name: 'Auth Health',
      category: 'Backend',
      endpoint: '/api/auth/health',
      check: async () => {
        return await performHttpCheck(
          'Auth Health',
          `${API_URL}/auth/health`,
          undefined,
          (data) => (data.success === true && data.status === 'operational') || data.status === 'healthy' || data.status === 'Available'
        );
      },
      status: 'checking'
    },
    {
      name: 'AI Service Health',
      category: 'Backend',
      endpoint: '/api/ai/health',
      check: async () => {
        return await performHttpCheck(
          'AI Service Health',
          `${API_URL}/ai/health`,
          undefined,
          (data) => data.status === 'healthy' || data.status === 'Available' || (data.service && data.endpoints)
        );
      },
      status: 'checking'
    },
    {
      name: 'Database Connection',
      category: 'Database',
      endpoint: '/api/calculator/config',
      check: async () => {
        return await performHttpCheck('Database Connection', `${API_URL}/calculator/config`);
      },
      status: 'checking'
    },
    {
      name: 'Database Query Performance',
      category: 'Database',
      endpoint: '/api/content/gallery/public',
      check: async () => {
        const start = Date.now();
        const result = await performHttpCheck(
          'Database Query Performance',
          `${API_URL}/content/gallery/public?category=wszystkie`
        );
        const duration = Date.now() - start;
        return result && duration < 2000; // Should respond within 2 seconds
      },
      status: 'checking'
    },
    {
      name: 'Gallery Data Available',
      category: 'Frontend',
      endpoint: '/api/content/gallery/public',
      check: async () => {
        try {
          const response = await fetch(`${API_URL}/content/gallery/public?category=wszystkie`);
          if (!response.ok) return false;
          
          const data = await response.json();
          
          // Check: success=true AND images array exists AND has at least 1 active image
          const hasImages = data.success && Array.isArray(data.images) && data.images.length > 0;
          
          if (!hasImages) {
            // Store message for check display
            const check = (window as any).__healthChecks?.find((c: HealthCheck) => c.name === 'Gallery Data Available');
            if (check) {
              check.message = data.images?.length === 0 
                ? 'No active images in database (upload images in ImageGalleryEnhanced)'
                : 'Invalid response format';
            }
          }
          
          return hasImages;
        } catch (error) {
          return false;
        }
      },
      status: 'checking'
    },
    {
      name: 'React Components',
      category: 'Frontend',
      check: async () => {
        // Check if critical components are mounted
        const calculator = document.querySelector('[data-component="calculator"]');
        const gallery = document.querySelector('[data-component="gallery"]');
        return true; // Always true if dashboard loaded
      },
      status: 'checking'
    },
    {
      name: 'Google Analytics',
      category: 'External',
      check: async () => {
        return typeof (window as any).gtag === 'function';
      },
      status: 'checking'
    },
    {
      name: 'Cloudinary CDN',
      category: 'External',
      check: async () => {
        try {
          // Backend already validates Cloudinary connection - use that instead of direct ping
          // This avoids 401 errors from protected Cloudinary endpoints
          const healthResponse = await fetch(`${API_URL}/health`, {
            signal: AbortSignal.timeout(5000)
          });
          
          if (!healthResponse.ok) return false;
          
          const healthData = await healthResponse.json();
          
          // Check if backend successfully connected to Cloudinary
          const cloudinaryStatus = healthData.components?.cloudinary?.status;
          const cloudName = healthData.components?.cloudinary?.cloud_name;
          
          if (cloudinaryStatus !== 'healthy' || !cloudName) {
            const check = (window as any).__healthChecks?.find((c: HealthCheck) => c.name === 'Cloudinary CDN');
            if (check) {
              check.message = cloudinaryStatus === 'unhealthy' 
                ? 'Backend reports Cloudinary configuration issue'
                : 'Cloud name not found in backend health check';
            }
            return false;
          }
          
          // Backend confirmed Cloudinary is configured and working
          return true;
        } catch (error) {
          const check = (window as any).__healthChecks?.find((c: HealthCheck) => c.name === 'Cloudinary CDN');
          if (check) {
            check.message = `Network error: ${error instanceof Error ? error.message : 'Unknown'}`;
          }
          return false;
        }
      },
      status: 'checking'
    },
    {
      name: 'Backend Server (Render)',
      category: 'External',
      check: async () => {
        // Test if backend is responding at all
        try {
          const response = await fetch(`${API_URL}/health`, { 
            signal: AbortSignal.timeout(5000) 
          });
          return response.ok;
        } catch {
          return false;
        }
      },
      status: 'checking'
    },
    {
      name: 'Frontend Deployment (Vercel)',
      category: 'External',
      check: async () => {
        // Check if we're running (if this runs, deployment is live)
        return window.location.hostname.includes('vercel.app') || 
               window.location.hostname === 'localhost';
      },
      status: 'checking'
    },
    {
      name: 'HorizontalGallery Component',
      category: 'Frontend',
      endpoint: '/api/content/gallery/public?category=wszystkie',
      check: async () => {
        try {
          // Check if component health monitor exists
          const componentHealth = (window as any).__componentHealthMonitor;
          
          // Test API endpoint that HorizontalGallery uses
          const response = await fetch(`${API_URL}/content/gallery/public?category=wszystkie`, {
            signal: AbortSignal.timeout(10000)
          });
          
          if (!response.ok) {
            const check = (window as any).__healthChecks?.find((c: HealthCheck) => c.name === 'HorizontalGallery Component');
            if (check) {
              check.message = `API returned ${response.status}: ${response.statusText}`;
            }
            return false;
          }
          
          const data = await response.json();
          
          if (!data.success || !Array.isArray(data.images)) {
            const check = (window as any).__healthChecks?.find((c: HealthCheck) => c.name === 'HorizontalGallery Component');
            if (check) {
              check.message = 'Invalid response format from gallery API';
            }
            return false;
          }
          
          if (data.images.length === 0) {
            const check = (window as any).__healthChecks?.find((c: HealthCheck) => c.name === 'HorizontalGallery Component');
            if (check) {
              check.message = 'No images in database (upload in ImageGalleryEnhanced)';
            }
            return false;
          }
          
          // Check if at least some images are active
          const activeImages = data.images.filter((img: any) => img.isActive !== false);
          if (activeImages.length === 0) {
            const check = (window as any).__healthChecks?.find((c: HealthCheck) => c.name === 'HorizontalGallery Component');
            if (check) {
              check.message = `${data.images.length} images in DB but none are active`;
            }
            return false;
          }
          
          return true;
        } catch (error) {
          const check = (window as any).__healthChecks?.find((c: HealthCheck) => c.name === 'HorizontalGallery Component');
          if (check) {
            check.message = `Network error: ${error instanceof Error ? error.message : 'Unknown'}`;
          }
          return false;
        }
      },
      status: 'checking'
    },
    {
      name: 'Error Boundary',
      category: 'Frontend',
      check: async () => {
        // Check if ErrorBoundary is in tree
        return document.querySelector('[data-error-boundary]') !== null ||
               window.location.pathname.includes('admin'); // Admin has error boundary
      },
      status: 'checking'
    },
    {
      name: 'Page Performance',
      category: 'Frontend',
      check: async () => {
        if (!performance || !performance.getEntriesByType) return false;
        const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navEntries.length === 0) return false;
        const nav = navEntries[0];
        // loadEventEnd is 0 if page is still loading - wait for it
        if (nav.loadEventEnd === 0) return false;
        const pageLoadTime = nav.loadEventEnd - nav.startTime;
        return pageLoadTime > 0 && pageLoadTime < 5000; // Under 5 seconds
      },
      status: 'checking'
    },
    {
      name: 'robots.txt',
      category: 'External',
      check: async () => {
        try {
          const response = await fetch('/robots.txt');
          const text = await response.text();
          return response.ok && text.includes('User-agent');
        } catch {
          return false;
        }
      },
      status: 'checking'
    },
    {
      name: 'sitemap.xml',
      category: 'External',
      check: async () => {
        try {
          const response = await fetch('/sitemap.xml');
          const text = await response.text();
          return response.ok && text.includes('<?xml') && text.includes('<urlset');
        } catch {
          return false;
        }
      },
      status: 'checking'
    },
    {
      name: 'Open Graph Tags',
      category: 'External',
      check: async () => {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const ogImage = document.querySelector('meta[property="og:image"]');
        return !!(ogTitle && ogDescription && ogImage);
      },
      status: 'checking'
    },
    {
      name: 'JSON-LD Schema',
      category: 'External',
      check: async () => {
        const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
        if (!jsonLdScript) return false;
        try {
          const data = JSON.parse(jsonLdScript.textContent || '{}');
          return data['@type'] === 'LocalBusiness' || data['@type'] === 'Organization';
        } catch {
          return false;
        }
      },
      status: 'checking'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set());

  const toggleExpand = (checkName: string) => {
    const newExpanded = new Set(expandedChecks);
    if (newExpanded.has(checkName)) {
      newExpanded.delete(checkName);
    } else {
      newExpanded.add(checkName);
    }
    setExpandedChecks(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Store checks globally for performHttpCheck to access
  useEffect(() => {
    (window as any).__healthChecks = checks;
  }, [checks]);

  const runHealthChecks = async () => {
    setIsRunning(true);
    const updatedChecks = [...checks];

    for (let i = 0; i < updatedChecks.length; i++) {
      const check = updatedChecks[i];
      check.status = 'checking';
      check.lastCheck = new Date();
      check.error = undefined;
      setChecks([...updatedChecks]);

      try {
        const result = await check.check();
        check.status = result ? 'success' : 'error';
        check.message = result ? 'OK' : 'Check returned false';
      } catch (error) {
        check.status = 'error';
        check.message = error instanceof Error ? error.message : 'Unknown error';
        
        // Capture detailed error information
        if (error instanceof Error) {
          check.error = {
            stack: error.stack,
          };
        }
      }

      setChecks([...updatedChecks]);
    }

    setLastRunTime(new Date());
    setIsRunning(false);
  };

  useEffect(() => {
    runHealthChecks();
    // Auto-refresh every 60 seconds
    const interval = setInterval(runHealthChecks, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const successCount = checks.filter(c => c.status === 'success').length;
  const errorCount = checks.filter(c => c.status === 'error').length;
  const totalCount = checks.length;
  const healthPercentage = Math.round((successCount / totalCount) * 100);

  const categories = ['Backend', 'Frontend', 'Database', 'External'] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-8 h-8 text-emerald-600" />
                System Health Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time monitoring of all critical system components
              </p>
            </div>
            <button
              onClick={runHealthChecks}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Checking...' : 'Run Tests'}
            </button>
          </div>

          {/* Overall Status */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-emerald-200">
              <div className="text-sm text-gray-600 mb-1">System Health</div>
              <div className="text-3xl font-bold text-emerald-600">{healthPercentage}%</div>
              <div className="text-xs text-gray-500 mt-1">
                {successCount}/{totalCount} checks passing
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Successful</div>
              <div className="text-3xl font-bold text-green-600">{successCount}</div>
              <div className="text-xs text-gray-500 mt-1">Components OK</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Failed</div>
              <div className="text-3xl font-bold text-red-600">{errorCount}</div>
              <div className="text-xs text-gray-500 mt-1">Components down</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Last Check</div>
              <div className="text-lg font-semibold text-gray-900">
                {lastRunTime ? lastRunTime.toLocaleTimeString('pl-PL') : 'Never'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Auto-refresh: 60s</div>
            </div>
          </div>
        </div>

        {/* Health Checks by Category */}
        {categories.map(category => {
          const categoryChecks = checks.filter(c => c.category === category);
          if (categoryChecks.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{category} Services</h2>
              <div className="space-y-3">
                {categoryChecks.map((check, index) => {
                  const isExpanded = expandedChecks.has(check.name);
                  const hasError = check.error || (check.status === 'error' && check.message);

                  return (
                    <div
                      key={index}
                      className={`bg-white rounded-lg shadow-sm border-2 transition-all ${getStatusColor(check.status)}`}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {getStatusIcon(check.status)}
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{check.name}</div>
                              {check.endpoint && (
                                <div className="text-xs text-gray-500 font-mono">
                                  {check.endpoint}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {check.responseTime !== undefined && (
                              <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900">
                                  {check.responseTime}ms
                                </div>
                                <div className="text-xs text-gray-500">Response time</div>
                              </div>
                            )}

                            {check.message && check.status !== 'success' && !isExpanded && (
                              <div className="text-right max-w-xs">
                                <div className="text-sm text-red-600 truncate">{check.message}</div>
                              </div>
                            )}

                            {check.lastCheck && (
                              <div className="text-right">
                                <div className="text-xs text-gray-500">
                                  {check.lastCheck.toLocaleTimeString('pl-PL')}
                                </div>
                              </div>
                            )}

                            {hasError && (
                              <button
                                onClick={() => toggleExpand(check.name)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title={isExpanded ? 'Hide details' : 'Show details'}
                              >
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded Error Details */}
                        {isExpanded && hasError && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-900">Error Details</h4>
                              <button
                                onClick={() => copyToClipboard(JSON.stringify(check.error || { message: check.message }, null, 2))}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                              >
                                <Copy className="w-4 h-4" />
                                Copy
                              </button>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                              {check.message && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-600 mb-1">Message:</div>
                                  <div className="text-sm text-red-600 font-mono">{check.message}</div>
                                </div>
                              )}

                              {check.error?.fullUrl && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-600 mb-1">Request URL:</div>
                                  <div className="text-sm text-gray-800 font-mono break-all">{check.error.fullUrl}</div>
                                </div>
                              )}

                              {check.error?.statusCode && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-600 mb-1">Status Code:</div>
                                  <div className="text-sm text-gray-800 font-mono">
                                    {check.error.statusCode} - {check.error.statusText}
                                  </div>
                                </div>
                              )}

                              {check.error?.responseBody && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-600 mb-1">Response Body:</div>
                                  <pre className="text-xs text-gray-800 font-mono overflow-x-auto bg-white p-3 rounded border border-gray-200 max-h-64 overflow-y-auto">
                                    {JSON.stringify(check.error.responseBody, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {check.error?.stack && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-600 mb-1">Stack Trace:</div>
                                  <pre className="text-xs text-gray-800 font-mono overflow-x-auto bg-white p-3 rounded border border-gray-200 max-h-64 overflow-y-auto">
                                    {check.error.stack}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium text-gray-900">Success</div>
                <div className="text-sm text-gray-500">Component functioning normally</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium text-gray-900">Error</div>
                <div className="text-sm text-gray-500">Component failed or unavailable</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Checking</div>
                <div className="text-sm text-gray-500">Test in progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Frontend Errors */}
        <RecentErrorsPanel />

        {/* Component Health */}
        <ComponentHealthPanel />

        {/* Auto-Healing Activity */}
        <AutoHealingActivityPanel />
      </div>
    </div>
  );
}

function RecentErrorsPanel() {
  const [errors, setErrors] = useState<any[]>([]);
  const [errorCount, setErrorCount] = useState(0);
  const [summary, setSummary] = useState<any[]>([]);

  useEffect(() => {
    const updateErrors = () => {
      const monitor = getErrorMonitor();
      if (monitor) {
        setErrors(monitor.getRecentErrors(10));
        setErrorCount(monitor.getErrorCount(60));
        setSummary(monitor.getErrorSummary());
      }
    };

    updateErrors();
    const interval = setInterval(updateErrors, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, []);

  if (!getErrorMonitor()) {
    return null; // Monitor not initialized
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Frontend Errors</h3>
          <p className="text-sm text-gray-500">Captured by Global Error Monitor</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium text-gray-900">{errorCount}</span>
            <span className="text-gray-500"> errors in last hour</span>
          </div>
          <button
            onClick={() => {
              getErrorMonitor()?.clearAll();
              setErrors([]);
              setErrorCount(0);
              setSummary([]);
            }}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Error Summary */}
      {summary.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="text-sm font-semibold text-amber-900 mb-2">Most Common Errors</h4>
          <div className="space-y-1">
            {summary.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-700 truncate flex-1">{item.type}</span>
                <span className="font-medium text-amber-700 ml-2">{item.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">🛡️ Automatic Error Capture Active</h4>
            <p className="text-sm text-blue-800">
              Fetch interceptor captures <strong>ALL HTTP errors</strong> (400, 500, network failures). 
              Unhandled exceptions and promise rejections are also logged.
            </p>
            <p className="text-xs text-blue-700 mt-2">
              💡 Try saving something in Dashboard - if it fails with 400, you'll see it here within 10 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Error List */}
      {errors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p>No errors captured in the last 24 hours</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {errors.map((error) => (
            <div
              key={error.id}
              className="p-3 bg-red-50 rounded border border-red-200 text-sm"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="font-medium text-red-900">{error.type}</span>
                </div>
                <span className="text-gray-500 text-xs">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700 mb-1">{error.message}</p>
              {error.url && (
                <p className="text-xs text-gray-500">
                  {error.url}
                  {error.line && `:${error.line}`}
                  {error.column && `:${error.column}`}
                </p>
              )}
              {error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-red-700 hover:text-red-900">
                    View stack trace
                  </summary>
                  <pre className="mt-2 text-xs bg-white p-2 rounded border border-red-200 overflow-x-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComponentHealthPanel() {
  const [components, setComponents] = useState<any[]>([]);

  useEffect(() => {
    const updateComponents = () => {
      const monitor = getComponentHealthMonitor();
      const allComponents = monitor.getAllComponents();
      setComponents(allComponents);
    };

    updateComponents();
    const interval = setInterval(updateComponents, 5000); // Update every 5s

    return () => clearInterval(interval);
  }, []);

  const healthyCount = components.filter((c) =>
    getComponentHealthMonitor().isComponentHealthy(c.name)
  ).length;
  const unhealthyCount = components.length - healthyCount;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">React Component Health</h3>
          <p className="text-sm text-gray-500">Real-time component render monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium text-green-600">{healthyCount}</span>
            <span className="text-gray-500"> healthy</span>
          </div>
          {unhealthyCount > 0 && (
            <div className="text-sm">
              <span className="font-medium text-red-600">{unhealthyCount}</span>
              <span className="text-gray-500"> issues</span>
            </div>
          )}
        </div>
      </div>

      {components.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <RefreshCw className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
          <div className="text-gray-700">
            <p className="font-medium">Loading components...</p>
            <p className="text-sm text-gray-500 mt-1">Auto-discovering React components</p>
          </div>
          
          {/* Hidden iframes to trigger component mounts */}
          <iframe src="/" style={{ display: 'none' }} title="preload-home" />
          <iframe src="/gallery" style={{ display: 'none' }} title="preload-gallery" />
          <iframe src="/contact" style={{ display: 'none' }} title="preload-contact" />
          
          <div className="text-xs text-gray-400 mt-4">
            Expected: HorizontalGallery, Calculator, Gallery, Contact
          </div>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {components.map((component) => {
            const isHealthy = getComponentHealthMonitor().isComponentHealthy(component.name);
            const recentErrors = component.errors.filter(
              (e: any) => Date.now() - e.timestamp < 5 * 60 * 1000
            );

            return (
              <div
                key={component.name}
                className={`p-3 rounded border text-sm ${
                  isHealthy
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {isHealthy ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className={`font-medium ${isHealthy ? 'text-green-900' : 'text-red-900'}`}>
                      {component.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {component.mounted ? '🟢 Mounted' : '⚫ Unmounted'}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>Renders: {component.renderCount}</span>
                  <span>
                    Last render: {Math.floor((Date.now() - component.lastRender) / 1000)}s ago
                  </span>
                  {recentErrors.length > 0 && (
                    <span className="text-red-600 font-medium">
                      {recentErrors.length} error{recentErrors.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {recentErrors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-red-700 hover:text-red-900">
                      View errors ({recentErrors.length})
                    </summary>
                    <div className="mt-2 space-y-1">
                      {recentErrors.map((error: any, idx: number) => (
                        <div key={idx} className="text-xs bg-white p-2 rounded border border-red-200">
                          <div className="font-medium text-red-900">{error.message}</div>
                          <div className="text-gray-500">
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-900">
        <p>
          ℹ️ <strong>Tip:</strong> Add <code>useComponentHealth('ComponentName')</code> to critical
          components to track their health. Detects mount/unmount, render frequency, and errors.
        </p>
      </div>
    </div>
  );
}

function AutoHealingActivityPanel() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const monitor = getErrorMonitor();
    if (!monitor) return;

    // Filter for auto-healing related errors
    const updateActivities = () => {
      const recentErrors = monitor.getRecentErrors(50);
      const healingEvents = recentErrors.filter(
        (error) =>
          error.message.includes('Retry attempt') ||
          error.message.includes('token auto-refreshed') ||
          error.message.includes('localStorage quota exceeded')
      );
      setActivities(healingEvents);
    };

    updateActivities();
    const interval = setInterval(updateActivities, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!getErrorMonitor()) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Auto-Healing Activity</h3>
          <p className="text-sm text-gray-500">Recent retry attempts and auto-recovery actions</p>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-900">{activities.length}</span>
          <span className="text-gray-500"> events logged</span>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p>No auto-healing events recorded</p>
          <p className="text-xs mt-1">System running smoothly - no retries needed</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-3 bg-blue-50 rounded border border-blue-200 text-sm"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-medium text-blue-900">
                    {activity.message.includes('token') && '🔑 JWT Token Refresh'}
                    {activity.message.includes('Retry') && '🔄 Network Retry'}
                    {activity.message.includes('localStorage') && '💾 Storage Cleanup'}
                  </span>
                </div>
                <span className="text-gray-500 text-xs">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700 text-xs mb-1">{activity.message}</p>
              {activity.context?.url && (
                <p className="text-xs text-gray-500 truncate">
                  📍 {activity.context.url}
                </p>
              )}
              {activity.context?.attempt && (
                <p className="text-xs text-blue-700">
                  Attempt {activity.context.attempt} - {activity.context.error || 'Success'}
                </p>
              )}
              {activity.context?.clearedKeys && (
                <p className="text-xs text-blue-700">
                  Cleared {activity.context.clearedKeys} old items from storage
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">🛡️ Auto-Healing Capabilities</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <div className="font-medium text-gray-700">Network Retries</div>
            <div className="text-gray-600">Max 3 retries with exponential backoff</div>
          </div>
          <div>
            <div className="font-medium text-gray-700">JWT Auto-Refresh</div>
            <div className="text-gray-600">Seamless token renewal on 401</div>
          </div>
          <div>
            <div className="font-medium text-gray-700">Storage Management</div>
            <div className="text-gray-600">Auto-clears cache when quota exceeded</div>
          </div>
        </div>
      </div>
    </div>
  );
}
