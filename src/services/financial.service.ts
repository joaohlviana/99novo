/**
 * 💰 FINANCIAL SERVICE
 * 
 * Gerencia dados financeiros, transações, pagamentos e analytics.
 * Centraliza toda a lógica financeira da plataforma.
 */

import { ServiceResponse, PaginatedResponse, PaginationParams } from '../types';

// ===============================
// INTERFACES
// ===============================

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'refund' | 'commission';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  description: string;
  category: string;
  subcategory?: string;
  relatedEntity: {
    type: 'program' | 'session' | 'subscription' | 'commission';
    id: string;
    name: string;
  };
  participant: {
    type: 'client' | 'trainer' | 'platform';
    id: string;
    name: string;
    avatar?: string;
  };
  paymentMethod: {
    type: 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'wallet';
    details: string;
  };
  fees: {
    platform: number;
    payment: number;
    total: number;
  };
  netAmount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  dueDate?: string;
  metadata: Record<string, any>;
}

export interface FinancialSummary {
  totalRevenue: number;
  netRevenue: number;
  totalFees: number;
  pendingAmount: number;
  thisMonth: {
    revenue: number;
    transactions: number;
    averageTicket: number;
    growth: number; // percentual vs mês anterior
  };
  lastMonth: {
    revenue: number;
    transactions: number;
    averageTicket: number;
  };
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
    transactions: number;
  }>;
}

export interface PaymentAnalytics {
  totalTransactions: number;
  totalVolume: number;
  averageTicket: number;
  conversionRate: number;
  paymentMethods: Array<{
    method: string;
    count: number;
    volume: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface TransactionFilters {
  type?: Transaction['type'][];
  status?: Transaction['status'][];
  categories?: string[];
  paymentMethods?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  participantId?: string;
  participantType?: 'client' | 'trainer';
}

// ===============================
// MOCK DATA
// ===============================

const mockTransactions: Transaction[] = [
  {
    id: "txn_001",
    type: "income",
    status: "completed",
    amount: 297.00,
    currency: "BRL",
    description: "Compra do programa 'Treino Funcional Completo'",
    category: "Programas",
    subcategory: "Funcional",
    relatedEntity: {
      type: "program",
      id: "program_1",
      name: "Treino Funcional Completo"
    },
    participant: {
      type: "client",
      id: "client_001",
      name: "Ana Silva",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80"
    },
    paymentMethod: {
      type: "pix",
      details: "PIX - Banco do Brasil"
    },
    fees: {
      platform: 14.85, // 5%
      payment: 2.97,   // 1%
      total: 17.82
    },
    netAmount: 279.18,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:32:00Z",
    completedAt: "2024-01-15T10:32:00Z",
    metadata: {
      paymentId: "pix_abc123",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0..."
    }
  },
  {
    id: "txn_002",
    type: "income",
    status: "completed",
    amount: 397.00,
    currency: "BRL",
    description: "Compra do programa 'Hipertrofia Avançada'",
    category: "Programas",
    subcategory: "Musculação",
    relatedEntity: {
      type: "program",
      id: "program_2",
      name: "Hipertrofia Avançada"
    },
    participant: {
      type: "client",
      id: "client_002",
      name: "Carlos Mendes",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
    },
    paymentMethod: {
      type: "credit_card",
      details: "Visa **** 1234"
    },
    fees: {
      platform: 19.85,
      payment: 11.91, // 3% cartão
      total: 31.76
    },
    netAmount: 365.24,
    createdAt: "2024-01-14T15:45:00Z",
    updatedAt: "2024-01-14T15:47:00Z",
    completedAt: "2024-01-14T15:47:00Z",
    metadata: {
      paymentId: "card_xyz789",
      installments: 3
    }
  },
  {
    id: "txn_003",
    type: "income",
    status: "pending",
    amount: 180.00,
    currency: "BRL",
    description: "Sessão de Personal Training",
    category: "Sessões",
    subcategory: "Personal",
    relatedEntity: {
      type: "session",
      id: "session_001",
      name: "Personal Training - Ana Silva"
    },
    participant: {
      type: "client",
      id: "client_001",
      name: "Ana Silva",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80"
    },
    paymentMethod: {
      type: "bank_transfer",
      details: "TED - Itaú"
    },
    fees: {
      platform: 9.00,
      payment: 5.40,
      total: 14.40
    },
    netAmount: 165.60,
    createdAt: "2024-01-16T09:00:00Z",
    updatedAt: "2024-01-16T09:00:00Z",
    dueDate: "2024-01-18T23:59:59Z",
    metadata: {
      sessionDate: "2024-01-20T08:00:00Z"
    }
  },
  {
    id: "txn_004",
    type: "commission",
    status: "completed",
    amount: 50.00,
    currency: "BRL",
    description: "Comissão por indicação",
    category: "Comissões",
    subcategory: "Indicação",
    relatedEntity: {
      type: "commission",
      id: "ref_001",
      name: "Indicação de João Silva"
    },
    participant: {
      type: "trainer",
      id: "trainer_001",
      name: "João Silva",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
    },
    paymentMethod: {
      type: "wallet",
      details: "Carteira digital"
    },
    fees: {
      platform: 0,
      payment: 0,
      total: 0
    },
    netAmount: 50.00,
    createdAt: "2024-01-13T14:20:00Z",
    updatedAt: "2024-01-13T14:20:00Z",
    completedAt: "2024-01-13T14:20:00Z",
    metadata: {
      referralCode: "JOAO2024"
    }
  }
];

// ===============================
// SERVICE IMPLEMENTATION
// ===============================

export class FinancialService {
  private static instance: FinancialService;

  static getInstance(): FinancialService {
    if (!FinancialService.instance) {
      FinancialService.instance = new FinancialService();
    }
    return FinancialService.instance;
  }

  /**
   * Busca transações com filtros e paginação
   */
  async getTransactions(
    filters: TransactionFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<ServiceResponse<PaginatedResponse<Transaction>>> {
    try {
      await this.simulateDelay();

      let filteredTransactions = [...mockTransactions];

      // Aplicar filtros
      if (filters.type && filters.type.length > 0) {
        filteredTransactions = filteredTransactions.filter(t => 
          filters.type!.includes(t.type)
        );
      }

      if (filters.status && filters.status.length > 0) {
        filteredTransactions = filteredTransactions.filter(t => 
          filters.status!.includes(t.status)
        );
      }

      if (filters.categories && filters.categories.length > 0) {
        filteredTransactions = filteredTransactions.filter(t => 
          filters.categories!.includes(t.category)
        );
      }

      if (filters.participantId) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.participant.id === filters.participantId
        );
      }

      if (filters.participantType) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.participant.type === filters.participantType
        );
      }

      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        filteredTransactions = filteredTransactions.filter(t => {
          const transactionDate = new Date(t.createdAt);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      }

      if (filters.amountRange) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.amount >= filters.amountRange!.min && t.amount <= filters.amountRange!.max
        );
      }

      // Ordenação por data (mais recentes primeiro)
      filteredTransactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Paginação
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedData = filteredTransactions.slice(startIndex, endIndex);

      const totalPages = Math.ceil(filteredTransactions.length / pagination.limit);

      return {
        success: true,
        data: {
          data: paginatedData,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: filteredTransactions.length,
            totalPages,
            hasNext: pagination.page < totalPages,
            hasPrev: pagination.page > 1
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Obtém resumo financeiro
   */
  async getFinancialSummary(
    trainerId?: string,
    dateRange?: { start: string; end: string }
  ): Promise<ServiceResponse<FinancialSummary>> {
    try {
      await this.simulateDelay();

      let transactions = [...mockTransactions];

      // Filtrar por treinador se especificado
      if (trainerId) {
        transactions = transactions.filter(t => 
          t.participant.id === trainerId && t.participant.type === 'trainer'
        );
      }

      // Filtrar por data se especificado
      if (dateRange) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        transactions = transactions.filter(t => {
          const transactionDate = new Date(t.createdAt);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      }

      const completedTransactions = transactions.filter(t => t.status === 'completed');
      
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
      const netRevenue = completedTransactions.reduce((sum, t) => sum + t.netAmount, 0);
      const totalFees = completedTransactions.reduce((sum, t) => sum + t.fees.total, 0);
      const pendingAmount = transactions.filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

      // Dados do mês atual
      const currentMonth = new Date();
      const thisMonthTransactions = completedTransactions.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate.getMonth() === currentMonth.getMonth() &&
               transactionDate.getFullYear() === currentMonth.getFullYear();
      });

      const thisMonthRevenue = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
      const thisMonthCount = thisMonthTransactions.length;
      const thisMonthAverage = thisMonthCount > 0 ? thisMonthRevenue / thisMonthCount : 0;

      // Dados do mês anterior
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
      const lastMonthTransactions = completedTransactions.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate.getMonth() === lastMonth.getMonth() &&
               transactionDate.getFullYear() === lastMonth.getFullYear();
      });

      const lastMonthRevenue = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
      const lastMonthCount = lastMonthTransactions.length;
      const lastMonthAverage = lastMonthCount > 0 ? lastMonthRevenue / lastMonthCount : 0;

      const growth = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // Top categorias
      const categoryMap = new Map<string, { amount: number; count: number }>();
      completedTransactions.forEach(t => {
        const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
        categoryMap.set(t.category, {
          amount: existing.amount + t.amount,
          count: existing.count + 1
        });
      });

      const topCategories = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          amount: data.amount,
          percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0,
          transactions: data.count
        }))
        .sort((a, b) => b.amount - a.amount);

      return {
        success: true,
        data: {
          totalRevenue,
          netRevenue,
          totalFees,
          pendingAmount,
          thisMonth: {
            revenue: thisMonthRevenue,
            transactions: thisMonthCount,
            averageTicket: thisMonthAverage,
            growth
          },
          lastMonth: {
            revenue: lastMonthRevenue,
            transactions: lastMonthCount,
            averageTicket: lastMonthAverage
          },
          topCategories
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Obtém analytics de pagamento
   */
  async getPaymentAnalytics(
    dateRange?: { start: string; end: string }
  ): Promise<ServiceResponse<PaymentAnalytics>> {
    try {
      await this.simulateDelay();

      let transactions = [...mockTransactions];

      if (dateRange) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        transactions = transactions.filter(t => {
          const transactionDate = new Date(t.createdAt);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      }

      const totalTransactions = transactions.length;
      const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
      const averageTicket = totalTransactions > 0 ? totalVolume / totalTransactions : 0;
      
      // Mock conversion rate
      const conversionRate = 0.78; // 78%

      // Métodos de pagamento
      const paymentMethodMap = new Map<string, { count: number; volume: number }>();
      transactions.forEach(t => {
        const method = t.paymentMethod.type;
        const existing = paymentMethodMap.get(method) || { count: 0, volume: 0 };
        paymentMethodMap.set(method, {
          count: existing.count + 1,
          volume: existing.volume + t.amount
        });
      });

      const paymentMethods = Array.from(paymentMethodMap.entries())
        .map(([method, data]) => ({
          method,
          count: data.count,
          volume: data.volume,
          percentage: totalTransactions > 0 ? (data.count / totalTransactions) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Tendência mensal (últimos 6 meses)
      const monthlyTrend: Array<{ month: string; revenue: number; transactions: number }> = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        const monthTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.createdAt);
          return transactionDate.getMonth() === date.getMonth() &&
                 transactionDate.getFullYear() === date.getFullYear();
        });

        monthlyTrend.push({
          month: monthStr,
          revenue: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
          transactions: monthTransactions.length
        });
      }

      // Status breakdown
      const statusMap = new Map<string, number>();
      transactions.forEach(t => {
        statusMap.set(t.status, (statusMap.get(t.status) || 0) + 1);
      });

      const statusBreakdown = Array.from(statusMap.entries())
        .map(([status, count]) => ({
          status,
          count,
          percentage: totalTransactions > 0 ? (count / totalTransactions) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      return {
        success: true,
        data: {
          totalTransactions,
          totalVolume,
          averageTicket,
          conversionRate,
          paymentMethods,
          monthlyTrend,
          statusBreakdown
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Cria uma nova transação
   */
  async createTransaction(data: Partial<Transaction>): Promise<ServiceResponse<Transaction>> {
    try {
      await this.simulateDelay();

      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: data.type || 'income',
        status: 'pending',
        amount: data.amount || 0,
        currency: data.currency || 'BRL',
        description: data.description || '',
        category: data.category || 'Geral',
        subcategory: data.subcategory,
        relatedEntity: data.relatedEntity!,
        participant: data.participant!,
        paymentMethod: data.paymentMethod!,
        fees: {
          platform: (data.amount || 0) * 0.05, // 5%
          payment: (data.amount || 0) * 0.01,  // 1%
          total: (data.amount || 0) * 0.06
        },
        netAmount: (data.amount || 0) * 0.94,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: data.metadata || {}
      };

      // Simular salvamento
      mockTransactions.unshift(newTransaction);

      return {
        success: true,
        data: newTransaction,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===============================
  // MÉTODOS PRIVADOS
  // ===============================

  private async simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `fin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private handleError(error: any): ServiceResponse<any> {
    console.error('FinancialService Error:', error);
    return {
      success: false,
      error: {
        code: 'FINANCIAL_ERROR',
        message: 'Erro interno no sistema financeiro',
        details: error.message
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }
}

// Export singleton instance
export const financialService = FinancialService.getInstance();