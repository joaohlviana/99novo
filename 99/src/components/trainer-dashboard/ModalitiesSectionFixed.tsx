import React, { useState, useCallback } from 'react';
import { Globe, MapPin, Check, Users } from 'lucide-react';

interface ModalitiesSectionProps {
  profileData: any;
  onProfileDataChange: (data: any) => void;
  loading?: boolean;
}

const ModalitiesSection: React.FC<ModalitiesSectionProps> = ({ 
  profileData, 
  onProfileDataChange, 
  loading = false 
}) => {
  const modalities = profileData?.profile_data?.modalities || [];

  const handleModalityChange = useCallback((modes: string[]) => {
    console.log('🔄 Modalities changed:', modes);
    onProfileDataChange({ modalities: modes });
  }, [onProfileDataChange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 bg-gray-50 rounded-lg space-y-3">
              <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      

      {/* Service Modalities Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Online */}
        <div
          onClick={() => {
            const newModes = modalities.includes('online')
              ? modalities.filter((m: string) => m !== 'online')
              : [...modalities, 'online'];
            handleModalityChange(newModes);
          }}
          className={`group relative cursor-pointer rounded-lg border p-6 transition-all duration-200 hover:shadow-md ${
            modalities.includes('online')
              ? 'border-brand/50 bg-brand/5 shadow-sm ring-1 ring-brand/20'
              : 'border-gray-200 bg-white hover:border-brand/30'
          }`}
        >
          <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
            modalities.includes('online')
              ? 'bg-brand border-brand'
              : 'border-gray-300 group-hover:border-brand/50'
          }`}>
            {modalities.includes('online') && (
              <Check className="w-3 h-3 text-white" />
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg transition-colors ${
              modalities.includes('online') 
                ? 'bg-brand/10 text-brand' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className="mb-2 font-medium text-gray-900">Online</h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                Treinos via videoconferência, acompanhamento digital e suporte remoto
              </p>
            </div>
          </div>
        </div>

        {/* Card Presencial */}
        <div
          onClick={() => {
            const newModes = modalities.includes('presencial')
              ? modalities.filter((m: string) => m !== 'presencial')
              : [...modalities, 'presencial'];
            handleModalityChange(newModes);
          }}
          className={`group relative cursor-pointer rounded-lg border p-6 transition-all duration-200 hover:shadow-md ${
            modalities.includes('presencial')
              ? 'border-brand/50 bg-brand/5 shadow-sm ring-1 ring-brand/20'
              : 'border-gray-200 bg-white hover:border-brand/30'
          }`}
        >
          <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
            modalities.includes('presencial')
              ? 'bg-brand border-brand'
              : 'border-gray-300 group-hover:border-brand/50'
          }`}>
            {modalities.includes('presencial') && (
              <Check className="w-3 h-3 text-white" />
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg transition-colors ${
              modalities.includes('presencial') 
                ? 'bg-brand/10 text-brand' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className="mb-2 font-medium text-gray-900">Presencial</h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                Treinos presenciais, atendimento personalizado e suporte direto
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="mt-6">
        {modalities.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-600 mb-1">Selecione suas modalidades</h4>
            <p className="text-sm text-gray-500">Escolha como você prefere atender seus clientes</p>
          </div>
        ) : (
          <div className="p-4 bg-green-50/50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">Modalidades Selecionadas</span>
            </div>
            <div className="text-xs text-green-700">
              <p>✓ {modalities.length === 2 ? 'Atendimento Online e Presencial' : 
                   modalities.includes('online') ? 'Atendimento Online' : 'Atendimento Presencial'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalitiesSection;