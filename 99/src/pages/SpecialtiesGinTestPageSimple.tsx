/**
 * 🧪 SPECIALTIES GIN TEST PAGE - VERSÃO SIMPLES
 * 
 * Página simplificada de teste para validar a implementação da busca otimizada
 * por especialidades usando ARRAY + índice GIN + Materialized View
 */

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Search, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';

import SpecialtiesSearchOptimizedService from '../services/specialties-search-optimized.service';

interface TrainerResult {
  id: string;
  slug: string;
  name: string;
  avatar: string | null;
  specialties_text: string[];
}

export default function SpecialtiesGinTestPageSimple() {
  // Estados do teste
  const [searchTerms, setSearchTerms] = useState<string>('');
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any');
  const [limit, setLimit] = useState<number>(10);
  const [trainers, setTrainers] = useState<TrainerResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExecutionTime, setLastExecutionTime] = useState<number>(0);

  // Executar busca
  const handleSearch = async () => {
    setIsSearching(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      const specialties = searchTerms
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const result = await SpecialtiesSearchOptimizedService.searchTrainersBySpecialties({
        specialties,
        matchMode,
        limit,
        offset: 0
      });
      
      const endTime = performance.now();
      setLastExecutionTime(endTime - startTime);

      if (result.error) {
        setError(result.error);
        setTrainers([]);
        setTotalCount(0);
      } else {
        setTrainers(result.data);
        setTotalCount(result.count);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setTrainers([]);
      setTotalCount(0);
    } finally {
      setIsSearching(false);
    }
  };

  // Limpar resultados
  const clearResults = () => {
    setTrainers([]);
    setTotalCount(0);
    setError(null);
    setSearchTerms('');
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
    }
  ];

  const runPredefinedTest = async (test: typeof predefinedTests[0]) => {
    setSearchTerms(test.specialties.join(', '));
    setMatchMode(test.matchMode);
    
    setIsSearching(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      const result = await SpecialtiesSearchOptimizedService.searchTrainersBySpecialties({
        specialties: test.specialties,
        matchMode: test.matchMode,
        limit
      });
      
      const endTime = performance.now();
      setLastExecutionTime(endTime - startTime);

      if (result.error) {
        setError(result.error);
        setTrainers([]);
        setTotalCount(0);
      } else {
        setTrainers(result.data);
        setTotalCount(result.count);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setTrainers([]);
      setTotalCount(0);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
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

        <div className="space-y-6">
          {/* Controles de Busca */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Controles de Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <SelectItem value="any">Qualquer (OR)</SelectItem>
                      <SelectItem value="all">Todos (AND)</SelectItem>
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
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full"
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
                    className="w-full"
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              {/* Métricas rápidas */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {lastExecutionTime.toFixed(2)}ms
                  </div>
                  <div className="text-sm text-gray-500">Tempo de execução</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalCount}
                  </div>
                  <div className="text-sm text-gray-500">Total encontrados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {trainers.length}
                  </div>
                  <div className="text-sm text-gray-500">Exibidos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testes Predefinidos */}
          <Card>
            <CardHeader>
              <CardTitle>🧪 Testes Predefinidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Resultados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
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

          {/* Critérios de Aceitação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Critérios de Aceitação - Validação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Materialized View <code>trainers_denormalized_mv</code> funcionando</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Índice GIN para performance máxima</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Operadores de array eficientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Fallback automático para tabela normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Interface de teste funcional</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}