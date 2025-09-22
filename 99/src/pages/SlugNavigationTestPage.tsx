/**
 * 🧪 SLUG NAVIGATION TEST PAGE
 * 
 * Página para testar o sistema completo de navegação por slugs
 * - Telemetria
 * - Resolução de identificadores
 * - Validação
 * - Redirecionamentos
 */

import React, { useState } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { identifierResolverService } from '../services/identifier-resolver.service';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { AlertCircle, CheckCircle, Activity, Navigation } from 'lucide-react';

function SlugNavigationTestPage() {
  const navigation = useNavigation();
  const [testIdentifier, setTestIdentifier] = useState('');
  const [resolveResult, setResolveResult] = useState<any>(null);
  const [isResolving, setIsResolving] = useState(false);

  // Casos de teste predefinidos
  const testCases = [
    { id: 'ana-souza', label: 'Slug válido', type: 'success' },
    { id: 'joao-silva', label: 'Slug válido', type: 'success' },
    { id: '550e8400-e29b-41d4-a716-446655440000', label: 'UUID válido', type: 'warning' },
    { id: 'trainer-undefined', label: 'Slug com undefined', type: 'error' },
    { id: '', label: 'Identificador vazio', type: 'error' },
    { id: 'slug-inexistente-teste', label: 'Slug inexistente', type: 'error' },
  ];

  const testNavigation = (identifier: string) => {
    console.log('🧪 Testando navegação para:', identifier);
    navigation.navigateToTrainer(identifier);
  };

  const testResolve = async (identifier: string) => {
    setIsResolving(true);
    setResolveResult(null);

    try {
      const result = await identifierResolverService.resolveTrainer(identifier);
      setResolveResult(result);
      console.log('🔍 Resultado da resolução:', result);
    } catch (error) {
      setResolveResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsResolving(false);
    }
  };

  const telemetryMetrics = navigation.getTelemetryMetrics();
  const telemetryEvents = navigation.getTelemetryEvents();

  const clearTelemetry = () => {
    navigation.clearTelemetry();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Teste de Navegação por Slugs
          </h1>
          <p className="text-gray-600">
            Teste o sistema de resolução de identificadores e navegação
          </p>
        </div>

        {/* Teste Manual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Teste Manual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite um slug ou UUID para testar"
                value={testIdentifier}
                onChange={(e) => setTestIdentifier(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => testResolve(testIdentifier)}
                disabled={isResolving || !testIdentifier}
                variant="outline"
              >
                {isResolving ? 'Resolvendo...' : 'Resolver'}
              </Button>
              <Button 
                onClick={() => testNavigation(testIdentifier)}
                disabled={!testIdentifier}
                className="bg-[#e0093e] text-white hover:bg-[#c40835]"
              >
                Navegar
              </Button>
            </div>

            {resolveResult && (
              <div className={`p-4 rounded-md ${
                resolveResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {resolveResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium">
                    {resolveResult.success ? 'Sucesso' : 'Erro'}
                  </span>
                </div>
                
                {resolveResult.success && (
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Nome:</strong> {resolveResult.trainer?.name}</p>
                    <p><strong>Slug:</strong> {resolveResult.trainer?.slug}</p>
                    <p><strong>Método:</strong> {resolveResult.resolveMethod}</p>
                    {resolveResult.needsRedirect && (
                      <p className="text-orange-600">
                        <strong>Redirecionamento:</strong> Para {resolveResult.redirectSlug}
                      </p>
                    )}
                  </div>
                )}
                
                {!resolveResult.success && (
                  <p className="text-sm text-red-600">
                    <strong>Erro:</strong> {resolveResult.error}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Casos de Teste Predefinidos */}
        <Card>
          <CardHeader>
            <CardTitle>Casos de Teste Predefinidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testCases.map((testCase, index) => (
                <div key={index} className="p-4 border rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {testCase.id || '(vazio)'}
                    </code>
                    <Badge 
                      variant={testCase.type === 'success' ? 'default' : 
                              testCase.type === 'warning' ? 'secondary' : 'destructive'}
                    >
                      {testCase.label}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testResolve(testCase.id)}
                    >
                      Resolver
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => testNavigation(testCase.id)}
                      className="bg-[#e0093e] text-white hover:bg-[#c40835]"
                    >
                      Navegar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Telemetria */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Métricas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Métricas de Telemetria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-md">
                  <div className="text-2xl font-bold text-blue-600">
                    {telemetryMetrics.totalResolves}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-md">
                  <div className="text-2xl font-bold text-green-600">
                    {telemetryMetrics.successRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Sucesso</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-md">
                  <div className="text-2xl font-bold text-yellow-600">
                    {telemetryMetrics.redirectCount}
                  </div>
                  <div className="text-sm text-gray-600">Redirects</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-md">
                  <div className="text-2xl font-bold text-red-600">
                    {telemetryMetrics.errorCount}
                  </div>
                  <div className="text-sm text-gray-600">Erros</div>
                </div>
              </div>
              
              <Button 
                onClick={clearTelemetry}
                variant="outline"
                className="w-full"
              >
                Limpar Telemetria
              </Button>
            </CardContent>
          </Card>

          {/* Eventos Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {telemetryEvents.slice(-10).reverse().map((event, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-md text-sm ${
                      event.success 
                        ? 'bg-green-50 border-l-4 border-green-400' 
                        : 'bg-red-50 border-l-4 border-red-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {event.event}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {event.method}
                      </Badge>
                    </div>
                    <div className="text-gray-600">
                      {event.identifier}
                    </div>
                    {event.error && (
                      <div className="text-red-600 mt-1 text-xs">
                        {event.error}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                
                {telemetryEvents.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Nenhum evento registrado ainda
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium text-gray-900">
                  Sistema de Slugs
                </div>
                <div className="text-sm text-gray-600">
                  ✅ Ativo
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium text-gray-900">
                  Resolução UUID → Slug
                </div>
                <div className="text-sm text-gray-600">
                  ✅ Implementado
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium text-gray-900">
                  Telemetria
                </div>
                <div className="text-sm text-gray-600">
                  ✅ Funcionando
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">URLs de Teste</h4>
              <div className="space-y-1 text-sm">
                <div>• <code>/trainer/ana-souza</code> - Slug válido</div>
                <div>• <code>/trainer/joao-silva</code> - Slug válido</div>
                <div>• <code>/trainer/550e8400-e29b-41d4-a716-446655440000</code> - UUID (deve redirecionar)</div>
                <div>• <code>/trainer/undefined</code> - Deve mostrar erro</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SlugNavigationTestPage;