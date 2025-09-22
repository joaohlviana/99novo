import { useState } from 'react';
import { TransactionFilters } from './TransactionFilters';
import { TransactionsList, type Transaction } from './TransactionsList';

interface TransactionsTabProps {
  transactions: Transaction[];
}

export function TransactionsTab({ transactions }: TransactionsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('30d');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <TransactionFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        periodFilter={periodFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onPeriodChange={setPeriodFilter}
      />
      <TransactionsList transactions={filteredTransactions} />
    </div>
  );
}