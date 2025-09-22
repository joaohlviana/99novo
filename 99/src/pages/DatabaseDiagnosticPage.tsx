import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { CheckCircle, XCircle, AlertCircle, Database, Users, Calendar } from 'lucide-react';

interface TableDiagnostic {
  name: string;
  category: 'core' | 'profiles' | 'content' | 'interactions' | 'system';
  exists: boolean;
  count: number;
  error?: string;
  required: boolean;
  description: string;
}

export default function DatabaseDiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<TableDiagnostic[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    existing: 0,
    required: 0,
    requiredExisting: 0
  });

  const tableConfig: Omit<TableDiagnostic, 'exists' | 'count' | 'error'>[] = [
    // Core system tables
    { name: 'user_profiles', category: 'core', required: true, description: 'Perfis básicos dos usuários' },
    { name: 'cities', category: 'core', required: true, description: 'Cidades para localização' },
    { name: 'sports', category: 'core', required: true, description: 'Modalidades esportivas' },
    
    // Profile tables
    { name: 'trainer_profiles', category: 'profiles', required: true, description: 'Perfis específicos de treinadores' },
    { name: 'client_profiles', category: 'profiles', required: true, description: 'Perfis específicos de clientes' },
    
    // Content tables
    { name: 'programs', category: 'content', required: true, description: 'Programas de treinamento' },
    { name: 'workouts', category: 'content', required: false, description: 'Treinos individuais' },
    { name: 'exercises', category: 'content', required: false, description: 'Exercícios' },
    
    // Interaction tables
    { name: 'program_enrollments', category: 'interactions', required: true, description: 'Matrículas em programas' },
    { name: 'favorites', category: 'interactions', required: false, description: 'Treinadores favoritos' },
    { name: 'trainer_favorites', category: 'interactions', required: false, description: 'Treinadores favoritos (alt)' },
    { name: 'conversations', category: 'interactions', required: false, description: 'Conversas entre usuários' },
    { name: 'messages', category: 'interactions', required: false, description: 'Mensagens' },
    
    // System tables
    { name: 'notifications', category: 'system', required: false, description: 'Notificações do sistema' },
    { name: 'media_files', category: 'system', required: false, description: 'Arquivos de mídia' },
    { name: 'profile_visits', category: 'system', required: false, description: 'Visitas a perfis' }
  ];

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      console.log('🔍 Executando diagnóstico completo do banco...');

      const results: TableDiagnostic[] = [];

      for (const config of tableConfig) {
        try {
          const { data, error, count } = await supabase
            .from(config.name)
            .select('*', { count: 'exact', head: true });

          results.push({
            ...config,
            exists: !error,
            count: count || 0,
            error: error?.message
          });
        } catch (err: any) {
          results.push({
            ...config,
            exists: false,
            count: 0,
            error: err.message
          });
        }
      }

      setDiagnostics(results);

      const summaryData = {
        total: results.length,
        existing: results.filter(r => r.exists).length,
        required: results.filter(r => r.required).length,
        requiredExisting: results.filter(r => r.required && r.exists).length
      };
      setSummary(summaryData);

      console.log('📊 Diagnóstico concluído:', summaryData);
      toast.success(`Diagnóstico concluído! ${summaryData.existing}/${summaryData.total} tabelas disponíveis`);

    } catch (error: any) {
      console.error('Erro no diagnóstico:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return Database;
      case 'profiles': return Users;
      case 'content': return Calendar;
      case 'interactions': return CheckCircle;
      case 'system': return AlertCircle;
      default: return Database;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'profiles': return 'bg-green-50 text-green-700 border-green-200';
      case 'content': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'interactions': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'system': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const groupedDiagnostics = diagnostics.reduce((acc, diag) => {
    if (!acc[diag.category]) acc[diag.category] = [];
    acc[diag.category].push(diag);
    return acc;
  }, {} as Record<string, TableDiagnostic[]>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Database Diagnostic</h1>
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? 'Diagnosticando...' : 'Executar Diagnóstico'}
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
          <div className="text-sm text-gray-600">Tabelas Testadas</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{summary.existing}</div>
          <div className="text-sm text-gray-600">Tabelas Existentes</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{summary.required}</div>
          <div className="text-sm text-gray-600">Tabelas Obrigatórias</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{summary.requiredExisting}</div>
          <div className="text-sm text-gray-600">Obrigatórias OK</div>
        </Card>
      </div>

      {/* Status das Funcionalidades */}
      <Card className="p-6">
        <h2 className="text-xl font-medium mb-4">Status das Funcionalidades</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {summary.requiredExisting >= 5 ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span className="text-sm">Sistema básico de usuários e perfis</span>
          </div>
          <div className="flex items-center gap-2">
            {diagnostics.find(d => d.name === 'programs')?.exists ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span className="text-sm">Gestão de programas de treinamento</span>
          </div>
          <div className="flex items-center gap-2">
            {diagnostics.find(d => d.name === 'program_enrollments')?.exists ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span className="text-sm">Sistema de matrículas</span>
          </div>
          <div className="flex items-center gap-2">
            {diagnostics.some(d => ['favorites', 'trainer_favorites'].includes(d.name) && d.exists) ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span className="text-sm">Sistema de favoritos</span>
          </div>
          <div className="flex items-center gap-2">
            {diagnostics.find(d => d.name === 'conversations')?.exists ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span className="text-sm">Sistema de mensagens</span>
          </div>
        </div>
      </Card>

      {/* Diagnóstico por Categoria */}
      {Object.entries(groupedDiagnostics).map(([category, tables]) => {
        const IconComponent = getCategoryIcon(category);
        const colorClass = getCategoryColor(category);
        
        return (
          <Card key={category} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-medium capitalize">{category}</h2>
              <Badge variant="outline">
                {tables.filter(t => t.exists).length}/{tables.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {tables.map((table) => (
                <div key={table.name} className={`p-3 rounded ${
                  table.exists 
                    ? 'bg-green-50 border border-green-200' 
                    : table.required 
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {table.exists ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> : 
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {table.name}
                          {table.required && <Badge variant="destructive" className="text-xs">Obrigatória</Badge>}
                        </div>
                        <div className="text-sm text-gray-600">{table.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {table.exists && (
                        <div className="text-sm text-gray-600">
                          {table.count} registros
                        </div>
                      )}
                      {table.error && (
                        <div className="text-xs text-red-600 max-w-xs truncate">
                          {table.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}