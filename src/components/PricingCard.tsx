import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { MessageCircle, Clock, MapPin, CheckCircle } from 'lucide-react';

interface PricingOption {
  type: string;
  description: string;
  price: string;
  period?: string;
  details?: {
    duration: string;
    location: string;
    includes: string[];
    ideal_for: string;
  };
}

interface PricingCardProps {
  basePrice: string;
  options: PricingOption[];
}

export function PricingCard({ basePrice, options }: PricingCardProps) {
  return (
    <div className="sticky top-24">
      <div className="rounded-xl p-6 shadow-lg bg-card">
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">a partir de</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{basePrice}</span>
            <span className="text-muted-foreground">por hora</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            {options.map((option, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div className="rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{option.type}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{option.price}</div>
                        {option.period && (
                          <div className="text-sm text-muted-foreground">{option.period}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                {option.details && (
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{option.type}</DialogTitle>
                      <DialogDescription>{option.description}</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">{option.details.duration}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">{option.details.location}</span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">O que está incluído:</h4>
                        <div className="space-y-2">
                          {option.details.includes.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Ideal para:</strong> {option.details.ideal_for}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <div className="font-semibold text-lg">{option.price}</div>
                          {option.period && (
                            <div className="text-sm text-muted-foreground">{option.period}</div>
                          )}
                        </div>
                        <Button className="bg-[#e0093e] hover:bg-[#c0082e] text-white">
                          Falar por WhatsApp
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            ))}
          </div>

          <Button className="w-full bg-[#e0093e] hover:bg-[#c0082e] text-white py-3 rounded-lg">
            Falar por WhatsApp
          </Button>

          <Button variant="outline" className="w-full py-3 rounded-lg">
            <MessageCircle className="h-4 w-4 mr-2" />
            Enviar mensagem
          </Button>


        </div>
      </div>
    </div>
  );
}