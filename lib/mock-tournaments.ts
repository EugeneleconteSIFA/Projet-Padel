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
