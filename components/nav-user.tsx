'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

/* =============================================================================
   NavUser — menu utilisateur connecté dans la barre de navigation publique.
   Affiché sur la home, la vitrine, la fiche tournoi.
   Quand non connecté : boutons Se connecter / Créer un compte.
   ============================================================================= */

export function NavUser() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Ferme le menu au clic extérieur */
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  /* Chargement */
  if (status === 'loading') {
    return <div className="h-8 w-20 animate-pulse rounded-lg" style={{ background: 'var(--bg-muted)' }} />;
  }

  /* Non connecté */
  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-lg px-3 py-1.5 text-sm font-medium transition hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          Se connecter
        </Link>
        <Link
          href="/signup"
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--court-700)' }}
        >
          Créer un compte
        </Link>
      </div>
    );
  }

  /* Connecté */
  const user      = session.user;
  const role      = user.role ?? 'PLAYER';
  const initials  = (user.name ?? '?')
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dashboardHref =
    role === 'CLUB'    ? '/club' :
    role === 'REFEREE' ? '/arbitre' :
    '/profil';

  const dashboardLabel =
    role === 'CLUB'    ? 'Mon club' :
    role === 'REFEREE' ? 'Mon espace arbitre' :
    'Mon profil';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:opacity-80"
        aria-expanded={open}
        aria-label="Menu utilisateur"
      >
        {/* Avatar */}
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: 'var(--court-700)', color: 'var(--cream-50)' }}
        >
          {initials}
        </span>
        <span className="hidden text-sm font-medium sm:block" style={{ color: 'var(--text-primary)' }}>
          {user.name?.split(' ')[0]}
        </span>
        <ChevronIcon open={open} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border shadow-lg"
          style={{
            background:  'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            boxShadow:   'var(--shadow-lg)',
          }}
        >
          {/* Identité */}
          <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
            <p className="mt-0.5 text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            {user.tier === 'PREMIUM' && (
              <span
                className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(201,162,74,0.15)',
                  color:      'var(--gold-500)',
                }}
              >
                PREMIUM
              </span>
            )}
          </div>

          {/* Liens — dashboard rôle-spécifique (si pas PLAYER) + profil */}
          <div className="py-1">
            {role !== 'PLAYER' && (
              <DropdownLink href={dashboardHref} label={dashboardLabel} icon={<DashboardIcon />} />
            )}
            <DropdownLink href="/profil" label="Mon profil" icon={<UserIcon />} />
          </div>

          {/* Déconnexion */}
          <div className="border-t py-1" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:opacity-70"
              style={{ color: 'var(--color-danger)' }}
            >
              <LogoutIcon />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Composants internes ─────────────────────────────────────────────────── */

function DropdownLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm transition hover:opacity-70"
      style={{ color: 'var(--text-secondary)' }}
    >
      {icon}
      {label}
    </Link>
  );
}

/* ── Icons ───────────────────────────────────────────────────────────────── */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--text-muted)', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function UserIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
}
function DashboardIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function BuildingIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M6 11h4M14 11h4M6 15h4M14 15h4"/></svg>;
}
function WhistleIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m4 4 4.5 4.5"/><circle cx="14" cy="14" r="6"/><path d="m20 8-6 6"/></svg>;
}
function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
