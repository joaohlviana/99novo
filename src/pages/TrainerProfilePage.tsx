import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { identifierResolverService, type TrainerInfo } from '../services/identifier-resolver.service';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SportsMenu } from '../components/SportsMenu';
import { TrainerHeader } from '../components/trainer/TrainerHeader';
import { TrainerStories } from '../components/trainer/TrainerStories';
import { TrainerVideo } from '../components/trainer/TrainerVideo';
import { TrainerPrograms } from '../components/trainer/TrainerPrograms';
import { TrainerQualifications } from '../components/trainer/TrainerQualifications';
import { TrainerReviews } from '../components/trainer/TrainerReviews';
import { PricingCard } from '../components/PricingCard';
import { PageShell } from '../components/layout/PageShell';
import { ContentGrid } from '../components/layout/ContentGrid';
import { Main } from '../components/layout/Main';
import { Aside } from '../components/layout/Aside';
import { Section } from '../components/layout/Section';
import { CardShell } from '../components/layout/CardShell';
import { useNavigation } from '../hooks/useNavigation';

import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import { Video, Clock, CheckCircle, Star, Award, UserCheck, AlertCircle } from 'lucide-react';
import { ExpandableTabs } from '../components/ui/expandable-tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

// Services imports - Nova Data Layer
import * as TrainersService from '../services/trainers.service';
import * as ProgramsService from '../services/programs.service';
import { trainerProfileIntegrationService } from '../services/trainer-profile-integration.service';

// Types
import { Trainer, Program } from '../types';

// Fallback data
import { reviews, stories, pricingOptions } from '../data/mock-data';

// Dados mock de fallback
const mockTrainerData = {
  name: "João Silva",
  title: "Personal Trainer Especialista",
  image: "https://images.unsplash.com/photo-1540206063137-4a88ca974d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjBmaXRuZXNzJTIwY29hY2h8ZW58MXx8fHwxNzU1ODc3OTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  rating: 4.78,
  reviewCount: 127,
  location: "São Paulo, SP",
  description: "Especialista em treinamento funcional e nutrição esportiva, com foco em resultados sustentáveis e mudança de estilo de vida. Acredito que cada pessoa é única e merece um programa personalizado.",
  specialties: ["Musculação", "Funcional", "Corrida", "Nutrição"],
  stats: {
    students: 152,
    rating: 4.78,
    experience: 8
  }
};

const mockPrograms = [
  {
    id: '1',
    title: 'Treino Funcional Completo',
    description: 'Programa focado em movimentos funcionais para melhorar força, resistência e mobilidade.',
    category: 'Funcional',
    duration: '12 semanas',
    level: 'Intermediário' as const,
    price: 'R$ 297',
    students: 45,
    rating: 4.9,
    popular: true
  },
  {
    id: '2',
    title: 'Hipertrofia Avançada',
    description: 'Programa intensivo de musculação para ganho de massa muscular.',
    category: 'Musculação',
    duration: '16 semanas',
    level: 'Avançado' as const,
    price: 'R$ 397',
    students: 32,
    rating: 4.8
  }
];

// ✅ INTERFACE PARA PROPS OPCIONAIS (da página de resolução)
interface TrainerProfilePageProps {
  initialTrainerData?: TrainerInfo;
  resolveMethod?: 'slug' | 'uuid' | 'fallback';
}

function TrainerProfilePage(props: TrainerProfilePageProps = {}) {
  const { initialTrainerData, resolveMethod } = props;
  const { trainerId } = useParams<{ trainerId: string }>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [selectedSport, setSelectedSport] = useState<string>('futebol');
  const [activeTrainerTab, setActiveTrainerTab] = useState<number | null>(null);

  // State para dados do service - Nova Data Layer
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [resolvedTrainerData, setResolvedTrainerData] = useState<TrainerInfo | null>(initialTrainerData || null);
  const [trainerPrograms, setTrainerPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(!initialTrainerData);
  const [hasError, setHasError] = useState<boolean>(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // ✅ MONITOR DE MUDANÇAS DE ESTADO
  useEffect(() => {
    if (resolvedTrainerData) {
      console.log('📊 ESTADO resolvedTrainerData MUDOU:', {
        name: resolvedTrainerData.name,
        avatar: resolvedTrainerData.avatar,
        timestamp: new Date().toISOString(),
        stackTrace: new Error().stack?.split('\n').slice(0, 5)
      });
    }
  }, [resolvedTrainerData]);

  useEffect(() => {
    if (trainer) {
      console.log('📊 ESTADO trainer MUDOU:', {
        name: trainer.name,
        avatar: trainer.avatar,
        timestamp: new Date().toISOString(),
        stackTrace: new Error().stack?.split('\n').slice(0, 5)
      });
    }
  }, [trainer]);

  // ✅ CARREGAR DADOS DO TREINADOR COM RESOLUÇÃO DE IDENTIFICADOR
  useEffect(() => {
    const loadTrainerData = async () => {
      // Se já temos dados iniciais, usar mas SEMPRE buscar o perfil completo depois
      if (initialTrainerData) {
        console.log('✅ Usando dados pré-resolvidos:', initialTrainerData.name);
        setResolvedTrainerData(initialTrainerData);
        setIsLoading(false);
        
        // ✅ CORREÇÃO CRÍTICA: NÃO buscar perfil completo se já temos dados bons
        // Os dados de initialTrainerData são os corretos da normalização
        console.log('✅ Dados pré-resolvidos são suficientes, pulando busca de perfil completo que pode sobrescrever');
        console.log('💡 Nome correto preservado:', initialTrainerData.name);
        console.log('💡 Avatar correto preservado:', initialTrainerData.avatar ? 'SIM' : 'NÃO');
        
        // Somente definir trainer se não temos dados de trainer ainda
        // Mas NÃO sobrescrever resolvedTrainerData que já tem dados corretos
        
        // Carregar programas
        if (initialTrainerData.user_id) {
          await loadTrainerPrograms(initialTrainerData.user_id);
        }
        return;
      }

      if (!trainerId) {
        console.error('❌ Nenhum trainerId fornecido');
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setHasError(false);
        setResolveError(null);

        console.log('🔍 Resolvendo identificador:', trainerId);

        // ETAPA 1: Resolver identificador (slug vs UUID)
        const resolveResult = await identifierResolverService.resolveTrainer(trainerId);
        
        if (!resolveResult.success) {
          console.error('❌ Falha na resolução:', resolveResult.error);
          setResolveError(resolveResult.error || 'Erro desconhecido');
          setHasError(true);
          setIsLoading(false);
          return;
        }

        // ETAPA 2: Se precisa redirecionar (UUID → slug)
        if (resolveResult.needsRedirect && resolveResult.redirectSlug) {
          console.log('🔄 Redirecionando UUID para slug:', resolveResult.redirectSlug);
          navigate(`/trainer/${resolveResult.redirectSlug}`, { replace: true });
          return;
        }

        // ETAPA 3: Usar dados resolvidos
        if (resolveResult.trainer) {
          console.log('✅ Trainer resolvido via', resolveResult.resolveMethod, ':', resolveResult.trainer.name);
          setResolvedTrainerData(resolveResult.trainer);
        }

        // ETAPA 4: NÃO buscar dados adicionais que podem sobrescrever dados corretos
        console.log('✅ Usando apenas dados resolvidos (evitando sobrescrita com fallbacks)');

        // ETAPA 5: Carregar programas
        await loadTrainerPrograms(resolveResult.trainer.user_id);

      } catch (error: any) {
        console.error('❌ Erro ao carregar dados do treinador:', error);
        setHasError(true);
        setResolveError(`Erro interno: ${error.message}`);
        setTrainer(null);
        setTrainerPrograms([]);
      } finally {
        setIsLoading(false);
      }
    };

    const loadTrainerPrograms = async (userId: string) => {
      try {
        console.log('🔍 Carregando programas para user_id:', userId);
        
        const programsResponse = await ProgramsService.searchPrograms?.({ trainerId: userId }, { page: 1, limit: 50 });
        
        if (programsResponse?.success && programsResponse.data?.data) {
          console.log('✅ Programas carregados:', programsResponse.data.data.length);
          setTrainerPrograms(programsResponse.data.data);
        } else {
          console.log('⚠️ Nenhum programa encontrado');
          setTrainerPrograms([]);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar programas:', error);
        setTrainerPrograms([]);
      }
    };

    loadTrainerData();
  }, [trainerId, initialTrainerData, navigate]);

  // ✅ TRANSFORMAR DADOS RESOLVIDOS PARA INTERFACE DOS COMPONENTES (PRIORIZAÇÃO CORRIGIDA)
  const getTrainerDisplayData = () => {
    // ✅ CORREÇÃO: Priorizar resolvedTrainerData que tem dados da normalização correta
    if (resolvedTrainerData) {
      console.log('🎯 Usando resolvedTrainerData para display (DADOS CORRETOS):', {
        name: resolvedTrainerData.name,
        avatar: resolvedTrainerData.avatar,
        profilePhoto: resolvedTrainerData.profilePhoto,
        timestamp: new Date().toISOString()
      });
      
      return {
        name: resolvedTrainerData.name,
        title: 'Personal Trainer',
        // ✅ CORREÇÃO CRÍTICA: Usar avatar primeiro, depois profilePhoto, depois fallback
        image: resolvedTrainerData.avatar || resolvedTrainerData.profilePhoto || mockTrainerData.image,
        rating: resolvedTrainerData.rating || 4.5,
        reviewCount: resolvedTrainerData.reviewCount || 50,
        location: resolvedTrainerData.location || mockTrainerData.location,
        description: resolvedTrainerData.bio || mockTrainerData.description,
        specialties: Array.isArray(resolvedTrainerData.specialties) 
          ? resolvedTrainerData.specialties.map(spec => typeof spec === 'string' ? spec : spec.description || spec.category || spec).slice(0, 4)
          : mockTrainerData.specialties,
        stats: {
          students: mockTrainerData.stats.students,
          rating: resolvedTrainerData.rating || mockTrainerData.stats.rating,
          experience: mockTrainerData.stats.experience
        }
      };
    }
    
    // Prioridade 2: Dados do sistema unificado (apenas se não tiver resolvedTrainerData)
    if (trainer) {
      console.log('🚨 ATENÇÃO: Usando trainer para display (PODE SER FALLBACK GENÉRICO):', {
        name: trainer.name,
        avatar: trainer.avatar,
        source: 'trainer-object',
        timestamp: new Date().toISOString()
      });
      
      return {
        name: trainer.name,
        title: trainer.profile?.title || 'Personal Trainer',
        // ✅ CORREÇÃO: Tentar múltiplas fontes antes do mock
        image: trainer.avatar || trainer.profile?.profilePhoto || mockTrainerData.image,
        rating: trainer.profile?.rating || 4.5,
        reviewCount: trainer.profile?.reviewCount || 50,
        location: trainer.location?.city ? `${trainer.location.city}, ${trainer.location.state}` : mockTrainerData.location,
        description: trainer.bio || trainer.profile?.bio || mockTrainerData.description,
        specialties: Array.isArray(trainer.specialties) 
          ? trainer.specialties.map(spec => typeof spec === 'string' ? spec : spec.description || spec.category).slice(0, 4)
          : mockTrainerData.specialties,
        stats: {
          students: trainer.profile?.studentCount || mockTrainerData.stats.students,
          rating: trainer.profile?.rating || mockTrainerData.stats.rating,
          experience: trainer.profile?.experienceYears || mockTrainerData.stats.experience
        }
      };
    }
    
    // Fallback final
    console.log('🎯 Usando mockTrainerData (último fallback)');
    return mockTrainerData;
  };

  const getProgramsDisplayData = () => {
    if (trainerPrograms.length > 0) {
      return trainerPrograms.map(program => ({
        id: program.id,
        title: program.title,
        description: program.description || '',
        category: program.category,
        duration: `${program.duration?.weeks || 12} semanas`,
        level: program.level,
        price: `R$ ${program.pricing?.amount || 297}`,
        students: program.stats?.enrollmentCount || 0,
        rating: program.stats?.averageRating || 4.5,
        popular: program.metadata?.featured || false
      }));
    }
    return mockPrograms;
  };

  const trainerDisplayData = getTrainerDisplayData();
  const programsDisplayData = getProgramsDisplayData();

  // Loading state
  if (isLoading) {
    return (
      <TooltipProvider>
        <PageShell>
          <Header />
          <div className="pt-16">
            <SportsMenu selectedSport={selectedSport} />
            <div className="container py-8">
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-64 bg-gray-200 rounded-3xl animate-pulse"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </PageShell>
      </TooltipProvider>
    );
  }

  // ✅ ERROR STATE COM MAIS DETALHES
  if (hasError && !trainer && !resolvedTrainerData) {
    return (
      <TooltipProvider>
        <PageShell>
          <Header />
          <div className="pt-16">
            <SportsMenu selectedSport={selectedSport} />
            <div className="container py-8">
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Treinador não encontrado
                </h2>
                <p className="text-gray-600 mb-2">
                  O treinador que você está procurando não existe ou foi removido.
                </p>
                {resolveError && (
                  <div className="max-w-md mx-auto mb-6 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-600">
                      <strong>Detalhes:</strong> {resolveError}
                    </p>
                    {trainerId && (
                      <p className="text-xs text-red-500 mt-1">
                        Identificador: {trainerId}
                      </p>
                    )}
                  </div>
                )}
                <div className="space-y-3">
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Tentar novamente
                  </Button>
                  <Button 
                    onClick={() => navigation.navigateToCatalog()}
                    className="bg-[#e0093e] text-white hover:bg-[#c40835]"
                  >
                    Ver outros treinadores
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </PageShell>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
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
                      navigation.navigateToCatalog();
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Treinadores
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">
                    {trainerDisplayData.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          {/* Grid Content */}
          <ContentGrid hasAside>
            <Main>
              {/* Trainer Header */}
              <CardShell className="rounded-3xl">
                <TrainerHeader 
                  name={trainerDisplayData.name}
                  title={trainerDisplayData.title}
                  image={trainerDisplayData.image}
                  rating={trainerDisplayData.rating}
                  reviewCount={trainerDisplayData.reviewCount}
                  location={trainerDisplayData.location}
                  description={trainerDisplayData.description}
                  specialties={trainerDisplayData.specialties}
                  stats={trainerDisplayData.stats}
                />
              </CardShell>

              {/* Navigation Tabs */}
              <section>
                <div className="hidden flex justify-center mb-6">
                  <ExpandableTabs
                    tabs={[
                      { title: "Sobre", icon: UserCheck },
                      { title: "Programas", icon: CheckCircle },
                      { type: "separator" },
                      { title: "Avaliações", icon: Star },
                      { title: "Preços", icon: Award },
                    ]}
                    activeColor="text-[#e0093e]"
                    onChange={setActiveTrainerTab}
                  />
                </div>
              </section>

              {/* Default Content */}
              {activeTrainerTab === null && (
                <>
                  <section>
                    <Separator className="my-4" />
                    <CardShell>
                      <TrainerStories stories={stories} />
                    </CardShell>
                  </section>

                  <section>
                    <CardShell>
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Vídeos
                      </h3>
                      <TrainerVideo 
                        videoUrl="/videos/trainer-intro.mp4"
                        title="Conheça minha metodologia"
                        description="Veja como trabalho e descubra se meu estilo combina com seus objetivos."
                      />
                    </CardShell>
                  </section>

                  <section>
                    <CardShell>
                      <TrainerPrograms 
                        trainerId={resolvedTrainerData?.user_id || trainer?.id}
                      />
                    </CardShell>
                  </section>

                  <section>
                    <CardShell>
                      <TrainerQualifications />
                    </CardShell>
                  </section>

                  <section>
                    <CardShell>
                      <TrainerReviews 
                        rating={trainerDisplayData.rating}
                        reviewCount={trainerDisplayData.reviewCount}
                        reviews={reviews}
                      />
                    </CardShell>
                  </section>
                </>
              )}

              {/* Tab-specific content would go here */}
            </Main>

            <Aside>
              {/* Pricing Card */}
              <CardShell>
                <PricingCard 
                  basePrice="R$ 35"
                  options={pricingOptions}
                />
              </CardShell>

              {/* Trainer Quick Info */}
              <CardShell>
                <h3 className="font-semibold text-gray-900 mb-4">Informações</h3>
                <div className="grid grid-cols-2 gap-4">
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-help">
                        <Clock className="h-5 w-5 text-blue-500 mb-2" />
                        <span className="text-xs font-medium text-gray-900">
                          {trainer?.profile?.responseTime || '~2h'}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tempo de resposta médio</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-help">
                        <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
                        <span className="text-xs font-medium text-gray-900">
                          {trainer?.profile?.completionRate ? `${trainer.profile.completionRate}%` : '98%'}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Taxa de aprovação dos alunos</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-help">
                        <Award className="h-5 w-5 text-purple-500 mb-2" />
                        <span className="text-xs font-medium text-gray-900">
                          {trainerDisplayData.stats.experience}+ anos
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Anos de experiência</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-help">
                        <UserCheck className="h-5 w-5 text-orange-500 mb-2" />
                        <span className="text-xs font-medium text-gray-900">
                          {trainerDisplayData.stats.students}+
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Alunos ativos atualmente</p>
                    </TooltipContent>
                  </Tooltip>

                </div>
              </CardShell>
            </Aside>
          </ContentGrid>

          {/* Bottom CTA */}
          <Section>
            <CardShell className="rounded-3xl text-center">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Pronto para começar sua transformação?
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Junte-se a mais de {trainerDisplayData.stats.students} alunos que já estão alcançando seus objetivos com treinos personalizados e acompanhamento profissional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="brand" size="lg" className="px-8">
                  Começar Agora
                </Button>
                <Button variant="glass" size="lg" className="px-8">
                  Agendar Conversa
                </Button>
              </div>
            </CardShell>
          </Section>
        </div>

        <Footer />
      </PageShell>
    </TooltipProvider>
  );
}

// Exportação padrão
export default TrainerProfilePage;

// Exportação nomeada para uso direto
export { TrainerProfilePage };