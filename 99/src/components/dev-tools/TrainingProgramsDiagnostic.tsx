/**
 * 🔧 TRAINING PROGRAMS DIAGNOSTIC
 * 
 * Componente para diagnosticar problemas com training programs
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { trainingProgramsSimpleService } from '../../services/training-programs-simple.service';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function TrainingProgramsDiagnostic() {
  const { user, isAuthenticated } = useAuth();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    // Test 1: Auth Status
    addResult({
      test: 'Autenticação',
      status: isAuthenticated ? 'success' : 'warning',
      message: isAuthenticated ? `Usuário logado: ${user?.email}` : 'Usuário não autenticado',
      details: { userId: user?.id, email: user?.email }
    });

    // Test 2: Supabase Connection
    try {
      const testConnection = await trainingProgramsSimpleService.getPublic(1, 0);
      addResult({
        test: 'Conexão Supabase',
        status: 'success',
        message: 'Conexão com Supabase OK',
        details: { programsCount: testConnection.length }
      });
    } catch (error) {
      addResult({
        test: 'Conexão Supabase',
        status: 'error',
        message: `Erro de conexão: ${error.message}`,
        details: error
      });
    }

    // Test 3: Get Programs by Trainer (if authenticated)
    if (isAuthenticated && user?.id) {
      try {
        const programs = await trainingProgramsSimpleService.getByTrainerId(user.id);
        addResult({
          test: 'Buscar Programas do Trainer',
          status: 'success',
          message: `Encontrados ${programs.length} programas`,
          details: programs
        });
      } catch (error) {
        addResult({
          test: 'Buscar Programas do Trainer',
          status: 'error',
          message: `Erro: ${error.message}`,
          details: error
        });
      }
    } else {
      addResult({
        test: 'Buscar Programas do Trainer',
        status: 'warning',
        message: 'Pulado - usuário não autenticado',
        details: null
      });
    }

    // Test 4: Create Program (if authenticated)
    if (isAuthenticated && user?.id) {
      try {
        const testProgram = await trainingProgramsSimpleService.create({
          trainer_id: user.id,
          program_data: {
            title: 'Programa de Teste',
            category: 'teste',
            modality: 'online',
            level: 'iniciante',
            status: 'draft'
          }
        });

        addResult({
          test: 'Criar Programa',
          status: 'success',
          message: 'Programa criado com sucesso',
          details: testProgram
        });

        // Clean up - delete test program
        try {
          await trainingProgramsSimpleService.delete(testProgram.id);
          addResult({
            test: 'Deletar Programa de Teste',
            status: 'success',
            message: 'Programa de teste deletado',
            details: null
          });
        } catch (deleteError) {
          addResult({
            test: 'Deletar Programa de Teste',
            status: 'warning',
            message: `Não foi possível deletar: ${deleteError.message}`,
            details: deleteError
          });
        }

      } catch (error) {
        addResult({
          test: 'Criar Programa',
          status: 'error',
          message: `Erro: ${error.message}`,
          details: error
        });
      }
    } else {
      addResult({
        test: 'Criar Programa',
        status: 'warning',
        message: 'Pulado - usuário não autenticado',
        details: null
      });
    }

    setTesting(false);
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Training Programs - Diagnóstico</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ferramenta para diagnosticar problemas com o sistema de programas de treinamento
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runTests} 
              disabled={testing}
              className="bg-brand hover:bg-brand-hover"
            >
              {testing ? 'Executando Testes...' : 'Executar Diagnóstico'}
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Limpar Resultados
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Resultados dos Testes:</h3>
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{result.test}</span>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500">Ver detalhes</summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && !testing && (
            <div className="text-center py-8 text-gray-500">
              Clique em "Executar Diagnóstico" para começar os testes
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info sobre o usuário atual */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Usuário:</strong> {user?.email || 'Não logado'}
            </div>
            <div>
              <strong>ID:</strong> {user?.id || 'N/A'}
            </div>
            <div>
              <strong>Autenticado:</strong> {isAuthenticated ? '✅ Sim' : '❌ Não'}
            </div>
            <div>
              <strong>Modo:</strong> {user?.mode || 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TrainingProgramsDiagnostic;