import { createContext, useContext, useState, ReactNode } from 'react';

export interface ImpersonatedUser {
  id: string;
  name: string;
  email: string;
  type: 'trainer' | 'client';
  avatar?: string;
}

interface ImpersonationContextType {
  impersonatedUser: ImpersonatedUser | null;
  isImpersonating: boolean;
  startImpersonation: (user: ImpersonatedUser) => void;
  stopImpersonation: () => void;
}

export const ImpersonationContext = createContext<ImpersonationContextType | null>(null);

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error('useImpersonation must be used within ImpersonationProvider');
  }
  return context;
};

export const useImpersonationState = () => {
  const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(null);

  const startImpersonation = (user: ImpersonatedUser) => {
    setImpersonatedUser(user);
  };

  const stopImpersonation = () => {
    setImpersonatedUser(null);
  };

  return {
    impersonatedUser,
    isImpersonating: !!impersonatedUser,
    startImpersonation,
    stopImpersonation
  };
};