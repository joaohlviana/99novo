/**
 * 🔐 USE PROTECTED ACTION
 * 
 * Hook para executar ações que requerem autenticação.
 * Se o usuário não estiver logado, abre modal de login.
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useProtectedAction() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [showLoginModal, setShowLoginModal] = useState(false);

  const executeProtectedAction = (
    action: () => void,
    options?: {
      title?: string;
      description?: string;
    }
  ) => {
    if (isAuthenticated) {
      // Usuário logado, executar ação diretamente
      action();
    } else {
      // Usuário não logado, abrir modal
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  const handleLoginCancel = () => {
    setShowLoginModal(false);
  };

  return {
    executeProtectedAction,
    showLoginModal,
    handleLoginSuccess,
    handleLoginCancel,
    isAuthenticated
  };
}