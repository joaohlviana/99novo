import { ModernProgramCard } from './ModernProgramCard';
import { Button } from './ui/button';
import { ArrowLeft, Palette, Zap, Target } from 'lucide-react';

interface ProgramShowcaseProps {
  onNavigateBack?: () => void;
}

const mockPrograms = [
  {
    id: '1',
    title: 'Transformação Corporal Completa',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    level: 'Intermediário',
    category: 'Musculação',
    duration: '12 semanas',
    students: '234 alunos',
    rating: 4.9,
    price: 'R$ 297',
    trainer: {
      name: 'João Silva',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      initials: 'JS'
    }
  },
  {
    id: '2',
    title: 'Emagrecimento Definitivo',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    level: 'Iniciante',
    category: 'Cardio',
    duration: '8 semanas',
    students: '156 alunos',
    rating: 4.8,
    price: 'R$ 197',
    trainer: {
      name: 'Maria Santos',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2f37252?w=400&q=80',
      initials: 'MS'
    }
  },
  {
    id: '3',
    title: 'Força e Resistência',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    level: 'Avançado',
    category: 'Funcional',
    duration: '16 semanas',
    students: '89 alunos',
    rating: 4.7,
    price: 'R$ 397',
    trainer: {
      name: 'Carlos Lima',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      initials: 'CL'
    }
  }
];

export function ProgramShowcase({ onNavigateBack }: ProgramShowcaseProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onNavigateBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigateBack}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Cards Modernos de Programas
                </h1>
                <p className="text-gray-600">
                  Showcase dos novos cards com design sofisticado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Design System Info */}
        <div className="bg-white rounded-2xl p-8 mb-12 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#e0093e] rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sistema de Design Moderno</h2>
              <p className="text-gray-600">Paleta sofisticada e elementos visuais refinados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colors */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Paleta de Cores
              </h3>
              <div className="space-y-2 text-sm">
                <li>• Primary: Toyota Red (#e0093e)</li>
                <li>• Secondary: Tons de cinza elegantes</li>
                <li>• Success: Verde suave para badges</li>
                <li>• Info: Azul sutil para níveis</li>
                <li>• Warning: Roxo para avançado</li>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Recursos Visuais
              </h3>
              <div className="space-y-2 text-sm">
                <li>• Hover effects sofisticados</li>
                <li>• Gradientes sutis para profundidade</li>
                <li>• Badges com cores contextuais</li>
                <li>• Botão like interativo</li>
                <li>• Play icon no hover</li>
              </div>
            </div>

            {/* Layout */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Layout & UX
              </h3>
              <div className="space-y-2 text-sm">
                <li>• Design responsivo mobile-first</li>
                <li>• Espaçamento generoso e harmônico</li>
                <li>• Hierarquia visual clara</li>
                <li>• Transições suaves</li>
                <li>• Informações organizadas</li>
              </div>
            </div>
          </div>
        </div>

        {/* Program Cards Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Cards de Programas Modernos
              </h2>
              <p className="text-gray-600">
                Design sofisticado com Toyota Red e tons de cinza elegantes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {mockPrograms.map((program) => (
              <ModernProgramCard
                key={program.id}
                {...program}
                onNavigateToProgram={(id) => console.log('Navigate to program:', id)}
                onNavigateToTrainer={(id) => console.log('Navigate to trainer:', id)}
              />
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Detalhes Técnicos do ModernProgramCard
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Componentes e Props</h4>
              <div className="bg-white rounded-lg p-4 text-sm font-mono">
                <pre className="text-gray-700">{`interface ProgramCardProps {
  id: string;
  title: string;
  image: string;
  level: string;
  category: string;
  duration: string;
  students: string;
  rating: number;
  price: string;
  trainer: TrainerInfo;
  onNavigateToProgram?: (id: string) => void;
  onNavigateToTrainer?: (id: string) => void;
}`}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recursos Implementados</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sistema de badges com cores contextuais por nível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Hover effects com scale e play icon</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Botão like interativo com animações</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Gradient overlay para melhor legibilidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Informações do treinador integradas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Barra de informações adicionais</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}