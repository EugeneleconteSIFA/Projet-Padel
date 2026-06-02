import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLessonGroupDetail, publishLessonGroup, archiveLessonGroup, enrollPlayerInGroup, unenrollPlayer } from '@/lib/actions/club-lessons';

interface PageProps {
  params: { groupId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: 'Détail du cours' };
}

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

const WEEKDAY_LABEL: Record<number, string> = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function LessonGroupDetailPage({ params }: PageProps) {
  const group = await getLessonGroupDetail(params.groupId);

  if (!group) {
    notFound();
  }

  async function handlePublish() {
    'use server';
    await publishLessonGroup(params.groupId);
  }

  async function handleArchive() {
    'use server';
    await archiveLessonGroup(params.groupId);
  }

  async function handleEnroll(formData: FormData) {
    'use server';
    const playerProfileId = formData.get('playerProfileId') as string;
    await enrollPlayerInGroup(params.groupId, { playerProfileId });
  }

  async function handleUnenroll(formData: FormData) {
    'use server';
    const enrollmentId = formData.get('enrollmentId') as string;
    await unenrollPlayer(enrollmentId);
  }

  const activeEnrollments = group.enrollments.filter(e => e.status === 'ACTIVE');
  const waitingList = group.enrollments.filter(e => e.status === 'WAITING_LIST');
  const spotsLeft = group.capacity - activeEnrollments.length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-4">
      {/* En-tête */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/club/cours"
            className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            ← Retour
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="leading-tight tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(26px, 4vw, 34px)',
                  fontWeight: 500,
                }}
              >
                {group.name}
              </h1>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: STATUS_COLOR[group.status].bg, color: STATUS_COLOR[group.status].color }}
              >
                {STATUS_LABEL[group.status]}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>{AUDIENCE_LABEL[group.audience]}</span>
              <span>·</span>
              <span>{LEVEL_LABEL[group.level]}</span>
              <span>·</span>
              <span>{WEEKDAY_LABEL[group.weekday]} {group.startTime}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {group.status === 'DRAFT' && (
            <form action={handlePublish}>
              <button
                type="submit"
                className="rounded-lg border px-4 py-2 text-sm font-semibold transition hover:-translate-y-px"
                style={{
                  background: 'var(--court-700)',
                  borderColor: 'var(--court-600)',
                  color: 'var(--cream-50)',
                }}
              >
                Publier
              </button>
            </form>
          )}
          {group.status === 'PUBLISHED' && (
            <form action={handleArchive}>
              <button
                type="submit"
                className="rounded-lg border px-4 py-2 text-sm font-semibold transition hover:-translate-y-px"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                Archiver
              </button>
            </form>
          )}
          <Link
            href={`/club/cours/${params.groupId}/modifier`}
            className="rounded-lg border px-4 py-2 text-sm font-semibold transition hover:-translate-y-px"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            Modifier
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne 1 — Infos */}
        <div className="space-y-4">
          <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Informations
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Coach</p>
                <p style={{ color: 'var(--text-primary)' }}>
                  {group.coach.firstName} {group.coach.lastName}
                </p>
              </div>
              {group.court && (
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Terrain</p>
                  <p style={{ color: 'var(--text-primary)' }}>{group.court.name}</p>
                </div>
              )}
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Horaire</p>
                <p style={{ color: 'var(--text-primary)' }}>
                  {WEEKDAY_LABEL[group.weekday]} {group.startTime} ({group.durationMinutes} min)
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Saison</p>
                <p style={{ color: 'var(--text-primary)' }}>
                  {new Date(group.seasonStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' → '}
                  {new Date(group.seasonEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Prix</p>
                <p style={{ color: 'var(--text-primary)' }}>
                  {(group.priceCents / 100).toFixed(0)} € / élève
                </p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Statistiques
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Sessions à venir</span>
                <span style={{ color: 'var(--text-primary)' }}>{group.sessions.length}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Capacité</span>
                <span style={{ color: 'var(--text-primary)' }}>{group.capacity} élèves</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Inscrits</span>
                <span style={{ color: 'var(--text-primary)' }}>{activeEnrollments.length}/{group.capacity}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Colonne 2 — Élèves inscrits */}
        <div className="space-y-4">
          <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Élèves inscrits
              </h2>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {activeEnrollments.length}/{group.capacity}
              </span>
            </div>

            {activeEnrollments.length === 0 ? (
              <p className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Aucun élève inscrit
              </p>
            ) : (
              <div className="space-y-2">
                {activeEnrollments.map(enrollment => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                        style={{
                          background: 'var(--court-100)',
                          color: 'var(--court-700)',
                        }}
                      >
                        {enrollment.player.firstName[0]}{enrollment.player.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {enrollment.player.firstName} {enrollment.player.lastName}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {enrollment.player.email}
                        </p>
                      </div>
                    </div>
                    <form action={handleUnenroll}>
                      <input type="hidden" name="enrollmentId" value={enrollment.id} />
                      <button
                        type="submit"
                        className="rounded px-2 py-1 text-xs transition hover:bg-gray-100"
                        style={{ color: 'var(--color-danger)' }}
                      >
                        Retirer
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}

            {spotsLeft > 0 && (
              <div className="mt-3 rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {spotsLeft} place{spotsLeft > 1 ? 's' : ''} disponible{spotsLeft > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </section>

          {/* Liste d'attente */}
          {waitingList.length > 0 && (
            <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Liste d'attente ({waitingList.length})
              </h2>
              <div className="space-y-2">
                {waitingList.map(enrollment => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                    style={{ borderColor: 'var(--border-subtle)', opacity: 0.7 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                        style={{
                          background: 'var(--bg-muted)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {enrollment.player.firstName[0]}{enrollment.player.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {enrollment.player.firstName} {enrollment.player.lastName}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {enrollment.player.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--gold-700)' }}>
                      En attente
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Colonne 3 — Sessions à venir */}
        <div className="space-y-4">
          <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Sessions à venir
            </h2>

            {group.sessions.length === 0 ? (
              <p className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Aucune session à venir
              </p>
            ) : (
              <div className="space-y-2">
                {group.sessions.map(session => {
                  const sessionDate = new Date(session.date);
                  return (
                    <div
                      key={session.id}
                      className="rounded-lg border p-3"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {sessionDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {sessionDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            background: 'var(--court-100)',
                            color: 'var(--court-700)',
                          }}
                        >
                          {session.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {group.description && (
            <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Description
              </h2>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {group.description}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
