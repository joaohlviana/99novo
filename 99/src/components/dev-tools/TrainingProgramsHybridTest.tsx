/**
 * COMPONENTE DE TESTE - TRAINING PROGRAMS HÍBRIDO
 * ===============================================
 * Testa o funcionamento completo do sistema híbrido de programas
 */

"use client";

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Rocket, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Database,
  Activity
} from 'lucide-react';

import { useTrainingPrograms } from '../../hooks/useTrainingPrograms';
import { TrainingProgramHybrid } from '../../services/training-programs.service';

export function TrainingProgramsHybridTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const {
    programs,
    loading,
    error,
    stats,
    createProgram,
    updateProgram,
    deleteProgram,
    publishProgram,
    unpublishProgram,
    refreshPrograms,
    refreshStats,
    publishedPrograms,
    draftPrograms
  } = useTrainingPrograms();

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${result}`]);
  };

  // ===============================================
  // TESTES INDIVIDUAIS
  // ===============================================

  const testCreateProgram = async () => {
    setActiveTest('create');
    try {
      addTestResult('🧪 Testando criação de programa...');
      
      const newProgram = await createProgram({
        title: `Programa Teste ${Date.now()}`,
        category: 'musculacao',
        modality: 'hibrido',
        level: 'intermediario',
        duration: 8,
        duration_type: 'weeks',
        frequency: 3,
        program_data: {
          basic_info: {
            tags: ['teste', 'hibrido', 'demo'],
            search_keywords: ['teste', 'demo']
          },
          description: {
            full_description: 'Programa criado para teste do sistema híbrido',
            short_description: 'Programa de teste',
            objectives: ['Testar sistema', 'Validar funcionalidade'],
            requirements: ['Acesso ao app'],
            what_you_get: ['Programa funcional', 'Testes validados']
          },
          pricing: {
            packages: [
              {
                name: 'Teste Básico',
                price: 99,
                description: 'Pacote de teste',
                features: ['Feature 1', 'Feature 2'],
                delivery_time: 1,
                revisions: 2,
                is_popular: false
              }
            ],
            add_ons: []
          },
          structure: {
            session_duration: 45,
            schedule: [
              {
                week: 1,
                sessions: [
                  { day: 'Segunda', focus: 'Teste A', exercises: 5 },
                  { day: 'Quarta', focus: 'Teste B', exercises: 6 }
                ]
              }
            ]
          },
          media: {
            cover_image: {
              url: 'https://via.placeholder.com/400x300',
              alt: 'Imagem de teste'
            },
            gallery: [],
            videos: []
          },
          analytics: {
            views: 0,
            inquiries: 0,
            conversions: 0
          },
          settings: {
            visibility: { public: true, searchable: true },
            interactions: { allow_inquiries: true }
          }
        }
      });

      if (newProgram) {
        addTestResult('✅ Programa criado com sucesso!');
        addTestResult(`📊 ID: ${newProgram.id}`);
        addTestResult(`💰 Base Price: ${newProgram.base_price} (calculado automaticamente)`);
        return newProgram;
      } else {
        addTestResult('❌ Falha na criação do programa');
        return null;
      }
    } catch (error) {
      addTestResult(`❌ Erro: ${error}`);
      return null;
    } finally {
      setActiveTest(null);
    }
  };

  const testUpdateProgram = async (programId: string) => {
    setActiveTest('update');
    try {
      addTestResult('🧪 Testando atualização de programa...');
      
      const updated = await updateProgram(programId, {
        title: 'Programa Atualizado - Teste Híbrido',
        program_data: {
          description: {
            full_description: 'Descrição atualizada via teste',
            objectives: ['Objetivo atualizado', 'Novo objetivo']
          },
          pricing: {
            packages: [
              {
                name: 'Pacote Atualizado',
                price: 149,
                description: 'Pacote com preço atualizado',
                features: ['Feature atualizada', 'Nova feature'],
                delivery_time: 2,
                revisions: 3,
                is_popular: true
              }
            ]
          }
        }
      });

      if (updated) {
        addTestResult('✅ Programa atualizado com sucesso!');
        addTestResult(`💰 Novo Base Price: ${updated.base_price}`);
        return updated;
      } else {
        addTestResult('❌ Falha na atualização do programa');
        return null;
      }
    } catch (error) {
      addTestResult(`❌ Erro: ${error}`);
      return null;
    } finally {
      setActiveTest(null);
    }
  };

  const testPublishProgram = async (programId: string) => {
    setActiveTest('publish');
    try {
      addTestResult('🧪 Testando publicação de programa...');
      
      const success = await publishProgram(programId);
      
      if (success) {
        addTestResult('✅ Programa publicado com sucesso!');
        return true;
      } else {
        addTestResult('❌ Falha na publicação do programa');
        return false;
      }
    } catch (error) {
      addTestResult(`❌ Erro: ${error}`);
      return false;
    } finally {
      setActiveTest(null);
    }
  };

  const testCompleteFlow = async () => {
    setActiveTest('complete');
    try {
      addTestResult('🚀 Iniciando teste completo do fluxo...');
      
      // 1. Criar programa
      const program = await testCreateProgram();
      if (!program) return;
      
      // 2. Atualizar programa
      await testUpdateProgram(program.id);
      
      // 3. Publicar programa
      await testPublishProgram(program.id);
      
      // 4. Atualizar estatísticas
      await refreshStats();
      
      addTestResult('🎉 Teste completo finalizado com sucesso!');
      
    } catch (error) {
      addTestResult(`❌ Erro no fluxo completo: ${error}`);
    } finally {
      setActiveTest(null);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // ===============================================
  // RENDER
  // ===============================================

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">🧪 Teste - Training Programs Híbrido</h1>
        <p className="text-muted-foreground">
          Teste completo do sistema híbrido de programas de treino
        </p>
      </div>

      {/* Estatísticas Atuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estatísticas Atuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{programs.length}</div>
              <div className="text-sm text-muted-foreground">Total Programas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{publishedPrograms.length}</div>
              <div className="text-sm text-muted-foreground">Publicados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{draftPrograms.length}</div>
              <div className="text-sm text-muted-foreground">Rascunhos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.total_views || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Programas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Programas Atuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando programas...
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          {programs.length === 0 && !loading && (
            <p className="text-muted-foreground">Nenhum programa encontrado</p>
          )}
          
          <div className="space-y-3">
            {programs.map((program) => (
              <div key={program.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{program.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{program.category}</Badge>
                      <Badge variant="outline">{program.modality}</Badge>
                      <Badge variant={program.is_published ? "default" : "secondary"}>
                        {program.is_published ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      R$ {program.base_price} • {program.duration} {program.duration_type} • {program.frequency}x/sem
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testUpdateProgram(program.id)}
                      disabled={activeTest === 'update'}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testPublishProgram(program.id)}
                      disabled={activeTest === 'publish' || program.is_published}
                    >
                      <Rocket className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controles de Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Controles de Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={testCreateProgram}
              disabled={activeTest === 'create'}
              className="flex items-center gap-2"
            >
              {activeTest === 'create' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Criar Programa
            </Button>

            <Button
              onClick={testCompleteFlow}
              disabled={activeTest === 'complete'}
              variant="outline"
              className="flex items-center gap-2"
            >
              {activeTest === 'complete' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Teste Completo
            </Button>

            <Button
              onClick={refreshPrograms}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              Atualizar Lista
            </Button>

            <Button
              onClick={clearResults}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Log
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log de Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Log de Testes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">Execute um teste para ver os resultados</p>
            ) : (
              <pre className="text-sm space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="font-mono text-xs">
                    {result}
                  </div>
                ))}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}