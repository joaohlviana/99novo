/**
 * PÁGINA DE TESTE: TrainingProgramsJsonbTestPage
 * ==============================================
 * Página para testar a nova estrutura JSONB após migração
 */

import { TrainingProgramsJsonbTest } from '../components/dev-tools/TrainingProgramsJsonbTest';
import { StatsErrorTest } from '../components/dev-tools/StatsErrorTest';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';

export function TrainingProgramsJsonbTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">
              Teste da Estrutura JSONB
            </h1>
            <p className="text-muted-foreground text-lg">
              Verifica se a migração para a nova estrutura JSONB funcionou corretamente.
            </p>
          </div>

          {/* Error Correction Test */}
          <StatsErrorTest />

          <Separator />

          {/* JSONB Test Component */}
          <TrainingProgramsJsonbTest />

          {/* Development Navigation */}
          <div className="pt-8 border-t">
            <h2 className="text-lg font-medium mb-4">Links de Desenvolvimento</h2>
            <div className="flex flex-wrap gap-2">
              <Link to="/dev">
                <Button variant="outline" size="sm">
                  ← Voltar para Dev
                </Button>
              </Link>
              <Link to="/dev/training-programs-hybrid-test">
                <Button variant="outline" size="sm">
                  Teste Híbrido (Antigo)
                </Button>
              </Link>
              <Link to="/dashboard/trainer">
                <Button variant="outline" size="sm">
                  Dashboard Trainer
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm">
                  Homepage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}