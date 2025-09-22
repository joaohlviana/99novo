// 🚀 FASE 5: Sistema de Cache Inteligente
import { useCallback, useEffect, useRef, useState } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  priority: 'low' | 'medium' | 'high';
  size: number;
  dependencies?: string[];
}

interface CacheConfig {
  maxSize: number; // em MB
  maxEntries: number;
  defaultTTL: number; // em ms
  cleanupInterval: number; // em ms
  compressionEnabled: boolean;
}

interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  cacheSize: number;
  entryCount: number;
  averageAccessTime: number;
  memoryUsage: number;
}

class SmartCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private cleanupTimer?: NodeJS.Timeout;
  private accessTimes = new Map<string, number[]>();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50, // 50MB
      maxEntries: 1000,
      defaultTTL: 30 * 60 * 1000, // 30 minutos
      cleanupInterval: 5 * 60 * 1000, // 5 minutos
      compressionEnabled: true,
      ...config
    };

    this.metrics = {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      totalHits: 0,
      totalMisses: 0,
      cacheSize: 0,
      entryCount: 0,
      averageAccessTime: 0,
      memoryUsage: 0
    };

    this.startCleanupTimer();
  }

  // 🎯 Armazenar dados no cache com inteligência preditiva
  set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      priority?: 'low' | 'medium' | 'high';
      dependencies?: string[];
      compress?: boolean;
    } = {}
  ): void {
    const startTime = performance.now();

    try {
      const size = this.calculateSize(data);
      const entry: CacheEntry<T> = {
        data: options.compress && this.config.compressionEnabled ? this.compress(data) : data,
        timestamp: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now(),
        priority: options.priority || 'medium',
        size,
        dependencies: options.dependencies
      };

      // Verificar se precisa fazer limpeza antes de adicionar
      if (this.needsCleanup(size)) {
        this.smartCleanup();
      }

      this.cache.set(key, entry);
      this.updateMetrics();

      // Rastreamento de padrões de acesso
      this.trackAccessPattern(key);

      console.log(`📦 FASE 5: Cache SET [${key}] - ${size}B, Priority: ${entry.priority}`);
    } catch (error) {
      console.error(`❌ FASE 5: Cache SET error [${key}]:`, error);
    }

    this.trackAccessTime(key, performance.now() - startTime);
  }

  // 🔍 Recuperar dados do cache com preload inteligente
  get<T>(key: string): T | null {
    const startTime = performance.now();
    this.metrics.totalRequests++;

    const entry = this.cache.get(key);

    if (!entry) {
      this.metrics.totalMisses++;
      this.updateHitRate();
      console.log(`❌ FASE 5: Cache MISS [${key}]`);
      return null;
    }

    // Verificar TTL
    const now = Date.now();
    const isExpired = (now - entry.timestamp) > this.config.defaultTTL;

    if (isExpired) {
      this.cache.delete(key);
      this.metrics.totalMisses++;
      this.updateHitRate();
      console.log(`⏰ FASE 5: Cache EXPIRED [${key}]`);
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++;
    entry.lastAccessed = now;

    this.metrics.totalHits++;
    this.updateHitRate();

    // Preload preditivo baseado em padrões
    this.predictivePreload(key);

    console.log(`✅ FASE 5: Cache HIT [${key}] - Access count: ${entry.accessCount}`);

    this.trackAccessTime(key, performance.now() - startTime);

    return this.config.compressionEnabled && entry.data?.compressed 
      ? this.decompress(entry.data) 
      : entry.data;
  }

  // 🧠 Preload preditivo baseado em padrões de uso
  private predictivePreload(accessedKey: string): void {
    const patterns = this.analyzeAccessPatterns(accessedKey);
    
    patterns.forEach(predictedKey => {
      if (!this.cache.has(predictedKey)) {
        // Disparar evento para preload
        this.dispatchPreloadEvent(predictedKey);
      }
    });
  }

  // 📊 Analisar padrões de acesso para previsão
  private analyzeAccessPatterns(key: string): string[] {
    const accessHistory = this.accessTimes.get(key) || [];
    const relatedKeys: string[] = [];

    // Algoritmo simples: procurar chaves acessadas frequentemente junto
    this.cache.forEach((entry, cacheKey) => {
      if (cacheKey !== key && entry.accessCount > 3) {
        const keyAccessHistory = this.accessTimes.get(cacheKey) || [];
        
        // Se foram acessadas em janelas temporais próximas
        const correlationScore = this.calculateCorrelation(accessHistory, keyAccessHistory);
        if (correlationScore > 0.7) {
          relatedKeys.push(cacheKey);
        }
      }
    });

    return relatedKeys.slice(0, 3); // Máximo 3 preloads por vez
  }

  // 🔗 Calcular correlação entre padrões de acesso
  private calculateCorrelation(history1: number[], history2: number[]): number {
    if (history1.length < 2 || history2.length < 2) return 0;

    let correlatedAccesses = 0;
    const timeWindow = 5000; // 5 segundos

    history1.forEach(time1 => {
      const hasCorrelation = history2.some(time2 => 
        Math.abs(time1 - time2) <= timeWindow
      );
      if (hasCorrelation) correlatedAccesses++;
    });

    return correlatedAccesses / Math.max(history1.length, history2.length);
  }

  // 🗑️ Limpeza inteligente baseada em LRU + prioridade + frequência
  private smartCleanup(): void {
    console.log('🧹 FASE 5: Iniciando limpeza inteligente do cache...');

    const entries = Array.from(this.cache.entries());
    
    // Algoritmo de scoring para limpeza inteligente
    const scored = entries.map(([key, entry]) => {
      const now = Date.now();
      const age = now - entry.timestamp;
      const timeSinceAccess = now - entry.lastAccessed;
      const accessFrequency = entry.accessCount / (age / 1000 / 60); // acessos por minuto

      // Score mais baixo = maior probabilidade de remoção
      let score = 0;

      // Fator prioridade (25%)
      score += entry.priority === 'high' ? 100 : entry.priority === 'medium' ? 50 : 25;

      // Fator frequência de acesso (35%)
      score += Math.min(accessFrequency * 10, 50);

      // Fator recência (25%)
      score += Math.max(0, 50 - (timeSinceAccess / 1000 / 60 / 5)); // Penaliza se não foi acessado em 5 min

      // Fator tamanho (15%) - itens menores têm score ligeiramente maior
      score += Math.max(0, 25 - (entry.size / 1024)); // Penaliza itens grandes

      return { key, score, entry };
    });

    // Ordenar por score (menor primeiro para remoção)
    scored.sort((a, b) => a.score - b.score);

    // Remover 25% dos itens com menor score
    const toRemove = Math.max(1, Math.floor(scored.length * 0.25));
    
    for (let i = 0; i < toRemove && this.cache.size > 0; i++) {
      const { key } = scored[i];
      this.cache.delete(key);
      this.accessTimes.delete(key);
      console.log(`🗑️ FASE 5: Removido do cache [${key}] - Score: ${scored[i].score.toFixed(1)}`);
    }

    this.updateMetrics();
    console.log(`✅ FASE 5: Limpeza concluída. Removidos: ${toRemove} itens`);
  }

  // 🔄 Invalidar cache por dependências
  invalidateByDependency(dependency: string): void {
    let invalidated = 0;

    this.cache.forEach((entry, key) => {
      if (entry.dependencies?.includes(dependency)) {
        this.cache.delete(key);
        this.accessTimes.delete(key);
        invalidated++;
      }
    });

    if (invalidated > 0) {
      console.log(`🔄 FASE 5: Invalidados ${invalidated} itens por dependência [${dependency}]`);
      this.updateMetrics();
    }
  }

  // 📊 Rastrear padrões de acesso
  private trackAccessPattern(key: string): void {
    const now = Date.now();
    const history = this.accessTimes.get(key) || [];
    
    // Manter apenas últimos 10 acessos
    history.push(now);
    if (history.length > 10) {
      history.shift();
    }
    
    this.accessTimes.set(key, history);
  }

  // ⏱️ Rastrear tempo de acesso
  private trackAccessTime(key: string, accessTime: number): void {
    // Atualizar média de tempo de acesso
    this.metrics.averageAccessTime = 
      (this.metrics.averageAccessTime + accessTime) / 2;
  }

  // 📐 Calcular tamanho estimado do objeto
  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2; // Estimativa conservadora
    }
  }

  // 🗜️ Compressão simples (seria melhor usar uma lib real)
  private compress(data: any): any {
    if (!this.config.compressionEnabled) return data;
    
    try {
      return {
        compressed: true,
        data: JSON.stringify(data) // Em produção, usar LZ77 ou similar
      };
    } catch {
      return data;
    }
  }

  // 📂 Descompressão
  private decompress(compressedData: any): any {
    if (!compressedData?.compressed) return compressedData;
    
    try {
      return JSON.parse(compressedData.data);
    } catch {
      return compressedData;
    }
  }

  // 🧮 Verificar se precisa fazer limpeza
  private needsCleanup(newEntrySize: number): boolean {
    const currentSize = this.getCurrentCacheSize();
    const maxSizeBytes = this.config.maxSize * 1024 * 1024;
    
    return (
      currentSize + newEntrySize > maxSizeBytes ||
      this.cache.size >= this.config.maxEntries
    );
  }

  // 📏 Calcular tamanho atual do cache
  private getCurrentCacheSize(): number {
    let totalSize = 0;
    this.cache.forEach(entry => {
      totalSize += entry.size;
    });
    return totalSize;
  }

  // 📊 Atualizar métricas
  private updateMetrics(): void {
    this.metrics.entryCount = this.cache.size;
    this.metrics.cacheSize = this.getCurrentCacheSize();
    this.metrics.memoryUsage = (this.metrics.cacheSize / (this.config.maxSize * 1024 * 1024)) * 100;
  }

  // 📈 Atualizar taxa de acertos
  private updateHitRate(): void {
    if (this.metrics.totalRequests > 0) {
      this.metrics.hitRate = (this.metrics.totalHits / this.metrics.totalRequests) * 100;
      this.metrics.missRate = (this.metrics.totalMisses / this.metrics.totalRequests) * 100;
    }
  }

  // 🚀 Disparar evento de preload
  private dispatchPreloadEvent(key: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cache-preload-suggestion', {
        detail: { key }
      }));
    }
  }

  // ⏰ Iniciar timer de limpeza automática
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      if (this.cache.size > this.config.maxEntries * 0.8) {
        this.smartCleanup();
      }
    }, this.config.cleanupInterval);
  }

  // 🎯 Métodos públicos para controle
  
  clear(): void {
    this.cache.clear();
    this.accessTimes.clear();
    this.metrics = {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      totalHits: 0,
      totalMisses: 0,
      cacheSize: 0,
      entryCount: 0,
      averageAccessTime: 0,
      memoryUsage: 0
    };
    console.log('🧹 FASE 5: Cache completamente limpo');
  }

  getMetrics(): CacheMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  getEntry(key: string): CacheEntry<any> | null {
    return this.cache.get(key) || null;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  size(): number {
    return this.cache.size;
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// 🎯 Hook React para usar o cache inteligente
export function useSmartCache() {
  const cacheRef = useRef<SmartCacheManager>();
  const [metrics, setMetrics] = useState<CacheMetrics | null>(null);

  useEffect(() => {
    if (!cacheRef.current) {
      cacheRef.current = new SmartCacheManager();
    }

    const updateMetrics = () => {
      if (cacheRef.current) {
        setMetrics(cacheRef.current.getMetrics());
      }
    };

    // Atualizar métricas a cada 5 segundos
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Primeira atualização

    return () => {
      clearInterval(interval);
      if (cacheRef.current) {
        cacheRef.current.destroy();
      }
    };
  }, []);

  const setCache = useCallback((key: string, data: any, options?: any) => {
    cacheRef.current?.set(key, data, options);
  }, []);

  const getCache = useCallback((key: string) => {
    return cacheRef.current?.get(key) || null;
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current?.clear();
  }, []);

  const invalidateByDependency = useCallback((dependency: string) => {
    cacheRef.current?.invalidateByDependency(dependency);
  }, []);

  return {
    set: setCache,
    get: getCache,
    clear: clearCache,
    invalidateByDependency,
    metrics,
    isHealthy: metrics ? metrics.hitRate > 70 : true
  };
}

export { SmartCacheManager };
export type { CacheEntry, CacheConfig, CacheMetrics };