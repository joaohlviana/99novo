/**
 * PÁGINA DE DIAGNÓSTICO DO SISTEMA CLIENT PROFILE
 * ==============================================
 * Página para verificar se o sistema híbrido está configurado corretamente
 */

import React from 'react';
import { ClientProfileSystemDiagnostic } from '../components/debug/ClientProfileSystemDiagnostic';

export function ClientProfileSystemDiagnosticPage() {
  return (
    <div className="min-h-screen bg-background">
      <ClientProfileSystemDiagnostic />
    </div>
  );
}

export default ClientProfileSystemDiagnosticPage;