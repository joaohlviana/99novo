import Skeleton, { SkeletonTheme } from 'react-loading-skeleton@3.3.1';
import 'react-loading-skeleton@3.3.1/dist/skeleton.css';
import { Card, CardContent } from './ui/card';
import { Section } from './layout/Section';
import { CardShell } from './layout/CardShell';
import { Button } from './ui/button';
import { useState } from 'react';

interface SkeletonDemoProps {
  onNavigateBack: () => void;
}

export function SkeletonDemo({ onNavigateBack }: SkeletonDemoProps) {
  const [showSkeleton, setShowSkeleton] = useState(true);

  const TrainerCardSkeleton = () => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Skeleton circle height={64} width={64} />
          <div className="flex-1">
            <Skeleton height={20} width="70%" className="mb-2" />
            <Skeleton height={16} width="50%" className="mb-1" />
            <Skeleton height={16} width="60%" />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton height={24} width={80} />
            <Skeleton height={24} width={60} />
            <Skeleton height={24} width={70} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Skeleton height={16} width={40} />
              <Skeleton height={16} width={30} />
            </div>
            <div className="flex gap-1">
              <Skeleton circle height={16} width={16} />
              <Skeleton circle height={16} width={16} />
            </div>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton height={20} width={80} />
                <Skeleton height={14} width={60} />
              </div>
              <Skeleton height={32} width={100} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProgramCardSkeleton = () => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-0">
        <Skeleton height={200} className="rounded-t-lg" />
        
        <div className="p-6">
          <div className="mb-3">
            <Skeleton height={20} width="80%" className="mb-1" />
            <Skeleton height={16} width="50%" />
          </div>
          
          <div className="flex items-center gap-4 mb-3">
            <Skeleton height={16} width={60} />
            <Skeleton height={16} width={80} />
            <Skeleton height={16} width={40} />
          </div>
          
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton height={20} width={80} />
                  <Skeleton height={16} width={60} />
                </div>
                <Skeleton height={12} width={90} />
              </div>
              <Skeleton height={32} width={100} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const HeaderSkeleton = () => (
    <div className="p-6 rounded-3xl bg-card">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="relative">
          <Skeleton circle height={120} width={120} />
        </div>
        
        <div className="flex-1">
          <div className="mb-4">
            <Skeleton height={28} width="60%" className="mb-2" />
            <Skeleton height={20} width="40%" className="mb-3" />
            <div className="flex items-center gap-4 mb-3">
              <Skeleton height={16} width={80} />
              <Skeleton height={16} width={100} />
            </div>
          </div>
          
          <Skeleton height={16} width="90%" className="mb-2" />
          <Skeleton height={16} width="85%" className="mb-4" />
          
          <div className="flex gap-2 mb-4">
            <Skeleton height={24} width={80} />
            <Skeleton height={24} width={60} />
            <Skeleton height={24} width={70} />
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton height={20} width={40} className="mb-1" />
                <Skeleton height={14} width={60} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const DashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton height={14} width={80} className="mb-2" />
                  <Skeleton height={24} width={60} />
                </div>
                <Skeleton circle height={40} width={40} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Chart Area */}
      <Card>
        <CardContent className="p-6">
          <Skeleton height={20} width={200} className="mb-4" />
          <Skeleton height={300} />
        </CardContent>
      </Card>
      
      {/* Table */}
      <Card>
        <CardContent className="p-6">
          <Skeleton height={20} width={150} className="mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton circle height={40} width={40} />
                <div className="flex-1">
                  <Skeleton height={16} width="70%" className="mb-1" />
                  <Skeleton height={14} width="50%" />
                </div>
                <Skeleton height={16} width={80} />
                <Skeleton height={32} width={80} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <SkeletonTheme 
      baseColor="var(--muted)" 
      highlightColor="var(--background)"
      borderRadius="0.625rem"
    >
      <div className="min-h-screen bg-background">
        <Section>
          <CardShell>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold mb-4">React Loading Skeleton Demo</h1>
              <p className="text-muted-foreground mb-6">
                Demonstração dos componentes de skeleton loading para melhorar a experiência do usuário durante o carregamento.
              </p>
              
              <div className="flex justify-center gap-4 mb-8">
                <Button 
                  variant={showSkeleton ? "default" : "outline"}
                  onClick={() => setShowSkeleton(true)}
                >
                  Ver Skeletons
                </Button>
                <Button 
                  variant={!showSkeleton ? "default" : "outline"}
                  onClick={() => setShowSkeleton(false)}
                >
                  Ver Conteúdo
                </Button>
                <Button variant="outline" onClick={onNavigateBack}>
                  ← Voltar
                </Button>
              </div>
            </div>
          </CardShell>
        </Section>

        {showSkeleton ? (
          <>
            {/* Header Skeleton */}
            <Section>
              <CardShell>
                <h2 className="text-xl font-semibold mb-4">Header do Treinador - Skeleton</h2>
                <HeaderSkeleton />
              </CardShell>
            </Section>

            {/* Trainer Cards Skeleton */}
            <Section>
              <CardShell>
                <h2 className="text-xl font-semibold mb-4">Cards de Treinadores - Skeleton</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <TrainerCardSkeleton />
                  <TrainerCardSkeleton />
                  <TrainerCardSkeleton />
                </div>
              </CardShell>
            </Section>

            {/* Program Cards Skeleton */}
            <Section>
              <CardShell>
                <h2 className="text-xl font-semibold mb-4">Cards de Programas - Skeleton</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ProgramCardSkeleton />
                  <ProgramCardSkeleton />
                  <ProgramCardSkeleton />
                </div>
              </CardShell>
            </Section>

            {/* Dashboard Skeleton */}
            <Section>
              <CardShell>
                <h2 className="text-xl font-semibold mb-4">Dashboard - Skeleton</h2>
                <DashboardSkeleton />
              </CardShell>
            </Section>
          </>
        ) : (
          <Section>
            <CardShell>
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">Conteúdo Carregado</h2>
                <p className="text-muted-foreground mb-6">
                  Aqui seria exibido o conteúdo real após o carregamento.
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardShell>
          </Section>
        )}

        {/* Implementation Examples */}
        <Section>
          <CardShell>
            <h2 className="text-xl font-semibold mb-4">Como Implementar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Skeleton Simples</h3>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <code className="text-sm">
                    {`<Skeleton height={20} width="70%" />`}
                  </code>
                </div>
                <Skeleton height={20} width="70%" />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Skeleton Circular</h3>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <code className="text-sm">
                    {`<Skeleton circle height={64} width={64} />`}
                  </code>
                </div>
                <Skeleton circle height={64} width={64} />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Múltiplos Skeletons</h3>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <code className="text-sm">
                    {`<Skeleton count={3} height={16} />`}
                  </code>
                </div>
                <Skeleton count={3} height={16} />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Skeleton com Theme</h3>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <code className="text-sm">
                    {`<SkeletonTheme baseColor="#f3f3f5" highlightColor="#fff">`}
                  </code>
                </div>
                <SkeletonTheme baseColor="#f3f3f5" highlightColor="#fff">
                  <Skeleton height={20} width="80%" />
                </SkeletonTheme>
              </div>
            </div>
          </CardShell>
        </Section>

        {/* Usage Guidelines */}
        <Section>
          <CardShell>
            <h2 className="text-xl font-semibold mb-4">Diretrizes de Uso</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <h3 className="font-medium mb-2 text-blue-700 dark:text-blue-300">📏 Dimensões</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Use dimensões similares ao conteúdo real para manter o layout consistente.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                <h3 className="font-medium mb-2 text-green-700 dark:text-green-300">⚡ Performance</h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Skeletons melhoram a percepção de performance, mas use com moderação.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <h3 className="font-medium mb-2 text-purple-700 dark:text-purple-300">🎨 Personalização</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Use SkeletonTheme para manter consistência visual com seu design system.
                </p>
              </div>
            </div>
          </CardShell>
        </Section>
      </div>
    </SkeletonTheme>
  );
}