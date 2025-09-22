/**
 * 🛡️ ERROR PREVENTION UTILITIES
 * 
 * Utilitários para prevenir erros comuns e melhorar a estabilidade do sistema.
 */

/**
 * Safe import function que evita erros de importação
 */
export async function safeImport<T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  try {
    return await importFn();
  } catch (error) {
    console.warn('Safe import failed:', error);
    return fallback || null;
  }
}

/**
 * Safe async function executor
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  fallback?: T,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    if (errorMessage) {
      console.warn(errorMessage, error);
    } else {
      console.warn('Safe async execution failed:', error);
    }
    return fallback || null;
  }
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(
  jsonString: string,
  fallback?: T
): T | null {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Safe JSON parse failed:', error);
    return fallback || null;
  }
}

/**
 * Safe property access
 */
export function safeGet<T>(
  obj: any,
  path: string,
  fallback?: T
): T | undefined {
  try {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj) || fallback;
  } catch (error) {
    console.warn('Safe property access failed:', error);
    return fallback;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
  
  throw lastError;
}

/**
 * Safe array access
 */
export function safeArrayAccess<T>(
  array: T[] | undefined | null,
  index: number,
  fallback?: T
): T | undefined {
  try {
    if (!Array.isArray(array) || index < 0 || index >= array.length) {
      return fallback;
    }
    return array[index];
  } catch (error) {
    console.warn('Safe array access failed:', error);
    return fallback;
  }
}

/**
 * Environment check utilities
 */
export const env = {
  isDevelopment: () => {
    try {
      return process.env.NODE_ENV === 'development' || 
             import.meta?.env?.DEV === true ||
             typeof window !== 'undefined' && window.location.hostname === 'localhost';
    } catch {
      return false;
    }
  },
  
  isProduction: () => {
    try {
      return process.env.NODE_ENV === 'production' || 
             import.meta?.env?.PROD === true;
    } catch {
      return false;
    }
  },
  
  isBrowser: () => {
    return typeof window !== 'undefined';
  },
  
  isServer: () => {
    return typeof window === 'undefined';
  }
};

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static timers = new Map<string, number>();
  
  static start(label: string) {
    if (env.isDevelopment()) {
      this.timers.set(label, performance.now());
    }
  }
  
  static end(label: string) {
    if (env.isDevelopment()) {
      const startTime = this.timers.get(label);
      if (startTime) {
        const duration = performance.now() - startTime;
        console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
        this.timers.delete(label);
      }
    }
  }
  
  static measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }
  
  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
}

/**
 * Memory leak prevention for event listeners
 */
export class EventListenerManager {
  private listeners = new Set<() => void>();
  
  add(element: EventTarget, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions) {
    element.addEventListener(event, handler, options);
    
    const cleanup = () => {
      element.removeEventListener(event, handler, options);
      this.listeners.delete(cleanup);
    };
    
    this.listeners.add(cleanup);
    return cleanup;
  }
  
  cleanup() {
    this.listeners.forEach(cleanup => cleanup());
    this.listeners.clear();
  }
}

export default {
  safeImport,
  safeAsync,
  safeJsonParse,
  safeGet,
  debounce,
  throttle,
  retry,
  safeArrayAccess,
  env,
  PerformanceMonitor,
  EventListenerManager
};