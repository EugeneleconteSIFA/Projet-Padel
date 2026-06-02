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
  publishedCount: 2,
  waitlistCount: 2,
  pendingPaymentCount: 1,
  avgFillRate: 75,
  activeLessonGroups: 5,
  enrolledStudents: 42,
  sessionsThisWeek: 12,
};

const CLUB_MAIN_ACTIONS = [
  { href: '/club/tournoi/nouveau', label: 'Créer un tournoi', icon: 'plus' as const, primary: true },
  { href: '/club/cours/nouveau', label: 'Créer un cours', icon: 'calendar' as const },
  { href: '#inscriptions', label: 'Gérer les inscriptions', icon: 'list' as const },
  { href: '#waitlist', label: "Liste d'attente", icon: 'wait' as const },
  { href: '/club/stripe', label: 'Configurer les paiements', icon: 'euro' as const },
  { href: '#actifs', label: 'Assigner un juge-arbitre', icon: 'referee' as const },
] as const;

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

  // MOCK_KPIS sert de base pour garantir que TOUS les champs sont définis (TS strict).
  // data?.kpis ne fait que surcharger sélectivement.
  const kpis: typeof MOCK_KPIS = {
    ...MOCK_KPIS,
    ...(data?.kpis ?? {}),
    activeLessonGroups: (data?.kpis as any)?.activeLessonGroups ?? MOCK_KPIS.activeLessonGroups,
    enrolledStudents: (data?.kpis as any)?.enrolledStudents ?? MOCK_KPIS.enrolledStudents,
    sessionsThisWeek: (data?.kpis as any)?.sessionsThisWeek ?? MOCK_KPIS.sessionsThisWeek,
  };

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
    <div className="mx-auto max-w-5xl space-y-7 pb-4">
      {/* En-tête */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className="leading-tight tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 4vw, 34px)',
              fontWeight: 500,
            }}
          >
            Bienvenue, {clubName}
          </h1>
          {clubSlug && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/club/${clubSlug}/communaute`}
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold"
                style={{ background: 'var(--bg-muted)', color: 'var(--court-700)' }}
              >
                Communauté
              </Link>
              <Link
                href={`/club/${clubSlug}/dashboard/communaute`}
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold"
                style={{ background: 'var(--gold-100)', color: 'var(--gold-700)' }}
              >
                Modération
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* KPIs */}
      <section aria-label="Indicateurs">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <KpiCard
            label="Tournois actifs"
            value={kpis.publishedCount ?? 0}
            icon={<TrophyIcon />}
            accent
          />
          <KpiCard
            label="Inscriptions reçues"
            value={kpis.totalRegistrations ?? 0}
            icon={<UsersIcon />}
          />
          <KpiCard
            label="Taux de remplissage"
            value={`${kpis.avgFillRate ?? 0} %`}
            icon={<ChartIcon />}
          />
          <KpiCard
            label="Revenus estimés"
            value={`${((kpis.totalRevenueCents ?? 0) / 100).toFixed(0)} €`}
            icon={<EuroIcon />}
          />
          <KpiCard
            label="Groupes de cours"
            value={kpis.activeLessonGroups ?? 0}
            icon={<CalendarIcon />}
          />
          <KpiCard
            label="Élèves inscrits"
            value={kpis.enrolledStudents ?? 0}
            icon={<UsersIcon />}
          />
          <KpiCard
            label="Sessions cette semaine"
            value={kpis.sessionsThisWeek ?? 0}
            icon={<ClockIcon />}
          />
        </div>
      </section>

      {/* Actions principales */}
      <section aria-label="Actions principales">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {CLUB_MAIN_ACTIONS.map((action) => (
            <MainActionLink key={action.label} {...action} />
          ))}
        </div>
        <p className="mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Paiements simulés — Stripe Connect à brancher plus tard.
        </p>
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

      {/* Focus tournoi — remplissage faible */}
      {focusTournament && focusTournament.teams / focusTournament.maxTeams < 0.85 && (
        <section
          className="rounded-xl border px-4 py-3"
          style={{
            background: 'color-mix(in srgb, var(--court-100) 35%, var(--bg-surface))',
            borderColor: 'color-mix(in srgb, var(--court-700) 10%, transparent)',
          }}
          aria-label="Alerte remplissage"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-semibold">{focusTournament.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {' '}
                — {focusTournament.teams}/{focusTournament.maxTeams} équipes
                {focusTournament.refereeNames.length === 0 && ' · JA non assigné'}
              </span>
            </p>
            <Link
              href={`/tournois/${focusTournament.slug}`}
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--court-700)' }}
            >
              Ouvrir →
            </Link>
          </div>
          <FillBar teams={focusTournament.teams} maxTeams={focusTournament.maxTeams} className="mt-2" />
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-5 lg:col-span-2">
          <div id="actifs">
            <Section
              title="Tournois actifs"
              action={
                activeTournaments.length === 0
                  ? { label: 'Créer', href: '/club/tournoi/nouveau' }
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
          </div>

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

        {/* Sidebar inscriptions */}
        <div className="space-y-4">
          <div id="inscriptions">
            <Section title="Inscriptions récentes">
              {recentConfirmed.length === 0 && pendingRegs.length === 0 ? (
                <EmptyState message="Aucune inscription pour le moment." />
              ) : (
                <RegistrationList items={[...pendingRegs, ...recentConfirmed].slice(0, 6)} />
              )}
            </Section>
          </div>

          {(waitlistRegs.length > 0 || kpis.waitlistCount > 0) && (
            <div id="waitlist">
              <Section title="Liste d'attente">
                {waitlistRegs.length === 0 ? (
                  <EmptyState message={`${kpis.waitlistCount} joueur(s) en attente sur vos tournois.`} />
                ) : (
                  <RegistrationList items={waitlistRegs} />
                )}
              </Section>
            </div>
          )}
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
  icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl border px-3 py-3"
      style={{
        background: accent ? 'var(--court-100)' : 'var(--bg-surface)',
        borderColor: accent
          ? 'color-mix(in srgb, var(--court-700) 12%, transparent)'
          : 'var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 500,
            lineHeight: 1,
            color: accent ? 'var(--court-700)' : 'var(--text-primary)',
          }}
        >
          {value}
        </p>
        <span style={{ color: accent ? 'var(--court-600)' : 'var(--text-muted)' }}>{icon}</span>
      </div>
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
}: {
  href: string;
  label: string;
  icon: (typeof CLUB_MAIN_ACTIONS)[number]['icon'];
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center transition hover:-translate-y-px"
      style={{
        background: primary ? 'var(--court-700)' : 'var(--bg-surface)',
        borderColor: primary ? 'var(--court-600)' : 'var(--border-subtle)',
        color: primary ? 'var(--cream-50)' : 'var(--text-primary)',
      }}
    >
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

function MainActionIcon({ type }: { type: (typeof CLUB_MAIN_ACTIONS)[number]['icon'] }) {
  switch (type) {
    case 'plus':
      return <PlusIcon />;
    case 'calendar':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'list':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      );
    case 'wait':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'euro':
      return <EuroIcon />;
    case 'referee':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M12 3v18M8 7h8M6 11h12M8 15h8" />
        </svg>
      );
  }
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
      className="rounded-xl border p-4"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
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

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
