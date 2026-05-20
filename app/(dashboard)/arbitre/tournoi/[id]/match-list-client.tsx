'use client';

import { useState } from 'react';
import { ScoreEntry, type MatchData } from './score-entry';

/* =============================================================================
   MatchListClient — Liste des matchs par bracket avec ouverture du score-entry.
   'use client' requis pour le drawer de saisie.
   ============================================================================= */

interface MatchShape {
  id:          string;
  status:      string;
  scheduledAt: string | null;
  winnerTeamId:string | null;
  teamA:       { id: string; name: string };
  teamB:       { id: string; name: string };
  scores:      { setNumber: number; teamAGames: number; teamBGames: number }[];
}

interface BracketShape {
  id:      string;
  label:   string;
  matches: MatchShape[];
}

interface Props {
  brackets: BracketShape[];
}

export function MatchListClient({ brackets }: Props) {
  const [activeMatch, setActiveMatch] = useState<MatchData | null>(null);
  const [refreshKey, setRefreshKey]   = useState(0);

  function openMatch(m: MatchShape) {
    setActiveMatch({
      id:     m.id,
      status: m.status,
      teamA:  { name: m.teamA.name },
      teamB:  { name: m.teamB.name },
      scores: m.scores,
    });
  }

  function handleSaved() {
    setRefreshKey(k => k + 1); // force re-render (données rechargées côté serveur au refresh)
  }

  return (
    <>
      <div className="flex flex-col gap-6" key={refreshKey}>
        {brackets.map(bracket => (
          <section key={bracket.id}>
            {/* Titre du tableau */}
            <h2
              className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--court-700)' }}
            >
              {bracket.label}
            </h2>

            <div
              className="overflow-hidden rounded-2xl border"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
            >
              {bracket.matches.map((m, i) => {
                const isLast   = i === bracket.matches.length - 1;
                const isDone   = m.status === 'completed';
                const isLive   = m.status === 'live';
                const canEdit  = m.status !== 'walkover' && m.status !== 'cancelled';

                const scoreStr = m.scores.length > 0
                  ? m.scores.map(s => `${s.teamAGames}–${s.teamBGames}`).join('  ')
                  : null;

                return (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 px-4 py-3.5 ${!isLast ? 'border-b' : ''} ${isLive ? 'relative' : ''}`}
                    style={{
                      borderColor: 'var(--border-subtle)',
                      background: isLive ? 'rgba(201,162,74,0.05)' : undefined,
                    }}
                  >
                    {/* Indicateur live */}
                    {isLive && (
                      <span
                        className="absolute left-0 top-0 h-full w-0.5 rounded-r"
                        style={{ background: 'var(--gold-500)' }}
                      />
                    )}

                    {/* Contenu */}
                    <div className="min-w-0 flex-1">
                      {/* Heure */}
                      <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {m.scheduledAt
                          ? new Date(m.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </p>

                      {/* Équipes */}
                      <div className="mt-0.5 flex items-center gap-2">
                        <span
                          className="text-sm font-semibold truncate"
                          style={{
                            color: m.winnerTeamId === m.teamA.id
                              ? 'var(--court-700)'
                              : isDone
                              ? 'var(--text-muted)'
                              : 'var(--text-primary)',
                            maxWidth: '120px',
                          }}
                        >
                          {m.teamA.name}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>vs</span>
                        <span
                          className="text-sm font-semibold truncate"
                          style={{
                            color: m.winnerTeamId === m.teamB.id
                              ? 'var(--court-700)'
                              : isDone
                              ? 'var(--text-muted)'
                              : 'var(--text-primary)',
                            maxWidth: '120px',
                          }}
                        >
                          {m.teamB.name}
                        </span>
                      </div>

                      {/* Score */}
                      {scoreStr && (
                        <p
                          className="mt-0.5 font-mono text-[12px] font-semibold"
                          style={{ color: isDone ? 'var(--court-700)' : 'var(--gold-500)' }}
                        >
                          {scoreStr}
                        </p>
                      )}
                    </div>

                    {/* Badge statut + bouton */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <StatusPill status={m.status} />
                      {canEdit && (
                        <button
                          onClick={() => openMatch(m)}
                          className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition hover:opacity-80 active:scale-95"
                          style={{
                            background: isLive ? 'var(--gold-500)' : 'var(--court-700)',
                            color:      '#fff',
                          }}
                        >
                          {isDone ? 'Modifier' : isLive ? 'Score →' : 'Saisir'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {bracket.matches.length === 0 && (
                <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  Aucun match dans ce tableau.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Drawer de saisie des scores */}
      {activeMatch && (
        <ScoreEntry
          match={activeMatch}
          onClose={() => setActiveMatch(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    scheduled: { label: 'Programmé',  bg: 'var(--bg-muted)',         color: 'var(--text-muted)' },
    live:      { label: 'En cours',   bg: 'rgba(201,162,74,.15)',    color: 'var(--gold-500)' },
    completed: { label: 'Terminé',    bg: 'rgba(15,76,58,.1)',       color: 'var(--court-700)' },
    walkover:  { label: 'Walkover',   bg: 'rgba(166,51,46,.1)',      color: 'var(--color-danger)' },
    cancelled: { label: 'Annulé',     bg: 'rgba(166,51,46,.1)',      color: 'var(--color-danger)' },
  };
  const s = map[status] ?? map.scheduled;
  return (
    <span
      className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
