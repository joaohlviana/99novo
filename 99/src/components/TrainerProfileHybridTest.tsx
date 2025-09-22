/**
 * 🧪 COMPONENTE DE TESTE PARA TRAINER PROFILE HÍBRIDO
 * 
 * Testa a nova estrutura híbrida 99_trainer_profile
 */

import React from 'react';
import { useTrainerProfileHybrid } from '../hooks/useTrainerProfileHybrid';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Loader2, User, Database, CheckCircle2, XCircle } from 'lucide-react';

export function TrainerProfileHybridTest() {
  const {
    profileData,
    loading,
    saving,
    error,
    isDirty,
    saveProfile,
    updateProfileData,
    reset,
    refresh,
    isNewProfile,
    completionPercentage
  } = useTrainerProfileHybrid();

  // Função para testar atualização de dados
  const testUpdateData = () => {
    updateProfileData({
      bio: `Biografia de teste atualizada em ${new Date().toLocaleTimeString()}`,
      phone: '(11) 99999-8888',
      experienceYears: '3-5',
      modalities: ['online', 'presencial'],
      cities: ['São Paulo - SP', 'Rio de Janeiro - RJ']
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">🧪 Teste da Estrutura Híbrida</h1>
        <p className="text-gray-600">Testando tabela 99_trainer_profile com dados JSON</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
            loading ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
          }`}>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Database className="h-6 w-6" />}
          </div>
          <h3 className="font-semibold text-sm">Carregamento</h3>
          <p className="text-xs text-gray-500">{loading ? 'Carregando...' : 'Concluído'}</p>
        </Card>

        <Card className="p-4 text-center">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
            isNewProfile ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <User className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-sm">Perfil</h3>
          <p className="text-xs text-gray-500">{isNewProfile ? 'Novo' : 'Existente'}</p>
        </Card>

        <Card className="p-4 text-center">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
            error ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          }`}>
            {error ? <XCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
          </div>
          <h3 className="font-semibold text-sm">Status</h3>
          <p className="text-xs text-gray-500">{error ? 'Erro' : 'OK'}</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-purple-100 text-purple-600">
            <span className="text-lg font-bold">{completionPercentage}%</span>
          </div>
          <h3 className="font-semibold text-sm">Completude</h3>
          <p className="text-xs text-gray-500">Perfil preenchido</p>
        </Card>
      </div>

      {/* Controles */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">🎮 Controles de Teste</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={testUpdateData}
            disabled={loading || saving}
            variant="outline"
          >
            📝 Atualizar Dados
          </Button>
          
          <Button
            onClick={() => saveProfile()}
            disabled={loading || saving || !isDirty}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              '💾 Salvar'
            )}
          </Button>
          
          <Button
            onClick={reset}
            disabled={loading || saving || !isDirty}
            variant="outline"
          >
            🔄 Reverter
          </Button>
          
          <Button
            onClick={refresh}
            disabled={loading || saving}
            variant="outline"
          >
            ♻️ Recarregar
          </Button>
        </div>

        {isDirty && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              ⚠️ Você tem alterações não salvas. Clique em "Salvar" para persistir.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              ❌ Erro: {error}
            </p>
          </div>
        )}
      </Card>

      {/* Dados do Perfil */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">📊 Dados do Perfil (JSON Híbrido)</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
            <p className="text-gray-500 mt-2">Carregando dados...</p>
          </div>
        ) : profileData ? (
          <div className="space-y-4">
            {/* Campos Estruturados */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🗂️ Campos Estruturados (PostgreSQL)</h3>
              <div className="bg-blue-50 p-4 rounded-lg font-mono text-sm space-y-1">
                <div><strong>ID:</strong> {profileData.id || 'N/A'}</div>
                <div><strong>User ID:</strong> {profileData.user_id}</div>
                <div><strong>Nome:</strong> {profileData.name || 'NULL'}</div>
                <div><strong>Email:</strong> {profileData.email || 'NULL'}</div>
                <div><strong>Status:</strong> {profileData.status}</div>
                <div><strong>Ativo:</strong> {profileData.is_active?.toString()}</div>
                <div><strong>Verificado:</strong> {profileData.is_verified?.toString()}</div>
                <div><strong>Criado em:</strong> {profileData.created_at}</div>
                <div><strong>Atualizado em:</strong> {profileData.updated_at}</div>
              </div>
            </div>

            {/* Dados JSON */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🔀 Dados JSON (Flexíveis)</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <strong className="text-sm">Bio:</strong>
                    <p className="text-sm text-gray-600">{profileData.profile_data?.bio || 'Não definida'}</p>
                  </div>
                  <div>
                    <strong className="text-sm">Telefone:</strong>
                    <p className="text-sm text-gray-600">{profileData.profile_data?.phone || 'Não definido'}</p>
                  </div>
                  <div>
                    <strong className="text-sm">Experiência:</strong>
                    <p className="text-sm text-gray-600">{profileData.profile_data?.experienceYears || 'Não definida'}</p>
                  </div>
                  <div>
                    <strong className="text-sm">Modalidades:</strong>
                    <p className="text-sm text-gray-600">
                      {profileData.profile_data?.modalities?.join(', ') || 'Não definidas'}
                    </p>
                  </div>
                  <div>
                    <strong className="text-sm">Cidades:</strong>
                    <p className="text-sm text-gray-600">
                      {profileData.profile_data?.cities?.join(', ') || 'Não definidas'}
                    </p>
                  </div>
                  <div>
                    <strong className="text-sm">Especialidades:</strong>
                    <p className="text-sm text-gray-600">
                      {profileData.profile_data?.specialties?.join(', ') || 'Não definidas'}
                    </p>
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-900 mb-2">
                    🔍 JSON Completo (Clique para expandir)
                  </summary>
                  <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-64">
                    {JSON.stringify(profileData.profile_data, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhum dado disponível</p>
            <p className="text-sm">Verifique a conexão com o banco</p>
          </div>
        )}
      </Card>

      {/* Informações Técnicas */}
      <Card className="p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">⚙️ Informações Técnicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">🏗️ Arquitetura:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Tabela: <code>99_trainer_profile</code></li>
              <li>• Campos estruturados + JSON híbrido</li>
              <li>• Índices GIN para performance</li>
              <li>• Triggers automáticos</li>
              <li>• Funções auxiliares de busca</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">📈 Vantagens:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• ✅ Máxima flexibilidade</li>
              <li>• ✅ Performance otimizada</li>
              <li>• ✅ Sem JOINs complexos</li>
              <li>• ✅ Evolução sem migrations</li>
              <li>• ✅ Compatível com auth.users</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default TrainerProfileHybridTest;