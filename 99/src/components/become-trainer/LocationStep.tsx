import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CepInput } from '../ui/cep-input';
import { MapPin, Home } from 'lucide-react';
import { FormData } from '../BecomeTrainer';

interface LocationStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export function LocationStep({ formData, updateFormData }: LocationStepProps) {
  const [addressData, setAddressData] = useState<any>(null);

  const handleAddressChange = (data: any) => {
    setAddressData(data);
    if (data) {
      // Auto-fill address fields but keep city editable
      updateFormData({
        address: `${data.logradouro}, ${data.bairro}`,
        city: `${data.localidade}, ${data.uf}`,
        cep: data.cep
      });
    } else {
      updateFormData({
        address: '',
        cep: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-medium text-foreground">Localização</h2>
        <p className="text-muted-foreground">Informe onde você atende seus clientes</p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* CEP Section */}
        <div className="p-5 border border-[#e0093e]/20 rounded-lg bg-[#e0093e]/5">
          <CepInput 
            onAddressChange={handleAddressChange}
            className="w-full"
          />
        </div>

        {/* Address Fields */}
        {addressData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auto-filled Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                Endereço
              </Label>
              <Input
                id="address"
                placeholder="Rua, bairro"
                value={formData.address}
                onChange={(e) => updateFormData({ address: e.target.value })}
                className="h-11"
              />
            </div>

            {/* City - Always editable */}
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Cidade *
              </Label>
              <Input
                id="city"
                placeholder="São Paulo, SP"
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Verifique se a cidade está correta
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🗺️ Por que precisamos da localização?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Seus clientes poderão encontrar você facilmente</li>
            <li>• Aparecerá nas buscas por localização</li>
            <li>• Importante para atendimentos presenciais</li>
          </ul>
        </div>
      </div>
    </div>
  );
}