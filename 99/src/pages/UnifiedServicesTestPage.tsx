/**
 * 🚀 PÁGINA DE TESTE DOS SERVIÇOS UNIFICADOS
 * 
 * Testa os hooks React e serviços TypeScript que consomem
 * as funções SQL corrigidas e o sistema unificado.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Users, 
  BookOpen, 
  TrendingUp,
  Play
} from 'lucide-react';

// Importar hooks e serviços
import { 
  useProgramCards, 
  useTrainerCards, 
  useFeaturedPrograms,
  useUnifiedSearch,
  usePlatformStats 
} from '../hooks/useUnifiedPlatform';
import { unifiedPlatformService } from '../services/unified-platform.service';

interface TestResult {
  name: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  data?: any;
  duration?: number;
}

export default function UnifiedServicesTestPage() {
  const [activeTests, setActiveTests] = useState<Record<string, TestResult>>({});
  const [searchQuery, setSearchQuery] = useState('musculacao');
  const [searchFilters, setSearchFilters] = useState({
    specialties: ['musculacao'],
    cities: ['São Paulo'],
    difficulty: 'beginner'
  });

  // Hooks para teste automático
  const {
    programs: hookPrograms,
    loading: programsLoading,
    error: programsError,
    searchPrograms: refetchPrograms
  } = useProgramCards({
    specialties: ['musculacao'],
    limit: 5
  });

  const {
    trainers: hookTrainers,
    loading: trainersLoading,
    error: trainersError
  } = useTrainerCards({
    specialties: ['musculacao'],
    limit: 5
  });

  const {
    data: featuredPrograms,
    isLoading: featuredLoading,
    error: featuredError
  } = useFeaturedPrograms(6);

  const {
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    search
  } = useUnifiedSearch();

  const {
    data: platformStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = usePlatformStats();

  const runServiceTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    
    setActiveTests(prev => ({
      ...prev,
      [testName]: { name: testName, status: 'loading', message: 'Executando...' }
    }));

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      setActiveTests(prev => ({
        ...prev,
        [testName]: {
          name: testName,
          status: 'success',
          message: `Sucesso! ${Array.isArray(result) ? result.length : 'Dados'} retornado(s)`,
          data: result,
          duration
        }
      }));
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      setActiveTests(prev => ({
        ...prev,
        [testName]: {
          name: testName,
          status: 'error',
          message: error.message || 'Erro desconhecido',
          data: error,
          duration
        }
      }));
    }
  };

  const testDirectServices = async () => {
    await Promise.all([
      runServiceTest('Buscar Program Cards', () => 
        unifiedPlatformService.getProgramCards({
          specialties: ['musculacao'],
          limit: 5
        })
      ),
      runServiceTest('Buscar Trainer Cards', () => 
        unifiedPlatformService.getTrainerCards({
          specialties: ['musculacao'],
          limit: 5
        })
      ),
      runServiceTest('Buscar Featured Programs', () => 
        unifiedPlatformService.getFeaturedPrograms(6)
      ),
      runServiceTest('Buscar Platform Stats', () => 
        unifiedPlatformService.getPlatformStats()
      )
    ]);
  };

  const testUnifiedSearch = async () => {
    await runServiceTest('Busca Unificada', () => 
      unifiedPlatformService.unifiedSearch(searchQuery, {
        specialties: searchFilters.specialties,
        cities: searchFilters.cities,
        difficulty: searchFilters.difficulty,
        limit: 10
      })
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'loading':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-200" />;
    }
  };

  useEffect(() => {
    // Executar busca automaticamente quando os filtros mudarem
    if (searchQuery) {
      search(searchQuery, {
        specialties: searchFilters.specialties,
        cities: searchFilters.cities,
        difficulty: searchFilters.difficulty
      });
    }
  }, [searchQuery, searchFilters]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">🚀 Teste dos Serviços Unificados</h1>
        <p className="text-muted-foreground">
          Validando hooks React e serviços TypeScript do sistema unificado
        </p>
      </div>

      <Tabs defaultValue="hooks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hooks">Hooks React</TabsTrigger>
          <TabsTrigger value="services">Serviços Diretos</TabsTrigger>
          <TabsTrigger value="search">Busca Unificada</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Hooks React Tab */}
        <TabsContent value="hooks" className="space-y-6">
          <div className="grid gap-6">
            {/* Program Cards Hook */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  useProgramCards Hook
                  {getStatusIcon(programsLoading ? 'loading' : programsError ? 'error' : 'success')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Status: {programsLoading ? 'Loading' : programsError ? 'Error' : 'Success'}
                    </Badge>
                    <Badge variant="secondary">
                      Programas: {hookPrograms?.length || 0}
                    </Badge>
                    <Button size="sm" onClick={() => refetchPrograms({ specialties: ['musculacao'], limit: 5 })} variant="outline">
                      Recarregar
                    </Button>
                  </div>
                  
                  {programsError && (
                    <div className="bg-red-50 p-3 rounded text-sm text-red-600">
                      Erro: {programsError.message}
                    </div>
                  )}
                  
                  {hookPrograms && hookPrograms.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Programas encontrados:</p>
                      <div className="grid gap-2">
                        {hookPrograms.slice(0, 3).map((program: any) => (
                          <div key={program.id} className="bg-gray-50 p-3 rounded text-sm">
                            <div className="font-medium">{program.title}</div>
                            <div className="text-gray-600">
                              R$ {program.price_amount} • {program.trainer_name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trainer Cards Hook */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  useTrainerCards Hook
                  {getStatusIcon(trainersLoading ? 'loading' : trainersError ? 'error' : 'success')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Status: {trainersLoading ? 'Loading' : trainersError ? 'Error' : 'Success'}
                    </Badge>
                    <Badge variant="secondary">
                      Treinadores: {hookTrainers?.length || 0}
                    </Badge>
                  </div>
                  
                  {trainersError && (
                    <div className="bg-red-50 p-3 rounded text-sm text-red-600">
                      Erro: {trainersError.message}
                    </div>
                  )}
                  
                  {hookTrainers && hookTrainers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Treinadores encontrados:</p>
                      <div className="grid gap-2">
                        {hookTrainers.slice(0, 3).map((trainer: any) => (
                          <div key={trainer.id} className="bg-gray-50 p-3 rounded text-sm">
                            <div className="font-medium">{trainer.name}</div>
                            <div className="text-gray-600">
                              {trainer.location?.city} • {trainer.stats?.total_programs || 0} programas
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Featured Programs Hook */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  useFeaturedPrograms Hook
                  {getStatusIcon(featuredLoading ? 'loading' : featuredError ? 'error' : 'success')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Status: {featuredLoading ? 'Loading' : featuredError ? 'Error' : 'Success'}
                    </Badge>
                    <Badge variant="secondary">
                      Featured: {featuredPrograms?.length || 0}
                    </Badge>
                  </div>
                  
                  {featuredError && (
                    <div className="bg-red-50 p-3 rounded text-sm text-red-600">
                      Erro: {featuredError.message}
                    </div>
                  )}
                  
                  {featuredPrograms && featuredPrograms.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Programas em destaque:</p>
                      <div className="grid gap-2">
                        {featuredPrograms.slice(0, 3).map((program: any) => (
                          <div key={program.id} className="bg-gray-50 p-3 rounded text-sm">
                            <div className="font-medium">{program.title}</div>
                            <div className="text-gray-600">
                              R$ {program.price_amount} • ⭐ {program.avg_rating || 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Serviços Diretos Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="flex justify-center">
            <Button onClick={testDirectServices} className="px-8 py-2">
              <Play className="w-4 h-4 mr-2" />
              Testar Todos os Serviços
            </Button>
          </div>

          <div className="grid gap-4">
            {Object.values(activeTests).map((test) => (
              <Card key={test.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      {test.name}
                    </div>
                    {test.duration && (
                      <Badge variant="outline">{test.duration}ms</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{test.message}</p>
                  {test.data && test.status === 'success' && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium">
                        Ver dados retornados
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Busca Unificada Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Busca Unificada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Query</label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ex: musculacao, yoga..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Especialidades</label>
                  <Input
                    value={searchFilters.specialties.join(', ')}
                    onChange={(e) => setSearchFilters(prev => ({
                      ...prev,
                      specialties: e.target.value.split(', ').filter(Boolean)
                    }))}
                    placeholder="musculacao, yoga..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cidades</label>
                  <Input
                    value={searchFilters.cities.join(', ')}
                    onChange={(e) => setSearchFilters(prev => ({
                      ...prev,
                      cities: e.target.value.split(', ').filter(Boolean)
                    }))}
                    placeholder="São Paulo, Rio..."
                  />
                </div>
              </div>

              <Button onClick={testUnifiedSearch} className="w-full">
                Executar Busca Unificada
              </Button>

              {/* Resultados da busca */}
              {searchLoading && (
                <div className="text-center py-4">
                  <Clock className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p>Executando busca...</p>
                </div>
              )}

              {searchError && (
                <div className="bg-red-50 p-4 rounded text-red-600">
                  Erro: {searchError.message}
                </div>
              )}

              {searchResults && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Programas */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Programas ({searchResults.programs?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {searchResults.programs?.slice(0, 3).map((program: any) => (
                          <div key={program.id} className="bg-gray-50 p-2 rounded text-xs mb-2">
                            <div className="font-medium">{program.title}</div>
                            <div className="text-gray-600">R$ {program.price_amount}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Treinadores */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Treinadores ({searchResults.trainers?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {searchResults.trainers?.slice(0, 3).map((trainer: any) => (
                          <div key={trainer.id} className="bg-gray-50 p-2 rounded text-xs mb-2">
                            <div className="font-medium">{trainer.name}</div>
                            <div className="text-gray-600">{trainer.location?.city}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estatísticas Tab */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Estatísticas da Plataforma
                  {getStatusIcon(statsLoading ? 'loading' : statsError ? 'error' : 'success')}
                </div>
                <Button size="sm" onClick={refetchStats} variant="outline">
                  Atualizar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading && (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Carregando estatísticas...</p>
                </div>
              )}

              {statsError && (
                <div className="bg-red-50 p-4 rounded text-red-600">
                  Erro: {statsError.message}
                </div>
              )}

              {platformStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {platformStats.totalPrograms}
                    </div>
                    <div className="text-sm text-blue-600">Programas</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {platformStats.totalTrainers}
                    </div>
                    <div className="text-sm text-green-600">Treinadores</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {platformStats.totalClients}
                    </div>
                    <div className="text-sm text-purple-600">Clientes</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded">
                    <div className="text-2xl font-bold text-yellow-600">
                      {platformStats.avgRating}
                    </div>
                    <div className="text-sm text-yellow-600">Avaliação Média</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}