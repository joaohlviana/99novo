import { cn } from "../ui/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "filters" | "hero";
}

export const Section = ({ children, className = "", variant = "default" }: SectionProps) => {
  const variantStyles = {
    default: "container py-8",
    filters: "bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-16 z-20 py-4",
    hero: "container py-12 lg:py-16"
  };

  return (
    <section className={cn(variantStyles[variant], className)}>
      {variant === "filters" ? (
        <div className="container">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
};