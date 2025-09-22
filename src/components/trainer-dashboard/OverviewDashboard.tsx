import { useState, useEffect } from 'react';
import { 
  Eye, 
  MessageCircle, 
  TrendingUp, 
  Star, 
  Users, 
  Calendar,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  BarChart3,
  Clock,
  UserCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ModernProgramCard } from '../ModernProgramCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';

export function OverviewDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainerStats, setTrainerStats] = useState({
    students: 0,
    upcomingClasses: 0,
    profileViews: 0,
    contactRequests: 0,
    avgTimeOnProfile: 0,
    avgDailyVisits: 0
  });
  const [profileVisitors, setProfileVisitors] = useState<any[]>([]);
  const [otherTrainers, setOtherTrainers] = useState<any[]>([]);
  const [popularPrograms, setPopularPrograms] = useState<any[]>([]);
  const [trendingSports, setTrendingSports] = useState<any[]>([]);

  // ✅ CARREGAR DADOS REAIS DO SUPABASE
  useEffect(() => {
    const loadTrainerData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // 1. Carregar estatísticas do trainer
        // Primeiro buscar programas do trainer
        const { data: trainerPrograms } = await supabase
          .from('programs')
          .select('id')
          .eq('trainer_id', user.id);

        const programIds = trainerPrograms?.map(p => p.id) || [];

        // Estudantes ativos
        const { count: students } = await supabase
          .from('program_enrollments')
          .select('*', { count: 'exact', head: true })
          .in('program_id', programIds)
          .eq('status', 'active');

        // Visitas ao perfil (últimos 30 dias)
        const { count: profileViews } = await supabase
          .from('profile_visits')
          .select('*', { count: 'exact', head: true })
          .eq('target_id', user.id)
          .gte('visited_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // Solicitações de contato
        const { count: contactRequests } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('message_type', 'contact_request');

        // Aulas próximas (buscar da tabela de agendamentos se existir)
        const { count: upcomingClasses } = await supabase
          .from('trainer_schedules')
          .select('*', { count: 'exact', head: true })
          .eq('trainer_id', user.id)
          .gte('scheduled_date', new Date().toISOString())
          .eq('status', 'confirmed');

        setTrainerStats({
          students: students || 0,
          upcomingClasses: upcomingClasses || 0,
          profileViews: profileViews || 0,
          contactRequests: contactRequests || 0,
          avgTimeOnProfile: Math.floor((profileViews || 0) * 2.5), // Estimativa baseada em visitas
          avgDailyVisits: Math.floor((profileViews || 0) / 30) // Média dos últimos 30 dias
        });

        // 2. Carregar visitantes recentes do perfil
        const { data: recentVisitors } = await supabase
          .from('profile_visits')
          .select(`
            visitor_id,
            visited_at,
            users!profile_visits_visitor_id_fkey(
              name,
              avatar
            )
          `)
          .eq('target_id', user.id)
          .order('visited_at', { ascending: false })
          .limit(9);

        if (recentVisitors) {
          const formattedVisitors = recentVisitors.map(visit => ({
            name: visit.users?.name || 'Usuário Anônimo',
            avatar: visit.users?.avatar || `https://images.unsplash.com/photo-1494790108755-2616b612ff3f?w=400&q=80`,
            time: getTimeAgo(visit.visited_at)
          }));
          setProfileVisitors(formattedVisitors);
        }

        // 3. Carregar outros treinadores
        const { data: trainers } = await supabase
          .from('trainer_profiles')
          .select(`
            user_id,
            specialties,
            years_experience,
            users!inner(
              name,
              avatar
            )
          `)
          .neq('user_id', user.id)
          .limit(6);

        if (trainers) {
          const formattedTrainers = trainers.map(trainer => ({
            id: trainer.user_id,
            name: trainer.users.name,
            specialty: trainer.specialties?.[0] || 'Personal Trainer',
            avatar: trainer.users.avatar,
            rating: 4.8, // Base rating - TODO: implementar sistema de avaliações
            students: 150, // Base number - TODO: contar enrollments reais
            experience: `${trainer.years_experience || 5} anos`,
            isOnline: false, // Default offline - TODO: implementar status em tempo real
            badge: trainer.years_experience > 8 ? 'Expert' : trainer.years_experience > 5 ? 'Pro' : null
          }));
          setOtherTrainers(formattedTrainers);
        }

        // 4. Carregar programas populares
        const { data: programs } = await supabase
          .from('programs')
          .select(`
            id,
            title,
            cover_image,
            price,
            level,
            duration_weeks,
            category,
            trainer_profiles!inner(
              user_id,
              users!inner(
                name,
                avatar
              )
            )
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (programs) {
          const formattedPrograms = programs.map(program => ({
            id: program.id,
            title: program.title,
            image: program.cover_image,
            instructor: program.trainer_profiles.users.name,
            price: `R$ ${program.price}`,
            rating: 4.8, // Base rating - TODO: implementar sistema de avaliações
            students: 150, // Base number - TODO: contar enrollments reais via query
            category: program.category,
            level: program.level,
            duration: `${program.duration_weeks} semanas`,
            trainer: {
              id: program.trainer_profiles.user_id,
              name: program.trainer_profiles.users.name,
              avatar: program.trainer_profiles.users.avatar,
              initials: program.trainer_profiles.users.name.split(' ').map(n => n[0]).join('')
            }
          }));
          setPopularPrograms(formattedPrograms);
        }

        // 5. Carregar esportes em alta (placeholder com dados reais básicos)
        setTrendingSports([
          { name: 'Musculação', growth: '+23%', icon: '💪', color: 'bg-blue-500' },
          { name: 'Yoga', growth: '+18%', icon: '🧘‍♀️', color: 'bg-purple-500' },
          { name: 'Crossfit', growth: '+15%', icon: '🏋️‍♂️', color: 'bg-orange-500' },
          { name: 'Running', growth: '+12%', icon: '🏃‍♂️', color: 'bg-green-500' },
          { name: 'Pilates', growth: '+10%', icon: '🤸‍♀️', color: 'bg-pink-500' },
          { name: 'Natação', growth: '+8%', icon: '🏊‍♂️', color: 'bg-cyan-500' }
        ]);

      } catch (error) {
        console.error('Erro ao carregar dados do trainer dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrainerData();
  }, [user?.id]);

  // Função auxiliar para calcular tempo decorrido
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  // Fallback para quando não houver visitantes
  const fallbackVisitors = [
    {
      name: 'Nenhuma visita recente',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612ff3f?w=400&q=80',
      time: ''
    }
  ];

  return (
    <div className="w-full min-h-screen space-y-8">
      {/* Header Section */}
      <div className="space-y-2 px-4 lg:px-6">
        <h1 className="text-2xl font-semibold mt-[20px] mr-[0px] mb-[7px] ml-[0px]">Olá, {user?.name || 'Trainer'}.</h1>
        <p className="text-muted-foreground">
          Quem vai treinar hoje?
        </p>
      </div>

      {/* Content */}
      <div className="w-full px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-6">

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#e0093e] to-[#c0082e] rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Inteligência Artificial para Marketing</h3>
              <p className="text-white/90 mb-6 leading-relaxed">
                Aprenda como a inteligência artificial está revolucionando 
                a forma como o marketing é feito tanto para grandes quanto 
                pequenas organizações.
              </p>
              <Button 
                variant="secondary" 
                className="bg-white text-[#e0093e] hover:bg-gray-50 font-medium"
              >
                Aprender agora
              </Button>
            </div>
            
            <div className="flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1677212004257-103cfa6b59d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwbWFya2V0aW5nJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc1NjI2NDE5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                alt="AI Marketing"
                className="w-64 h-48 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Explorar outros treinadores */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">Explorar outros treinadores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTrainers.map((trainer, index) => (
              <div key={index} className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    {/* Header com Avatar e Status Online */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                          <AvatarImage src={trainer.avatar} alt={trainer.name} />
                          <AvatarFallback>{trainer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        {trainer.isOnline && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      {trainer.badge && (
                        <Badge 
                          variant={trainer.badge === 'Expert' ? 'default' : 'secondary'} 
                          className={`text-xs ${
                            trainer.badge === 'Expert' ? 'bg-[#e0093e] hover:bg-[#c0082e]' :
                            trainer.badge === 'Pro' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {trainer.badge}
                        </Badge>
                      )}
                    </div>

                    {/* Informações do Treinador */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {trainer.name}
                      </h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {trainer.specialty}
                      </p>
                    </div>

                    {/* Rating e Experiência */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-400" />
                        <span className="text-xs font-medium text-gray-900">{trainer.rating}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {trainer.experience}
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{trainer.students} alunos</span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-6 px-2 text-xs hover:bg-[#e0093e] hover:text-white transition-colors"
                      >
                        Ver perfil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Modalidades em Alta */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">Modalidades em alta</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingSports.map((sport, index) => (
              <Card key={index} className="group hover:shadow-md transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${sport.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-xl">{sport.icon}</span>
                  </div>
                  <h4 className="font-medium text-sm text-gray-900 mb-1">{sport.name}</h4>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">{sport.growth}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Programas mais procurados */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">Programas mais procurados</h3>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {popularPrograms.map((program) => (
                <CarouselItem key={program.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                  <div className="p-6 h-full flex">
                    <ModernProgramCard
                      {...program}
                      students={`${program.students} alunos`}
                      onNavigateToProgram={(id) => console.log('Navigate to program:', id)}
                      onNavigateToTrainer={(trainerId) => console.log('Navigate to trainer:', trainerId)}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

      </div>

      {/* Sidebar - Right Side */}
      <div className="space-y-6">
        
        {/* Profile Statistics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">
              Estatísticas do seu perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Top Row */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold text-gray-900">{loading ? '...' : trainerStats.students}</div>
                <div className="text-xs text-gray-500 uppercase">Alunos</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{loading ? '...' : trainerStats.upcomingClasses}</div>
                <div className="text-xs text-gray-500 uppercase">Upcoming</div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Middle Row */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold text-gray-900">{loading ? '...' : trainerStats.profileViews}</div>
                <div className="text-xs text-gray-500 uppercase">Visualizam</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{loading ? '...' : trainerStats.contactRequests}</div>
                <div className="text-xs text-gray-500 uppercase">Testaram contato</div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold text-gray-900">{loading ? '...' : trainerStats.avgTimeOnProfile}</div>
                <div className="text-xs text-gray-500 uppercase">Tempo no perfil</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{loading ? '...' : trainerStats.avgDailyVisits}</div>
                <div className="text-xs text-gray-500 uppercase">Média dev visitas</div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Profile Visitors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">
              Entraram em seu perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(profileVisitors.length > 0 ? profileVisitors : fallbackVisitors).map((visitor, index) => (
              <div key={index} className="flex items-center gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={visitor.avatar} />
                  <AvatarFallback>{visitor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{visitor.name}</p>
                </div>
                <span className="text-xs text-gray-500">{visitor.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

          </div>
        </div>
      </div>
    </div>
  );
}