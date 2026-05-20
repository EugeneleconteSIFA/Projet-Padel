import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { LogoutButton } from '@/components/logout-button';

/* =============================================================================
   Layout dashboard — routes protégées post-connexion.
   Header top avec nav et menu utilisateur.
   Mobile : bottom nav + header compact.
   ============================================================================= */

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = session.user;
  const initials = [user.name?.split(' ')[0]?.[0], user.name?.split(' ')[1]?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  const role = user.role ?? 'PLAYER';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
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
            <NavLink href="/" label="Tournois" icon={<SearchIcon />} />
            <NavLink href="/profil" label="Mon profil" icon={<UserIcon />} />
            {role === 'CLUB'    && <NavLink href="/club"    label="Mon club"    icon={<BuildingIcon />} />}
            {role === 'REFEREE' && <NavLink href="/arbitre" label="Arbitrage"   icon={<WhistleIcon />} />}
          </nav>

          {/* Avatar + menu */}
          <div className="flex items-center gap-3">
            {/* Badge tier */}
            {user.tier === 'PREMIUM' && (
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

      {/* ── CONTENU ──────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-screen-xl px-4 py-8 pb-24 sm:px-6 md:pb-8">
        {children}
      </main>

      {/* ── BOTTOM NAV mobile ──────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex border-t md:hidden"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <BottomNavLink href="/"       label="Tournois" icon={<SearchIcon />} />
        <BottomNavLink href="/profil" label="Profil"   icon={<UserIcon />}   />
        {role === 'CLUB'    && <BottomNavLink href="/club"    label="Club"      icon={<BuildingIcon />} />}
        {role === 'REFEREE' && <BottomNavLink href="/arbitre" label="Arbitrage" icon={<WhistleIcon />} />}
      </nav>
    </div>
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

/* ── Icons ───────────────────────────────────────────────────────────────── */

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M6 11h4M14 11h4M6 15h4M14 15h4" />
    </svg>
  );
}
function WhistleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 4 4.5 4.5"/><circle cx="14" cy="14" r="6"/><path d="m20 8-6 6"/>
    </svg>
  );
}
