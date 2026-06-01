'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { getRoleHomePath } from '@/lib/dispatch';
import { NavUser } from '@/components/nav-user';
import { PlayerMobileNav, PlayerPrimaryNav } from '@/components/player/player-primary-nav';

/* =============================================================================
   SiteHeader — Logo, liens principaux visibles, loupe Tournois, menu secondaire.
   ============================================================================= */

type MenuItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  accent: string;
};

const primaryNavLinks = [
  { href: '/joueurs', label: 'Joueurs', matchPaths: ['/joueurs'] },
  { href: '/clubs', label: 'Club', matchPaths: ['/clubs', '/club'] },
  { href: '/juge-arbitre', label: 'JA', matchPaths: ['/juge-arbitre'], goldOnHome: 'dark' as const },
  { href: '/tarifs', label: 'Tarifs', matchPaths: ['/tarifs'], goldOnHome: 'light' as const },
] as const;

const communityItems: MenuItem[] = [
  {
    href: '/feed',
    label: 'Feed',
    accent: 'var(--court-600)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
      </svg>
    ),
  },
  {
    href: '/forum',
    label: 'Forum',
    accent: 'var(--court-600)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/matchs-amicaux',
    label: 'Matchs',
    accent: 'var(--court-600)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
];

type SiteHeaderVariant = 'default' | 'rose';

const headerVariants: Record<
  SiteHeaderVariant,
  { background: string; borderColor: string }
> = {
  default: {
    background: 'rgba(241, 237, 229, 0.95)',
    borderColor: 'var(--paper-200)',
  },
  rose: {
    background: 'rgba(251, 207, 232, 0.95)',
    borderColor: 'rgba(244, 114, 182, 0.45)',
  },
};

export function SiteHeader({ variant = 'default' }: { variant?: SiteHeaderVariant }) {
  const { data: session } = useSession();
  const isPlayer = session?.user?.role === 'PLAYER';
  const pathname = usePathname();
  const logoHref = session?.user ? getRoleHomePath(session.user.role) : '/';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const headerStyle = headerVariants[variant];
  const showSecondaryMenu = isPlayer;
  const isHome = pathname === '/';

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: headerStyle.background,
          backdropFilter: 'saturate(140%) blur(12px)',
          WebkitBackdropFilter: 'saturate(140%) blur(12px)',
          borderColor: headerStyle.borderColor,
        }}
      >
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3 md:px-6">
          <Link
            href={logoHref}
            className="shrink-0 transition hover:opacity-80"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(17px, 4vw, 20px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--ink-950)',
            }}
          >
            the court<span style={{ color: 'var(--gold-500)' }}>.</span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
            <nav
              aria-label="Navigation principale"
              className="flex min-w-0 items-center gap-0.5 overflow-x-auto sm:gap-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {primaryNavLinks.map((link) => {
                const active = link.matchPaths.some(
                  (path) => pathname === path || pathname.startsWith(`${path}/`),
                );
                const homeGold =
                  isHome && 'goldOnHome' in link
                    ? link.goldOnHome === 'dark'
                      ? { accent: 'var(--gold-700)', accentSoft: 'var(--gold-100)' }
                      : { accent: 'var(--gold-500)', accentSoft: 'var(--gold-100)' }
                    : null;
                const color = homeGold
                  ? homeGold.accent
                  : active
                    ? 'var(--court-700)'
                    : 'var(--text-secondary)';
                const background = active
                  ? (homeGold?.accentSoft ?? 'var(--court-100)')
                  : 'var(--bg-surface)';
                const borderColor = homeGold
                  ? active
                    ? `color-mix(in srgb, ${homeGold.accent} 30%, transparent)`
                    : `color-mix(in srgb, ${homeGold.accent} 18%, var(--border-subtle))`
                  : active
                    ? 'color-mix(in srgb, var(--court-700) 25%, transparent)'
                    : 'var(--border-subtle)';

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className="shrink-0 rounded-lg border px-1.5 py-1 text-[10px] font-semibold transition hover:bg-[var(--cream-100)] sm:px-2.5 sm:py-1.5 sm:text-xs"
                    style={{
                      color,
                      borderColor,
                      background,
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/tournois"
              className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-px sm:gap-1.5 sm:px-4 sm:py-2 sm:text-sm"
              style={{ background: 'var(--court-700)' }}
              aria-label="Tournois"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="sm:h-[15px] sm:w-[15px]">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <span className="hidden min-[400px]:inline">Tournois</span>
            </Link>

            {showSecondaryMenu && (
              <div className="relative shrink-0" ref={ref}>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border transition hover:bg-[var(--cream-200)] sm:h-9 sm:w-9"
                  style={{ borderColor: 'var(--cream-200)', color: 'var(--text-secondary)' }}
                  aria-expanded={open}
                  aria-label="Menu communauté"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="sm:h-[18px] sm:w-[18px]">
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                </button>

                {open && (
                  <div
                    className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border p-3 shadow-lg"
                    style={{
                      background: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <p
                      className="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.12em]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Communauté
                    </p>
                    <MenuGrid items={communityItems} onNavigate={() => setOpen(false)} cols={3} />
                  </div>
                )}
              </div>
            )}

            <NavUser compact />
          </div>
        </div>
      </header>
      {isPlayer && <PlayerPrimaryNav />}
      {isPlayer && <PlayerMobileNav />}
    </>
  );
}

function MenuGrid({
  items,
  onNavigate,
  cols = 2,
}: {
  items: MenuItem[];
  onNavigate: () => void;
  cols?: 2 | 3;
}) {
  return (
    <div className={`grid gap-2 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition hover:bg-[var(--cream-100)]"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'var(--cream-100)', color: item.accent }}
          >
            {item.icon}
          </span>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
