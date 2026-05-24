'use client';

import { useState, useTransition } from 'react';
import { loadMoreFeedPosts } from '@/lib/actions/community/feed';
import type { FeedCursor, SerializedPost } from '@/lib/community/posts';
import { PostCard } from '@/components/community/PostCard';

type FeedListProps = {
  initialPosts: SerializedPost[];
  initialCursor: FeedCursor | null;
  viewerPlayerProfileId: string | null;
};

export function FeedList({
  initialPosts,
  initialCursor,
  viewerPlayerProfileId,
}: FeedListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState<FeedCursor | null>(initialCursor);
  const [pending, startTransition] = useTransition();

  const loadMore = () => {
    if (!cursor || pending) return;

    startTransition(async () => {
      const result = await loadMoreFeedPosts(cursor);
      setPosts(prev => [...prev, ...result.posts]);
      setCursor(result.nextCursor);
    });
  };

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          viewerPlayerProfileId={viewerPlayerProfileId}
        />
      ))}

      {cursor && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={pending}
            className="min-h-11 rounded-xl px-6 py-2.5 text-sm font-semibold transition disabled:opacity-60"
            style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
          >
            {pending ? 'Chargement…' : 'Charger plus'}
          </button>
        </div>
      )}
    </div>
  );
}
