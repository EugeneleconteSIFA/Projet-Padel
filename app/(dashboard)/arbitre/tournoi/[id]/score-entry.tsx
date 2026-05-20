'use client';

import { useState, useTransition } from 'react';
import { submitScore, startMatch } from '@/lib/actions/arbitre';

/* =============================================================================
   ScoreEntry — Interface mobile-first de saisie des scores.
   Affichée dans un modal/drawer depuis la page tournoi arbitre.
   ============================================================================= */

export interface MatchData {
  id:     string;
  status: string;
  teamA:  { name: string };
  teamB:  { name: string };
  scores: { setNumber: number; teamAGames: number; teamBGames: number }[];
}

interface Props {
  match:    MatchData;
  onClose:  () => void;
  onSaved?: () => void;
}

type Set = { a: number; b: number };

/* Valeurs de jeux possibles au padel : 0–7 */
const GAMES_VALUES = [0, 1, 2, 3, 4, 5, 6, 7];

export function ScoreEntry({ match, onClose, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /* Initialise les sets depuis les scores existants ou 2 sets vides */
  const initSets = (): Set[] => {
    if (match.scores.length > 0) {
      return match.scores.map(s => ({ a: s.teamAGames, b: s.teamBGames }));
    }
    return [{ a: 0, b: 0 }, { a: 0, b: 0 }];
  };

  const [sets, setSets] = useState<Set[]>(initSets);

  function updateGames(setIdx: number, team: 'a' | 'b', games: number) {
    setSets(prev => prev.map((s, i) => i === setIdx ? { ...s, [team]: games } : s));
  }

  function addSet() {
    if (sets.length >= 3) return;
    setSets(prev => [...prev, { a: 0, b: 0 }]);
  }

  function removeSet(idx: number) {
    if (sets.length <= 1) return;
    setSets(prev => prev.filter((_, i) => i !== idx));
  }

  /* Détermine qui mène */
  const setsWonA = sets.filter(s => s.a > s.b).length;
  const setsWonB = sets.filter(s => s.b > s.a).length;

  async function handleSave() {
    setError(null);

    // Validation : chaque set doit avoir un vainqueur clair (pas d'égalité en padel)
    for (let i = 0; i < sets.length; i++) {
      if (sets[i].a === sets[i].b) {
        setError(`Le set ${i + 1} est nul (${sets[i].a}–${sets[i].b}). En padel, chaque set doit avoir un vainqueur.`);
        return;
      }
    }

    startTransition(async () => {
      try {
        if (match.status === 'scheduled') {
          await startMatch(match.id);
        }
        const result = await submitScore(
          match.id,
          sets.map((s, i) => ({ setNumber: i + 1, teamAGames: s.a, teamBGames: s.b })),
        );
        if (!result.success) {
          setError(result.error ?? 'Erreur lors de l\'enregistrement.');
          return;
        }
        setSuccess(true);
        setTimeout(() => { onSaved?.(); onClose(); }, 900);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue');
      }
    });
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Drawer / Modal */}
      <div
        className="w-full rounded-t-3xl sm:max-w-md sm:rounded-3xl"
        style={{
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '92dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle mobile */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full" style={{ background: 'var(--border-subtle)' }} />
        </div>

        <div className="px-5 pb-8 pt-5 sm:px-6 sm:pt-6">
          {/* En-tête */}
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p
                className="font-mono text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                Saisie du score
              </p>
              <h2
                className="mt-1 leading-tight"
                style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 500, color: 'var(--text-primary)' }}
              >
                {match.teamA.name} vs {match.teamB.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 transition hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Score résumé */}
          <div
            className="mb-5 flex items-center justify-center gap-4 rounded-2xl py-4"
            style={{ background: 'var(--court-100)' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '36px',
                fontWeight: 700,
                color: setsWonA > setsWonB ? 'var(--court-700)' : 'var(--text-secondary)',
              }}
            >
              {setsWonA}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)' }}>
              sets
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '36px',
                fontWeight: 700,
                color: setsWonB > setsWonA ? 'var(--court-700)' : 'var(--text-secondary)',
              }}
            >
              {setsWonB}
            </span>
          </div>

          {/* Saisie par set */}
          <div className="flex flex-col gap-3">
            {sets.map((s, i) => (
              <div key={i}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className="font-mono text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Set {i + 1}
                  </span>
                  {sets.length > 1 && (
                    <button
                      onClick={() => removeSet(i)}
                      className="text-xs transition hover:opacity-70"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                <div
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: 'var(--bg-muted)' }}
                >
                  {/* Équipe A */}
                  <div className="flex-1">
                    <p className="mb-1.5 truncate text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {match.teamA.name}
                    </p>
                    <GamePicker value={s.a} onChange={v => updateGames(i, 'a', v)} />
                  </div>

                  <span style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: 300 }}>–</span>

                  {/* Équipe B */}
                  <div className="flex-1">
                    <p className="mb-1.5 truncate text-right text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {match.teamB.name}
                    </p>
                    <GamePicker value={s.b} onChange={v => updateGames(i, 'b', v)} reverse />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ajouter set */}
          {sets.length < 3 && (
            <button
              onClick={addSet}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition hover:opacity-70"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)', borderStyle: 'dashed' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Ajouter un 3ᵉ set
            </button>
          )}

          {/* Erreur */}
          {error && (
            <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(166,51,46,.1)', color: 'var(--color-danger)' }}>
              {error}
            </p>
          )}

          {/* Succès */}
          {success && (
            <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(15,76,58,.1)', color: 'var(--court-700)' }}>
              Score enregistré ✓
            </p>
          )}

          {/* Actions */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border px-4 py-3 text-sm font-medium transition hover:opacity-70"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || success}
              className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ background: 'var(--court-700)' }}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Enregistrement…
                </span>
              ) : success ? (
                'Enregistré ✓'
              ) : (
                'Valider le score'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── GamePicker — sélecteur tactile de jeux (0-7) ─────────────────────────── */

function GamePicker({
  value,
  onChange,
  reverse = false,
}: {
  value:    number;
  onChange: (v: number) => void;
  reverse?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-1 ${reverse ? 'justify-end' : 'justify-start'}`}>
      {GAMES_VALUES.map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className="flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-semibold transition active:scale-95"
          style={{
            background:  v === value ? 'var(--court-700)' : 'var(--bg-surface)',
            color:       v === value ? '#fff' : 'var(--text-secondary)',
            border:      `1.5px solid ${v === value ? 'var(--court-700)' : 'var(--border-subtle)'}`,
          }}
        >
          {v}
        </button>
      ))}
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
