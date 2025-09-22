/**
 * 🧪 COMPONENTE DE TESTE PARA FILTROS JSONB
 * =========================================
 * Testa a correção do erro "invalid input syntax for type json"
 * Valida se os filtros de especialidades funcionam corretamente
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { searchTrainers } from '../../services/search.service';
import { jsonbFilters } from '../../services/utils/jsonb-filters.service';
import { supabase } from '../../lib/supabase/client';

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export function JsonbFiltersTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState('');

  // Testes predefinidos
  const testCases = [
    'Musculação',
    'Crossfit', 
    'Golfe',
    'Yoga',
    'Pilates',
    'Funcional',
    'Natação'
  ];

  /**
   * Testa filtro direto com searchTrainers
   */
  const testSearchTrainers = async (specialty: string): Promise<TestResult> => {
    try {
      console.log(`🧪 Testando searchTrainers com especialidade: ${specialty}`);
      
      const result = await searchTrainers({
        specialties: [specialty],
        limit: 5
      });

      return {
        testName: `searchTrainers("${specialty}")`,
        success: result.success,
        message: result.success 
          ? `✅ Sucesso: ${result.data.length} treinadores encontrados`
          : `❌ Falhou: ${result.metadata?.source || 'erro desconhecido'}`,
        data: result.data
      };
    } catch (error) {
      return {
        testName: `searchTrainers("${specialty}")`,
        success: false,
        message: `❌ Exceção: ${error.message}`,
        error
      };
    }
  };

  /**
   * Testa filtro JSONB direto
   */
  const testDirectJsonbFilter = async (specialty: string): Promise<TestResult> => {
    try {
      console.log(`🧪 Testando filtro JSONB direto: ${specialty}`);
      
      let query = supabase
        .from('trainers_with_slugs')
        .select('id, name, profile_data')
        .eq('is_active', true)
        .limit(3);

      // Usar serviço de filtros JSONB
      query = await jsonbFilters.filterJsonbArrayContains(
        query,
        'profile_data->specialties',
        [specialty],
        {
          fallbackStrategy: 'text',
          logErrors: true
        }
      );

      const { data, error } = await query;

      if (error) {
        return {
          testName: `JsonB Direct("${specialty}")`,
          success: false,
          message: `❌ Erro na query: ${error.message}`,
          error
        };
      }

      return {
        testName: `JsonB Direct("${specialty}")`,
        success: true,
        message: `✅ Query executada: ${data?.length || 0} resultados`,
        data
      };
    } catch (error) {
      return {
        testName: `JsonB Direct("${specialty}")`,
        success: false,
        message: `❌ Exceção: ${error.message}`,
        error
      };
    }
  };

  /**
   * Testa validação de valores JSONB
   */
  const testJsonbValidation = (): TestResult => {
    try {
      const testValues = [
        '',
        null,
        undefined,
        'Musculação',
        ['Crossfit', 'Yoga'],
        123,
        { invalid: 'object' }
      ];

      const results = testValues.map(val => ({
        value: val,
        valid: jsonbFilters.validateJsonbValue(val)
      }));

      const validCount = results.filter(r => r.valid).length;

      return {
        testName: 'JsonB Validation',
        success: true,
        message: `✅ Validação: ${validCount}/${results.length} valores válidos`,
        data: results
      };
    } catch (error) {
      return {
        testName: 'JsonB Validation',
        success: false,
        message: `❌ Erro na validação: ${error.message}`,
        error
      };
    }
  };

  /**
   * Executa todos os testes
   */
  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    const results: TestResult[] = [];

    // 1. Teste de validação
    results.push(testJsonbValidation());

    // 2. Testes com casos predefinidos
    for (const specialty of testCases.slice(0, 3)) { // Apenas 3 para não sobrecarregar
      const searchResult = await testSearchTrainers(specialty);
      results.push(searchResult);

      const directResult = await testDirectJsonbFilter(specialty);
      results.push(directResult);
    }

    // 3. Teste com entrada customizada
    if (customSpecialty.trim()) {
      const customResult = await testSearchTrainers(customSpecialty.trim());
      results.push(customResult);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  /**
   * Testa apenas uma especialidade específica
   */
  const testSingleSpecialty = async (specialty: string) => {
    setIsLoading(true);
    
    const results = [
      await testSearchTrainers(specialty),
      await testDirectJsonbFilter(specialty)
    ];

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Teste de Filtros JSONB</CardTitle>
          <CardDescription>
            Validação da correção do erro "invalid input syntax for type json"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controles de teste */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="custom-specialty">Especialidade customizada</Label>
              <Input
                id="custom-specialty"
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                placeholder="Ex: Musculação, Crossfit..."
              />
            </div>
            <Button 
              onClick={runAllTests}
              disabled={isLoading}
              className="bg-brand text-brand-foreground hover:bg-brand-hover"
            >
              {isLoading ? 'Testando...' : 'Executar Todos os Testes'}
            </Button>
          </div>

          {/* Testes rápidos */}
          <div className="flex gap-2 flex-wrap">
            <Label className="text-sm text-gray-600 w-full">Testes rápidos:</Label>
            {testCases.slice(0, 4).map(specialty => (
              <Button
                key={specialty}
                variant="outline"
                size="sm"
                onClick={() => testSingleSpecialty(specialty)}
                disabled={isLoading}
              >
                {specialty}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Resultados dos Testes</CardTitle>
            <CardDescription>
              {testResults.filter(r => r.success).length} de {testResults.length} testes passaram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {testResults.map((result, index) => (
              <Alert key={index} className={result.success ? 'border-green-200' : 'border-red-200'}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.testName}
                      </Badge>
                      <Badge variant="outline">
                        {result.success ? '✅ PASSOU' : '❌ FALHOU'}
                      </Badge>
                    </div>
                    <AlertDescription className="text-sm">
                      {result.message}
                    </AlertDescription>
                    
                    {/* Dados de retorno */}
                    {result.data && Array.isArray(result.data) && result.data.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        <strong>Dados:</strong> {result.data.length} items
                        {result.data.slice(0, 2).map((item, i) => (
                          <div key={i} className="ml-2">
                            • {item.name || item.id || JSON.stringify(item).substring(0, 50)}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Erro detalhado */}
                    {result.error && (
                      <details className="mt-2">
                        <summary className="text-xs text-red-600 cursor-pointer">
                          Ver erro detalhado
                        </summary>
                        <pre className="text-xs text-red-500 mt-1 bg-red-50 p-2 rounded overflow-auto">
                          {JSON.stringify(result.error, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Como usar este teste</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>1. Executar todos os testes:</strong> Valida múltiplas especialidades de uma vez</p>
          <p><strong>2. Testes rápidos:</strong> Clique em uma especialidade específica para testar</p>
          <p><strong>3. Entrada customizada:</strong> Digite uma especialidade e execute os testes</p>
          <p><strong>4. Resultados:</strong> Verde = sucesso, Vermelho = erro que precisa ser corrigido</p>
          
          <Alert>
            <AlertDescription>
              <strong>✅ Sucesso esperado:</strong> Todos os testes devem passar sem erros de "invalid input syntax for type json"
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}