/**
 * PÁGINA DE DEBUG DO PERFIL DO CLIENTE
 * ====================================
 * Página para testar o sistema híbrido de perfil do cliente
 */

import React from 'react';
import { ClientProfileDebugger } from '../components/debug/ClientProfileDebugger';

export function ClientProfileDebugPage() {
  return (
    <div className="min-h-screen bg-background">
      <ClientProfileDebugger />
    </div>
  );
}

export default ClientProfileDebugPage;