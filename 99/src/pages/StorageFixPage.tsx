import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { AlertTriangle, CheckCircle, XCircle, Settings, Shield, Database, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BucketStatus {
  name: string;
  public: boolean;
  status: string;
  createdAt: string;
}

interface StorageStatus {
  success: boolean;
  message: string;
  buckets: BucketStatus[];
  summary: {
    total: number;
    expectedBuckets: number;
    privateBuckets: number;
    publicBuckets: number;
    isComplete: boolean;
    allPrivate: boolean;
  };
  warnings: string[];
}

export default function StorageFixPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [fixResults, setFixResults] = useState<any>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkAuthStatus();
    checkServerStatus();
    checkStorageStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setAuthStatus(session?.user ? 'authenticated' : 'unauthenticated');
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthStatus('unauthenticated');
    }
  };

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      console.error('Server check error:', error);
      setServerStatus('offline');
    }
  };

  const checkStorageStatus = async () => {
    if (serverStatus !== 'online') return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/setup-storage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStorageStatus(data);
      } else {
        console.error('Storage status check failed');
      }
    } catch (error) {
      console.error('Error checking storage status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fixBucketPrivacy = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/fix-bucket-privacy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFixResults(data);
        
        // Refresh storage status after fix
        setTimeout(() => {
          checkStorageStatus();
        }, 1000);
      } else {
        console.error('Fix bucket privacy failed');
      }
    } catch (error) {
      console.error('Error fixing bucket privacy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInTestUser = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ana@demo.fit',
        password: 'senha123'
      });

      if (error) throw error;
      setAuthStatus('authenticated');
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const getBucketStatusBadge = (bucket: BucketStatus) => {
    if (bucket.public) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Público (❌ Problema)
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <Shield className="w-3 h-3 mr-1" />
          Privado (✅ Correto)
        </Badge>
      );
    }
  };

  const getOverallStatus = () => {
    if (!storageStatus) return { color: 'gray', icon: <Database className="w-4 h-4" />, text: 'Verificando...' };
    
    if (storageStatus.success && storageStatus.summary.allPrivate && storageStatus.summary.isComplete) {
      return { color: 'green', icon: <CheckCircle className="w-4 h-4" />, text: 'Tudo configurado corretamente' };
    } else if (storageStatus.summary.publicBuckets > 0) {
      return { color: 'red', icon: <AlertTriangle className="w-4 h-4" />, text: 'Buckets públicos detectados' };
    } else {
      return { color: 'yellow', icon: <AlertTriangle className="w-4 h-4" />, text: 'Configuração parcial' };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Storage Fix & Diagnosis</h1>
        <p className="text-muted-foreground">
          Diagnóstico e correção automática dos problemas de storage
        </p>
      </div>

      {/* Server Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              serverStatus === 'online' ? 'bg-green-500' : 
              serverStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            Status do Servidor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`${
            serverStatus === 'online' ? 'text-green-600' : 
            serverStatus === 'checking' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {serverStatus === 'online' ? 'Servidor online' : 
             serverStatus === 'checking' ? 'Verificando servidor...' : 'Servidor offline'}
          </p>
        </CardContent>
      </Card>

      {/* Auth Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              authStatus === 'authenticated' ? 'bg-green-500' : 
              authStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            Status de Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {authStatus === 'unauthenticated' && (
            <div className="space-y-4">
              <p className="text-red-600">Usuário não autenticado</p>
              <Button onClick={signInTestUser} variant="outline">
                Fazer Login (ana@demo.fit)
              </Button>
            </div>
          )}
          
          {authStatus === 'authenticated' && (
            <p className="text-green-600">Usuário autenticado</p>
          )}
        </CardContent>
      </Card>

      {/* Storage Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-${overallStatus.color}-500`} />
            Status do Storage
            <Button 
              onClick={checkStorageStatus} 
              variant="ghost" 
              size="sm"
              disabled={isLoading || serverStatus !== 'online'}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && serverStatus === 'online' && (
            <p className="text-muted-foreground">Verificando configuração do storage...</p>
          )}

          {storageStatus && (
            <>
              {/* Overall Status */}
              <div className={`p-4 rounded-lg border ${
                overallStatus.color === 'green' ? 'bg-green-50 border-green-200' :
                overallStatus.color === 'red' ? 'bg-red-50 border-red-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`text-${overallStatus.color}-600`}>
                    {overallStatus.icon}
                  </div>
                  <p className={`font-medium text-${overallStatus.color}-800`}>
                    {overallStatus.text}
                  </p>
                </div>
                <p className={`text-sm text-${overallStatus.color}-700`}>
                  {storageStatus.message}
                </p>
              </div>

              {/* Bucket Details */}
              <div className="space-y-4">
                <h3 className="font-medium">Buckets Configurados:</h3>
                <div className="space-y-3">
                  {storageStatus.buckets.map((bucket, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{bucket.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Criado em: {new Date(bucket.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {getBucketStatusBadge(bucket)}
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{storageStatus.summary.total}</p>
                    <p className="text-sm text-gray-600">Buckets Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{storageStatus.summary.privateBuckets}</p>
                    <p className="text-sm text-gray-600">Buckets Privados</p>
                  </div>
                </div>

                {/* Warnings */}
                {storageStatus.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">⚠️ Problemas Detectados:</h4>
                    <ul className="space-y-1">
                      {storageStatus.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-red-600 ml-4">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Fix Actions */}
      {storageStatus && storageStatus.summary.publicBuckets > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand" />
              Correção Automática
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium text-yellow-800 mb-2">
                🔧 Problema detectado: {storageStatus.summary.publicBuckets} bucket(s) público(s)
              </p>
              <p className="text-sm text-yellow-700">
                Os buckets devem ser privados para segurança. Clique abaixo para corrigir automaticamente.
              </p>
            </div>

            <Button 
              onClick={fixBucketPrivacy}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Corrigindo buckets...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Tornar Buckets Privados
                </>
              )}
            </Button>

            {fixResults && (
              <div className="mt-4">
                <Separator className="mb-4" />
                <h4 className="font-medium mb-3">Resultados da Correção:</h4>
                <div className="space-y-2">
                  {fixResults.results?.map((result: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 border rounded">
                      <div className={result.success ? 'text-green-600' : 'text-red-600'}>
                        {result.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{result.name}</p>
                        <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.success ? result.message : result.error}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* RLS Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {storageStatus?.summary.allPrivate ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-800 mb-2">✅ Buckets configurados corretamente</p>
              <p className="text-sm text-green-700">
                Agora configure as políticas RLS seguindo as instruções em: 
                <code className="ml-1 px-2 py-1 bg-green-100 rounded">/scripts/setup-rls-policies-dashboard.md</code>
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium text-yellow-800 mb-2">⚠️ Configure os buckets primeiro</p>
              <p className="text-sm text-yellow-700">
                Use a correção automática acima para tornar os buckets privados, depois configure as políticas RLS.
              </p>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Após corrigir os buckets:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Vá para o Supabase Dashboard</li>
              <li>Navegue para Storage → Policies</li>
              <li>Execute as políticas RLS conforme instruções</li>
              <li>Teste o upload de avatares em <code>/dev/storage-rls-test</code></li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}