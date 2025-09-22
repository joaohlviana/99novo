/**
 * 🩺 TRAINER PROFILE SYSTEM DIAGNOSTIC PAGE
 * 
 * Página para diagnosticar problemas no sistema de perfis de treinadores
 */

import React from 'react';
import { TrainerProfileDiagnostic } from '../components/debug/TrainerProfileDiagnostic';
import { TrainerProfileQuickTest } from '../components/debug/TrainerProfileQuickTest';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrainerProfileSystemDiagnosticPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Diagnóstico do Sistema de Perfis
          </h1>
          <p className="text-gray-600">
            Ferramenta para identificar e resolver problemas no carregamento de perfis de treinadores.
          </p>
        </div>

        {/* Teste Rápido */}
        <TrainerProfileQuickTest />
        
        <Separator className="my-8" />
        
        {/* Diagnóstico Completo */}
        <TrainerProfileDiagnostic />
      </div>
    </div>
  );
}