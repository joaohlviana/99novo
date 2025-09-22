import { Button } from '../ui/button';
import { ArrowRight, Star, Users, Clock, CheckCircle, Zap, DollarSign, Calendar } from 'lucide-react';

interface BecomeTrainerHeroProps {
  onStartWizard: () => void;
}

export function BecomeTrainerHero({ onStartWizard }: BecomeTrainerHeroProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      
      {/* Hero Section */}
      <section className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#e0093e]/10 text-[#e0093e] text-sm font-medium">
                  <Zap className="h-4 w-4 mr-2" />
                  Ganhe dinheiro fazendo o que ama
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Seja um
                  <span className="text-[#e0093e] block">Treinador</span>
                  na 99coach
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Conecte-se com milhares de pessoas que buscam transformar suas vidas através do esporte. 
                  Compartilhe seu conhecimento e construa sua carreira como treinador.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={onStartWizard}
                  className="bg-[#e0093e] hover:bg-[#c0082e] text-white px-8 py-6 text-lg"
                >
                  Começar Agora
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-6 text-lg border-2 hover:bg-gray-50"
                >
                  Saiba Mais
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">2.500+</div>
                  <div className="text-sm text-gray-600">Treinadores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">50k+</div>
                  <div className="text-sm text-gray-600">Alunos ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.9⭐</div>
                  <div className="text-sm text-gray-600">Avaliação</div>
                </div>
              </div>
            </div>

            {/* Right Content - Image/Visual */}
            <div className="relative">
              <div className="aspect-[4/5] bg-gradient-to-br from-[#e0093e]/20 to-purple-500/20 rounded-3xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhaW5lciUyMGNvYWNofGVufDF8fHx8MTc1NjEzNTkzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Personal Trainer" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">R$ 3.500/mês</div>
                    <div className="text-sm text-gray-500">Renda média</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">85+ alunos</div>
                    <div className="text-sm text-gray-500">Por treinador</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Por que ser um treinador na 99coach?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos tudo que você precisa para construir uma carreira de sucesso no mundo fitness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: 'Alcance Milhares de Pessoas',
                description: 'Conecte-se com uma comunidade ativa de mais de 50 mil pessoas buscando transformação.'
              },
              {
                icon: <DollarSign className="h-8 w-8" />,
                title: 'Maximize sua Renda',
                description: 'Nossos treinadores ganham em média R$ 3.500/mês com flexibilidade total de horários.'
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: 'Construa sua Reputação',
                description: 'Sistema de avaliações e portfólio profissional para destacar seu trabalho.'
              },
              {
                icon: <Clock className="h-8 w-8" />,
                title: 'Flexibilidade Total',
                description: 'Trabalhe quando e onde quiser. Atendimento online ou presencial, você decide.'
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: 'Ferramentas Profissionais',
                description: 'Plataforma completa com chat, agendamento, pagamentos e gestão de alunos.'
              },
              {
                icon: <Calendar className="h-8 w-8" />,
                title: 'Suporte Completo',
                description: 'Equipe dedicada para te ajudar em marketing, vendas e crescimento profissional.'
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#e0093e]/10 rounded-2xl flex items-center justify-center text-[#e0093e] mx-auto">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Como funciona?
            </h2>
            <p className="text-xl text-gray-600">
              Processo simples em 3 passos para começar sua jornada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Cadastre-se',
                description: 'Preencha suas informações, especialidades e experiência em poucos minutos.'
              },
              {
                step: '2',
                title: 'Configure seu perfil',
                description: 'Monte seu portfólio, defina preços e áreas de atendimento.'
              },
              {
                step: '3',
                title: 'Comece a treinar',
                description: 'Receba solicitações de alunos e comece a impactar vidas!'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#e0093e] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#e0093e]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Pronto para transformar sua paixão em profissão?
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 2.500 treinadores que já estão construindo suas carreiras conosco. 
            O processo leva apenas 5 minutos!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onStartWizard}
              className="bg-white text-[#e0093e] hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
            >
              Começar Cadastro Agora
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-pink-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>100% Gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Sem Taxa de Adesão</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>5 minutos para se cadastrar</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}