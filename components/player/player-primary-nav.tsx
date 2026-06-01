'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isPlayerHome, isPlayerNavActive, PLAYER_NAV_ITEMS } from './player-nav-config';

export function PlayerPrimaryNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation joueur"
      className="border-b"
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'color-mix(in srgb, var(--bg-surface) 92%, transparent)',
      }}
    >
      <div className="mx-auto max-w-screen-xl overflow-x-auto px-4 md:px-6">
        <ul className="flex min-w-max items-center gap-1 py-2 md:min-w-0 md:justify-center">
          {PLAYER_NAV_ITEMS.map((item) => {
            const active = isPlayerNavActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className="block whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition md:px-4"
                  style={{
                    color: active ? 'var(--court-700)' : 'var(--text-muted)',
                    background: active ? 'var(--court-100)' : 'transparent',
                    boxShadow: active
                      ? 'inset 0 0 0 1px color-mix(in srgb, var(--court-700) 12%, transparent)'
                      : undefined,
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/** Liens compacts pour la barre mobile basse. */
export const PLAYER_MOBILE_NAV_ITEMS = [
  { href: '/joueur', label: 'Accueil', match: (path: string) => isPlayerHome(path) },
  { href: '/tournois', label: 'Tournois', match: (path: string) => path.startsWith('/tournois') },
  { href: '/matchs-amicaux', label: 'Matchs', match: (path: string) => path.startsWith('/matchs') },
  { href: '/mon-feed', label: 'Feed', match: (path: string) => path.startsWith('/mon-feed') || path.startsWith('/feed') },
  { href: '/profil', label: 'Profil', match: (path: string) => path.startsWith('/profil') },
] as const;

export function PlayerMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex border-t md:hidden"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Navigation mobile joueur"
    >
      {PLAYER_MOBILE_NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className="flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition"
            style={{ color: active ? 'var(--court-700)' : 'var(--text-muted)' }}
          >
            <MobileNavIcon href={item.href} active={active} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNavIcon({ href, active }: { href: string; active: boolean }) {
  const color = active ? 'var(--court-700)' : 'var(--text-muted)';
  const props = {
    width: 15,
    height: 15,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  if (href === '/joueur') {
    return (
      <svg {...props}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }
  if (href === '/tournois') {
    return (
      <svg {...props}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    );
  }
  if (href === '/matchs-amicaux') {
    return (
      <svg {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    );
  }
  if (href === '/mon-feed') {
    return (
      <svg {...props}>
        <path d="M4 11a9 9 0 0 1 9 9" />
        <path d="M4 4a16 16 0 0 1 16 16" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
