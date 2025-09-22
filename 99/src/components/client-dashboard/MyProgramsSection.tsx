import { useState } from 'react';
import { 
  BookOpen, 
  Play, 
  CheckCircle,
  Download,
  MessageCircle,
  Star,
  ExternalLink,
  MoreVertical,
  AlertCircle,
  Monitor,
  FileText,
  Smartphone,
  User
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { useClientPurchasedPrograms } from '../../hooks/useClientPurchasedPrograms';

type ProgramStatus = 'all' | 'active' | 'completed' | 'expired';

interface MyProgramsSectionProps {
  onNavigateToProgramDetails?: (programId: string) => void;
}

export function MyProgramsSection({ onNavigateToProgramDetails }: MyProgramsSectionProps) {
  // ✅ USAR EXCLUSIVAMENTE DADOS DO SUPABASE - NUNCA MOCK DATA
  const { programs, loading, error } = useClientPurchasedPrograms();
  const [statusFilter, setStatusFilter] = useState<ProgramStatus>('all');

  const filteredPrograms = programs.filter(program => 
    statusFilter === 'all' || program.status === statusFilter
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          label: 'Ativo',
          icon: Play
        };
      case 'completed':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          label: 'Concluído',
          icon: CheckCircle
        };
      case 'expired':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          label: 'Expirado',
          icon: AlertCircle
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          label: 'Indefinido',
          icon: BookOpen
        };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'course':
        return {
          icon: Monitor,
          label: 'Curso Online',
          color: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'ebook':
        return {
          icon: FileText,
          label: 'eBook',
          color: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 'subscription':
        return {
          icon: Smartphone,
          label: 'Consultoria',
          color: 'bg-orange-50 text-orange-700 border-orange-200'
        };
      default:
        return {
          icon: BookOpen,
          label: 'Programa',
          color: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Meus Programas</h1>
          <p className="text-gray-600 mt-1">
            {programs.length} programa{programs.length !== 1 ? 's' : ''} comprado{programs.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Button variant="brand" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          Explorar Mais
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(value: ProgramStatus) => setStatusFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os programas</SelectItem>
            <SelectItem value="active">Ativos ({programs.filter(p => p.status === 'active').length})</SelectItem>
            <SelectItem value="completed">Concluídos ({programs.filter(p => p.status === 'completed').length})</SelectItem>
            <SelectItem value="expired">Expirados ({programs.filter(p => p.status === 'expired').length})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      ) : filteredPrograms.length === 0 ? (
        <Alert>
          <BookOpen className="h-4 w-4" />
          <AlertDescription>
            {statusFilter === 'all' 
              ? 'Você ainda não possui nenhum programa. Explore nosso catálogo para encontrar programas incríveis!' 
              : `Nenhum programa ${statusFilter === 'active' ? 'ativo' : statusFilter} encontrado.`
            }
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPrograms.map((program) => {
            const statusConfig = getStatusConfig(program.status);
            const typeConfig = getTypeConfig(program.type);
            
            return (
              <div key={program.id} className="relative group">
                <Card 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full cursor-pointer"
                  onClick={() => {
                    if (program.type === 'subscription') {
                      // Para consultorias, abrir WhatsApp diretamente
                      const phoneNumber = '+5511999999999';
                      const message = `Olá ${program.trainer.name}! Estou entrando em contato sobre o programa "${program.title}".`;
                      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    } else {
                      // Para outros tipos, navegar para detalhes
                      onNavigateToProgramDetails?.(program.id);
                    }
                  }}
                >
                  {/* Header com imagem */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={program.image} 
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="outline" className={`${statusConfig.color} border text-xs backdrop-blur-sm`}>
                        <statusConfig.icon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className={`${typeConfig.color} border text-xs backdrop-blur-sm`}>
                        <typeConfig.icon className="h-3 w-3 mr-1" />
                        {typeConfig.label}
                      </Badge>
                    </div>

                    {/* Messages indicator */}
                    {program.unreadMessages > 0 && (
                      <div className="absolute bottom-3 right-3 h-6 w-6 bg-[var(--brand)] text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                        {program.unreadMessages}
                      </div>
                    )}

                    {/* Progress indicator for active programs */}
                    {program.status === 'active' && (
                      <div className="absolute bottom-3 left-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium shadow-sm">
                          {program.progress}% completo
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-4 flex flex-col h-[calc(100%-12rem)]">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 flex-shrink-0">
                      {program.title}
                    </h3>

                    {/* Trainer Info */}
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={program.trainer.avatar} />
                        <AvatarFallback>{program.trainer.initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{program.trainer.name}</span>
                    </div>

                    {/* Program Type Specific Info */}
                    <div className="text-xs text-gray-500 mb-3 flex-shrink-0">
                      {program.type === 'course' && (
                        <div className="flex items-center gap-1">
                          <Monitor className="h-3 w-3" />
                          <span>{program.videosCompleted}/{program.totalVideos} vídeos assistidos</span>
                        </div>
                      )}
                      {program.type === 'ebook' && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{program.deliverables.format} • {program.deliverables.pages} páginas</span>
                        </div>
                      )}
                      {program.type === 'subscription' && (
                        <div className="flex items-center gap-1">
                          <Smartphone className="h-3 w-3" />
                          <span>{program.messagesExchanged} mensagens • Último: {program.lastResponse}</span>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3 flex-shrink-0">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span className="text-sm font-medium">{program.rating}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between text-sm mb-4 flex-shrink-0">
                      <span className="font-semibold text-[var(--brand)]">{program.price}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto space-y-2">
                      {program.type === 'course' && (
                        <Button 
                          className="w-full" 
                          variant={program.status === 'active' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToProgramDetails?.(program.id);
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {program.status === 'active' ? 'Continuar Curso' : 'Acessar Curso'}
                        </Button>
                      )}
                      {program.type === 'ebook' && (
                        <Button 
                          className="w-full" 
                          variant="default" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToProgramDetails?.(program.id);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar eBook
                        </Button>
                      )}
                      {program.type === 'subscription' && (
                        <Button 
                          className="w-full" 
                          variant="default" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const phoneNumber = '+5511999999999';
                            const message = `Olá ${program.trainer.name}! Estou entrando em contato sobre o programa "${program.title}".`;
                            const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                            window.open(whatsappUrl, '_blank');
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Abrir WhatsApp
                        </Button>
                      )}

                      {/* Secondary Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Treinador
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="px-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {program.type === 'course' && (
                              <>
                                <DropdownMenuItem>
                                  <Play className="h-4 w-4 mr-2" />
                                  Ambiente de Aulas
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar Materiais
                                </DropdownMenuItem>
                              </>
                            )}
                            {program.type === 'ebook' && (
                              <>
                                <DropdownMenuItem>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Visualizar Online
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                              </>
                            )}
                            {program.type === 'subscription' && (
                              <DropdownMenuItem>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Histórico de Conversas
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Star className="h-4 w-4 mr-2" />
                              Avaliar Programa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Overlays */}
                {program.status === 'completed' && program.userRating && (
                  <div className="absolute bottom-4 left-4 right-4 bg-green-600/90 backdrop-blur-sm text-white rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Concluído</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs">{program.userRating}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}