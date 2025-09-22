import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner@2.0.3';

export default function DatabaseSchemaDebugPage() {
  const [schemaInfo, setSchemaInfo] = useState<any>(null);
  const [userTables, setUserTables] = useState<any[]>([]);
  const [userProfilesInfo, setUserProfilesInfo] = useState<any>(null);
  const [trainerProfilesInfo, setTrainerProfilesInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSchemaInfo = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testando acesso direto às tabelas do sistema...');

      // Lista das tabelas que esperamos ter no sistema
      const expectedTables = [
        'user_profiles',
        'trainer_profiles', 
        'client_profiles',
        'programs',
        'sports',
        'cities',
        'trainer_favorites',
        'program_enrollments',
        'conversations',
        'messages',
        'profile_visits',
        'notifications',
        'media_files'
      ];

      const tableResults = [];
      
      // Testar acesso a cada tabela
      for (const tableName of expectedTables) {
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          tableResults.push({
            table_name: tableName,
            table_type: error ? 'INACCESSIBLE' : 'BASE TABLE',
            exists: !error,
            count: count || 0,
            error: error?.message || null
          });
        } catch (err: any) {
          tableResults.push({
            table_name: tableName,
            table_type: 'ERROR',
            exists: false,
            count: 0,
            error: err.message
          });
        }
      }

      setUserTables(tableResults);
      console.log('📋 Resultados do teste de tabelas:', tableResults);

      // Testar estrutura de user_profiles se existir
      const userProfilesTable = tableResults.find(t => t.table_name === 'user_profiles');
      if (userProfilesTable?.exists) {
        try {
          // Tentar obter uma amostra de dados para inferir estrutura
          const { data: sampleData, error } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(1);

          if (sampleData && sampleData.length > 0) {
            const sample = sampleData[0];
            const columns = Object.keys(sample).map((key, index) => ({
              column_name: key,
              data_type: typeof sample[key],
              ordinal_position: index + 1,
              sample_value: sample[key]
            }));

            setUserProfilesInfo({ 
              table_name: 'user_profiles',
              columns: columns,
              sample_count: 1
            });
          } else {
            setUserProfilesInfo({ 
              table_name: 'user_profiles',
              columns: [],
              sample_count: 0,
              note: 'Tabela vazia - não foi possível inferir estrutura'
            });
          }
        } catch (err: any) {
          console.error('Erro ao analisar user_profiles:', err);
        }
      }

      // Testar estrutura de trainer_profiles se existir
      const trainerProfilesTable = tableResults.find(t => t.table_name === 'trainer_profiles');
      if (trainerProfilesTable?.exists) {
        try {
          const { data: sampleData, error } = await supabase
            .from('trainer_profiles')
            .select('*')
            .limit(1);

          if (sampleData && sampleData.length > 0) {
            const sample = sampleData[0];
            const columns = Object.keys(sample).map((key, index) => ({
              column_name: key,
              data_type: typeof sample[key],
              ordinal_position: index + 1,
              sample_value: sample[key]
            }));

            setTrainerProfilesInfo({
              table_name: 'trainer_profiles', 
              columns: columns,
              sample_count: 1
            });
          } else {
            setTrainerProfilesInfo({
              table_name: 'trainer_profiles', 
              columns: [],
              sample_count: 0,
              note: 'Tabela vazia - não foi possível inferir estrutura'
            });
          }
        } catch (err: any) {
          console.error('Erro ao analisar trainer_profiles:', err);
        }
      }

      // Criar um "snapshot" básico
      const accessibleTables = tableResults.filter(t => t.exists);
      const basicSnapshot = {
        schema: 'public',
        tables: accessibleTables.map(t => t.table_name),
        accessible_tables: accessibleTables.length,
        inaccessible_tables: tableResults.filter(t => !t.exists).length,
        total_tested: tableResults.length,
        timestamp: new Date().toISOString()
      };
      setSchemaInfo(basicSnapshot);
      console.log('📸 Snapshot de teste criado:', basicSnapshot);

      toast.success(`Teste concluído! ${accessibleTables.length}/${tableResults.length} tabelas acessíveis`);
    } catch (error: any) {
      console.error('Erro geral:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemaInfo();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Database Tables Access Test</h1>
        <Button onClick={fetchSchemaInfo} disabled={loading}>
          {loading ? 'Testando...' : 'Recarregar Teste'}
        </Button>
      </div>

      {/* Tabelas Gerais */}
      <Card className="p-6">
        <h2 className="text-xl font-medium mb-4">Teste de Acesso às Tabelas</h2>
        <div className="space-y-2">
          {userTables.map((table, index) => (
            <div key={`${table.table_name}-${index}`} className={`p-3 rounded ${
              table.exists 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="font-medium">{table.table_name}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    table.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {table.exists ? '✅ Acessível' : '❌ Inacessível'}
                  </span>
                  {table.exists && (
                    <span className="text-xs text-gray-600">
                      {table.count} registros
                    </span>
                  )}
                </div>
              </div>
              {table.error && (
                <div className="text-xs text-red-600 mt-1">
                  Erro: {table.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* user_profiles Details */}
      {userProfilesInfo && (
        <Card className="p-6">
          <h2 className="text-xl font-medium mb-4">user_profiles - Estrutura Inferida</h2>
          {userProfilesInfo.note && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              {userProfilesInfo.note}
            </div>
          )}
          <div className="space-y-2">
            {userProfilesInfo.columns?.length > 0 ? userProfilesInfo.columns.map((col: any, index: number) => (
              <div key={`${col.column_name}-${index}`} className="p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{col.column_name}</span> 
                    <span className="text-gray-600 ml-2">({col.data_type})</span>
                  </div>
                  {col.sample_value !== null && col.sample_value !== undefined && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Ex: {JSON.stringify(col.sample_value)}
                    </span>
                  )}
                </div>
              </div>
            )) : <p className="text-gray-500">Nenhuma coluna encontrada</p>}
          </div>
        </Card>
      )}

      {/* trainer_profiles Details */}
      {trainerProfilesInfo && (
        <Card className="p-6">
          <h2 className="text-xl font-medium mb-4">trainer_profiles - Estrutura Inferida</h2>
          {trainerProfilesInfo.note && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              {trainerProfilesInfo.note}
            </div>
          )}
          <div className="space-y-2">
            {trainerProfilesInfo.columns?.length > 0 ? trainerProfilesInfo.columns.map((col: any, index: number) => (
              <div key={`${col.column_name}-${index}`} className="p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{col.column_name}</span> 
                    <span className="text-gray-600 ml-2">({col.data_type})</span>
                  </div>
                  {col.sample_value !== null && col.sample_value !== undefined && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Ex: {JSON.stringify(col.sample_value)}
                    </span>
                  )}
                </div>
              </div>
            )) : <p className="text-gray-500">Nenhuma coluna encontrada</p>}
          </div>
        </Card>
      )}

      {/* Schema Snapshot */}
      {schemaInfo && (
        <Card className="p-6">
          <h2 className="text-xl font-medium mb-4">Schema Snapshot Completo</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(schemaInfo, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}