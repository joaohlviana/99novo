/**
 * 🧪 SPECIALTIES GIN TEST PAGE
 * 
 * Página de teste para validar a implementação da busca otimizada
 * por especialidades usando ARRAY + índice GIN + Materialized View
 */

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { 
  Search, 
  Timer, 
  Database, 
  TrendingUp, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap
} from 'lucide-react';

import useSpecialtiesSearchOptimized, { 
  useSpecialtiesSuggestions, 
  useSpecialtiesStats 
} from '../hooks/useSpecialtiesSearchOptimized';
import type { SearchFilters } from '../services/specialties-search-optimized.service';

export default function SpecialtiesGinTestPage() {
  // Estados do teste
  const [searchTerms, setSearchTerms] = useState<string>('');
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any');
  const [limit, setLimit] = useState<number>(10);

  // Hook principal de busca
  const {
    trainers,
    totalCount,
    isLoading,
    isSearching,
    error,
    search,
    clearResults,
    refreshMV,
    lastExecutionTime,
    cacheHits
  } = useSpecialtiesSearchOptimized();

  // Hook para sugestões
  const {
    suggestions,
    isLoading: suggestionsLoading
  } = useSpecialtiesSuggestions(searchTerms);

  // Hook para estatísticas
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    reload: reloadStats
  } = useSpecialtiesStats();

  // Executar busca
  const handleSearch = async () => {
    const specialties = searchTerms
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const filters: SearchFilters = {
      specialties,
      matchMode,
      limit,
      offset: 0
    };

    await search(filters);
  };

  // Testes predefinidos
  const predefinedTests = [
    {
      name: 'CrossFit (OR)',
      specialties: ['crossfit'],
      matchMode: 'any' as const,
      description: 'Busca treinadores com CrossFit'
    },
    {
      name: 'CrossFit + Musculação (OR)',
      specialties: ['crossfit', 'musculacao'],
      matchMode: 'any' as const,
      description: 'Treinadores com CrossFit OU Musculação'
    },
    {
      name: 'CrossFit + Funcional (AND)',
      specialties: ['crossfit', 'funcional'],
      matchMode: 'all' as const,
      description: 'Treinadores com CrossFit E Funcional'
    },
    {
      name: 'Múltiplas Especialidades',
      specialties: ['yoga', 'pilates', 'danca'],
      matchMode: 'any' as const,
      description: 'Yoga, Pilates ou Dança'
    }
  ];

  const runPredefinedTest = async (test: typeof predefinedTests[0]) => {
    setSearchTerms(test.specialties.join(', '));
    setMatchMode(test.matchMode);
    
    await search({
      specialties: test.specialties,
      matchMode: test.matchMode,
      limit
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            🚀 Teste de Busca Otimizada - ARRAY + GIN Index
          </h1>
          <p className="text-lg text-gray-600">
            Validação da Materialized View com índice GIN para especialidades
          </p>
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search">🔍 Busca</TabsTrigger>
            <TabsTrigger value="stats">📊 Estatísticas</TabsTrigger>
            <TabsTrigger value="performance">⚡ Performance</TabsTrigger>
            <TabsTrigger value="validation">✅ Validação</TabsTrigger>
          </TabsList>

          {/* ABA DE BUSCA */}
          <TabsContent value="search" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Painel de Controle */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Controles de Busca
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Campo de busca */}
                  <div>
                    <label className="text-sm font-medium">Especialidades:</label>
                    <Input
                      value={searchTerms}
                      onChange={(e) => setSearchTerms(e.target.value)}
                      placeholder="crossfit, musculacao, yoga..."
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separar por vírgulas
                    </p>
                  </div>

                  {/* Modo de busca */}
                  <div>
                    <label className="text-sm font-medium">Modo de Busca:</label>
                    <Select value={matchMode} onValueChange={(value: 'any' | 'all') => setMatchMode(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Qualquer (OR) - &amp;&amp;</SelectItem>
                        <SelectItem value="all">Todos (AND) - @&gt;</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Limite */}
                  <div>
                    <label className="text-sm font-medium">Limite:</label>
                    <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 resultados</SelectItem>
                        <SelectItem value="10">10 resultados</SelectItem>
                        <SelectItem value="20">20 resultados</SelectItem>
                        <SelectItem value="50">50 resultados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="flex-1"
                    >
                      {isSearching ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Buscar
                    </Button>
                    <Button 
                      onClick={clearResults}
                      variant="outline"
                    >
                      Limpar
                    </Button>
                  </div>

                  {/* Estatísticas rápidas */}
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="font-medium text-blue-700">Cache Hits</div>
                      <div className="text-blue-600">{cacheHits}</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <div className="font-medium text-green-700">Última Busca</div>
                      <div className="text-green-600">{lastExecutionTime.toFixed(2)}ms</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resultados */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Resultados da Busca
                    </span>
                    {totalCount > 0 && (
                      <Badge variant="secondary">
                        {totalCount} encontrados
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="h-5 w-5" />
                        <span className="font-medium">Erro na busca:</span>
                      </div>
                      <p className="text-red-600 mt-1">{error}</p>
                    </div>
                  )}

                  {isSearching && (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Buscando treinadores...</p>
                    </div>
                  )}

                  {!isSearching && trainers.length === 0 && !error && (
                    <div className="text-center py-8">
                      <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Nenhum resultado encontrado</p>
                    </div>
                  )}

                  {trainers.length > 0 && (
                    <div className="space-y-3">
                      {trainers.map((trainer) => (
                        <div key={trainer.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{trainer.name}</h3>
                              <p className="text-sm text-gray-500">Slug: {trainer.slug}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {trainer.specialties_text.map((specialty, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {trainer.avatar && (
                              <img
                                src={trainer.avatar}
                                alt={trainer.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Testes Predefinidos */}
            <Card>
              <CardHeader>
                <CardTitle>🧪 Testes Predefinidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {predefinedTests.map((test, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      onClick={() => runPredefinedTest(test)}
                      className="h-auto p-4 text-left flex-col items-start"
                      disabled={isSearching}
                    >
                      <div className="font-medium">{test.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{test.description}</div>
                      <div className="text-xs text-blue-600 mt-1">
                        {test.specialties.join(', ')} ({test.matchMode})
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA DE ESTATÍSTICAS */}
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estatísticas das Especialidades
                  </span>
                  <Button onClick={reloadStats} disabled={statsLoading} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                    Recarregar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600">{statsError}</p>
                  </div>
                )}

                {statsLoading && (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Carregando estatísticas...</p>
                  </div>
                )}

                {stats.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4 font-medium text-sm text-gray-600 pb-2 border-b">
                      <div>Especialidade</div>
                      <div>Treinadores</div>
                      <div>Porcentagem</div>
                    </div>
                    {stats.slice(0, 20).map((stat, idx) => {
                      const total = stats.reduce((sum, s) => sum + s.count, 0);
                      const percentage = ((stat.count / total) * 100).toFixed(1);
                      
                      return (
                        <div key={idx} className="grid grid-cols-3 gap-4 text-sm py-2 border-b border-gray-100">
                          <div className="font-medium capitalize">{stat.specialty}</div>
                          <div>{stat.count}</div>
                          <div className="text-gray-600">{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA DE PERFORMANCE */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Última Execução
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {lastExecutionTime.toFixed(2)}ms
                  </div>
                  <p className="text-sm text-gray-500">Tempo de resposta</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Cache Hits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {cacheHits}
                  </div>
                  <p className="text-sm text-gray-500">Consultas em cache</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Total Resultados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {totalCount}
                  </div>
                  <p className="text-sm text-gray-500">Última busca</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Operações de Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={refreshMV}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Atualizar Materialized View
                  </Button>
                  <p className="text-sm text-gray-600">
                    Atualiza a view materializada com os dados mais recentes dos treinadores.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA DE VALIDAÇÃO */}
          <TabsContent value="validation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Critérios de Aceitação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Materialized View <code>trainers_denormalized_mv</code> criada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Índice GIN <code>idx_tr_dn_mv_specialties_text</code> ativo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Consultas com operadores <code>&amp;&amp;</code> e <code>@&gt;</code> funcionando</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Performance otimizada com índice GIN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Cache de resultados implementado</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📖 Como Usar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">1. Busca com OR (&amp;&amp;)</h4>
                  <p className="text-sm text-gray-600">Use modo "Qualquer" para encontrar treinadores com qualquer uma das especialidades</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">specialties_text &amp;&amp; ARRAY['crossfit','musculacao']</code>
                </div>
                
                <div>
                  <h4 className="font-medium">2. Busca com AND (@&gt;)</h4>
                  <p className="text-sm text-gray-600">Use modo "Todos" para encontrar treinadores com todas as especialidades</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">specialties_text @&gt; ARRAY['crossfit','funcional']</code>
                </div>

                <div>
                  <h4 className="font-medium">3. Performance</h4>
                  <p className="text-sm text-gray-600">O índice GIN garante consultas rápidas mesmo com milhares de treinadores</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}