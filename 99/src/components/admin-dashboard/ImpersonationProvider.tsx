import { ReactNode } from 'react';
import { ImpersonationContext, useImpersonationState } from '../../hooks/useImpersonation';

interface ImpersonationProviderProps {
  children: ReactNode;
}

export function ImpersonationProvider({ children }: ImpersonationProviderProps) {
  const impersonationState = useImpersonationState();

  return (
    <ImpersonationContext.Provider value={impersonationState}>
      {children}
    </ImpersonationContext.Provider>
  );
}