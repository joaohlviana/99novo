/**
 * Componente para páginas dinâmicas baseadas em slugs
 * Resolve automaticamente o tipo de entidade e renderiza o componente apropriado
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSlug } from '../hooks/useSlug';
import { LoadingSpinner } from './ui/loading-spinner';
import TrainerProfile from './pages/TrainerProfile';
import SportPage from './SportPage';
import ProgramDetails from './ProgramDetails';

interface DynamicSlugPageProps {
  basePath: 'trainers' | 'sports' | 'programs';
}

export default function DynamicSlugPage({ basePath }: DynamicSlugPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { result, loading, error, resolveSlug, isValidUuid, generateSeoUrl } = useSlug();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!slug) {
      navigate('/404', { replace: true });
      return;
    }

    const handleSlugResolution = async () => {
      const slugResult = await resolveSlug(slug);
      
      if (!slugResult) {
        navigate('/404', { replace: true });
        return;
      }

      // Se recebeu UUID na URL mas tem slug disponível, redireciona para SEO
      if (isValidUuid(slug) && slugResult.slug && slugResult.slug !== slug) {
        const seoUrl = generateSeoUrl(slugResult);
        navigate(seoUrl, { replace: true });
        return;
      }

      // Verifica se o tipo da entidade corresponde ao basePath
      const expectedType = basePath.slice(0, -1) as 'trainer' | 'sport' | 'program'; // Remove 's' do final
      if (slugResult.type !== expectedType) {
        // Redireciona para a URL correta do tipo
        const correctUrl = generateSeoUrl(slugResult);
        navigate(correctUrl, { replace: true });
        return;
      }
    };

    handleSlugResolution();
  }, [slug, basePath, resolveSlug, navigate, isValidUuid, generateSeoUrl]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Erro</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // No result found
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Não encontrado</h2>
          <p className="text-muted-foreground">O conteúdo solicitado não foi encontrado.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate component based on result type
  switch (result.type) {
    case 'trainer':
      return <TrainerProfile trainerId={result.id} />;
    
    case 'sport':
      return <SportPage sportSlug={result.slug} />;
    
    case 'program':
      return <ProgramDetails programId={result.id} />;
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Tipo não suportado</h2>
            <p className="text-muted-foreground">
              O tipo de conteúdo "{result.type}" não é suportado.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      );
  }
}

/**
 * Componente específico para páginas de trainers
 */
export function TrainerSlugPage() {
  return <DynamicSlugPage basePath="trainers" />;
}

/**
 * Componente específico para páginas de sports
 */
export function SportSlugPage() {
  return <DynamicSlugPage basePath="sports" />;
}

/**
 * Componente específico para páginas de programs
 */
export function ProgramSlugPage() {
  return <DynamicSlugPage basePath="programs" />;
}

/**
 * Hook para navegação SEO-friendly
 * Usado em cards e links para garantir navegação com slugs
 */
export function useSlugNavigation() {
  const navigate = useNavigate();
  const { generateSeoUrl } = useSlug();

  const navigateToTrainer = (trainer: { id: string; slug: string }) => {
    const url = `/trainers/${trainer.slug || trainer.id}`;
    navigate(url);
  };

  const navigateToSport = (sport: { id: string; slug: string }) => {
    const url = `/sports/${sport.slug || sport.id}`;
    navigate(url);
  };

  const navigateToProgram = (program: { id: string; slug?: string }) => {
    const url = `/programs/${program.slug || program.id}`;
    navigate(url);
  };

  return {
    navigateToTrainer,
    navigateToSport,
    navigateToProgram
  };
}