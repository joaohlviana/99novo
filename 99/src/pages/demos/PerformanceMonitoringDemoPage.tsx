import React, { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAdvancedTelemetry } from '../../hooks/useAdvancedTelemetry';
import { useSmartCache } from '../../lib/smart-cache-manager';
import { 
  Activity, 
  BarChart3, 
  Brain, 
  Database, 
  Gauge, 
  LineChart, 
  Monitor, 
  Target, 
  TrendingUp, 
  Zap 
} from 'lucide-react';

// Lazy load dos componentes pesados
const PerformanceDashboard = React.lazy(() => import('../../components/debug/PerformanceDashboard'));
const PerformanceAnalyzer = React.lazy(() => import('../../components/debug/PerformanceAnalyzer'));

// 🚀 FASE 5: Página de demonstração completa do sistema de monitoramento
export function PerformanceMonitoringDemoPage() {
  const telemetry = useAdvancedTelemetry('PerformanceDemo');
  const cache = useSmartCache();
  
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [simulateLoad, setSimulateLoad] = useState(false);
  
  // Simular diferentes cenários de performance
  const simulateHeavyOperation = () => {
    setSimulateLoad(true);
    telemetry.startRender();
    
    // Simular operação pesada
    const startTime = performance.now();
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
    
    const endTime = performance.now();
    telemetry.endRender(`heavy_operation_${endTime - startTime}ms`);
    telemetry.trackUserAction('simulate_heavy_operation', { duration: endTime - startTime });
    
    setTimeout(() => setSimulateLoad(false), 2000);
  };

  const testCacheSystem = () => {
    // Teste do sistema de cache
    const testData = {
      timestamp: Date.now(),
      data: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000
      }))
    };

    cache.set('test-data', testData, {
      ttl: 5 * 60 * 1000,
      priority: 'high',
      dependencies: ['demo', 'test']
    });

    const retrieved = cache.get('test-data');
    console.log('🧪 FASE 5: Teste de cache:', { stored: testData, retrieved });
    
    telemetry.trackUserAction('test_cache_system', { 
      success: !!retrieved,
      dataSize: testData.data.length 
    });
  };

  const clearCache = () => {
    cache.clear();
    telemetry.trackUserAction('clear_cache');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sistema de Monitoramento FASE 5
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Telemetria avançada, cache inteligente e análise de performance em tempo real
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Badge variant="outline" className="px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              Score: {telemetry.performanceScore}
            </Badge>
            <Badge variant={cache.isHealthy ? 'default' : 'destructive'} className="px-4 py-2">
              <Database className="w-4 h-4 mr-2" />
              Cache: {cache.metrics?.hitRate.toFixed(1)}% hit rate
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Monitor className="w-4 h-4 mr-2" />
              {telemetry.userBehavior.deviceType} • {telemetry.userBehavior.connectionSpeed}
            </Badge>
          </div>
        </div>

        {/* Controles de Demonstração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Controles de Demonstração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={simulateHeavyOperation}
                disabled={simulateLoad}
                variant="outline"
              >
                {simulateLoad ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Gauge className="w-4 h-4 mr-2" />
                    Simular Operação Pesada
                  </>
                )}
              </Button>
              
              <Button onClick={testCacheSystem} variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Testar Sistema de Cache
              </Button>
              
              <Button onClick={clearCache} variant="outline">
                <Target className="w-4 h-4 mr-2" />
                Limpar Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Métricas em Tempo Real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Performance Score</p>
                  <p className={`text-2xl font-bold ${telemetry.getScoreColor(telemetry.performanceScore)}`}>
                    {telemetry.performanceScore}
                  </p>
                </div>
              </div>
              <Progress value={telemetry.performanceScore} className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cache Hit Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {cache.metrics?.hitRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Progress value={cache.metrics?.hitRate || 0} className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <LineChart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Render Time</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {telemetry.metrics.renderTime.toFixed(1)}ms
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Ideal: < 100ms</span>
                  <span>{telemetry.metrics.renderTime > 100 ? 'Lento' : 'Rápido'}</span>
                </div>
                <Progress value={Math.min(telemetry.metrics.renderTime, 200) / 2} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Memory Usage</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {telemetry.metrics.memoryUsage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Progress value={telemetry.metrics.memoryUsage} className="mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* Alertas Ativos */}
        {telemetry.getAlerts().length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Alertas de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {telemetry.getAlerts().map((alert, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.type === 'error' ? 'bg-red-500' :
                      alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600">{alert.value}</p>
                    </div>
                    <Badge variant={
                      alert.type === 'error' ? 'destructive' :
                      alert.type === 'warning' ? 'secondary' : 'default'
                    }>
                      {alert.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Abas de Demonstração */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analyzer">Analisador</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Monitoramento FASE 5</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">🔍 Telemetria Avançada</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Monitoramento de Web Vitals em tempo real</li>
                      <li>• Rastreamento de comportamento do usuário</li>
                      <li>• Análise de performance de componentes</li>
                      <li>• Detecção automática de gargalos</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">🧠 Cache Inteligente</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Cache preditivo baseado em padrões</li>
                      <li>• Limpeza inteligente por prioridade e frequência</li>
                      <li>• Invalidação por dependências</li>
                      <li>• Compressão automática de dados</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">📊 Análise e Recomendações</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                      <h5 className="font-medium">Performance Score</h5>
                      <p className="text-sm text-gray-600">Algoritmo de scoring baseado em múltiplas métricas</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <Target className="w-8 h-8 text-green-600 mb-2" />
                      <h5 className="font-medium">Detecção de Gargalos</h5>
                      <p className="text-sm text-gray-600">Identificação automática de problemas de performance</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <Brain className="w-8 h-8 text-purple-600 mb-2" />
                      <h5 className="font-medium">Recomendações IA</h5>
                      <p className="text-sm text-gray-600">Sugestões inteligentes para otimização</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard">
            <Suspense 
              fallback={
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Carregando Dashboard de Performance...</p>
                  </CardContent>
                </Card>
              }
            >
              <PerformanceDashboard 
                componentName="PerformanceDemo"
                autoRefresh={true}
                refreshInterval={3000}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="analyzer">
            <Suspense 
              fallback={
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Carregando Analisador de Performance...</p>
                  </CardContent>
                </Card>
              }
            >
              <PerformanceAnalyzer
                components={['PerformanceDemo', 'SmartCache', 'AdvancedTelemetry']}
                autoAnalyze={true}
                showRecommendations={true}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Saúde Geral</span>
                        <span className="text-sm font-medium">
                          {telemetry.isHealthy ? 'Saudável' : 'Atenção Necessária'}
                        </span>
                      </div>
                      <Progress value={telemetry.performanceScore} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Dispositivo</span>
                        <span className="text-sm font-medium capitalize">
                          {telemetry.userBehavior.deviceType}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Conexão</span>
                        <span className="text-sm font-medium capitalize">
                          {telemetry.userBehavior.connectionSpeed}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Sessão</span>
                        <span className="text-sm font-medium">
                          {Math.floor(telemetry.userBehavior.sessionDuration / 60)}min {telemetry.userBehavior.sessionDuration % 60}s
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Cache</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Taxa de Acerto</span>
                        <span className="text-sm font-medium">
                          {cache.metrics?.hitRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={cache.metrics?.hitRate || 0} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Entradas</span>
                        <span className="text-sm font-medium">
                          {cache.metrics?.entryCount || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Uso de Memória</span>
                        <span className="text-sm font-medium">
                          {cache.metrics?.memoryUsage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={cache.metrics?.memoryUsage || 0} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Total de Requests</span>
                        <span className="text-sm font-medium">
                          {cache.metrics?.totalRequests || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default PerformanceMonitoringDemoPage;