import * as React from "react"
import { cn } from "../../lib/utils"

const StepperContext = React.createContext<{
  value: number
  setValue: (value: number) => void
} | null>(null)

function useStepperContext() {
  const context = React.useContext(StepperContext)
  if (!context) {
    throw new Error("Stepper components must be used within a Stepper")
  }
  return context
}

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  onValueChange?: (value: number) => void
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    const setValue = React.useCallback((newValue: number) => {
      onValueChange?.(newValue)
    }, [onValueChange])

    return (
      <StepperContext.Provider value={{ value, setValue }}>
        <div
          ref={ref}
          className={cn("flex", className)}
          {...props}
        >
          {children}
        </div>
      </StepperContext.Provider>
    )
  }
)
Stepper.displayName = "Stepper"

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number
}

const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
  ({ className, step, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        data-step={step}
        {...props}
      >
        {children}
      </div>
    )
  }
)
StepperItem.displayName = "StepperItem"

interface StepperTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const StepperTrigger = React.forwardRef<HTMLButtonElement, StepperTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn("text-left", className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
StepperTrigger.displayName = "StepperTrigger"

interface StepperIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const StepperIndicator = React.forwardRef<HTMLDivElement, StepperIndicatorProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        className: cn(className, (children as React.ReactElement).props.className),
        ...props,
      })
    }

    return (
      <div
        ref={ref}
        className={cn("h-2 rounded-full transition-colors", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
StepperIndicator.displayName = "StepperIndicator"

interface StepperTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const StepperTitle = React.forwardRef<HTMLHeadingElement, StepperTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("text-sm font-medium", className)}
        {...props}
      >
        {children}
      </h3>
    )
  }
)
StepperTitle.displayName = "StepperTitle"

export {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
}