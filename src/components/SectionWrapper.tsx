import { ReactNode } from 'react';

interface SectionWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'hero' | 'highlight';
}

export function SectionWrapper({ 
  title, 
  description, 
  children, 
  className = '',
  variant = 'default'
}: SectionWrapperProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'hero':
        return 'glass-card rounded-3xl p-8 lg:p-12 shadow-xl';
      case 'highlight':
        return 'glass-card rounded-2xl p-6 lg:p-8 shadow-lg border-2 border-[#FF385C]/20';
      default:
        return 'glass-card rounded-2xl p-6 lg:p-8 shadow-lg';
    }
  };

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900">
          {title}
        </h2>
        {description && (
          <p className="text-gray-600 text-lg max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {/* Section Content */}
      <div className={getVariantClasses()}>
        {children}
      </div>
    </section>
  );
}