import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  apiCallTime: number;
  memoryUsage: number;
  componentName: string;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

interface MemoryUsage {
  used: number;
  total: number;
  limit: number;
  usage: number;
}

interface PerformanceMonitorOptions {
  componentName: string;
  logToConsole?: boolean;
  sendToAnalytics?: boolean;
  threshold?: number; // Log if render time exceeds threshold (ms)
}

export const usePerformanceMonitor = (options: PerformanceMonitorOptions) => {
  const { componentName, logToConsole = true, sendToAnalytics = false, threshold = 16 } = options;
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  const measureRenderTime = useCallback(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      if (renderTime > threshold) {
        const metrics: PerformanceMetrics = {
          renderTime,
          apiCallTime: 0,
          memoryUsage: (performance as ExtendedPerformance).memory?.usedJSHeapSize || 0,
          componentName,
        };

        if (logToConsole) {
          console.warn(`Slow render detected in ${componentName}:`, {
            renderTime: `${renderTime.toFixed(2)}ms`,
            renderCount: renderCount.current,
            memoryUsage: `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
          });
        }

        if (sendToAnalytics) {
          // Send to analytics service
          // analytics.track('slow_render', metrics);
        }
      }
    };
  }, [componentName, logToConsole, sendToAnalytics, threshold]);

  const measureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const apiCallTime = endTime - startTime;

      if (apiCallTime > 1000) { // Log if API call takes more than 1 second
        const metrics: PerformanceMetrics = {
          renderTime: 0,
          apiCallTime,
          memoryUsage: (performance as ExtendedPerformance).memory?.usedJSHeapSize || 0,
          componentName,
        };

        if (logToConsole) {
          console.warn(`Slow API call detected:`, {
            endpoint,
            apiCallTime: `${apiCallTime.toFixed(2)}ms`,
            componentName,
          });
        }

        if (sendToAnalytics) {
          // analytics.track('slow_api_call', { ...metrics, endpoint });
        }
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const apiCallTime = endTime - startTime;

      if (logToConsole) {
        console.error(`API call failed:`, {
          endpoint,
          apiCallTime: `${apiCallTime.toFixed(2)}ms`,
          error,
          componentName,
        });
      }

      throw error;
    }
  }, [componentName, logToConsole, sendToAnalytics]);

  const measureMemoryUsage = useCallback((): MemoryUsage | null => {
    if ('memory' in performance) {
      const memory = (performance as ExtendedPerformance).memory;
      if (memory) {
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        };
      }
    }
    return null;
  }, []);

  const logMemoryUsage = useCallback(() => {
    const memory = measureMemoryUsage();
    if (memory && memory.usage > 80) { // Log if memory usage is over 80%
      if (logToConsole) {
        console.warn(`High memory usage detected in ${componentName}:`, {
          used: `${(memory.used / 1024 / 1024).toFixed(2)}MB`,
          total: `${(memory.total / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memory.limit / 1024 / 1024).toFixed(2)}MB`,
          usage: `${memory.usage.toFixed(2)}%`,
        });
      }
    }
  }, [componentName, logToConsole, measureMemoryUsage]);

  // Monitor memory usage periodically
  useEffect(() => {
    const interval = setInterval(logMemoryUsage, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [logMemoryUsage]);

  return {
    measureRenderTime,
    measureApiCall,
    measureMemoryUsage,
    logMemoryUsage,
  };
};

// Hook for measuring component mount/unmount times
export const useComponentLifecycle = (componentName: string) => {
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const lifecycleTime = unmountTime - mountTime.current;
      
      console.log(`${componentName} lifecycle:`, {
        mountTime: mountTime.current,
        unmountTime,
        totalLifecycle: `${lifecycleTime.toFixed(2)}ms`,
      });
    };
  }, [componentName]);
};

// Hook for measuring re-render frequency
export const useRenderFrequency = (componentName: string, threshold: number = 10) => {
  const renderCount = useRef<number>(0);
  const lastRenderTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);

  useEffect(() => {
    const now = performance.now();
    renderCount.current += 1;

    if (lastRenderTime.current > 0) {
      const timeSinceLastRender = now - lastRenderTime.current;
      renderTimes.current.push(timeSinceLastRender);

      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }

      // Check if component is re-rendering too frequently
      if (renderCount.current > threshold) {
        const avgRenderInterval = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
        
        if (avgRenderInterval < 100) { // Less than 100ms between renders
          console.warn(`${componentName} is re-rendering frequently:`, {
            renderCount: renderCount.current,
            avgInterval: `${avgRenderInterval.toFixed(2)}ms`,
            lastInterval: `${timeSinceLastRender.toFixed(2)}ms`,
          });
        }
      }
    }

    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    renderTimes: renderTimes.current,
  };
};



