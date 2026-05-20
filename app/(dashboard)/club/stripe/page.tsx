import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Paiements · The Court' };

/* =============================================================================
   Page /club/stripe — configuration Stripe Connect.
   POC : Stripe non encore branché. Page placeholder informative.
   ============================================================================= */

export default function StripePage() {
  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      <div className="mx-auto max-w-xl">

        {/* Retour */}
        <Link
          href="/club"
          className="mb-8 flex items-center gap-1.5 text-sm transition hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronLeftIcon />
          Retour au dashboard
        </Link>

        {/* Header */}
        <h1
          className="mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 500,
            lineHeight: 1.1,
          }}
        >
          Configurer les paiements
        </h1>
        <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
          Encaissez les inscriptions directement sur votre compte bancaire via Stripe Connect.
        </p>

        {/* Card principale */}
        <div
          className="rounded-2xl border p-6"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          {/* Icône */}
          <div
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: 'color-mix(in srgb, var(--gold-100) 60%, transparent)' }}
          >
            <EuroIcon />
          </div>

          <h2 className="mb-2 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Stripe Connect — bientôt disponible
          </h2>
          <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Cette fonctionnalité est en cours de développement. Une fois activée, vous pourrez&nbsp;:
          </p>

          <ul className="mb-6 space-y-3">
            {[
              'Encaisser les inscriptions directement sur votre compte bancaire',
              'Proposer le paiement partagé entre les deux joueurs d\'une équipe',
              'Générer des factures automatiques pour chaque inscription',
              'Activer les remboursements automatiques si un tournoi est annulé',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="mt-0.5 shrink-0" style={{ color: 'var(--court-600)' }}>✓</span>
                {item}
              </li>
            ))}
          </ul>

          {/* Banner POC */}
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: 'color-mix(in srgb, var(--gold-100) 50%, transparent)',
              borderLeft: '3px solid var(--gold-500)',
              color: 'var(--gold-800)',
            }}
          >
            <strong>Mode POC actif</strong> — les inscriptions sont gratuites et confirmées
            directement. Le paiement sera requis dès l&apos;activation de Stripe.
          </div>
        </div>

        {/* Retour dashboard */}
        <div className="mt-6 text-center">
          <Link
            href="/club"
            className="text-sm transition hover:underline"
            style={{ color: 'var(--court-600)' }}
          >
            Retourner au dashboard club →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function EuroIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gold-600)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12" />
      <path d="M4 14h9" />
      <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2" />
    </svg>
  );
}
