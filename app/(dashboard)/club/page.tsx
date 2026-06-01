import Link from 'next/link';
import type { Metadata } from 'next';
import { requireApprovedClub } from '@/lib/auth-guards';
import { getClubDashboard, getClubRegistrations } from '@/lib/actions/club';

export const metadata: Metadata = { title: 'Mon club' };

/* ── Mock data (fallback si pas de BDD) ─────────────────────────────────── */

const MOCK_TOURNAMENTS = [
  {
    id: 'ct1',
    slug: 'open-de-loos-juin',
    name: 'Open de Loos · Juin',
    category: 'P100',
    gender: 'MIXED',
    startDate: new Date('2026-06-15'),
    endDate: new Date('2026-06-15'),
    status: 'REGISTRATION_OPEN',
    teams: 12,
    maxTeams: 16,
    priceEuros: 40,
    refereeNames: ['Marc Dubois'],
  },
  {
    id: 'ct2',
    slug: 'open-de-loos-juillet',
    name: 'Open de Loos · Juillet',
    category: 'P250',
    gender: 'MALE',
    startDate: new Date('2026-07-05'),
    endDate: new Date('2026-07-06'),
    status: 'DRAFT',
    teams: 0,
    maxTeams: 16,
    priceEuros: 60,
    refereeNames: [] as string[],
  },
  {
    id: 'ct3',
    slug: 'open-de-loos-mai',
    name: 'Open de Loos · Mai',
    category: 'P100',
    gender: 'MIXED',
    startDate: new Date('2026-05-17'),
    endDate: new Date('2026-05-17'),
    status: 'COMPLETED',
    teams: 16,
    maxTeams: 16,
    priceEuros: 40,
    refereeNames: ['Marc Dubois'],
  },
];

type TournamentRow = (typeof MOCK_TOURNAMENTS)[number];

type RegistrationRow = {
  id: string;
  tournamentName: string;
  category: string;
  status: string;
  registeredAt: string;
  players: { name: string; email: string; isCaptain: boolean }[];
  paymentStatus: string | null;
  amountCents: number | null;
};

const MOCK_REGISTRATIONS: RegistrationRow[] = [
  {
    id: 'r1',
    tournamentName: 'Open de Loos · Juin',
    category: 'P100',
    status: 'CONFIRMED',
    registeredAt: new Date('2026-05-10').toISOString(),
    players: [
      { name: 'Lucas M.', email: '', isCaptain: true },
      { name: 'Thomas D.', email: '', isCaptain: false },
    ],
    paymentStatus: 'SUCCEEDED',
    amountCents: 4000,
  },
  {
    id: 'r2',
    tournamentName: 'Open de Loos · Juin',
    category: 'P100',
    status: 'CONFIRMED',
    registeredAt: new Date('2026-05-09').toISOString(),
    players: [
      { name: 'Antoine B.', email: '', isCaptain: true },
      { name: 'Pierre L.', email: '', isCaptain: false },
    ],
    paymentStatus: 'SUCCEEDED',
    amountCents: 4000,
  },
  {
    id: 'r3',
    tournamentName: 'Open de Loos · Juin',
    category: 'P100',
    status: 'PENDING_PAYMENT',
    registeredAt: new Date('2026-05-08').toISOString(),
    players: [
      { name: 'Hugo C.', email: '', isCaptain: true },
      { name: 'Marc F.', email: '', isCaptain: false },
    ],
    paymentStatus: null,
    amountCents: 4000,
  },
  {
    id: 'r4',
    tournamentName: 'Open de Loos · Juin',
    category: 'P100',
    status: 'WAITING_LIST',
    registeredAt: new Date('2026-05-07').toISOString(),
    players: [{ name: 'Jean P.', email: '', isCaptain: true }],
    paymentStatus: null,
    amountCents: null,
  },
];

const MOCK_KPIS = {
  totalTournaments: 3,
  totalRegistrations: 12,
  totalRevenueCents: 48000,
  publishedCount: 1,
  waitlistCount: 2,
  pendingPaymentCount: 1,
  avgFillRate: 75,
};

/* ── Libellés ────────────────────────────────────────────────────────────── */

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  REGISTRATION_OPEN: 'Inscriptions ouvertes',
  REGISTRATION_CLOSED: 'Inscriptions fermées',
  RUNNING: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: 'var(--bg-muted)', color: 'var(--text-muted)' },
  PUBLISHED: { bg: 'rgba(42,130,100,0.1)', color: 'var(--court-600)' },
  REGISTRATION_OPEN: { bg: 'rgba(42,130,100,0.1)', color: 'var(--court-600)' },
  REGISTRATION_CLOSED: { bg: 'rgba(201,162,74,0.12)', color: 'var(--gold-700)' },
  RUNNING: { bg: 'rgba(42,130,100,0.15)', color: 'var(--court-700)' },
  COMPLETED: { bg: 'var(--bg-muted)', color: 'var(--text-muted)' },
  CANCELLED: { bg: 'rgba(166,51,46,0.08)', color: 'var(--color-danger)' },
};

const REG_STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmée',
  PENDING_PAYMENT: 'Paiement en attente',
  WAITING_LIST: "Liste d'attente",
  WITHDRAWN: 'Désistement',
  REJECTED: 'Rejeté',
};

const REG_STATUS_COLOR: Record<string, string> = {
  CONFIRMED: 'var(--court-600)',
  PENDING_PAYMENT: 'var(--gold-700)',
  WAITING_LIST: 'var(--text-muted)',
  WITHDRAWN: 'var(--color-danger)',
  REJECTED: 'var(--color-danger)',
};

const GENDER_LABEL: Record<string, string> = {
  MEN: 'Hommes',
  WOMEN: 'Femmes',
  MIXED: 'Mixte',
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function ClubDashboardPage() {
  await requireApprovedClub();

  const [data, realRegistrations] = await Promise.all([
    getClubDashboard().catch(() => null),
    getClubRegistrations().catch(() => null),
  ]);

  const clubName = data?.club.name ?? 'Mon club';
  const clubSlug = data?.club.slug;

  const tournaments: TournamentRow[] = data
    ? data.tournaments.map((t) => {
        const edition = t.editions[0];
        const refereeNames =
          edition?.referees.map((r) => {
            const u = r.referee.user;
            return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Juge-arbitre';
          }) ?? [];
        return {
          id: t.id,
          slug: t.slug,
          name: t.name,
          category: t.category ?? '—',
          gender: t.gender,
          startDate: edition?.startDate ?? new Date(),
          endDate: edition?.endDate ?? new Date(),
          status: edition?.status ?? 'DRAFT',
          teams: edition?._count?.registrations ?? 0,
          maxTeams: edition?.maxTeams ?? 0,
          priceEuros: (edition?.priceCents ?? 0) / 100,
          refereeNames,
        };
      })
    : MOCK_TOURNAMENTS;

  const registrations: RegistrationRow[] =
    realRegistrations && realRegistrations.length > 0
      ? realRegistrations
      : MOCK_REGISTRATIONS;

  const kpis = data?.kpis ?? MOCK_KPIS;

  const activeTournaments = tournaments.filter((t) =>
    ['REGISTRATION_OPEN', 'RUNNING', 'PUBLISHED'].includes(t.status),
  );
  const draftTournaments = tournaments.filter((t) => t.status === 'DRAFT');
  const pastTournaments = tournaments.filter((t) =>
    ['COMPLETED', 'CANCELLED'].includes(t.status),
  );

  const pendingRegs = registrations.filter((r) => r.status === 'PENDING_PAYMENT');
  const waitlistRegs = registrations.filter((r) => r.status === 'WAITING_LIST');
  const recentConfirmed = registrations.filter((r) => r.status === 'CONFIRMED').slice(0, 5);

  const focusTournament =
    activeTournaments.length > 0
      ? [...activeTournaments].sort((a, b) => {
          const fillA = a.maxTeams > 0 ? a.teams / a.maxTeams : 0;
          const fillB = b.maxTeams > 0 ? b.teams / b.maxTeams : 0;
          return fillA - fillB;
        })[0]
      : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* En-tête */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className="font-mono text-[11px] uppercase tracking-[0.14em]"
            style={{ color: 'var(--gold-700)' }}
          >
            Espace club
          </p>
          <h1
            className="mt-2 leading-tight tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 500,
            }}
          >
            {clubName}
          </h1>
          <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
            Suivez vos tournois, inscriptions et remplissage en temps réel.
          </p>
          {clubSlug && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/club/${clubSlug}/communaute`}
                className="rounded-xl px-3 py-2 text-xs font-semibold"
                style={{ background: 'var(--bg-muted)', color: 'var(--court-800)' }}
              >
                Communauté
              </Link>
              <Link
                href={`/club/${clubSlug}/dashboard/communaute`}
                className="rounded-xl px-3 py-2 text-xs font-semibold"
                style={{ background: 'var(--gold-100)', color: 'var(--gold-800)' }}
              >
                Modération
              </Link>
            </div>
          )}
        </div>
        <Link
          href="/club/tournoi/nouveau"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--court-700)' }}
        >
          <PlusIcon />
          Nouveau tournoi
        </Link>
      </header>

      {/* KPIs */}
      <section aria-label="Indicateurs">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Tournois actifs"
            value={kpis.publishedCount}
            sub="publiés ou en cours"
            icon={<TrophyIcon />}
            accent
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
            sub="paiements confirmés"
            icon={<EuroIcon />}
          />
          <KpiCard
            label="Remplissage moyen"
            value={`${kpis.avgFillRate} %`}
            sub="tournois actifs"
            icon={<ChartIcon />}
          />
        </div>
      </section>

      {/* Alertes */}
      {(kpis.pendingPaymentCount > 0 || kpis.waitlistCount > 0) && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Alertes">
          {kpis.pendingPaymentCount > 0 && (
            <AlertCard
              title={`${kpis.pendingPaymentCount} paiement${kpis.pendingPaymentCount > 1 ? 's' : ''} en attente`}
              body="Des équipes n'ont pas finalisé leur règlement."
              href="/club/stripe"
              cta="Gérer les paiements"
              tone="gold"
            />
          )}
          {kpis.waitlistCount > 0 && (
            <AlertCard
              title={`${kpis.waitlistCount} joueur${kpis.waitlistCount > 1 ? 's' : ''} en liste d'attente`}
              body="Des places peuvent se libérer — pensez à activer la relance."
              tone="court"
            />
          )}
        </section>
      )}

      {/* Focus tournoi */}
      {focusTournament && (
        <section
          className="rounded-2xl border p-5"
          style={{
            background: 'color-mix(in srgb, var(--court-100) 40%, var(--bg-surface))',
            borderColor: 'color-mix(in srgb, var(--court-700) 12%, transparent)',
          }}
          aria-label="Priorité du moment"
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.12em]"
            style={{ color: 'var(--court-600)' }}
          >
            Priorité du moment
          </p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{focusTournament.name}</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {focusTournament.teams}/{focusTournament.maxTeams} équipes ·{' '}
                {focusTournament.refereeNames.length > 0
                  ? `JA : ${focusTournament.refereeNames.join(', ')}`
                  : 'Aucun juge-arbitre assigné'}
              </p>
            </div>
            <Link
              href={`/tournois/${focusTournament.slug}`}
              className="text-sm font-semibold hover:underline"
              style={{ color: 'var(--court-700)' }}
            >
              Voir la fiche →
            </Link>
          </div>
          <FillBar teams={focusTournament.teams} maxTeams={focusTournament.maxTeams} className="mt-4" />
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          <Section
            title="Tournois actifs"
            action={
              activeTournaments.length === 0
                ? { label: 'Créer un tournoi', href: '/club/tournoi/nouveau' }
                : undefined
            }
          >
            {activeTournaments.length === 0 ? (
              <EmptyState message="Aucun tournoi actif. Créez votre premier événement." />
            ) : (
              <ul className="space-y-2">
                {activeTournaments.map((t) => (
                  <li key={t.id}>
                    <CompactTournamentCard tournament={t} />
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {draftTournaments.length > 0 && (
            <Section title="Brouillons">
              <ul className="space-y-2">
                {draftTournaments.map((t) => (
                  <li key={t.id}>
                    <CompactTournamentCard tournament={t} muted />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {pastTournaments.length > 0 && (
            <Section title="Historique">
              <ul className="space-y-2">
                {pastTournaments.map((t) => (
                  <li key={t.id}>
                    <CompactTournamentCard tournament={t} muted />
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {pendingRegs.length > 0 && (
            <Section title="Paiements à traiter">
              <RegistrationList items={pendingRegs} />
            </Section>
          )}

          {waitlistRegs.length > 0 && (
            <Section title="Liste d'attente">
              <RegistrationList items={waitlistRegs} />
            </Section>
          )}

          <Section title="Dernières inscriptions">
            {recentConfirmed.length === 0 ? (
              <EmptyState message="Aucune inscription confirmée récente." />
            ) : (
              <RegistrationList items={recentConfirmed} />
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
              <QuickAction href="/club/tournoi/nouveau" label="Créer un tournoi" icon={<PlusIcon />} primary />
              <QuickAction href="/club/parametres" label="Paramètres du club" icon={<SettingsIcon />} />
              <QuickAction href="/club/stripe" label="Configurer les paiements" icon={<EuroIcon />} />
            </div>
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{
              background: 'color-mix(in srgb, var(--gold-100) 35%, var(--bg-surface))',
              borderColor: 'color-mix(in srgb, var(--gold-500) 20%, transparent)',
            }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--gold-800)' }}>
              Paiements simulés
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Stripe Connect arrive bientôt. Les inscriptions et statuts de paiement sont déjà
              suivis dans le dashboard.
            </p>
            <Link
              href="/club/stripe"
              className="mt-3 inline-block text-xs font-semibold hover:underline"
              style={{ color: 'var(--gold-700)' }}
            >
              En savoir plus →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   Composants locaux
   ============================================================================= */

function KpiCard({
  label,
  value,
  sub,
  icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: accent ? 'var(--court-100)' : 'var(--bg-surface)',
        borderColor: accent
          ? 'color-mix(in srgb, var(--court-700) 12%, transparent)'
          : 'var(--border-subtle)',
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span style={{ color: accent ? 'var(--court-600)' : 'var(--text-muted)' }}>{icon}</span>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: 500,
          lineHeight: 1,
          color: accent ? 'var(--court-700)' : 'var(--text-primary)',
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
  href,
  cta,
  tone,
}: {
  title: string;
  body: string;
  href?: string;
  cta?: string;
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
      {href && cta && (
        <Link
          href={href}
          className="mt-2 inline-block text-xs font-semibold hover:underline"
          style={{ color: isGold ? 'var(--gold-700)' : 'var(--court-700)' }}
        >
          {cta} →
        </Link>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  action,
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
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
        >
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="text-xs font-medium transition hover:underline"
            style={{ color: 'var(--court-600)' }}
          >
            {action.label} →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function CompactTournamentCard({
  tournament: t,
  muted = false,
}: {
  tournament: TournamentRow;
  muted?: boolean;
}) {
  const sc = STATUS_COLOR[t.status] ?? STATUS_COLOR.DRAFT;
  const fill = t.maxTeams > 0 ? Math.round((t.teams / t.maxTeams) * 100) : 0;

  return (
    <Link
      href={`/tournois/${t.slug}`}
      className="block rounded-xl border px-4 py-3 transition hover:-translate-y-px"
      style={{
        background: 'var(--bg-page)',
        borderColor: 'var(--border-subtle)',
        opacity: muted ? 0.85 : 1,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: muted ? 'var(--text-muted)' : 'var(--text-primary)' }}
            >
              {t.name}
            </p>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: sc.bg, color: sc.color }}
            >
              {STATUS_LABEL[t.status] ?? t.status}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            {t.category} · {GENDER_LABEL[t.gender] ?? t.gender} ·{' '}
            {new Date(t.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            {' · '}
            {t.priceEuros} €
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {t.refereeNames.length > 0
              ? `JA : ${t.refereeNames.join(', ')}`
              : 'JA non assigné'}
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs font-semibold" style={{ color: 'var(--court-700)' }}>
          {fill}%
        </span>
      </div>
      <FillBar teams={t.teams} maxTeams={t.maxTeams} className="mt-3" />
    </Link>
  );
}

function FillBar({
  teams,
  maxTeams,
  className = '',
}: {
  teams: number;
  maxTeams: number;
  className?: string;
}) {
  const fill = maxTeams > 0 ? Math.round((teams / maxTeams) * 100) : 0;
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
        <span>
          {teams}/{maxTeams} équipes
        </span>
        <span style={{ color: fill >= 90 ? 'var(--color-danger)' : undefined }}>{fill}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--bg-muted)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${fill}%`,
            background:
              fill >= 90 ? 'var(--color-danger)' : fill >= 60 ? 'var(--gold-500)' : 'var(--court-600)',
          }}
        />
      </div>
    </div>
  );
}

function RegistrationList({ items }: { items: RegistrationRow[] }) {
  return (
    <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
      {items.map((r) => {
        const regStatusColor = REG_STATUS_COLOR[r.status] ?? 'var(--text-muted)';
        const amountEuros = r.amountCents != null ? r.amountCents / 100 : 0;
        return (
          <li key={r.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.tournamentName}</p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {r.players.map((p) => p.name).join(' · ')}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(r.registeredAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                  {amountEuros > 0 && ` · ${amountEuros.toFixed(0)} €`}
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ color: regStatusColor, background: `${regStatusColor}18` }}
              >
                {REG_STATUS_LABEL[r.status] ?? r.status}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function QuickAction({
  href,
  label,
  icon,
  primary = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition hover:opacity-80"
      style={{
        borderColor: primary ? 'var(--court-600)' : 'var(--border-subtle)',
        background: primary ? 'rgba(42,130,100,0.08)' : 'transparent',
        color: primary ? 'var(--court-600)' : 'var(--text-secondary)',
      }}
    >
      {icon}
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

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function TrophyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17a1 1 0 0 1-1 1H8v4h8v-4h-1a1 1 0 0 1-1-1v-2.34" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function EuroIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M4 10h12M4 14h9" />
      <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
