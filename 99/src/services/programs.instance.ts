/**
 * Instância singleton do ProgramsService
 * Corrige o erro de UUID "undefined" adicionando validações robustas
 */

import { ProgramsServiceImpl } from './programs.service';

// Singleton instance
export const programsService = new ProgramsServiceImpl();

// Export default também para compatibilidade
export default programsService;