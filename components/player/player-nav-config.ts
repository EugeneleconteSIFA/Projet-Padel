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

/** Raccourcis accueil joueur — orientés action, pas marketing. */
export const PLAYER_HOME_ACTIONS = [
  {
    href: '/tournois',
    title: 'Chercher un tournoi',
    icon: 'search' as const,
    accent: 'var(--court-700)',
    accentSoft: 'var(--court-100)',
  },
  {
    href: '/matchs-amicaux',
    title: 'Trouver un partenaire',
    icon: 'partner' as const,
    accent: 'var(--gold-700)',
    accentSoft: 'var(--gold-100)',
  },
  {
    href: '/profil',
    title: 'Mes inscriptions',
    icon: 'registrations' as const,
    accent: 'var(--court-600)',
    accentSoft: 'var(--court-50)',
  },
  {
    href: '/profil',
    title: 'Mon profil',
    icon: 'profile' as const,
    accent: 'var(--ink-700)',
    accentSoft: 'var(--cream-200)',
  },
] as const;
