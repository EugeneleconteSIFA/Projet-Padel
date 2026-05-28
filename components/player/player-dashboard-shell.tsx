import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard-header';

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

      <main className="mx-auto max-w-screen-xl px-4 py-6 pb-24 sm:px-6 md:py-8 md:pb-8">
        {children}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex border-t md:hidden"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {role === 'PLAYER' && (
          <>
            <BottomNavLink href="/" label="Accueil" icon={<HomeIcon />} />
            <BottomNavLink href="/tournois" label="Tournois" icon={<SearchIcon />} />
            <BottomNavLink href="/mon-feed" label="Feed" icon={<FeedIcon />} />
            <BottomNavLink href="/profil" label="Profil" icon={<UserIcon />} />
          </>
        )}
        {role === 'CLUB' && (
          <>
            <BottomNavLink href="/" label="Accueil" icon={<HomeIcon />} />
            <BottomNavLink href="/club" label="Tournois" icon={<TrophyIcon />} />
            <BottomNavLink href="/club/tournoi/nouveau" label="Créer" icon={<PlusIcon />} />
          </>
        )}
        {role === 'REFEREE' && (
          <>
            <BottomNavLink href="/" label="Accueil" icon={<HomeIcon />} />
            <BottomNavLink href="/arbitre" label="Tournois" icon={<TrophyIcon />} />
            <BottomNavLink href="/arbitre" label="Tableaux" icon={<LayoutIcon />} />
          </>
        )}
      </nav>
    </div>
  );
}

function BottomNavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition"
      style={{ color: 'var(--text-muted)' }}
    >
      {icon}
      {label}
    </Link>
  );
}

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

function LayoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
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
