/**
 * HOMEPAGE UNIFICADA - SISTEMA PADRONIZADO
 * =======================================
 * HomePage simplificada que usa apenas sistema unificado
 */

import { useState } from 'react';
import { Search, ChevronDown, MapPin, Star, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { SportsMenu } from './SportsMenu';
import { SportsCategories } from './SportsCategories';
import { ModernProgramCarouselUnified } from './ModernProgramCarouselUnified';
import { ModernProfileCard } from './ModernProfileCard';
import { Carousel as AppleCarousel } from './ui/apple-cards-carousel';
import { useNavigation } from '../hooks/useNavigation';

// Tipos simplificados para treinadores (ainda mock)
interface HomePageTrainer {
  id: string;
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
  rating: number;
  isVerified: boolean;
}

interface HomePageProps {}

export function HomePageUnified({}: HomePageProps) {
  const navigation = useNavigation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>('patinacao');
  
  // Filter states
  const [searchType, setSearchType] = useState<'trainers' | 'programs'>('trainers');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  // Mock data temporário para treinadores
  const mockTopTrainers: HomePageTrainer[] = [
    {
      id: "joao",
      name: "João Silva",
      location: "São Paulo, SP",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1573858129038-6f98c3cb2ac7?w=400&q=80",
        "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400&q=80",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80"
      ],
      tags: ["Musculação", "Funcional"],
      stats: {
        followers: "3,2k",
        following: "245",
        views: "18,7k"
      },
      rating: 4.9,
      isVerified: true
    },
    {
      id: "maria",
      name: "Maria Santos",
      location: "Rio de Janeiro, RJ",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c647?w=400&q=80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1715780463401-b9ef0567943e?w=400&q=80",
        "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=400&q=80",
        "https://images.unsplash.com/photo-1506629905853-cb0d03b2b93a?w=400&q=80"
      ],
      tags: ["Yoga", "Pilates"],
      stats: {
        followers: "2,8k",
        following: "189",
        views: "14,2k"
      },
      rating: 4.8,
      isVerified: true
    },
    {
      id: "carlos",
      name: "Carlos Lima",
      location: "Belo Horizonte, MG",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1662381906696-bcad03513531?w=400&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
        "https://images.unsplash.com/photo-1583483425806-e45dfe57e4b7?w=400&q=80"
      ],
      tags: ["Crossfit", "HIIT"],
      stats: {
        followers: "4,1k",
        following: "312",
        views: "22,5k"
      },
      rating: 4.7,
      isVerified: true
    },
    {
      id: "ana",
      name: "Ana Costa",
      location: "Porto Alegre, RS",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1751456357786-68c278e9063c?w=400&q=80",
        "https://images.unsplash.com/photo-1641971215217-fc55b492d11f?w=400&q=80",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80"
      ],
      tags: ["Fitness", "Corrida"],
      stats: {
        followers: "1,9k",
        following: "156",
        views: "11,3k"
      },
      rating: 4.6,
      isVerified: true
    },
    {
      id: "pedro",
      name: "Pedro Oliveira",
      location: "Fortaleza, CE",
      avatar: "https://images.unsplash.com/photo-1721096702258-e693f8977a83?w=400&q=80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1727151590381-324be70e3295?w=400&q=80",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80"
      ],
      tags: ["Natação", "Aqua Fitness"],
      stats: {
        followers: "1,7k",
        following: "98",
        views: "9,2k"
      },
      rating: 4.7,
      isVerified: true
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Sports Menu */}
      <SportsMenu selectedSport={selectedSport} />

      {/* Hero Section with Pink Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e0093e] via-[#e0093e] to-[#c0082e]">
        {/* Background pattern/shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10"></div>
          <div className="absolute top-1/2 -left-20 w-40 h-40 rounded-full bg-white/5"></div>
          <div className="absolute bottom-20 right-1/4 w-32 h-32 rounded-full bg-white/5"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="md:text-5xl lg:text-6xl font-bold text-white mb-[20px] leading-tight text-[48px] mt-[0px] mr-[0px] ml-[0px]">
              Encontre o<br />
              <span className="text-white">treinador ideal</span><br />
              para o seu<br />
              <span className="text-white font-[Inter]">esporte favorito.</span>
            </h1>

            {/* Search Bar */}
            <div className="max-w-xl mb-6">
              <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <DialogTrigger asChild>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="O que está procurando?"
                      className="pl-12 pr-4 h-14 text-base bg-white border-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                      readOnly
                    />
                  </div>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-2xl backdrop-blur-md">
                  <DialogTitle className="sr-only">Buscar na plataforma</DialogTitle>
                  <DialogDescription className="sr-only">
                    Busque por treinadores, modalidades esportivas e programas de treino
                  </DialogDescription>
                  
                  <div className="space-y-6">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Buscar esportes, treinadores ou programas..."
                        className="pl-12 text-lg h-12 border-2 focus:border-[#e0093e]"
                        autoFocus
                      />
                    </div>

                    {/* Compact Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Search Type */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Buscar por</Label>
                        <RadioGroup 
                          value={searchType} 
                          onValueChange={(value: 'trainers' | 'programs') => setSearchType(value)}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="trainers" id="trainers" />
                            <Label htmlFor="trainers" className="text-sm">Treinadores</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="programs" id="programs" />
                            <Label htmlFor="programs" className="text-sm">Programas</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Training Mode */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Modalidade</Label>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <div className="flex items-center gap-2">
                            <MapPin className={`h-4 w-4 ${!isOnline ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className="text-sm font-medium">{isOnline ? 'Online' : 'Presencial'}</span>
                          </div>
                          <Switch
                            checked={isOnline}
                            onCheckedChange={setIsOnline}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 text-white/90">
              <div>
                <div className="text-2xl font-bold">2,847</div>
                <div className="text-sm">Treinadores</div>
              </div>
              <div>
                <div className="text-2xl font-bold">15,234</div>
                <div className="text-sm">Alunos ativos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm">Satisfação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Categories */}
      <SportsCategories />

      {/* Programs em Destaque - Sistema Unificado */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Programas em Destaque
              </h2>
              <p className="text-lg text-gray-600">
                Os programas mais populares da nossa plataforma
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigation.navigateTo('/catalog')}
              className="hidden lg:flex items-center gap-2 px-6 py-3 border-gray-300 hover:border-[#e0093e] hover:text-[#e0093e] transition-colors"
            >
              Ver todos os programas
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Carousel Unificado */}
          <ModernProgramCarouselUnified />

          {/* Mobile CTA */}
          <div className="lg:hidden mt-8 text-center">
            <Button
              onClick={() => navigation.navigateTo('/catalog')}
              className="bg-[#e0093e] hover:bg-[#c40835] text-white px-8 py-3 rounded-full"
            >
              Ver todos os programas
            </Button>
          </div>
        </div>
      </section>

      {/* Top Trainers */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Treinadores em Destaque
              </h2>
              <p className="text-lg text-gray-600">
                Conheça nossos treinadores mais bem avaliados
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigation.navigateTo('/trainers')}
              className="hidden lg:flex items-center gap-2 px-6 py-3 border-gray-300 hover:border-[#e0093e] hover:text-[#e0093e] transition-colors"
            >
              Ver todos os treinadores
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Trainers Carousel */}
          <div className="relative">
            <AppleCarousel items={mockTopTrainers.map((trainer, index) => (
              <ModernProfileCard
                key={trainer.id}
                trainer={trainer}
                onNavigateToTrainer={(trainerId) => navigation.navigateTo(`/trainer/${trainerId}`)}
              />
            ))} />
          </div>

          {/* Mobile CTA */}
          <div className="lg:hidden mt-8 text-center">
            <Button
              onClick={() => navigation.navigateTo('/trainers')}
              className="bg-[#e0093e] hover:bg-[#c40835] text-white px-8 py-3 rounded-full"
            >
              Ver todos os treinadores
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-[#e0093e] to-[#c0082e]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Pronto para começar sua jornada fitness?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Encontre o treinador perfeito para você e alcance seus objetivos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigation.navigateTo('/become-client')}
              className="bg-white text-[#e0093e] hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              Sou Cliente
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigation.navigateTo('/become-trainer')}
              className="border-white text-white hover:bg-white hover:text-[#e0093e] px-8 py-4 text-lg font-semibold"
            >
              Sou Treinador
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePageUnified;