/**
 * 🧪 SPORT MAPPING TEST PAGE
 * 
 * Página para testar o SportMappingService criado na FASE 2
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, RefreshCw, CheckCircle, XCircle, MapPin } from 'lucide-react';

import sportMappingService from '../services/sport-mapping.service';

export default function SportMappingTestPage() {
  const [searchTerm, setSearchTerm] = useState<string>('futebol');
  const [specialtiesInput, setSpecialtiesInput] = useState<string>('crossfit,musculacao,funcional');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Testar mapeamento de esporte específico
  const testSportMapping = (sport: string) => {
    setIsLoading(true);
    
    try {
      const variations = sportMappingService.getSearchVariationsForSport(sport);
      const mapping = sportMappingService.getSportMapping(sport);
      const officialName = sportMappingService.getOfficialNameFromSlug(sport);
      const slug = sportMappingService.getSlugFromName(sport);

      setResults({
        type: 'sport_mapping',
        input: sport,
        variations,
        mapping,
        officialName,
        slug,
        timestamp: Date.now()
      });

      console.log('🔍 Teste de mapeamento de esporte:', {
        sport,
        variations,
        mapping,
        officialName,
        slug
      });

    } catch (error) {
      console.error('❌ Erro no teste de mapeamento:', error);
      setResults({
        type: 'error',
        message: String(error),
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Testar busca de esportes por especialidades
  const testSpecialtiesMapping = () => {
    setIsLoading(true);
    
    try {
      const specialties = specialtiesInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const foundSports = sportMappingService.findSportsForSpecialties(specialties);
      
      // Testar cada especialidade individualmente
      const individualTests = specialties.map(specialty => {
        const relatedSports = Object.entries(sportMappingService.getAllMappings())
          .filter(([slug, mapping]) => 
            sportMappingService.isSpecialtyRelatedToSport(specialty, slug)
          )
          .map(([slug, mapping]) => ({ slug, mapping }));

        return {
          specialty,
          relatedSports,
          count: relatedSports.length
        };
      });

      setResults({
        type: 'specialties_mapping',
        input: specialties,
        foundSports,
        individualTests,
        timestamp: Date.now()
      });

      console.log('🔍 Teste de especialidades:', {
        specialties,
        foundSports,
        individualTests
      });

    } catch (error) {
      console.error('❌ Erro no teste de especialidades:', error);
      setResults({
        type: 'error',
        message: String(error),
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar estatísticas do serviço
  const showStats = () => {
    setIsLoading(true);
    
    try {
      const stats = sportMappingService.getStats();
      const allMappings = sportMappingService.getAllMappings();

      setResults({
        type: 'stats',
        stats,
        allMappings,
        mappingsCount: Object.keys(allMappings).length,
        timestamp: Date.now()
      });

      console.log('📊 Estatísticas do SportMappingService:', {
        stats,
        allMappings
      });

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      setResults({
        type: 'error',
        message: String(error),
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Testar casos específicos da FASE 1
  const testPhase1Cases = () => {
    setIsLoading(true);
    
    try {
      // Casos reais encontrados na FASE 1
      const phase1Tests = [
        // SportPage busca por "Futebol" (maiúscula)
        {
          case: 'SportPage - Futebol',
          input: 'Futebol',
          variations: sportMappingService.getSearchVariationsForSport('Futebol'),
          shouldFind: ['futebol', 'soccer', 'football']
        },
        // Treinador tem "crossfit" (minúscula)
        {
          case: 'Treinador - crossfit',
          input: 'crossfit',
          mapping: sportMappingService.getSportMapping('crossfit'),
          relatedTo: sportMappingService.isSpecialtyRelatedToSport('crossfit', 'crossfit')
        },
        // Treinador tem "Jiu-Jitsu" (com hífen e maiúscula)
        {
          case: 'Treinador - Jiu-Jitsu',
          input: 'Jiu-Jitsu',
          relatedToLutas: sportMappingService.isSpecialtyRelatedToSport('Jiu-Jitsu', 'lutas'),
          variations: sportMappingService.getSearchVariationsForSport('lutas')
        },
        // Especialidades dos treinadores da Query 1
        {
          case: 'Query 1 Specialties',
          trainerSpecialties: [
            ["crossfit","funcional","olimpicos"],
            ["musculacao","funcional","hiit"], 
            ["musculacao","fitness","funcional"],
            ["musculacao","Sinuca","Jiu-Jitsu","Crossfit"]
          ],
          mappedSports: [
            ["crossfit","funcional","olimpicos"],
            ["musculacao","funcional","hiit"], 
            ["musculacao","fitness","funcional"],
            ["musculacao","Sinuca","Jiu-Jitsu","Crossfit"]
          ].map(specialties => 
            sportMappingService.findSportsForSpecialties(specialties)
          )
        }
      ];

      setResults({
        type: 'phase1_tests',
        tests: phase1Tests,
        timestamp: Date.now()
      });

      console.log('🧪 Testes da FASE 1:', phase1Tests);

    } catch (error) {
      console.error('❌ Erro nos testes da FASE 1:', error);
      setResults({
        type: 'error',
        message: String(error),
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Sport Mapping Service - FASE 2
          </h1>
          <p className="text-lg text-gray-600">
            Teste do serviço de mapeamento que resolve as inconsistências da FASE 1
          </p>
          <p className="text-sm text-green-600 mt-2">
            ✅ Criado baseado nos dados reais do diagnóstico
          </p>
        </div>

        <div className="space-y-6">
          {/* Controles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Testes de Mapeamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Esporte (slug ou nome):</label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="futebol, Futebol, crossfit..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Especialidades (separadas por vírgula):</label>
                <Input
                  value={specialtiesInput}
                  onChange={(e) => setSpecialtiesInput(e.target.value)}
                  placeholder="crossfit,musculacao,funcional..."
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => testSportMapping(searchTerm)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Testar Esporte
                </Button>
                
                <Button 
                  onClick={testSpecialtiesMapping}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Testar Especialidades
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={showStats}
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Ver Estatísticas
                </Button>
                
                <Button 
                  onClick={testPhase1Cases}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Testes FASE 1
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              {!results && (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Clique em um dos botões acima para testar</p>
                </div>
              )}

              {results?.type === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Erro:</span>
                  </div>
                  <p className="text-red-600 mt-1">{results.message}</p>
                </div>
              )}

              {results?.type === 'sport_mapping' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-2">
                      ✅ Mapeamento para: "{results.input}"
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nome Oficial:</strong> {results.officialName}</div>
                      <div><strong>Slug:</strong> {results.slug}</div>
                      <div><strong>Variações ({results.variations.length}):</strong></div>
                      <div className="flex flex-wrap gap-1">
                        {results.variations.map((variation: string, idx: number) => (
                          <Badge key={idx} variant="outline">{variation}</Badge>
                        ))}
                      </div>
                      {results.mapping && (
                        <div>
                          <strong>Nomes Comuns ({results.mapping.commonNames.length}):</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {results.mapping.commonNames.map((name: string, idx: number) => (
                              <Badge key={idx} variant="secondary">{name}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {results?.type === 'specialties_mapping' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 mb-2">
                      🔍 Esportes encontrados para especialidades: {results.input.join(', ')}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <strong>Esportes correspondentes ({results.foundSports.length}):</strong>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {results.foundSports.map((sport: any, idx: number) => (
                            <Badge key={idx} className="bg-blue-100 text-blue-800">
                              {sport.officialName} ({sport.slug})
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <strong>Análise individual:</strong>
                        <div className="space-y-2 mt-2">
                          {results.individualTests.map((test: any, idx: number) => (
                            <div key={idx} className="bg-white rounded p-2 border">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">"{test.specialty}"</span>
                                <Badge variant="outline">{test.count} esporte(s)</Badge>
                              </div>
                              {test.relatedSports.length > 0 && (
                                <div className="mt-1 text-xs text-gray-600">
                                  {test.relatedSports.map((sport: any, sidx: number) => (
                                    <span key={sidx} className="mr-2">
                                      {sport.mapping.officialName}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {results?.type === 'stats' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-medium text-purple-800 mb-3">📊 Estatísticas do Sistema</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {results.stats.totalSports}
                        </div>
                        <div className="text-sm text-gray-500">Esportes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {results.stats.totalVariations}
                        </div>
                        <div className="text-sm text-gray-500">Variações</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {results.stats.avgVariationsPerSport}
                        </div>
                        <div className="text-sm text-gray-500">Média/Esporte</div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3">
                      <strong>Esportes mapeados:</strong>
                      <div className="flex flex-wrap gap-1 mt-2 max-h-40 overflow-y-auto">
                        {Object.entries(results.allMappings).map(([slug, mapping]: [string, any], idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {mapping.officialName} ({mapping.searchVariations.length} var)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {results?.type === 'phase1_tests' && (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-medium text-orange-800 mb-3">🧪 Testes Baseados na FASE 1</h3>
                    <div className="space-y-3">
                      {results.tests.map((test: any, idx: number) => (
                        <div key={idx} className="bg-white rounded p-3 border">
                          <div className="font-medium text-gray-800 mb-2">{test.case}</div>
                          <div className="space-y-1 text-sm text-gray-600">
                            {test.variations && (
                              <div>
                                <strong>Variações:</strong> {test.variations.join(', ')}
                              </div>
                            )}
                            {test.mapping && (
                              <div>
                                <strong>Mapeamento:</strong> {test.mapping.officialName} → {test.mapping.slug}
                              </div>
                            )}
                            {test.relatedToLutas !== undefined && (
                              <div>
                                <strong>Relacionado a Lutas:</strong> {test.relatedToLutas ? '✅ Sim' : '❌ Não'}
                              </div>
                            )}
                            {test.mappedSports && (
                              <div>
                                <strong>Especialidades → Esportes:</strong>
                                <div className="mt-1 space-y-1">
                                  {test.trainerSpecialties.map((specialties: string[], sidx: number) => (
                                    <div key={sidx} className="flex justify-between text-xs">
                                      <span>[{specialties.join(', ')}]</span>
                                      <span>→ {test.mappedSports[sidx].map((s: any) => s.officialName).join(', ') || 'Nenhum'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}