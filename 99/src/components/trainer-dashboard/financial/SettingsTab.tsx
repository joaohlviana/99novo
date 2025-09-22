import { CreditCard } from 'lucide-react';
import { Button } from '../../ui/button';

export function SettingsTab() {
  return (
    <div className="text-center py-12">
      <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-2">Configurações de Pagamento</h3>
      <p className="text-muted-foreground mb-6">
        Configure métodos de pagamento, taxas e preferências de recebimento
      </p>
      <Button variant="brand">Em Breve</Button>
    </div>
  );
}