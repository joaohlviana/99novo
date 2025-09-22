import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SportsMenu } from '../components/SportsMenu';
import { ProgramDetailsSimple } from '../components/ProgramDetailsSimple';
import { PageShell } from '../components/layout/PageShell';
import { ContentGrid } from '../components/layout/ContentGrid';
import { Main } from '../components/layout/Main';
import { Aside } from '../components/layout/Aside';
import { CardShell } from '../components/layout/CardShell';
import { useNavigationStore } from '../stores/navigation-store';

import { Button } from '../components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import { CheckCircle, Star, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

// 🎯 IMPORTS OTIMIZADOS PARA TABELAS REAIS
import { useProgramWithTrainerOptimized } from '../hooks/useProgramWithTrainerOptimized';

// 🐛 COMPONENTE DE DEBUG PARA VISUALIZAR JSON RAW
function ProgramDebugSection({ programId, uiProgram }: { programId: string, uiProgram?: any }) {
  const [debugData, setDebugData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [debugType, setDebugType] = useState<'raw' | 'ui'>('raw');

  const fetchRawData = async () => {
    try {
      const { supabase } = await import('../lib/supabase/client');
      
      // Primeiro tentar como UUID
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(programId);
      
      console.log('🐛 [DEBUG] Buscando dados RAW para:', { programId, isUuid });
      
      let query = supabase
        .from('published_programs_by_trainer')
        .select('*');
      
      if (isUuid) {
        query = query.eq('id', programId);
      } else {
        query = query.eq('slug', programId);
      }
      
      const { data, error } = await query.single();
      
      if (error) {
        console.error('🐛 [DEBUG] Erro ao buscar dados RAW:', error);
        setDebugData({ error: error.message, code: error.code });
      } else {
        console.log('🐛 [DEBUG] Dados RAW recebidos:', data);
        setDebugData(data);
      }
    } catch (err: any) {
      console.error('🐛 [DEBUG] Erro crítico:', err);
      setDebugData({ criticalError: err.message });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          onClick={() => setDebugType('raw')}
          variant="outline"
          size="sm"
          className={`${debugType === 'raw' ? 'bg-red-200 border-red-400' : 'bg-red-100 border-red-300'} text-red-700 hover:bg-red-200`}
        >
          🐛 RAW
        </Button>
        <Button
          onClick={() => setDebugType('ui')}
          variant="outline"
          size="sm"
          className={`${debugType === 'ui' ? 'bg-blue-200 border-blue-400' : 'bg-blue-100 border-blue-300'} text-blue-700 hover:bg-blue-200`}
        >
          🎨 UI
        </Button>
      </div>
      
      <Button
        onClick={() => {
          if (!isVisible) {
            if (debugType === 'raw') fetchRawData();
          }
          setIsVisible(!isVisible);
        }}
        variant="outline"
        size="sm"
        className="bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200"
      >
        {isVisible ? 'Fechar Debug' : 'Abrir Debug'}
      </Button>
      
      {isVisible && (
        <div className="bg-black text-green-400 p-4 rounded-lg max-w-4xl max-h-96 overflow-auto text-xs font-mono">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-white font-bold">
              {debugType === 'raw' ? 'DADOS RAW DA VIEW: published_programs_by_trainer' : 'DADOS UI PROCESSADOS'}
            </h4>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-red-400"
            >
              ✕
            </button>
          </div>
          
          {debugType === 'raw' ? (
            debugData ? (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            ) : (
              <div className="text-yellow-400">Carregando dados RAW...</div>
            )
          ) : (
            uiProgram ? (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(uiProgram, null, 2)}
              </pre>
            ) : (
              <div className="text-yellow-400">Nenhum dado UI disponível</div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function ProgramDetailsPage() {
  const { programId } = useParams<{ programId: string }>();
  const { updateLocation } = useNavigationStore();
  const [selectedSport, setSelectedSport] = useState<string>('futebol');

  // 🎯 USAR HOOK OTIMIZADO PARA DADOS DO PROGRAMA + TREINADOR
  const { data: uiProgram, isLoading, error } = useProgramWithTrainerOptimized(programId || '');

  // 🎯 NAVIGATION HELPERS OTIMIZADOS
  const navigateToCatalog = () => {
    updateLocation('/catalog');
    window.history.pushState(null, '', '/catalog');
  };

  const navigateToTrainer = (trainerId: string) => {
    updateLocation(`/trainer/${trainerId}`);
    window.history.pushState(null, '', `/trainer/${trainerId}`);
  };

  const navigateToProgram = (programId: string) => {
    updateLocation(`/programs/${programId}`);
    window.history.pushState(null, '', `/programs/${programId}`);
  };

  // 🎯 LOADING STATE OTIMIZADO
  if (isLoading) {
    return (
      <PageShell>
        <Header />
        <div className="pt-16">
          <SportsMenu selectedSport={selectedSport} />
          <div className="container py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </PageShell>
    );
  }

  // 🎯 ERROR STATE OTIMIZADO
  if (error || !uiProgram) {
    return (
      <PageShell>
        <Header />
        <div className="pt-16">
          <SportsMenu selectedSport={selectedSport} />
          <div className="container py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {error?.message || 'Programa não encontrado'}
              </h1>
              <p className="text-gray-600 mb-6">
                O programa que você está procurando não existe ou foi removido.
              </p>
              <button
                onClick={navigateToCatalog}
                className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-hover transition-colors"
              >
                Voltar ao catálogo
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Header />
      
      <div className="pt-16">
        <SportsMenu 
          selectedSport={selectedSport}
        />

        {/* Breadcrumb */}
        <div className="container py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToCatalog();
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Treinadores
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToTrainer(uiProgram.trainer.id);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {uiProgram.trainer.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  {uiProgram.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        {/* Content sem sidebar - usando o ProgramDetailsSimple que já tem sidebar interna */}
        <div className="container">
          <ProgramDetailsSimple 
            onNavigateToTrainer={navigateToTrainer}
            onNavigateToProgram={navigateToProgram}
            programIdOrSlug={programId}
          />
        </div>
      </div>

      <Footer />
      
      {/* 🐛 SEÇÃO DE DEBUG - Só aparece em desenvolvimento */}
      {programId && <ProgramDebugSection programId={programId} uiProgram={uiProgram} />}
    </PageShell>
  );
}

export default ProgramDetailsPage;