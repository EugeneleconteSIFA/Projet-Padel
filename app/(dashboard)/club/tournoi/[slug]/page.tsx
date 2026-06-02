import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireApprovedClub } from '@/lib/auth-guards';
import { db } from '@/lib/db';
import { RefereeSection } from './referee-section';

export default async function TournamentManagePage({ params }: { params: { slug: string } }) {
  await requireApprovedClub();

  const tournament = await db.tournament.findUnique({
    where: { slug: params.slug },
    include: {
      club: true,
      editions: {
        orderBy: { startDate: 'desc' },
        take: 1,
        include: {
          referees: {
            include: {
              referee: {
                include: {
                  user: { select: { firstName: true, lastName: true, email: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!tournament) notFound();

  const edition = tournament.editions[0];
  if (!edition) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/club"
          className="text-sm font-medium transition hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Retour
        </Link>
        <h1
          className="leading-tight"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 500,
          }}
        >
          {tournament.name}
        </h1>
      </div>

      <div
        className="rounded-xl border p-4"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Catégorie</p>
            <p className="font-semibold">{tournament.category ?? '—'}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Genre</p>
            <p className="font-semibold">{tournament.gender}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Date</p>
            <p className="font-semibold">
              {new Date(edition.startDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Statut</p>
            <p className="font-semibold">{edition.status}</p>
          </div>
        </div>
      </div>

      <RefereeSection 
        editionId={edition.id} 
        tournamentName={tournament.name}
        initialAssignments={edition.referees}
      />
    </div>
  );
}
