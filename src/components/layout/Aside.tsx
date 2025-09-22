export function Aside({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <aside className={`xl:col-span-4 ${className}`}>
      <div className="sticky top-[var(--header-h)] space-y-4 z-10">
        {children}
      </div>
    </aside>
  );
}