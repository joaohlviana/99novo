/**
 * 🎯 SPORT MAPPING SERVICE - FASE 2
 * 
 * Resolve inconsistências entre nomes de esportes e especialidades dos treinadores
 * Baseado no diagnóstico da FASE 1 que confirmou:
 * - Especialidades em formatos mistos (maiúscula/minúscula)
 * - Zero match entre esportes da tabela e especialidades dos treinadores
 * - SportPage busca por "Futebol" mas treinadores têm outras variações
 */

export interface SportMapping {
  officialName: string;     // Nome oficial da tabela sports
  slug: string;            // Slug da URL
  searchVariations: string[]; // Todas as variações possíveis para busca
  commonNames: string[];   // Nomes comuns que treinadores usam
}

class SportMappingService {
  
  /**
   * Mapeamento definitivo baseado nos dados reais encontrados na FASE 1
   */
  private readonly sportMappings: Record<string, SportMapping> = {
    // ✅ ESPORTES ENCONTRADOS NOS DADOS REAIS (Query 1)
    'crossfit': {
      officialName: 'CrossFit',
      slug: 'crossfit',
      searchVariations: ['crossfit', 'Crossfit', 'CrossFit', 'CROSSFIT', 'cross-fit', 'cross fit'],
      commonNames: ['crossfit', 'cross training', 'treinamento funcional crossfit']
    },
    
    'musculacao': {
      officialName: 'Musculação', 
      slug: 'musculacao',
      searchVariations: ['musculacao', 'Musculação', 'musculação', 'MUSCULACAO', 'bodybuilding', 'gym'],
      commonNames: ['musculacao', 'musculação', 'academia', 'hipertrofia', 'força']
    },
    
    'funcional': {
      officialName: 'Funcionais',
      slug: 'funcionais', 
      searchVariations: ['funcional', 'Funcional', 'funcionais', 'Funcionais', 'functional', 'treinamento funcional'],
      commonNames: ['funcional', 'funcionais', 'functional training', 'treino funcional']
    },

    'hiit': {
      officialName: 'Funcionais', // HIIT mapeia para Funcionais
      slug: 'funcionais',
      searchVariations: ['hiit', 'HIIT', 'hit', 'HIT', 'alta intensidade', 'intervalo'],
      commonNames: ['hiit', 'treino intervalado', 'alta intensidade']
    },

    // ✅ ESPORTES DA TABELA SPORTS (Query 3) - PRINCIPAIS
    'futebol': {
      officialName: 'Futebol',
      slug: 'futebol',
      searchVariations: ['futebol', 'Futebol', 'FUTEBOL', 'soccer', 'football', 'fut'],
      commonNames: ['futebol', 'soccer', 'football', 'fut11', 'futebol de campo']
    },

    'basquete': {
      officialName: 'Basquete',
      slug: 'basquete',
      searchVariations: ['basquete', 'Basquete', 'basketball', 'bola ao cesto', 'basquetebol'],
      commonNames: ['basquete', 'basketball', 'bola ao cesto']
    },

    'volei': {
      officialName: 'Vôlei',
      slug: 'volei', 
      searchVariations: ['volei', 'vôlei', 'Vôlei', 'volleyball', 'volley'],
      commonNames: ['volei', 'vôlei', 'volleyball', 'volley']
    },

    'natacao': {
      officialName: 'Natação',
      slug: 'natacao',
      searchVariations: ['natacao', 'natação', 'Natação', 'swimming', 'swim'],
      commonNames: ['natacao', 'natação', 'swimming', 'nado']
    },

    'corrida': {
      officialName: 'Corrida',
      slug: 'corrida',
      searchVariations: ['corrida', 'Corrida', 'running', 'run', 'atletismo', 'maratona'],
      commonNames: ['corrida', 'running', 'atletismo', 'run', 'maratona', 'sprint']
    },

    'yoga': {
      officialName: 'Yoga',
      slug: 'yoga',
      searchVariations: ['yoga', 'Yoga', 'YOGA', 'ioga', 'meditacao'],
      commonNames: ['yoga', 'ioga', 'meditação', 'pilates yoga']
    },

    'boxe': {
      officialName: 'Boxe',
      slug: 'boxe',
      searchVariations: ['boxe', 'Boxe', 'boxing', 'pugilismo', 'luta'],
      commonNames: ['boxe', 'boxing', 'pugilismo', 'soco']
    },

    'lutas': {
      officialName: 'Lutas',
      slug: 'lutas',
      searchVariations: ['lutas', 'Lutas', 'luta', 'Luta', 'artes marciais', 'mma', 'jiu-jitsu', 'Jiu-Jitsu'],
      commonNames: ['lutas', 'artes marciais', 'MMA', 'jiu-jitsu', 'jiu jitsu', 'bjj']
    },

    'karate': {
      officialName: 'Karatê',
      slug: 'karate',
      searchVariations: ['karate', 'karatê', 'Karatê', 'karatê-do', 'shotokan'],
      commonNames: ['karate', 'karatê', 'karatê-do']
    },

    'ciclismo': {
      officialName: 'Ciclismo',
      slug: 'ciclismo',
      searchVariations: ['ciclismo', 'Ciclismo', 'bike', 'bicicleta', 'cycling', 'pedal'],
      commonNames: ['ciclismo', 'bike', 'cycling', 'bicicleta', 'spinning']
    },

    'tenis': {
      officialName: 'Tênis',
      slug: 'tenis',
      searchVariations: ['tenis', 'tênis', 'Tênis', 'tennis'],
      commonNames: ['tenis', 'tênis', 'tennis']
    },

    'ginastica': {
      officialName: 'Ginástica',
      slug: 'ginastica',
      searchVariations: ['ginastica', 'ginástica', 'Ginástica', 'gymnastics', 'ginástica artística'],
      commonNames: ['ginastica', 'ginástica', 'gymnastics', 'solo', 'aparelhos']
    },

    'danca': {
      officialName: 'Dança',
      slug: 'danca',
      searchVariations: ['danca', 'dança', 'Dança', 'dance', 'dancing', 'ballet'],
      commonNames: ['danca', 'dança', 'dance', 'ballet', 'jazz', 'contemporâneo']
    },

    // ✅ ESPECIALIDADES EXTRAS ENCONTRADAS (Query 1)
    'olimpicos': {
      officialName: 'Funcionais', // Mapear para Funcionais como mais próximo
      slug: 'funcionais',
      searchVariations: ['olimpicos', 'olímpicos', 'olympic', 'levantamento olimpico', 'levantamento olímpico'],
      commonNames: ['olimpicos', 'olímpicos', 'weightlifting', 'levantamento olímpico']
    },

    'sinuca': {
      officialName: 'Sinuca',
      slug: 'sinuca',
      searchVariations: ['sinuca', 'Sinuca', 'SINUCA', 'pool', 'bilhar', 'snooker'],
      commonNames: ['sinuca', 'pool', 'bilhar', 'snooker']
    },

    'fitness': {
      officialName: 'Funcionais', // Fitness mapeia para Funcionais
      slug: 'funcionais',
      searchVariations: ['fitness', 'Fitness', 'FITNESS', 'fit', 'condicionamento'],
      commonNames: ['fitness', 'condicionamento físico', 'preparação física']
    }
  };

  /**
   * Obtém todas as variações de busca para um esporte
   */
  getSearchVariationsForSport(sportSlugOrName: string): string[] {
    // Primeiro, tentar busca direta por slug
    const directMapping = this.sportMappings[sportSlugOrName.toLowerCase()];
    if (directMapping) {
      return directMapping.searchVariations;
    }

    // Buscar por nome oficial (case-insensitive)
    const foundMapping = Object.values(this.sportMappings).find(mapping => 
      mapping.officialName.toLowerCase() === sportSlugOrName.toLowerCase() ||
      mapping.slug.toLowerCase() === sportSlugOrName.toLowerCase()
    );

    if (foundMapping) {
      return foundMapping.searchVariations;
    }

    // Fallback: retornar o próprio termo + variações básicas
    const normalized = sportSlugOrName.toLowerCase();
    const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    
    return [
      normalized,
      capitalized,
      sportSlugOrName.toUpperCase(),
      sportSlugOrName // original
    ];
  }

  /**
   * Obtém informações completas do mapeamento
   */
  getSportMapping(sportSlugOrName: string): SportMapping | null {
    const directMapping = this.sportMappings[sportSlugOrName.toLowerCase()];
    if (directMapping) {
      return directMapping;
    }

    const foundMapping = Object.values(this.sportMappings).find(mapping => 
      mapping.officialName.toLowerCase() === sportSlugOrName.toLowerCase() ||
      mapping.slug.toLowerCase() === sportSlugOrName.toLowerCase()
    );

    return foundMapping || null;
  }

  /**
   * Converte slug da URL para nome oficial do esporte
   */
  getOfficialNameFromSlug(slug: string): string {
    const mapping = this.getSportMapping(slug);
    return mapping?.officialName || slug;
  }

  /**
   * Obtém slug oficial para um nome de esporte
   */
  getSlugFromName(name: string): string {
    const mapping = this.getSportMapping(name);
    return mapping?.slug || name.toLowerCase();
  }

  /**
   * Verifica se um termo pode ser uma especialidade relacionada ao esporte
   */
  isSpecialtyRelatedToSport(specialty: string, sportSlugOrName: string): boolean {
    const variations = this.getSearchVariationsForSport(sportSlugOrName);
    const mapping = this.getSportMapping(sportSlugOrName);
    
    const normalizedSpecialty = specialty.toLowerCase();
    
    // Verificar variações de busca
    if (variations.some(variation => variation.toLowerCase() === normalizedSpecialty)) {
      return true;
    }

    // Verificar nomes comuns
    if (mapping?.commonNames.some(common => common.toLowerCase() === normalizedSpecialty)) {
      return true;
    }

    // Verificar substring (para casos como "treinamento funcional" contém "funcional")
    if (variations.some(variation => 
      normalizedSpecialty.includes(variation.toLowerCase()) || 
      variation.toLowerCase().includes(normalizedSpecialty)
    )) {
      return true;
    }

    return false;
  }

  /**
   * Busca esportes que podem corresponder a uma lista de especialidades
   */
  findSportsForSpecialties(specialties: string[]): SportMapping[] {
    const foundSports: SportMapping[] = [];
    const addedSlugs = new Set<string>();

    for (const specialty of specialties) {
      for (const [slug, mapping] of Object.entries(this.sportMappings)) {
        if (addedSlugs.has(mapping.slug)) continue;

        if (this.isSpecialtyRelatedToSport(specialty, slug)) {
          foundSports.push(mapping);
          addedSlugs.add(mapping.slug);
        }
      }
    }

    return foundSports;
  }

  /**
   * Lista todos os esportes mapeados (para debug)
   */
  getAllMappings(): Record<string, SportMapping> {
    return { ...this.sportMappings };
  }

  /**
   * Estatísticas do mapeamento (para debug)
   */
  getStats(): {
    totalSports: number;
    totalVariations: number;
    avgVariationsPerSport: number;
  } {
    const mappings = Object.values(this.sportMappings);
    const totalVariations = mappings.reduce((sum, mapping) => 
      sum + mapping.searchVariations.length + mapping.commonNames.length, 0
    );

    return {
      totalSports: mappings.length, 
      totalVariations,
      avgVariationsPerSport: Math.round(totalVariations / mappings.length)
    };
  }
}

// Singleton export
const sportMappingService = new SportMappingService();
export { sportMappingService };
export default sportMappingService;