import Link from 'next/link';
import type { Metadata } from 'next';
import { getLessonGroupsForClub, getLessonSessionsInRange } from '@/lib/actions/club-lessons';
import { LessonCalendarWeek } from '@/components/club/lesson-calendar-week';
import { LessonCalendarMonth } from '@/components/club/lesson-calendar-month';

export const metadata: Metadata = { title: 'Cours' };

/* ── Mock data (fallback si pas de BDD) ─────────────────────────────────── */

const MOCK_KPIS = {
  activeGroups: 5,
  enrolledStudents: 42,
  sessionsThisWeek: 12,
  avgFillRate: 85,
};

const MOCK_GROUPS = [
  {
    id: 'g1',
    name: 'Adultes Intermédiaire — Mardi 19h',
    audience: 'ADULT',
    level: 'INTERMEDIATE',
    capacity: 4,
    enrolledCount: 4,
    sessionCount: 24,
    status: 'PUBLISHED',
    coach: { id: 'c1', firstName: 'Marc', lastName: 'Dubois', avatarUrl: null },
    court: { id: 'court1', name: 'Terrain 1' },
  },
  {
    id: 'g2',
    name: 'Junior Débutant — Mercredi 17h',
    audience: 'JUNIOR',
    level: 'BEGINNER',
    capacity: 4,
    enrolledCount: 3,
    sessionCount: 20,
    status: 'PUBLISHED',
    coach: { id: 'c2', firstName: 'Sophie', lastName: 'Martin', avatarUrl: null },
    court: { id: 'court2', name: 'Terrain 2' },
  },
];

/* ── Libellés ────────────────────────────────────────────────────────────── */

const AUDIENCE_LABEL: Record<string, string> = {
  MINI: 'Mini (5-7 ans)',
  JUNIOR: 'Junior (8-12 ans)',
  TEEN: 'Ado (13-17 ans)',
  ADULT: 'Adulte (18+)',
  SENIOR: 'Senior (50+)',
  MIXED: 'Mixte',
};

const LEVEL_LABEL: Record<string, string> = {
  INITIATION: 'Initiation',
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Confirmé',
  COMPETITION: 'Compétition',
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé',
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: 'var(--bg-muted)', color: 'var(--text-muted)' },
  PUBLISHED: { bg: 'rgba(42,130,100,0.1)', color: 'var(--court-600)' },
  ARCHIVED: { bg: 'var(--bg-muted)', color: 'var(--text-muted)' },
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function CoursPage() {
  const [groups, sessionsThisWeek] = await Promise.all([
    getLessonGroupsForClub({ status: 'PUBLISHED' }).catch(() => MOCK_GROUPS),
    getLessonSessionsInRange(
      new Date(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).catch(() => []),
  ]);

  // Calculer les KPIs
  const activeGroups = groups?.length ?? 0;
  const enrolledStudents = groups?.reduce((sum, g) => sum + (g.enrolledCount || 0), 0) ?? 0;
  const sessionsThisWeekCount = sessionsThisWeek?.length ?? 0;
  
  const totalCapacity = groups?.reduce((sum, g) => sum + (g.capacity || 0), 0) ?? 0;
  const avgFillRate = totalCapacity > 0 
    ? Math.round((enrolledStudents / totalCapacity) * 100) 
    : 0;

  const kpis = {
    activeGroups,
    enrolledStudents,
    sessionsThisWeek: sessionsThisWeekCount,
    avgFillRate,
  };

  // Calculer le début de la semaine courante (lundi)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(today.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-4">
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
            Cours
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Gérez les cours de votre club
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/club/cours/nouveau"
            className="rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-px"
            style={{
              background: 'var(--court-700)',
              borderColor: 'var(--court-600)',
              color: 'var(--cream-50)',
            }}
          >
            + Nouveau cours
          </Link>
          <Link
            href="/club/cours/coachs"
            className="rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-px"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            Coachs
          </Link>
        </div>
      </header>

      {/* KPIs */}
      <section aria-label="Indicateurs">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <KpiCard
            label="Groupes actifs"
            value={kpis.activeGroups}
            icon={<CalendarIcon />}
          />
          <KpiCard
            label="Élèves inscrits"
            value={kpis.enrolledStudents}
            icon={<UsersIcon />}
          />
          <KpiCard
            label="Sessions cette semaine"
            value={kpis.sessionsThisWeek}
            icon={<ClockIcon />}
          />
          <KpiCard
            label="Taux de remplissage"
            value={`${kpis.avgFillRate} %`}
            icon={<ChartIcon />}
          />
        </div>
      </section>

      {/* Toggle vue */}
      <div className="flex items-center gap-2 rounded-lg border p-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          className="flex-1 rounded-md px-4 py-2 text-sm font-medium transition"
          style={{
            background: 'var(--court-700)',
            color: 'var(--cream-50)',
          }}
        >
          Semaine
        </button>
        <button
          className="flex-1 rounded-md px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          style={{
            background: 'transparent',
            color: 'var(--text-secondary)',
          }}
        >
          Mois (agenda)
        </button>
      </div>

      {/* Calendrier semaine */}
      <section>
        <LessonCalendarWeek initialWeekStart={weekStart} />
      </section>

      {/* Groupes récents */}
      {groups && groups.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Groupes actifs
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.slice(0, 6).map((group) => {
              const sc = STATUS_COLOR[group.status] ?? STATUS_COLOR.DRAFT;
              return (
                <Link
                  key={group.id}
                  href={`/club/cours/${group.id}`}
                  className="block rounded-xl border p-4 transition hover:-translate-y-px"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {group.name}
                    </h3>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {STATUS_LABEL[group.status] ?? group.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-2">
                      <span>{AUDIENCE_LABEL[group.audience] ?? group.audience}</span>
                      <span>·</span>
                      <span>{LEVEL_LABEL[group.level] ?? group.level}</span>
                    </div>
                    <div>
                      {group.coach.firstName} {group.coach.lastName}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{group.enrolledCount}/{group.capacity} élèves</span>
                      <span>{group.sessionCount} sessions</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
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
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border px-3 py-3"
      style={{
        background: 'var(--court-100)',
        borderColor: 'color-mix(in srgb, var(--court-700) 12%, transparent)',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 500,
            lineHeight: 1,
            color: 'var(--court-700)',
          }}
        >
          {value}
        </p>
        <span style={{ color: 'var(--court-600)' }}>{icon}</span>
      </div>
      <p className="mt-1.5 text-[10px] font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
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

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
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
