/**
 * 🧪 PÁGINA DE TESTE - TRAINER PROFILE CARDS HÍBRIDOS
 * ===================================================
 * 
 * Página para testar os componentes de cards de treinadores
 * com dados reais do sistema híbrido
 */

import { useState } from 'react';
import { TrainerProfileCardHybrid, TrainerProfileListHybrid } from '../components/TrainerProfileCardHybrid';
import { ModernProfileCard } from '../components/ModernProfileCard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { type TrainerProfile } from '../services/trainer-profile.service';

export default function TrainerProfileCardTestPage() {
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);

  // ===============================================
  // DADOS MOCK PARA COMPARAÇÃO
  // ===============================================

  const mockTrainerData = {
    name: "Carlos Silva",
    location: "São Paulo, SP",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    portfolioImages: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400",
      "https://images.unsplash.com/photo-1583500178690-f7ee82126ed8?w=400"
    ],
    tags: ["Musculação", "Presencial"],
    stats: {
      followers: "1.2k",
      following: "234",
      views: "45k"
    },
    rating: 4.8,
    isVerified: true
  };

  // ===============================================
  // HANDLERS
  // ===============================================

  const handleTrainerClick = (trainer: TrainerProfile) => {
    console.log('🎯 Trainer clicado:', trainer.name);
    setSelectedTrainer(trainer);
  };

  const handleFollowClick = (trainer: TrainerProfile, isFollowing: boolean) => {
    console.log(`${isFollowing ? '👥' : '➕'} ${isFollowing ? 'Seguindo' : 'Seguir'} trainer:`, trainer.name);
  };

  const handleMessageClick = (trainer: TrainerProfile) => {
    console.log('💬 Enviar mensagem para:', trainer.name);
  };

  // ===============================================
  // RENDER
  // ===============================================

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          🧪 Teste - Cards de Treinadores Híbridos
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Testando os componentes de cards de treinadores com dados reais 
          do sistema híbrido 99_trainer_profile
        </p>
      </div>

      {/* Informações do Trainer Selecionado */}
      {selectedTrainer && (
        <Card className="border-l-4 border-l-[#e0093e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎯 Trainer Selecionado</span>
              <Badge variant="secondary">{selectedTrainer.id}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dados Básicos</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><strong>Nome:</strong> {selectedTrainer.name}</li>
                  <li><strong>Email:</strong> {selectedTrainer.email}</li>
                  <li><strong>Status:</strong> {selectedTrainer.status}</li>
                  <li><strong>Verificado:</strong> {selectedTrainer.is_verified ? 'Sim' : 'Não'}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dados do Perfil</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><strong>Especialidades:</strong> {selectedTrainer.profile_data.specialties?.join(', ') || 'Nenhuma'}</li>
                  <li><strong>Modalidades:</strong> {selectedTrainer.profile_data.modalities?.join(', ') || 'Nenhuma'}</li>
                  <li><strong>Cidades:</strong> {selectedTrainer.profile_data.cities?.join(', ') || 'Nenhuma'}</li>
                  <li><strong>Experiência:</strong> {selectedTrainer.profile_data.experienceYears || 'Não informado'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs com diferentes testes */}
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="individual">Cards Individuais</TabsTrigger>
          <TabsTrigger value="list">Lista de Trainers</TabsTrigger>
          <TabsTrigger value="filtered">Busca Filtrada</TabsTrigger>
        </TabsList>

        {/* Tab 1: Comparação Mock vs Híbrido */}
        <TabsContent value="comparison" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Comparação: Mock vs Sistema Híbrido
            </h2>
            <p className="text-gray-600">
              Comparando dados mock com dados reais do sistema híbrido
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Card com dados mock */}
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  📝 Dados Mock
                </Badge>
              </div>
              <ModernProfileCard {...mockTrainerData} />
            </div>

            {/* Card com dados híbridos */}
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  🔗 Sistema Híbrido
                </Badge>
              </div>
              <TrainerProfileCardHybrid
                userId="cd3e7e7e-2c32-4d3a-9b83-52c5f4e8c123" // ID de exemplo
                onTrainerClick={handleTrainerClick}
                onFollowClick={handleFollowClick}
                onMessageClick={handleMessageClick}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Cards Individuais */}
        <TabsContent value="individual" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Cards Individuais - Diferentes IDs
            </h2>
            <p className="text-gray-600">
              Testando cards com diferentes trainers do sistema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 - Por User ID */}
            <div className="space-y-2">
              <Badge variant="secondary" className="w-full justify-center">Por User ID</Badge>
              <TrainerProfileCardHybrid
                userId="cd3e7e7e-2c32-4d3a-9b83-52c5f4e8c123"
                onTrainerClick={handleTrainerClick}
              />
            </div>

            {/* Card 2 - Por Trainer ID */}
            <div className="space-y-2">
              <Badge variant="secondary" className="w-full justify-center">Por Trainer ID</Badge>
              <TrainerProfileCardHybrid
                trainerId="a1b2c3d4-e5f6-7890-1234-567890abcdef"
                onTrainerClick={handleTrainerClick}
              />
            </div>

            {/* Card 3 - Fallback */}
            <div className="space-y-2">
              <Badge variant="secondary" className="w-full justify-center">ID Inexistente</Badge>
              <TrainerProfileCardHybrid
                userId="inexistente-id"
                onTrainerClick={handleTrainerClick}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Lista de Trainers */}
        <TabsContent value="list" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Lista de Todos os Trainers
            </h2>
            <p className="text-gray-600">
              Carregando todos os trainers ativos do sistema
            </p>
          </div>

          <TrainerProfileListHybrid
            filters={{ limit: 8 }}
            onTrainerClick={handleTrainerClick}
            cardClassName="h-full"
          />
        </TabsContent>

        {/* Tab 4: Busca Filtrada */}
        <TabsContent value="filtered" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Busca Filtrada
            </h2>
            <p className="text-gray-600">
              Testando filtros por especialidade, cidade e modalidade
            </p>
          </div>

          <div className="space-y-8">
            {/* Filtro por Musculação */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                🏋️ Especialidade: Musculação
              </h3>
              <TrainerProfileListHybrid
                filters={{ specialty: 'Musculação', limit: 4 }}
                onTrainerClick={handleTrainerClick}
                cardClassName="h-full"
              />
            </div>

            {/* Filtro por Modalidade Presencial */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                🏃 Modalidade: Presencial
              </h3>
              <TrainerProfileListHybrid
                filters={{ modality: 'Presencial', limit: 4 }}
                onTrainerClick={handleTrainerClick}
                cardClassName="h-full"
              />
            </div>

            {/* Filtro por Cidade */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                📍 Cidade: São Paulo
              </h3>
              <TrainerProfileListHybrid
                filters={{ city: 'São Paulo', limit: 4 }}
                onTrainerClick={handleTrainerClick}
                cardClassName="h-full"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer com instruções */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-medium text-gray-900">📋 Instruções de Teste</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Clique nos cards para ver os dados do trainer selecionado</p>
              <p>• Teste os botões de seguir e mensagem</p>
              <p>• Verifique se dados reais estão sendo carregados corretamente</p>
              <p>• Compare a diferença entre dados mock e híbridos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}