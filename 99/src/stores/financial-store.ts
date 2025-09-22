import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  financialService,
  Transaction,
  FinancialSummary,
  PaymentAnalytics,
  TransactionFilters
} from '../services/financial.service';
import { PaginationParams, PaginatedResponse } from '../services';

interface FinancialState {
  // Data
  transactions: Transaction[];
  summary: FinancialSummary | null;
  analytics: PaymentAnalytics | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  
  // UI State
  loading: {
    transactions: boolean;
    summary: boolean;
    analytics: boolean;
    creating: boolean;
  };
  errors: {
    transactions?: string;
    summary?: string;
    analytics?: string;
    creating?: string;
  };
  
  // Filters & Search
  filters: TransactionFilters;
  searchQuery: string;
  
  // Selected items
  selectedTransaction: Transaction | null;
  selectedDateRange: { start: string; end: string } | null;
  
  // Dashboard preferences
  dashboardPeriod: 'week' | 'month' | 'quarter' | 'year';
  preferredCurrency: string;
  showNetAmounts: boolean;
}

interface FinancialActions {
  // Transactions
  loadTransactions: (filters?: TransactionFilters, pagination?: PaginationParams, refresh?: boolean) => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  createTransaction: (data: Partial<Transaction>) => Promise<Transaction | null>;
  setSelectedTransaction: (transaction: Transaction | null) => void;
  
  // Summary & Analytics
  loadSummary: (trainerId?: string, dateRange?: { start: string; end: string }) => Promise<void>;
  loadAnalytics: (dateRange?: { start: string; end: string }) => Promise<void>;
  
  // Filters & Search
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  setDateRange: (range: { start: string; end: string } | null) => void;
  
  // Dashboard preferences
  setDashboardPeriod: (period: FinancialState['dashboardPeriod']) => void;
  setPreferredCurrency: (currency: string) => void;
  setShowNetAmounts: (show: boolean) => void;
  
  // Computed values
  getFilteredTransactions: () => Transaction[];
  getTotalRevenue: (period?: string) => number;
  getAverageTicket: (period?: string) => number;
  getTransactionsByCategory: () => Record<string, Transaction[]>;
  getRecentTransactions: (limit?: number) => Transaction[];
  
  // Utilities
  exportTransactions: (format: 'csv' | 'xlsx' | 'pdf') => Promise<void>;
  clearErrors: () => void;
  resetState: () => void;
}

const initialState: FinancialState = {
  transactions: [],
  summary: null,
  analytics: null,
  pagination: null,
  loading: {
    transactions: false,
    summary: false,
    analytics: false,
    creating: false,
  },
  errors: {},
  filters: {},
  searchQuery: '',
  selectedTransaction: null,
  selectedDateRange: null,
  dashboardPeriod: 'month',
  preferredCurrency: 'BRL',
  showNetAmounts: true,
};

export const useFinancialStore = create<FinancialState & FinancialActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Transactions
    loadTransactions: async (filters?: TransactionFilters, pagination?: PaginationParams, refresh: boolean = false) => {
      // Don't reload if already loaded and not refreshing
      if (!refresh && get().transactions.length > 0 && !filters && !pagination) return;

      set(state => ({ 
        ...state, 
        loading: { ...state.loading, transactions: true },
        errors: { ...state.errors, transactions: undefined }
      }));

      try {
        const currentFilters = { ...get().filters, ...filters };
        const currentPagination = pagination || { page: 1, limit: 20 };
        
        const response = await financialService.getTransactions(currentFilters, currentPagination);
        
        if (response.success && response.data) {
          const { data, pagination: paginationInfo } = response.data;
          
          set(state => ({ 
            ...state, 
            transactions: refresh || currentPagination.page === 1 ? data : [...state.transactions, ...data],
            pagination: paginationInfo,
            loading: { ...state.loading, transactions: false }
          }));
        } else {
          throw new Error(response.error?.message || 'Erro ao carregar transações');
        }
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, transactions: false },
          errors: { ...state.errors, transactions: error instanceof Error ? error.message : 'Erro ao carregar transações' }
        }));
      }
    },

    loadMoreTransactions: async () => {
      const { pagination, loading } = get();
      
      if (!pagination?.hasNext || loading.transactions) return;

      await get().loadTransactions(undefined, {
        page: pagination.page + 1,
        limit: pagination.limit
      });
    },

    createTransaction: async (data: Partial<Transaction>) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, creating: true },
        errors: { ...state.errors, creating: undefined }
      }));

      try {
        const response = await financialService.createTransaction(data);
        
        if (response.success && response.data) {
          set(state => ({
            ...state,
            transactions: [response.data!, ...state.transactions],
            loading: { ...state.loading, creating: false }
          }));
          
          // Reload summary to reflect changes
          get().loadSummary();
          
          return response.data;
        } else {
          throw new Error(response.error?.message || 'Erro ao criar transação');
        }
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, creating: false },
          errors: { ...state.errors, creating: error instanceof Error ? error.message : 'Erro ao criar transação' }
        }));
        return null;
      }
    },

    setSelectedTransaction: (transaction: Transaction | null) => {
      set({ selectedTransaction: transaction });
    },

    // Summary & Analytics
    loadSummary: async (trainerId?: string, dateRange?: { start: string; end: string }) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, summary: true },
        errors: { ...state.errors, summary: undefined }
      }));

      try {
        const response = await financialService.getFinancialSummary(trainerId, dateRange || get().selectedDateRange || undefined);
        
        if (response.success && response.data) {
          set(state => ({ 
            ...state, 
            summary: response.data!,
            loading: { ...state.loading, summary: false }
          }));
        } else {
          throw new Error(response.error?.message || 'Erro ao carregar resumo financeiro');
        }
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, summary: false },
          errors: { ...state.errors, summary: error instanceof Error ? error.message : 'Erro ao carregar resumo financeiro' }
        }));
      }
    },

    loadAnalytics: async (dateRange?: { start: string; end: string }) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, analytics: true },
        errors: { ...state.errors, analytics: undefined }
      }));

      try {
        const response = await financialService.getPaymentAnalytics(dateRange || get().selectedDateRange || undefined);
        
        if (response.success && response.data) {
          set(state => ({ 
            ...state, 
            analytics: response.data!,
            loading: { ...state.loading, analytics: false }
          }));
        } else {
          throw new Error(response.error?.message || 'Erro ao carregar analytics');
        }
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, analytics: false },
          errors: { ...state.errors, analytics: error instanceof Error ? error.message : 'Erro ao carregar analytics' }
        }));
      }
    },

    // Filters & Search
    setFilters: (filters: Partial<TransactionFilters>) => {
      set(state => ({
        ...state,
        filters: { ...state.filters, ...filters }
      }));
      
      // Reload transactions with new filters
      get().loadTransactions(get().filters, { page: 1, limit: 20 }, true);
    },

    clearFilters: () => {
      set(state => ({ ...state, filters: {} }));
      get().loadTransactions({}, { page: 1, limit: 20 }, true);
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    setDateRange: (range: { start: string; end: string } | null) => {
      set({ selectedDateRange: range });
      
      // Reload data with new date range
      if (range) {
        get().loadSummary(undefined, range);
        get().loadAnalytics(range);
      }
    },

    // Dashboard preferences
    setDashboardPeriod: (period: FinancialState['dashboardPeriod']) => {
      set({ dashboardPeriod: period });
      
      // Calculate date range based on period
      const now = new Date();
      let start: Date;
      
      switch (period) {
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          start = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      const dateRange = {
        start: start.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      };
      
      get().setDateRange(dateRange);
    },

    setPreferredCurrency: (currency: string) => {
      set({ preferredCurrency: currency });
      // Save to localStorage
      localStorage.setItem('financial-preferred-currency', currency);
    },

    setShowNetAmounts: (show: boolean) => {
      set({ showNetAmounts: show });
      // Save to localStorage
      localStorage.setItem('financial-show-net-amounts', String(show));
    },

    // Computed values
    getFilteredTransactions: () => {
      const { transactions, searchQuery, filters } = get();
      let filtered = [...transactions];
      
      // Apply search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(t =>
          t.description.toLowerCase().includes(query) ||
          t.participant.name.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    },

    getTotalRevenue: (period?: string) => {
      const transactions = get().getFilteredTransactions();
      const { showNetAmounts } = get();
      
      return transactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((total, t) => total + (showNetAmounts ? t.netAmount : t.amount), 0);
    },

    getAverageTicket: (period?: string) => {
      const transactions = get().getFilteredTransactions();
      const revenue = get().getTotalRevenue(period);
      const count = transactions.filter(t => t.type === 'income' && t.status === 'completed').length;
      
      return count > 0 ? revenue / count : 0;
    },

    getTransactionsByCategory: () => {
      const transactions = get().getFilteredTransactions();
      const byCategory: Record<string, Transaction[]> = {};
      
      transactions.forEach(t => {
        if (!byCategory[t.category]) {
          byCategory[t.category] = [];
        }
        byCategory[t.category].push(t);
      });
      
      return byCategory;
    },

    getRecentTransactions: (limit: number = 10) => {
      return get().transactions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    },

    // Utilities
    exportTransactions: async (format: 'csv' | 'xlsx' | 'pdf') => {
      try {
        const transactions = get().getFilteredTransactions();
        
        // This would be implemented with actual export logic
        console.log(`Exporting ${transactions.length} transactions as ${format.toUpperCase()}`);
        
        // Mock implementation - in real app would generate actual files
        const data = transactions.map(t => ({
          ID: t.id,
          Data: new Date(t.createdAt).toLocaleDateString('pt-BR'),
          Tipo: t.type,
          Status: t.status,
          Valor: t.amount,
          'Valor Líquido': t.netAmount,
          Descrição: t.description,
          Categoria: t.category,
          Participante: t.participant.name,
          'Método de Pagamento': t.paymentMethod.details
        }));
        
        // In real implementation, would use libraries like xlsx or jsPDF
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transacoes_${new Date().toISOString().split('T')[0]}.${format === 'xlsx' ? 'json' : format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('Error exporting transactions:', error);
      }
    },

    clearErrors: () => {
      set(state => ({ ...state, errors: {} }));
    },

    resetState: () => {
      set(initialState);
    },
  }))
);

// Initialize preferences from localStorage
if (typeof window !== 'undefined') {
  const currency = localStorage.getItem('financial-preferred-currency');
  const showNet = localStorage.getItem('financial-show-net-amounts');
  
  if (currency) {
    useFinancialStore.getState().setPreferredCurrency(currency);
  }
  
  if (showNet !== null) {
    useFinancialStore.getState().setShowNetAmounts(showNet === 'true');
  }
}

// Selectors for performance optimization
export const useTransactions = () => useFinancialStore(state => state.transactions);
export const useFinancialSummary = () => useFinancialStore(state => state.summary);
export const usePaymentAnalytics = () => useFinancialStore(state => state.analytics);
export const useFinancialLoading = () => useFinancialStore(state => state.loading);
export const useFinancialErrors = () => useFinancialStore(state => state.errors);
export const useSelectedTransaction = () => useFinancialStore(state => state.selectedTransaction);
export const useTransactionFilters = () => useFinancialStore(state => state.filters);
export const useFinancialPagination = () => useFinancialStore(state => state.pagination);

// Computed selectors
export const useRecentTransactions = (limit?: number) => 
  useFinancialStore(state => state.getRecentTransactions(limit));
export const useTotalRevenue = (period?: string) => 
  useFinancialStore(state => state.getTotalRevenue(period));
export const useAverageTicket = (period?: string) => 
  useFinancialStore(state => state.getAverageTicket(period));
export const useTransactionsByCategory = () => 
  useFinancialStore(state => state.getTransactionsByCategory());