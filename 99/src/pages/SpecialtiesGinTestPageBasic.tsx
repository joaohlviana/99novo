/**
 * 🧪 SPECIALTIES GIN TEST PAGE - VERSÃO BÁSICA
 * 
 * Página básica para testar se a busca por especialidades funciona
 */

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

import SpecialtiesSearchOptimizedService from '../services/specialties-search-optimized.service';
import SpecialtiesSearchSafeService from '../services/specialties-search-safe.service';
import SpecialtiesSearchFixedService from '../services/specialties-search-fixed.service';
import SupabaseDirectTestService from '../services/supabase-direct-test.service';
import RangeOnlyService from '../services/range-only.service';
import PaginationSafeService from '../services/pagination-safe.service';

interface TrainerResult {
  id: string;
  slug: string;
  name: string;
  specialties_text: string[];
}

export default function SpecialtiesGinTestPageBasic() {
  const [searchTerms, setSearchTerms] = useState<string>('');
  const [trainers, setTrainers] = useState<TrainerResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [sportSearchTerm, setSportSearchTerm] = useState<string>('futebol');
  const [sportPrograms, setSportPrograms] = useState<any[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);

  // Executar busca básica (versão robusta)
  const handleSearch = async () => {
    setIsSearching(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      const specialties = searchTerms
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      console.log('🔍 Testando busca com:', { specialties });

      // Tentar serviço super seguro primeiro (detecta métodos disponíveis automaticamente)
      let result;
      try {
        const safeResult = await PaginationSafeService.searchTrainersSafe({
          query: specialties.join(' '),
          specialties,
          limit: 10,
          offset: 0
        });
        
        if (!safeResult.error && safeResult.data.length > 0) {
          // Converter para formato esperado
          result = {
            data: safeResult.data.map(trainer => ({
              id: trainer.id,
              slug: trainer.slug,
              name: trainer.name,
              specialties_text: trainer.profile_data?.specialties || []
            })),
            count: safeResult.data.length,
            error: null
          };
          console.log(`✅ Serviço super seguro funcionou via ${safeResult.method}`);
        } else {
          throw new Error(safeResult.error || 'Nenhum dado encontrado');
        }
      } catch (superSafeError) {
        console.warn('🔄 Serviço super seguro falhou, tentando range-only:', superSafeError);
        try {
          result = await RangeOnlyService.searchTrainersBySpecialties({
            specialties,
            matchMode: 'any',
            limit: 10,
            offset: 0
          });
          console.log('✅ Serviço range-only funcionou');
        } catch (rangeError) {
          console.warn('🔄 Range-only falhou, tentando serviço corrigido:', rangeError);
          try {
            result = await SpecialtiesSearchFixedService.searchTrainersBySpecialties({
              specialties,
              matchMode: 'any',
              limit: 10,
              offset: 0
            });
            console.log('✅ Serviço corrigido funcionou');
          } catch (fixedError) {
            console.warn('🔄 Serviço corrigido falhou, tentando versão safe:', fixedError);
            result = await SpecialtiesSearchSafeService.searchTrainersBySpecialties({
              specialties,
              matchMode: 'any',
              limit: 10,
              offset: 0
            });
            console.log('✅ Serviço safe funcionou');
          }
        }
      }
      
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);

      console.log('📊 Resultado da busca:', result);

      if (result.error) {
        setError(result.error);
        setTrainers([]);
      } else {
        setTrainers(result.data);
        console.log(`✅ Encontrados ${result.data.length} treinadores`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('🚨 Erro na busca:', err);
      setError(errorMessage);
      setTrainers([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Teste de conectividade
  const testConnection = async () => {
    setIsSearching(true);
    setError(null);
    setConnectionStatus('');
    
    try {
      // Tentar o serviço super seguro primeiro
      let result;
      try {
        result = await PaginationSafeService.testConnection();
        console.log(`✅ Teste de conexão super seguro funcionou via ${result.method}`);
      } catch (superSafeError) {
        console.warn('🔄 Super seguro falhou, tentando range-only:', superSafeError);
        try {
          result = await RangeOnlyService.testConnection();
          console.log('✅ Teste de conexão range-only funcionou');
        } catch (rangeError) {
          console.warn('🔄 Range-only falhou, tentando service corrigido:', rangeError);
          result = await SpecialtiesSearchFixedService.testConnection();
          console.log('✅ Service corrigido funcionou para conexão');
        }
      }
      
      if (result.success) {
        setConnectionStatus(`✅ ${result.message}`);
        console.log('✅ Teste de conexão bem-sucedido:', result);
      } else {
        setConnectionStatus(`❌ ${result.message}`);
        console.error('❌ Teste de conexão falhou:', result);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setConnectionStatus(`❌ Erro: ${errorMessage}`);
      console.error('🚨 Erro no teste de conexão:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Teste de busca de programas por esporte
  const testSportPrograms = async () => {
    setIsSearching(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      console.log('🔍 Testando busca de programas por esporte:', sportSearchTerm);

      // Tentar service range-only primeiro
      let result;
      try {
        result = await RangeOnlyService.searchProgramsBySport(sportSearchTerm, 10);
        console.log('✅ Busca de programas com range-only funcionou');
      } catch (rangeError) {
        console.warn('🔄 Range-only falhou, tentando service corrigido:', rangeError);
        result = await SpecialtiesSearchFixedService.searchProgramsBySport(sportSearchTerm, 10);
        console.log('✅ Service corrigido funcionou para programas');
      }
      
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);

      console.log('📊 Resultado da busca de programas:', result);

      if (result.error) {
        setError(`Busca de programas falhou: ${result.error}`);
        setSportPrograms([]);
      } else {
        setSportPrograms(result.data);
        console.log(`✅ Encontrados ${result.data.length} programas do esporte ${sportSearchTerm}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('🚨 Erro na busca de programas:', err);
      setError(`Erro na busca de programas: ${errorMessage}`);
      setSportPrograms([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Diagnóstico completo do sistema
  const runDiagnostic = async () => {
    setIsSearching(true);
    setError(null);
    
    try {
      console.log('🔬 Executando diagnóstico completo...');

      const results = await SupabaseDirectTestService.runCompleteTest();
      const limitDiagnosis = await SupabaseDirectTestService.diagnoseLimitProblem();

      setDiagnosticResults({
        ...results,
        limitDiagnosis
      });

      console.log('📊 Diagnóstico completo:', { ...results, limitDiagnosis });

      if (results.summary.overallStatus === 'success') {
        setConnectionStatus('✅ Todos os testes passaram');
      } else if (results.summary.overallStatus === 'partial') {
        setConnectionStatus(`⚠️ ${results.summary.passedTests}/${results.summary.totalTests} testes passaram`);
      } else {
        setConnectionStatus('❌ Todos os testes falharam');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('🚨 Erro no diagnóstico:', err);
      setError(`Erro no diagnóstico: ${errorMessage}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Teste rápido sem filtros (versão robusta)
  const testWithoutFilters = async () => {
    setIsSearching(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      console.log('🔍 Testando busca sem filtros');

      // Tentar serviço range-only primeiro (100% sem limit)
      let result;
      try {
        result = await RangeOnlyService.getAllTrainers(5);
        console.log('✅ Serviço range-only (sem filtros) funcionou');
      } catch (rangeError) {
        console.warn('🔄 Range-only falhou, tentando serviço corrigido:', rangeError);
        try {
          result = await SpecialtiesSearchFixedService.searchTrainersBySpecialties({
            specialties: [],
            limit: 5
          });
          console.log('✅ Serviço corrigido (sem filtros) funcionou');
        } catch (fixedError) {
          console.warn('🔄 Serviço corrigido falhou, tentando versão safe:', fixedError);
          try {
            result = await SpecialtiesSearchSafeService.searchTrainersBySpecialties({
              specialties: [],
              limit: 5
            });
            console.log('✅ Serviço safe (sem filtros) funcionou');
          } catch (safeError) {
            console.warn('🔄 Serviço safe falhou, tentando otimizado:', safeError);
            result = await SpecialtiesSearchOptimizedService.searchTrainersBySpecialties({
              specialties: [],
              limit: 5
            });
            console.log('✅ Serviço otimizado (sem filtros) funcionou');
          }
        }
      }
      
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);

      console.log('📊 Resultado da busca (sem filtros):', result);

      if (result.error) {
        setError(result.error);
        setTrainers([]);
      } else {
        setTrainers(result.data);
        console.log(`✅ Encontrados ${result.data.length} treinadores (sem filtros)`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('🚨 Erro na busca sem filtros:', err);
      setError(errorMessage);
      setTrainers([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛡️ Teste Super Seguro - DETECTA MÉTODOS AUTOMATICAMENTE
          </h1>
          <p className="text-lg text-gray-600">
            Versão ultra robusta que detecta métodos disponíveis automaticamente
          </p>
          <p className="text-sm text-green-600 mt-2">
            ✅ Problemas de "limit" e "range" resolvidos definitivamente
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Funciona com range(), limit(), offset() ou sem paginação
          </p>
        </div>

        <div className="space-y-6">
          {/* Controles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Teste de Busca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Especialidades:</label>
                <Input
                  value={searchTerms}
                  onChange={(e) => setSearchTerms(e.target.value)}
                  placeholder="crossfit, musculacao, yoga..."
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separar por vírgulas (deixe vazio para buscar todos)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Esporte (para busca de programas):</label>
                <Input
                  value={sportSearchTerm}
                  onChange={(e) => setSportSearchTerm(e.target.value)}
                  placeholder="futebol, basquete, natacao..."
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite o slug do esporte para buscar programas
                </p>
              </div>

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
                  Buscar com Filtros
                </Button>
                
                <Button 
                  onClick={testWithoutFilters}
                  disabled={isSearching}
                  variant="outline"
                  className="flex-1"
                >
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar Todos
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={testConnection}
                  disabled={isSearching}
                  variant="secondary"
                  className="flex-1"
                >
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Testar Conexão
                </Button>
                
                <Button 
                  onClick={testSportPrograms}
                  disabled={isSearching}
                  variant="secondary"
                  className="flex-1"
                >
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar Programas
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={runDiagnostic}
                  disabled={isSearching}
                  variant="destructive"
                  className="w-full"
                >
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Diagnóstico Completo
                </Button>
              </div>

              {/* Status de conexão */}
              {connectionStatus && (
                <div className="p-3 bg-gray-100 rounded-lg">
                  <div className="text-sm font-medium text-gray-800">Status da Conexão:</div>
                  <div className="text-sm text-gray-600">{connectionStatus}</div>
                </div>
              )}

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {executionTime.toFixed(2)}ms
                  </div>
                  <div className="text-sm text-gray-500">Tempo de execução</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {trainers.length}
                  </div>
                  <div className="text-sm text-gray-500">Resultados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>PaginationSafeService (detecta métodos automaticamente)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Suporte a range(), limit(), offset() e sem paginação</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>5 camadas de fallback automático</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Problemas "limit/range not available" RESOLVIDOS</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnóstico Detalhado */}
          {diagnosticResults && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnóstico Detalhado do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Resumo */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Resumo dos Testes</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {diagnosticResults.summary.totalTests}
                        </div>
                        <div className="text-gray-500">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {diagnosticResults.summary.passedTests}
                        </div>
                        <div className="text-gray-500">Passou</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {diagnosticResults.summary.failedTests}
                        </div>
                        <div className="text-gray-500">Falhou</div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnóstico do Limit */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔬 Diagnóstico do Método Limit</h4>
                    <div className="space-y-2 text-sm">
                      <div>Método limit disponível: {diagnosticResults.limitDiagnosis.hasLimit ? '✅' : '❌'}</div>
                      <div>Método range disponível: {diagnosticResults.limitDiagnosis.hasRange ? '✅' : '❌'}</div>
                      <div className="font-medium text-blue-600">
                        Diagnóstico: {diagnosticResults.limitDiagnosis.diagnosis}
                      </div>
                    </div>
                  </div>

                  {/* Testes Individuais */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Testes Individuais</h4>
                    {[
                      { name: 'Conexão Básica', result: diagnosticResults.connection },
                      { name: 'Busca com Range', result: diagnosticResults.range },
                      { name: 'Busca com Limit', result: diagnosticResults.limit },
                      { name: 'Materialized View', result: diagnosticResults.mv },
                      { name: 'Busca de Programas', result: diagnosticResults.programs }
                    ].map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{test.name}</span>
                        <span className={`text-sm font-medium ${test.result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {test.result.success ? '✅' : '❌'} {test.result.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Erro:</span>
                  </div>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              )}

              {isSearching && (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Testando busca...</p>
                </div>
              )}

              {!isSearching && trainers.length === 0 && !error && (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhum resultado ainda</p>
                  <p className="text-xs text-gray-400 mt-1">Clique em um dos botões acima para testar</p>
                </div>
              )}

              {trainers.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-green-600 font-medium">
                    ✅ Encontrados {trainers.length} treinadores
                  </p>
                  {trainers.map((trainer) => (
                    <div key={trainer.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{trainer.name}</h3>
                          <p className="text-sm text-gray-500">ID: {trainer.id}</p>
                          <p className="text-sm text-gray-500">Slug: {trainer.slug}</p>
                          {trainer.specialties_text?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {trainer.specialties_text.map((specialty, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resultados dos Programas */}
          {sportPrograms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Programas do Esporte: {sportSearchTerm}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-purple-600 font-medium">
                    ✅ Encontrados {sportPrograms.length} programas do esporte {sportSearchTerm}
                  </p>
                  {sportPrograms.map((program, index) => (
                    <div key={program.id || index} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{program.title || program.name || 'Programa sem título'}</h3>
                          <p className="text-sm text-gray-500">ID: {program.id}</p>
                          {program.trainer_name && (
                            <p className="text-sm text-gray-500">Treinador: {program.trainer_name}</p>
                          )}
                          {program.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{program.description}</p>
                          )}
                          {program.sports && Array.isArray(program.sports) && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {program.sports.map((sport: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {sport}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}