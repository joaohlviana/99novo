"use client";

import { useState } from 'react';
import { Input } from './input';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Label } from './label';

interface AddressData {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  complemento?: string;
}

interface CepInputProps {
  onAddressChange: (address: AddressData | null) => void;
  className?: string;
}

export function CepInput({ onAddressChange, className }: CepInputProps) {
  const [cep, setCep] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');

  const formatCep = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const truncatedValue = numericValue.slice(0, 8);
    
    if (truncatedValue.length <= 5) {
      return truncatedValue;
    }
    
    return `${truncatedValue.slice(0, 5)}-${truncatedValue.slice(5)}`;
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCep(value);
    const cleanValue = value.replace(/\D/g, '');
    
    setCep(formatted);
    setIsValid(null);
    setError('');
    
    // Reset address data when CEP changes
    onAddressChange(null);
    
    // Auto-search when CEP is complete (8 digits)
    if (cleanValue.length === 8) {
      // Use setTimeout to ensure state is updated before search
      setTimeout(() => {
        searchCep(formatted);
      }, 100);
    }
  };

  const searchCep = async (cepValue?: string) => {
    const currentCep = cepValue || cep;
    const cleanCep = currentCep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      setError('CEP deve ter 8 dígitos');
      setIsValid(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        setIsValid(false);
        onAddressChange(null);
      } else {
        setIsValid(true);
        const addressData: AddressData = {
          cep: data.cep,
          logradouro: data.logradouro,
          bairro: data.bairro,
          localidade: data.localidade,
          uf: data.uf,
          complemento: data.complemento
        };
        onAddressChange(addressData);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setError('Erro ao buscar CEP. Tente novamente.');
      setIsValid(false);
      onAddressChange(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        searchCep();
      }
    }
  };

  return (
    <div className={className}>
      <Label htmlFor="cep" className="text-sm font-medium">
        CEP *
      </Label>
      <div className="relative mt-1">
        <Input
          id="cep"
          type="text"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => handleCepChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`
            pr-10
            ${isValid === true ? 'border-green-500 focus:border-green-500' : ''}
            ${isValid === false ? 'border-red-500 focus:border-red-500' : ''}
          `}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : isValid === true ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : isValid === false ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : null}
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}