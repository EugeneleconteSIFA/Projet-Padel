/* =============================================================================
   Types et helpers tournois — forme partagée entre les pages publiques et la
   carte interactive.

   ⚠ NOTE :
   Ce module ne contient plus de données mockées. Les tournois sont désormais
   lus depuis Prisma via lib/queries/tournaments.ts. Il subsiste ici :
     - les types du modèle d'affichage (Tournament, ScheduleSlot, etc.)
     - les constantes UI (CATEGORIES, RADII)
     - les helpers d'affichage (spotsLeft, spotsLabel, formatDate)
   ============================================================================= */

export type Genre    = 'Hommes' | 'Femmes' | 'Mixte';
export type Surface  = 'indoor' | 'outdoor';
export type Category = 'P25' | 'P100' | 'P250' | 'P500' | 'P1000' | 'P2000';
export type Format   = 'Élimination directe' | 'Poules + tableau' | 'Poules + consolante';

export interface Tournament {
  id:          string;   // slug public (utilisé dans l'URL)
  editionId:   string;   // TournamentEdition.id (utilisé pour les inscriptions)
  name:        string;
  club:        string;
  city:        string;
  address:     string;
  distance:    number;   // km depuis le point de référence (V1 : Lille)
  date:        string;   // ISO YYYY-MM-DD
  dateEnd?:    string;   // si multi-jours
  time:        string;   // HH:MM — premier match
  category:    Category;
  genre:       Genre;
  surface:     Surface;
  price:       number;   // € par équipe
  teams:       number;   // équipes inscrites confirmées
  maxTeams:    number;
  format:      Format;
  description: string;
  schedule:    ScheduleSlot[];
  prizes?:     string;
  contact:     string;
  lat:         number;
  lng:         number;
}

export interface ScheduleSlot {
  time:  string;
  label: string;
}

export const CATEGORIES: Category[] = ['P25', 'P100', 'P250', 'P500', 'P1000', 'P2000'];
export const RADII = [10, 20, 30, 50, 75, 100];

/* ── Helpers ─────────────────────────────────────────────────────────────── */

export function spotsLeft(t: Tournament) {
  return t.maxTeams - t.teams;
}

export function spotsLabel(t: Tournament) {
  const n = spotsLeft(t);
  if (n === 0) return 'Complet';
  if (n <= 2) return `${n} place${n > 1 ? 's' : ''} restante${n > 1 ? 's' : ''}`;
  return `${t.teams} / ${t.maxTeams} équipes`;
}

export function formatDate(d: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(d).toLocaleDateString('fr-FR', opts ?? {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Données de démo — utilisées en local si DATABASE_URL est absente. */
export const DEV_MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 'open-de-loos-mai-2026',
    editionId: 'demo-edition-1',
    name: 'Open de Loos · Mai',
    club: 'Padel Club Loos',
    city: 'Loos',
    address: '42 rue de la République, 59120 Loos',
    distance: 4,
    date: '2026-05-17',
    time: '09:00',
    category: 'P100',
    genre: 'Mixte',
    surface: 'indoor',
    price: 40,
    teams: 11,
    maxTeams: 16,
    format: 'Poules + tableau',
    description: 'Tournoi mixte P100 en salle.',
    schedule: [],
    contact: 'contact@padelclubloos.fr',
    lat: 50.6075,
    lng: 3.0195,
  },
  {
    id: 'tournoi-de-roubaix-mai-2026',
    editionId: 'demo-edition-2',
    name: 'Tournoi de Roubaix',
    club: 'Padel Roubaix',
    city: 'Roubaix',
    address: '18 avenue des Nations, 59100 Roubaix',
    distance: 9,
    date: '2026-05-17',
    time: '10:00',
    category: 'P250',
    genre: 'Hommes',
    surface: 'outdoor',
    price: 60,
    teams: 14,
    maxTeams: 16,
    format: 'Élimination directe',
    description: 'Open masculin P250 en plein air.',
    schedule: [],
    contact: 'tournois@padelroubaix.fr',
    lat: 50.6942,
    lng: 3.1746,
  },
  {
    id: 'hauts-de-france-open-2026',
    editionId: 'demo-edition-3',
    name: 'Hauts-de-France Open',
    club: 'Padel Métropole',
    city: 'Lille',
    address: '1 boulevard de Tournai, 59000 Lille',
    distance: 1,
    date: '2026-05-24',
    dateEnd: '2026-05-25',
    time: '09:30',
    category: 'P500',
    genre: 'Femmes',
    surface: 'indoor',
    price: 72,
    teams: 8,
    maxTeams: 24,
    format: 'Poules + consolante',
    description: 'Grand tournoi féminin P500 sur 2 jours.',
    schedule: [],
    contact: 'open@padelmetropole.fr',
    lat: 50.6292,
    lng: 3.0573,
  },
];
