/**
 * DEBUGGER PARA SISTEMA DE PERFIL DO CLIENTE
 * ===========================================
 * Ferramenta para testar e debuggar o sistema híbrido de perfil do cliente
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useClientProfileHybrid, useClientSearch } from '../../hooks/useClientProfileHybrid';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, User, Database, Search, Target, CheckCircle, AlertCircle, RefreshCw, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { ClientProfilePermissionTest } from './ClientProfilePermissionTest';
import { PermissionErrorTracker } from './PermissionErrorTracker';

export function ClientProfileDebugger() {
  const { user } = useAuth();
  const {
    profileData,
    loading,
    saving,
    error,
    isDirty,
    updateProfileData,
    saveProfile,
    refresh,
    completionPercentage,
    isNewProfile
  } = useClientProfileHybrid();

  const { searchClients, findCompatibleClients } = useClientSearch();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showPermissionTest, setShowPermissionTest] = useState(false);
  const [showErrorTracker, setShowErrorTracker] = useState(false);

  // Testes automáticos
  const runTests = async () => {
    const results = [];
    
    try {
      // Teste 1: Verificar estrutura do perfil
      results.push({
        test: 'Estrutura do Perfil',
        status: profileData ? 'success' : 'error',
        details: profileData ? 'Perfil carregado com sucesso' : 'Perfil não encontrado',
        data: profileData
      });

      // Teste 2: Verificar campos JSONB
      if (profileData?.profile_data) {
        const hasRequiredFields = [
          'sportsInterest',
          'primaryGoals',
          'fitnessLevel'
        ].every(field => profileData.profile_data[field]);

        results.push({
          test: 'Campos JSONB Obrigatórios',
          status: hasRequiredFields ? 'success' : 'warning',
          details: hasRequiredFields ? 'Todos os campos obrigatórios presentes' : 'Alguns campos obrigatórios ausentes',
          data: profileData.profile_data
        });
      }

      // Teste 3: Teste de salvamento
      if (profileData) {
        try {
          const testData = {
            bio: `Teste de bio - ${new Date().toISOString()}`
          };
          updateProfileData(testData);
          
          results.push({
            test: 'Atualização Local',
            status: 'success',
            details: 'Dados atualizados localmente com sucesso',
            data: testData
          });
        } catch (err) {
          results.push({
            test: 'Atualização Local',
            status: 'error',
            details: `Erro na atualização: ${err.message}`,
            data: err
          });
        }
      }

      // Teste 4: Teste de busca de clientes compatíveis
      try {
        const compatibleClients = await findCompatibleClients(['Musculação', 'Yoga'], 'São Paulo', 5);
        results.push({
          test: 'Busca de Clientes Compatíveis',
          status: 'success',
          details: `Encontrados ${compatibleClients.length} clientes compatíveis`,
          data: compatibleClients
        });
      } catch (err) {
        results.push({
          test: 'Busca de Clientes Compatíveis',
          status: 'error',
          details: `Erro na busca: ${err.message}`,
          data: err
        });
      }

    } catch (error) {
      results.push({
        test: 'Execução de Testes',
        status: 'error',
        details: `Erro geral: ${error.message}`,
        data: error
      });
    }

    setTestResults(results);
  };

  // Teste de criação de dados mock
  const createMockData = () => {
    const mockData = {
      sportsInterest: ['Musculação', 'Yoga', 'Corrida'],
      sportsTrained: ['Futebol', 'Natação'],
      sportsCurious: ['Boxe', 'Pilates'],
      primaryGoals: ['Emagrecimento', 'Ganhar massa muscular', 'Melhorar condicionamento'],
      searchTags: ['emagrecimento', 'hipertrofia', 'cardio'],
      fitnessLevel: 'intermediario',
      city: 'São Paulo',
      state: 'SP',
      bio: 'Cliente de teste interessado em melhorar condicionamento físico e qualidade de vida.',
      budget: '200-400',
      trainingTime: ['Manhã', 'Noite'],
      modality: ['Presencial', 'Online'],
      age: '25-35',
      gender: 'masculino'
    };

    updateProfileData(mockData);
    setDebugInfo(mockData);
  };

  // Teste de salvamento forçado
  const forceSave = async () => {
    try {
      await saveProfile();
      setDebugInfo({ action: 'save', status: 'success', timestamp: new Date().toISOString() });
    } catch (error) {
      setDebugInfo({ action: 'save', status: 'error', error: error.message });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Client Profile System Debugger</h1>
        <p className="text-gray-600">
          Ferramenta para testar e debugar o sistema híbrido de perfil do cliente
        </p>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand">{user?.id ? '✓' : '✗'}</div>
              <p className="text-sm text-gray-600">Usuário Logado</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-brand">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : profileData ? '✓' : '✗'}
              </div>
              <p className="text-sm text-gray-600">Perfil Carregado</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-brand">{completionPercentage}%</div>
              <p className="text-sm text-gray-600">Completude</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-brand">
                {isNewProfile ? 'NOVO' : 'EXISTENTE'}
              </div>
              <p className="text-sm text-gray-600">Status</p>
            </div>
          </div>

          {/* Estado do Hook */}
          <div className="space-y-2">
            <h4 className="font-medium">Estado do Hook:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant={loading ? 'destructive' : 'secondary'}>
                Loading: {loading ? 'true' : 'false'}
              </Badge>
              <Badge variant={saving ? 'destructive' : 'secondary'}>
                Saving: {saving ? 'true' : 'false'}
              </Badge>
              <Badge variant={isDirty ? 'default' : 'secondary'}>
                Dirty: {isDirty ? 'true' : 'false'}
              </Badge>
              <Badge variant={error ? 'destructive' : 'secondary'}>
                Error: {error ? 'true' : 'false'}
              </Badge>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erro:</strong> {error}
                {error.includes('permission denied') && (
                  <div className="mt-2">
                    <div className="flex gap-2 mt-2">
                      <Button 
                        onClick={() => setShowPermissionTest(true)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Teste de Permissões
                      </Button>
                      <Button 
                        onClick={() => setShowErrorTracker(true)} 
                        variant="outline" 
                        size="sm"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Rastrear Erro
                      </Button>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Controles de Teste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Controles de Teste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={runTests} variant="default">
              <CheckCircle className="h-4 w-4 mr-2" />
              Executar Testes
            </Button>
            
            <Button onClick={createMockData} variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Criar Dados Mock
            </Button>
            
            <Button onClick={forceSave} variant="secondary" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Target className="h-4 w-4 mr-2" />
              )}
              Salvar Perfil
            </Button>
            
            <Button onClick={refresh} variant="ghost">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
            
            <Button 
              onClick={() => setShowPermissionTest(!showPermissionTest)} 
              variant={showPermissionTest ? "default" : "outline"}
            >
              <Shield className="h-4 w-4 mr-2" />
              {showPermissionTest ? 'Ocultar' : 'Mostrar'} Teste de Permissões
            </Button>
            
            <Button 
              onClick={() => setShowErrorTracker(!showErrorTracker)} 
              variant={showErrorTracker ? "default" : "outline"}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {showErrorTracker ? 'Ocultar' : 'Mostrar'} Rastreador de Erros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Resultados dos Testes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{result.test}</h4>
                  <Badge 
                    variant={
                      result.status === 'success' ? 'default' : 
                      result.status === 'warning' ? 'secondary' : 'destructive'
                    }
                  >
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.details}</p>
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500">Ver dados</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Debug Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Dados do Perfil */}
      {profileData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dados do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Campos Estruturados:</h4>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify({
                    id: profileData.id,
                    user_id: profileData.user_id,
                    name: profileData.name,
                    email: profileData.email,
                    phone: profileData.phone,
                    status: profileData.status,
                    is_active: profileData.is_active,
                    is_verified: profileData.is_verified,
                    created_at: profileData.created_at,
                    updated_at: profileData.updated_at
                  }, null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Dados JSONB:</h4>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(profileData.profile_data, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teste de Permissões */}
      {showPermissionTest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Teste de Permissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClientProfilePermissionTest />
          </CardContent>
        </Card>
      )}

      {/* Rastreador de Erros */}
      {showErrorTracker && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Rastreador de Erros de Permissão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PermissionErrorTracker />
          </CardContent>
        </Card>
      )}
    </div>
  );
}