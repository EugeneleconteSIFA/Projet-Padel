'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerForTournament } from '@/lib/actions/tournament';
import type { UserRegistrationStatus } from '@/lib/actions/tournament';

/* =============================================================================
   RegisterButton — CTA d'inscription sur la fiche tournoi.
   Props transmises par le Server Component parent.
   ============================================================================= */

interface Props {
  editionId:          string;
  slug:               string;
  price:              number;
  maxTeams:           number;
  teams:              number;
  isLoggedIn:         boolean;
  registrationStatus: UserRegistrationStatus;
}

type Step = 'idle' | 'modal-confirm' | 'loading' | 'confirmed' | 'waitlisted' | 'error';

export function RegisterButton({
  editionId,
  slug,
  price,
  maxTeams,
  teams,
  isLoggedIn,
  registrationStatus,
}: Props) {
  const router            = useRouter();
  const [step, setStep]   = useState<Step>('idle');
  const [error, setError] = useState('');
  const [waitlistPos, setWaitlistPos] = useState(0);

  const isFull = teams >= maxTeams;

  /* ── Déjà inscrit ─────────────────────────────────────────────────────── */
  if (registrationStatus === 'CONFIRMED') {
    return <StatusBadge icon="✓" label="Vous êtes inscrit à ce tournoi" color="court" />;
  }
  if (registrationStatus === 'WAITING_LIST') {
    return <StatusBadge icon="⏳" label="Vous êtes sur la liste d'attente" color="gold" />;
  }

  /* ── États résultat ───────────────────────────────────────────────────── */
  if (step === 'confirmed') {
    return (
      <div
        className="rounded-xl border p-4 text-center"
        style={{ borderColor: 'var(--court-400)', background: 'color-mix(in srgb, var(--court-100) 40%, transparent)' }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--court-700)' }}>
          ✓ Inscription confirmée !
        </p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Vous êtes bien inscrit. Le paiement en ligne sera disponible prochainement.
        </p>
      </div>
    );
  }

  if (step === 'waitlisted') {
    return (
      <div
        className="rounded-xl border p-4 text-center"
        style={{ borderColor: 'var(--gold-400)', background: 'color-mix(in srgb, var(--gold-100) 40%, transparent)' }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--gold-700)' }}>
          ⏳ Vous êtes sur la liste d&apos;attente
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          Position {waitlistPos} — vous serez notifié si une place se libère.
        </p>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="space-y-2">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error || 'Une erreur est survenue.'}
        </p>
        <button
          onClick={() => setStep('idle')}
          className="w-full rounded-xl border py-2.5 text-sm font-medium"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  /* ── Modal de confirmation ────────────────────────────────────────────── */
  if (step === 'modal-confirm' || step === 'loading') {
    const loading = step === 'loading';

    async function handleConfirm() {
      setStep('loading');
      try {
        const result = await registerForTournament(editionId);
        if (result.status === 'CONFIRMED') {
          setStep('confirmed');
        } else if (result.status === 'WAITING_LIST') {
          setWaitlistPos(result.position);
          setStep('waitlisted');
        } else if (result.status === 'ALREADY_REGISTERED') {
          setStep('error');
          setError('Vous êtes déjà inscrit à ce tournoi.');
        } else if (result.status === 'AUTH_REQUIRED') {
          router.push(`/login?callbackUrl=/tournois/${slug}`);
        } else {
          setStep('error');
          setError(result.message);
        }
      } catch {
        setStep('error');
        setError('Une erreur inattendue est survenue.');
      }
    }

    return (
      <div className="space-y-4">
        <div
          className="rounded-xl border p-4 text-sm"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-muted)' }}
        >
          {isFull ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              Le tournoi est complet. Vous serez ajouté(e) à la liste d&apos;attente et notifié(e) si une place se libère.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Mode</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Solo</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Inscription</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{price} € / équipe</span>
              </div>
              <div
                className="mt-2 rounded-lg px-3 py-2 text-xs"
                style={{ background: 'color-mix(in srgb, var(--gold-100) 60%, transparent)', color: 'var(--gold-700)' }}
              >
                💳 Paiement en ligne bientôt disponible — inscription gratuite pendant le POC.
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          style={{ background: isFull ? 'var(--gold-600)' : 'var(--court-700)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner /> {isFull ? 'Inscription en liste…' : 'Confirmation…'}
            </span>
          ) : isFull ? (
            "Rejoindre la liste d'attente"
          ) : (
            "Confirmer l'inscription"
          )}
        </button>

        <button
          onClick={() => setStep('idle')}
          disabled={loading}
          className="w-full rounded-xl border py-2.5 text-sm font-medium transition hover:opacity-80 disabled:opacity-40"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          Annuler
        </button>
      </div>
    );
  }

  /* ── État idle — bouton principal ─────────────────────────────────────── */
  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/tournois/${slug}`);
      return;
    }
    setStep('modal-confirm');
  }

  if (isFull) {
    return (
      <div className="space-y-2">
        <button
          disabled
          className="w-full cursor-not-allowed rounded-xl py-3.5 text-sm font-semibold opacity-50"
          style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
        >
          Tournoi complet
        </button>
        <button
          onClick={handleClick}
          className="w-full rounded-xl border py-3 text-sm font-medium transition hover:opacity-80"
          style={{ borderColor: 'var(--court-600)', color: 'var(--court-600)' }}
        >
          Rejoindre la liste d&apos;attente
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
      style={{ background: 'var(--court-700)' }}
    >
      {isLoggedIn ? `S'inscrire · ${price} €` : "Se connecter pour s'inscrire"}
    </button>
  );
}

/* =============================================================================
   StatusBadge
   ============================================================================= */

function StatusBadge({ icon, label, color }: { icon: string; label: string; color: 'court' | 'gold' }) {
  const borderColor = color === 'court' ? 'var(--court-400)' : 'var(--gold-400)';
  const bgColor     = color === 'court'
    ? 'color-mix(in srgb, var(--court-100) 40%, transparent)'
    : 'color-mix(in srgb, var(--gold-100) 40%, transparent)';
  const textColor   = color === 'court' ? 'var(--court-700)' : 'var(--gold-700)';
  return (
    <div
      className="rounded-xl border px-4 py-3 text-center text-sm font-medium"
      style={{ borderColor, background: bgColor, color: textColor }}
    >
      {icon} {label}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}
