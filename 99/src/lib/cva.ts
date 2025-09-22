/**
 * Simple class variance authority replacement
 * Lightweight implementation to avoid external dependencies
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

type VariantProps<T> = T extends (...args: any[]) => any 
  ? never
  : T extends Record<string, Record<string, any>>
    ? {
        [K in keyof T]?: keyof T[K];
      }
    : never;

type CVAConfig<T extends Record<string, Record<string, any>>> = {
  variants: T;
  defaultVariants?: VariantProps<T>;
};

function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const result = cn(...input);
      if (result) classes.push(result);
    }
  }
  
  return classes.join(' ');
}

function cva<T extends Record<string, Record<string, any>>>(
  base: string,
  config?: CVAConfig<T>
) {
  return function(props?: VariantProps<T> & { className?: string }) {
    const classes = [base];
    
    if (config?.variants && props) {
      for (const [variantKey, variantValue] of Object.entries(props)) {
        if (variantKey === 'className') continue;
        
        const variant = config.variants[variantKey];
        if (variant && variantValue && variant[variantValue as string]) {
          classes.push(variant[variantValue as string]);
        }
      }
    }
    
    // Apply default variants
    if (config?.defaultVariants) {
      for (const [variantKey, defaultValue] of Object.entries(config.defaultVariants)) {
        if (props && props[variantKey as keyof typeof props] !== undefined) continue;
        
        const variant = config.variants?.[variantKey];
        if (variant && defaultValue && variant[defaultValue as string]) {
          classes.push(variant[defaultValue as string]);
        }
      }
    }
    
    if (props?.className) {
      classes.push(props.className);
    }
    
    return cn(...classes);
  };
}

export { cva, cn };
export type { VariantProps };