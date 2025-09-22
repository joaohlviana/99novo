type Props = {
  children: React.ReactNode;
  hasAside?: boolean;
  className?: string;
};

export function ContentGrid({ children, hasAside = false, className = "" }: Props) {
  return (
    <main className={`container pt-16 ${className}`}>
      <div className={`grid grid-cols-1 ${hasAside ? 'xl:grid-cols-12' : ''} gap-6 lg:gap-8 pb-8 lg:pb-10`}>
        {children}
      </div>
    </main>
  );
}