/**
 * 🧪 PÁGINA DE TESTE - TRAINER PROFILE HÍBRIDO
 * 
 * Página para testar a nova estrutura híbrida de perfis de treinadores
 */

import React from 'react';
import { PageShell } from '../components/layout/PageShell';
import { Header } from '../components/Header';
import TrainerProfileHybridTest from '../components/TrainerProfileHybridTest';
import { Button } from '../components/ui/button';
import { useNavigation } from '../hooks/useNavigation';
import { ArrowLeft, Database, FileText, TestTube } from 'lucide-react';

function TrainerProfileHybridTestPage() {
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
                    🧪 Teste - Trainer Profile Híbrido
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Teste da nova estrutura de dados usando tabela híbrida 99_trainer_profile
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                  Tabela: 99_trainer_profile
                </span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  Estrutura: Híbrida
                </span>
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
                  <h3 className="font-semibold text-gray-900">Estrutura Híbrida</h3>
                  <p className="text-sm text-gray-600">PostgreSQL + JSON</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Campos estruturados para queries</li>
                <li>• JSON para dados flexíveis</li>
                <li>• Índices GIN para performance</li>
                <li>• Relacionamento com auth.users</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TestTube className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Funcionalidades Testadas</h3>
                  <p className="text-sm text-gray-600">Operações CRUD</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Carregar perfil existente</li>
                <li>• Criar novo perfil</li>
                <li>• Atualizar dados JSON</li>
                <li>• Calcular completude</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Documentação</h3>
                  <p className="text-sm text-gray-600">Scripts e guias</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  04-create-trainer-profile-hybrid-fixed.sql
                </div>
                <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  trainer-profile.service.ts
                </div>
                <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  useTrainerProfileHybrid.ts
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Componente de Teste */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <TrainerProfileHybridTest />
        </div>

        {/* Footer com Instruções */}
        <div className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3">📝 Como Testar:</h4>
                <ol className="text-sm text-gray-300 space-y-1">
                  <li>1. Execute o script SQL de migração</li>
                  <li>2. Faça login com um usuário</li>
                  <li>3. Clique em "Atualizar Dados de Teste"</li>
                  <li>4. Clique em "Salvar Dados"</li>
                  <li>5. Observe os dados JSON sendo atualizados</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-3">🔍 O que Observar:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Status de loading/saving</li>
                  <li>• Campos estruturados vs JSON</li>
                  <li>• Percentual de completude</li>
                  <li>• Operações de CRUD funcionando</li>
                  <li>• Dados sendo persistidos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageShell>
  );
}

export default TrainerProfileHybridTestPage;