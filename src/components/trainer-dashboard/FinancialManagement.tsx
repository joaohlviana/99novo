import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ContentGrid } from '../layout/ContentGrid';
import { Main } from '../layout/Main';
import { Section } from '../layout/Section';
import { CardShell } from '../layout/CardShell';
import { LoadingSpinner } from '../ui/loading-spinner';

// Import financial components
import { FinancialHeader } from './financial/FinancialHeader';
import { FinancialOverviewCards } from './financial/FinancialOverviewCards';
import { TransactionsTab } from './financial/TransactionsTab';
import { AnalyticsTab } from './financial/AnalyticsTab';
import { SettingsTab } from './financial/SettingsTab';

// Interface para dados financeiros reais
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
  transactions: Array<{
    id: string;
    client: string;
    service: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    date: string;
    method: string;
  }>;
}

export function FinancialManagement() {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implementar integração real com Supabase para dados financeiros
    // Por enquanto, usar dados básicos para evitar timeout
    const loadFinancialData = async () => {
      try {
        // Simulação de dados básicos sem mock pesado
        const basicData: FinancialData = {
          revenue: {
            thisMonth: 0,
            lastMonth: 0,
            growth: 0
          },
          pending: {
            amount: 0,
            count: 0
          },
          completed: {
            amount: 0,
            count: 0
          },
          transactions: []
        };

        setFinancialData(basicData);
      } catch (err) {
        console.error('🚨 Erro ao carregar dados financeiros:', err);
        setError('Erro ao carregar dados financeiros');
      } finally {
        setLoading(false);
      }
    };

    loadFinancialData();
  }, []);

  if (loading) {
    return (
      <ContentGrid>
        <Main>
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </Main>
      </ContentGrid>
    );
  }

  if (error || !financialData) {
    return (
      <ContentGrid>
        <Main>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Erro ao carregar dados financeiros</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error || 'Dados não disponíveis'}
            </p>
          </div>
        </Main>
      </ContentGrid>
    );
  }

  return (
    <ContentGrid>
      <Main>
        <FinancialHeader />
        
        <FinancialOverviewCards data={financialData} />

        <Section>
          <CardShell>
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transactions">Transações</TabsTrigger>
                <TabsTrigger value="analytics">Relatórios</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-6">
                <TransactionsTab transactions={financialData.transactions} />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsTab />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <SettingsTab />
              </TabsContent>
            </Tabs>
          </CardShell>
        </Section>
      </Main>
    </ContentGrid>
  );
}