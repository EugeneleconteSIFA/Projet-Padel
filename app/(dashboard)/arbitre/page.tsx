import Link from 'next/link';
import { getArbitreDashboard } from '@/lib/actions/arbitre';

/* =============================================================================
   /arbitre — Tableau de bord du juge-arbitre.
   Liste les tournois assignés (à venir + passés) avec actions rapides.
   ============================================================================= */

/* Mock de fallback si la DB n'est pas connectée */
const MOCK_DASHBOARD = {
  upcoming: [
    {
      id:             'edition-1',
      tournamentName: 'Open de Printemps Padel',
      clubName:       'Padel Club Lille Nord',
      startDate:      new Date(Date.now() + 5 * 86400000).toISOString(),
      endDate:        new Date(Date.now() + 6 * 86400000).toISOString(),
      status:         'REGISTRATION_OPEN',
      isHead:         true,
      teamsConfirmed: 14,
      maxTeams:       16,
      totalMatches:   0,
      playedMatches:  0,
    },
    {
      id:             'edition-2',
      tournamentName: 'Tournoi Indoor Automne',
      clubName:       'Arena Raquette Paris',
      startDate:      new Date(Date.now() + 18 * 86400000).toISOString(),
      endDate:        new Date(Date.now() + 18 * 86400000).toISOString(),
      status:         'REGISTRATION_OPEN',
      isHead:         false,
      teamsConfirmed: 8,
      maxTeams:       8,
      totalMatches:   0,
      playedMatches:  0,
    },
  ],
  past: [
    {
      id:             'edition-0',
      tournamentName: 'Championnat Hiver 2025',
      clubName:       'Padel Club Lille Nord',
      startDate:      new Date(Date.now() - 30 * 86400000).toISOString(),
      status:         'COMPLETED',
    },
  ],
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    DRAFT:             { label: 'Brouillon',     bg: 'var(--bg-muted)',   color: 'var(--text-muted)' },
    REGISTRATION_OPEN: { label: 'Inscriptions',  bg: 'var(--court-100)', color: 'var(--court-700)' },
    REGISTRATION_CLOSED:{ label: 'Clôturé',     bg: 'rgba(201,162,74,.15)', color: 'var(--gold-500)' },
    IN_PROGRESS:       { label: 'En cours',      bg: 'rgba(15,76,58,.15)', color: 'var(--court-700)' },
    COMPLETED:         { label: 'Terminé',       bg: 'var(--bg-muted)',   color: 'var(--text-muted)' },
    CANCELLED:         { label: 'Annulé',        bg: 'rgba(166,51,46,.1)', color: 'var(--color-danger)' },
  };
  const s = map[status] ?? { label: status, bg: 'var(--bg-muted)', color: 'var(--text-muted)' };
  return (
    <span
      className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export default async function ArbitrePage() {
  const data = await getArbitreDashboard().catch(() => MOCK_DASHBOARD);

  const totalUpcoming = data.upcoming.length;
  const nextTournoi   = data.upcoming[0] ?? null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">

      {/* ── MESSAGE DE BIENVENUE ───────────────────────────────────────── */}
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}
        >
          Bienvenue, Arbitre
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
          Gérez vos tournois assignés et suivez les inscriptions.
        </p>
      </div>

      {/* ── GRILLE PRINCIPALE ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── COL PRINCIPALE : tournois ─────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Mes tournois */}
          {data.upcoming.length > 0 && (
            <section>
              <h2
                className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--court-700)' }}
              >
                Mes tournois
              </h2>

              <div className="flex flex-col gap-4">
                {data.upcoming.map(t => {
                  const fillPct   = Math.round((t.teamsConfirmed / t.maxTeams) * 100);
                  const matchPct  = t.totalMatches > 0
                    ? Math.round((t.playedMatches / t.totalMatches) * 100)
                    : 0;

                  return (
                    <div
                      key={t.id}
                      className="rounded-2xl border p-5"
                      style={{
                        background:  'var(--bg-surface)',
                        borderColor: 'var(--border-subtle)',
                        boxShadow:   'var(--shadow-xs)',
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={t.status} />
                            {t.isHead && (
                              <span
                                className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
                                style={{ background: 'rgba(201,162,74,.15)', color: 'var(--gold-500)' }}
                              >
                                Arbitre principal
                              </span>
                            )}
                          </div>
                          <h3
                            className="mt-1.5 truncate"
                            style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}
                          >
                            {t.tournamentName}
                          </h3>
                          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                            {t.clubName}
                          </p>
                        </div>

                        {/* Date */}
                        <div
                          className="shrink-0 rounded-xl p-3 text-center"
                          style={{ background: 'var(--court-100)', minWidth: '72px' }}
                        >
                          <div
                            className="font-mono text-[22px] font-bold leading-none"
                            style={{ color: 'var(--court-700)' }}
                          >
                            {new Date(t.startDate).getDate()}
                          </div>
                          <div
                            className="mt-0.5 font-mono text-[10px] font-semibold uppercase"
                            style={{ color: 'var(--court-700)' }}
                          >
                            {new Date(t.startDate).toLocaleDateString('fr-FR', { month: 'short' })}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {/* Équipes */}
                        <div
                          className="rounded-xl p-3"
                          style={{ background: 'var(--bg-muted)' }}
                        >
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Équipes inscrites</span>
                            <span
                              className="font-mono text-sm font-semibold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {t.teamsConfirmed}/{t.maxTeams}
                            </span>
                          </div>
                          <div
                            className="mt-2 h-1.5 overflow-hidden rounded-full"
                            style={{ background: 'var(--border-subtle)' }}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${fillPct}%`, background: 'var(--court-700)' }}
                            />
                          </div>
                        </div>

                        {/* Matchs */}
                        <div
                          className="rounded-xl p-3"
                          style={{ background: 'var(--bg-muted)' }}
                        >
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Matchs joués</span>
                            <span
                              className="font-mono text-sm font-semibold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {t.playedMatches}/{t.totalMatches || '—'}
                            </span>
                          </div>
                          <div
                            className="mt-2 h-1.5 overflow-hidden rounded-full"
                            style={{ background: 'var(--border-subtle)' }}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: t.totalMatches > 0 ? `${matchPct}%` : '0%', background: 'var(--gold-500)' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/arbitre/tournoi/${t.id}`}
                          className="flex-1 rounded-xl py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
                          style={{ background: 'var(--court-700)' }}
                        >
                          Gérer le tournoi →
                        </Link>
                        <Link
                          href={`/arbitre/tournoi/${t.id}?tab=matchs`}
                          className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-70"
                          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
                        >
                          Scores
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Historique */}
          {data.past.length > 0 && (
            <section>
              <h2
                className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                Historique
              </h2>
              <div
                className="divide-y overflow-hidden rounded-2xl border"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
              >
                {data.past.map(t => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {t.tournamentName}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t.clubName} · {formatDate(t.startDate)}
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Inscriptions en attente */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Inscriptions en attente
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Aucune inscription en attente pour le moment.
            </p>
          </div>

          {/* Statistiques */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Statistiques
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tournois à venir</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{totalUpcoming}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tournois passés</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{data.past.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── État vide ── */}
      {data.upcoming.length === 0 && data.past.length === 0 && (
        <div
          className="rounded-2xl border py-16 text-center"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <WhistleIcon />
          <p
            className="mt-4"
            style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-secondary)' }}
          >
            Aucun tournoi assigné
          </p>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Les organisateurs de tournois vous assigneront depuis leur tableau de bord.
          </p>
        </div>
      )}
    </div>
  );
}

function WhistleIcon() {
  return (
    <div
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
      style={{ background: 'var(--bg-muted)' }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
        <path d="m4 4 4.5 4.5"/>
        <circle cx="14" cy="14" r="6"/>
        <path d="m20 8-6 6"/>
      </svg>
    </div>
  );
}
