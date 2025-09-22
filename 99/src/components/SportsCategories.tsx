import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import AppleCardsCarouselDemo from './apple-cards-carousel-demo';

// Importar os SVGs do Figma
import svgPaths from '../imports/svg-fj7j7e9lob';

// Componente para cada ícone de esporte
interface SportIconProps {
  paths: string[];
  name: string;
  isSelected?: boolean;
  onClick?: () => void;
}

function SportIcon({ paths, name, isSelected, onClick }: SportIconProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 bg-white hover:shadow-lg ${
        isSelected 
          ? 'border-[#e0093e] shadow-lg' 
          : 'border-gray-200 hover:border-[#e0093e]'
      }`}
    >
      <div className="relative w-6 h-6">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
          <g>
            {paths.map((path, index) => (
              <path
                key={index}
                d={path}
                stroke={isSelected ? "#e0093e" : "#5A626B"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                className="group-hover:stroke-[#e0093e] transition-colors"
              />
            ))}
          </g>
        </svg>
      </div>
      <span className={`text-sm font-medium transition-colors ${
        isSelected ? 'text-[#e0093e]' : 'text-gray-600 group-hover:text-[#e0093e]'
      }`}>
        {name}
      </span>
    </button>
  );
}

// Dados dos esportes com seus respectivos paths SVG e estatísticas de visitas
const sportsData = [
  {
    name: 'Musculação',
    paths: [svgPaths.p26ec0500, svgPaths.p29014080],
    trainers: '350+ treinadores',
    visits: '2.847',
    visitsTrend: '+12%',
    color: '#e0093e',
    popular: true
  },
  {
    name: 'Yoga',
    paths: [svgPaths.p29878000, svgPaths.p58a1cac],
    trainers: '200+ treinadores',
    visits: '1.923',
    visitsTrend: '+8%',
    color: '#8B5CF6',
    popular: true
  },
  {
    name: 'Futebol',
    paths: [svgPaths.p25f04900, svgPaths.p7a45300, svgPaths.p2d6959c0],
    trainers: '180+ treinadores',
    visits: '1.654',
    visitsTrend: '+15%',
    color: '#10B981',
    popular: true
  },
  {
    name: 'Ciclismo',
    paths: [svgPaths.p3806e980, svgPaths.pbf35800, svgPaths.p2878600],
    trainers: '140+ treinadores',
    visits: '1.432',
    visitsTrend: '+6%',
    color: '#F59E0B'
  },
  {
    name: 'Karatê',
    paths: [svgPaths.p1a081480, svgPaths.p3588c940, svgPaths.p8169400],
    trainers: '120+ treinadores',
    visits: '987',
    visitsTrend: '+18%',
    color: '#EF4444'
  },
  {
    name: 'Volêi',
    paths: [svgPaths.p1952ce00, svgPaths.p10443c00, svgPaths.p25de200],
    trainers: '110+ treinadores',
    visits: '856',
    visitsTrend: '+4%',
    color: '#3B82F6'
  },
  {
    name: 'Ginástica',
    paths: [svgPaths.p10755e70, svgPaths.p15837080, svgPaths.pdd822c0],
    trainers: '95+ treinadores',
    visits: '743',
    visitsTrend: '+22%',
    color: '#EC4899'
  },
  {
    name: 'Boxe',
    paths: [svgPaths.p3050d300, svgPaths.p15730a60, svgPaths.pc25a000],
    trainers: '85+ treinadores',
    visits: '634',
    visitsTrend: '+9%',
    color: '#DC2626'
  },
  {
    name: 'Golf',
    paths: [svgPaths.p2f7ac200, svgPaths.p14a33b00, svgPaths.pa9f2800],
    trainers: '45+ treinadores',
    visits: '423',
    visitsTrend: '+3%',
    color: '#059669'
  },
  {
    name: 'Baseball',
    paths: [svgPaths.pc931d00, svgPaths.p15782d00, svgPaths.p1bac8700],
    trainers: '35+ treinadores',
    visits: '298',
    visitsTrend: '+7%',
    color: '#7C3AED'
  },
  {
    name: 'Futebol Americano',
    paths: [svgPaths.p1fce5d00, svgPaths.p3d2d5dc0, svgPaths.p1ea58980],
    trainers: '25+ treinadores',
    visits: '187',
    visitsTrend: '+11%',
    color: '#F97316'
  },
  {
    name: 'Boliche',
    paths: [svgPaths.p1cffb190, svgPaths.p38fffe00, svgPaths.p1b1d8000],
    trainers: '30+ treinadores',
    visits: '156',
    visitsTrend: '+2%',
    color: '#6B7280'
  }
];

// Dados das categorias com imagens
const categoriesData = [
  {
    title: 'Esportes Aquaticos',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    count: '150+ programas'
  },
  {
    title: 'Esportes de Equipe',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80',
    count: '280+ programas'
  },
  {
    title: 'Esportes de Combate',
    image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80',
    count: '190+ programas'
  },
  {
    title: 'Esportes de Raquete',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
    count: '120+ programas'
  },
  {
    title: 'Esportes de Atletismo',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    count: '220+ programas'
  },
  {
    title: 'Esportes de Aventura',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80',
    count: '95+ programas'
  }
];

import { useNavigation } from '../hooks/useNavigation';

export function SportsCategories() {
  const navigation = useNavigation();
  const [selectedSport, setSelectedSport] = useState<string>('Musculação');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const itemsPerSlide = 4; // 4 cards por slide
  const totalSlides = Math.ceil(sportsData.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const visibleSports = sportsData.slice(
    currentSlideIndex * itemsPerSlide, 
    (currentSlideIndex * itemsPerSlide) + itemsPerSlide
  );

  const visibleCategories = categoriesData.slice(currentSlideIndex * 3, (currentSlideIndex * 3) + 3);

  return (
    <div className="space-y-16 lg:space-y-20">
      {/* Sports Menu Section */}
      

      {/* Apple Cards Carousel Section */}
      <section className="bg-gradient-to-b from-white to-gray-50">
        <AppleCardsCarouselDemo />
      </section>

      {/* Categories Section */}
      

      {/* Featured Sports Stats with Carousel */}
      
    </div>
  );
}