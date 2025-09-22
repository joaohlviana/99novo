import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  Star, 
  CheckCircle, 
  MapPin,
  Heart,
  Share2,
  Instagram,
  MoreHorizontal
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { programsUnifiedService } from '../services/programs-unified.service';
import { Program, Trainer } from '../types/entities';

interface ProgramDetailsProps {
  program?: Program | null;
  trainer?: Trainer | null;
  onNavigateToTrainer: (trainerId: string) => void;
}

// Adaptador para mapear dados reais para formato esperado pelo componente
function adaptProgramForDisplay(program: Program) {
  return {
    ...program,
    // Mapear campos que o componente espera mas não existem no tipo Program
    reviewCount: program.stats?.reviewCount || 0,
    completions: program.stats?.enrollments || 0,
    trainer: {
      ...program.trainer,
      // Mapear avatar para image (compatibilidade)
      image: program.trainer.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  };
}

export function ProgramDetails({ program, trainer, onNavigateToTrainer }: ProgramDetailsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(program?.stats?.reviewCount || 21);
  const [otherPrograms, setOtherPrograms] = useState<Program[]>([]);
  const [loadingOtherPrograms, setLoadingOtherPrograms] = useState(false);

  // Adaptar programa para exibição
  const displayProgram = program ? adaptProgramForDisplay(program) : null;

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleShare = () => {
    if (!displayProgram) return;
    
    if (navigator.share) {
      navigator.share({
        title: displayProgram.title,
        text: 'Confira este incrível programa de transformação corporal!',
        url: window.location.href,
      });
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Load other programs from the same trainer
  useEffect(() => {
    const loadOtherPrograms = async () => {
      if (!program?.trainer.id) return;
      
      setLoadingOtherPrograms(true);
      try {
        console.log('🔍 [UNIFIED SERVICE] Carregando outros programas do trainer:', program.trainer.id);
        
        const response = await programsUnifiedService.getProgramsByTrainer(program.trainer.id, { limit: 4 });
        if (response.success && response.data) {
          // Filter out current program
          const otherProgramsList = response.data.data.filter(p => p.id !== program.id);
          console.log('✅ [UNIFIED SERVICE] Outros programas encontrados:', otherProgramsList.length);
          setOtherPrograms(otherProgramsList.slice(0, 3));
        } else {
          console.warn('⚠️ [UNIFIED SERVICE] Nenhum outro programa encontrado');
          setOtherPrograms([]);
        }
      } catch (error) {
        console.error('❌ [UNIFIED SERVICE] Erro ao carregar outros programas:', error);
        setOtherPrograms([]);
      } finally {
        setLoadingOtherPrograms(false);
      }
    };

    loadOtherPrograms();
  }, [program]);

  // Return loading state if no program
  if (!displayProgram) {
    return (
      <div className="space-y-6">
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
    );
  }

  // Format level display
  const getLevelDisplay = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return level;
    }
  };

  return (
    <div className="space-y-0">
      {/* Program Header - Similar to Fiverr service header */}
      <section className="mb-8">
        {/* Trainer Info Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={displayProgram.trainer.image} alt={displayProgram.trainer.name} />
              <AvatarFallback>{displayProgram.trainer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{displayProgram.trainer.name}</span>
                <Badge variant="secondary" className="text-xs">Pro</Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3 w-3 fill-current text-yellow-500" />
                <span>{displayProgram.trainer.rating?.toFixed(1) || '4.8'}</span>
                <span>({displayProgram.reviewCount})</span>
                <span className="mx-2">•</span>
                <span>{displayProgram.completions} vendas</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Instagram Button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-accent"
              onClick={() =>
                window.open(
                  "https://instagram.com/joao_coach",
                  "_blank",
                )
              }
            >
              <Instagram className="h-4 w-4" />
              <span className="hidden sm:inline">@{displayProgram.trainer.name.split(' ')[0].toLowerCase()}_coach</span>
            </Button>

            {/* Like Button */}
            <Button
              variant="outline"
              size="sm"
              className={`gap-2 transition-colors border-border ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'hover:text-red-500'
              }`}
              onClick={handleLike}
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${
                  isLiked ? 'fill-current' : ''
                }`} 
              />
              <span className="font-medium">{likeCount}</span>
            </Button>

            {/* Share Button */}
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-accent border-border"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>

            {/* More Options Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-accent border-border"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem>
                  Reportar programa
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Bloquear treinador
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Copiar link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Program Title */}
        <h1 className="text-2xl lg:text-3xl font-semibold mb-4 leading-tight">
          {displayProgram.title}
        </h1>

        {/* Program Image */}
        <div className="relative rounded-xl overflow-hidden mb-6">
          <ImageWithFallback
            src={displayProgram.media[0]?.url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'}
            alt={displayProgram.title}
            className="w-full h-64 lg:h-80 object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-white/90 text-black shadow-sm backdrop-blur-sm">
              {displayProgram.category}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 shadow-sm backdrop-blur-sm">
              <MapPin className="h-3 w-3 mr-1" />
              Online
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {getLevelDisplay(displayProgram.level)}
            </Badge>
          </div>
        </div>
      </section>

      {/* Program Description - Fiverr style */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sobre este programa</h2>
        <div className="prose max-w-none text-muted-foreground space-y-4">
          <p>{displayProgram.description}</p>
          
          {displayProgram.shortDescription && displayProgram.shortDescription !== displayProgram.description && (
            <p>{displayProgram.shortDescription}</p>
          )}
          
          <p>
            <strong>O que torna este programa único:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            {displayProgram.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          
          <p>
            <strong>Para quem é este programa:</strong><br/>
            Pessoas com nível {getLevelDisplay(displayProgram.level).toLowerCase()} que querem levar seus resultados 
            para o próximo nível. Ideal para quem busca resultados consistentes e duradouros.
          </p>
          
          <p>
            <strong>Modalidade:</strong><br/>
            Este programa é <span className="font-medium text-blue-600">100% online</span>. Você pode treinar 
            de qualquer lugar - em casa, na academia ou ao ar livre. Todos os exercícios têm variações 
            para diferentes ambientes e equipamentos disponíveis.
          </p>
          
          <p>
            <strong>Duração:</strong><br/>
            {displayProgram.duration.weeks} semanas de treinamento intensivo, com aproximadamente {displayProgram.duration.hoursPerWeek} horas 
            de treino por semana. Total de {displayProgram.duration.totalHours} horas de conteúdo.
          </p>
        </div>
      </section>

      <Separator className="mb-8" />

      {/* About the Trainer - Prominent section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Sobre o treinador</h2>
        <div className="flex gap-6">
          <Avatar className="h-20 w-20 flex-shrink-0">
            <AvatarImage src={displayProgram.trainer.image} alt={displayProgram.trainer.name} />
            <AvatarFallback>{displayProgram.trainer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{displayProgram.trainer.name}</h3>
              <Button variant="outline" size="sm" onClick={() => onNavigateToTrainer(displayProgram.trainer.id)}>
                Ver perfil completo
              </Button>
            </div>
            <p className="text-muted-foreground mb-3">{displayProgram.trainer.title}</p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium">{displayProgram.trainer.rating?.toFixed(1) || '4.8'}</span>
                </div>
                <div className="text-muted-foreground">({displayProgram.stats.reviewCount} avaliações)</div>
              </div>
              <div>
                <div className="font-medium">{displayProgram.stats.enrollments}</div>
                <div className="text-muted-foreground">Programas vendidos</div>
              </div>
              <div>
                <div className="font-medium">~2 horas</div>
                <div className="text-muted-foreground">Tempo de resposta</div>
              </div>
              <div>
                <div className="font-medium">{displayProgram.stats.activeStudents}+</div>
                <div className="text-muted-foreground">Alunos ativos</div>
              </div>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {trainer?.bio || `${displayProgram.trainer.title} especializado em ${displayProgram.category.toLowerCase()}. 
              Profissional experiente com foco em resultados e acompanhamento personalizado. 
              Meu diferencial é o atendimento humanizado e metodologia comprovada.`}
            </p>
          </div>
        </div>
      </section>

      <Separator className="mb-8" />

      {/* FAQ Section - Prominent like Fiverr */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Perguntas frequentes</h2>
        <div className="space-y-4">
          {[
            {
              question: "Preciso ter experiência prévia com musculação?",
              answer: "Este programa é destinado a pessoas com experiência básica. Se você é completamente iniciante, recomendo começar com meu programa 'Funcional para Iniciantes' para criar uma base sólida primeiro."
            },
            {
              question: "Como funciona um programa 100% online?",
              answer: "Você recebe acesso a uma plataforma completa com vídeos explicativos de cada exercício, cronograma detalhado e pode baixar tudo no seu celular. Acompanho sua evolução via WhatsApp e você pode treinar no horário que preferir, onde estiver."
            },
            {
              question: "Quanto tempo por dia precisarei dedicar aos treinos?",
              answer: "Os treinos têm duração média de 45-60 minutos, 4-5 vezes por semana. Também incluo opções de treinos mais curtos (30min) para dias corridos."
            },
            {
              question: "O programa funciona para treino em casa?",
              answer: "Sim! Forneço adaptações completas para treino em casa com equipamentos mínimos. Você receberá duas versões: uma para academia e outra para casa."
            },
            {
              question: "Como funciona o acompanhamento personalizado?",
              answer: "Você terá acesso direto a mim via WhatsApp para tirar dúvidas, enviar fotos dos treinos e receber feedback. Também faço ajustes no programa baseado na sua evolução."
            },
            {
              question: "E se eu não conseguir seguir o cronograma exato?",
              answer: "O programa é flexível! Você pode adaptar os dias de treino à sua rotina. O importante é manter a consistência. Eu te ajudo a encontrar a melhor estratégia para seu estilo de vida."
            },
            {
              question: "Há garantia de resultados?",
              answer: "Ofereço garantia de 30 dias. Se você seguir o programa conforme orientado e não estiver satisfeito com os resultados iniciais, devolvemos seu investimento integral."
            }
          ].map((faq, index) => (
            <div key={index} className="border-b border-border pb-4">
              <h4 className="font-medium mb-2">{faq.question}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mb-8" />

      {/* More from this trainer */}
      <section className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src={displayProgram.trainer.image} alt={displayProgram.trainer.name} />
            <AvatarFallback>{displayProgram.trainer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">Mais programas do {displayProgram.trainer.name}</h2>
            <p className="text-muted-foreground text-sm">Explore outros programas deste treinador</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadingOtherPrograms ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </Card>
            ))
          ) : otherPrograms.length > 0 ? (
            otherPrograms.map((otherProgram) => (
              <Card key={otherProgram.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative h-32">
                  <ImageWithFallback
                    src={otherProgram.media[0]?.url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80'}
                    alt={otherProgram.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">{otherProgram.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span className="text-xs text-muted-foreground">{otherProgram.stats.averageRating?.toFixed(1) || '4.8'}</span>
                    </div>
                    <span className="font-medium text-sm">R$ {otherProgram.pricing.amount.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-muted-foreground">
              <p>Nenhum outro programa encontrado deste treinador.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}