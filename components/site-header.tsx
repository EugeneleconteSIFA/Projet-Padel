'use client';

import Link from 'next/link';
import { NavUser } from '@/components/nav-user';

/* =============================================================================
   SiteHeader — Header public pour les pages non-authentifiées
   Contenu : logo, Tournois, Clubs, Connexion, Créer un compte
   ============================================================================= */

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(241, 237, 229, 0.95)',
        backdropFilter: 'saturate(140%) blur(12px)',
        WebkitBackdropFilter: 'saturate(140%) blur(12px)',
        borderColor: 'var(--paper-200)',
      }}
    >
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0"
          style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink-950)' }}
        >
          the court<span style={{ color: 'var(--gold-500)' }}>.</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">
          <Link
            href="/tournois"
            className="hidden rounded-md px-3 py-1.5 text-sm font-medium transition hover:opacity-70 md:inline-block"
            style={{ color: 'var(--text-secondary)' }}
          >
            Tournois
          </Link>
          <Link
            href="/clubs"
            className="hidden rounded-md px-3 py-1.5 text-sm font-medium transition hover:opacity-70 md:inline-block"
            style={{ color: 'var(--text-secondary)' }}
          >
            Clubs
          </Link>
          <Link
            href="/feed"
            className="hidden rounded-md px-3 py-1.5 text-sm font-medium transition hover:opacity-70 md:inline-block"
            style={{ color: 'var(--text-secondary)' }}
          >
            Feed
          </Link>
          <Link
            href="/matchs-amicaux"
            className="hidden rounded-md px-3 py-1.5 text-sm font-medium transition hover:opacity-70 md:inline-block"
            style={{ color: 'var(--text-secondary)' }}
          >
            Matchs
          </Link>
          <Link
            href="/forum"
            className="hidden rounded-md px-3 py-1.5 text-sm font-medium transition hover:opacity-70 md:inline-block"
            style={{ color: 'var(--text-secondary)' }}
          >
            Forum
          </Link>
          <NavUser />
        </nav>
      </div>
    </header>
  );
}
