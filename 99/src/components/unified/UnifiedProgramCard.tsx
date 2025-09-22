/**
 * COMPONENTE UNIFICADO DE PROGRAM CARD - ARQUITETURA PADRONIZADA
 * =============================================================
 * Componente único que substitui todos os cards de programa
 * Suporta múltiplas variantes e contextos
 */

import { useState, useId } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Clock, 
  Users, 
  Star,
  Heart,
  Play,
  Dumbbell,
  Edit,
  Copy,
  Trash2,
  Eye,
  MoreVertical,
  MapPin,
  Trophy,
  MessageCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  UnifiedProgramCardData,
  UnifiedProgramDashboardData,
  ProgramCardVariant,
  ProgramCardContext,
  UnifiedProgramActions
} from '../../types/unified-program';
import { unifiedProgramsService } from '../../services/unified-programs.service';
import { useNavigation } from '../../hooks/useNavigation';

// ===============================================
// TIPOS DO COMPONENTE
// ===============================================

interface UnifiedProgramCardProps {
  // Dados (sempre do formato unificado)
  program: UnifiedProgramCardData | UnifiedProgramDashboardData;
  
  // Configuração visual
  variant?: ProgramCardVariant;
  context?: ProgramCardContext;
  
  // Ações disponíveis
  actions?: UnifiedProgramActions;
  onClick?: (programId: string) => void;
  
  // Estados externos
  isEnrolled?: boolean;
  isLiked?: boolean;
  
  // Configurações adicionais
  showTrainer?: boolean;
  showActions?: boolean;
  showToggle?: boolean;
  className?: string;
}

// ===============================================
// COMPONENTE PRINCIPAL
// ===============================================

export function UnifiedProgramCard({
  program,
  variant = 'standard',
  context = 'public',
  actions,
  onClick,
  isEnrolled = false,
  isLiked: initialLiked = false,
  showTrainer = true,
  showActions = false,
  showToggle = false,
  className = ''
}: UnifiedProgramCardProps) {
  
  // Hook de navegação para fallback
  const navigation = useNavigation();
  
  // Estados internos
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isUpdating, setIsUpdating] = useState(false);
  const switchId = useId();

  // Estados derivados
  const isDashboard = context === 'dashboard';
  const isActive = 'flags' in program ? program.flags.isActive : true;
  const isPublished = program.flags.isPublished;

  // ===============================================
  // HANDLERS DE AÇÕES
  // ===============================================

  const handleActiveToggle = async (newActiveState: boolean) => {
    if (isUpdating || !actions?.onToggleActive) return;

    setIsUpdating(true);
    try {
      await unifiedProgramsService.toggleProgramActive(program.id, newActiveState);
      actions.onToggleActive(program.id, newActiveState);
    } catch (error) {
      console.error('Erro ao alterar status ativo:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    actions?.onLike?.(program.id);
  };

  // ===============================================
  // DADOS FORMATADOS
  // ===============================================

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: program.pricing.currency
  }).format(program.pricing.basePrice);

  const formattedDuration = `${program.details.duration} ${
    program.details.durationType === 'weeks' ? 'semanas' : 'meses'
  }`;

  const formattedStudents = `${program.stats.enrollments} alunos`;

  // ===============================================
  // CLASSES CSS DINÂMICAS
  // ===============================================

  const cardClasses = `
    w-full bg-white rounded-3xl border-0 shadow-xl overflow-hidden 
    hover:shadow-2xl transition-all duration-300 group
    ${!isActive ? 'grayscale opacity-80' : ''}
    ${variant === 'compact' ? 'max-w-sm' : ''}
    ${variant === 'featured' ? 'lg:col-span-2' : ''}
    ${className}
  `.trim();

  const contentClasses = `
    p-0 transition-all duration-300
    ${!isActive ? 'grayscale opacity-80' : ''}
  `.trim();

  // ===============================================
  // RENDERIZAÇÃO CONDICIONAL POR VARIANTE
  // ===============================================

  return (
    <Card className={cardClasses}>
      <CardContent className={contentClasses}>
        
        {/* SEÇÃO DE IMAGEM */}
        <div className="relative h-40 sm:h-48 bg-gray-100">
          <div className="h-full">
            <div className="relative rounded-xl overflow-hidden bg-gray-200 h-full">
              <ImageWithFallback
                src={program.media.coverImage || "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400"}
                alt={program.content.title}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
            </div>
          </div>
          
          {/* CONTROLES SUPERIORES */}
          {(showActions || showToggle) && (
            <div className="absolute top-3 right-3 flex items-center gap-2">
              
              {/* Switch Ativo/Inativo Elegante (Dashboard) */}
              {showToggle && isDashboard && 'flags' in program && (
                <div className="group relative">
                  {/* Container do Switch Premium */}
                  <div className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer
                    ${isActive 
                      ? 'bg-emerald-50/95 border-emerald-200/60 shadow-lg shadow-emerald-500/10' 
                      : 'bg-gray-100/95 border-gray-200/60 shadow-lg shadow-gray-500/10'
                    }
                    ${isUpdating ? 'opacity-60 cursor-not-allowed scale-95' : 'hover:scale-105 hover:shadow-xl'}
                  `}>
                    
                    {/* Switch Customizado */}
                    <div 
                      className={`
                        relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out cursor-pointer
                        ${isActive ? 'bg-emerald-500 shadow-inner' : 'bg-gray-300 shadow-inner'}
                        ${isUpdating ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUpdating) handleActiveToggle(!isActive);
                      }}
                    >
                      {/* Thumb do Switch */}
                      <div 
                        className={`
                          absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out
                          flex items-center justify-center
                          ${isActive ? 'left-5 shadow-emerald-200' : 'left-0.5 shadow-gray-300'}
                          ${isUpdating ? 'animate-pulse' : ''}
                        `}
                      >
                        {/* Indicador Visual */}
                        <div className={`
                          w-2 h-2 rounded-full transition-all duration-200
                          ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}
                        `} />
                      </div>
                    </div>

                    {/* Label Premium */}
                    <div className="flex flex-col">
                      <span className={`
                        text-xs font-semibold transition-colors duration-200
                        ${isActive ? 'text-emerald-700' : 'text-gray-600'}
                      `}>
                        {isActive ? 'ATIVO' : 'INATIVO'}
                      </span>
                      <span className={`
                        text-[10px] uppercase tracking-wide transition-colors duration-200
                        ${isActive ? 'text-emerald-500' : 'text-gray-400'}
                      `}>
                        {isUpdating ? 'Salvando...' : 'Programa'}
                      </span>
                    </div>

                    {/* Loading Spinner */}
                    {isUpdating && (
                      <div className="absolute -right-1 -top-1">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Tooltip de Estado */}
                  <div className={`
                    absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100
                    transition-opacity duration-200 pointer-events-none z-50
                  `}>
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                      {isActive ? 'Programa visível para clientes' : 'Programa oculto dos clientes'}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Menu de Ações (Dashboard) */}
              {showActions && isDashboard && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 hover:bg-white transition-all duration-200"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-700" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => actions?.onView?.(program.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => actions?.onEdit?.(program.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => actions?.onDuplicate?.(program.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => actions?.onDelete?.(program.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Badges superior esquerdo */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Badge de modalidade */}
            <div className="px-2 py-1 bg-black/80 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-xs font-medium">
                {program.details.modality}
              </span>
            </div>
            
            {/* Badge de esporte principal */}
            {program.details.primarySport && (
              <div className="px-2 py-1 bg-brand/90 rounded-full flex items-center gap-1 backdrop-blur-sm">
                {program.details.primarySport.icon_url ? (
                  <img 
                    src={program.details.primarySport.icon_url} 
                    alt={program.details.primarySport.name}
                    className="w-3 h-3 object-contain"
                  />
                ) : (
                  <Trophy className="w-3 h-3 text-white" />
                )}
                <span className="text-white text-xs font-medium">
                  {program.details.primarySport.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SEÇÃO DE CONTEÚDO */}
        <div className="px-4 sm:px-6 sm:pb-6 -mt-10 relative pt-[0px] pr-[21px] pb-[21px] pl-[0px]">
          
          {/* SEÇÃO DO TRAINER - 🎯 ATUALIZADA: NOMES & AVATARES */}
          {showTrainer && (
            <div 
              className="flex items-start gap-2 mb-4 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // Evitar conflito com outros cliques do card
                if (program.trainer.slug) {
                  console.log('🎯 Ver perfil clicado para trainer:', program.trainer.slug);
                  navigation.navigateToTrainer(program.trainer.slug);
                } else {
                  console.warn('⚠️ Trainer sem slug disponível, usando ID:', program.trainer.name, program.trainer.id);
                  // Se não tiver slug, vamos desabilitar a navegação por enquanto
                }
              }}
            >
              <div className="relative">
                <Avatar className="w-14 h-14 sm:w-16 sm:h-16 ring-4 ring-white shadow-lg">
                  <AvatarImage 
                    src={program.trainer.avatar || undefined} 
                    alt={program.trainer.name} 
                    onError={(e) => {
                      console.log('🖼️ [NOMES&AVATARES] Avatar falhou ao carregar:', program.trainer.avatar);
                      console.log('🔄 Usando fallback com iniciais:', program.trainer.initials);
                    }} 
                  />
                  <AvatarFallback className="bg-gray-900 text-white text-lg sm:text-xl font-semibold">
                    {program.trainer.initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 pt-1">
                <div className="text-base sm:text-lg font-semibold text-white mt-2">
                  {program.trainer.name}
                </div>
                <div className="text-sm text-gray-600">
                  {program.trainer.location?.city || 
                   (program.trainer.specialties && Array.isArray(program.trainer.specialties) && program.trainer.specialties.length > 0 
                     ? program.trainer.specialties[0] 
                     : 'Personal Trainer')}
                </div>
              </div>
            </div>
          )}

          {/* INFORMAÇÕES DO PROGRAMA */}
          <div className="text-left space-y-2">
            
            {/* Título */}
            <div className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {program.content.title}
            </div>

            {/* Descrição */}
            <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {program.content.shortDescription}
            </div>

            {/* Categoria e Nível */}
            <div className="text-sm text-gray-600 m-0 p-0">
              <div className="flex items-center">
                <Dumbbell className="w-4 h-4 mr-1 text-red-600" />
                <span>{program.details.category} • {program.details.level}</span>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 py-3">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{formattedDuration}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{formattedStudents}</span>
                <span className="sm:hidden">{program.stats.enrollments}</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                <span className="font-medium text-gray-900">{program.stats.rating}</span>
                <span className="text-gray-500 ml-1">({program.stats.reviewCount})</span>
              </div>
            </div>

            {/* Preço */}
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 pt-1">
              {program.pricing.basePrice > 0 ? formattedPrice : 'Gratuito'}
            </div>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex gap-3 mt-4 sm:mt-6">
            
            {/* Botão Principal */}
            <Button
              onClick={() => {
                // Validar se o ID é válido antes de navegar
                const isValidId = (id: string): boolean => {
                  if (!id || typeof id !== 'string') return false;
                  
                  // Rejeitar IDs que contêm palavras mock ou emergency
                  if (id.includes('mock') || id.includes('emergency') || id.includes('fallback')) {
                    console.warn('⚠️ ID inválido detectado (contém mock/emergency/fallback):', id);
                    return false;
                  }
                  
                  // Aceitar UUIDs válidos ou slugs válidos
                  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
                  
                  return uuidRegex.test(id) || slugRegex.test(id);
                };

                console.log('🔥 UnifiedProgramCard clicado:', {
                  programId: program.id,
                  programTitle: program.content?.title,
                  isDashboard,
                  hasOnClick: !!onClick,
                  hasActionsNavigate: !!actions?.onNavigateToProgram,
                  navigationObject: navigation,
                  currentPath: window.location.pathname,
                  isValidId: isValidId(program.id)
                });

                // Verificar se o ID é válido antes de continuar
                if (!isValidId(program.id)) {
                  console.error('❌ Tentativa de navegação com ID inválido impedida:', program.id);
                  return;
                }

                if (isDashboard) {
                  console.log('📊 Dashboard mode - editando programa');
                  actions?.onEdit?.(program.id);
                } else {
                  // 🚨 CORREÇÃO CRÍTICA: Forçar uso do hook navigation para evitar loop infinito
                  // O actions.onNavigateToProgram estava criando loop de URLs /program-details/program-details/...
                  console.log('🎯 USANDO HOOK NAVIGATION DIRETO (correção de loop infinito)');
                  console.log('Navigation methods available:', Object.keys(navigation));
                  console.log('Tentando navegar para:', `/program/${program.id}`);
                  
                  try {
                    const targetUrl = `/program/${program.id}`;
                    console.log('🚀 Executando navigation.navigateToProgram...');
                    navigation.navigateToProgram(program.id);
                    console.log('✅ navigation.navigateToProgram executado');
                    
                    // Debug adicional - verificar se a URL mudou
                    setTimeout(() => {
                      console.log('🔍 URL após navegação:', window.location.pathname);
                      console.log('🔍 Era esperado:', targetUrl);
                    }, 100);
                    
                  } catch (error) {
                    console.error('❌ Erro ao executar navigation.navigateToProgram:', error);
                    console.log('🔄 Tentando navegação manual como fallback...');
                    try {
                      window.location.href = `/program/${program.id}`;
                    } catch (manualError) {
                      console.error('❌ Erro na navegação manual:', manualError);
                    }
                  }
                }
              }}
              className={`flex-1 h-10 rounded-xl text-base font-medium transition-all duration-200 ${
                isEnrolled
                  ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
                  : "bg-[#e0093e] text-white hover:bg-[#c40835] border-0"
              }`}
            >
              {isDashboard ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </>
              ) : (
                <>
                  {!isEnrolled && <Play className="w-4 h-4 mr-2" />}
                  {isEnrolled ? 'Matriculado' : 'Ver Programa'}
                </>
              )}
            </Button>
            
            {/* Botão Like (apenas público) */}
            {!isDashboard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeToggle}
                className={`h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-full border transition-all duration-200 ${
                  isLiked 
                    ? 'border-gray-300 bg-gray-100 hover:bg-gray-200' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                  isLiked ? 'text-red-500 fill-current' : 'text-gray-400'
                }`} />
              </Button>
            )}
          </div>

          {/* BOTÃO SECUNDÁRIO (Dashboard) */}
          {isDashboard && (
            <Button
              variant="outline"
              onClick={() => {
                // Validar ID antes de executar ação
                const isValidId = (id: string): boolean => {
                  if (!id || typeof id !== 'string') return false;
                  if (id.includes('mock') || id.includes('emergency') || id.includes('fallback')) return false;
                  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
                  return uuidRegex.test(id) || slugRegex.test(id);
                };

                if (!isValidId(program.id)) {
                  console.error('❌ Tentativa de visualização com ID inválido impedida:', program.id);
                  return;
                }

                if (actions?.onView) {
                  actions.onView(program.id);
                } else {
                  // Fallback para navegação
                  navigation.navigateToProgram(program.id);
                }
              }}
              className="w-full h-10 sm:h-12 rounded-full text-sm sm:text-base font-medium border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-200 mt-3"
            >
              <Eye className="w-4 h-4 mr-2 text-gray-500" />
              Visualizar programa
            </Button>
          )}

          {/* BOTÃO DE MENSAGEM (Público apenas) */}
          {!isDashboard && (
            <Button
              variant="outline"
              onClick={() => {
                if (program.trainer.slug) {
                  actions?.onNavigateToTrainer?.(program.trainer.slug);
                } else {
                  console.warn('⚠️ Não é possível navegar para trainer sem slug:', program.trainer.name);
                }
              }}
              className="w-full h-9 rounded-full text-sm font-medium border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-200 mt-3"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-gray-600" />
              Mensagem
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ===============================================
// COMPONENTES ESPECIALIZADOS
// ===============================================

/**
 * Card compacto para carousels
 */
export function CompactProgramCard(props: Omit<UnifiedProgramCardProps, 'variant'>) {
  return <UnifiedProgramCard {...props} variant="compact" />;
}

/**
 * Card para dashboard de trainer
 */
export function DashboardProgramCard(props: Omit<UnifiedProgramCardProps, 'variant' | 'context'>) {
  return <UnifiedProgramCard 
    {...props} 
    variant="dashboard" 
    context="dashboard"
    showActions={true}
    showToggle={true}
  />;
}

/**
 * Card destacado/hero
 */
export function FeaturedProgramCard(props: Omit<UnifiedProgramCardProps, 'variant'>) {
  return <UnifiedProgramCard {...props} variant="featured" />;
}

/**
 * Card formato lista
 */
export function ListProgramCard(props: Omit<UnifiedProgramCardProps, 'variant'>) {
  return <UnifiedProgramCard {...props} variant="list" />;
}

// ===============================================
// EXPORTS
// ===============================================

export default UnifiedProgramCard;