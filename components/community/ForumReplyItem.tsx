'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { voteReply } from '@/lib/actions/community/forum';

export type ForumReplyView = {
  id: string;
  content: string;
  votes: number;
  createdAt: string;
  author: { firstName: string; lastName: string };
  replies: ForumReplyView[];
};

type ForumReplyItemProps = {
  reply: ForumReplyView;
  categorySlug: string;
  threadId: string;
  depth?: number;
};

export function ForumReplyItem({
  reply,
  categorySlug,
  threadId,
  depth = 0,
}: ForumReplyItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const vote = (direction: 'up' | 'down') => {
    startTransition(async () => {
      await voteReply(reply.id, direction, categorySlug, threadId);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl border p-4"
        style={{
          marginLeft: depth > 0 ? Math.min(depth * 16, 48) : 0,
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-surface)',
        }}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--ink-950)' }}>
            {reply.author.firstName} {reply.author.lastName}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: fr })}
          </p>
        </div>
        <p className="mb-3 whitespace-pre-wrap text-sm" style={{ color: 'var(--text-primary)' }}>
          {reply.content}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => vote('up')}
            className="min-h-11 min-w-11 rounded-lg px-3 text-sm font-medium disabled:opacity-60"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
            aria-label="Vote positif"
          >
            ▲ {reply.votes}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => vote('down')}
            className="min-h-11 min-w-11 rounded-lg px-3 text-sm disabled:opacity-60"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
            aria-label="Vote négatif"
          >
            ▼
          </button>
        </div>
      </div>
      {reply.replies.map(child => (
        <ForumReplyItem
          key={child.id}
          reply={child}
          categorySlug={categorySlug}
          threadId={threadId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
