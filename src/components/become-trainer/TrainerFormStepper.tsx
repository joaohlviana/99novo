import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTitle,
  StepperTrigger,
} from "../ui/stepper"

interface TrainerFormStepperProps {
  currentStep: number
  onStepChange?: (step: number) => void
}

const steps = [
  {
    step: 1,
    title: "Informações",
    description: "Dados pessoais básicos"
  },
  {
    step: 2,
    title: "Localização",
    description: "Onde você atende"
  },
  {
    step: 3,
    title: "Formação",
    description: "Certificações e experiência"
  },
  {
    step: 4,
    title: "Esportes",
    description: "Modalidades que atende"
  },
  {
    step: 5,
    title: "Atendimento",
    description: "Como você trabalha"
  },
  {
    step: 6,
    title: "Conclusão",
    description: "Revisar e finalizar"
  },
]

export function TrainerFormStepper({ currentStep, onStepChange }: TrainerFormStepperProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 lg:py-8">
      <Stepper value={currentStep} onValueChange={onStepChange} className="items-start gap-3 lg:gap-4">
        {steps.map(({ step, title, description }) => (
          <StepperItem key={step} step={step} className="flex-1">
            <StepperTrigger className="w-full flex-col items-start gap-2 rounded-lg p-3 lg:p-4 hover:bg-muted/50 transition-all duration-200 hover:shadow-sm border border-transparent hover:border-muted-foreground/10">
              <StepperIndicator asChild className="bg-muted h-2 w-full rounded-full">
                <div className="h-2 w-full rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      step < currentStep 
                        ? 'w-full bg-[#e0093e]' 
                        : step === currentStep 
                        ? 'w-full bg-[#e0093e]/80' 
                        : 'w-0 bg-muted'
                    }`}
                  />
                </div>
              </StepperIndicator>
              
              <div className="text-left w-full">
                <div className="flex items-center gap-3 mt-2.5">
                  <div className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                    ${step < currentStep 
                      ? 'bg-[#e0093e] text-white shadow-sm' 
                      : step === currentStep 
                      ? 'bg-[#e0093e] text-white shadow-sm scale-105' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {step < currentStep ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <StepperTitle className={`
                    text-base lg:text-lg transition-all duration-300
                    ${step <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground font-normal'}
                  `}>
                    {title}
                  </StepperTitle>
                </div>
              </div>
            </StepperTrigger>
          </StepperItem>
        ))}
      </Stepper>
    </div>
  )
}