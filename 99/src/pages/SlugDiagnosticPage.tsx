/**
 * 🔍 PÁGINA DE DIAGNÓSTICO DE SLUGS
 * 
 * Dashboard para monitorar a implementação do sistema de slugs
 * e diagnosticar problemas de navegação.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { AlertCircle, CheckCircle, TrendingUp, BarChart3, RefreshCw, Download } from 'lucide-react';
import { useTelemetry, SlugEvents } from '../utils/telemetry';
import { trainerProfileService } from '../services/trainer-profile.service';

export default function SlugDiagnosticPage() {
  const { getMetrics, getSessionSummary, exportEvents, clear } = useTelemetry();
  const [metrics, setMetrics] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [trainersStatus, setTrainersStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    setLoading(true);
    
    try {
      // Métricas de telemetria
      const telemetryMetrics = getMetrics();
      const sessionData = getSessionSummary();
      
      setMetrics(telemetryMetrics);
      setSessionSummary(sessionData);

      // Status dos trainers no banco
      try {
        const trainerCards = await trainerProfileService.getTrainerCards({ limit: 100 });
        const status = {
          total: trainerCards.length,
          withSlug: trainerCards.filter(t => t.slug).length,
          withoutSlug: trainerCards.filter(t => !t.slug).length,
          invalidSlugs: trainerCards.filter(t => t.slug?.includes('undefined')).length,
          coverage: trainerCards.length > 0 ? ((trainerCards.filter(t => t.slug).length / trainerCards.length) * 100).toFixed(1) + '%' : '0%',
          examples: trainerCards.slice(0, 5).map(t => ({ id: t.id, name: t.name, slug: t.slug }))
        };
        setTrainersStatus(status);
      } catch (error) {
        console.error('Erro ao carregar status dos trainers:', error);
        setTrainersStatus({
          total: 0,
          withSlug: 0,
          withoutSlug: 0,
          invalidSlugs: 0,
          coverage: '0%',
          examples: [],
          error: error.message
        });
      }
    } catch (error) {
      console.error('Erro ao carregar diagnósticos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportEvents = () => {
    const data = exportEvents();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slug-telemetry-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (value: number, total: number) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    if (percentage === 0) return 'text-green-600';
    if (percentage < 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (value: number, total: number) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    if (percentage === 0) return <Badge className="bg-green-100 text-green-700">Excellent</Badge>;
    if (percentage < 1) return <Badge className="bg-yellow-100 text-yellow-700">Warning</Badge>;
    return <Badge className="bg-red-100 text-red-700">Critical</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Carregando diagnósticos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Diagnóstico de Slugs</h1>
          <p className="text-gray-600">Monitoramento do sistema de URLs amigáveis para treinadores</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadDiagnostics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleExportEvents} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => { clear(); loadDiagnostics(); }} variant="outline">
            Clear Events
          </Button>
        </div>
      </div>
      
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className="text-3xl font-bold text-green-600">{metrics?.successRate || '0%'}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cliques Totais</p>
                <p className="text-3xl font-bold text-blue-600">{metrics?.totalClicks || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Erros de Slug</p>
                <p className={`text-3xl font-bold ${getStatusColor(metrics?.missingSlugErrors || 0, metrics?.totalClicks || 1)}`}>
                  {metrics?.missingSlugErrors || 0}
                </p>
              </div>
              <AlertCircle className={`h-8 w-8 ${metrics?.missingSlugErrors > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Redirects UUID</p>
                <p className="text-3xl font-bold text-purple-600">{metrics?.redirects || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Status dos Trainers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Status dos Trainers no Banco
              {trainersStatus && getStatusBadge(trainersStatus.withoutSlug, trainersStatus.total)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trainersStatus ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{trainersStatus.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Cobertura de Slugs</p>
                    <p className="text-2xl font-bold text-blue-600">{trainersStatus.coverage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Com Slug</p>
                    <p className="text-2xl font-bold text-green-600">{trainersStatus.withSlug}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Sem Slug</p>
                    <p className={`text-2xl font-bold ${getStatusColor(trainersStatus.withoutSlug, trainersStatus.total)}`}>
                      {trainersStatus.withoutSlug}
                    </p>
                  </div>
                </div>

                {trainersStatus.examples && trainersStatus.examples.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Exemplos de Slugs:</h4>
                    <div className="space-y-2">
                      {trainersStatus.examples.map((trainer, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium truncate mr-2">{trainer.name}</span>
                          <code className="text-xs bg-white px-2 py-1 rounded border">
                            {trainer.slug || 'sem-slug'}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trainersStatus.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Erro: {trainersStatus.error}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">Carregando status...</p>
            )}
          </CardContent>
        </Card>

        {/* Métricas de Navegação */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Navegação</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Navegações Bem-sucedidas</p>
                    <p className="text-xl font-bold text-green-600">{metrics.successfulNavigations}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Erros de Validação</p>
                    <p className="text-xl font-bold text-red-600">{metrics.validationErrors}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Detalhes dos Erros:</h4>
                  
                  {metrics.errorDetails.missingSlug.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Slugs Ausentes:</p>
                      <div className="space-y-1">
                        {metrics.errorDetails.missingSlug.slice(0, 3).map((error, index) => (
                          <div key={index} className="text-xs bg-red-50 px-2 py-1 rounded border">
                            {error.name} (ID: {error.trainerId?.slice(0, 8)}...)
                          </div>
                        ))}
                        {metrics.errorDetails.missingSlug.length > 3 && (
                          <p className="text-xs text-gray-500">+{metrics.errorDetails.missingSlug.length - 3} mais</p>
                        )}
                      </div>
                    </div>
                  )}

                  {metrics.errorDetails.validationErrors.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Erros de Validação:</p>
                      <div className="space-y-1">
                        {metrics.errorDetails.validationErrors.slice(0, 3).map((error, index) => (
                          <div key={index} className="text-xs bg-yellow-50 px-2 py-1 rounded border">
                            {error.type}: {error.slug}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Sessão e Eventos */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sessão Atual
              <Badge variant="outline">{sessionSummary?.sessionId?.slice(-8)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionSummary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Eventos</p>
                  <p className="text-2xl font-bold text-gray-900">{sessionSummary.totalEvents}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipos de Evento</p>
                  <p className="text-2xl font-bold text-gray-900">{sessionSummary.eventTypes}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duração da Sessão</p>
                  <p className="text-lg font-medium text-gray-900">
                    {sessionSummary.timespan ? 
                      `${Math.round((new Date(sessionSummary.timespan.end).getTime() - new Date(sessionSummary.timespan.start).getTime()) / 60000)}min` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {sessionSummary?.eventBreakdown && (
              <>
                <Separator className="my-6" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Breakdown de Eventos:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(sessionSummary.eventBreakdown).map(([event, count]) => (
                      <div key={event} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium truncate mr-2" title={event}>
                          {event.replace(/_/g, ' ')}
                        </span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Testes Rápidos */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Testes Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={async () => {
                  try {
                    const cards = await trainerProfileService.getTrainerCards({ limit: 5 });
                    console.log('🧪 Teste de cards:', cards);
                    alert(`Teste concluído: ${cards.length} cards retornados. Verifique o console.`);
                  } catch (error) {
                    console.error('Erro no teste:', error);
                    alert(`Erro no teste: ${error.message}`);
                  }
                }}
                variant="outline"
              >
                Testar TrainerCards Service
              </Button>
              
              <Button 
                onClick={async () => {
                  try {
                    const specific = await trainerProfileService.getBySlug('ana-souza-e0f255ab');
                    console.log('🧪 Teste de slug específico:', specific);
                    alert(specific ? 'Slug encontrado!' : 'Slug não encontrado');
                  } catch (error) {
                    console.error('Erro no teste de slug:', error);
                    alert(`Erro: ${error.message}`);
                  }
                }}
                variant="outline"
              >
                Testar Busca por Slug
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info */}
      <div className="mt-8 text-xs text-gray-500 text-center">
        <p>Sistema de Slugs v1.0 | Última atualização: {new Date().toLocaleString()}</p>
        <p>Para aplicar correções no banco, execute: <code>/scripts/slug-optimization-and-trigger.sql</code></p>
      </div>
    </div>
  );
}