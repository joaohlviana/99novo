import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner@2.0.3';

export default function DatabaseTablesTestPage() {
  const [tables, setTables] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const expectedTables = [
    'user_profiles',
    'trainer_profiles', 
    'client_profiles',
    'trainer_favorites',
    'program_enrollments',
    'programs',
    'sports',
    'cities',
    'conversations',
    'messages',
    'profile_visits',
    'notifications',
    'media_files',
    'workouts',
    'exercises'
  ];

  const fetchTables = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testando acesso direto às tabelas...');

      // Testar acesso a cada tabela esperada
      const results = [];
      const discoveredTables = [];

      for (const tableName of expectedTables) {
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          const result = {
            table: tableName,
            exists: !error,
            accessible: !error,
            count: count || 0,
            error: error?.message || null
          };

          results.push(result);

          if (!error) {
            discoveredTables.push(tableName);
          }
        } catch (err: any) {
          results.push({
            table: tableName,
            exists: false,
            accessible: false,
            count: 0,
            error: err.message
          });
        }
      }

      // Também testar algumas tabelas comuns que podem existir
      const additionalTables = [
        'profiles', 
        'users', 
        'auth.users',
        'storage.objects',
        'storage.buckets'
      ];

      for (const tableName of additionalTables) {
        if (!expectedTables.includes(tableName)) {
          try {
            const { data, error, count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });

            if (!error) {
              discoveredTables.push(tableName);
              results.push({
                table: tableName,
                exists: true,
                accessible: true,
                count: count || 0,
                error: null
              });
            }
          } catch (err: any) {
            // Silenciar erros para tabelas adicionais
          }
        }
      }

      setTables(discoveredTables);
      setTestResults(results);
      
      console.log('📋 Tabelas acessíveis encontradas:', discoveredTables);
      console.log('🧪 Resultados dos testes:', results);
      
      const accessibleCount = results.filter(r => r.exists).length;
      toast.success(`Teste concluído! ${accessibleCount}/${results.length} tabelas testadas são acessíveis`);

    } catch (error: any) {
      console.error('Erro geral:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Database Tables Test</h1>
        <Button onClick={fetchTables} disabled={loading}>
          {loading ? 'Testando...' : 'Recarregar Teste'}
        </Button>
      </div>

      {/* Resumo dos Testes */}
      <Card className="p-6">
        <h2 className="text-xl font-medium mb-4">Resumo dos Testes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {testResults.filter(r => r.exists).length}
            </div>
            <div className="text-sm text-green-700">Tabelas Acessíveis</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {testResults.filter(r => !r.exists).length}
            </div>
            <div className="text-sm text-red-700">Tabelas Inacessíveis</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {testResults.reduce((sum, r) => sum + (r.count || 0), 0)}
            </div>
            <div className="text-sm text-blue-700">Total de Registros</div>
          </div>
        </div>
        {tables.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Tabelas Descobertas:</h3>
            <div className="flex flex-wrap gap-2">
              {tables.map((table) => (
                <span key={table} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {table}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Resultados dos Testes */}
      <Card className="p-6">
        <h2 className="text-xl font-medium mb-4">Teste de Acesso às Tabelas Esperadas</h2>
        <div className="space-y-2">
          {testResults.map((result) => (
            <div key={result.table} className={`p-3 rounded ${
              result.exists 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{result.table}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    result.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.exists ? '✅ Existe' : '❌ Não existe'}
                  </span>
                  {result.exists && (
                    <span className="text-xs text-gray-600">
                      {result.count} registros
                    </span>
                  )}
                </div>
              </div>
              {result.error && (
                <div className="text-xs text-red-600 mt-1">
                  Erro: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}