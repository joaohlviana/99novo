import { TrendingUp, Clock, DollarSign, ArrowUpRight } from 'lucide-react';
import { Section } from '../../layout/Section';
import { CardShell } from '../../layout/CardShell';

interface FinancialData {
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  pending: {
    amount: number;
    count: number;
  };
  completed: {
    amount: number;
    count: number;
  };
}

interface FinancialOverviewCardsProps {
  data: FinancialData;
}

export function FinancialOverviewCards({ data }: FinancialOverviewCardsProps) {
  return (
    <Section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardShell>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receita Este Mês</p>
              <p className="text-2xl font-semibold">R$ {data.revenue.thisMonth.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+{data.revenue.growth}%</span>
                <span className="text-sm text-muted-foreground">vs mês anterior</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardShell>

        <CardShell>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
              <p className="text-2xl font-semibold">R$ {data.pending.amount.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-muted-foreground">{data.pending.count} transações</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </CardShell>

        <CardShell>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Recebido Este Mês</p>
              <p className="text-2xl font-semibold">R$ {data.completed.amount.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-muted-foreground">{data.completed.count} transações</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardShell>
      </div>
    </Section>
  );
}