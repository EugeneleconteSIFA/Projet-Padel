'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
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
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 transition hover:opacity-70"
          style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-primary)' }}
        >
          the court<span style={{ color: 'var(--gold-500)' }}>.</span>
        </Link>

        {/* Nav principale — desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {role === 'PLAYER' && (
            <>
              <NavLink href="/" label="Accueil" icon={<HomeIcon />} />
              <NavLink href="/tournois" label="Tournois" icon={<SearchIcon />} />
              <NavLink href="/mon-feed" label="Feed" icon={<FeedIcon />} />
              <NavLink href="/matchs-amicaux" label="Matchs" icon={<UsersIcon />} />
              <NavLink href="/profil" label="Profil" icon={<UserIcon />} />
            </>
          )}
          {role === 'CLUB' && (
            <>
              <NavLink href="/" label="Accueil" icon={<HomeIcon />} />
              <NavLink href="/club" label="Mes tournois" icon={<TrophyIcon />} />
              <NavLink href="/club/tournoi/nouveau" label="Créer un tournoi" icon={<PlusIcon />} />
              <NavLink href="/club/parametres" label="Paiements" icon={<CreditCardIcon />} />
            </>
          )}
          {role === 'REFEREE' && (
            <>
              <NavLink href="/" label="Accueil" icon={<HomeIcon />} />
              <NavLink href="/arbitre" label="Mes tournois" icon={<TrophyIcon />} />
              <NavLink href="/arbitre" label="Tableaux" icon={<LayoutIcon />} />
              <NavLink href="/arbitre" label="Scores" icon={<ScoreIcon />} />
            </>
          )}
        </nav>

        {/* Avatar + déconnexion */}
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

function NavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition hover:opacity-70"
      style={{ color: 'var(--text-secondary)' }}
    >
      {icon}
      {label}
    </Link>
  );
}

/* ── Icons ───────────────────────────────────────────────────────────────── */

function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

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

function ScoreIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function FeedIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
