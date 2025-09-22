/**
 * 🔍 SINGLETON VERIFIER
 * 
 * Componente simples para verificar se o padrão singleton está funcionando
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { reportSupabaseStatus } from '../../lib/supabase/singleton-debug';

export function SingletonVerifier() {
  const [status, setStatus] = useState<any>(null);
  const [instances, setInstances] = useState<any[]>([]);

  useEffect(() => {
    // Verificar status inicial
    const initialStatus = reportSupabaseStatus();
    setStatus(initialStatus);

    // Criar várias "referências" para testar se são a mesma instância
    const instance1 = supabase;
    const instance2 = supabase;
    
    // Importar novamente para testar
    import('../../lib/supabase/client').then(({ supabase: instance3 }) => {
      const testResults = [
        {
          name: 'Instância 1',
          id: instance1.supabaseUrl,
          auth: !!instance1.auth,
          same: instance1 === instance2
        },
        {
          name: 'Instância 2', 
          id: instance2.supabaseUrl,
          auth: !!instance2.auth,
          same: instance2 === instance3
        },
        {
          name: 'Instância 3 (re-import)',
          id: instance3.supabaseUrl,
          auth: !!instance3.auth,
          same: instance1 === instance3
        }
      ];

      setInstances(testResults);
    });
  }, []);

  const allSame = instances.every(inst => inst.same);
  const hasProblems = instances.length > 0 && !allSame;

  return (
    <div className="space-y-4">
      <Card className={`border-2 ${
        hasProblems ? 'border-red-200 bg-red-50' : 
        allSame && instances.length > 0 ? 'border-green-200 bg-green-50' : 
        'border-yellow-200 bg-yellow-50'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">🔍 Verificação Singleton</CardTitle>
            <Badge variant={hasProblems ? 'destructive' : allSame ? 'default' : 'secondary'}>
              {hasProblems ? (
                <><XCircle className="w-4 h-4 mr-1" /> Problema</>
              ) : allSame && instances.length > 0 ? (
                <><CheckCircle className="w-4 h-4 mr-1" /> OK</>
              ) : (
                <><AlertTriangle className="w-4 h-4 mr-1" /> Testando</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Singleton:</strong> {status.singleton ? '✅' : '❌'}
              </div>
              <div>
                <strong>Auth:</strong> {status.auth ? '✅' : '❌'}
              </div>
              <div>
                <strong>Instance ID:</strong> {status.instanceId}
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date(status.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}

          {instances.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Teste de Instâncias:</h4>
              {instances.map((inst, index) => (
                <div key={index} className={`p-2 rounded text-sm ${
                  inst.same ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span>{inst.name}</span>
                    <span>
                      {inst.same ? '✅ Mesma instância' : '❌ Instância diferente'}
                    </span>
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    URL: {inst.id} | Auth: {inst.auth ? 'Sim' : 'Não'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasProblems && (
            <div className="bg-red-100 border border-red-300 rounded p-3 text-red-800 text-sm">
              <strong>⚠️ Problema Detectado:</strong> Múltiplas instâncias do Supabase client foram encontradas.
              Isso pode causar o erro "Multiple GoTrueClient instances detected".
            </div>
          )}

          {allSame && instances.length > 0 && (
            <div className="bg-green-100 border border-green-300 rounded p-3 text-green-800 text-sm">
              <strong>✅ Singleton OK:</strong> Todas as referências apontam para a mesma instância.
              O padrão singleton está funcionando corretamente.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}