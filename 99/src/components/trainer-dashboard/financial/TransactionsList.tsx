import { MoreHorizontal, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';

export interface Transaction {
  id: string;
  client: string;
  service: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  method: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Pago';
    case 'pending': return 'Pendente';
    case 'failed': return 'Falhou';
    default: return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'pending': return Clock;
    case 'failed': return AlertCircle;
    default: return CheckCircle;
  }
};

export function TransactionsList({ transactions }: TransactionsListProps) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const StatusIcon = getStatusIcon(transaction.status);
        return (
          <div key={transaction.id} className="border rounded-xl p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatusColor(transaction.status)}`}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{transaction.client}</p>
                  <p className="text-sm text-muted-foreground">{transaction.service}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">R$ {transaction.amount}</p>
                  <p className="text-sm text-muted-foreground">{transaction.method}</p>
                </div>
                <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                  {getStatusLabel(transaction.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                    <DropdownMenuItem>Reenviar Cobrança</DropdownMenuItem>
                    <DropdownMenuItem>Exportar Comprovante</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}