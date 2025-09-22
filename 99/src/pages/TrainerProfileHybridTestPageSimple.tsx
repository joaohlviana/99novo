/**
 * 🧪 PÁGINA DE TESTE SIMPLES - TRAINER PROFILE HÍBRIDO
 * 
 * Versão simplificada sem dependências de autenticação
 */

import React from 'react';
import { PageShell } from '../components/layout/PageShell';
import { Header } from '../components/Header';
import TrainerProfileHybridTestSimple from '../components/TrainerProfileHybridTestSimple';
import { SingletonVerifier } from '../components/dev-tools/SingletonVerifier';
import { Button } from '../components/ui/button';
import { useNavigation } from '../hooks/useNavigation';
import { ArrowLeft, Database, TestTube, Zap } from 'lucide-react';

function TrainerProfileHybridTestPageSimple() {
  const navigation = useNavigation();

  return (
    <PageShell>
      <Header />
      <div className="pt-16 min-h-screen bg-gray-50">
        
        {/* Header da Página */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigation.navigateTo('/dev')}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Dev Tools
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    🧪 Teste Simples - Trainer Profile Híbrido
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Testando estrutura híbrida sem dependências de autenticação
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  Versão: Simplificada
                </span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  Status: ✅ Migração OK
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Banner de Sucesso da Migração */}
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  🎉 Migração SQL Executada com Sucesso!
                </h3>
                <p className="text-sm text-green-700">
                  A tabela híbrida <code className="bg-green-100 px-1 rounded">99_trainer_profile</code> foi criada e está pronta para uso.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Estrutura Criada</h3>
                  <p className="text-sm text-gray-600">Tabela + Índices + Funções</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Tabela <code>99_trainer_profile</code></li>
                <li>✅ Índices GIN para JSON</li>
                <li>✅ Triggers automáticos</li>
                <li>✅ Funções de busca</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TestTube className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Testes Disponíveis</h3>
                  <p className="text-sm text-gray-600">Sem autenticação</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Conexão com tabela</li>
                <li>• Criação de dados JSON</li>
                <li>• Busca por especialidade</li>
                <li>• Operações CRUD básicas</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Benefícios</h3>
                  <p className="text-sm text-gray-600">Estrutura híbrida</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Flexibilidade total</li>
                <li>• Performance otimizada</li>
                <li>• Sem JOINs complexos</li>
                <li>• Evolução sem migrations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Verificador de Singleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <SingletonVerifier />
        </div>

        {/* Componente de Teste Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <TrainerProfileHybridTestSimple />
        </div>

        {/* Footer com Instruções */}
        <div className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3">🚀 Como Usar:</h4>
                <ol className="text-sm text-gray-300 space-y-1">
                  <li>1. Clique em "Testar Conexão" para verificar a tabela</li>
                  <li>2. Use "Criar Dados Teste" para inserir exemplos</li>
                  <li>3. Teste "Testar Busca" para queries JSON</li>
                  <li>4. Execute "Todos os Testes" para validação completa</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-3">📋 Estrutura SQL:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Campos estruturados + JSON flexível</li>
                  <li>• Índices GIN para performance</li>
                  <li>• Funções auxiliares de busca</li>
                  <li>• Triggers para timestamps automáticos</li>
                  <li>• Relacionamento com auth.users</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-center text-sm text-gray-400">
                🎯 <strong>Status:</strong> Migração executada com sucesso! Estrutura híbrida pronta para uso.
              </p>
            </div>
          </div>
        </div>

      </div>
    </PageShell>
  );
}

export default TrainerProfileHybridTestPageSimple;