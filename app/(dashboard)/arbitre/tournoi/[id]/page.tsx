import Link from 'next/link';
import { getArbitreTournoi } from '@/lib/actions/arbitre';
import { MatchListClient } from './match-list-client';
import { GenerateBracketButton } from './generate-bracket-button';

/* =============================================================================
   /arbitre/tournoi/[id] — Gestion d'une édition de tournoi par l'arbitre.
   Interface mobile-first : tableau des matchs + saisie des scores.
   ============================================================================= */

/* ── Données mock fallback ── */
const MOCK_EDITION = {
  id: 'edition-1',
  status: 'IN_PROGRESS',
  startDate: new Date().toISOString(),
  endDate:   new Date().toISOString(),
  maxTeams:  16,
  tournament: {
    name:  'Open de Printemps Padel',
    club:  { name: 'Padel Club Lille Nord' },
  },
  brackets: [
    {
      id:    'bracket-A',
      label: 'Poule A',
      order: 0,
      matches: [
        {
          id:          'match-1',
          status:      'completed',
          scheduledAt: new Date().toISOString(),
          teamA:       { id: 'ta1', name: 'Dupont / Martin' },
          teamB:       { id: 'tb1', name: 'Lefèvre / Morel' },
          winnerTeamId:'ta1',
          scores: [
            { setNumber: 1, teamAGames: 6, teamBGames: 3 },
            { setNumber: 2, teamAGames: 6, teamBGames: 4 },
          ],
        },
        {
          id:          'match-2',
          status:      'live',
          scheduledAt: new Date().toISOString(),
          teamA:       { id: 'ta2', name: 'Petit / Bernard' },
          teamB:       { id: 'tb2', name: 'Garcia / Ramos' },
          winnerTeamId: null,
          scores: [
            { setNumber: 1, teamAGames: 6, teamBGames: 2 },
          ],
        },
        {
          id:          'match-3',
          status:      'scheduled',
          scheduledAt: new Date(Date.now() + 3600000).toISOString(),
          teamA:       { id: 'ta3', name: 'Simon / Laurent' },
          teamB:       { id: 'tb3', name: 'Meyer / Wolf' },
          winnerTeamId: null,
          scores: [],
        },
      ],
    },
    {
      id:    'bracket-B',
      label: 'Poule B',
      order: 1,
      matches: [
        {
          id:          'match-4',
          status:      'scheduled',
          scheduledAt: new Date(Date.now() + 7200000).toISOString(),
          teamA:       { id: 'ta4', name: 'Rousseau / Blanc' },
          teamB:       { id: 'tb4', name: 'Girard / Leroy' },
          winnerTeamId: null,
          scores: [],
        },
        {
          id:          'match-5',
          status:      'scheduled',
          scheduledAt: new Date(Date.now() + 10800000).toISOString(),
          teamA:       { id: 'ta5', name: 'Fournier / Michel' },
          teamB:       { id: 'tb5', name: 'Legrand / Renard' },
          winnerTeamId: null,
          scores: [],
        },
      ],
    },
  ],
  referees: [
    {
      isHead: true,
      referee: { user: { name: 'Arbitre Principal' } },
    },
  ],
};

function statusColor(status: string) {
  if (status === 'completed') return 'var(--court-700)';
  if (status === 'live')      return 'var(--gold-500)';
  return 'var(--text-muted)';
}

function statusLabel(status: string) {
  if (status === 'completed') return 'Terminé';
  if (status === 'live')      return 'En cours';
  return 'À jouer';
}

function formatTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default async function ArbitreTournoiPage({
  params,
}: {
  params: { id: string };
}) {
  const edition = await getArbitreTournoi(params.id).catch(() => MOCK_EDITION) as typeof MOCK_EDITION;

  const totalMatches  = edition.brackets.reduce((acc, b) => acc + b.matches.length, 0);
  const doneMatches   = edition.brackets.reduce((acc, b) => acc + b.matches.filter(m => m.status === 'completed').length, 0);
  const liveMatches   = edition.brackets.reduce((acc, b) => acc + b.matches.filter(m => m.status === 'live').length, 0);

  /* Aplatit tous les matchs pour le composant client */
  const allMatches = edition.brackets.flatMap(b =>
    b.matches.map(m => ({
      ...m,
      bracketLabel: b.label,
    }))
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">

      {/* ── Retour ── */}
      <Link
        href="/arbitre"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium transition hover:opacity-70"
        style={{ color: 'var(--court-700)' }}
      >
        ← Mes tournois
      </Link>

      {/* ── En-tête ── */}
      <div className="mb-6">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {edition.tournament.club.name}
        </p>
        <h1
          className="mt-1 leading-tight"
          style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--text-primary)' }}
        >
          {edition.tournament.name}
        </h1>

        {/* Barre de progression */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {doneMatches}/{totalMatches} matchs terminés
            </span>
            {liveMatches > 0 && (
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
                style={{ background: 'rgba(201,162,74,.15)', color: 'var(--gold-500)' }}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: 'var(--gold-500)' }} />
                {liveMatches} en cours
              </span>
            )}
          </div>
          <div
            className="h-2 overflow-hidden rounded-full"
            style={{ background: 'var(--bg-muted)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: totalMatches > 0 ? `${Math.round((doneMatches / totalMatches) * 100)}%` : '0%',
                background: 'var(--court-700)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Générer le tableau si aucun bracket ── */}
      {edition.brackets.length === 0 &&
        ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED'].includes(edition.status) && (
        <GenerateBracketButton editionId={edition.id} />
      )}

      {/* ── Tableaux + Matchs (composant client pour saisie scores) ── */}
      {edition.brackets.length > 0 && (
        <MatchListClient
          brackets={edition.brackets.map(b => ({
            id:    b.id,
            label: b.label,
            matches: b.matches.map(m => ({
              id:          m.id,
              status:      m.status,
              scheduledAt: (m as { scheduledAt?: string | null }).scheduledAt ?? null,
              winnerTeamId:m.winnerTeamId ?? null,
              teamA:       m.teamA ? { id: m.teamA.id, name: (m.teamA as { name?: string }).name ?? 'Équipe A' } : { id: '', name: 'TBD' },
              teamB:       m.teamB ? { id: m.teamB.id, name: (m.teamB as { name?: string }).name ?? 'Équipe B' } : { id: '', name: 'TBD' },
              scores:      m.scores,
            })),
          }))}
        />
      )}
    </div>
  );
}
