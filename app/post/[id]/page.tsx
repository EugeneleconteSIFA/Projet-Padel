import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { PostCard } from '@/components/community/PostCard';
import { postFeedInclude, resolveFeedViewer, serializePost } from '@/lib/community/posts';
import { db } from '@/lib/db';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await db.post.findUnique({
    where: { id },
    select: { content: true },
  });
  if (!post) return { title: 'Post — The Court' };
  return {
    title: 'Post — The Court',
    description: post.content.slice(0, 120),
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const { viewerPlayerProfileId } = await resolveFeedViewer();

  const post = await db.post.findUnique({
    where: { id },
    include: postFeedInclude,
  });

  if (!post) notFound();

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
        <PostCard
          post={serializePost(post, viewerPlayerProfileId)}
          viewerPlayerProfileId={viewerPlayerProfileId}
        />
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Les commentaires arrivent bientôt.
        </p>
      </main>
    </div>
  );
}
