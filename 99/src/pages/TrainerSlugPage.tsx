/**
 * Página de perfil de trainer baseada em slug
 * Usa o sistema de slugs para resolução e navegação SEO-friendly
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { useTrainerSlug } from '../hooks/useSlug';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Componente simplificado baseado no TrainerProfile existente
import { TrainerProfile } from '../components/pages/TrainerProfile';

export default function TrainerSlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { trainerData, loading, error } = useTrainerSlug(slug);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <h3 className="text-lg font-medium">Carregando perfil...</h3>
          <p className="text-muted-foreground">
            Buscando informações do treinador
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-destructive">
              Treinador não encontrado
            </h2>
            <p className="text-muted-foreground">
              O perfil do treinador que você está procurando não foi encontrado ou não está disponível.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/catalog')}
              className="w-full"
            >
              Ver todos os treinadores
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!trainerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Dados não disponíveis</h2>
          <p className="text-muted-foreground">
            Não foi possível carregar os dados do treinador.
          </p>
          <Button 
            onClick={() => navigate('/catalog')}
            variant="outline"
          >
            Ver outros treinadores
          </Button>
        </div>
      </div>
    );
  }

  // Mock functions para o componente TrainerProfile existente
  // TODO: Substituir por implementação real baseada em slugs
  const mockHandlers = {
    selectedTrainerId: trainerData.id,
    selectedSport: '',
    activeTrainerTab: null,
    onSetSelectedSport: (sport: string) => {
      console.log('Sport selected:', sport);
    },
    onSetActiveTrainerTab: (tab: number | null) => {
      console.log('Tab selected:', tab);
    },
    onNavigateToProgram: (programId: string) => {
      navigate(`/programs/${programId}`);
    },
    onNavigateToHome: () => {
      navigate('/');
    },
    onNavigateToBecomeTrainer: () => {
      navigate('/become-trainer');
    },
    onNavigateToCatalog: () => {
      navigate('/catalog');
    },
    onNavigateToTrainer: (trainerId: string) => {
      // TODO: Buscar slug do trainer e navegar com slug
      navigate(`/trainers/${trainerId}`);
    }
  };

  return (
    <TrainerProfile {...mockHandlers} />
  );
}