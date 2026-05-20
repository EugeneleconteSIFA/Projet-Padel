'use client';

import { logout } from '@/lib/actions/auth';

/* Bouton déconnexion — client isolé pour ne pas polluer le layout serveur */
export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="hidden rounded-lg px-3 py-2 text-sm font-medium transition hover:opacity-70 sm:block"
      style={{ color: 'var(--text-muted)' }}
    >
      Déconnexion
    </button>
  );
}
