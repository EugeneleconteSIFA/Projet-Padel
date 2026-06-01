import Link from 'next/link';
import type { Metadata } from 'next';
import { requireApprovedReferee } from '@/lib/auth-guards';
import { getArbitreDashboard } from '@/lib/actions/arbitre';

export const metadata: Metadata = { title: 'Espace juge-arbitre — The Court' };

type UpcomingTournament = {
  id: string;
  slug: string;
  tournamentName: string;
  clubName: string;
  startDate: string;
  endDate: string;
  status: string;
  isHead: boolean;
  teamsConfirmed: number;
  maxTeams: number;
  totalMatches: number;
  playedMatches: number;
  liveMatches: number;
  pendingMatches: number;
  pendingPayment: number;
  hasBracket: boolean;
  isToday: boolean;
  category: string;
};

type PastTournament = UpcomingTournament;

type PendingRegistration = {
  id: string;
  editionId: string;
  tournamentName: string;
  registeredAt: string;
  players: string[];
};

const MOCK_DASHBOARD = {
  firstName: 'Arbitre',
  upcoming: [
    {
      id: 'edition-1',
      slug: 'open-printemps-padel',
      tournamentName: 'Open de Printemps Padel',
      clubName: 'Padel Club Lille Nord',
      startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 6 * 86400000).toISOString(),
      status: 'REGISTRATION_OPEN',
      isHead: true,
      teamsConfirmed: 14,
      maxTeams: 16,
      totalMatches: 0,
      playedMatches: 0,
      liveMatches: 0,
      pendingMatches: 0,
      pendingPayment: 2,
      hasBracket: false,
      isToday: false,
      category: 'P100',
    },
    {
      id: 'edition-2',
      slug: 'tournoi-indoor-automne',
      tournamentName: 'Tournoi Indoor Automne',
      clubName: 'Arena Raquette Paris',
      startDate: new Date(Date.now() + 18 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 18 * 86400000).toISOString(),
      status: 'RUNNING',
      isHead: false,
      teamsConfirmed: 8,
      maxTeams: 8,
      totalMatches: 12,
      playedMatches: 4,
      liveMatches: 1,
      pendingMatches: 8,
      pendingPayment: 0,
      hasBracket: true,
      isToday: true,
      category: 'P250',
    },
  ] as UpcomingTournament[],
  past: [
    {
      id: 'edition-0',
      slug: 'championnat-hiver-2025',
      tournamentName: 'Championnat Hiver 2025',
      clubName: 'Padel Club Lille Nord',
      startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      endDate: new Date(Date.now() - 29 * 86400000).toISOString(),
      status: 'COMPLETED',
      isHead: true,
      teamsConfirmed: 16,
      maxTeams: 16,
      totalMatches: 15,
      playedMatches: 15,
      liveMatches: 0,
      pendingMatches: 0,
      pendingPayment: 0,
      hasBracket: true,
      isToday: false,
      category: 'P100',
    },
  ] as PastTournament[],
  pendingRegistrations: [
    {
      id: 'pr1',
      editionId: 'edition-1',
      tournamentName: 'Open de Printemps Padel',
      registeredAt: new Date(Date.now() - 86400000).toISOString(),
      players: ['Lucas M.', 'Thomas D.'],
    },
    {
      id: 'pr2',
      editionId: 'edition-1',
      tournamentName: 'Open de Printemps Padel',
      registeredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      players: ['Hugo C.'],
    },
  ] as PendingRegistration[],
  kpis: {
    upcomingCount: 2,
    pastCount: 1,
    pendingPaymentCount: 2,
    liveMatchesCount: 1,
    pendingScoreMatches: 8,
    needsBracketCount: 1,
  },
};

const ARBITRE_MAIN_ACTIONS = [
  { key: 'manage', label: 'Gérer le tournoi', icon: 'manage' as const, primary: true },
  { key: 'bracket', label: 'Générer les tableaux', icon: 'bracket' as const },
  { key: 'scores', label: 'Saisir les scores', icon: 'scores' as const },
  { key: 'publish', label: 'Publier les résultats', icon: 'publish' as const },
] as const;

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  REGISTRATION_OPEN: 'Inscriptions',
  REGISTRATION_CLOSED: 'Clôturé',
  RUNNING: 'En cours',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: 'var(--bg-muted)', color: 'var(--text-muted)' },
  PUBLISHED: { bg: 'var(--court-100)', color: 'var(--court-700)' },
  REGISTRATION_OPEN: { bg: 'var(--court-100)', color: 'var(--court-700)' },
  REGISTRATION_CLOSED: { bg: 'rgba(201,162,74,0.15)', color: 'var(--gold-700)' },
  RUNNING: { bg: 'rgba(15,76,58,0.15)', color: 'var(--court-700)' },
  IN_PROGRESS: { bg: 'rgba(15,76,58,0.15)', color: 'var(--court-700)' },
  COMPLETED: { bg: 'var(--bg-muted)', color: 'var(--text-muted)' },
  CANCELLED: { bg: 'rgba(166,51,46,0.1)', color: 'var(--color-danger)' },
};

export default async function ArbitrePage() {
  await requireApprovedReferee();
  const raw = await getArbitreDashboard().catch(() => null);

  const upcoming = raw?.upcoming ?? MOCK_DASHBOARD.upcoming;
  const past = raw?.past ?? MOCK_DASHBOARD.past;
  const pendingRegistrations = raw?.pendingRegistrations ?? MOCK_DASHBOARD.pendingRegistrations;
  const kpis = raw?.kpis ?? MOCK_DASHBOARD.kpis;

  const focusTournament =
    upcoming.find((t) => t.liveMatches > 0) ??
    upcoming.find((t) => t.isToday) ??
    upcoming.find((t) => !t.hasBracket && t.teamsConfirmed >= 2) ??
    upcoming[0] ??
    null;

  const bracketTarget =
    upcoming.find((t) => !t.hasBracket && t.teamsConfirmed >= 2) ?? focusTournament;
  const scoresTarget =
    upcoming.find((t) => t.liveMatches > 0 || t.pendingMatches > 0) ?? focusTournament;

  const actionHrefs: Record<(typeof ARBITRE_MAIN_ACTIONS)[number]['key'], string> = {
    manage: focusTournament ? `/arbitre/tournoi/${focusTournament.id}` : '#assignes',
    bracket: bracketTarget ? `/arbitre/tournoi/${bracketTarget.id}` : '#assignes',
    scores: scoresTarget ? `/arbitre/tournoi/${scoresTarget.id}#matchs` : '#assignes',
    publish: focusTournament ? `/arbitre/tournoi/${focusTournament.id}#matchs` : '#assignes',
  };

  const teamsToValidate = pendingRegistrations.length;
  const scoresToEnter = kpis.pendingScoreMatches + kpis.liveMatchesCount;

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-4">
      {/* En-tête */}
      <header>
        <h1
          className="leading-tight tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 4vw, 34px)',
            fontWeight: 500,
          }}
        >
          Bienvenue dans votre espace juge-arbitre
        </h1>
      </header>

      {/* KPIs */}
      <section aria-label="Indicateurs">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <KpiCard label="Tournois assignés" value={kpis.upcomingCount} accent />
          <KpiCard label="Équipes à valider" value={teamsToValidate} />
          <KpiCard label="Tableaux à générer" value={kpis.needsBracketCount} />
          <KpiCard label="Scores à saisir" value={scoresToEnter} />
        </div>
      </section>

      {/* Actions principales */}
      <section aria-label="Actions principales">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {ARBITRE_MAIN_ACTIONS.map((action) => (
            <MainActionLink
              key={action.key}
              href={actionHrefs[action.key]}
              label={action.label}
              icon={action.icon}
              primary={'primary' in action && action.primary}
              disabled={!focusTournament && action.key !== 'manage'}
            />
          ))}
        </div>
      </section>

      {/* Alertes opérationnelles */}
      {(kpis.liveMatchesCount > 0 || kpis.needsBracketCount > 0 || teamsToValidate > 0) && (
        <section className="flex flex-wrap gap-2" aria-label="Alertes">
          {kpis.liveMatchesCount > 0 && (
            <AlertPill
              text={`${kpis.liveMatchesCount} match${kpis.liveMatchesCount > 1 ? 's' : ''} en direct`}
            />
          )}
          {kpis.needsBracketCount > 0 && (
            <AlertPill text={`${kpis.needsBracketCount} tableau${kpis.needsBracketCount > 1 ? 'x' : ''} à générer`} tone="gold" />
          )}
          {teamsToValidate > 0 && (
            <AlertPill text={`${teamsToValidate} équipe${teamsToValidate > 1 ? 's' : ''} à valider`} tone="gold" />
          )}
        </section>
      )}

      {/* Focus jour J */}
      {focusTournament && (focusTournament.isToday || focusTournament.liveMatches > 0) && (
        <section
          className="rounded-xl border px-4 py-3"
          style={{
            background: 'color-mix(in srgb, var(--gold-100) 30%, var(--bg-surface))',
            borderColor: 'color-mix(in srgb, var(--gold-500) 18%, transparent)',
          }}
          aria-label="Tournoi du jour"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-semibold">{focusTournament.tournamentName}</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {' '}
                — {focusTournament.clubName} · {focusTournament.playedMatches}/
                {focusTournament.totalMatches || '—'} matchs
              </span>
            </p>
            <Link
              href={`/arbitre/tournoi/${focusTournament.id}`}
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--court-700)' }}
            >
              Cockpit →
            </Link>
          </div>
          <MatchProgress played={focusTournament.playedMatches} total={focusTournament.totalMatches} className="mt-2" />
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tournois assignés */}
        <div className="space-y-5 lg:col-span-2">
          <div id="assignes">
            <Section title="Tournois assignés">
              {upcoming.length === 0 ? (
                <EmptyState message="Aucun tournoi assigné. Un club vous ajoutera depuis son espace." />
              ) : (
                <ul className="space-y-2">
                  {upcoming.map((t) => (
                    <li key={t.id}>
                      <CompactTournamentCard tournament={t} />
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>

          {past.length > 0 && (
            <Section title="Historique">
              <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {past.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.tournamentName}</p>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t.clubName} ·{' '}
                        {new Date(t.startDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* Équipes à valider */}
        <div id="validations">
          <Section title="Équipes à valider">
            {pendingRegistrations.length === 0 ? (
              <EmptyState message="Aucune équipe en attente de validation." />
            ) : (
              <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {pendingRegistrations.map((r) => (
                  <li key={r.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium">{r.tournamentName}</p>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {r.players.join(' · ')}
                    </p>
                    <Link
                      href={`/arbitre/tournoi/${r.editionId}`}
                      className="mt-1 inline-block text-xs font-semibold hover:underline"
                      style={{ color: 'var(--court-700)' }}
                    >
                      Valider →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ── Composants locaux ───────────────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl border px-3 py-3"
      style={{
        background: accent ? 'var(--gold-100)' : 'var(--bg-surface)',
        borderColor: accent
          ? 'color-mix(in srgb, var(--gold-500) 20%, transparent)'
          : 'var(--border-subtle)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          fontWeight: 500,
          lineHeight: 1,
          color: accent ? 'var(--gold-800)' : 'var(--text-primary)',
        }}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[10px] font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

function MainActionLink({
  href,
  label,
  icon,
  primary = false,
  disabled = false,
}: {
  href: string;
  label: string;
  icon: (typeof ARBITRE_MAIN_ACTIONS)[number]['icon'];
  primary?: boolean;
  disabled?: boolean;
}) {
  const className =
    'flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center transition hover:-translate-y-px';
  const style = {
    background: primary ? 'var(--court-700)' : 'var(--bg-surface)',
    borderColor: primary ? 'var(--court-600)' : 'var(--border-subtle)',
    color: primary ? 'var(--cream-50)' : 'var(--text-primary)',
    opacity: disabled ? 0.45 : 1,
    pointerEvents: disabled ? ('none' as const) : ('auto' as const),
  };

  return (
    <Link href={href} className={className} style={style} aria-disabled={disabled}>
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{
          background: primary ? 'rgba(241,237,229,0.15)' : 'var(--court-100)',
          color: primary ? 'var(--cream-50)' : 'var(--court-700)',
        }}
      >
        <MainActionIcon type={icon} />
      </span>
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
    </Link>
  );
}

function MainActionIcon({ type }: { type: (typeof ARBITRE_MAIN_ACTIONS)[number]['icon'] }) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'manage':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="2" {...stroke} />
          <path d="M3 9h18M9 21V9" {...stroke} />
        </svg>
      );
    case 'bracket':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M6 21v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" {...stroke} />
          <path d="M12 11V3" {...stroke} />
        </svg>
      );
    case 'scores':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" {...stroke} />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" {...stroke} />
        </svg>
      );
    case 'publish':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" {...stroke} />
        </svg>
      );
  }
}

function AlertPill({ text, tone = 'court' }: { text: string; tone?: 'court' | 'gold' }) {
  const isGold = tone === 'gold';
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        background: isGold ? 'var(--gold-100)' : 'var(--court-100)',
        color: isGold ? 'var(--gold-800)' : 'var(--court-800)',
      }}
    >
      {text}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function CompactTournamentCard({ tournament: t }: { tournament: UpcomingTournament }) {
  const fill = t.maxTeams > 0 ? Math.round((t.teamsConfirmed / t.maxTeams) * 100) : 0;

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--bg-page)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={t.status} />
            {t.isHead && (
              <span
                className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
                style={{ background: 'rgba(201,162,74,0.15)', color: 'var(--gold-700)' }}
              >
                Principal
              </span>
            )}
            {t.isToday && (
              <span
                className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
                style={{ background: 'var(--court-100)', color: 'var(--court-700)' }}
              >
                Aujourd&apos;hui
              </span>
            )}
          </div>
          <p className="mt-2 truncate text-sm font-semibold">{t.tournamentName}</p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            {t.clubName} · {t.category} ·{' '}
            {new Date(t.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </p>
          <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {t.hasBracket ? 'Tableau généré' : 'Tableau à générer'}
            {t.pendingPayment > 0 && ` · ${t.pendingPayment} paiement(s) en attente`}
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl px-3 py-2 text-center"
          style={{ background: 'var(--court-100)', minWidth: '56px' }}
        >
          <p className="font-mono text-lg font-bold leading-none" style={{ color: 'var(--court-700)' }}>
            {new Date(t.startDate).getDate()}
          </p>
          <p
            className="mt-0.5 font-mono text-[9px] font-semibold uppercase"
            style={{ color: 'var(--court-700)' }}
          >
            {new Date(t.startDate).toLocaleDateString('fr-FR', { month: 'short' })}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg px-2 py-2" style={{ background: 'var(--bg-muted)' }}>
          <p className="font-mono text-sm font-semibold">
            {t.teamsConfirmed}/{t.maxTeams}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Équipes ({fill}%)
          </p>
        </div>
        <div className="rounded-lg px-2 py-2" style={{ background: 'var(--bg-muted)' }}>
          <p className="font-mono text-sm font-semibold">
            {t.playedMatches}/{t.totalMatches || '—'}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Matchs joués
          </p>
        </div>
      </div>

      <MatchProgress played={t.playedMatches} total={t.totalMatches} className="mt-3" />

      <div className="mt-3 flex gap-2">
        <Link
          href={`/arbitre/tournoi/${t.id}`}
          className="flex-1 rounded-xl py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--court-700)' }}
        >
          Gérer
        </Link>
        <Link
          href={`/arbitre/tournoi/${t.id}#matchs`}
          className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-80"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          Scores
        </Link>
      </div>
    </div>
  );
}

function MatchProgress({
  played,
  total,
  className = '',
}: {
  played: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((played / total) * 100) : 0;
  return (
    <div className={className}>
      <div className="mb-1 flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
        <span>Progression matchs</span>
        <span>{total > 0 ? `${pct}%` : '—'}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--bg-muted)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: total > 0 ? `${pct}%` : '0%', background: 'var(--gold-500)' }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLOR[status] ?? STATUS_COLOR.DRAFT;
  return (
    <span
      className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-2 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
      {message}
    </p>
  );
}
