import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { ClubAnnouncementForm } from '@/components/community/ClubAnnouncementForm';
import { PostCard } from '@/components/community/PostCard';
import { getClubBySlug, getClubMemberAccess } from '@/lib/community/club-access';
import { fetchClubCommunityPosts } from '@/lib/community/posts';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  return {
    title: club ? `Communauté — ${club.name}` : 'Communauté club',
  };
}

export default async function ClubCommunautePage({ params }: Props) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) notFound();

  const access = await getClubMemberAccess(club.id);

  if (!access.isMember) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <SiteHeader />
        <main className="mx-auto max-w-screen-md px-4 py-12 text-center sm:px-6">
          <h1
            className="text-2xl font-medium"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-950)' }}
          >
            Espace réservé aux membres
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Cet espace est réservé aux membres du club {club.name}.
          </p>
          <button
            type="button"
            className="mt-6 inline-flex min-h-11 items-center rounded-xl px-6 py-2.5 text-sm font-semibold"
            style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
          >
            Demander à rejoindre
          </button>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            Fonctionnalité à venir — contactez le club directement.
          </p>
          <Link
            href="/clubs"
            className="mt-8 inline-flex min-h-11 items-center text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            ← Retour aux clubs
          </Link>
        </main>
      </div>
    );
  }

  const { posts, viewerPlayerProfileId } = await fetchClubCommunityPosts(club.id);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <SiteHeader />
      <main className="mx-auto max-w-screen-md px-4 py-8 sm:px-6">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gold-600)' }}>
            {club.name}
          </p>
          <h1
            className="text-3xl font-medium tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-950)' }}
          >
            Communauté
          </h1>
          {access.isClubOwner && (
            <Link
              href={`/club/${slug}/dashboard/communaute`}
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium"
              style={{ color: 'var(--court-700)' }}
            >
              Modération →
            </Link>
          )}
        </header>

        {access.isClubOwner && (
          <ClubAnnouncementForm clubId={club.id} clubSlug={slug} />
        )}

        {posts.length === 0 ? (
          <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
            Aucun post pour l&apos;instant. Sois le premier à partager !
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                viewerPlayerProfileId={viewerPlayerProfileId}
                showClubBadge
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
