/**
 * Component Health Monitor
 * Tracks React component render health and errors
 */

import { useEffect } from 'react';

interface ComponentHealth {
  name: string;
  mounted: boolean;
  lastRender: number;
  renderCount: number;
  errors: Array<{
    message: string;
    timestamp: number;
    stack?: string;
  }>;
}

class ComponentHealthMonitor {
  private components = new Map<string, ComponentHealth>();

  /**
   * Register component mount
   */
  registerMount(componentName: string) {
    const existing = this.components.get(componentName);
    this.components.set(componentName, {
      name: componentName,
      mounted: true,
      lastRender: Date.now(),
      renderCount: existing ? existing.renderCount + 1 : 1,
      errors: existing?.errors || [],
    });
  }

  /**
   * Register component unmount
   */
  registerUnmount(componentName: string) {
    const component = this.components.get(componentName);
    if (component) {
      component.mounted = false;
    }
  }

  /**
   * Register component error
   */
  registerError(componentName: string, error: Error) {
    const component = this.components.get(componentName);
    if (component) {
      component.errors.push({
        message: error.message,
        timestamp: Date.now(),
        stack: error.stack,
      });
      // Keep only last 10 errors per component
      if (component.errors.length > 10) {
        component.errors.shift();
      }
    }
  }

  /**
   * Update last render timestamp
   */
  updateRender(componentName: string) {
    const component = this.components.get(componentName);
    if (component) {
      component.lastRender = Date.now();
      component.renderCount++;
    }
  }

  /**
   * Get health status for a component
   */
  getComponentHealth(componentName: string): ComponentHealth | undefined {
    return this.components.get(componentName);
  }

  /**
   * Get all components
   */
  getAllComponents(): ComponentHealth[] {
    return Array.from(this.components.values());
  }

  /**
   * Get components with errors
   */
  getComponentsWithErrors(): ComponentHealth[] {
    return Array.from(this.components.values()).filter(
      (c) => c.errors.length > 0
    );
  }

  /**
   * Check if component is healthy
   */
  isComponentHealthy(componentName: string): boolean {
    const component = this.components.get(componentName);
    if (!component) return false;
    
    // Component is healthy if:
    // 1. It's mounted
    // 2. No errors in last 5 minutes
    // 3. Last render was recent (< 60s)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentErrors = component.errors.filter(
      (e) => e.timestamp > fiveMinutesAgo
    );
    
    const lastRenderRecent = Date.now() - component.lastRender < 60 * 1000;
    
    return component.mounted && recentErrors.length === 0 && lastRenderRecent;
  }

  /**
   * Clear old data (> 1 hour)
   */
  cleanup() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    this.components.forEach((component) => {
      component.errors = component.errors.filter(
        (e) => e.timestamp > oneHourAgo
      );
    });
  }
}

// Singleton
let instance: ComponentHealthMonitor | null = null;

export const getComponentHealthMonitor = (): ComponentHealthMonitor => {
  if (!instance) {
    instance = new ComponentHealthMonitor();
    
    // Auto-cleanup every 10 minutes
    setInterval(() => {
      instance?.cleanup();
    }, 10 * 60 * 1000);
  }
  return instance;
};

/**
 * React Hook to register component health
 */
export const useComponentHealth = (componentName: string) => {
  const monitor = getComponentHealthMonitor();
  
  // Register on mount
  useEffect(() => {
    monitor.registerMount(componentName);
    
    return () => {
      monitor.registerUnmount(componentName);
    };
  }, [componentName, monitor]);
  
  // Update render timestamp on each render
  useEffect(() => {
    monitor.updateRender(componentName);
  });
};
