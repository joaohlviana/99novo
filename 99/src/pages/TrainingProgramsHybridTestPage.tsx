/**
 * PÁGINA DE TESTE - TRAINING PROGRAMS HÍBRIDO
 * ===========================================
 * Página dedicada para testar o sistema híbrido de programas
 */

"use client";

import { TrainingProgramsHybridTest } from '../components/dev-tools/TrainingProgramsHybridTest';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Database, TestTube, CheckCircle, AlertTriangle } from 'lucide-react';

export default function TrainingProgramsHybridTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Training Programs - Sistema Híbrido</h1>
              <p className="text-muted-foreground">
                Teste completo do banco de dados híbrido para programas de treino
              </p>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Banco Híbrido</h3>
                    <p className="text-sm text-muted-foreground">
                      Tabela 99_training_programs criada
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Service Layer</h3>
                    <p className="text-sm text-muted-foreground">
                      CRUD operations implementadas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">React Hooks</h3>
                    <p className="text-sm text-muted-foreground">
                      useTrainingPrograms implementado
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Características do Sistema */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Características do Sistema Híbrido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-700">✅ Campos Relacionais (PostgreSQL)</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <code>id, trainer_id, title</code> - Identificação</li>
                  <li>• <code>category, modality, level</code> - Filtros principais</li>
                  <li>• <code>duration, frequency, base_price</code> - Métricas</li>
                  <li>• <code>is_published, status</code> - Estado</li>
                  <li>• <code>created_at, updated_at</code> - Timestamps</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-blue-700">🔧 Dados Flexíveis (JSONB)</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <code>basic_info</code> - Tags e keywords</li>
                  <li>• <code>description</code> - Textos e objetivos</li>
                  <li>• <code>structure</code> - Cronograma detalhado</li>
                  <li>• <code>pricing</code> - Pacotes complexos</li>
                  <li>• <code>media</code> - Imagens e vídeos</li>
                  <li>• <code>analytics</code> - Métricas de performance</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Vantagens da Arquitetura Híbrida</h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• <strong>Performance:</strong> Queries rápidas em campos indexados</li>
                    <li>• <strong>Flexibilidade:</strong> Estruturas complexas sem limitações</li>
                    <li>• <strong>Escalabilidade:</strong> Suporte eficiente a milhares de registros</li>
                    <li>• <strong>Evolução:</strong> Novos campos sem breaking changes</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Componente de Teste */}
        <TrainingProgramsHybridTest />
      </div>
    </div>
  );
}