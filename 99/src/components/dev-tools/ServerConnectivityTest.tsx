import React, { useState } from 'react';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle, Loader2, Server, Database, Globe } from 'lucide-react';
import CityAdditionTestSimple from './CityAdditionTestSimple';

const ServerConnectivityTest = () => {
  const [results, setResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setResults({});
    
    const testResults: Record<string, any> = {};

    // Test 1: Import Supabase info
    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      testResults.supabaseInfo = {
        success: true,
        projectId: projectId ? `${projectId.substring(0, 8)}...` : 'Missing',
        hasAnonKey: !!publicAnonKey,
        anonKeyPreview: publicAnonKey ? `${publicAnonKey.substring(0, 20)}...` : 'Missing'
      };
    } catch (error) {
      testResults.supabaseInfo = {
        success: false,
        error: error.message
      };
    }

    // Test 2: Health Check
    if (testResults.supabaseInfo.success) {
      try {
        const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
        
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/health`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          testResults.healthCheck = {
            success: true,
            status: response.status,
            data
          };
        } else {
          testResults.healthCheck = {
            success: false,
            status: response.status,
            statusText: response.statusText,
            error: await response.text()
          };
        }
      } catch (error) {
        testResults.healthCheck = {
          success: false,
          error: error.message,
          type: error.constructor.name
        };
      }
    }

    // Test 3: Database Connection
    if (testResults.healthCheck?.success) {
      try {
        const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
        
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/test-db`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          testResults.databaseTest = {
            success: true,
            data
          };
        } else {
          testResults.databaseTest = {
            success: false,
            status: response.status,
            error: await response.text()
          };
        }
      } catch (error) {
        testResults.databaseTest = {
          success: false,
          error: error.message
        };
      }
    }

    // Test 4: Hybrid Table Test
    if (testResults.databaseTest?.success) {
      try {
        const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
        
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/test-hybrid-table`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          testResults.hybridTableTest = {
            success: true,
            data
          };
        } else {
          testResults.hybridTableTest = {
            success: false,
            status: response.status,
            error: await response.text()
          };
        }
      } catch (error) {
        testResults.hybridTableTest = {
          success: false,
          error: error.message
        };
      }
    }

    // Test 5: Simulate City Addition Request
    if (testResults.hybridTableTest?.success) {
      try {
        const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
        
        const mockRequestBody = {
          trainer_id: 'test-trainer-diagnostic',
          updates: {
            profile_data: {
              cities: ['São Paulo - SP', 'Rio de Janeiro - RJ']
            }
          }
        };

        console.log('🔍 Testing trainer profile endpoint with:', mockRequestBody);

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/trainer-profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(mockRequestBody)
        });

        const responseText = await response.text();
        
        if (response.ok) {
          testResults.cityAdditionTest = {
            success: true,
            status: response.status,
            data: JSON.parse(responseText)
          };
        } else {
          testResults.cityAdditionTest = {
            success: false,
            status: response.status,
            statusText: response.statusText,
            error: responseText
          };
        }
      } catch (error) {
        testResults.cityAdditionTest = {
          success: false,
          error: error.message,
          type: error.constructor.name
        };
      }
    }

    setResults(testResults);
    setIsLoading(false);
  };

  const TestResult = ({ name, result, icon: Icon }: { name: string; result: any; icon: any }) => (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold">{name}</h3>
        {result?.success ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600" />
        )}
      </div>
      <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-48">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🔧 Diagnóstico de Conectividade</h2>
        <p className="text-gray-600 mb-4">
          Teste completo para identificar problemas no "Failed to fetch"
        </p>
        
        <Button 
          onClick={runTests} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executando testes...
            </>
          ) : (
            <>
              <Server className="w-4 h-4 mr-2" />
              Executar Diagnóstico
            </>
          )}
        </Button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Resultados dos Testes:</h3>
          
          {results.supabaseInfo && (
            <TestResult 
              name="1. Configuração Supabase" 
              result={results.supabaseInfo} 
              icon={Globe}
            />
          )}
          
          {results.healthCheck && (
            <TestResult 
              name="2. Health Check do Servidor" 
              result={results.healthCheck} 
              icon={Server}
            />
          )}
          
          {results.databaseTest && (
            <TestResult 
              name="3. Conexão com Banco de Dados" 
              result={results.databaseTest} 
              icon={Database}
            />
          )}
          
          {results.hybridTableTest && (
            <TestResult 
              name="4. Tabela Híbrida (99_trainer_profile)" 
              result={results.hybridTableTest} 
              icon={Database}
            />
          )}
          
          {results.cityAdditionTest && (
            <TestResult 
              name="5. Simulação de Adição de Cidade" 
              result={results.cityAdditionTest} 
              icon={CheckCircle}
            />
          )}
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Próximos Passos:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Se o Health Check falhar: Servidor não está acessível</li>
            <li>• Se o Database Test falhar: Problema na conexão com Supabase</li>
            <li>• Se o Hybrid Table Test falhar: Tabela 99_trainer_profile não existe</li>
            <li>• Se o City Addition Test falhar: Problema no endpoint específico</li>
          </ul>
        </div>
      )}

      {/* Teste Simples de Adição de Cidade */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">🧪 Teste Direto - Adição de Cidade</h3>
        <CityAdditionTestSimple />
      </div>
    </div>
  );
};

export default ServerConnectivityTest;