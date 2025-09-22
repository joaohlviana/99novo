import { useState } from 'react';
import { 
  Bell, 
  Star, 
  Heart,
  Play, 
  MessageCircle, 
  Clock,
  Award,
  Users,
  Calendar,
  ExternalLink,
  Video,
  BookOpen,
  Image,
  TrendingUp,
  Filter,
  MoreVertical
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';

// Mock data for trainer news/updates
const mockTrainerNews = [
  {
    id: '1',
    trainer: {
      id: '1',
      name: 'João Silva',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      specialty: 'Personal Trainer',
      isFollowing: true
    },
    type: 'new_program',
    title: 'Novo Programa Lançado!',
    content: 'Acaba de lançar "Hipertrofia Avançada 2.0" - um programa revolucionário para ganho de massa muscular.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    timestamp: '2024-02-01T10:30:00Z',
    likes: 42,
    comments: 8,
    isLiked: false,
    programId: 'new-program-1'
  },
  {
    id: '2',
    trainer: {
      id: '2',
      name: 'Maria Santos',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c647?w=400&q=80',
      specialty: 'Yoga & Pilates',
      isFollowing: true
    },
    type: 'achievement',
    title: 'Marco de 500 Alunos! 🎉',
    content: 'Muito feliz em compartilhar que acabei de atingir a marca de 500 alunos transformados! Obrigada a cada um de vocês.',
    timestamp: '2024-01-31T16:45:00Z',
    likes: 89,
    comments: 24,
    isLiked: true,
    achievement: {
      type: 'students_milestone',
      count: 500
    }
  },
  {
    id: '3',
    trainer: {
      id: '3',
      name: 'Carlos Lima',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      specialty: 'Crossfit Expert',
      isFollowing: true
    },
    type: 'video',
    title: 'Nova Técnica de Agachamento',
    content: 'Gravei um vídeo especial mostrando a técnica perfeita para o agachamento búlgaro. Confira!',
    videoThumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    timestamp: '2024-01-31T08:20:00Z',
    likes: 36,
    comments: 12,
    isLiked: false,
    duration: '8:45'
  },
  {
    id: '4',
    trainer: {
      id: '4',
      name: 'Ana Costa',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      specialty: 'Nutrição Esportiva',
      isFollowing: true
    },
    type: 'tip',
    title: 'Dica de Nutrição Pré-Treino',
    content: 'O que comer antes do treino pode fazer toda a diferença no seu desempenho. Aqui estão as minhas 3 dicas principais...',
    timestamp: '2024-01-30T12:15:00Z',
    likes: 67,
    comments: 19,
    isLiked: true
  },
  {
    id: '5',
    trainer: {
      id: '1',
      name: 'João Silva',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      specialty: 'Personal Trainer',
      isFollowing: true
    },
    type: 'client_transformation',
    title: 'Transformação Incrível do Cliente',
    content: 'Orgulhoso de compartilhar a transformação de 6 meses do meu aluno Pedro. Resultados assim que me motivam todos os dias!',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
    timestamp: '2024-01-30T09:30:00Z',
    likes: 128,
    comments: 31,
    isLiked: false,
    clientName: 'Pedro M.'
  },
  {
    id: '6',
    trainer: {
      id: '5',
      name: 'Ricardo Mendes',
      avatar: 'https://images.unsplash.com/photo-1658279445014-dcc466ac1192?w=400&q=80',
      specialty: 'Yoga & Meditação',
      isFollowing: true
    },
    type: 'live_session',
    title: 'Aula Ao Vivo Hoje às 19h',
    content: 'Não percam a aula especial de yoga para iniciantes hoje às 19h. Tema: "Respiração e Presença".',
    timestamp: '2024-01-29T14:00:00Z',
    likes: 23,
    comments: 7,
    isLiked: false,
    liveSession: {
      scheduledTime: '2024-01-29T19:00:00Z',
      duration: 60,
      topic: 'Respiração e Presença'
    }
  }
];

type NewsFilter = 'all' | 'new_program' | 'achievement' | 'video' | 'tip' | 'client_transformation' | 'live_session';

export function NewsSection() {
  const [news, setNews] = useState(mockTrainerNews);
  const [filter, setFilter] = useState<NewsFilter>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredNews = news.filter(item => 
    (filter === 'all' || item.type === filter)
  );

  const getNewsIcon = (type: string) => {
    switch (type) {
      case 'new_program':
        return BookOpen;
      case 'achievement':
        return Award;
      case 'video':
        return Video;
      case 'tip':
        return Star;
      case 'client_transformation':
        return TrendingUp;
      case 'live_session':
        return Calendar;
      default:
        return Bell;
    }
  };

  const getNewsTypeLabel = (type: string) => {
    switch (type) {
      case 'new_program':
        return 'Novo Programa';
      case 'achievement':
        return 'Conquista';
      case 'video':
        return 'Novo Vídeo';
      case 'tip':
        return 'Dica';
      case 'client_transformation':
        return 'Transformação';
      case 'live_session':
        return 'Aula Ao Vivo';
      default:
        return 'Novidade';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}sem atrás`;
  };

  const handleLike = (newsId: string) => {
    setNews(prevNews => prevNews.map(item => 
      item.id === newsId 
        ? { 
            ...item, 
            isLiked: !item.isLiked,
            likes: item.isLiked ? item.likes - 1 : item.likes + 1
          }
        : item
    ));
  };

  const statsData = {
    totalNews: news.length,
    unreadNews: news.filter(item => !item.isLiked).length, // Simulando lidas/não lidas
    followingCount: [...new Set(news.map(item => item.trainer.id))].length
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-[var(--brand)]" />
            Novidades
          </h1>
          <p className="text-gray-600 mt-1">
            Acompanhe as últimas atualizações dos treinadores que você segue
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button 
            variant={showUnreadOnly ? "brand" : "outline"} 
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Não lidas
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{statsData.totalNews}</div>
            <div className="text-sm text-gray-500">Total de Novidades</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[var(--brand)]">{statsData.unreadNews}</div>
            <div className="text-sm text-gray-500">Não Lidas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{statsData.followingCount}</div>
            <div className="text-sm text-gray-500">Treinadores Seguindo</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={(value: NewsFilter) => setFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as novidades</SelectItem>
            <SelectItem value="new_program">Novos programas</SelectItem>
            <SelectItem value="achievement">Conquistas</SelectItem>
            <SelectItem value="video">Vídeos</SelectItem>
            <SelectItem value="tip">Dicas</SelectItem>
            <SelectItem value="client_transformation">Transformações</SelectItem>
            <SelectItem value="live_session">Aulas ao vivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* News Feed */}
      {filteredNews.length === 0 ? (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            Nenhuma novidade encontrada. Siga mais treinadores para ver atualizações aqui!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {filteredNews.map((newsItem) => {
            const NewsIcon = getNewsIcon(newsItem.type);
            
            return (
              <Card key={newsItem.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={newsItem.trainer.avatar} alt={newsItem.trainer.name} />
                      <AvatarFallback>
                        {newsItem.trainer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{newsItem.trainer.name}</h3>
                          <p className="text-sm text-gray-500">{newsItem.trainer.specialty}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <NewsIcon className="h-3 w-3" />
                            {getNewsTypeLabel(newsItem.type)}
                          </Badge>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver Perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Enviar Mensagem
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(newsItem.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{newsItem.title}</h4>
                      <p className="text-gray-700">{newsItem.content}</p>
                    </div>

                    {/* Media Content */}
                    {newsItem.image && (
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src={newsItem.image} 
                          alt="Post content" 
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}

                    {newsItem.videoThumbnail && (
                      <div className="relative rounded-lg overflow-hidden">
                        <img 
                          src={newsItem.videoThumbnail} 
                          alt="Video thumbnail" 
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-4">
                            <Play className="h-8 w-8 text-gray-900" />
                          </div>
                        </div>
                        {newsItem.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                            {newsItem.duration}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Special Content Types */}
                    {newsItem.achievement && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium text-yellow-800">
                            {newsItem.achievement.count} alunos transformados!
                          </span>
                        </div>
                      </div>
                    )}

                    {newsItem.liveSession && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-red-800">
                              Aula ao vivo • {newsItem.liveSession.topic}
                            </span>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                            Participar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => handleLike(newsItem.id)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--brand)] transition-colors"
                      >
                        <Heart className={`h-4 w-4 ${newsItem.isLiked ? 'fill-current text-[var(--brand)]' : ''}`} />
                        <span>{newsItem.likes}</span>
                      </button>
                      
                      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>{newsItem.comments}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {newsItem.programId && (
                        <Button variant="brand" size="sm">
                          Ver Programa
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Comentar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}