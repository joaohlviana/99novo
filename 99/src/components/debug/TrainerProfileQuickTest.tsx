/**
 * 🔧 TRAINER PROFILE QUICK TEST
 * 
 * Componente para testar rapidamente o carregamento de perfis de treinadores
 * específicos e verificar se o avatar está sendo carregado corretamente
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { identifierResolverService } from '../../services/identifier-resolver.service';
import { trainerProfileIntegrationService } from '../../services/trainer-profile-integration.service';
import { TrainerAvatar } from '../trainer/TrainerAvatar';

export function TrainerProfileQuickTest() {
  const [identifier, setIdentifier] = useState('ana-souza-e0f255ab');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testTrainerProfile = async () => {
    if (!identifier.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🧪 Testando perfil para:', identifier);
      
      // Etapa 1: Resolver identificador
      const resolveResult = await identifierResolverService.resolveTrainer(identifier);
      
      if (!resolveResult.success) {
        throw new Error(resolveResult.error || 'Falha na resolução');
      }
      
      // Etapa 2: Buscar perfil integrado
      const unifiedTrainer = await trainerProfileIntegrationService.getUnifiedTrainer(resolveResult.trainer!.user_id);
      
      // Preparar resultado para exibição
      const testResult = {
        identifier,
        resolveResult,
        unifiedTrainer,
        finalAvatar: resolveResult.trainer?.avatar || resolveResult.trainer?.profilePhoto,
        step1_normalized: {
          name: resolveResult.trainer?.name,
          avatar: resolveResult.trainer?.avatar,
          profilePhoto: resolveResult.trainer?.profilePhoto
        },
        step2_unified: {
          name: unifiedTrainer?.name,
          avatar: unifiedTrainer?.avatar,
          profilePhoto: unifiedTrainer?.profile?.profilePhoto
        }
      };
      
      setResult(testResult);
      console.log('✅ Resultado do teste:', testResult);
      
    } catch (err: any) {
      console.error('❌ Erro no teste:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Teste Rápido - Perfil do Treinador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Digite o slug ou UUID do treinador"
              className="flex-1"
            />
            <Button 
              onClick={testTrainerProfile}
              disabled={loading || !identifier.trim()}
            >
              {loading ? 'Testando...' : 'Testar'}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Exemplos para testar:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li><code>ana-souza-e0f255ab</code> - Ana Souza</li>
              <li><code>joao-silva-personal-trainer-426bf509</code> - João Silva</li>
              <li><code>carlos-oliveira-crossfit-coach-0ec5ad93</code> - Carlos Oliveira</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600"><strong>Erro:</strong> {error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          {/* Avatar Test */}
          <Card>
            <CardHeader>
              <CardTitle>🖼️ Teste Visual do Avatar</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <TrainerAvatar 
                image={result.finalAvatar || ''}
                name={result.step1_normalized.name || 'Teste'}
              />
              <div>
                <p><strong>Avatar URL:</strong></p>
                <code className="text-xs bg-gray-100 p-1 rounded">
                  {result.finalAvatar || 'null'}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Step by Step Results */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Resultados Detalhados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">🔍 Etapa 1 - Resolução de Identificador</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p><strong>Método:</strong> {result.resolveResult.resolveMethod}</p>
                  <p><strong>Nome:</strong> {result.step1_normalized.name}</p>
                  <p><strong>Avatar:</strong> {result.step1_normalized.avatar ? '✅ SIM' : '❌ NÃO'}</p>
                  <p><strong>ProfilePhoto:</strong> {result.step1_normalized.profilePhoto ? '✅ SIM' : '❌ NÃO'}</p>
                  {result.step1_normalized.avatar && (
                    <p className="break-all"><strong>URL:</strong> {result.step1_normalized.avatar}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">🔗 Etapa 2 - Integração Unificada</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p><strong>Nome:</strong> {result.step2_unified.name}</p>
                  <p><strong>Avatar:</strong> {result.step2_unified.avatar ? '✅ SIM' : '❌ NÃO'}</p>
                  <p><strong>Profile Photo:</strong> {result.step2_unified.profilePhoto ? '✅ SIM' : '❌ NÃO'}</p>
                  {result.step2_unified.avatar && (
                    <p className="break-all"><strong>URL:</strong> {result.step2_unified.avatar}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">🎯 Avatar Final Usado</h4>
                <div className="bg-green-50 p-3 rounded text-sm">
                  <p><strong>Status:</strong> {result.finalAvatar ? '✅ Avatar encontrado' : '❌ Avatar não encontrado'}</p>
                  {result.finalAvatar && (
                    <p className="break-all"><strong>URL Final:</strong> {result.finalAvatar}</p>
                  )}
                </div>
              </div>

              {/* Raw Data */}
              <details>
                <summary className="cursor-pointer font-medium">🔬 Dados Brutos (JSON)</summary>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto mt-2">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}