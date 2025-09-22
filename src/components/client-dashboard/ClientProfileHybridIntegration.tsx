/**
 * INTEGRAÇÃO DO PERFIL HÍBRIDO DO CLIENTE - REFATORADO
 * ===================================================
 * Seguindo padrão de excelência do trainer
 * Arquitetura simples e direta
 */

import React, { useMemo } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { ClientProfileManagement } from './ClientProfileManagement';
import { useClientProfileHybrid } from '../../hooks/useClientProfileHybrid';

interface ClientProfileHybridIntegrationProps {
  className?: string;
}

export const ClientProfileHybridIntegration: React.FC<ClientProfileHybridIntegrationProps> = ({
  className = ''
}) => {
  const {
    profileData,
    loading,
    saving,
    error,
    isDirty,
    isNewProfile,
    completionPercentage,
    saveProfile,
    updateProfileData,
    refresh
  } = useClientProfileHybrid();

  // ✅ MAPEAMENTO SIMPLES (mesmo padrão do trainer)
  const currentProfileData = useMemo(() => {
    if (!profileData) return null;
    
    return {
      // Campos estruturados (diretos)
      name: profileData.name || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      
      // Campos JSONB (diretos - sem mapeamento complexo)
      ...profileData.profile_data
    };
  }, [profileData]);

  // ✅ HANDLER SIMPLES (mesmo padrão do trainer)
  const handleProfileDataChange = (newData: any) => {
    console.log('📝 Client profile data change:', newData);
    updateProfileData(newData); // Chamada direta - igual ao trainer
  };

  // ✅ HANDLER DE SAVE SIMPLES (mesmo padrão do trainer)
  const handleSave = async () => {
    await saveProfile();
  };

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand" />
          <div>
            <h3 className="font-medium text-gray-900">Carregando seu perfil</h3>
            <p className="text-sm text-gray-500">Aguarde alguns instantes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Erro ao carregar perfil do cliente:</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{error}</code>
            </div>
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button 
            onClick={refresh}
            variant="outline"
            className="border-brand text-brand hover:bg-brand/5"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!profileData) {
    return (
      <div className={`text-center space-y-4 py-8 ${className}`}>
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
        <div>
          <h3 className="font-medium text-gray-900">Perfil não encontrado</h3>
          <p className="text-sm text-gray-500">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
        </div>
        <Button 
          onClick={refresh}
          className="bg-brand hover:bg-brand-hover"
        >
          Recarregar
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Status do perfil */}
      {isNewProfile && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Bem-vindo!</strong> Complete seu perfil para ser encontrado por treinadores ideais.
          </AlertDescription>
        </Alert>
      )}

      {/* Indicador de mudanças não salvas */}
      {isDirty && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Você tem alterações não salvas. Não esqueça de salvar suas informações.
          </AlertDescription>
        </Alert>
      )}

      {/* ✅ COMPONENTE PRINCIPAL SIMPLIFICADO (mesmo padrão do trainer) */}
      <ClientProfileManagement
        profileData={currentProfileData}
        onProfileDataChange={handleProfileDataChange}
        onSave={handleSave}
        loading={false}
        saving={saving}
        errors={{}} // Erros são tratados pelo hook
      />
    </div>
  );
};

export default ClientProfileHybridIntegration;