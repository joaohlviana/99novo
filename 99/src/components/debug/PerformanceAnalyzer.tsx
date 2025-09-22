import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAdvancedTelemetry } from '../../hooks/useAdvancedTelemetry';
import { useSmartCache } from '../../lib/smart-cache-manager';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Brain, 
  CheckCircle, 
  Clock, 
  Download, 
  Filter, 
  Lightbulb, 
  LineChart, 
  Target, 
  TrendingDown, 
  TrendingUp, 
  Zap 
} from 'lucide-react';

interface PerformanceAnalyzerProps {
  components?: string[];
  autoAnalyze?: boolean;
  showRecommendations?: boolean;
}

interface AnalysisResult {
  score: number;
  bottlenecks: Bottleneck[];
  recommendations: Recommendation[];
  trends: PerformanceTrend[];
  predictions: Prediction[];
}

interface Bottleneck {
  type: 'render' | 'memory' | 'network' | 'cache' | 'component';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  solution: string;
  estimatedGain: number;
}

interface Recommendation {
  priority: 'low' | 'medium' | 'high';
  category: 'performance' | 'ux' | 'resource' | 'architecture';
  title: string;
  description: string;
  implementation: string;
  effort: 'easy' | 'medium' | 'hard';
  impact: number;
}

interface PerformanceTrend {
  metric: string;
  direction: 'improving' | 'degrading' | 'stable';
  change: number;
  period: string;
}

interface Prediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
}

// 🚀 FASE 5: Analisador avançado de performance
export function PerformanceAnalyzer({ 
  components = ['TrainersCatalog'],
  autoAnalyze = true,
  showRecommendations = true 
}: PerformanceAnalyzerProps) {
  const telemetry = useAdvancedTelemetry('PerformanceAnalyzer');
  const cache = useSmartCache();
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(components[0] || 'all');
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // 🔍 Executar análise automática
  useEffect(() => {
    if (autoAnalyze) {
      const interval = setInterval(() => {
        performAnalysis();
      }, 30000); // Análise a cada 30 segundos

      // Análise inicial
      performAnalysis();

      return () => clearInterval(interval);
    }
  }, [autoAnalyze, selectedComponent]);

  // 🎯 Executar análise de performance
  const performAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    telemetry.startRender();

    try {
      console.log('🔍 FASE 5: Iniciando análise de performance...');

      // Coletar dados de todas as fontes
      const performanceData = {
        telemetry: telemetry.exportMetrics(),
        cache: cache.metrics,
        webVitals: await collectWebVitals(),
        componentMetrics: await collectComponentMetrics(),
        userBehavior: telemetry.userBehavior,
        systemHealth: telemetry.systemHealth
      };

      // Análise inteligente
      const result = await analyzePerformanceData(performanceData);
      
      setAnalysis(result);
      setAnalysisHistory(prev => [...prev.slice(-9), result]); // Manter últimas 10 análises

      console.log('✅ FASE 5: Análise de performance concluída', result);
    } catch (error) {
      console.error('❌ FASE 5: Erro na análise:', error);
    } finally {
      setIsAnalyzing(false);
      telemetry.endRender('analysis_complete');
    }
  }, [telemetry, cache, selectedComponent]);

  // 📊 Coletar Web Vitals
  const collectWebVitals = async (): Promise<any> => {
    return new Promise((resolve) => {
      const vitals = {
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0
      };

      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            switch (entry.entryType) {
              case 'largest-contentful-paint':
                vitals.lcp = entry.startTime;
                break;
              case 'first-input':
                vitals.fid = (entry as any).processingStart - entry.startTime;
                break;
              case 'layout-shift':
                if (!(entry as any).hadRecentInput) {
                  vitals.cls += (entry as any).value;
                }
                break;
            }
          });
          
          observer.disconnect();
          resolve(vitals);
        });

        try {
          observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        } catch {
          resolve(vitals);
        }

        // Timeout para garantir resolução
        setTimeout(() => resolve(vitals), 1000);
      } else {
        resolve(vitals);
      }
    });
  };

  // 🔧 Coletar métricas de componentes
  const collectComponentMetrics = async (): Promise<any> => {
    // Simular coleta de métricas de componentes específicos
    return {
      renderCount: telemetry.componentMetrics.renderCount,
      mountTime: telemetry.componentMetrics.mountTime,
      memoryLeaks: telemetry.componentMetrics.memoryLeaks,
      errorBoundaryTriggers: telemetry.componentMetrics.errorBoundaryTriggers
    };
  };

  // 🧠 Análise inteligente dos dados
  const analyzePerformanceData = async (data: any): Promise<AnalysisResult> => {
    const bottlenecks: Bottleneck[] = [];
    const recommendations: Recommendation[] = [];
    const trends: PerformanceTrend[] = [];
    const predictions: Prediction[] = [];

    // 🔍 Detectar gargalos
    
    // Gargalo de renderização
    if (data.telemetry.performance.renderTime > 100) {
      bottlenecks.push({
        type: 'render',
        severity: data.telemetry.performance.renderTime > 200 ? 'critical' : 'high',
        description: 'Tempo de renderização elevado detectado',
        impact: `Renderização lenta (${data.telemetry.performance.renderTime.toFixed(1)}ms) afeta a experiência do usuário`,
        solution: 'Implementar memoização, lazy loading e otimização de re-renders',
        estimatedGain: 40
      });

      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: 'Otimizar renderização de componentes',
        description: 'Implementar React.memo e useMemo para evitar re-renders desnecessários',
        implementation: 'Envolver componentes pesados com React.memo e memoizar cálculos complexos',
        effort: 'medium',
        impact: 35
      });
    }

    // Gargalo de memória
    if (data.telemetry.performance.memoryUsage > 70) {
      bottlenecks.push({
        type: 'memory',
        severity: data.telemetry.performance.memoryUsage > 85 ? 'critical' : 'high',
        description: 'Alto uso de memória detectado',
        impact: `Uso de memória em ${data.telemetry.performance.memoryUsage.toFixed(1)}% pode causar travamentos`,
        solution: 'Implementar limpeza de memória e otimização de cache',
        estimatedGain: 30
      });

      recommendations.push({
        priority: 'high',
        category: 'resource',
        title: 'Otimizar gestão de memória',
        description: 'Implementar limpeza automática e reduzir vazamentos de memória',
        implementation: 'Usar useEffect cleanup e otimizar estruturas de dados',
        effort: 'medium',
        impact: 40
      });
    }

    // Eficiência do cache
    if (data.cache && data.cache.hitRate < 70) {
      bottlenecks.push({
        type: 'cache',
        severity: 'medium',
        description: 'Baixa eficiência do cache',
        impact: `Taxa de acerto do cache em ${data.cache.hitRate.toFixed(1)}% está abaixo do ideal`,
        solution: 'Melhorar estratégias de cache e preload inteligente',
        estimatedGain: 25
      });

      recommendations.push({
        priority: 'medium',
        category: 'performance',
        title: 'Melhorar estratégia de cache',
        description: 'Implementar cache inteligente com preload preditivo',
        implementation: 'Configurar TTL adequado e análise de padrões de acesso',
        effort: 'hard',
        impact: 30
      });
    }

    // Análise de tendências
    if (analysisHistory.length >= 3) {
      const recent = analysisHistory.slice(-3);
      const avgScore = recent.reduce((sum, a) => sum + a.score, 0) / recent.length;
      const prevScore = analysisHistory[analysisHistory.length - 4]?.score || avgScore;

      trends.push({
        metric: 'Performance Score',
        direction: avgScore > prevScore ? 'improving' : avgScore < prevScore ? 'degrading' : 'stable',
        change: ((avgScore - prevScore) / prevScore) * 100,
        period: 'últimos 3 ciclos'
      });
    }

    // Predições baseadas em IA simples
    predictions.push({
      metric: 'Performance Score',
      currentValue: telemetry.performanceScore,
      predictedValue: telemetry.performanceScore + (bottlenecks.length * -5) + (recommendations.length * 2),
      confidence: 0.75,
      timeframe: '24 horas',
      reasoning: 'Baseado em gargalos detectados e implementação de recomendações'
    });

    // Calcular score geral
    let score = 100;
    bottlenecks.forEach(b => {
      const penalty = b.severity === 'critical' ? 20 : b.severity === 'high' ? 15 : b.severity === 'medium' ? 10 : 5;
      score -= penalty;
    });
    score = Math.max(0, score);

    return {
      score,
      bottlenecks,
      recommendations,
      trends,
      predictions
    };
  };

  // 🎨 Filtrar gargalos por severidade
  const filteredBottlenecks = useMemo(() => {
    if (!analysis) return [];
    if (filterSeverity === 'all') return analysis.bottlenecks;
    return analysis.bottlenecks.filter(b => b.severity === filterSeverity);
  }, [analysis, filterSeverity]);

  // 🎯 Aplicar recomendação (simulado)
  const applyRecommendation = useCallback((recommendation: Recommendation) => {
    console.log(`🚀 FASE 5: Aplicando recomendação: ${recommendation.title}`);
    
    // Simular aplicação da recomendação
    telemetry.trackUserAction('apply_recommendation', {
      title: recommendation.title,
      category: recommendation.category,
      effort: recommendation.effort
    });

    // Re-executar análise após aplicação
    setTimeout(() => {
      performAnalysis();
    }, 2000);
  }, [telemetry, performAnalysis]);

  // 📊 Exportar relatório
  const exportReport = useCallback(() => {
    if (!analysis) return;

    const report = {
      timestamp: new Date().toISOString(),
      component: selectedComponent,
      analysis,
      telemetryData: telemetry.exportMetrics(),
      cacheMetrics: cache.metrics
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('📊 FASE 5: Relatório de performance exportado');
  }, [analysis, selectedComponent, telemetry, cache]);

  if (!analysis) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-blue-500" />
            <span className="text-lg font-medium">Inicializando Análise de Performance</span>
          </div>
          {isAnalyzing && (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-muted-foreground">Coletando métricas...</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-500" />
              <div>
                <CardTitle>Análise de Performance</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Análise inteligente e recomendações automáticas
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedComponent} onValueChange={setSelectedComponent}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os componentes</SelectItem>
                  {components.map(comp => (
                    <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={performAnalysis} disabled={isAnalyzing} size="sm">
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analisando...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analisar
                  </>
                )}
              </Button>
              
              <Button onClick={exportReport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Score Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Score de Performance</p>
                <p className={`text-3xl font-bold ${
                  analysis.score >= 80 ? 'text-green-600' : 
                  analysis.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analysis.score}
                </p>
              </div>
            </div>
            <Progress value={analysis.score} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {analysis.score >= 80 ? 'Excelente' : 
               analysis.score >= 60 ? 'Bom' : 
               analysis.score >= 40 ? 'Regular' : 'Crítico'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Gargalos Detectados</p>
                <p className="text-3xl font-bold">{analysis.bottlenecks.length}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['critical', 'high', 'medium', 'low'].map(severity => {
                const count = analysis.bottlenecks.filter(b => b.severity === severity).length;
                if (count === 0) return null;
                return (
                  <Badge key={severity} variant={
                    severity === 'critical' ? 'destructive' :
                    severity === 'high' ? 'secondary' : 'outline'
                  }>
                    {count} {severity}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Recomendações</p>
                <p className="text-3xl font-bold">{analysis.recommendations.length}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['high', 'medium', 'low'].map(priority => {
                const count = analysis.recommendations.filter(r => r.priority === priority).length;
                if (count === 0) return null;
                return (
                  <Badge key={priority} variant="outline">
                    {count} {priority}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Análise */}
      <Tabs defaultValue="bottlenecks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bottlenecks">Gargalos</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
        </TabsList>

        {/* Tab: Gargalos */}
        <TabsContent value="bottlenecks" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-4 h-4" />
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as severidades</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredBottlenecks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium">Nenhum gargalo detectado</p>
                <p className="text-muted-foreground">O sistema está funcionando bem!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredBottlenecks.map((bottleneck, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <AlertTriangle className={`w-5 h-5 mt-1 ${
                        bottleneck.severity === 'critical' ? 'text-red-500' :
                        bottleneck.severity === 'high' ? 'text-orange-500' :
                        bottleneck.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{bottleneck.description}</h4>
                          <Badge variant={
                            bottleneck.severity === 'critical' ? 'destructive' :
                            bottleneck.severity === 'high' ? 'secondary' : 'outline'
                          }>
                            {bottleneck.severity}
                          </Badge>
                          <Badge variant="outline">
                            +{bottleneck.estimatedGain}% ganho
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {bottleneck.impact}
                        </p>
                        
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm">
                            <strong>Solução:</strong> {bottleneck.solution}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Recomendações */}
        <TabsContent value="recommendations" className="space-y-4">
          {analysis.recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium">Nenhuma recomendação disponível</p>
                <p className="text-muted-foreground">O sistema está otimizado!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Lightbulb className={`w-5 h-5 mt-1 ${
                        rec.priority === 'high' ? 'text-orange-500' :
                        rec.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 'outline'}>
                            {rec.priority}
                          </Badge>
                          <Badge variant="secondary">
                            {rec.effort}
                          </Badge>
                          <Badge variant="outline">
                            {rec.impact}% impacto
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {rec.description}
                        </p>
                        
                        <div className="bg-muted p-3 rounded-lg mb-3">
                          <p className="text-sm">
                            <strong>Implementação:</strong> {rec.implementation}
                          </p>
                        </div>
                        
                        <Button 
                          onClick={() => applyRecommendation(rec)}
                          size="sm"
                          variant="outline"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Aplicar Recomendação
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Tendências */}
        <TabsContent value="trends" className="space-y-4">
          {analysis.trends.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <LineChart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Dados insuficientes</p>
                <p className="text-muted-foreground">Aguarde mais ciclos de análise para ver tendências</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.trends.map((trend, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {trend.direction === 'improving' ? (
                        <TrendingUp className="w-8 h-8 text-green-500" />
                      ) : trend.direction === 'degrading' ? (
                        <TrendingDown className="w-8 h-8 text-red-500" />
                      ) : (
                        <Activity className="w-8 h-8 text-gray-500" />
                      )}
                      
                      <div>
                        <h4 className="font-medium">{trend.metric}</h4>
                        <p className="text-sm text-muted-foreground">{trend.period}</p>
                      </div>
                      
                      <div className="ml-auto text-right">
                        <p className={`text-lg font-bold ${
                          trend.direction === 'improving' ? 'text-green-600' :
                          trend.direction === 'degrading' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                        </p>
                        <Badge variant={
                          trend.direction === 'improving' ? 'default' :
                          trend.direction === 'degrading' ? 'destructive' : 'secondary'
                        }>
                          {trend.direction}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Predições */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="space-y-3">
            {analysis.predictions.map((pred, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Target className="w-5 h-5 mt-1 text-purple-500" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{pred.metric}</h4>
                        <Badge variant="outline">{pred.timeframe}</Badge>
                        <Badge variant="secondary">
                          {Math.round(pred.confidence * 100)}% confiança
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Valor Atual</p>
                          <p className="text-lg font-bold">{pred.currentValue.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Valor Previsto</p>
                          <p className={`text-lg font-bold ${
                            pred.predictedValue > pred.currentValue ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {pred.predictedValue.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>Análise:</strong> {pred.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PerformanceAnalyzer;