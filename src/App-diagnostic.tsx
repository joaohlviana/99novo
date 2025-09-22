/**
 * 🏋️ PROFILE MANAGEMENT HÍBRIDO
 * 
 * Componente adaptado para usar a nova tabela híbrida 99_trainer_profile
 * Mantém a mesma interface mas usa JSON para flexibilidade máxima
 */

import { useState } from 'react';
import { 
  User, 
  MapPin, 
  Save,
  Camera,
  Video,
  GraduationCap,
  Users,
  Settings,
  Target
} from 'lucide-react';
import { Button } from './components/ui/button';
import PersonalDataSection from './components/trainer-dashboard/PersonalDataSection';
import LocationSection from './components/trainer-dashboard/LocationSection';
import EducationSection from './components/trainer-dashboard/EducationSection';
import SpecialtiesSection from './components/trainer-dashboard/SpecialtiesSection';
import ModalitiesSection from './components/trainer-dashboard/ModalitiesSection';
import GallerySection from './components/trainer-dashboard/GallerySection';
import StoriesSection from './components/trainer-dashboard/StoriesSection';
import { toast } from 'sonner@2.0.3';
import { useTrainerProfileHybrid } from './hooks/useTrainerProfileHybrid';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function ProfileManagementHybrid() {
  // Hook híbrido para gerenciar dados
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
    calculateProfileCompletion
  } = useTrainerProfileHybrid();

  // Estados locais
  const [activeSection, setActiveSection] = useState<string>('personal');

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================

  const getFieldStatus = (condition: boolean) => condition;

  const handleProfileDataChange = (updatedData: any) => {
    console.log('📝 ProfileManagementHybrid: Dados atualizados:', updatedData);
    
    // Se é um objeto completo, usar como está
    if (typeof updatedData === 'object' && updatedData !== null) {
      updateProfileData(updatedData);
    }
    // Se é uma função (para setState pattern), aplicar
    else if (typeof updatedData === 'function') {
      const newData = updatedData(profileData?.profile_data || {});
      updateProfileData(newData);
    }
  };

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-3 border-brand/20 border-t-brand rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Carregando perfil do treinador...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-6xl">❌</div>
          <h2 className="text-xl font-semibold text-gray-900">Erro ao carregar perfil</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={refresh} variant="outline">
            🔄 Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Status */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {isNewProfile ? '➕ Criar Perfil' : '✏️ Editar Perfil'}
              </h1>
              
              {profileData && (
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">
                    Completude: {completionPercentage}%
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[var(--brand)] rounded-full h-2 transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {isDirty && (
                <span className="text-sm text-amber-600 font-medium">
                  ⚠️ Alterações não salvas
                </span>
              )}
              
              <Button
                onClick={reset}
                disabled={saving || loading || !isDirty}
                variant="outline"
              >
                🔄 Reverter
              </Button>
              
              <Button
                onClick={() => saveProfile()}
                disabled={saving || loading}
                className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white"
              >
                {saving ? '💾 Salvando...' : '💾 Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Informações do Sistema */}
          {isNewProfile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500 text-xl">ℹ️</div>
                <div>
                  <h3 className="font-medium text-blue-900">Novo Perfil Detectado</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Este é um novo perfil de treinador. Complete as informações abaixo para ativar sua conta.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">🔍 Debug Info</h4>
              <div className="text-xs font-mono space-y-1">
                <div>ID: {profileData?.id || 'N/A'}</div>
                <div>User ID: {profileData?.user_id || 'N/A'}</div>
                <div>Status: {profileData?.status || 'N/A'}</div>
                <div>Tabela: 99_trainer_profile (Híbrida)</div>
                <div>JSON Fields: {Object.keys(profileData?.profile_data || {}).length} campos</div>
              </div>
            </div>
          )}

          {profileData && (
            <div className="space-y-4">
              {/* Dados Básicos */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getFieldStatus(profileData.profile_data?.bio && profileData.name && profileData.profile_data?.phone) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Informações Pessoais</h3>
                      <p className="text-sm text-gray-500">Nome, biografia e contatos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getFieldStatus(profileData.profile_data?.bio && profileData.name && profileData.profile_data?.phone) ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Completo</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">Pendente</span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <PersonalDataSection 
                    profileData={{
                      name: profileData.name || '',
                      email: profileData.email || '',
                      ...profileData.profile_data
                    }}
                    onProfileDataChange={handleProfileDataChange}
                    loading={loading}
                  />
                </div>
              </div>

              {/* Localização e Cidades */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getFieldStatus(profileData.profile_data?.cities?.length > 0) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Localização e Atendimento</h3>
                      <p className="text-sm text-gray-500">Cidades onde você atende clientes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getFieldStatus(profileData.profile_data?.cities?.length > 0) ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {profileData.profile_data?.cities?.length || 0} cidade{(profileData.profile_data?.cities?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">Pendente</span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <LocationSection 
                    profileData={profileData.profile_data}
                    onProfileDataChange={handleProfileDataChange}
                    loading={loading}
                  />
                </div>
              </div>

              {/* Modalidades de Serviço */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getFieldStatus(profileData.profile_data?.modalities?.length > 0) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Modalidades de Atendimento</h3>
                      <p className="text-sm text-gray-500">Como você prefere atender seus clientes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getFieldStatus(profileData.profile_data?.modalities?.length > 0) ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {profileData.profile_data?.modalities?.join(', ') || 'Não definido'}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">Pendente</span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <ModalitiesSection 
                    profileData={profileData.profile_data}
                    onProfileDataChange={handleProfileDataChange}
                    loading={loading}
                  />
                </div>
              </div>

              {/* Especialidades */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getFieldStatus(profileData.profile_data?.specialties?.length > 0) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Especialidades Esportivas</h3>
                      <p className="text-sm text-gray-500">Modalidades esportivas que você treina</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getFieldStatus(profileData.profile_data?.specialties?.length > 0) ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {profileData.profile_data?.specialties?.length || 0} especialidade{(profileData.profile_data?.specialties?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">Pendente</span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <SpecialtiesSection 
                    profileData={profileData.profile_data}
                    onProfileDataChange={handleProfileDataChange}
                    loading={loading}
                  />
                </div>
              </div>

              {/* Formação e Certificações */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getFieldStatus(profileData.profile_data?.credential || (profileData.profile_data?.universities?.length > 0) || (profileData.profile_data?.courses?.length > 0)) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Formação e Certificações</h3>
                      <p className="text-sm text-gray-500">Sua formação acadêmica e certificações profissionais</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getFieldStatus(profileData.profile_data?.credential || (profileData.profile_data?.universities?.length > 0) || (profileData.profile_data?.courses?.length > 0)) ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Completo</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">Opcional</span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <EducationSection 
                    profileData={profileData.profile_data}
                    onProfileDataChange={handleProfileDataChange}
                    loading={loading}
                  />
                </div>
              </div>

              {/* Galeria e Mídia */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getFieldStatus(profileData.profile_data?.galleryImages?.length > 0) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Galeria de Fotos</h3>
                      <p className="text-sm text-gray-500">Mostre seu trabalho e espaço de treino</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getFieldStatus(profileData.profile_data?.galleryImages?.length > 0) ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {profileData.profile_data?.galleryImages?.length || 0} foto{(profileData.profile_data?.galleryImages?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">Opcional</span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <GallerySection 
                    profileData={profileData.profile_data}
                    onProfileDataChange={handleProfileDataChange}
                    loading={loading}
                  />
                </div>
              </div>

              {/* Stories e Conteúdo */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getFieldStatus(profileData.profile_data?.stories?.length > 0) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Stories e Vídeos</h3>
                      <p className="text-sm text-gray-500">Compartilhe conteúdo inspiracional</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getFieldStatus(profileData.profile_data?.stories?.length > 0) ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {profileData.profile_data?.stories?.length || 0} story{(profileData.profile_data?.stories?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">Opcional</span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <StoriesSection 
                    profileData={profileData.profile_data}
                    onProfileDataChange={handleProfileDataChange}
                    loading={loading}
                  />
                </div>
              </div>

              {/* Debug - Dados Híbridos */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">🔍 Debug - Dados Híbridos JSON</h3>
                        <p className="text-sm text-gray-500">Estrutura da tabela 99_trainer_profile</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                        {Object.keys(profileData.profile_data || {}).length} campos JSON
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="bg-white rounded-lg border p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">📊 Estrutura Híbrida:</h4>
                      <div className="text-xs font-mono bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                        <div className="space-y-2">
                          <div><strong>Campos Estruturados (PostgreSQL):</strong></div>
                          <div className="pl-4 text-blue-600">
                            • id: {profileData.id}<br/>
                            • user_id: {profileData.user_id}<br/>
                            • name: {profileData.name || 'NULL'}<br/>
                            • email: {profileData.email || 'NULL'}<br/>
                            • status: {profileData.status}<br/>
                            • is_active: {profileData.is_active?.toString()}<br/>
                            • created_at: {profileData.created_at}
                          </div>
                          
                          <div className="pt-4"><strong>Campos JSON (profile_data):</strong></div>
                          <div className="pl-4 text-green-600">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(profileData.profile_data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileManagementHybrid;