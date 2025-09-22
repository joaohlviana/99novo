/**
 * 🔐 REDIRECIONAMENTO - HOOK USEAUTH
 * 
 * Este arquivo serve como um redirecionamento para o hook correto
 * para manter compatibilidade com imports existentes.
 * 
 * A implementação real está em /contexts/AuthContext.tsx
 */

// Reexportar o useAuth do contexto correto
export { useAuth } from '../contexts/AuthContext';

// Também reexportar os tipos relacionados para conveniência
export type { AppUser, UserMode } from '../contexts/AuthContext';