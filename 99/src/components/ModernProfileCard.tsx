import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import {
  MapPin,
  Plus,
  MessageCircle,
  Star,
  CheckCircle,
  Heart,
} from "lucide-react";
import { useNavigation } from '../hooks/useNavigation';
import { trainerProfileService, type TrainerProfile } from '../services/trainer-profile.service';
import { programsUnifiedService } from '../services/programs-unified.service';
import { normalizeTrainerRow, type NormalizedTrainer } from '../utils/data-normalization';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// Props para dados mock (compatibilidade)
interface MockProfileCardProps {
  id?: string; // ID (UUID) para compatibilidade 
  slug?: string; // ✅ SLUG OBRIGATÓRIO PARA NAVEGAÇÃO
  name: string;
  location: string;
  avatar: string;
  portfolioImages: string[];
  tags: string[];
  stats: {
    followers: string;
    following: string;
    views: string;
  };
  rating?: number;
  isVerified?: boolean;
  className?: string;
}

// Props para dados reais do sistema híbrido
interface HybridProfileCardProps {
  trainerId?: string;
  userId?: string;
  slug?: string; // ✅ SLUG OBRIGATÓRIO para navegação
  trainerData?: TrainerProfile;
  className?: string;
}

// Union type para ambos os modos
type ProfileCardProps = MockProfileCardProps | HybridProfileCardProps;

// Interface para dados dos programas com navegação
interface ProgramImageData {
  id: string;
  src: string;
  title: string;
  onClick: (() => void) | null;
}

export function ModernProfileCard(props: ProfileCardProps) {
  const navigation = useNavigation();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [trainerData, setTrainerData] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [programImages, setProgramImages] = useState<string[]>([]);
  const [trainerPrograms, setTrainerPrograms] = useState<any[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  
  // Estados para tooltip com delay
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎯 HANDLERS PARA TOOLTIP COM DELAY DE 2 SEGUNDOS
  const handleMouseEnter = (imageId: string) => {
    setHoveredImage(imageId);
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 2000); // 2 segundos
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredImage(null);
    setShowTooltip(false);
  };

  // 🎯 FUNÇÃO PARA GERAR DADOS DAS IMAGENS BASEADOS NOS PROGRAMAS
  const getPortfolioImages = (): ProgramImageData[] => {
    if (trainerPrograms.length === 0) {
      // Fallback: 1 imagem mock
      return [{
        id: 'mock',
        src: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
        title: 'Programa de Exemplo',
        onClick: null
      }];
    }

    // Mapear programas reais com ordem de prioridade correta
    return trainerPrograms.slice(0, 3).map(program => {
      // 🎯 ORDEM DE PRIORIDADE PARA IMAGEM DE CAPA (baseada na estrutura real dos dados):
      // 1. coverImage (ProgramData direto)
      // 2. thumbnail (PublishedProgram)
      // 3. program_data.gallery.cover_image.url (estrutura JSONB)
      // 4. fallback
      
      let coverImageUrl = '';
      
      // 1. Verificar coverImage direto (trainingProgramsService)
      if (program.coverImage && typeof program.coverImage === 'string' && program.coverImage.trim() !== '') {
        coverImageUrl = program.coverImage;
        console.log('🖼️ [Portfolio] Usando coverImage:', coverImageUrl);
      }
      // 2. Verificar thumbnail (publishedProgramsService) 
      else if (program.thumbnail && typeof program.thumbnail === 'string' && program.thumbnail.trim() !== '') {
        coverImageUrl = program.thumbnail;
        console.log('🖼️ [Portfolio] Usando thumbnail:', coverImageUrl);
      }
      // 3. Verificar estrutura JSONB
      else if (program.program_data?.gallery?.cover_image?.url && typeof program.program_data.gallery.cover_image.url === 'string' && program.program_data.gallery.cover_image.url.trim() !== '') {
        coverImageUrl = program.program_data.gallery.cover_image.url;
        console.log('🖼️ [Portfolio] Usando JSONB gallery:', coverImageUrl);
      }
      // 4. Fallback
      else {
        coverImageUrl = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400';
        console.log('🖼️ [Portfolio] Usando fallback para programa:', program.id);
      }

      return {
        id: program.id,
        src: coverImageUrl,
        title: program.title || 'Programa de Treinamento',
        onClick: () => {
          console.log('🎯 Navegando para programa:', program.id, program.title);
          navigation.navigateToProgram(program.id);
        }
      };
    });
  };

  // 🎯 FUNÇÃO PARA GRID RESPONSIVO BASEADO NA QUANTIDADE DE PROGRAMAS
  const getGridColumns = (imageCount: number): string => {
    if (imageCount === 1) return 'grid-cols-1';
    if (imageCount === 2) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  // Verificar se são props híbridas ou mock
  const isHybridMode = 'trainerId' in props || 'userId' in props || 'trainerData' in props;
  
  // 🎯 FUNÇÃO CRÍTICA - DETERMINAR SLUG PARA NAVEGAÇÃO (APENAS SLUGS VÁLIDOS)
  const getNavigationSlug = (): string | null => {
    if (isHybridMode) {
      const hybridProps = props as HybridProfileCardProps;
      
      // 1. PRIORIDADE MÁXIMA: slug direto nas props
      if (hybridProps.slug && typeof hybridProps.slug === 'string' && hybridProps.slug.trim() !== '') {
        const normalizedSlug = hybridProps.slug.trim().toLowerCase();
        
        // ✅ VALIDAÇÃO RIGOROSA: aceitar apenas slugs limpos (sem UUID)
        if (!/^[a-z0-9-]+$/.test(normalizedSlug) || normalizedSlug.includes('undefined')) {
          console.error('❌ Slug inválido nas props:', hybridProps.slug);
          return null;
        }
        
        console.log('✅ Slug validado nas props:', normalizedSlug);
        return normalizedSlug;
      }
      
      // 2. Slug do trainerData carregado
      if (trainerData?.profile_data?.slug && typeof trainerData.profile_data.slug === 'string' && trainerData.profile_data.slug.trim() !== '') {
        const normalizedSlug = trainerData.profile_data.slug.trim().toLowerCase();
        
        // ✅ VALIDAÇÃO RIGOROSA: aceitar apenas slugs limpos
        if (!/^[a-z0-9-]+$/.test(normalizedSlug) || normalizedSlug.includes('undefined')) {
          console.error('❌ Slug inválido no trainerData:', trainerData.profile_data.slug);
          return null;
        }
        
        console.log('✅ Slug validado no trainerData:', normalizedSlug);
        return normalizedSlug;
      }
      
      // 🚫 REMOVIDO: Fallbacks para UUID - NUNCA usar UUID para navegação
      console.error('❌ Nenhum slug válido encontrado no modo híbrido');
      console.error('❌ Props:', { slug: hybridProps.slug });
      console.error('❌ TrainerData slug:', trainerData?.profile_data?.slug);
      return null;
    } else {
      // Mock mode: usar apenas slugs válidos (não UUIDs)
      const mockProps = props as MockProfileCardProps;
      if (mockProps.slug && typeof mockProps.slug === 'string' && mockProps.slug.trim() !== '') {
        const normalizedSlug = mockProps.slug.trim().toLowerCase();
        
        // ✅ VALIDAÇÃO RIGOROSA: aceitar apenas slugs limpos
        if (!/^[a-z0-9-]+$/.test(normalizedSlug) || normalizedSlug.includes('undefined')) {
          console.error('❌ Slug inválido no modo mock:', mockProps.slug);
          return null;
        }
        
        console.log('✅ Slug validado no modo mock:', normalizedSlug);
        return normalizedSlug;
      }
      
      // Fallback para ID apenas se parecer com slug (não UUID)
      if (mockProps.id && typeof mockProps.id === 'string' && mockProps.id.trim() !== '') {
        const normalized = mockProps.id.trim().toLowerCase();
        
        // ✅ Só aceitar se não parecer com UUID
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
          console.log('✅ ID do mock aceito como slug:', normalized);
          return normalized;
        }
        
        console.warn('⚠️ ID do mock rejeitado (parece UUID):', mockProps.id);
      }
    }
    
    console.error('❌ ERRO CRÍTICO: Nenhum slug válido disponível para navegação');
    console.error('❌ Navegação bloqueada para evitar erros');
    return null;
  };

  // Carregar dados do sistema híbrido e programas
  useEffect(() => {
    const loadTrainerData = async () => {
      if (!isHybridMode) return;
      
      const hybridProps = props as HybridProfileCardProps;
      
      // Se já tem dados, usar
      if (hybridProps.trainerData) {
        setTrainerData(hybridProps.trainerData);
        // Carregar programas para o trainer já carregado
        loadTrainerPrograms(hybridProps.trainerData.user_id);
        return;
      }

      // Carregar por ID
      if (hybridProps.trainerId || hybridProps.userId) {
        try {
          setLoading(true);
          let profile: TrainerProfile | null = null;
          
          if (hybridProps.userId) {
            profile = await trainerProfileService.getByUserId(hybridProps.userId);
          } else if (hybridProps.trainerId) {
            profile = await trainerProfileService.getById(hybridProps.trainerId);
          }
          
          setTrainerData(profile);
          
          // Carregar programas se encontrou o trainer
          if (profile) {
            loadTrainerPrograms(profile.user_id);
          }
        } catch (error) {
          console.error('Erro ao carregar dados do trainer:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    const loadTrainerPrograms = async (userId: string) => {
      try {
        setIsLoadingPrograms(true);
        console.log('🔍 [SERVICE UNIFICADO] Carregando programas do trainer:', userId);
        
        // 🎯 VALIDAÇÃO UUID: verificar se userId é um UUID válido antes de buscar programas
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
          console.warn('⚠️ UserId não é um UUID válido, pulando busca de programas:', userId);
          setProgramImages([]);
          setTrainerPrograms([]);
          return;
        }
        
        // 🎯 USAR SERVICE UNIFICADO (substitui múltiplos services)
        const response = await programsUnifiedService.getProgramsByTrainer(userId, { limit: 10 });
        
        if (!response.success || !response.data) {
          console.log('⚠️ Service unificado falhou, tentando método de compatibilidade');
          
          // Fallback para método de compatibilidade
          const programs = await programsUnifiedService.getByTrainerId(userId);
          console.log('📊 [Compatibilidade] Programas encontrados:', programs.length);
          
          if (programs.length > 0) {
            // Converter ProgramData[] para formato esperado pelo componente
            const programsData = programs.map(program => ({
              id: program.id,
              trainerId: program.trainerId,
              title: program.title,
              description: program.description,
              coverImage: program.coverImage,
              thumbnail: program.coverImage, // alias
              program_data: {
                gallery: {
                  cover_image: {
                    url: program.coverImage
                  }
                }
              }
            }));
            
            setTrainerPrograms(programsData);
            
            // Extrair imagens
            const coverImages = programsData
              .map(program => program.coverImage)
              .filter(url => url && typeof url === 'string' && url.trim() !== '')
              .slice(0, 3);
            
            console.log('✅ [Compatibilidade] Encontradas', coverImages.length, 'imagens');
            setProgramImages(coverImages);
          } else {
            console.log('ℹ️ Nenhum programa encontrado para o trainer');
            setProgramImages([]);
            setTrainerPrograms([]);
          }
          
          return;
        }
        
        console.log('✅ [SERVICE UNIFICADO] Sucesso! Programas encontrados:', response.data.data.length);
        
        // Converter Program[] para formato esperado pelo componente
        const programsData = response.data.data.map(program => ({
          id: program.id,
          trainerId: program.trainer.id,
          title: program.title,
          description: program.description,
          coverImage: program.media[0]?.url || '',
          thumbnail: program.media[0]?.url || '', // alias
          program_data: {
            gallery: {
              cover_image: {
                url: program.media[0]?.url || ''
              }
            }
          }
        }));
        
        setTrainerPrograms(programsData);
        
        // Extrair imagens
        const coverImages = programsData
          .map(program => program.coverImage)
          .filter(url => url && typeof url === 'string' && url.trim() !== '')
          .slice(0, 3);
        
        console.log('✅ [SERVICE UNIFICADO] Encontradas', coverImages.length, 'imagens de programas');
        setProgramImages(coverImages);
        
      } catch (error) {
        console.error('❌ Erro ao carregar programas (service unificado):', error);
        console.log('🔄 Usando fallback vazio para programas');
        setProgramImages([]);
        setTrainerPrograms([]);
      } finally {
        setIsLoadingPrograms(false);
      }
    };

    loadTrainerData();

    // Cleanup: limpar timeout quando componente for desmontado
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHybridMode, props]);

  // Determinar dados a serem exibidos
  let displayData: {
    name: string;
    location: string;
    avatar: string;
    portfolioImages: string[];
    tags: string[];
    stats: { followers: string; following: string; views: string; };
    rating: number;
    isVerified: boolean;
    className?: string;
  };

  if (isHybridMode && trainerData) {
    // 🎯 USAR NORMALIZAÇÃO PADRÃO - NOMES & AVATARES
    const normalized = normalizeTrainerRow(trainerData);
    const profileData = trainerData.profile_data;
    
    // Portfolio: Agora gerenciado dinamicamente pela função getPortfolioImages()
    // Mantemos compatibilidade para outros usos do displayData
    const portfolioImages = ['placeholder']; // Não mais usado na renderização

    displayData = {
      name: normalized.name,
      location: normalized.city || 'Localização não informada',
      avatar: normalized.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      portfolioImages,
      tags: normalized.specialties.slice(0, 2),
      stats: {
        followers: Math.floor(Math.random() * 500 + 100).toString(),
        following: Math.floor(Math.random() * 200 + 50).toString(),
        views: `${Math.floor(Math.random() * 50 + 10)}k`
      },
      rating: 4.5 + Math.random() * 0.4, // Entre 4.5 e 4.9
      isVerified: normalized.isVerified,
      className: (props as HybridProfileCardProps).className
    };
  } else if (!isHybridMode) {
    // Dados mock (props originais)
    const mockProps = props as MockProfileCardProps;
    displayData = {
      name: mockProps.name,
      location: mockProps.location,
      avatar: mockProps.avatar,
      portfolioImages: mockProps.portfolioImages,
      tags: mockProps.tags,
      stats: mockProps.stats,
      rating: mockProps.rating || 4.9,
      isVerified: mockProps.isVerified ?? true,
      className: mockProps.className
    };
  } else {
    // Loading ou fallback
    displayData = {
      name: loading ? 'Carregando...' : 'Trainer',
      location: loading ? 'Carregando...' : 'Localização não informada',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      portfolioImages: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
        'https://images.unsplash.com/photo-1583500178690-f7ee82126ed8?w=400'
      ],
      tags: [],
      stats: { followers: '0', following: '0', views: '0' },
      rating: 0,
      isVerified: false,
      className: isHybridMode ? (props as HybridProfileCardProps).className : undefined
    };
  }

  const { name, location, avatar, portfolioImages, tags, stats, rating, isVerified, className } = displayData;

  return (
    <Card
      className={`flex h-full flex-col overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-2xl w-full ${className ?? ""}`}
      style={{ minWidth: '240px' }}
    >
      <CardContent className="flex flex-col h-full p-[0px]">
        {/* Portfolio Grid - Dinâmico baseado nos programas do treinador */}
        <div className="relative h-[100px] bg-gray-50">
          <TooltipProvider>
            {(() => {
              const portfolioImagesData = getPortfolioImages();
              const gridCols = getGridColumns(portfolioImagesData.length);
              
              return (
                <div className={`grid ${gridCols} gap-0.5 w-full h-[100px] p-1`}>
                  {portfolioImagesData.map((imageData, index) => (
                    <Tooltip 
                      key={imageData.id} 
                      open={hoveredImage === imageData.id && showTooltip}
                    >
                      <TooltipTrigger asChild>
                        <div
                          className={`relative rounded-md overflow-hidden bg-gray-200 ${
                            imageData.onClick ? 'cursor-pointer' : ''
                          }`}
                          onMouseEnter={() => handleMouseEnter(imageData.id)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => {
                            if (imageData.onClick) {
                              imageData.onClick();
                            }
                          }}
                        >
                          <img
                            src={imageData.src}
                            alt={`${name} - ${imageData.title}`}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              // Fallback para imagens fitness específicas por programa
                              const target = e.target as HTMLImageElement;
                              const fallbackImages = [
                                'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
                                'https://images.pexels.com/photos/866023/pexels-photo-866023.jpeg?auto=compress&cs=tinysrgb&w=400',
                                'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=400'
                              ];
                              target.src = fallbackImages[index % fallbackImages.length] || fallbackImages[0];
                            }}
                          />
                          {/* Overlay sutil para melhorar legibilidade */}
                          <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{imageData.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              );
            })()}
          </TooltipProvider>

          {/* Avatar sobreposto */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="relative">
              <Avatar className="w-20 h-20 ring-4 ring-white shadow-md">
                <AvatarImage 
                  src={avatar && avatar.trim() !== '' ? avatar : undefined} 
                  alt={name}
                  onError={(e) => {
                    // Remove src para forçar fallback quando imagem falha
                    const target = e.target as HTMLImageElement;
                    target.src = '';
                  }}
                />
                <AvatarFallback className="bg-gray-900 text-white text-xl font-semibold">
                  {/* 🎯 USAR NORMALIZAÇÃO PADRÃO - fallback consistente */}
                  {name && typeof name === 'string' && name.trim() !== ''
                    ? name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : 'PT'}
                </AvatarFallback>
              </Avatar>

              {isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-[#e0093e] rounded-full flex items-center justify-center ring-2 ring-white">
                  <CheckCircle className="w-4 h-4 text-white fill-current" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Section - ocupa o restante e dá espaço para o avatar */}
        <div className="flex-1 flex flex-col px-5 pb-3 pt-12 relative">
          {/* Name and Rating */}
          <div className="text-center mb-2.5">
            <div className="flex flex-col items-center gap-1 mb-0.5">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2 text-center">
                {name}
              </h3>
              <div className="flex items-center justify-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                <span className="font-medium text-gray-900 text-base">
                  {rating}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0 text-gray-500" />
              <span className="truncate">{location}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-2.5 py-1 text-xs rounded-full border-0 font-medium bg-gray-100 text-gray-700 whitespace-nowrap"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1 mb-3 border-t border-gray-100 pt-3">
            <div className="text-center px-1">
              <div className="font-semibold text-gray-900 text-sm truncate">
                {stats.followers}
              </div>
              <div className="text-gray-600 text-xs truncate">
                Seguidores
              </div>
            </div>
            <div className="text-center px-1 border-x border-gray-100">
              <div className="font-semibold text-gray-900 text-sm truncate">
                {stats.following}
              </div>
              <div className="text-gray-600 text-xs truncate">
                Seguindo
              </div>
            </div>
            <div className="text-center px-1">
              <div className="font-semibold text-gray-900 text-sm truncate">
                {stats.views}
              </div>
              <div className="text-gray-600 text-xs truncate">
                Views
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="mt-auto space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const slug = getNavigationSlug();
                  if (slug) {
                    console.log('🎯 Ver perfil clicado para trainer:', slug);
                    navigation.navigateToTrainer(slug);
                  } else {
                    console.error('❌ NAVEGAÇÃO BLOQUEADA: Slug inválido ou não encontrado');
                    console.error('❌ Trainer deve ter slug válido para navegação');
                    // TODO: Implementar toast de erro para usuário
                    // toast.error('Este treinador não está disponível no momento');
                  }
                }}
                className="flex-1 h-9 rounded-xl text-sm font-medium transition-all duration-200 bg-[#e0093e] text-white hover:bg-[#c40835] border-0"
              >
                Ver perfil
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={`h-9 w-9 p-0 rounded-full border transition-all duration-200 ${
                  isLiked
                    ? "border-red-300 bg-red-50 hover:bg-red-100"
                    : "border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    isLiked
                      ? "text-red-500 fill-current"
                      : "text-gray-500"
                  }`}
                />
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                const slug = getNavigationSlug();
                if (slug) {
                  console.log('💬 Mensagem clicada para trainer slug:', slug);
                  // TODO: Implementar sistema de mensagens
                } else {
                  console.error('❌ Mensagem bloqueada: slug não encontrado');
                  // TODO: Implementar toast de erro
                }
              }}
              className="w-full h-9 rounded-full text-sm font-medium border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-gray-600" />
              Mensagem
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}