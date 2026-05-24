'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ReactionType } from '@prisma/client';
import { toggleReaction } from '@/lib/actions/community/post-reactions';
import type { SerializedPost } from '@/lib/community/posts';
import { cn } from '@/lib/utils';

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'LIKE', emoji: '👍', label: 'Like' },
  { type: 'FIRE', emoji: '🔥', label: 'Fire' },
  { type: 'CLAP', emoji: '👏', label: 'Clap' },
];

const CONTENT_MAX = 500;

type PostCardProps = {
  post: SerializedPost;
  viewerPlayerProfileId: string | null;
  showClubBadge?: boolean;
};

function authorInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function PostCard({ post, showClubBadge = true }: PostCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const displayContent =
    post.content.length <= CONTENT_MAX
      ? post.content
      : `${post.content.slice(0, CONTENT_MAX)}…`;

  const relativeDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: fr,
  });

  const handleReaction = (type: ReactionType) => {
    startTransition(async () => {
      const result = await toggleReaction(post.id, type);
      if ('error' in result && result.error === 'unauthenticated') {
        router.push(`/login?callbackUrl=${encodeURIComponent('/feed')}`);
        return;
      }
      router.refresh();
    });
  };

  return (
    <article
      className="rounded-2xl border p-4 sm:p-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <header className="mb-3 flex items-start gap-3">
        <Link href={`/joueur/${post.author.id}`} className="shrink-0">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt=""
              className="h-11 w-11 rounded-xl object-cover"
            />
          ) : (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold"
              style={{ background: 'var(--court-100)', color: 'var(--court-800)' }}
            >
              {authorInitials(post.author.firstName, post.author.lastName)}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/joueur/${post.author.id}`}
            className="font-semibold hover:underline"
            style={{ color: 'var(--ink-950)' }}
          >
            {post.author.firstName} {post.author.lastName}
          </Link>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {relativeDate}
          </p>
        </div>

        {showClubBadge && post.isPromoted && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: 'var(--gold-100)', color: 'var(--gold-800)' }}
          >
            Annonce club
          </span>
        )}
      </header>

      <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {displayContent}
      </p>

      {post.mediaUrl && (
        <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-xl">
          <img
            src={post.mediaUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
        {REACTIONS.map(({ type, emoji, label }) => {
          const active = post.viewerReactions.includes(type);
          const count = post.reactionCounts[type];

          return (
            <button
              key={type}
              type="button"
              disabled={pending}
              onClick={() => handleReaction(type)}
              className={cn(
                'inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition',
                active && 'ring-2 ring-[var(--court-500)] ring-offset-1',
              )}
              style={{
                background: active ? 'var(--court-100)' : 'var(--bg-muted)',
                color: active ? 'var(--court-800)' : 'var(--text-secondary)',
              }}
              aria-pressed={active}
              aria-label={`${label}${count > 0 ? `, ${count}` : ''}`}
            >
              <span aria-hidden>{emoji}</span>
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}

        <Link
          href={`/post/${post.id}`}
          className="ml-auto inline-flex min-h-11 items-center px-3 text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {post.commentCount === 0
            ? 'Commenter'
            : `${post.commentCount} commentaire${post.commentCount > 1 ? 's' : ''}`}
        </Link>
      </div>
    </article>
  );
}
