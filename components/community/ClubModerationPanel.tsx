'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { PostCard } from '@/components/community/PostCard';
import type { SerializedPost } from '@/lib/community/posts';
import { deleteClubPost } from '@/lib/actions/community/club-community';
import { promoteClubPost } from '@/lib/actions/community/promote-post';
import { unpromoteClubPost } from '@/lib/actions/community/unpin-post';

export type ModerationPost = SerializedPost & {
  visibility: string;
  hasActivePromotion: boolean;
  promotionEndsAt: string | null;
};

type ClubModerationPanelProps = {
  clubId: string;
  clubSlug: string;
  posts: ModerationPost[];
};

export function ClubModerationPanel({ clubId, clubSlug, posts }: ClubModerationPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok?: true; error?: string }>) => {
    startTransition(async () => {
      const result = await fn();
      if (result.error) alert(result.error);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Aucun post à modérer pour l&apos;instant.
        </p>
      ) : (
        posts.map(post => (
          <div key={post.id}>
            <PostCard post={post} viewerPlayerProfileId={null} showClubBadge={post.hasActivePromotion} />
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
              >
                {post.visibility}
              </span>
              {post.hasActivePromotion && post.promotionEndsAt && (
                <span className="text-xs" style={{ color: 'var(--gold-700)' }}>
                  Promu jusqu&apos;au{' '}
                  {new Date(post.promotionEndsAt).toLocaleDateString('fr-FR')}
                </span>
              )}
              {!post.hasActivePromotion ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => promoteClubPost(post.id, clubId, clubSlug))}
                  className="min-h-11 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60"
                  style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
                >
                  Épingler (1/semaine)
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => unpromoteClubPost(post.id, clubId, clubSlug))}
                  className="min-h-11 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60"
                  style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
                >
                  Désépingler
                </button>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!confirm('Supprimer ce post définitivement ?')) return;
                  run(() => deleteClubPost(post.id, clubId, clubSlug));
                }}
                className="min-h-11 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60"
                style={{ color: '#b91c1c', border: '1px solid #fecaca' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
