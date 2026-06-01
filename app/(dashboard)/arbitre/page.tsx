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

  const firstName = raw?.firstName ?? MOCK_DASHBOARD.firstName;
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

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* En-tête */}
      <header>
        <p
          className="font-mono text-[11px] uppercase tracking-[0.14em]"
          style={{ color: 'var(--gold-700)' }}
        >
          Espace juge-arbitre
        </p>
        <h1
          className="mt-2 leading-tight tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 500,
          }}
        >
          Bonjour, {firstName}
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
          Validez les inscrits, générez les tableaux et saisissez les scores depuis votre mobile.
        </p>
      </header>

      {/* KPIs */}
      <section aria-label="Indicateurs">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Tournois à venir" value={kpis.upcomingCount} sub="assignés" accent />
          <KpiCard label="Matchs à saisir" value={kpis.pendingScoreMatches} sub="scores en attente" />
          <KpiCard label="Inscriptions" value={kpis.pendingPaymentCount} sub="paiement en attente" />
          <KpiCard label="Officiés" value={kpis.pastCount} sub="tournois passés" />
        </div>
      </section>

      {/* Alertes */}
      {(kpis.liveMatchesCount > 0 || kpis.needsBracketCount > 0 || kpis.pendingPaymentCount > 0) && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Alertes">
          {kpis.liveMatchesCount > 0 && (
            <AlertCard
              title={`${kpis.liveMatchesCount} match${kpis.liveMatchesCount > 1 ? 's' : ''} en cours`}
              body="Des scores sont à saisir en direct."
              tone="court"
            />
          )}
          {kpis.needsBracketCount > 0 && (
            <AlertCard
              title={`${kpis.needsBracketCount} tableau${kpis.needsBracketCount > 1 ? 'x' : ''} à générer`}
              body="Assez d'équipes confirmées — vous pouvez lancer le tirage."
              tone="gold"
            />
          )}
          {kpis.pendingPaymentCount > 0 && (
            <AlertCard
              title={`${kpis.pendingPaymentCount} inscription${kpis.pendingPaymentCount > 1 ? 's' : ''} en attente`}
              body="Paiements non finalisés avant validation."
              tone="gold"
            />
          )}
        </section>
      )}

      {/* Focus */}
      {focusTournament && (
        <section
          className="rounded-2xl border p-5"
          style={{
            background: 'color-mix(in srgb, var(--gold-100) 35%, var(--bg-surface))',
            borderColor: 'color-mix(in srgb, var(--gold-500) 20%, transparent)',
          }}
          aria-label="Priorité du moment"
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.12em]"
            style={{ color: 'var(--gold-700)' }}
          >
            {focusTournament.isToday ? "Aujourd'hui" : 'Prochain tournoi'}
          </p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{focusTournament.tournamentName}</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {focusTournament.clubName} · {focusTournament.teamsConfirmed}/{focusTournament.maxTeams}{' '}
                équipes
                {focusTournament.liveMatches > 0 && ` · ${focusTournament.liveMatches} match en direct`}
              </p>
            </div>
            <Link
              href={`/arbitre/tournoi/${focusTournament.id}`}
              className="text-sm font-semibold hover:underline"
              style={{ color: 'var(--court-700)' }}
            >
              Ouvrir le cockpit →
            </Link>
          </div>
          <MatchProgress played={focusTournament.playedMatches} total={focusTournament.totalMatches} className="mt-4" />
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          <Section title="Tournois assignés">
            {upcoming.length === 0 ? (
              <EmptyState message="Aucun tournoi assigné pour le moment." />
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
                          month: 'long',
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

        {/* Sidebar */}
        <div className="space-y-4">
          <Section title="Inscriptions à valider">
            {pendingRegistrations.length === 0 ? (
              <EmptyState message="Aucune inscription en attente de paiement." />
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
                      Voir le tournoi →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <div
            className="rounded-2xl border p-5"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
            >
              Actions rapides
            </p>
            <div className="space-y-2">
              {focusTournament && (
                <QuickAction
                  href={`/arbitre/tournoi/${focusTournament.id}`}
                  label="Cockpit du tournoi prioritaire"
                  primary
                />
              )}
              {upcoming.find((t) => !t.hasBracket && t.teamsConfirmed >= 2) && (
                <QuickAction
                  href={`/arbitre/tournoi/${upcoming.find((t) => !t.hasBracket && t.teamsConfirmed >= 2)!.id}`}
                  label="Générer un tableau"
                />
              )}
              <QuickAction href="/juge-arbitre" label="Découvrir les fonctionnalités JA" />
            </div>
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{
              background: 'color-mix(in srgb, var(--court-100) 40%, var(--bg-surface))',
              borderColor: 'color-mix(in srgb, var(--court-700) 10%, transparent)',
            }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--court-800)' }}>
              Mobile-first
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Saisie tactile set par set, publication instantanée des résultats côté joueurs.
            </p>
          </div>
        </div>
      </div>

      {upcoming.length === 0 && past.length === 0 && (
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
            Les clubs vous assigneront depuis leur espace tournoi.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Composants locaux ───────────────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: accent ? 'var(--gold-100)' : 'var(--bg-surface)',
        borderColor: accent
          ? 'color-mix(in srgb, var(--gold-500) 20%, transparent)'
          : 'var(--border-subtle)',
      }}
    >
      <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p
        className="mt-2"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: 500,
          lineHeight: 1,
          color: accent ? 'var(--gold-800)' : 'var(--text-primary)',
        }}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {sub}
      </p>
    </div>
  );
}

function AlertCard({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: 'gold' | 'court';
}) {
  const isGold = tone === 'gold';
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: isGold ? 'var(--gold-100)' : 'var(--court-100)',
        borderColor: isGold
          ? 'color-mix(in srgb, var(--gold-500) 25%, transparent)'
          : 'color-mix(in srgb, var(--court-700) 12%, transparent)',
      }}
    >
      <p className="text-sm font-semibold" style={{ color: isGold ? 'var(--gold-800)' : 'var(--court-800)' }}>
        {title}
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
        {body}
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h2
        className="mb-4 text-xs font-semibold uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
      >
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

function QuickAction({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border px-4 py-3 text-sm font-medium transition hover:opacity-80"
      style={{
        borderColor: primary ? 'var(--court-600)' : 'var(--border-subtle)',
        background: primary ? 'rgba(42,130,100,0.08)' : 'transparent',
        color: primary ? 'var(--court-700)' : 'var(--text-secondary)',
      }}
    >
      {label}
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-2 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
      {message}
    </p>
  );
}

function WhistleIcon() {
  return (
    <div
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
      style={{ background: 'var(--bg-muted)' }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: 'var(--text-muted)' }}
        aria-hidden
      >
        <path d="m4 4 4.5 4.5" />
        <circle cx="14" cy="14" r="6" />
        <path d="m20 8-6 6" />
      </svg>
    </div>
  );
}
