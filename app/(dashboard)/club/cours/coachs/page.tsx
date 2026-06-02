import Link from 'next/link';
import type { Metadata } from 'next';
import { archiveCoach } from '@/lib/actions/club-coaches';

export const metadata: Metadata = { title: 'Coachs' };

/* ── Mock data (fallback si pas de BDD) ─────────────────────────────────── */

const MOCK_COACHES = [
  {
    id: 'c1',
    firstName: 'Marc',
    lastName: 'Dubois',
    email: 'marc.dubois@example.com',
    phone: '06 12 34 56 78',
    avatarUrl: null,
    isActive: true,
    activeGroupsCount: 3,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'c2',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@example.com',
    phone: '06 98 76 54 32',
    avatarUrl: null,
    isActive: true,
    activeGroupsCount: 2,
    createdAt: '2026-02-20T14:30:00Z',
  },
];

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function CoachsPage() {
  const coaches = await listCoaches().catch(() => MOCK_COACHES);

  async function handleArchive(formData: FormData) {
    'use server';
    const coachId = formData.get('coachId') as string;
    await archiveCoach(coachId);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-4">
      {/* En-tête */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/club/cours"
            className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            ← Retour
          </Link>
          <div>
            <h1
              className="leading-tight tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 4vw, 34px)',
                fontWeight: 500,
              }}
            >
              Coachs
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Gérez les coachs de votre club
            </p>
          </div>
        </div>
        <Link
          href="/club/cours/coachs/nouveau"
          className="rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-px"
          style={{
            background: 'var(--court-700)',
            borderColor: 'var(--court-600)',
            color: 'var(--cream-50)',
          }}
        >
          + Nouveau coach
        </Link>
      </header>

      {/* Liste des coachs */}
      <section>
        {coaches && coaches.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {coaches.map((coach: any) => (
              <div
                key={coach.id}
                className="rounded-xl border p-4"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  opacity: coach.isActive ? 1 : 0.6,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold"
                      style={{
                        background: 'var(--court-100)',
                        color: 'var(--court-700)',
                      }}
                    >
                      {coach.firstName[0]}{coach.lastName[0]}
                    </div>

                    {/* Infos */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {coach.firstName} {coach.lastName}
                        </h3>
                        {!coach.isActive && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              background: 'var(--bg-muted)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            Inactif
                          </span>
                        )}
                      </div>
                      <div className="mt-1 space-y-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {coach.email && <p>{coach.email}</p>}
                        {coach.phone && <p>{coach.phone}</p>}
                        <p>
                          {coach.activeGroupsCount} groupe{coach.activeGroupsCount > 1 ? 's' : ''} actif{coach.activeGroupsCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/club/cours/coachs/${coach.id}/modifier`}
                      className="rounded px-2 py-1 text-xs font-medium transition hover:bg-gray-100"
                      style={{ color: 'var(--court-700)' }}
                    >
                      Modifier
                    </Link>
                    {coach.isActive && (
                      <form action={handleArchive}>
                        <input type="hidden" name="coachId" value={coach.id} />
                        <button
                          type="submit"
                          className="rounded px-2 py-1 text-xs font-medium transition hover:bg-gray-100"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          Archiver
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Aucun coach. Ajoutez votre premier coach.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// Import the listCoaches function
async function listCoaches() {
  const { listCoaches: listCoachesAction } = await import('@/lib/actions/club-coaches');
  return listCoachesAction();
}
