import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { FeedList } from '@/components/community/FeedList';
import { fetchPublicFeedPosts } from '@/lib/community/posts';

export const metadata: Metadata = {
  title: 'Feed — The Court',
  description: 'Moments de jeu, résultats et annonces de la communauté padel.',
};

export default async function FeedPage() {
  const { posts, nextCursor, viewerPlayerProfileId } = await fetchPublicFeedPosts();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <SiteHeader />

      <main className="mx-auto max-w-screen-md px-4 py-8 sm:px-6">
        <header className="mb-8">
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--gold-600)' }}
          >
            Communauté
          </p>
          <h1
            className="text-3xl font-medium tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-950)' }}
          >
            Feed
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Résultats, moments de jeu et annonces des clubs.
          </p>
        </header>

        {posts.length === 0 ? (
          <div
            className="rounded-2xl border px-6 py-12 text-center"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <p className="text-base font-medium" style={{ color: 'var(--ink-950)' }}>
              Sois le premier à partager un moment de jeu
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Les posts publics des joueurs et les résultats de tournois apparaîtront ici.
            </p>
            <Link
              href="/login?callbackUrl=/feed"
              className="mt-6 inline-flex min-h-11 items-center rounded-xl px-5 text-sm font-semibold"
              style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <FeedList
            initialPosts={posts}
            initialCursor={nextCursor}
            viewerPlayerProfileId={viewerPlayerProfileId}
          />
        )}
      </main>
    </div>
  );
}
