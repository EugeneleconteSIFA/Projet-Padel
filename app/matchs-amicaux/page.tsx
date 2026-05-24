import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import {
  FriendlyMatchesClient,
  type FriendlyMatchItem,
} from '@/components/community/FriendlyMatchesClient';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { FriendlyMatchStatus } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Matchs amicaux — The Court',
};

export default async function MatchsAmicauxPage() {
  const session = await auth();

  const rows = await db.friendlyMatch.findMany({
    where: {
      status: FriendlyMatchStatus.OPEN,
      date: { gt: new Date() },
    },
    orderBy: { date: 'asc' },
    include: {
      club: { select: { name: true } },
      creator: {
        include: { user: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  const matches: FriendlyMatchItem[] = rows.map(m => ({
    id: m.id,
    city: m.city,
    date: m.date.toISOString(),
    levelMin: m.levelMin,
    levelMax: m.levelMax,
    spotsLeft: m.spotsLeft,
    spotsTotal: m.spotsTotal,
    description: m.description,
    clubName: m.club?.name ?? null,
    creatorName: `${m.creator.user.firstName} ${m.creator.user.lastName}`,
  }));

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <SiteHeader />
      <main className="mx-auto max-w-screen-md px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1
            className="text-3xl font-medium tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-950)' }}
          >
            Matchs amicaux
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Trouve des partenaires pour jouer entre deux tournois.
          </p>
        </header>
        <FriendlyMatchesClient matches={matches} isLoggedIn={Boolean(session?.user)} />
      </main>
    </div>
  );
}
