import { useState } from 'react';
import { 
  Heart, 
  Star, 
  MapPin, 
  MessageCircle, 
  MoreVertical,
  Filter,
  Search,
  Grid,
  List,
  ExternalLink,
  UserMinus,
  Calendar,
  Award,
  TrendingUp,
  UserCheck,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { ModernProfileCard } from '../ModernProfileCard';
import Slider from 'react-slick';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useClientFavoriteTrainers } from '../../hooks/useClientFavoriteTrainers';

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'match' | 'rating' | 'active';

type TrainerTab = 'favorites' | 'following';

export function FavoriteTrainersSection() {
  // ✅ USAR EXCLUSIVAMENTE DADOS DO SUPABASE - NUNCA MOCK DATA
  const { 
    favoriteTrainers, 
    followingTrainers, 
    loading, 
    error,
    addToFavorites,
    removeFromFavorites,
    followTrainer,
    unfollowTrainer
  } = useClientFavoriteTrainers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TrainerTab>('favorites');

  // Filter trainers based on active tab
  const currentTrainers = activeTab === 'favorites' ? favoriteTrainers : followingTrainers;

  const filteredTrainers = currentTrainers
    .filter(trainer => 
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          const dateA = activeTab === 'favorites' ? a.favoriteDate : a.followDate;
          const dateB = activeTab === 'favorites' ? b.favoriteDate : b.followDate;
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        case 'match':
          return b.matchPercentage - a.matchPercentage;
        case 'rating':
          return b.rating - a.rating;
        case 'active':
          return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
        default:
          return 0;
      }
    });

  const handleRemoveFavorite = async (trainerId: string) => {
    await removeFromFavorites(trainerId);
  };

  const handleUnfollow = async (trainerId: string) => {
    await unfollowTrainer(trainerId);
  };

  const handleToggleFavorite = async (trainerId: string) => {
    const trainer = currentTrainers.find(t => t.id === trainerId);
    if (trainer?.isFavorite) {
      await removeFromFavorites(trainerId);
    } else {
      await addToFavorites(trainerId);
    }
  };

  const handleToggleFollow = async (trainerId: string) => {
    const trainer = currentTrainers.find(t => t.id === trainerId);
    if (trainer?.isFollowing) {
      await unfollowTrainer(trainerId);
    } else {
      await followTrainer(trainerId);
    }
  };

  const renderTrainerCard = (trainer: any) => (
    <div key={trainer.id} className="relative">
      {/* Status indicators */}
      {trainer.isOnline && (
        <div className="absolute top-2 right-2 z-10 h-3 w-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
      )}
      {trainer.unreadMessages > 0 && (
        <div className="absolute top-2 left-2 z-10 h-6 w-6 bg-[var(--brand)] text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
          {trainer.unreadMessages}
        </div>
      )}
      
      <ModernProfileCard
        name={trainer.name}
        location={trainer.location}
        avatar={trainer.avatar}
        portfolioImages={trainer.portfolioImages}
        tags={trainer.specialties.slice(0, 2)}
        stats={{
          followers: `${trainer.matchPercentage}%`,
          following: trainer.responseTime,
          views: trainer.priceRange
        }}
        rating={trainer.rating}
        isVerified={trainer.hasActiveProgram}
        onNavigateToTrainer={() => console.log('Navigate to trainer', trainer.id)}
      />
      
      {/* Actions Menu Overlay */}
      <div className="absolute top-2 right-8 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Perfil Completo
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar Mensagem
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Conversa
            </DropdownMenuItem>
            {activeTab === 'favorites' ? (
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleRemoveFavorite(trainer.id)}
              >
                <Heart className="h-4 w-4 mr-2" />
                Remover dos Favoritos
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleUnfollow(trainer.id)}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Deixar de Seguir
              </DropdownMenuItem>
            )}
            {activeTab === 'following' && !trainer.isFavorite && (
              <DropdownMenuItem 
                onClick={() => handleToggleFavorite(trainer.id)}
              >
                <Heart className="h-4 w-4 mr-2" />
                Adicionar aos Favoritos
              </DropdownMenuItem>
            )}
            {activeTab === 'favorites' && !trainer.isFollowing && (
              <DropdownMenuItem 
                onClick={() => handleToggleFollow(trainer.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Seguir Treinador
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderTrainerList = (trainer: any) => (
    <Card key={trainer.id} className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={trainer.avatar} alt={trainer.name} />
              <AvatarFallback>{trainer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            {trainer.isOnline && (
              <div className="absolute -bottom-0 -right-0 h-3 w-3 bg-green-500 border border-white rounded-full"></div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900">{trainer.name}</h3>
              {trainer.hasActiveProgram && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  Ativo
                </Badge>
              )}
              {trainer.unreadMessages > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {trainer.unreadMessages} nova{trainer.unreadMessages > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{trainer.specialty}</p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              {trainer.rating}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-[var(--brand)]" />
              {trainer.matchPercentage}%
            </div>
            <div>{trainer.priceRange}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="brand" size="sm">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {activeTab === 'favorites' ? (
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleRemoveFavorite(trainer.id)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Remover dos Favoritos
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleUnfollow(trainer.id)}
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Deixar de Seguir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const favoriteStats = {
    total: favoriteTrainers.length
  };

  const followingStats = {
    total: followingTrainers.length
  };

  const currentStats = activeTab === 'favorites' ? favoriteStats : followingStats;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            {activeTab === 'favorites' ? (
              <>
                <Heart className="h-6 w-6 text-[var(--brand)]" />
                Treinadores Favoritos
              </>
            ) : (
              <>
                <UserCheck className="h-6 w-6 text-[var(--brand)]" />
                Seguindo
              </>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            {currentStats.total} treinador{currentStats.total !== 1 ? 'es' : ''} 
            {activeTab === 'favorites' ? ' salvos' : ' seguindo'}
          </p>
        </div>

        {/* View Toggle - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: TrainerTab) => setActiveTab(value)} className="items-center">
        <TabsList className="h-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger 
            value="favorites" 
            className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            Favoritos ({favoriteStats.total})
          </TabsTrigger>
          <TabsTrigger 
            value="following" 
            className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Seguindo ({followingStats.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="match">Maior compatibilidade</SelectItem>
                  <SelectItem value="rating">Melhor avaliação</SelectItem>
                  <SelectItem value="active">Online primeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>



          {/* Loading State */}
          {loading ? (
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 320px))' }}>
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
          ) : filteredTrainers.length === 0 ? (
            <Alert>
              {activeTab === 'favorites' ? (
                <Heart className="h-4 w-4" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
              <AlertDescription>
                {searchTerm ? 
                  'Nenhum treinador encontrado com esses critérios.' : 
                  activeTab === 'favorites' 
                    ? 'Você ainda não adicionou nenhum treinador aos favoritos. Explore nosso catálogo para encontrar treinadores incríveis!'
                    : 'Você ainda não está seguindo nenhum treinador. Comece a seguir treinadores para acompanhar suas novidades!'
                }
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Mobile: Always Swiper */}
              <div className="block md:hidden">
                <Slider
                  {...{
                    dots: false,
                    infinite: false,
                    speed: 300,
                    slidesToShow: 1.1,
                    slidesToScroll: 1,
                    arrows: false,
                    swipeToSlide: true,
                    centerPadding: '20px'
                  }}
                >
                  {filteredTrainers.map(trainer => (
                    <div key={trainer.id} className="px-2">
                      {renderTrainerCard(trainer)}
                    </div>
                  ))}
                </Slider>
              </div>

              {/* Desktop: Grid or List */}
              <div className="hidden md:block">
                <div className={
                  viewMode === 'grid' 
                    ? 'grid gap-6' 
                    : 'space-y-4'
                } style={{
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fit, minmax(320px, 320px))' : undefined
                }}>
                  {filteredTrainers.map(trainer => 
                    viewMode === 'grid' 
                      ? renderTrainerCard(trainer)
                      : renderTrainerList(trainer)
                  )}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}