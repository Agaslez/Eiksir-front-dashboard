/**
 * useLogger Hook
 * Automatic component lifecycle logging
 */

import { logger } from '@/lib/logger';
import { useEffect, useRef } from 'react';

export const useLogger = (componentName: string) => {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    // Mount
    logger.component(componentName, 'mount', {
      renderCount: renderCount.current,
    });

    return () => {
      // Unmount
      const lifetime = Date.now() - mountTime.current;
      logger.component(componentName, 'unmount', {
        lifetime,
        renderCount: renderCount.current,
      });
    };
  }, [componentName]);

  // Track renders
  renderCount.current += 1;
  if (renderCount.current > 1) {
    logger.component(componentName, 'render', {
      renderCount: renderCount.current,
    });
  }

  return logger;
};
