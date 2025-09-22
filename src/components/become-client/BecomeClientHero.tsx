import { ArrowRight, Target, Users, Trophy, Heart, Shield, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Section } from '../layout/Section';
import { CardShell } from '../layout/CardShell';

interface BecomeClientHeroProps {
  onStart: () => void;
}

export function BecomeClientHero({ onStart }: BecomeClientHeroProps) {
  const benefits = [
    {
      icon: Target,
      title: 'Objetivos Personalizados',
      description: 'Defina seus objetivos e encontre treinadores especializados na sua meta específica.'
    },
    {
      icon: Users,
      title: 'Treinadores Verificados',
      description: 'Acesso a uma rede de treinadores qualificados e verificados pela plataforma.'
    },
    {
      icon: Trophy,
      title: 'Resultados Comprovados',
      description: 'Acompanhe seu progresso e veja seus resultados com ferramentas exclusivas.'
    },
    {
      icon: Heart,
      title: 'Suporte Contínuo',
      description: 'Tenha acompanhamento direto com seu treinador através da plataforma.'
    },
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Plataforma segura com pagamentos protegidos e dados criptografados.'
    },
    {
      icon: Clock,
      title: 'Flexibilidade Total',
      description: 'Treine quando e onde quiser, com opções online e presenciais.'
    }
  ];

  const stats = [
    { label: 'Clientes Ativos', value: '15.000+' },
    { label: 'Treinadores Certificados', value: '1.200+' },
    { label: 'Taxa de Sucesso', value: '94%' },
    { label: 'Programas Disponíveis', value: '3.500+' }
  ];

  return (
    <>
      {/* Hero Section */}
      <Section className="pt-12 pb-8">
        <CardShell className="text-center bg-gradient-to-br from-white to-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Transforme seu
                <span className="text-[var(--brand)] block">corpo e mente</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Encontre o treinador perfeito para seus objetivos. Seja para perder peso, 
                ganhar massa muscular ou melhorar sua saúde, temos o profissional ideal para você.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-[#e0093e] hover:bg-[#c0082e] text-white px-8 py-4 text-lg"
                onClick={onStart}
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Ver Treinadores
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-2xl font-bold text-[var(--brand)]">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </CardShell>
      </Section>

      {/* Benefits Section */}
      <Section>
        <CardShell>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher nossa plataforma?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Oferecemos tudo que você precisa para alcançar seus objetivos de forma segura e eficiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-[var(--brand)]/10 rounded-full flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-[var(--brand)]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardShell>
      </Section>

      {/* CTA Section */}
      <Section>
        <CardShell className="text-center bg-gradient-to-r from-[var(--brand)]/10 to-[var(--brand)]/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Cadastre-se gratuitamente e encontre o treinador ideal para você em menos de 5 minutos.
            </p>
            <Button 
              size="lg" 
              className="bg-[#e0093e] hover:bg-[#c0082e] text-white px-8 py-4 text-lg"
              onClick={onStart}
            >
              Criar Meu Perfil
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="mt-4 text-sm text-gray-500">
              Gratuito para sempre • Sem compromisso
            </div>
          </div>
        </CardShell>
      </Section>
    </>
  );
}