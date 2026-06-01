'use client';

import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard-header';
import { PlayerMobileNav, PlayerPrimaryNav } from '@/components/player/player-primary-nav';

type Role = 'PLAYER' | 'CLUB' | 'REFEREE' | 'ADMIN';

export function PlayerDashboardShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <DashboardHeader />
      {role === 'PLAYER' && <PlayerPrimaryNav />}

      <main className="mx-auto max-w-screen-xl px-4 py-6 pb-24 sm:px-6 md:py-8 md:pb-8">
        {children}
      </main>

      {role === 'PLAYER' && <PlayerMobileNav />}
      {role === 'CLUB' && <ClubMobileNav />}
      {role === 'REFEREE' && <RefereeMobileNav />}
    </div>
  );
}

function ClubMobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex border-t md:hidden"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavLink href="/club" label="Tournois" />
      <BottomNavLink href="/club/tournoi/nouveau" label="Créer" />
    </nav>
  );
}

function RefereeMobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex border-t md:hidden"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavLink href="/arbitre" label="Tournois" />
      <BottomNavLink href="/arbitre" label="Tableaux" />
    </nav>
  );
}

function BottomNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition"
      style={{ color: 'var(--text-muted)' }}
    >
      {label}
    </Link>
  );
}
