import { ProfileCoverCard } from './ProfileCoverCard';
import { Button } from './ui/button';
import { ArrowLeft, Palette, Camera, Users } from 'lucide-react';

interface ProfileCoverShowcaseProps {
  onNavigateBack?: () => void;
}

export function ProfileCoverShowcase({ onNavigateBack }: ProfileCoverShowcaseProps) {
  // Mock data para demonstração
  const mockProfiles = [
    {
      id: '1',
      name: 'João Henrique',
      title: 'Personal',
      coverImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      location: 'Londrina - PR',
      serviceMode: 'Presencial' as const,
      rating: 4.9
    },
    {
      id: '2',
      name: 'Maria Santos',
      title: 'Crossfit',
      coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      location: 'São Paulo - SP',
      serviceMode: 'Online' as const,
      rating: 4.8
    },
    {
      id: '3',
      name: 'Ana Costa',
      title: 'Yoga',
      coverImage: 'https://images.unsplash.com/photo-1506629905853-cb0d03b2b93a?w=600&q=80',
      location: 'Rio de Janeiro - RJ',
      serviceMode: 'Ambos' as const,
      rating: 4.7
    },
    {
      id: '4',
      name: 'Carlos Oliveira',
      title: 'Musculação',
      coverImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
      location: 'Belo Horizonte - MG',
      serviceMode: 'Presencial' as const,
      rating: 4.8
    },
    {
      id: '5',
      name: 'Paula Fernandes',
      title: 'Pilates',
      coverImage: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=600&q=80',
      location: 'Brasília - DF',
      serviceMode: 'Online' as const,
      rating: 4.6
    },
    {
      id: '6',
      name: 'Roberto Lima',
      title: 'Funcional',
      coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
      location: 'Porto Alegre - RS',
      serviceMode: 'Ambos' as const,
      rating: 4.9
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                ← Voltar
              </button>
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Card de Perfil Compacto
              </h1>
              <p className="text-xl text-gray-600">
                Layout compacto de 240px com foto quadrada e ações diretas
              </p>
            </div>
          </div>
        </div>

        {/* Especificações do Design */}
        <div className="mb-12 bg-white rounded-xl p-8 shadow-sm border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#e0093e] rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Especificações do Card</h2>
              <p className="text-gray-600">Card de perfil com imagem de capa dominante</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Estrutura Visual */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Estrutura Visual
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• <strong>Layout compacto</strong> → max-width 240px</div>
                <div>• <strong>Hover interativo</strong> → botões aparecem no hover</div>
                <div>• <strong>Foto quadrada</strong> → aspect-square com padding 3px</div>
                <div>• <strong>Local + Badge</strong> → Building2 + Badge de modalidade</div>
                <div>• <strong>Transições suaves</strong> → duration-500 ease-out</div>
              </div>
            </div>

            {/* Elementos do Design */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Elementos Visuais
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• <strong>Foto:</strong> rounded-t-2xl, sem hover scale</div>
                <div>• <strong>Nome:</strong> Font-bold, text-lg, cor preta</div>
                <div>• <strong>Rating:</strong> Estrela + número, cinza</div>
                <div>• <strong>Hover:</strong> h-0 → h-12 com opacity delay</div>
              </div>
            </div>

            {/* Interações */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Botões & Estados
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• <strong>Seguir:</strong> Toyota Red (#e0093e) ↔ Cinza quando ativo</div>
                <div>• <strong>Curtir:</strong> Sempre cinza, mesmo quando ativo</div>
                <div>• <strong>Ícone Plus:</strong> Rotaciona 45° quando "Seguindo"</div>
                <div>• <strong>Transições:</strong> duration-200/300 suaves</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            Demonstração dos Cards
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
            {mockProfiles.map((profile) => (
              <ProfileCoverCard
                key={profile.id}
                {...profile}
                onFollow={(id) => console.log('Seguir treinador:', id)}
                onNavigateToProfile={(id) => console.log('Navegar para perfil:', id)}
              />
            ))}
          </div>
        </div>

        {/* Recursos Técnicos */}
        <div className="bg-gradient-to-r from-[#e0093e] to-[#c40835] text-white rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Recursos Implementados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">✨</div>
              <h3 className="font-semibold mb-2">Hover Interativo</h3>
              <p className="text-white/80">Botões aparecem suavemente no hover</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">🖼️</div>
              <h3 className="font-semibold mb-2">Foto Quadrada</h3>
              <p className="text-white/80">Aspect-square com padding interno e border-radius</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">🎯</div>
              <h3 className="font-semibold mb-2">Ações Diretas</h3>
              <p className="text-white/80">Seguir (Toyota Red) + Curtir (sempre cinza)</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">🏷️</div>
              <h3 className="font-semibold mb-2">Badge Modalidade</h3>
              <p className="text-white/80">Presencial (verde), Online (azul), Ambos (roxo)</p>
            </div>
          </div>
        </div>

        {/* Detalhes Técnicos */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Detalhes Técnicos da Implementação
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Componente e Props</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono">
                <pre className="text-gray-700 whitespace-pre-wrap">{`interface ProfileCoverCardProps {
  id: string;
  name: string;
  title: string;
  coverImage: string;
  location: string;
  serviceMode: 'Presencial' | 'Online' | 'Ambos';
  rating: number;
  onFollow?: (id: string) => void;
  onNavigateToProfile?: (id: string) => void;
  className?: string;
}`}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Características Principais</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Hover Interativo:</strong> Botões surgem suavemente no hover
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Transições Coordenadas:</strong> Group hover com delays otimizados
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Estados Visuais:</strong> Plus rotaciona 45° + cores específicas por estado
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Animações Fluidas:</strong> duration-500 ease-out + delay-200 na opacity
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Transições Suaves:</strong> Todas as animações com duration-300 a duration-700
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}