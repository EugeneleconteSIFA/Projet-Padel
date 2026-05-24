'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/actions/password-reset';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setSent(true);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div>
      <Link
        href="/login"
        className="mb-8 hidden items-center gap-1.5 text-sm font-medium transition hover:underline md:inline-flex"
        style={{ color: 'var(--court-600)' }}
      >
        ← Retour à la connexion
      </Link>

      {sent ? (
        <div
          className="rounded-2xl border p-6 text-center"
          style={{ borderColor: 'var(--court-100)', background: 'var(--court-100)' }}
        >
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'var(--court-700)' }}
          >
            <MailIcon />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 500,
              color: 'var(--court-700)',
            }}
          >
            Lien envoyé
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--court-700)' }}>
            Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans les prochaines minutes.
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            Vérifiez vos spams si vous ne le trouvez pas.
          </p>
          <button
            type="button"
            onClick={() => { setSent(false); setEmail(''); }}
            className="mt-5 text-sm font-medium transition hover:underline"
            style={{ color: 'var(--court-600)' }}
          >
            Utiliser une autre adresse
          </button>
        </div>
      ) : (
        <>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '30px',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            Mot de passe oublié ?
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Entrez votre adresse email et nous vous enverrons un lien pour choisir un nouveau mot de passe.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                className="w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition focus:ring-2"
                style={{
                  background:  'var(--off-white)',
                  borderColor: 'var(--cream-200)',
                  color:       'var(--text-primary)',
                }}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending || !email}
              className="w-full rounded-xl py-3 text-sm font-medium text-white transition disabled:opacity-50"
              style={{ background: 'var(--court-700)' }}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Envoi en cours…
                </span>
              ) : (
                'Recevoir le lien de réinitialisation'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Vous vous souvenez ?{' '}
            <Link
              href="/login"
              className="font-medium transition hover:underline"
              style={{ color: 'var(--court-700)' }}
            >
              Se connecter →
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cream-50)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}
