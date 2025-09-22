"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Star,
  Clock,
  RefreshCw,
  CheckCircle,
  X
} from 'lucide-react';
import type { ProgramData } from '../../../services/training-programs-simple.service';

interface PricingStepProps {
  data: ProgramData;
  onUpdate: (data: Partial<ProgramData>) => void;
  loading?: boolean;
}

const packageTemplates = [
  {
    name: 'Básico',
    description: 'Programa completo com suporte básico',
    features: [
      'Acesso completo ao programa',
      'PDF com exercícios',
      'Suporte via WhatsApp (horário comercial)'
    ],
    deliveryTime: 1,
    revisions: 1,
    suggested_price: 197
  },
  {
    name: 'Padrão',
    description: 'Programa + acompanhamento personalizado',
    features: [
      'Tudo do pacote Básico',
      'Acompanhamento semanal',
      'Ajustes no programa',
      'Suporte prioritário via WhatsApp',
      'Planilha de evolução'
    ],
    deliveryTime: 1,
    revisions: 2,
    suggested_price: 397
  },
  {
    name: 'Premium',
    description: 'Acompanhamento VIP com máximo suporte',
    features: [
      'Tudo do pacote Padrão',
      'Acompanhamento diário',
      'Videochamadas quinzenais (30min)',
      'Ajustes ilimitados',
      'Suporte 24/7',
      'Grupo VIP de alunos',
      'Bônus: Guia de nutrição'
    ],
    deliveryTime: 1,
    revisions: 'unlimited' as const,
    suggested_price: 697
  }
];

const addOnTemplates = [
  {
    name: 'Plano Nutricional Personalizado',
    description: 'Cardápio completo baseado nos seus objetivos',
    price: 150
  },
  {
    name: 'Videochamada Extra (30min)',
    description: 'Sessão individual para tirar dúvidas',
    price: 80
  },
  {
    name: 'Acompanhamento Estendido (+4 semanas)',
    description: 'Continue o programa por mais 4 semanas',
    price: 200
  },
  {
    name: 'Análise Corporal Detalhada',
    description: 'Avaliação completa com relatório',
    price: 120
  }
];

export function PricingStep({ data, onUpdate, loading }: PricingStepProps) {
  const [newFeature, setNewFeature] = useState('');
  const [editingPackageIndex, setEditingPackageIndex] = useState<number | null>(null);
  
  // Garantir que data existe e tem as propriedades necessárias
  const programData = data || {};
  const packages = Array.isArray(programData.packages) ? programData.packages : [];
  const addOns = Array.isArray(programData.addOns) ? programData.addOns : [];

  // Debug logs
  console.log('🔧 PricingStep - Data recebida:', {
    data: programData,
    packages: packages,
    addOns: addOns,
    packagesLength: packages.length,
    hasOnUpdate: typeof onUpdate === 'function'
  });

  const updatePackage = (index: number, field: string, value: any) => {
    console.log('📝 Atualizando package:', { index, field, value, currentPackages: packages });
    
    const newPackages = [...packages];
    if (!newPackages[index]) {
      newPackages[index] = {
        name: '',
        description: '',
        features: [],
        deliveryTime: 1,
        revisions: 1,
        price: 0
      };
    }
    newPackages[index] = {
      ...newPackages[index],
      [field]: value
    };
    
    console.log('📝 Novo array de packages:', newPackages);
    onUpdate({ packages: newPackages });
  };

  const addFeatureToPackage = (packageIndex: number, feature: string) => {
    if (feature.trim()) {
      const newPackages = [...packages];
      if (!newPackages[packageIndex].features) {
        newPackages[packageIndex].features = [];
      }
      newPackages[packageIndex].features.push(feature.trim());
      onUpdate({ packages: newPackages });
      setNewFeature('');
    }
  };

  const removeFeatureFromPackage = (packageIndex: number, featureIndex: number) => {
    const newPackages = [...packages];
    if (newPackages[packageIndex].features) {
      newPackages[packageIndex].features.splice(featureIndex, 1);
      onUpdate({ packages: newPackages });
    }
  };

  const addPackage = (template?: typeof packageTemplates[0]) => {
    console.log('➕ Adicionando package:', { template, currentPackages: packages });
    
    // Check if template package already exists to avoid duplicates
    if (template) {
      const existingPackage = packages.find(pkg => pkg.name === template.name);
      if (existingPackage) {
        console.log('⚠️ Package já existe, não adicionando duplicata');
        return; // Don't add duplicate
      }
    }

    const newPackage = template || {
      name: 'Novo Pacote',
      description: '',
      features: [],
      deliveryTime: 1,
      revisions: 1,
      price: 0
    };

    const updatedPackages = [...packages, {
      ...newPackage,
      price: template?.suggested_price || 0
    }];
    
    console.log('➕ Novo array com package adicionado:', updatedPackages);
    onUpdate({ packages: updatedPackages });
  };

  const removePackage = (index: number) => {
    const newPackages = packages.filter((_, i) => i !== index);
    onUpdate({ packages: newPackages });
  };

  const addAddon = (template?: typeof addOnTemplates[0]) => {
    const newAddon = template || {
      name: 'Novo Adicional',
      description: '',
      price: 0
    };

    onUpdate({
      addOns: [...addOns, newAddon]
    });
  };

  const updateAddon = (index: number, field: string, value: any) => {
    const newAddons = [...addOns];
    if (!newAddons[index]) {
      newAddons[index] = {
        name: '',
        description: '',
        price: 0
      };
    }
    newAddons[index] = {
      ...newAddons[index],
      [field]: value
    };
    onUpdate({ addOns: newAddons });
  };

  const removeAddon = (index: number) => {
    const newAddons = addOns.filter((_, i) => i !== index);
    onUpdate({ addOns: newAddons });
  };

  return (
    <div className="space-y-6">
      {/* Header with Description */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Configuração de Preços</h2>
        <p className="text-muted-foreground">
          Configure os pacotes de preços para seu programa. Comece com um template ou crie do zero.
        </p>
      </div>

      {/* Step 1: Template Selection (Only show if no packages) */}
      {packages.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Comece com um Template
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Escolha um modelo pré-configurado para acelerar a criação do seu programa
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packageTemplates.map((template, index) => {
                const isBasic = index === 0;
                const isPopular = index === 1;
                const isPremium = index === 2;
                
                return (
                  <div 
                    key={index}
                    className={`relative rounded-lg border-2 transition-all hover:border-primary/50 ${
                      isPopular ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Mais Popular
                        </Badge>
                      </div>
                    )}
                    
                    <div className="p-6 space-y-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">R$ {template.suggested_price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {template.description}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Incluído neste pacote:</h4>
                        <ul className="space-y-1">
                          {template.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                          {template.features.length > 3 && (
                            <li className="text-xs text-muted-foreground">
                              +{template.features.length - 3} benefícios adicionais
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <Button 
                        onClick={() => addPackage(template)}
                        className={`w-full ${
                          isPopular 
                            ? 'bg-primary hover:bg-primary/90' 
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        variant={isPopular ? 'default' : 'secondary'}
                      >
                        Usar este Template
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => addPackage()}
                className="border-gray-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ou criar pacote do zero
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Package Configuration */}
      {packages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Seus Pacotes de Preços
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => addPackage()}
                className="border-gray-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pacote
              </Button>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure e personalize seus pacotes de preços
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              {packages.map((pkg, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Package Header */}
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? 'secondary' : 'outline'}>
                          Pacote {index + 1}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{pkg.name || 'Novo Pacote'}</h4>
                          <p className="text-sm text-muted-foreground">
                            R$ {pkg.price} • {pkg.deliveryTime} dia{pkg.deliveryTime !== 1 ? 's' : ''} para entrega
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePackage(index)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Package Content */}
                  <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`package-name-${index}`}>Nome do Pacote</Label>
                        <Input
                          id={`package-name-${index}`}
                          value={pkg.name || ''}
                          onChange={(e) => updatePackage(index, 'name', e.target.value)}
                          placeholder="Ex: Programa Básico"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`package-price-${index}`}>Preço (R$)</Label>
                        <Input
                          id={`package-price-${index}`}
                          type="number"
                          min="0"
                          value={pkg.price || 0}
                          onChange={(e) => updatePackage(index, 'price', parseInt(e.target.value) || 0)}
                          placeholder="297"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`package-delivery-${index}`}>Tempo de Entrega (dias)</Label>
                        <Select
                          value={(pkg.deliveryTime || 1).toString()}
                          onValueChange={(value) => updatePackage(index, 'deliveryTime', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tempo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 dia (entrega imediata)</SelectItem>
                            <SelectItem value="2">2 dias</SelectItem>
                            <SelectItem value="3">3 dias</SelectItem>
                            <SelectItem value="7">1 semana</SelectItem>
                            <SelectItem value="14">2 semanas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`package-revisions-${index}`}>Número de Revisões</Label>
                        <Select
                          value={(pkg.revisions || 1).toString()}
                          onValueChange={(value) => updatePackage(index, 'revisions', value === 'unlimited' ? 'unlimited' : parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione as revisões" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 revisão</SelectItem>
                            <SelectItem value="2">2 revisões</SelectItem>
                            <SelectItem value="3">3 revisões</SelectItem>
                            <SelectItem value="5">5 revisões</SelectItem>
                            <SelectItem value="unlimited">Revisões ilimitadas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor={`package-description-${index}`}>Descrição do Pacote</Label>
                      <Textarea
                        id={`package-description-${index}`}
                        value={pkg.description || ''}
                        onChange={(e) => updatePackage(index, 'description', e.target.value)}
                        rows={3}
                        className="resize-none"
                        placeholder="Descreva o que o cliente receberá neste pacote..."
                      />
                    </div>

                    {/* Features */}
                    <div>
                      <Label>O que está incluído neste pacote</Label>
                      <div className="mt-3 space-y-3">
                        {pkg.features && pkg.features.length > 0 && (
                          <div className="grid grid-cols-1 gap-2">
                            {pkg.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span className="flex-1 text-sm">{feature}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFeatureFromPackage(index, featureIndex)}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Input
                            value={editingPackageIndex === index ? newFeature : ''}
                            onChange={(e) => setNewFeature(e.target.value)}
                            onFocus={() => setEditingPackageIndex(index)}
                            placeholder="Ex: Acompanhamento via WhatsApp"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addFeatureToPackage(index, newFeature);
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addFeatureToPackage(index, newFeature)}
                            disabled={!newFeature.trim() || editingPackageIndex !== index}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Add-ons (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Serviços Adicionais (Opcional)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ofereça serviços extras que os clientes podem adicionar ao pacote principal
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add-on Templates */}
          {addOns.length === 0 && (
            <div>
              <h4 className="font-medium mb-3">Sugestões de Serviços Adicionais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {addOnTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => addAddon(template)}
                    className="h-auto p-4 flex flex-col items-start gap-2 border-gray-300 hover:border-blue-300"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">{template.name}</span>
                      <Badge variant="secondary">R$ {template.price}</Badge>
                    </div>
                    <p className="text-xs text-left text-muted-foreground">
                      {template.description}
                    </p>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Active Add-ons */}
          {addOns.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Seus Serviços Adicionais</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => addAddon()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Serviço
                </Button>
              </div>
              
              <div className="space-y-4">
                {addOns.map((addon, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Adicional {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAddon(index)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`addon-name-${index}`}>Nome do Serviço</Label>
                        <Input
                          id={`addon-name-${index}`}
                          value={addon.name || ''}
                          onChange={(e) => updateAddon(index, 'name', e.target.value)}
                          placeholder="Ex: Plano Nutricional"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`addon-price-${index}`}>Preço (R$)</Label>
                        <Input
                          id={`addon-price-${index}`}
                          type="number"
                          min="0"
                          value={addon.price || 0}
                          onChange={(e) => updateAddon(index, 'price', parseInt(e.target.value) || 0)}
                          placeholder="150"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`addon-description-${index}`}>Descrição</Label>
                      <Textarea
                        id={`addon-description-${index}`}
                        value={addon.description || ''}
                        onChange={(e) => updateAddon(index, 'description', e.target.value)}
                        rows={2}
                        className="resize-none"
                        placeholder="Descreva o que está incluído neste serviço adicional..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Add-on */}
          {addOns.length === 0 && (
            <div className="text-center pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => addAddon()}
                className="border-gray-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar serviço personalizado
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {(packages.length > 0 || addOns.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resumo da Configuração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-semibold text-blue-600">{packages.length}</div>
                <div className="text-sm text-muted-foreground">
                  Pacote{packages.length !== 1 ? 's' : ''} Principal{packages.length !== 1 ? 'is' : ''}
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-semibold text-green-600">{addOns.length}</div>
                <div className="text-sm text-muted-foreground">
                  Serviço{addOns.length !== 1 ? 's' : ''} Adicional{addOns.length !== 1 ? 'is' : ''}
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-semibold text-purple-600">
                  R$ {packages.reduce((sum, pkg) => sum + (pkg.price || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Valor Base Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}