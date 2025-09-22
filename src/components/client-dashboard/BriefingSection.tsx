import React from 'react';
import { ClientProfileHybridIntegration } from './ClientProfileHybridIntegration';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, AlertCircle, Shield, Wifi, WifiOff } from 'lucide-react';

/**
 * SEÇÃO DE PERFIL DO CLIENTE
 * ==========================
 * Integração completa com sistema híbrido de perfil do cliente
 */

export function BriefingSection() {
  return (
    <div className="w-full">
      {/* Header da seção */}
      <div className="bg-gradient-to-r from-brand to-brand-hover p-6 mb-6 rounded-lg text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-white/80">Complete seu perfil para ser encontrado pelos melhores treinadores</p>
        </div>
      </div>

      {/* Componente de integração híbrida */}
      <ClientProfileHybridIntegration className="px-6" />
    </div>
  );
}