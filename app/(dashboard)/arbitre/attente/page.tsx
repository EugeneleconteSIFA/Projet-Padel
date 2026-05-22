import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

/* =============================================================================
   Page d'attente validation — compte juge-arbitre.
   Affichée quand un compte juge-arbitre est en attente de validation par l'admin.
   ============================================================================= */

export default async function ArbitreAttentePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Vérifier que l'utilisateur est bien un arbitre
  if (session.user.role !== 'REFEREE') {
    redirect('/');
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      <div
        className="mx-auto max-w-md rounded-2xl border p-8 text-center"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Icône d'attente */}
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'var(--court-100)' }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--court-700)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Titre */}
        <h1
          className="mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          Compte en attente de validation
        </h1>

        {/* Message */}
        <p
          className="mb-6 text-sm leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Votre compte juge-arbitre est en attente de validation. Vous serez prévenu dès que votre espace sera activé.
        </p>

        {/* Bouton déconnexion */}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="rounded-xl border px-6 py-2.5 text-sm font-medium transition hover:opacity-80"
            style={{
              borderColor: 'var(--border-strong)',
              color: 'var(--text-secondary)',
            }}
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
