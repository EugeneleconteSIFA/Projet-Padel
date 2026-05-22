'use client';

import { useEffect } from 'react';

/* =============================================================================
   Page erreur globale — error boundary Next.js App Router.
   'use client' obligatoire.
   ============================================================================= */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO : envoyer à Sentry quand configuré
    console.error('[The Court] Erreur globale :', error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      {/* Icône */}
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: 'rgba(166,51,46,0.1)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 4vw, 32px)',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
        }}
      >
        Une erreur est survenue.
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Quelque chose s&apos;est mal passé de notre côté. L&apos;équipe a été notifiée.
      </p>

      {/* Digest pour le débogage */}
      {error.digest && (
        <p
          className="mt-2 rounded-lg px-3 py-1.5 text-xs"
          style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
        >
          Référence : {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--court-700)' }}
        >
          Réessayer
        </button>
        <a
          href="/"
          className="rounded-xl border px-6 py-3 text-sm font-medium transition hover:opacity-80"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
        >
          Retour à l&apos;accueil
        </a>
      </div>
    </div>
  );
}
