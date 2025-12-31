/**
 * Data Refresh Hook - Auto-refresh content from API
 * Solves: Admin changes → Front doesn't see updates until manual reload
 * Solution: Polling every 30s OR manual refresh button
 */

import { useCallback, useEffect, useState } from 'react';

interface UseDataRefreshOptions {
  interval?: number; // Polling interval in ms (default: 30000 = 30s)
  enabled?: boolean; // Enable/disable polling (default: true)
  manual?: boolean; // Manual refresh only (no polling)
}

/**
 * Hook for auto-refreshing data with polling
 * 
 * @example
 * const { data, loading, error, refresh } = useDataRefresh(
 *   async () => fetch('/api/content/sections').then(r => r.json()),
 *   { interval: 30000 }
 * );
 */
export function useDataRefresh<T>(
  fetcher: () => Promise<T>,
  options: UseDataRefreshOptions = {}
) {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    manual = false,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
      setLastRefresh(new Date());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Data refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling (if not manual)
  useEffect(() => {
    if (manual || !enabled || interval <= 0) return;

    const intervalId = setInterval(() => {
      fetchData();
    }, interval);

    return () => clearInterval(intervalId);
  }, [fetchData, interval, enabled, manual]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastRefresh,
  };
}

/**
 * Event-based refresh listener
 * Listens for custom 'data:refresh' events
 * 
 * @example
 * // Admin component after save:
 * window.dispatchEvent(new CustomEvent('data:refresh', { detail: { type: 'content' } }));
 * 
 * // Frontend component:
 * useRefreshListener('content', () => fetchContent());
 */
export function useRefreshListener(
  type: string,
  callback: () => void
) {
  useEffect(() => {
    const handleRefresh = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.type === type || customEvent.detail?.type === 'all') {
        console.log(`🔄 Refresh triggered for: ${type}`);
        callback();
      }
    };

    window.addEventListener('data:refresh', handleRefresh);

    return () => {
      window.removeEventListener('data:refresh', handleRefresh);
    };
  }, [type, callback]);
}

/**
 * Trigger refresh event (use in admin after save)
 * 
 * @example
 * import { triggerRefresh } from '@/hooks/useDataRefresh';
 * 
 * const handleSave = async () => {
 *   await saveContent();
 *   triggerRefresh('content'); // Notify all listeners
 * };
 */
export function triggerRefresh(type: 'content' | 'gallery' | 'calculator' | 'all') {
  const event = new CustomEvent('data:refresh', {
    detail: { type, timestamp: new Date().toISOString() },
  });
  window.dispatchEvent(event);
  console.log(`🔔 Refresh event dispatched: ${type}`);
}
