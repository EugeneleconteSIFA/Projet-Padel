import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { NewPostForm } from '@/components/community/NewPostForm';
import { PrivateFeedList } from '@/components/community/PrivateFeedList';
import { getAuthorClubOptions } from '@/lib/actions/community/create-post';
import { getOrCreatePlayerProfile } from '@/lib/community/player';
import { fetchPrivateFeedPosts } from '@/lib/community/posts';

export const metadata: Metadata = {
  title: 'Mon feed — The Court',
};

export default async function MonFeedPage() {
  const session = await auth();
  if (session?.user?.id) {
    await getOrCreatePlayerProfile(session.user.id);
  }

  const [feed, clubOptions] = await Promise.all([
    fetchPrivateFeedPosts(),
    getAuthorClubOptions(),
  ]);

  return (
    <div className="mx-auto max-w-screen-md">
      <header className="mb-6">
        <p
          className="mb-1 text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--gold-600)' }}
        >
          Communauté
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1
            className="text-3xl font-medium tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-950)' }}
          >
            Mon feed
          </h1>
          <Link
            href="/feed"
            className="inline-flex min-h-11 items-center text-sm font-medium"
            style={{ color: 'var(--court-700)' }}
          >
            Feed public →
          </Link>
        </div>
      </header>

      <NewPostForm clubOptions={clubOptions} />

      {feed.posts.length === 0 ? (
        <div
          className="rounded-2xl border px-6 py-10 text-center"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Suis des joueurs ou publie ton premier post pour remplir ton feed.
          </p>
        </div>
      ) : (
        <PrivateFeedList
          initialPosts={feed.posts}
          initialCursor={feed.nextCursor}
          viewerPlayerProfileId={feed.viewerPlayerProfileId}
        />
      )}
    </div>
  );
}
