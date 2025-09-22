import { Search } from 'lucide-react';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface TransactionFiltersProps {
  searchTerm: string;
  statusFilter: string;
  periodFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
}

export function TransactionFilters({
  searchTerm,
  statusFilter,
  periodFilter,
  onSearchChange,
  onStatusChange,
  onPeriodChange
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente ou serviço..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full lg:w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="completed">Pago</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="failed">Falhou</SelectItem>
        </SelectContent>
      </Select>
      <Select value={periodFilter} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-full lg:w-48">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Últimos 7 dias</SelectItem>
          <SelectItem value="30d">Últimos 30 dias</SelectItem>
          <SelectItem value="90d">Últimos 90 dias</SelectItem>
          <SelectItem value="1y">Último ano</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}