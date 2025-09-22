import { useState } from 'react';
import { 
  Star, 
  MessageCircle, 
  ThumbsUp, 
  Filter, 
  Search, 
  ChevronDown,
  Reply,
  MoreVertical,
  TrendingUp,
  Users,
  Calendar,
  Award,
  FileText,
  Heart,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface Review {
  id: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  comment: string;
  date: string;
  type: 'profile' | 'program';
  programName?: string;
  programType?: string;
  isVerified: boolean;
  helpful: number;
  trainerReply?: {
    message: string;
    date: string;
  };
  category: string;
}

type FilterType = 'all' | 'profile' | 'program';
type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1';
type SortType = 'recent' | 'oldest' | 'highest' | 'lowest';

const mockReviews: Review[] = [
  {
    id: '1',
    studentName: 'Maria Silva',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612ff3f?w=400&q=80',
    rating: 5,
    comment: 'Excelente treinador! Muito dedicado e atencioso. Os treinos são desafiadores mas muito bem estruturados. Recomendo demais!',
    date: '2024-01-15',
    type: 'profile',
    isVerified: true,
    helpful: 12,
    category: 'Musculação'
  },
  {
    id: '2',
    studentName: 'Carlos Santos',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    rating: 5,
    comment: 'O programa de transformação corporal mudou minha vida! Perdi 15kg em 3 meses e ganhei muito músculo. João é um profissional excepcional.',
    date: '2024-01-10',
    type: 'program',
    programName: 'Transformação Corporal Completa',
    programType: 'Musculação',
    isVerified: true,
    helpful: 8,
    trainerReply: {
      message: 'Muito obrigado Carlos! Foi um prazer acompanhar sua evolução. Continue assim!',
      date: '2024-01-11'
    },
    category: 'Musculação'
  },
  {
    id: '3',
    studentName: 'Ana Costa',
    studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    rating: 4,
    comment: 'Muito bom profissional, mas poderia responder um pouco mais rápido às mensagens. Fora isso, treinos excelentes!',
    date: '2024-01-08',
    type: 'profile',
    isVerified: true,
    helpful: 5,
    category: 'Funcional'
  },
  {
    id: '4',
    studentName: 'Pedro Oliveira',
    studentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    rating: 5,
    comment: 'Programa de corrida fantástico! Consegui terminar minha primeira meia maratona graças ao João. Metodologia impecável.',
    date: '2024-01-05',
    type: 'program',
    programName: 'Corrida para Iniciantes',
    programType: 'Corrida',
    isVerified: true,
    helpful: 15,
    category: 'Corrida'
  },
  {
    id: '5',
    studentName: 'Juliana Ferreira',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    rating: 4,
    comment: 'Ótimo acompanhamento nutricional junto com os treinos. Resultados visíveis em pouco tempo. Só achei o preço um pouco alto.',
    date: '2024-01-03',
    type: 'profile',
    isVerified: true,
    helpful: 7,
    category: 'Musculação'
  },
  {
    id: '6',
    studentName: 'Rafael Lima',
    studentAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f5d?w=400&q=80',
    rating: 3,
    comment: 'Treinos bons, mas esperava um acompanhamento mais próximo. Às vezes demora para responder dúvidas.',
    date: '2023-12-28',
    type: 'program',
    programName: 'Hipertrofia Avançada',
    programType: 'Musculação',
    isVerified: false,
    helpful: 3,
    category: 'Musculação'
  }
];

export function ReviewsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [sortType, setSortType] = useState<SortType>('recent');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Filter and sort reviews
  const filteredReviews = mockReviews
    .filter(review => {
      if (filterType !== 'all' && review.type !== filterType) return false;
      if (ratingFilter !== 'all' && review.rating.toString() !== ratingFilter) return false;
      if (searchTerm && !review.comment.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !review.studentName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortType) {
        case 'recent':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  // Statistics
  const totalReviews = mockReviews.length;
  const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  const profileReviews = mockReviews.filter(r => r.type === 'profile').length;
  const programReviews = mockReviews.filter(r => r.type === 'program').length;
  const pendingReplies = mockReviews.filter(r => !r.trainerReply).length;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: mockReviews.filter(r => r.rating === rating).length,
    percentage: (mockReviews.filter(r => r.rating === rating).length / totalReviews) * 100
  }));

  const handleReply = (reviewId: string) => {
    // Simulate sending reply
    setReplyingTo(null);
    setReplyText('');
    // Here you would update the review with the reply
  };

  const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full min-h-screen space-y-8">
      {/* Header Section */}
      <div className="space-y-2 px-4 lg:px-6">
        <h1 className="text-2xl font-semibold mt-[20px] mr-[0px] mb-[7px] ml-[0px]">Avaliações</h1>
        <p className="text-muted-foreground">
          Gerencie e responda às avaliações do seu perfil e programas
        </p>
      </div>

      {/* Content */}
      <div className="w-full px-4 lg:px-6 space-y-6">

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avaliação Média</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-semibold">{averageRating.toFixed(1)}</span>
                  <StarRating rating={Math.round(averageRating)} size="md" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{totalReviews} avaliações</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Avaliações</p>
                <p className="text-2xl font-semibold mt-1">{totalReviews}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600">+12%</span> vs mês anterior
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Perfil vs Programas</p>
                <p className="text-2xl font-semibold mt-1">{profileReviews}/{programReviews}</p>
                <p className="text-xs text-muted-foreground mt-1">Perfil / Programas</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes Resposta</p>
                <p className="text-2xl font-semibold mt-1">{pendingReplies}</p>
                <p className="text-xs text-muted-foreground mt-1">Aguardando sua resposta</p>
              </div>
              <div className="p-3 rounded-full bg-[#e0093e]/10">
                <Reply className="h-6 w-6 text-[#e0093e]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Distribuição de Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-8">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#e0093e] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Reviews */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Todas as Avaliações</CardTitle>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar avaliações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="profile">Perfil</SelectItem>
                    <SelectItem value="program">Programas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ratingFilter} onValueChange={(value: RatingFilter) => setRatingFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas ⭐</SelectItem>
                    <SelectItem value="5">5 estrelas</SelectItem>
                    <SelectItem value="4">4 estrelas</SelectItem>
                    <SelectItem value="3">3 estrelas</SelectItem>
                    <SelectItem value="2">2 estrelas</SelectItem>
                    <SelectItem value="1">1 estrela</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortType} onValueChange={(value: SortType) => setSortType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recente</SelectItem>
                    <SelectItem value="oldest">Mais antiga</SelectItem>
                    <SelectItem value="highest">Maior nota</SelectItem>
                    <SelectItem value="lowest">Menor nota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className="w-full bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                    <CardContent className="p-6">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={review.studentAvatar} alt={review.studentName} />
                              <AvatarFallback className="bg-gray-200 text-gray-700">
                                {review.studentName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {review.isVerified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          {/* Student Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{review.studentName}</h4>
                              {review.isVerified && (
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                  Verificado
                                </Badge>
                              )}
                              <Badge 
                                variant="secondary" 
                                className="text-xs bg-gray-100 text-gray-600"
                              >
                                {review.type === 'profile' ? 'Perfil' : 'Programa'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-sm text-gray-600">{review.rating}.0</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Marcar como útil</DropdownMenuItem>
                            <DropdownMenuItem>Reportar</DropdownMenuItem>
                            <DropdownMenuItem>Ocultar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Program Info */}
                      {review.type === 'program' && review.programName && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span>Programa: <strong className="text-gray-900">{review.programName}</strong></span>
                          </div>
                        </div>
                      )}

                      {/* Review Content */}
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>

                      {/* Review Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {review.helpful} útil
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                            <Heart className="h-4 w-4 mr-2" />
                            Curtir
                          </Button>
                        </div>
                        
                        {!review.trainerReply && (
                          <Button
                            onClick={() => setReplyingTo(review.id)}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <Reply className="h-4 w-4 mr-2" />
                            Responder
                          </Button>
                        )}
                      </div>

                      {/* Trainer Reply */}
                      {review.trainerReply && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" alt="João Silva" />
                              <AvatarFallback className="bg-gray-300 text-gray-700">JS</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-sm font-medium text-gray-900">João Silva</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-600">
                                  Treinador
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(review.trainerReply.date).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.trainerReply.message}</p>
                        </div>
                      )}

                      {/* Reply Form */}
                      {replyingTo === review.id && (
                        <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <Textarea
                            placeholder="Escreva sua resposta personalizada..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-24 resize-none bg-white border-gray-200 focus:border-gray-400"
                          />
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => handleReply(review.id)}
                              disabled={!replyText.trim()}
                              variant="default"
                              size="sm"
                              className="bg-gray-900 hover:bg-gray-800 text-white"
                            >
                              <Reply className="h-4 w-4 mr-2" />
                              Enviar Resposta
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {filteredReviews.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      Nenhuma avaliação encontrada
                    </h3>
                    <p className="text-gray-500">
                      Tente ajustar os filtros para ver mais avaliações.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nova avaliação 5 estrelas</p>
                <p className="text-xs text-muted-foreground">Maria Silva avaliou seu perfil - há 2 horas</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">5⭐</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Avaliação respondida</p>
                <p className="text-xs text-muted-foreground">Você respondeu Carlos Santos - há 1 dia</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Resposta</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Avaliação do programa marcada como útil</p>
                <p className="text-xs text-muted-foreground">15 pessoas acharam útil a avaliação do Pedro - há 2 dias</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Útil</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}