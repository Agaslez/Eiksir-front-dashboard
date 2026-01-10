import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * usePageTracking Hook
 * 
 * Automatically tracks page views and time spent on each page.
 * Sends data to /api/seo/track endpoint.
 * 
 * Features:
 * - Tracks initial page view
 * - Measures time on page (accurate to seconds)
 * - Uses sendBeacon for reliable tracking on page unload
 * - Session-based tracking (sessionStorage)
 * - Handles tab switching (visibilitychange)
 */
export function usePageTracking() {
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    // Reset timer on path change
    startTimeRef.current = Date.now();
    hasTrackedRef.current = false;

    // Generate or retrieve session ID
    const getSessionId = () => {
      const key = '_eliksir_session';
      let sessionId = sessionStorage.getItem(key);
      
      if (!sessionId) {
        sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem(key, sessionId);
      }
      
      return sessionId;
    };

    // Track initial page view
    const trackPageView = async () => {
      try {
        const payload = {
          sessionId: getSessionId(),
          path: location.pathname,
          referrer: document.referrer || 'direct',
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timeOnPage: 0, // Initial view
        };

        await fetch(`${API_URL}/api/seo/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        hasTrackedRef.current = true;
      } catch (error) {
        // Silently fail - don't break user experience
        console.debug('Page tracking failed:', error);
      }
    };

    trackPageView();

    // Track time on page when user leaves
    const handleBeforeUnload = () => {
      if (!hasTrackedRef.current) return;

      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      if (timeOnPage < 1) return; // Ignore very short visits (bots)

      const payload = {
        sessionId: getSessionId(),
        path: location.pathname,
        referrer: document.referrer || 'direct',
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timeOnPage,
      };

      // Use sendBeacon for reliable tracking on page unload
      // sendBeacon works even when user closes tab/navigates away
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(`${API_URL}/api/seo/track`, blob);
    };

    // Track when user switches tabs (hidden)
    const handleVisibilityChange = () => {
      if (document.hidden && hasTrackedRef.current) {
        const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
        
        if (timeOnPage >= 1) {
          const payload = {
            sessionId: getSessionId(),
            path: location.pathname,
            referrer: document.referrer || 'direct',
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timeOnPage,
          };

          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          navigator.sendBeacon(`${API_URL}/api/seo/track`, blob);
        }
      }
    };

    // Event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      // Send final time on page when component unmounts (route change)
      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      if (hasTrackedRef.current && timeOnPage >= 1) {
        const payload = {
          sessionId: getSessionId(),
          path: location.pathname,
          referrer: document.referrer || 'direct',
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timeOnPage,
        };

        // Try sendBeacon first (most reliable)
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        const sent = navigator.sendBeacon(`${API_URL}/api/seo/track`, blob);
        
        // Fallback to fetch if sendBeacon fails (shouldn't happen)
        if (!sent) {
          fetch(`${API_URL}/api/seo/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true, // Keep request alive even after page unload
          }).catch(() => {
            // Silently fail
          });
        }
      }

      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]);
}
