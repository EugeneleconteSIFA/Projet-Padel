'use client';

import { useState, useTransition } from 'react';
import { generateBracket } from '@/lib/actions/arbitre';
import { useRouter } from 'next/navigation';

/* =============================================================================
   GenerateBracketButton — bouton client pour générer le tableau d'un tournoi.
   ============================================================================= */

interface Props {
  editionId: string;
}

export function GenerateBracketButton({ editionId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateBracket(editionId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? 'Erreur lors de la génération du tableau.');
      }
    });
  }

  return (
    <div
      className="mb-6 rounded-2xl border p-5 text-center"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <p
        className="mb-1 text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        Aucun tableau généré pour ce tournoi.
      </p>
      <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        Toutes les équipes confirmées seront réparties aléatoirement.
      </p>

      {error && (
        <p
          className="mb-3 rounded-lg px-3 py-2 text-sm"
          style={{ background: 'rgba(166,51,46,.1)', color: 'var(--color-danger)' }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: 'var(--court-700)' }}
      >
        {isPending ? (
          <>
            <Spinner />
            Génération en cours…
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Générer le tableau
          </>
        )}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}
