/**
 * 🧪 TRAINER SUPABASE SERVICE TEST
 * 
 * Teste simples para verificar se o trainersSupabaseService funciona corretamente
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { trainersSupabaseService } from '../../services/trainers-supabase.service';

export function TrainerSupabaseServiceTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testTrainerService = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log('🧪 Testando TrainerSupabaseService...');
      
      // Teste com um ID fictício
      const testId = '550e8400-e29b-41d4-a716-446655440001';
      const response = await trainersSupabaseService.getTrainerById(testId);
      
      console.log('✅ Resposta do service:', response);
      setResult(response);
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl mb-4">🧪 Trainer Supabase Service Test</h2>
      
      <div className="space-y-4">
        <Button 
          onClick={testTrainerService}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testando...' : 'Testar Service'}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800">❌ Erro</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800">✅ Resultado</h3>
            <pre className="text-sm text-green-600 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
}

export default TrainerSupabaseServiceTest;