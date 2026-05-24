'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset } from '@/lib/actions/password-reset';

export default function ReinitialiserMotDePassePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const linkInvalid = !email || !token;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await confirmPasswordReset(email, token, password, confirm);
      if (res.success) {
        setDone(true);
        setTimeout(() => router.push('/login'), 2000);
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

      {linkInvalid ? (
        <div className="space-y-4">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 500,
            }}
          >
            Lien invalide
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Ce lien de réinitialisation est incomplet ou a expiré.
          </p>
          <Link
            href="/mot-de-passe-oublie"
            className="inline-block text-sm font-medium transition hover:underline"
            style={{ color: 'var(--court-700)' }}
          >
            Demander un nouveau lien →
          </Link>
        </div>
      ) : done ? (
        <div
          className="rounded-2xl border p-6 text-center"
          style={{ borderColor: 'var(--court-100)', background: 'var(--court-100)' }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 500,
              color: 'var(--court-700)',
            }}
          >
            Mot de passe mis à jour
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--court-700)' }}>
            Redirection vers la connexion…
          </p>
        </div>
      ) : (
        <>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '30px',
              fontWeight: 500,
            }}
          >
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Choisissez un mot de passe pour <strong>{email}</strong>.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: 'var(--cream-200)', background: 'var(--off-white)' }}
              />
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: 'var(--cream-200)', background: 'var(--off-white)' }}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending || !password || !confirm}
              className="w-full rounded-xl py-3 text-sm font-medium text-white transition disabled:opacity-50"
              style={{ background: 'var(--court-700)' }}
            >
              {isPending ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
