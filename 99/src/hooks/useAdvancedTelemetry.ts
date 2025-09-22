import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// 📊 Tipos para métricas avançadas
interface PerformanceMetrics {
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  networkLatency: number;
  cacheHitRate: number;
  errorRate: number;
  userEngagement: number;
  loadingTime: number;
  interactionDelay: number;
}

interface UserBehaviorMetrics {
  sessionDuration: number;
  pagesViewed: number;
  bounceRate: number;
  conversionRate: number;
  searchQueries: string[];
  clickThroughRate: number;
  timeToInteraction: number;
  scrollDepth: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionSpeed: 'slow' | 'fast' | 'medium';
}

interface ComponentMetrics {
  componentName: string;
  mountTime: number;
  renderCount: number;
  reRenderReasons: string[];
  propChanges: number;
  memoryLeaks: boolean;
  errorBoundaryTriggers: number;
}

interface SystemHealth {
  cpuUsage: number;
  memoryPressure: 'low' | 'medium' | 'high';
  batteryLevel?: number;
  networkStatus: 'online' | 'offline' | 'slow';
  storageUsage: number;
  cacheEfficiency: number;
}

// 🎯 Hook principal de telemetria avançada
export function useAdvancedTelemetry(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    bundleSize: 0,
    memoryUsage: 0,
    networkLatency: 0,
    cacheHitRate: 0,
    errorRate: 0,
    userEngagement: 0,
    loadingTime: 0,
    interactionDelay: 0
  });

  const [userBehavior, setUserBehavior] = useState<UserBehaviorMetrics>({
    sessionDuration: 0,
    pagesViewed: 0,
    bounceRate: 0,
    conversionRate: 0,
    searchQueries: [],
    clickThroughRate: 0,
    timeToInteraction: 0,
    scrollDepth: 0,
    deviceType: 'desktop',
    connectionSpeed: 'fast'
  });

  const [componentMetrics, setComponentMetrics] = useState<ComponentMetrics>({
    componentName,
    mountTime: 0,
    renderCount: 0,
    reRenderReasons: [],
    propChanges: 0,
    memoryLeaks: false,
    errorBoundaryTriggers: 0
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpuUsage: 0,
    memoryPressure: 'low',
    batteryLevel: 100,
    networkStatus: 'online',
    storageUsage: 0,
    cacheEfficiency: 0
  });

  const startTime = useRef<number>();
  const renderCount = useRef(0);
  const sessionStart = useRef(Date.now());
  const observer = useRef<PerformanceObserver | null>(null);

  // 🎯 Métricas de performance do componente
  const startRender = useCallback(() => {
    startTime.current = performance.now();
    renderCount.current += 1;
  }, []);

  const endRender = useCallback((reason?: string) => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current;
      
      setMetrics(prev => ({ ...prev, renderTime: duration }));
      setComponentMetrics(prev => ({
        ...prev,
        renderCount: renderCount.current,
        reRenderReasons: reason ? [...prev.reRenderReasons.slice(-4), reason] : prev.reRenderReasons
      }));

      // 🚨 Alertas de performance
      if (duration > 100) {
        console.warn(`🐌 FASE 5: Render lento detectado em ${componentName}: ${duration.toFixed(2)}ms`);
      }

      if (renderCount.current > 20) {
        console.warn(`♻️ FASE 5: Muitos re-renders em ${componentName}: ${renderCount.current}`);
      }
    }
  }, [componentName]);

  // 📊 Monitoramento de Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Core Web Vitals
    if (window.performance && 'observe' in PerformanceObserver.prototype) {
      observer.current = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              setMetrics(prev => ({ ...prev, loadingTime: entry.startTime }));
              break;
            case 'first-input':
              const inputEntry = entry as any;
              setMetrics(prev => ({ ...prev, interactionDelay: inputEntry.processingStart - inputEntry.startTime }));
              break;
            case 'layout-shift':
              const layoutEntry = entry as any;
              if (!layoutEntry.hadRecentInput) {
                console.log(`📐 FASE 5: Layout shift detectado: ${layoutEntry.value}`);
              }
              break;
          }
        });
      });

      observer.current.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // 💾 Monitoramento de memória
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const memoryUsage = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;
        
        setMetrics(prev => ({ ...prev, memoryUsage: memoryUsage * 100 }));
        
        const pressure = memoryUsage > 0.8 ? 'high' : memoryUsage > 0.5 ? 'medium' : 'low';
        setSystemHealth(prev => ({ ...prev, memoryPressure: pressure }));

        if (memoryUsage > 0.9) {
          console.error(`🧠 FASE 5: Pressão de memória crítica: ${(memoryUsage * 100).toFixed(1)}%`);
        }
      }
    };

    const interval = setInterval(checkMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🌐 Monitoramento de rede
  useEffect(() => {
    const checkNetwork = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const speed = connection.effectiveType;
        
        setUserBehavior(prev => ({
          ...prev,
          connectionSpeed: speed === '4g' ? 'fast' : speed === '3g' ? 'medium' : 'slow'
        }));

        setSystemHealth(prev => ({
          ...prev,
          networkStatus: navigator.onLine ? 'online' : 'offline'
        }));
      }
    };

    checkNetwork();
    window.addEventListener('online', checkNetwork);
    window.addEventListener('offline', checkNetwork);

    return () => {
      window.removeEventListener('online', checkNetwork);
      window.removeEventListener('offline', checkNetwork);
    };
  }, []);

  // 📱 Detecção de dispositivo
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const deviceType = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
      
      setUserBehavior(prev => ({ ...prev, deviceType }));
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);

    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // 🔋 Monitoramento de bateria (se disponível)
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setSystemHealth(prev => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100)
          }));
        };

        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
      });
    }
  }, []);

  // 📈 Métricas de comportamento do usuário
  const trackUserAction = useCallback((action: string, data?: any) => {
    const timestamp = Date.now();
    const sessionDuration = timestamp - sessionStart.current;

    setUserBehavior(prev => ({
      ...prev,
      sessionDuration: Math.round(sessionDuration / 1000),
      pagesViewed: action === 'page_view' ? prev.pagesViewed + 1 : prev.pagesViewed
    }));

    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`👤 FASE 5: Ação do usuário [${action}]:`, data);
    }
  }, []);

  // 🎯 Análise de performance em tempo real
  const performanceScore = useMemo(() => {
    const weights = {
      renderTime: 0.25,
      memoryUsage: 0.20,
      loadingTime: 0.25,
      interactionDelay: 0.15,
      errorRate: 0.15
    };

    const scores = {
      renderTime: Math.max(0, 100 - (metrics.renderTime / 10)), // < 100ms = 100 pontos
      memoryUsage: Math.max(0, 100 - metrics.memoryUsage), // < 50% = 100 pontos
      loadingTime: Math.max(0, 100 - (metrics.loadingTime / 25)), // < 2.5s = 100 pontos
      interactionDelay: Math.max(0, 100 - (metrics.interactionDelay / 3)), // < 100ms = 100 pontos
      errorRate: Math.max(0, 100 - (metrics.errorRate * 10)) // 0% = 100 pontos
    };

    const totalScore = Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (scores[key as keyof typeof scores] * weight);
    }, 0);

    return Math.round(totalScore);
  }, [metrics]);

  // 🎨 Cor do score baseada na performance
  const getScoreColor = useCallback((score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  // 🚨 Sistema de alertas
  const getAlerts = useCallback(() => {
    const alerts = [];

    if (metrics.renderTime > 100) {
      alerts.push({ type: 'warning', message: 'Render time alto', value: `${metrics.renderTime.toFixed(2)}ms` });
    }

    if (systemHealth.memoryPressure === 'high') {
      alerts.push({ type: 'error', message: 'Pressão de memória crítica', value: `${metrics.memoryUsage.toFixed(1)}%` });
    }

    if (componentMetrics.renderCount > 50) {
      alerts.push({ type: 'warning', message: 'Muitos re-renders', value: componentMetrics.renderCount.toString() });
    }

    if (userBehavior.connectionSpeed === 'slow') {
      alerts.push({ type: 'info', message: 'Conexão lenta detectada', value: userBehavior.connectionSpeed });
    }

    return alerts;
  }, [metrics, systemHealth, componentMetrics, userBehavior]);

  // 📊 Export de dados para análise
  const exportMetrics = useCallback(() => {
    return {
      timestamp: Date.now(),
      component: componentName,
      performance: metrics,
      userBehavior,
      componentMetrics,
      systemHealth,
      score: performanceScore
    };
  }, [componentName, metrics, userBehavior, componentMetrics, systemHealth, performanceScore]);

  return {
    // Métricas
    metrics,
    userBehavior,
    componentMetrics,
    systemHealth,
    performanceScore,
    
    // Funções de controle
    startRender,
    endRender,
    trackUserAction,
    
    // Análise
    getScoreColor,
    getAlerts,
    exportMetrics,
    
    // Estado
    isHealthy: performanceScore > 70,
    needsOptimization: performanceScore < 50
  };
}

// 🎯 Hook especializado para monitoramento de listas
export function useListTelemetry(listName: string, itemCount: number) {
  const telemetry = useAdvancedTelemetry(`List_${listName}`);
  const [listMetrics, setListMetrics] = useState({
    itemsRendered: 0,
    itemsInView: 0,
    scrollPosition: 0,
    virtualizedEfficiency: 0
  });

  const trackListRender = useCallback((visibleItems: number, totalItems: number) => {
    const efficiency = (visibleItems / totalItems) * 100;
    
    setListMetrics(prev => ({
      ...prev,
      itemsRendered: totalItems,
      itemsInView: visibleItems,
      virtualizedEfficiency: efficiency
    }));

    if (efficiency < 30) {
      console.warn(`📋 FASE 5: Eficiência de virtualização baixa em ${listName}: ${efficiency.toFixed(1)}%`);
    }
  }, [listName]);

  return {
    ...telemetry,
    listMetrics,
    trackListRender
  };
}