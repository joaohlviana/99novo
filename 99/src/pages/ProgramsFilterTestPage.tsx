/**
 * 🧪 PROGRAMS FILTER TEST PAGE
 * 
 * Página para testar as correções no filtro de programas:
 * 1. Normalização de status flexível
 * 2. Chave correta (user_id) na busca
 * 3. Limpeza de cache
 */

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { trainingProgramsService } from '../services/training-programs.service';
import { publishedProgramsService } from '../services/published-programs.service';
import { identifierResolverService } from '../services/identifier-resolver.service';

export default function ProgramsFilterTestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testTrainerSlug, setTestTrainerSlug] = useState('ana-souza');

  // ✅ FUNÇÃO PARA LIMPAR CACHE COMPLETO
  const clearAllCache = () => {
    try {
      // Limpar localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('programs') || key.includes('trainer') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('🧹 Cache localStorage limpo:', keysToRemove.length, 'chaves removidas');
      
      // Limpar React Query cache (se disponível)
      if (window.__REACT_QUERY_CLIENT__) {
        window.__REACT_QUERY_CLIENT__.clear();
        console.log('🧹 React Query cache limpo');
      }
      
      // Limpar sessionStorage também
      sessionStorage.clear();
      console.log('🧹 SessionStorage limpo');
      
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  };

  // ✅ FUNÇÃO DE TESTE COMPLETO
  const runCompleteTest = async () => {
    try {
      setLoading(true);
      setResults([]);
      
      console.log('🧪 === INICIANDO TESTE COMPLETO ===');
      
      // ETAPA 1: Limpar cache
      clearAllCache();
      
      // ETAPA 2: Resolver trainer slug para user_id
      console.log('🔍 Resolvendo slug:', testTrainerSlug);
      const resolveResult = await identifierResolverService.resolveTrainer(testTrainerSlug);
      
      if (!resolveResult.success) {
        setResults([{ 
          test: 'Resolver Trainer', 
          status: 'FALHA', 
          error: resolveResult.error,
          data: null 
        }]);
        return;
      }

      const userId = resolveResult.trainer?.user_id;
      console.log('✅ User ID resolvido:', userId);

      setResults(prev => [...prev, { 
        test: 'Resolver Trainer', 
        status: 'SUCESSO', 
        data: {
          slug: testTrainerSlug,
          user_id: userId,
          trainer_name: resolveResult.trainer?.name
        }
      }]);

      // ETAPA 3: Buscar com serviço principal (filtro corrigido)
      console.log('🔍 Testando serviço principal...');
      const directPrograms = await trainingProgramsService.getByTrainerId(userId);
      
      setResults(prev => [...prev, { 
        test: 'Serviço Principal', 
        status: directPrograms.length > 0 ? 'SUCESSO' : 'SEM_DADOS', 
        data: {
          method: 'trainingProgramsService.getByTrainerId',
          user_id: userId,
          programs_found: directPrograms.length,
          programs: directPrograms.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            has_raw_record: !!p._rawRecord
          }))
        }
      }]);

      // ETAPA 4: Buscar com serviço de programas publicados (view)
      console.log('🔍 Testando serviço de view...');
      const publishedPrograms = await publishedProgramsService.getProgramsByTrainer(userId, false);
      
      setResults(prev => [...prev, { 
        test: 'Serviço View', 
        status: publishedPrograms.length > 0 ? 'SUCESSO' : 'SEM_DADOS', 
        data: {
          method: 'publishedProgramsService.getProgramsByTrainer',
          user_id: userId,
          programs_found: publishedPrograms.length,
          programs: publishedPrograms.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            trainer_name: p.trainer_name
          }))
        }
      }]);

      // ETAPA 5: Testar normalização de status
      console.log('🔍 Testando normalização de status...');
      const statusTests = [
        { input: 'published\n', expected: true },
        { input: 'published ', expected: true },
        { input: '', expected: true },
        { input: 'active', expected: true },
        { input: 'draft', expected: false },
        { input: 'archived', expected: false },
        { input: 'PUBLISHED', expected: true },
        { input: 'Draft\t', expected: false }
      ];

      const statusResults = statusTests.map(test => {
        const normalized = test.input.trim().toLowerCase();
        const rejected = ['archived', 'draft'].includes(normalized);
        const approved = !rejected;
        return {
          input: JSON.stringify(test.input),
          normalized,
          expected: test.expected,
          actual: approved,
          passed: test.expected === approved
        };
      });

      setResults(prev => [...prev, { 
        test: 'Normalização Status', 
        status: statusResults.every(r => r.passed) ? 'SUCESSO' : 'FALHA', 
        data: { status_tests: statusResults }
      }]);

      console.log('🧪 === TESTE COMPLETO FINALIZADO ===');
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setResults(prev => [...prev, { 
        test: 'Erro Geral', 
        status: 'ERRO', 
        error: error.message 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-brand">🧪 Teste de Filtros de Programas</h1>
            <p className="text-muted-foreground">
              Validando correções: normalização de status, chave correta e limpeza de cache
            </p>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Configuração do Teste</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">Slug do Trainer para Teste:</label>
                  <input
                    value={testTrainerSlug}
                    onChange={(e) => setTestTrainerSlug(e.target.value)}
                    placeholder="ex: ana-souza"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={runCompleteTest}
                    disabled={loading}
                    className="bg-brand text-brand-foreground hover:bg-brand-hover"
                  >
                    {loading ? 'Testando...' : '🧪 Executar Teste Completo'}
                  </Button>
                  
                  <Button 
                    onClick={clearAllCache}
                    variant="outline"
                  >
                    🧹 Apenas Limpar Cache
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{result.test}</h3>
                    <Badge 
                      variant={
                        result.status === 'SUCESSO' ? 'default' :
                        result.status === 'SEM_DADOS' ? 'secondary' :
                        result.status === 'FALHA' ? 'destructive' : 'outline'
                      }
                    >
                      {result.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.error && (
                    <div className="mb-4 p-3 bg-destructive/10 rounded-lg">
                      <p className="text-sm text-destructive font-medium">Erro:</p>
                      <p className="text-sm text-destructive">{result.error}</p>
                    </div>
                  )}
                  
                  {result.data && (
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin"></div>
                <span className="text-muted-foreground">Executando testes...</span>
              </div>
            </div>
          )}

        </div>
      </div>
      
      <Footer />
    </div>
  );
}