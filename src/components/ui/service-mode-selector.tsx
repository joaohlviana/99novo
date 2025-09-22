import { Checkbox } from './checkbox';
import { Label } from './label';
import { Badge } from './badge';
import { Monitor, MapPin } from 'lucide-react';

interface ServiceModeSelectorProps {
  selectedModes: string[];
  onModesChange: (modes: string[]) => void;
}

const serviceOptions = [
  {
    id: 'online',
    label: 'Online',
    description: 'Treinos e acompanhamento à distância',
    icon: Monitor
  },
  {
    id: 'presencial',
    label: 'Presencial',
    description: 'Atendimento presencial em locais físicos',
    icon: MapPin
  }
];

export function ServiceModeSelector({ selectedModes, onModesChange }: ServiceModeSelectorProps) {
  const handleModeChange = (modeId: string, checked: boolean) => {
    if (checked) {
      onModesChange([...selectedModes, modeId]);
    } else {
      onModesChange(selectedModes.filter(mode => mode !== modeId));
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected modes display */}
      {selectedModes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedModes.map((mode) => {
            const option = serviceOptions.find(opt => opt.id === mode);
            if (!option) return null;
            
            const IconComponent = option.icon;
            return (
              <Badge 
                key={mode} 
                variant="secondary" 
                className="flex items-center gap-2 px-3 py-1 text-sm"
              >
                <IconComponent className="w-3 h-3" />
                <span>{option.label}</span>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Mode selection options */}
      <div className="space-y-3">
        {serviceOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedModes.includes(option.id);
          
          return (
            <div 
              key={option.id}
              className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${
                isSelected ? 'bg-accent/50 border-primary/20' : 'hover:bg-accent/30'
              }`}
            >
              <Checkbox
                id={option.id}
                checked={isSelected}
                onCheckedChange={(checked) => handleModeChange(option.id, checked as boolean)}
                className="mt-0.5"
              />
              <div className="flex-1 space-y-1">
                <Label 
                  htmlFor={option.id} 
                  className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                >
                  <IconComponent className="w-4 h-4" />
                  {option.label}
                </Label>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedModes.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          Selecione pelo menos uma modalidade de atendimento
        </p>
      )}
    </div>
  );
}