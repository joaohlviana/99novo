/**
 * 🔍 DIAGNÓSTICO DE ERRO - VARIÁVEIS DE AMBIENTE
 * Componente para identificar onde está o erro de VITE_SUPABASE_URL
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ErrorInfo {
  location: string;
  error: string;
  details: any;
}

export function ErrorDiagnostic() {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [env, setEnv] = useState<any>({});

  useEffect(() => {
    const errorList: ErrorInfo[] = [];

    // 1. Testar import.meta.env
    try {
      const metaEnv = import.meta.env;
      console.log('✅ import.meta.env available:', metaEnv);
      setEnv(prev => ({ ...prev, metaEnv }));
    } catch (error) {
      errorList.push({
        location: 'import.meta.env',
        error: error.message,
        details: error
      });
    }

    // 2. Testar process.env
    try {
      const processEnv = (globalThis as any).process?.env || {};
      console.log('✅ process.env available:', Object.keys(processEnv));
      setEnv(prev => ({ ...prev, processEnv }));
    } catch (error) {
      errorList.push({
        location: 'process.env',
        error: error.message,
        details: error
      });
    }

    // 3. Testar info.tsx
    try {
      import('../utils/supabase/info').then(info => {
        console.log('✅ info.tsx loaded:', info);
        setEnv(prev => ({ ...prev, info }));
      });
    } catch (error) {
      errorList.push({
        location: '../utils/supabase/info',
        error: error.message,
        details: error
      });
    }

    // 4. Testar client.ts
    try {
      import('../lib/supabase/client').then(client => {
        console.log('✅ supabase client loaded:', !!client.supabase);
        setEnv(prev => ({ ...prev, client: !!client.supabase }));
      });
    } catch (error) {
      errorList.push({
        location: '../lib/supabase/client',
        error: error.message,
        details: error
      });
    }

    setErrors(errorList);
  }, []);

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Diagnóstico de Variáveis de Ambiente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Environment Variables */}
          <div>
            <h3 className="font-semibold mb-2">Variáveis Disponíveis:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(env, null, 2)}
            </pre>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-red-600">Erros Encontrados:</h3>
              {errors.map((error, index) => (
                <div key={index} className="bg-red-50 p-3 rounded mb-2">
                  <div className="font-medium text-red-800">{error.location}</div>
                  <div className="text-red-600 text-sm">{error.error}</div>
                </div>
              ))}
            </div>
          )}

          {/* Success */}
          {errors.length === 0 && (
            <div className="bg-green-50 p-3 rounded">
              <div className="text-green-800 font-medium">✅ Todas as importações funcionando</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}