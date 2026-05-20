import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { getClubDashboard, getClubRegistrations } from '@/lib/actions/club';

export const metadata: Metadata = { title: 'Mon club' };

/* =============================================================================
   Dashboard club — Server Component.
   KPIs + liste tournois + inscriptions récentes.
   ============================================================================= */

/* ── Mock data (fallback si pas de BDD) ─────────────────────────────────── */

const MOCK_TOURNAMENTS = [
  {
    id: 'ct1', name: 'Open de Loos · Juin',
    category: 'P100', gender: 'MIXED',
    startDate: new Date('2026-06-15'), endDate: new Date('2026-06-15'),
    status: 'REGISTRATION_OPEN', teams: 12, maxTeams: 16, priceEuros: 40,
  },
  {
    id: 'ct2', name: 'Open de Loos · Juillet',
    category: 'P250', gender: 'MALE',
    startDate: new Date('2026-07-05'), endDate: new Date('2026-07-06'),
    status: 'DRAFT', teams: 0, maxTeams: 16, priceEuros: 60,
  },
  {
    id: 'ct3', name: 'Open de Loos · Mai',
    category: 'P100', gender: 'MIXED',
    startDate: new Date('2026-05-17'), endDate: new Date('2026-05-17'),
    status: 'COMPLETED', teams: 16, maxTeams: 16, priceEuros: 40,
  },
];

const MOCK_REGISTRATIONS = [
  { id: 'r1', players: ['Lucas M.', 'Thomas D.'], tournament: 'Open de Loos · Juin', status: 'CONFIRMED',   registeredAt: new Date('2026-05-10'), amountEuros: 40 },
  { id: 'r2', players: ['Antoine B.', 'Pierre L.'], tournament: 'Open de Loos · Juin', status: 'CONFIRMED', registeredAt: new Date('2026-05-09'), amountEuros: 40 },
  { id: 'r3', players: ['Hugo C.', 'Marc F.'], tournament: 'Open de Loos · Juin', status: 'PENDING_PAYMENT', registeredAt: new Date('2026-05-08'), amountEuros: 40 },
  { id: 'r4', players: ['Jean P.', 'Ali R.'], tournament: 'Open de Loos · Juin', status: 'CONFIRMED',       registeredAt: new Date('2026-05-07'), amountEuros: 40 },
];

const MOCK_KPIS = {
  totalTournaments:    3,
  totalRegistrations: 12,
  totalRevenueCents:  48000,
  publishedCount:      1,
};

/* ── Libellés ────────────────────────────────────────────────────────────── */

const STATUS_LABEL: Record<string, string> = {
  DRAFT:               'Brouillon',
  PUBLISHED:           'Publié',
  REGISTRATION_OPEN:   'Inscriptions ouvertes',
  REGISTRATION_CLOSED: 'Inscriptions fermées',
  RUNNING:             'En cours',
  COMPLETED:           'Terminé',
  CANCELLED:           'Annulé',
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  DRAFT:               { bg: 'var(--bg-muted)',              color: 'var(--text-muted)' },
  PUBLISHED:           { bg: 'rgba(42,130,100,0.1)',         color: 'var(--court-600)' },
  REGISTRATION_OPEN:   { bg: 'rgba(42,130,100,0.1)',         color: 'var(--court-600)' },
  REGISTRATION_CLOSED: { bg: 'rgba(201,162,74,0.12)',        color: 'var(--gold-700)' },
  RUNNING:             { bg: 'rgba(42,130,100,0.15)',        color: 'var(--court-700)' },
  COMPLETED:           { bg: 'var(--bg-muted)',              color: 'var(--text-muted)' },
  CANCELLED:           { bg: 'rgba(166,51,46,0.08)',         color: 'var(--color-danger)' },
};

const REG_STATUS_LABEL: Record<string, string> = {
  CONFIRMED:       'Confirmée',
  PENDING_PAYMENT: 'Paiement en attente',
  WAITING_LIST:    "Liste d'attente",
  WITHDRAWN:       'Désistement',
  REJECTED:        'Rejeté',
};

const REG_STATUS_COLOR: Record<string, string> = {
  CONFIRMED:       'var(--court-600)',
  PENDING_PAYMENT: 'var(--gold-700)',
  WAITING_LIST:    'var(--text-muted)',
  WITHDRAWN:       'var(--color-danger)',
  REJECTED:        'var(--color-danger)',
};

const GENDER_LABEL: Record<string, string> = {
  MEN: 'Hommes', WOMEN: 'Femmes', MIXED: 'Mixte',
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function ClubDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'CLUB') redirect('/profil');

  // Tente de charger les vraies données, fallback sur mock si BDD non connectée
  const [data, realRegistrations] = await Promise.all([
    getClubDashboard().catch(() => null),
    getClubRegistrations().catch(() => null),
  ]);

  const clubName   = data?.club.name ?? 'Mon club';
  const tournaments = data
    ? data.tournaments.map(t => ({
        id:          t.id,
        name:        t.name,
        category:    t.category ?? '—',
        gender:      t.editions[0] ? t.gender : 'MIXED',
        startDate:   t.editions[0]?.startDate ?? new Date(),
        endDate:     t.editions[0]?.endDate   ?? new Date(),
        status:      t.editions[0]?.status    ?? 'DRAFT',
        teams:       t.editions[0]?._count?.registrations ?? 0,
        maxTeams:    t.editions[0]?.maxTeams   ?? 0,
        priceEuros: (t.editions[0]?.priceCents ?? 0) / 100,
      }))
    : MOCK_TOURNAMENTS;

  const registrations = realRegistrations && realRegistrations.length > 0
    ? realRegistrations
    : MOCK_REGISTRATIONS.map(r => ({
        id:            r.id,
        tournamentName: r.tournament,
        category:      'P100',
        status:        r.status,
        registeredAt:  r.registeredAt.toISOString(),
        players:       r.players.map((name, i) => ({ name, email: '', isCaptain: i === 0 })),
        paymentStatus: r.status === 'CONFIRMED' ? 'SUCCEEDED' : null,
        amountCents:   r.amountEuros * 100,
      }));

  const kpis = data?.kpis ?? MOCK_KPIS;

  const activeTournaments  = tournaments.filter(t => ['REGISTRATION_OPEN', 'RUNNING', 'PUBLISHED'].includes(t.status));
  const draftTournaments   = tournaments.filter(t => t.status === 'DRAFT');
  const pastTournaments    = tournaments.filter(t => ['COMPLETED', 'CANCELLED'].includes(t.status));

  return (
    <div className="space-y-8">

      {/* ── EN-TÊTE ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Espace club
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}
          >
            {clubName}
          </h1>
        </div>
        <Link
          href="/club/tournoi/nouveau"
          className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--court-700)' }}
        >
          <PlusIcon />
          Nouveau tournoi
        </Link>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Tournois"
          value={kpis.totalTournaments}
          sub={`${kpis.publishedCount} actif${kpis.publishedCount > 1 ? 's' : ''}`}
          icon={<TrophyIcon />}
        />
        <KpiCard
          label="Inscriptions"
          value={kpis.totalRegistrations}
          sub="toutes éditions"
          icon={<UsersIcon />}
        />
        <KpiCard
          label="Revenus"
          value={`${(kpis.totalRevenueCents / 100).toFixed(0)} €`}
          sub="encaissés"
          icon={<EuroIcon />}
          accent
        />
        <KpiCard
          label="Taux moyen"
          value={`${kpis.totalTournaments > 0
            ? Math.round((kpis.totalRegistrations / (kpis.totalTournaments * 16)) * 100)
            : 0} %`}
          sub="de remplissage"
          icon={<ChartIcon />}
        />
      </div>

      {/* ── GRILLE PRINCIPALE ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── COL PRINCIPALE : tournois ─────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Tournois actifs */}
          <Section
            title="Tournois en cours"
            action={activeTournaments.length > 0 ? undefined : { label: 'Créer un tournoi', href: '/club/tournoi/nouveau' }}
          >
            {activeTournaments.length === 0 ? (
              <EmptyState message="Aucun tournoi actif pour le moment." />
            ) : (
              <TournamentTable rows={activeTournaments} />
            )}
          </Section>

          {/* Brouillons */}
          {draftTournaments.length > 0 && (
            <Section title="Brouillons">
              <TournamentTable rows={draftTournaments} />
            </Section>
          )}

          {/* Historique */}
          {pastTournaments.length > 0 && (
            <Section title="Historique">
              <TournamentTable rows={pastTournaments} muted />
            </Section>
          )}
        </div>

        {/* ── SIDEBAR : inscriptions ────────────────────────────────────── */}
        <div className="space-y-4">
          <Section title="Inscriptions récentes">
            {registrations.length === 0 ? (
              <EmptyState message="Aucune inscription pour le moment." />
            ) : (
              <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {registrations.map(r => {
                  const regStatusColor = REG_STATUS_COLOR[r.status] ?? 'var(--text-muted)';
                  const amountEuros = r.amountCents != null ? r.amountCents / 100 : 0;
                  return (
                    <li key={r.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {/* Tournoi + catégorie */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {r.tournamentName}
                            </p>
                            <span
                              className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
                              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
                            >
                              {r.category}
                            </span>
                          </div>
                          {/* Joueurs */}
                          <div className="mt-0.5 space-y-0.5">
                            {r.players.map((p, i) => (
                              <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {p.name}{p.isCaptain ? ' ★' : ''}
                                {p.email ? ` — ${p.email}` : ''}
                              </p>
                            ))}
                          </div>
                          {/* Date + montant */}
                          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(r.registeredAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            {amountEuros > 0 && ` · ${amountEuros.toFixed(0)} €`}
                          </p>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            color: regStatusColor,
                            background: `${regStatusColor}18`,
                          }}
                        >
                          {REG_STATUS_LABEL[r.status] ?? r.status}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          {/* Actions rapides */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Actions rapides
            </p>
            <div className="space-y-2">
              <QuickAction href="/club/tournoi/nouveau" label="Créer un tournoi" icon={<PlusIcon />} primary />
              <QuickAction href="/club/parametres" label="Paramètres du club" icon={<SettingsIcon />} />
              <QuickAction href="/club/stripe" label="Configurer les paiements" icon={<EuroIcon />} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   COMPOSANTS LOCAUX
   ============================================================================= */

function KpiCard({
  label, value, sub, icon, accent = false,
}: {
  label: string; value: string | number; sub: string; icon: React.ReactNode; accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ color: accent ? 'var(--court-600)' : 'var(--text-muted)' }}>{icon}</span>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 500,
          lineHeight: 1,
          color: accent ? 'var(--court-600)' : 'var(--text-primary)',
        }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  );
}

function Section({
  title, children, action,
}: {
  title: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {title}
        </h2>
        {action && (
          <Link href={action.href} className="text-xs font-medium transition hover:underline" style={{ color: 'var(--court-600)' }}>
            {action.label} →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function TournamentTable({
  rows,
  muted = false,
}: {
  rows: typeof MOCK_TOURNAMENTS;
  muted?: boolean;
}) {
  return (
    <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
      {rows.map(t => {
        const fill  = t.maxTeams > 0 ? Math.round((t.teams / t.maxTeams) * 100) : 0;
        const sc    = STATUS_COLOR[t.status] ?? STATUS_COLOR.DRAFT;
        return (
          <div key={t.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
            {/* Info principale */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className="text-sm font-medium"
                  style={{ color: muted ? 'var(--text-muted)' : 'var(--text-primary)' }}
                >
                  {t.name}
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
              </div>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                {t.category} · {GENDER_LABEL[t.gender] ?? t.gender} ·{' '}
                {new Date(t.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                {t.endDate.toDateString() !== t.startDate.toDateString()
                  ? ` – ${new Date(t.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
                  : ''}
              </p>
            </div>

            {/* Jauge + prix */}
            <div className="flex items-center gap-4 sm:shrink-0">
              <div className="w-28">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.teams}/{t.maxTeams}</span>
                  <span className="text-xs font-semibold" style={{ color: fill >= 90 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                    {fill} %
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--bg-muted)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${fill}%`,
                      background: fill >= 90 ? 'var(--color-danger)' : fill >= 60 ? 'var(--gold-500)' : 'var(--court-600)',
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {t.priceEuros} €
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuickAction({
  href, label, icon, primary = false,
}: {
  href: string; label: string; icon: React.ReactNode; primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition hover:opacity-80"
      style={{
        borderColor: primary ? 'var(--court-600)' : 'var(--border-subtle)',
        background:  primary ? 'rgba(42,130,100,0.08)' : 'transparent',
        color:       primary ? 'var(--court-600)' : 'var(--text-secondary)',
      }}
    >
      {icon}
      {label}
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-2 text-center text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
  );
}

/* ── Icons ───────────────────────────────────────────────────────────────── */
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function TrophyIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17a1 1 0 0 1-1 1H8v4h8v-4h-1a1 1 0 0 1-1-1v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
}
function UsersIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function EuroIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M4 10h12M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/></svg>;
}
function ChartIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>;
}
function SettingsIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
