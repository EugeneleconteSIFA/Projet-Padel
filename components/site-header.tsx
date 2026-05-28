'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { NavUser } from '@/components/nav-user';

/* =============================================================================
   SiteHeader — Navigation épurée : logo, CTA Tournois, menu visuel, compte.
   ============================================================================= */

type MenuItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  accent: string;
};

const discoverItems: MenuItem[] = [
  {
    href: '/joueurs',
    label: 'Joueurs',
    accent: 'var(--court-700)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    href: '/clubs',
    label: 'Clubs',
    accent: 'var(--gold-700)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10h16v10H4z" /><path d="M8 10V6h8v4" />
      </svg>
    ),
  },
  {
    href: '/juge-arbitre',
    label: 'JA',
    accent: 'var(--gold-700)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h4" />
      </svg>
    ),
  },
  {
    href: '/tarifs',
    label: 'Tarifs',
    accent: 'var(--gold-500)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" /><path d="M12 8v8M9 10h4a2 2 0 1 1 0 4H9" />
      </svg>
    ),
  },
];

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const headerStyle = headerVariants[variant];

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: headerStyle.background,
        backdropFilter: 'saturate(140%) blur(12px)',
        WebkitBackdropFilter: 'saturate(140%) blur(12px)',
        borderColor: headerStyle.borderColor,
      }}
    >
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-5 py-3 md:px-6">
        <Link
          href="/"
          className="shrink-0 transition hover:opacity-80"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: 'var(--ink-950)',
          }}
        >
          the court<span style={{ color: 'var(--gold-500)' }}>.</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/tournois"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-px"
            style={{ background: 'var(--court-700)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span className="hidden sm:inline">Tournois</span>
          </Link>

          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:bg-[var(--cream-200)]"
              style={{ borderColor: 'var(--cream-200)', color: 'var(--text-secondary)' }}
              aria-expanded={open}
              aria-label="Menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
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
                <MenuGrid items={discoverItems} onNavigate={() => setOpen(false)} />

                {isPlayer && (
                  <>
                    <p
                      className="mb-2 mt-3 px-1 font-mono text-[10px] uppercase tracking-[0.12em]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Communauté
                    </p>
                    <MenuGrid items={communityItems} onNavigate={() => setOpen(false)} cols={3} />
                  </>
                )}
              </div>
            )}
          </div>

          <NavUser compact />
        </div>
      </div>
    </header>
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
