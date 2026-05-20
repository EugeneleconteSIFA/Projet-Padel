import Link from 'next/link';

/* =============================================================================
   Page 404 — globale.
   ============================================================================= */

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      {/* Numéro */}
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(80px, 20vw, 160px)',
          fontWeight: 500,
          lineHeight: 1,
          color: 'var(--court-700)',
          opacity: 0.15,
          userSelect: 'none',
        }}
      >
        404
      </p>

      {/* Message */}
      <h1
        className="-mt-4"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
        }}
      >
        Cette page n'existe pas.
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Le tournoi, le profil ou la page que vous cherchez a peut-être été déplacé ou supprimé.
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--court-700)' }}
        >
          Retour aux tournois
        </Link>
        <Link
          href="/vitrine"
          className="rounded-xl border px-6 py-3 text-sm font-medium transition hover:opacity-80"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
        >
          À propos de The Court
        </Link>
      </div>

      {/* Branding */}
      <p
        className="mt-16 text-sm"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
      >
        the court<span style={{ color: 'var(--gold-500)' }}>.</span>
      </p>
    </div>
  );
}
