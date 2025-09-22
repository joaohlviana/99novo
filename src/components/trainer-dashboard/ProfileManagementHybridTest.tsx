/**
 * 🧪 TESTE DO PROFILE MANAGEMENT HÍBRIDO
 * 
 * Componente de teste para verificar se a estrutura híbrida está funcionando
 */

import React from 'react';
import { useTrainerProfileHybrid } from '../../hooks/useTrainerProfileHybrid';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';

export function ProfileManagementHybridTest() {
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
    completionPercentage,
  } = useTrainerProfileHybrid();

  const handleTestUpdate = () => {
    const testData = {
      bio: 'Bio de teste atualizada em ' + new Date().toLocaleTimeString(),
      phone: '(11) 99999-9999',
      experienceYears: '3-5',
      responseTime: '3-horas',
      studentsCount: 'moderado',
      specialties: ['musculacao', 'fitness'],
      modalities: ['presencial', 'online'],
      cities: ['São Paulo - SP', 'Rio de Janeiro - RJ']
    };

    updateProfileData(testData);
    toast.success('Dados de teste atualizados!');
  };

  const handleTestSave = async () => {
    try {
      await saveProfile();
      toast.success('Dados salvos com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-brand/20 border-t-brand rounded-full animate-spin mx-auto mb-4"></div>
        <p>Carregando teste híbrido...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Teste da Estrutura Híbrida
            {isNewProfile && <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">NOVO</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Status do Sistema */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">
                {loading ? '⏳' : '✅'}
              </div>
              <div className="text-sm font-medium">Loading</div>
              <div className="text-xs text-gray-600">{loading ? 'Sim' : 'Não'}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">
                {saving ? '💾' : '⭕'}
              </div>
              <div className="text-sm font-medium">Saving</div>
              <div className="text-xs text-gray-600">{saving ? 'Sim' : 'Não'}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">
                {error ? '❌' : '✅'}
              </div>
              <div className="text-sm font-medium">Error</div>
              <div className="text-xs text-gray-600">{error ? 'Sim' : 'Não'}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">
                {isDirty ? '📝' : '⭕'}
              </div>
              <div className="text-sm font-medium">Dirty</div>
              <div className="text-xs text-gray-600">{isDirty ? 'Sim' : 'Não'}</div>
            </div>
          </div>

          {/* Dados do Perfil */}
          {profileData && (
            <div className="space-y-4">
              <h3 className="font-semibold">📊 Dados do Perfil:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Campos Estruturados (PostgreSQL):</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>ID:</strong> {profileData.id || 'N/A'}</div>
                    <div><strong>User ID:</strong> {profileData.user_id}</div>
                    <div><strong>Name:</strong> {profileData.name || 'N/A'}</div>
                    <div><strong>Email:</strong> {profileData.email || 'N/A'}</div>
                    <div><strong>Status:</strong> {profileData.status}</div>
                    <div><strong>Active:</strong> {profileData.is_active?.toString()}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Campos JSON (profile_data):</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Bio:</strong> {profileData.profile_data?.bio ? '✅' : '❌'}</div>
                    <div><strong>Phone:</strong> {profileData.profile_data?.phone ? '✅' : '❌'}</div>
                    <div><strong>Specialties:</strong> {profileData.profile_data?.specialties?.length || 0}</div>
                    <div><strong>Modalities:</strong> {profileData.profile_data?.modalities?.length || 0}</div>
                    <div><strong>Cities:</strong> {profileData.profile_data?.cities?.length || 0}</div>
                    <div><strong>Completion:</strong> {completionPercentage}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* JSON Raw */}
          {profileData && (
            <div className="space-y-2">
              <h4 className="font-medium">🔍 JSON Raw:</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono max-h-64 overflow-auto">
                <pre>{JSON.stringify(profileData.profile_data, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Botões de Teste */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleTestUpdate}
              disabled={loading || saving}
              variant="outline"
            >
              🧪 Atualizar Dados de Teste
            </Button>

            <Button
              onClick={handleTestSave}
              disabled={loading || saving || !isDirty}
              className="bg-[var(--brand)] hover:bg-[var(--brand-hover)]"
            >
              {saving ? '💾 Salvando...' : '💾 Salvar Dados'}
            </Button>

            <Button
              onClick={reset}
              disabled={loading || saving || !isDirty}
              variant="outline"
            >
              🔄 Reset
            </Button>

            <Button
              onClick={refresh}
              disabled={loading || saving}
              variant="outline"
            >
              🔄 Refresh
            </Button>
          </div>

          {/* Completude */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completude do Perfil:</span>
              <span className="text-sm font-bold text-[var(--brand)]">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[var(--brand)] rounded-full h-2 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Erros */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">❌ Erro:</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Mensagens */}
          {isDirty && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                ⚠️ Você tem alterações não salvas. Clique em "Salvar Dados" para persistir as mudanças.
              </p>
            </div>
          )}

          {!profileData && !loading && !error && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800">
                ℹ️ Nenhum dado carregado. Isso pode indicar que o usuário não está autenticado ou não tem perfil.
              </p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileManagementHybridTest;