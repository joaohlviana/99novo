import { useCallback, useRef } from 'react';

// 📊 Hook para monitoramento de performance
export function usePerformanceMonitor(operation: string) {
  const startTime = useRef<number>();
  
  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current;
      console.log(`🔍 FASE 4: ${operation} executado em ${duration.toFixed(2)}ms`);
    }
  }, [operation]);

  return { start, end };
}