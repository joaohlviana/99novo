/**
 * 🧪 TESTE SIMPLES DA ESTRUTURA HÍBRIDA
 * 
 * Versão simplificada que não depende de autenticação
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Loader2, Database, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { trainerProfileService } from '../services/trainer-profile.service';
import { toast } from 'sonner@2.0.3';

export function TrainerProfileHybridTestSimple() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Teste 1: Verificar conexão com a tabela
  const testTableConnection = async () => {
    setLoading(true);
    setConnectionStatus('testing');
    setErrorMessage('');
    
    try {
      console.log('🧪 Iniciando teste de conexão com tabela híbrida...');
      
      // Tentar listar profiles existentes
      const profiles = await trainerProfileService.getAll();
      
      setTestResults([
        {
          test: 'Conexão com tabela 99_trainer_profile',
          status: 'success',
          message: `✅ Tabela acessível. ${profiles.length} perfis encontrados.`,
          data: profiles.slice(0, 3) // Mostrar apenas os primeiros 3
        }
      ]);
      
      setConnectionStatus('success');
      toast.success('✅ Conexão com tabela híbrida funcionando!');
      
    } catch (error: any) {
      console.error('❌ Erro no teste de conexão:', error);
      setErrorMessage(error.message || 'Erro desconhecido');
      setConnectionStatus('error');
      setTestResults([
        {
          test: 'Conexão com tabela 99_trainer_profile',
          status: 'error',
          message: `❌ Erro: ${error.message}`,
          data: null
        }
      ]);
      toast.error('❌ Erro na conexão com a tabela');
    } finally {
      setLoading(false);
    }
  };

  // Teste 2: Criar dados de exemplo
  const testCreateSampleData = async () => {
    setLoading(true);
    
    try {
      console.log('🧪 Testando criação de dados...');
      
      // Criar um perfil de teste com user_id fake
      const sampleProfile = {
        user_id: 'test-user-' + Date.now(),
        name: 'Trainer de Teste',
        email: 'teste@exemplo.com',
        profile_data: {
          bio: 'Perfil de teste criado automaticamente',
          specialties: ['musculacao', 'fitness'],
          modalities: ['online', 'presencial'],
          cities: ['São Paulo - SP'],
          phone: '(11) 99999-9999',
          experienceYears: '3-5',
          responseTime: '3-horas',
          lastUpdated: new Date().toISOString()
        }
      };

      const result = await trainerProfileService.create(sampleProfile);
      
      setTestResults(prev => [...prev, {
        test: 'Criação de dados JSON',
        status: 'success',
        message: '✅ Perfil de teste criado com sucesso',
        data: result
      }]);
      
      toast.success('✅ Dados de teste criados!');
      
    } catch (error: any) {
      console.error('❌ Erro na criação:', error);
      setTestResults(prev => [...prev, {
        test: 'Criação de dados JSON',
        status: 'error',
        message: `❌ Erro: ${error.message}`,
        data: null
      }]);
      toast.error('❌ Erro na criação de dados');
    } finally {
      setLoading(false);
    }
  };

  // Teste 3: Buscar por especialidade
  const testSearchBySpecialty = async () => {
    setLoading(true);
    
    try {
      console.log('🧪 Testando busca por especialidade...');
      
      const results = await trainerProfileService.searchBySpecialty('musculacao');
      
      setTestResults(prev => [...prev, {
        test: 'Busca por especialidade (musculacao)',
        status: 'success',
        message: `✅ Encontrados ${results.length} trainers com especialidade musculacao`,
        data: results.slice(0, 2)
      }]);
      
      toast.success('✅ Busca por especialidade funcionando!');
      
    } catch (error: any) {
      console.error('❌ Erro na busca:', error);
      setTestResults(prev => [...prev, {
        test: 'Busca por especialidade',
        status: 'error',
        message: `❌ Erro: ${error.message}`,
        data: null
      }]);
      toast.error('❌ Erro na busca');
    } finally {
      setLoading(false);
    }
  };

  // Executar todos os testes
  const runAllTests = async () => {
    setTestResults([]);
    await testTableConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testCreateSampleData();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testSearchBySpecialty();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">🧪 Teste Simples - Estrutura Híbrida</h1>
        <p className="text-gray-600">Testando tabela 99_trainer_profile sem dependências de auth</p>
      </div>

      {/* Status da Conexão */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">🔌 Status da Conexão</h2>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            connectionStatus === 'testing' ? 'bg-yellow-100 text-yellow-700' :
            connectionStatus === 'success' ? 'bg-green-100 text-green-700' :
            'bg-red-100 text-red-700'
          }`}>
            {connectionStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin" />}
            {connectionStatus === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {connectionStatus === 'error' && <XCircle className="w-4 h-4" />}
            <span>
              {connectionStatus === 'testing' ? 'Testando...' :
               connectionStatus === 'success' ? 'Conectado' : 'Erro'}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{errorMessage}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={testTableConnection}
            disabled={loading}
            variant="outline"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
            Testar Conexão
          </Button>
          
          <Button
            onClick={testCreateSampleData}
            disabled={loading}
            variant="outline"
          >
            📝 Criar Dados Teste
          </Button>
          
          <Button
            onClick={testSearchBySpecialty}
            disabled={loading}
            variant="outline"
          >
            🔍 Testar Busca
          </Button>
          
          <Button
            onClick={runAllTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Executar Todos os Testes
          </Button>
        </div>
      </Card>

      {/* Resultados dos Testes */}
      {testResults.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Resultados dos Testes</h2>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.status === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{result.test}</h3>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    result.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status === 'success' ? '✅ Sucesso' : '❌ Erro'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{result.message}</p>
                
                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-gray-600 mb-2">
                      🔍 Ver Dados (Clique para expandir)
                    </summary>
                    <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Informações da Estrutura */}
      <Card className="p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">🏗️ Estrutura da Tabela Híbrida</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">📋 Campos Estruturados:</h3>
            <ul className="space-y-1 text-gray-600 font-mono">
              <li>• id (UUID)</li>
              <li>• user_id (UUID)</li>
              <li>• name (VARCHAR)</li>
              <li>• email (VARCHAR)</li>
              <li>• status (VARCHAR)</li>
              <li>• is_active (BOOLEAN)</li>
              <li>• created_at (TIMESTAMP)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">🔀 Campo JSON (profile_data):</h3>
            <ul className="space-y-1 text-gray-600 font-mono">
              <li>• bio</li>
              <li>• specialties[]</li>
              <li>• modalities[]</li>
              <li>• cities[]</li>
              <li>• phone</li>
              <li>• experienceYears</li>
              <li>• + outros campos flexíveis</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default TrainerProfileHybridTestSimple;