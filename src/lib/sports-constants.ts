// ==============================
// SPORTS/MODALIDADES CENTRALIZADAS
// ==============================
// Fonte única de verdade para todos os esportes da plataforma
// Migrado de /data/constants.ts para /lib/

export interface SportCategory {
  id: string;
  label: string;
  iconUrl: string;
}

export const sportsCategories: SportCategory[] = [
  {
    id: "patinacao",
    label: "Patinação",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a1364d43a6ffeeee0eb4_rollerblades.svg"
  },
  {
    id: "tiro",
    label: "Tiro",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a127624d9cee88ed251a_shooting-rifle.svg"
  },
  {
    id: "sinuca",
    label: "Sinuca",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a115c9d8a64193ef250b_pool-triangle.svg"
  },
  {
    id: "karate",
    label: "Karatê",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aaae6177fee37158c064_martial-arts-karate.svg"
  },
  {
    id: "ginastica",
    label: "Ginástica",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aae0bd02a2c8a89abb8f_gymnastics-acrobatic-hanging-person.svg"
  },
  {
    id: "funcionais",
    label: "Funcionais",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a0b85596fea69cb6bc92_fitness-heart-rate.svg"
  },
  {
    id: "danca",
    label: "Dança",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a09dd0dc103f3cbc5d63_dancing-ballet.svg"
  },
  {
    id: "escalada",
    label: "Escalada",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a08820119c2ea46348cd_climbing-mountain.svg"
  },
  {
    id: "boxe",
    label: "Boxe",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/65099feb2299cc48ec093107_boxing-glove.svg"
  },
  {
    id: "boliche",
    label: "Boliche",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/65099fd93b4aaebe1c46bd52_bowling-pins.svg"
  },
  {
    id: "volei",
    label: "Vôlei",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/65099fb520119c2ea46214c3_volleyball-net.svg"
  },
  {
    id: "baseball",
    label: "Baseball",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab6c10a7b22e2bd03f0c_baseball-bat-ball.svg"
  },
  {
    id: "salto-vara",
    label: "Salto com Vara",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/65099f8fa93d761daa757503_athletics-pole-vault.svg"
  },
  {
    id: "tenis",
    label: "Tênis",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a19ffd24774fa15a51b8_tennis-racquet.svg"
  },
  {
    id: "tenis-mesa",
    label: "Tênis de Mesa",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a1cea6667fcf72dbaef3_ping-pong-paddle.svg"
  },
  {
    id: "arremesso",
    label: "Arremesso de Peso",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab3737c43eacec86aa06_athletics-discus-throwing.svg"
  },
  {
    id: "arco-flecha",
    label: "Arco e Flecha",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/65099f15e951a9e4a5a8f3d9_archery-person.svg"
  },
  {
    id: "futebol-americano",
    label: "Futebol Americano",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/65099f03856bf3a8e5ab0af9_american-football-ball-1.svg"
  },
  {
    id: "alongamento",
    label: "Alongamento",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aafd7401672b3b753bf3_gymnastics-ribbon-person-2.svg"
  },
  {
    id: "lutas",
    label: "Lutas",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aaae6177fee37158c064_martial-arts-karate.svg"
  },
  {
    id: "natacao",
    label: "Natação",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a15172d10e33e4c9eed8_swimming-diving.svg"
  },
  {
    id: "yoga",
    label: "Yoga",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aafd7401672b3b753bf3_gymnastics-ribbon-person-2.svg"
  },
  {
    id: "golfe",
    label: "Golfe",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aad2519bfb58647211a2_golf-player.svg"
  },
  {
    id: "ginastica-artistica",
    label: "Ginástica Artística",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aae0bd02a2c8a89abb8f_gymnastics-acrobatic-hanging-person.svg"
  },
  {
    id: "futebol",
    label: "Futebol",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aaea1967b1f155ff7e85_soccer-player.svg"
  },
  {
    id: "musculacao",
    label: "Musculação",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab177b7d1b2c8bd16d49_fitness-biceps.svg"
  },
  {
    id: "crossfit",
    label: "CrossFit",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab1357e090eefc5d0a6c_fitness-grip-weights.svg"
  },
  {
    id: "corrida",
    label: "Corrida",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/610d3768e2c3de514e5c30a2_corrida.png"
  },
  {
    id: "ciclismo",
    label: "Ciclismo",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab61ce55fe7e9d562f88_biking-person.svg"
  },
  {
    id: "basquete",
    label: "Basquete",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab749a54d8f03dbe48ba_basketball-hoop.svg"
  }
];

// ==============================
// UTILITÁRIOS PARA OS ESPORTES
// ==============================

// Array apenas com os labels para retrocompatibilidade
export const modalidades = sportsCategories.map(sport => sport.label);

// Array apenas com os IDs
export const sportsIds = sportsCategories.map(sport => sport.id);

// Função para buscar esporte por ID
export const getSportById = (id: string): SportCategory | undefined => {
  return sportsCategories.find(sport => sport.id === id);
};

// Função para buscar esporte por label
export const getSportByLabel = (label: string): SportCategory | undefined => {
  return sportsCategories.find(sport => sport.label === label);
};

// Array com "Todas as categorias" para filtros
export const categoriesWithAll = ['Todas as categorias', ...modalidades];