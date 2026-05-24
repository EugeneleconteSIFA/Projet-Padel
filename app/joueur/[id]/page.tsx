import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { db } from '@/lib/db';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = await db.playerProfile.findUnique({
    where: { id },
    include: { user: { select: { firstName: true, lastName: true } } },
  });
  if (!profile) return { title: 'Joueur — The Court' };
  return {
    title: `${profile.user.firstName} ${profile.user.lastName} — The Court`,
  };
}

export default async function JoueurPage({ params }: Props) {
  const { id } = await params;

  const profile = await db.playerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, avatarUrl: true, id: true } },
    },
  });

  if (!profile) notFound();

  const { firstName, lastName, avatarUrl } = profile.user;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <SiteHeader />
      <main className="mx-auto max-w-screen-md px-4 py-8 sm:px-6">
        <Link
          href="/feed"
          className="mb-6 inline-flex min-h-11 items-center text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          ← Retour au feed
        </Link>

        <div
          className="flex flex-col items-center rounded-2xl border p-8 text-center"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="mb-4 h-24 w-24 rounded-2xl object-cover" />
          ) : (
            <div
              className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl text-2xl font-semibold"
              style={{ background: 'var(--court-100)', color: 'var(--court-800)' }}
            >
              {initials}
            </div>
          )}
          <h1
            className="text-2xl font-medium"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-950)' }}
          >
            {firstName} {lastName}
          </h1>
          {profile.hasCompletedTournament && (
            <p className="mt-2 text-sm" style={{ color: 'var(--court-700)' }}>
              Joueur de tournoi
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
