import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { FriendlyMatchForm } from '@/components/community/FriendlyMatchForm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getOrCreatePlayerProfile } from '@/lib/community/player';

export const metadata: Metadata = {
  title: 'Nouveau match amical — The Court',
};

export default async function NouveauMatchAmicalPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/matchs-amicaux/nouveau');
  }

  const profile = await getOrCreatePlayerProfile(session.user.id);
  const memberships = await db.clubMembership.findMany({
    where: { playerProfileId: profile.id, isActive: true },
    include: { club: { select: { id: true, name: true } } },
  });

  const clubOptions = memberships.map(m => ({ id: m.club.id, name: m.club.name }));

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <SiteHeader />
      <main className="mx-auto max-w-screen-md px-4 py-8 sm:px-6">
        <Link
          href="/matchs-amicaux"
          className="mb-6 inline-flex min-h-11 items-center text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          ← Retour aux matchs
        </Link>
        <h1
          className="mb-6 text-2xl font-medium"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-950)' }}
        >
          Proposer un match
        </h1>
        <FriendlyMatchForm clubOptions={clubOptions} />
      </main>
    </div>
  );
}
