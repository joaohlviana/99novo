// ARQUIVO DEPRECADO - Mock data removido para melhorar performance
// TODO: Implementar integração real com Supabase para dados financeiros

export interface FinancialData {
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

// Mock data removido - usar dados reais do Supabase