import { Download, Eye } from 'lucide-react';
import { Button } from '../../ui/button';
import { Section } from '../../layout/Section';

export function FinancialHeader() {
  return (
    <Section>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1>Financeiro</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas, transações e relatórios financeiros
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
          <Button variant="brand" className="gap-2">
            <Eye className="h-4 w-4" />
            Ver Extrato
          </Button>
        </div>
      </div>
    </Section>
  );
}