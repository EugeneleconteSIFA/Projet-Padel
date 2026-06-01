export type PlayerNavItem = {
  href: string;
  label: string;
  matchPaths: string[];
};

/** Navigation principale joueur — routes existantes du projet. */
export const PLAYER_NAV_ITEMS: PlayerNavItem[] = [
  { href: '/joueur', label: 'Accueil', matchPaths: ['/joueur'] },
  { href: '/tournois', label: 'Tournois', matchPaths: ['/tournois'] },
  { href: '/matchs-amicaux', label: 'Matchs', matchPaths: ['/matchs-amicaux', '/matchs'] },
  { href: '/mon-feed', label: 'Feed', matchPaths: ['/mon-feed', '/feed'] },
  { href: '/forum', label: 'Forum', matchPaths: ['/forum'] },
  { href: '/profil', label: 'Mon profil', matchPaths: ['/profil'] },
];

export function isPlayerNavActive(pathname: string, item: PlayerNavItem): boolean {
  return item.matchPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function isPlayerHome(pathname: string): boolean {
  return pathname === '/joueur';
}

/** Raccourcis accueil joueur */
export const PLAYER_HOME_ACTIONS = [
  {
    href: '/tournois',
    title: 'Trouver un tournoi',
    description: 'Carte, filtres et inscriptions',
    accent: 'var(--court-700)',
    accentSoft: 'var(--court-100)',
  },
  {
    href: '/matchs-amicaux',
    title: 'Rejoindre ou créer un match',
    description: 'Matchs amicaux près de chez toi',
    accent: 'var(--gold-700)',
    accentSoft: 'var(--gold-100)',
  },
  {
    href: '/mon-feed',
    title: 'Voir le feed',
    description: 'Actualités de ton cercle padel',
    accent: 'var(--court-600)',
    accentSoft: 'var(--court-50)',
  },
  {
    href: '/profil/modifier',
    title: 'Compléter mon profil',
    description: 'Niveau, bio et préférences',
    accent: 'var(--ink-700)',
    accentSoft: 'var(--cream-200)',
  },
] as const;
