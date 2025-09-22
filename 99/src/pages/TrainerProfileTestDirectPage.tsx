/**
 * 🧪 PÁGINA DE TESTE DIRETO - PERFIL DO TREINADOR
 * 
 * Página para testar diretamente perfis específicos após as correções
 */

import React from 'react';
import { TrainerProfileQuickTest } from '../components/debug/TrainerProfileQuickTest';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrainerProfileTestDirectPage() {
  const navigate = useNavigate();

  const testCases = [
    {
      name: 'Ana Souza',
      slug: 'ana-souza-e0f255ab',
      expected: 'https://rdujusymvebxndykyvhu.supabase.co/storage/v1/object/public/avatars/06588b6a-e8bb-42a4-89a8-5d237cc34476/avatar/avatar.jpg',
      description: 'Treinadora com avatar no Supabase Storage'
    },
    {
      name: 'João Silva',
      slug: 'joao-silva-personal-trainer-426bf509',
      expected: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
      description: 'Treinador com avatar do Unsplash'
    },
    {
      name: 'Carlos Oliveira',
      slug: 'carlos-oliveira-crossfit-coach-0ec5ad93',
      expected: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
      description: 'Coach de CrossFit com avatar do Unsplash'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Teste Direto - Perfis Corrigidos
          </h1>
          <p className="text-gray-600 mb-4">
            Teste os perfis específicos após as correções do sistema de avatar.
          </p>

          {/* Status das Correções */}
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Correções Aplicadas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-700">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Priorização de dados:</strong> resolvedTrainerData agora tem prioridade sobre trainer</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Merge de avatar:</strong> initialTrainerData.avatar tem prioridade no merge</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Fallback corrigido:</strong> múltiplas fontes antes do mock data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Logs de diagnóstico:</strong> adicionados para debug</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Casos de Teste Esperados */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📋 Casos de Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {testCases.map((testCase, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{testCase.name}</h3>
                      <p className="text-sm text-gray-600">{testCase.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/trainer/${testCase.slug}`)}
                    >
                      Ver Perfil
                    </Button>
                  </div>
                  <div className="text-xs">
                    <p><strong>Slug:</strong> <code>{testCase.slug}</code></p>
                    <p><strong>Avatar esperado:</strong> <span className="break-all">{testCase.expected}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Teste Interativo */}
        <TrainerProfileQuickTest />
      </div>
    </div>
  );
}