import { ModernProfileCard } from './ModernProfileCard';
import { Button } from './ui/button';
import { ArrowLeft, Palette, Zap, Target } from 'lucide-react';

interface ProfileShowcaseProps {
  onNavigateBack?: () => void;
}

export function ProfileShowcase({ onNavigateBack }: ProfileShowcaseProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container">
        
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
                Cards Modernos de Perfil
              </h1>
              <p className="text-xl text-gray-600">
                Demonstração dos cards modernos de perfil de treinadores
              </p>
            </div>
          </div>
        </div>

        {/* Technical Documentation */}
        <div className="mb-12 bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-2xl font-semibold mb-4">Especificações Técnicas</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium mb-2">Design System:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Largura fixa: 384px (w-96)</li>
                <li>• Altura dinâmica adaptável</li>
                <li>• Border radius: 16px (rounded-2xl)</li>
                <li>• Padding interno: 20px horizontal, 16px inferior</li>
                <li>• Grid gap: 40px entre cards</li>
                <li>• Avatar: 80px (ring branco 4px)</li>
                <li>• Gaps: 6px entre elementos internos</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Paleta de Cores:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Principal: Toyota Red (#e0093e)</li>
                <li>• Background: Branco puro</li>
                <li>• Texto: Tons de cinza (700-900)</li>
                <li>• Badges: Cinza neutro</li>
                <li>• Border: Gray-100</li>
                <li>• Shadow: Suave multi-layer</li>
                <li>• Verification: Toyota Red vibrante</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid justify-items-center gap-10" style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 320px))',
          justifyContent: 'center'
        }}>
          {/* Exemplo 1 - Exato como a imagem */}
          <ModernProfileCard
            name="Alaa Al R. El H."
            location="Abu Dhabi, United Arab Emirates"
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
            portfolioImages={[
              'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80',
              'https://images.unsplash.com/photo-1522075469751-3847ae2c9e4e?w=400&q=80',
              'https://images.unsplash.com/photo-1517344884509-a0c079a5db9c?w=400&q=80'
            ]}
            tags={['Freelance', 'Tempo integral']}
            stats={{
              followers: '17,3 mil',
              following: '959',
              views: '130,4 mil'
            }}
            rating={4.9}
            isVerified={true}
          />

          {/* Exemplo 2 - Variação brasileira */}
          <ModernProfileCard
            name="João Silva"
            location="São Paulo, SP"
            avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80"
            portfolioImages={[
              'https://images.unsplash.com/photo-1573858129038-6f98c3cb2ac7?w=400&q=80',
              'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400&q=80',
              'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80'
            ]}
            tags={['Personal', 'Presencial']}
            stats={{
              followers: '2,3k',
              following: '180',
              views: '15,8k'
            }}
            rating={4.8}
            isVerified={true}
          />

          {/* Exemplo 3 - Instrutora de Yoga */}
          <ModernProfileCard
            name="Maria Santos"
            location="Rio de Janeiro, RJ"
            avatar="https://images.unsplash.com/photo-1494790108755-2616b612ff3f?w=400&q=80"
            portfolioImages={[
              'https://images.unsplash.com/photo-1715780463401-b9ef0567943e?w=400&q=80',
              'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=400&q=80',
              'https://images.unsplash.com/photo-1506629905853-cb0d03b2b93a?w=400&q=80'
            ]}
            tags={['Yoga', 'Online']}
            stats={{
              followers: '1,8k',
              following: '245',
              views: '12,4k'
            }}
            rating={4.7}
            isVerified={false}
          />

          {/* Exemplo 4 - Crossfit */}
          <ModernProfileCard
            name="Carlos Oliveira"
            location="Belo Horizonte, MG"
            avatar="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80"
            portfolioImages={[
              'https://images.unsplash.com/photo-1662381906696-bcad03513531?w=400&q=80',
              'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
              'https://images.unsplash.com/photo-1583483425806-e45dfe57e4b7?w=400&q=80'
            ]}
            tags={['Crossfit', 'HIIT']}
            stats={{
              followers: '3,1k',
              following: '156',
              views: '21,3k'
            }}
            rating={4.9}
            isVerified={true}
          />
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border">
          <h2 className="text-2xl font-semibold mb-6 text-center">Características dos Cards</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#e0093e]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Design Consistente</h3>
              <p className="text-gray-600 text-sm">
                Paleta unificada com Toyota Red como destaque e tons neutros como base
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Portfolio Visual</h3>
              <p className="text-gray-600 text-sm">
                Grid de 3 imagens mostrando o trabalho do treinador de forma atrativa
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Interação Intuitiva</h3>
              <p className="text-gray-600 text-sm">
                Botões de ação claros com hierarquia visual bem definida
              </p>
            </div>
          </div>
        </div>

        {/* Responsive Info */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Responsividade</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">📱</div>
              <h3 className="font-semibold mb-1">Mobile</h3>
              <p className="text-gray-300">1 card por linha<br/>Largura adaptável</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">📱</div>
              <h3 className="font-semibold mb-1">Tablet</h3>
              <p className="text-gray-300">2 cards por linha<br/>Grid balanceado</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">💻</div>
              <h3 className="font-semibold mb-1">Desktop</h3>
              <p className="text-gray-300">3 cards por linha<br/>Layout otimizado</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">🖥️</div>
              <h3 className="font-semibold mb-1">Large</h3>
              <p className="text-gray-300">4+ cards por linha<br/>Máximo aproveitamento</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}