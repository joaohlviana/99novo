import { TrendingUp } from 'lucide-react';
import { Button } from '../../ui/button';

export function AnalyticsTab() {
  return (
    <div className="text-center py-12">
      <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-2">Relatórios Financeiros</h3>
      <p className="text-muted-foreground mb-6">
        Visualize gráficos detalhados de receita, crescimento e performance financeira
      </p>
      <Button variant="brand">Em Breve</Button>
    </div>
  );
}