export function Main({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`xl:col-span-8 space-y-8 ${className}`}>{children}</div>;
}