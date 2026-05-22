'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { loginWithMagicLink } from '@/lib/actions/auth';

/* =============================================================================
   The Court — Page connexion.
   V1 : email + mot de passe + magic link via Auth.js v5.
   OAuth Google / Apple prévu en V2.
   Redirection automatique selon rôle et statut de validation après connexion.
   ============================================================================= */

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/';

  const [mode,     setMode]     = useState<'password' | 'magic'>('password');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'magic') {
      const res = await loginWithMagicLink(email);
      if (res.success) setSent(true);
      else setError(res.error);
    } else {
      // Utiliser signIn directement avec callbackUrl
      // Le middleware fera le dispatch automatique après connexion
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect.');
      } else {
        // Rediriger vers la page demandée ou laisser le middleware faire le dispatch
        router.push(callbackUrl);
      }
    }

    setLoading(false);
  }

  return (
    <div>
      {/* Lien retour desktop */}
      <Link
        href="/"
        className="mb-8 hidden items-center gap-1.5 text-sm font-medium transition hover:underline md:inline-flex"
        style={{ color: 'var(--court-600)' }}
      >
        ← Retour aux tournois
      </Link>

      {/* Titre */}
      <h1
        className="tracking-tight"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          fontWeight: 500,
        }}
      >
        Se connecter
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        Pas encore inscrit ?{' '}
        <Link
          href="/signup"
          className="font-medium transition hover:underline"
          style={{ color: 'var(--court-700)' }}
        >
          Créer un compte →
        </Link>
      </p>

      {/* Toggle password / magic link */}
      <div
        className="mt-8 flex rounded-xl border p-1"
        style={{ borderColor: 'var(--cream-200)', background: 'var(--cream-100)' }}
      >
        <ModeTab
          label="Mot de passe"
          active={mode === 'password'}
          onClick={() => { setMode('password'); setSent(false); }}
        />
        <ModeTab
          label="Lien magique"
          active={mode === 'magic'}
          onClick={() => { setMode('magic'); setSent(false); }}
        />
      </div>

      {/* Formulaire */}
      {sent ? (
        <MagicLinkSent email={email} onReset={() => setSent(false)} />
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {/* Erreur */}
          {error && (
            <div
              className="rounded-xl border px-4 py-3 text-sm"
              style={{ borderColor: 'var(--color-danger)', background: 'rgba(166,51,46,0.08)', color: 'var(--color-danger)' }}
            >
              {error}
            </div>
          )}
          {/* Email */}
          <Field label="Adresse email" htmlFor="email">
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              className="w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition focus:ring-2"
              style={{
                background: 'var(--off-white)',
                borderColor: 'var(--cream-200)',
                color: 'var(--text-primary)',
              }}
            />
          </Field>

          {/* Mot de passe (mode password uniquement) */}
          {mode === 'password' && (
            <Field label="Mot de passe" htmlFor="password">
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border px-4 py-3 pr-11 text-sm font-medium outline-none transition focus:ring-2"
                  style={{
                    background: 'var(--off-white)',
                    borderColor: 'var(--cream-200)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </Field>
          )}

          {/* Mot de passe oublié */}
          {mode === 'password' && (
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-medium transition hover:underline"
                style={{ color: 'var(--court-600)' }}
              >
                Mot de passe oublié ?
              </Link>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || (mode === 'password' && !password)}
            className="mt-2 w-full rounded-xl py-3 text-sm font-medium text-white transition disabled:opacity-50"
            style={{ background: 'var(--court-700)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                {mode === 'magic' ? 'Envoi en cours…' : 'Connexion…'}
              </span>
            ) : mode === 'magic' ? (
              'Recevoir le lien magique'
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      )}

      {/* Séparateur */}
      {mode === 'password' && !sent && (
        <>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--cream-200)' }} />
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-3 text-xs font-medium"
                style={{ background: 'var(--bg-page)', color: 'var(--text-muted)' }}
              >
                ou
              </span>
            </div>
          </div>

          {/* OAuth (V2 — désactivé) */}
          <div className="flex flex-col gap-2">
            <OAuthButton label="Continuer avec Google" disabled icon={<GoogleIcon />} />
            <OAuthButton label="Continuer avec Apple" disabled icon={<AppleIcon />} />
          </div>
          <p className="mt-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Google &amp; Apple — disponibles en V2
          </p>
        </>
      )}
    </div>
  );
}

/* =============================================================================
   COMPOSANTS LOCAUX
   ============================================================================= */

function ModeTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-lg py-2 text-sm font-medium transition"
      style={{
        background: active ? 'var(--off-white)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
        boxShadow: active ? 'var(--shadow-xs)' : 'none',
      }}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function MagicLinkSent({
  email,
  onReset,
}: {
  email: string;
  onReset: () => void;
}) {
  return (
    <div
      className="mt-6 rounded-xl border p-6 text-center"
      style={{ borderColor: 'var(--court-100)', background: 'var(--court-100)' }}
    >
      <div
        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: 'var(--court-700)' }}
      >
        <MailIcon color="var(--cream-50)" />
      </div>
      <h2
        className="tracking-tight"
        style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500 }}
      >
        Lien envoyé
      </h2>
      <p className="mt-2 text-sm" style={{ color: 'var(--court-700)' }}>
        Un lien de connexion a été envoyé à{' '}
        <strong className="font-medium">{email}</strong>
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
        Vérifiez vos spams si vous ne le voyez pas dans les 2 minutes.
      </p>
      <button
        onClick={onReset}
        className="mt-4 text-sm font-medium transition hover:underline"
        style={{ color: 'var(--court-600)' }}
      >
        Essayer avec une autre adresse
      </button>
    </div>
  );
}

function OAuthButton({
  label,
  icon,
  disabled = false,
}: {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-xl border py-2.5 text-sm font-medium transition hover:bg-[var(--cream-200)] disabled:cursor-not-allowed disabled:opacity-40"
      style={{ borderColor: 'var(--cream-200)', color: 'var(--text-primary)' }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ── Icons ─────────────────────────────────────────────────────────────────── */

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function MailIcon({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}
