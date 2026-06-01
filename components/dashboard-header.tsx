'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getRoleHomePath } from '@/lib/dispatch';
import { LogoutButton } from '@/components/logout-button';

/* =============================================================================
   DashboardHeader — Header pour les pages connectées selon le rôle
   - Joueur: logo, Accueil, Tournois, Profil, Déconnexion
   - Club: logo, Accueil, Mes tournois, Créer un tournoi, Paiements, Déconnexion
   - Juge-arbitre: logo, Accueil, Mes tournois, Tableaux, Scores, Déconnexion
   ============================================================================= */

export function DashboardHeader() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role ?? 'PLAYER';
  const homeHref = getRoleHomePath(role);

  const initials = [user?.name?.split(' ')[0]?.[0], user?.name?.split(' ')[1]?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md"
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'color-mix(in srgb, var(--bg-page) 88%, transparent)',
      }}
    >
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3">
        <Link
          href={homeHref}
          className="shrink-0 transition hover:opacity-70"
          style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-primary)' }}
        >
          the court<span style={{ color: 'var(--gold-500)' }}>.</span>
        </Link>

        {role === 'CLUB' && (
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/club" label="Mes tournois" icon={<TrophyIcon />} />
            <NavLink href="/club/tournoi/nouveau" label="Créer" icon={<PlusIcon />} iconOnly />
            <NavLink href="/club/stripe" label="Paiements" icon={<CreditCardIcon />} iconOnly />
          </nav>
        )}
        {role === 'REFEREE' && (
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/arbitre" label="Mes tournois" icon={<TrophyIcon />} />
            <NavLink href="/arbitre" label="Tableaux" icon={<LayoutIcon />} iconOnly />
          </nav>
        )}

        <div className="flex items-center gap-3">
          {/* Badge tier */}
          {user?.tier === 'PREMIUM' && (
            <span
              className="hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline-block"
              style={{
                fontFamily: 'var(--font-mono)',
                background: 'rgba(201,162,74,0.15)',
                color: 'var(--gold-500)',
                border: '1px solid rgba(201,162,74,0.3)',
              }}
            >
              PREMIUM
            </span>
          )}

          {/* Avatar */}
          <Link
            href="/profil"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition hover:opacity-80"
            style={{ background: 'var(--court-700)', color: 'var(--cream-50)' }}
            title="Mon profil"
          >
            {initials}
          </Link>

          {/* Déconnexion */}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

/* ── Composants locaux ───────────────────────────────────────────────────── */

function NavLink({ href, label, icon, iconOnly = false }: { href: string; label: string; icon: React.ReactNode; iconOnly?: boolean }) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={`flex items-center rounded-lg transition hover:opacity-70 ${iconOnly ? 'p-2' : 'gap-1.5 px-3 py-2 text-sm font-medium'}`}
      style={{ color: 'var(--text-secondary)' }}
    >
      {icon}
      {!iconOnly && label}
    </Link>
  );
}

/* ── Icons ───────────────────────────────────────────────────────────────── */

function TrophyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function LayoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
}
