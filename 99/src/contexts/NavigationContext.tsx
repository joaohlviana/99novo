/**
 * DEPRECATED: NavigationContext - SUBSTITUÍDO POR ZUSTAND
 * 
 * Este arquivo foi mantido apenas para fins de documentação.
 * Toda navegação agora usa o hook /hooks/useNavigation.ts que é baseado em Zustand.
 * 
 * NÃO IMPORTE NADA DESTE ARQUIVO - use apenas /hooks/useNavigation.ts
 */

// Este contexto foi desabilitado para evitar conflitos
// Todos os imports devem usar: import { useNavigation } from '../hooks/useNavigation'

export function useNavigation() {
  throw new Error('DEPRECATED: Use import { useNavigation } from "../hooks/useNavigation" instead');
}

export function useAppNavigation() {
  throw new Error('DEPRECATED: Use import { useNavigation } from "../hooks/useNavigation" instead');
}