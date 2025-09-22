import { lazy, Suspense } from 'react';
import { TooltipProvider } from '../ui/tooltip';
import { PageShell } from '../layout/PageShell';
import { ContentGrid } from '../layout/ContentGrid';
import { Main } from '../layout/Main';
import { Aside } from '../layout/Aside';
import { Section } from '../layout/Section';
import { CardShell } from '../layout/CardShell';
import { LoadingSpinner } from '../ui/loading-spinner';

// Lazy load components specific to trainer profile
const Header = lazy(() => import('../Header').then(module => ({ default: module.Header })));
const SportsMenu = lazy(() => import('../SportsMenu').then(module => ({ default: module.SportsMenu })));
const TrainerHeader = lazy(() => import('../trainer/TrainerHeader').then(module => ({ default: module.TrainerHeader })));
const TrainerStories = lazy(() => import('../trainer/TrainerStories').then(module => ({ default: module.TrainerStories })));
const TrainerVideo = lazy(() => import('../trainer/TrainerVideo').then(module => ({ default: module.TrainerVideo })));
const TrainerPrograms = lazy(() => import('../trainer/TrainerPrograms').then(module => ({ default: module.TrainerPrograms })));
const TrainerQualifications = lazy(() => import('../trainer/TrainerQualifications').then(module => ({ default: module.TrainerQualifications })));
const TrainerReviews = lazy(() => import('../trainer/TrainerReviews').then(module => ({ default: module.TrainerReviews })));
const PricingCard = lazy(() => import('../PricingCard').then(module => ({ default: module.PricingCard })));
const Footer = lazy(() => import('../Footer').then(module => ({ default: module.Footer })));

// Import required UI components directly (small and commonly used)
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { ExpandableTabs } from '../ui/expandable-tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

// Import icons directly (lightweight)
import { 
  Video, 
  Clock,
  CheckCircle,
  Award,
  UserCheck,
  User,
  FileText,
  MessageCircle,
  DollarSign
} from 'lucide-react';

// Import data (consider lazy loading this too if it gets large)
import { trainerData } from '../../data/trainer-data';
import { programs } from '../../data/programs-data';
import { reviews, stories, pricingOptions } from '../../data/mock-data';

interface TrainerProfileProps {
  selectedTrainerId: string | null;
  selectedSport: string;
  activeTrainerTab: number | null;
  onSetSelectedSport: (sport: string) => void;
  onSetActiveTrainerTab: (tab: number | null) => void;
  onNavigateToProgram: (programId: string) => void;
  onNavigateToHome: () => void;
  onNavigateToBecomeTrainer: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToTrainer: (trainerId: string) => void;
}

export function TrainerProfile({
  selectedTrainerId,
  selectedSport,
  activeTrainerTab,
  onSetSelectedSport,
  onSetActiveTrainerTab,
  onNavigateToProgram,
  onNavigateToHome,
  onNavigateToBecomeTrainer,
  onNavigateToCatalog,
  onNavigateToTrainer,
}: TrainerProfileProps) {
  const suspenseFallback = <LoadingSpinner size="md" />;

  return (
    <TooltipProvider>
      <PageShell>
        <Suspense fallback={suspenseFallback}>
          <Header 
            onNavigateToCatalog={onNavigateToHome}
            onNavigateToTrainer={onNavigateToTrainer}
            onNavigateToBecomeTrainer={onNavigateToBecomeTrainer}
          />
        </Suspense>
        
        <div className="pt-16">
          <Suspense fallback={suspenseFallback}>
            <SportsMenu 
              selectedSport={selectedSport}
              onSportSelect={onSetSelectedSport}
            />
          </Suspense>

          {/* Breadcrumb */}
          <div className="container py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateToCatalog();
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Treinadores
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">
                    João Silva
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          {/* GRID PADRÃO 12C */}
          <ContentGrid hasAside>
            <Main>
              {/* Trainer Header - Hero Section */}
              <CardShell className="rounded-3xl">
                <Suspense fallback={<LoadingSpinner size="lg" />}>
                  <TrainerHeader 
                    name={trainerData.name}
                    title={trainerData.title}
                    image={trainerData.image}
                    rating={trainerData.rating}
                    reviewCount={trainerData.reviewCount}
                    location={trainerData.location}
                    description={trainerData.description}
                    specialties={trainerData.specialties}
                    stats={trainerData.stats}
                  />
                </Suspense>
              </CardShell>

              {/* Navigation Tabs */}
              <section>
                <div className="hidden flex justify-center mb-6">
                  <ExpandableTabs
                    tabs={[
                      { title: "Sobre", icon: User },
                      { title: "Programas", icon: FileText },
                      { type: "separator" },
                      { title: "Avaliações", icon: MessageCircle },
                      { title: "Preços", icon: DollarSign },
                    ]}
                    activeColor="text-brand"
                    onChange={onSetActiveTrainerTab}
                  />
                </div>
              </section>

              {/* Content based on active tab */}
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <TrainerProfileContent 
                  activeTab={activeTrainerTab}
                  stories={stories}
                  programs={programs}
                  reviews={reviews}
                  rating={trainerData.rating}
                  reviewCount={trainerData.reviewCount}
                  onNavigateToProgram={onNavigateToProgram}
                />
              </Suspense>
            </Main>

            <Aside>
              <Suspense fallback={<LoadingSpinner />}>
                <PricingCard 
                  basePrice="R$ 35"
                  options={pricingOptions}
                />
              </Suspense>

              {/* Trainer Quick Info */}
              <CardShell>
                <TrainerQuickInfo />
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
                Junte-se a mais de 150 alunos que já estão alcançando seus objetivos com treinos personalizados e acompanhamento profissional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="brand" size="lg" className="px-8">
                  Começar Agora
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  Agendar Conversa
                </Button>
              </div>
            </CardShell>
          </Section>
        </div>

        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </PageShell>
    </TooltipProvider>
  );
}

// Separated content component for cleaner code
function TrainerProfileContent({ 
  activeTab, 
  stories, 
  programs, 
  reviews, 
  rating, 
  reviewCount, 
  onNavigateToProgram 
}: any) {
  // Default content (all tabs)
  if (activeTab === null) {
    return (
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
              programs={programs} 
              onNavigateToProgram={onNavigateToProgram}
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
              rating={rating}
              reviewCount={reviewCount}
              reviews={reviews}
            />
          </CardShell>
        </section>
      </>
    );
  }

  // Tab-specific content
  switch (activeTab) {
    case 0: // Sobre
      return (
        <>
          <section>
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
              <TrainerQualifications />
            </CardShell>
          </section>
        </>
      );

    case 1: // Programas
      return (
        <section>
          <CardShell>
            <TrainerPrograms 
              programs={programs} 
              onNavigateToProgram={onNavigateToProgram}
            />
          </CardShell>
        </section>
      );

    case 2: // Avaliações
      return (
        <section>
          <CardShell>
            <TrainerReviews 
              rating={rating}
              reviewCount={reviewCount}
              reviews={reviews}
            />
          </CardShell>
        </section>
      );

    case 3: // Preços
      return (
        <section>
          <CardShell className="text-center">
            <TrainerPricingOptions />
          </CardShell>
        </section>
      );

    default:
      return null;
  }
}

// Quick info component
function TrainerQuickInfo() {
  return (
    <>
      <h3 className="font-semibold text-gray-900 mb-4">Informações</h3>
      <div className="grid grid-cols-2 gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-help">
              <Clock className="h-5 w-5 text-blue-500 mb-2" />
              <span className="text-xs font-medium text-gray-900">~2h</span>
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
              <span className="text-xs font-medium text-gray-900">98%</span>
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
              <span className="text-xs font-medium text-gray-900">8+ anos</span>
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
              <span className="text-xs font-medium text-gray-900">150+</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Alunos ativos atualmente</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
}

// Pricing options component
function TrainerPricingOptions() {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Opções de Preços</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Sessão Individual</h3>
          <div className="text-2xl font-bold text-brand mb-2">R$ 80</div>
          <p className="text-sm text-muted-foreground mb-4">Por sessão de 1h</p>
          <ul className="text-sm space-y-1">
            <li>✓ Treino personalizado</li>
            <li>✓ Acompanhamento individual</li>
            <li>✓ Feedback em tempo real</li>
          </ul>
        </div>
        <div className="border rounded-xl p-6 border-brand relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand text-white px-3 py-1 rounded-full text-xs">
            Mais Popular
          </div>
          <h3 className="font-semibold mb-2">Pacote Mensal</h3>
          <div className="text-2xl font-bold text-brand mb-2">R$ 280</div>
          <p className="text-sm text-muted-foreground mb-4">4 sessões por mês</p>
          <ul className="text-sm space-y-1">
            <li>✓ Tudo do plano individual</li>
            <li>✓ Desconto de 12.5%</li>
            <li>✓ Plano nutricional</li>
            <li>✓ Suporte via WhatsApp</li>
          </ul>
        </div>
        <div className="border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Programa Completo</h3>
          <div className="text-2xl font-bold text-brand mb-2">R$ 450</div>
          <p className="text-sm text-muted-foreground mb-4">8 sessões por mês</p>
          <ul className="text-sm space-y-1">
            <li>✓ Máximo acompanhamento</li>
            <li>✓ Desconto de 30%</li>
            <li>✓ Nutrição personalizada</li>
            <li>✓ Grupo VIP de alunos</li>
          </ul>
        </div>
      </div>
    </>
  );
}