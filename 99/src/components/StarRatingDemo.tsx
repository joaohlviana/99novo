import { StarRating } from './ui/star-rating';
import { Button } from './ui/button';
import { CardShell } from './layout/CardShell';
import { Section } from './layout/Section';

export function StarRatingDemo({ onNavigateBack }: { onNavigateBack?: () => void }) {
  return (
    <Section>
      <CardShell>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Componente StarRating</h2>
          {onNavigateBack && (
            <Button variant="outline" onClick={onNavigateBack}>
              ← Voltar
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mb-8">
          Componente reutilizável que usa o mesmo padrão de estrela do ModernProgramCard.
        </p>
        
        <div className="space-y-6">
          {/* Tamanhos */}
          <div>
            <h3 className="font-medium mb-4">Tamanhos Disponíveis</h3>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <StarRating rating={4.9} size="sm" />
                <span className="text-xs text-muted-foreground">Small</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <StarRating rating={4.8} size="md" />
                <span className="text-xs text-muted-foreground">Medium</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <StarRating rating={4.7} size="lg" />
                <span className="text-xs text-muted-foreground">Large</span>
              </div>
            </div>
          </div>

          {/* Com e sem valor */}
          <div>
            <h3 className="font-medium mb-4">Com e Sem Valor</h3>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <StarRating rating={4.9} showValue={true} />
                <span className="text-xs text-muted-foreground">Com valor</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <StarRating rating={4.9} showValue={false} />
                <span className="text-xs text-muted-foreground">Só estrela</span>
              </div>
            </div>
          </div>

          {/* Exemplos de uso */}
          <div>
            <h3 className="font-medium mb-4">Exemplos de Uso</h3>
            <div className="space-y-4">
              {/* Card de produto */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Programa de Treino Premium</h4>
                    <p className="text-sm text-muted-foreground">João Silva</p>
                  </div>
                  <StarRating rating={4.9} size="sm" />
                </div>
              </div>

              {/* Lista de avaliações */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <StarRating rating={5.0} size="sm" />
                  <span className="text-sm text-muted-foreground">Maria Santos</span>
                </div>
                <p className="text-sm">Excelente programa! Recomendo muito.</p>
              </div>

              {/* Header de perfil */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <h4 className="font-medium">Carlos Pereira</h4>
                    <div className="flex items-center gap-2">
                      <StarRating rating={4.8} size="sm" />
                      <span className="text-sm text-muted-foreground">• 234 avaliações</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Código de exemplo */}
          <div>
            <h3 className="font-medium mb-4">Como Usar</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-800">
{`import { StarRating } from './ui/star-rating';

// Básico
<StarRating rating={4.9} />

// Tamanhos
<StarRating rating={4.8} size="sm" />
<StarRating rating={4.8} size="md" />
<StarRating rating={4.8} size="lg" />

// Só estrela (sem valor)
<StarRating rating={4.9} showValue={false} />

// Com classe customizada
<StarRating rating={4.9} className="my-custom-class" />`}
              </pre>
            </div>
          </div>
        </div>
      </CardShell>
    </Section>
  );
}