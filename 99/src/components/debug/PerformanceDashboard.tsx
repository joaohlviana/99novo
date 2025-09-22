import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAdvancedTelemetry } from '../../hooks/useAdvancedTelemetry';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Download, 
  Eye, 
  Gauge, 
  MemoryStick, 
  Monitor, 
  Network, 
  Smartphone, 
  Target, 
  TrendingUp, 
  Users, 
  Wifi, 
  Zap 
} from 'lucide-react';

interface PerformanceDashboardProps {
  componentName?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// 🚀 FASE 5: Dashboard avançado de monitoramento de performance
export function PerformanceDashboard({ 
  componentName = 'TrainersCatalog',
  autoRefresh = true,
  refreshInterval = 5000 
}: PerformanceDashboardProps) {
  const telemetry = useAdvancedTelemetry(`Dashboard_${componentName}`);
  const [isExpanded, setIsExpanded] = useState(false);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // 📊 Auto-refresh dos dados
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const snapshot = telemetry.exportMetrics();
      setHistoricalData(prev => [...prev.slice(-19), snapshot]); // Manter últimos 20 pontos
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, telemetry]);

  // 🎯 Métricas em tempo real
  const realTimeData = useMemo(() => {
    return {
      score: telemetry.performanceScore,
      renderTime: telemetry.metrics.renderTime,
      memoryUsage: telemetry.metrics.memoryUsage,
      renderCount: telemetry.componentMetrics.renderCount,
      sessionDuration: telemetry.userBehavior.sessionDuration,
      deviceType: telemetry.userBehavior.deviceType,
      connectionSpeed: telemetry.userBehavior.connectionSpeed,
      networkStatus: telemetry.systemHealth.networkStatus,
      batteryLevel: telemetry.systemHealth.batteryLevel
    };
  }, [telemetry]);

  // 🚨 Alertas ativos
  const activeAlerts = telemetry.getAlerts();

  // 📈 Tendências
  const trends = useMemo(() => {
    if (historicalData.length < 2) return null;

    const recent = historicalData.slice(-5);
    const avgScore = recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
    const avgRender = recent.reduce((sum, item) => sum + item.performance.renderTime, 0) / recent.length;
    const avgMemory = recent.reduce((sum, item) => sum + item.performance.memoryUsage, 0) / recent.length;

    return {
      scoreImproving: avgScore > (historicalData[historicalData.length - 6]?.score || 0),
      renderTimeImproving: avgRender < (historicalData[historicalData.length - 6]?.performance.renderTime || Infinity),
      memoryImproving: avgMemory < (historicalData[historicalData.length - 6]?.performance.memoryUsage || Infinity)
    };
  }, [historicalData]);

  // 🎨 Status de saúde geral
  const getHealthStatus = () => {
    if (realTimeData.score >= 90) return { label: 'Excelente', color: 'bg-green-500', icon: CheckCircle };
    if (realTimeData.score >= 70) return { label: 'Bom', color: 'bg-blue-500', icon: Target };
    if (realTimeData.score >= 50) return { label: 'Regular', color: 'bg-yellow-500', icon: AlertTriangle };
    return { label: 'Crítico', color: 'bg-red-500', icon: AlertTriangle };
  };

  const healthStatus = getHealthStatus();

  // 📱 Componente compacto
  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-64 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <healthStatus.icon className={`w-4 h-4 text-white`} />
                <span className="text-sm font-medium">Performance</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="h-6 w-6 p-0"
              >
                <Eye className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${healthStatus.color}`} />
              <span className="text-xs text-muted-foreground">{healthStatus.label}</span>
              <Badge variant="outline" className="text-xs">
                {realTimeData.score}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Render:</span>
                <span className={realTimeData.renderTime > 100 ? 'text-red-500' : 'text-green-500'}>
                  {realTimeData.renderTime.toFixed(1)}ms
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Memória:</span>
                <span className={realTimeData.memoryUsage > 70 ? 'text-red-500' : 'text-green-500'}>
                  {realTimeData.memoryUsage.toFixed(1)}%
                </span>
              </div>
            </div>

            {activeAlerts.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600">
                    {activeAlerts.length} alerta{activeAlerts.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 📊 Dashboard expandido
  return (
    <div className="fixed inset-4 z-50 bg-background/95 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden">
      <Card className="h-full">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Performance Dashboard - {componentName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={telemetry.isHealthy ? 'default' : 'destructive'}>
                Score: {realTimeData.score}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 h-full overflow-auto">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="user">Usuário</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
            </TabsList>

            {/* 🎯 Tab: Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score Principal */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${healthStatus.color}`}>
                        <healthStatus.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Performance Score</p>
                        <p className={`text-2xl font-bold ${telemetry.getScoreColor(realTimeData.score)}`}>
                          {realTimeData.score}
                        </p>
                      </div>
                    </div>
                    <Progress value={realTimeData.score} className="mt-3" />
                  </CardContent>
                </Card>

                {/* Render Time */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-500">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Render Time</p>
                        <p className="text-2xl font-bold">
                          {realTimeData.renderTime.toFixed(1)}ms
                        </p>
                      </div>
                    </div>
                    {trends?.renderTimeImproving && (
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Melhorando</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Memory Usage */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-500">
                        <MemoryStick className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Uso de Memória</p>
                        <p className="text-2xl font-bold">
                          {realTimeData.memoryUsage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <Progress value={realTimeData.memoryUsage} className="mt-3" />
                  </CardContent>
                </Card>
              </div>

              {/* Métricas do Componente */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-3 text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                    <p className="text-sm text-muted-foreground">Re-renders</p>
                    <p className="text-xl font-bold">{realTimeData.renderCount}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm text-muted-foreground">Sessão</p>
                    <p className="text-xl font-bold">{Math.floor(realTimeData.sessionDuration / 60)}m</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 text-center">
                    {realTimeData.deviceType === 'mobile' ? <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-500" /> : <Monitor className="w-8 h-8 mx-auto mb-2 text-blue-500" />}
                    <p className="text-sm text-muted-foreground">Dispositivo</p>
                    <p className="text-lg font-bold capitalize">{realTimeData.deviceType}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 text-center">
                    <Wifi className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-muted-foreground">Conexão</p>
                    <p className="text-lg font-bold capitalize">{realTimeData.connectionSpeed}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 🔧 Tab: Performance */}
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Métricas de Renderização</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Tempo de Render</span>
                        <span className="text-sm font-medium">{realTimeData.renderTime.toFixed(2)}ms</span>
                      </div>
                      <Progress value={Math.min(realTimeData.renderTime, 200) / 2} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Re-renders</span>
                        <span className="text-sm font-medium">{realTimeData.renderCount}</span>
                      </div>
                      <Progress value={Math.min(realTimeData.renderCount, 100)} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recursos do Sistema</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Uso de Memória</span>
                        <span className="text-sm font-medium">{realTimeData.memoryUsage.toFixed(1)}%</span>
                      </div>
                      <Progress value={realTimeData.memoryUsage} />
                    </div>
                    
                    {realTimeData.batteryLevel && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Bateria</span>
                          <span className="text-sm font-medium">{realTimeData.batteryLevel}%</span>
                        </div>
                        <Progress value={realTimeData.batteryLevel} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Histórico de Performance */}
              {historicalData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tendência de Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 flex items-end gap-1">
                      {historicalData.slice(-20).map((point, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-blue-500 rounded-t"
                          style={{ height: `${(point.score / 100) * 100}%` }}
                          title={`Score: ${point.score} (${new Date(point.timestamp).toLocaleTimeString()})`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 👤 Tab: Usuário */}
            <TabsContent value="user" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de Dispositivo</p>
                        <p className="text-lg font-bold capitalize">{realTimeData.deviceType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Network className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Velocidade da Conexão</p>
                        <p className="text-lg font-bold capitalize">{realTimeData.connectionSpeed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-8 h-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duração da Sessão</p>
                        <p className="text-lg font-bold">{Math.floor(realTimeData.sessionDuration / 60)}min {realTimeData.sessionDuration % 60}s</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 💻 Tab: Sistema */}
            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Status da Rede</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        realTimeData.networkStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="capitalize">{realTimeData.networkStatus}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pressão de Memória</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={
                      telemetry.systemHealth.memoryPressure === 'low' ? 'default' :
                      telemetry.systemHealth.memoryPressure === 'medium' ? 'secondary' : 'destructive'
                    }>
                      {telemetry.systemHealth.memoryPressure}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 🚨 Tab: Alertas */}
            <TabsContent value="alerts" className="space-y-4">
              {activeAlerts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-medium">Nenhum alerta ativo</p>
                    <p className="text-muted-foreground">Todos os sistemas estão funcionando normalmente</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((alert, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`w-5 h-5 ${
                            alert.type === 'error' ? 'text-red-500' :
                            alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">{alert.value}</p>
                          </div>
                          <Badge variant={
                            alert.type === 'error' ? 'destructive' :
                            alert.type === 'warning' ? 'secondary' : 'default'
                          }>
                            {alert.type}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default PerformanceDashboard;