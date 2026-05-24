'use client';

import { logout } from '@/lib/actions/auth';

/* Bouton déconnexion — client isolé pour ne pas polluer le layout serveur */
export function LogoutButton({
  className,
  style,
  label = 'Déconnexion',
}: {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => logout()}
      className={className ?? 'hidden rounded-lg px-3 py-2 text-sm font-medium transition hover:opacity-70 sm:block'}
      style={style ?? { color: 'var(--text-muted)' }}
    >
      {label}
    </button>
  );
}
