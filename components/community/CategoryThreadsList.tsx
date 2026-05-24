'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ThreadListItem } from '@/lib/community/forum-queries';

type CategoryThreadsListProps = {
  categorySlug: string;
  threads: ThreadListItem[];
  initialSort: 'date' | 'votes';
};

export function CategoryThreadsList({
  categorySlug,
  threads,
  initialSort,
}: CategoryThreadsListProps) {
  const [sort, setSort] = useState<'date' | 'votes'>(initialSort);

  const sorted = [...threads].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (sort === 'votes') return b.topVotes - a.topVotes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <div className="mb-4 flex gap-2">
        {(['date', 'votes'] as const).map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setSort(s)}
            className="min-h-11 rounded-xl px-4 py-2 text-sm font-medium"
            style={{
              background: sort === s ? 'var(--court-700)' : 'var(--bg-muted)',
              color: sort === s ? 'var(--paper-50)' : 'var(--text-secondary)',
            }}
          >
            {s === 'date' ? 'Date' : 'Votes'}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {sorted.map(t => (
          <li key={t.id}>
            <Link
              href={`/forum/${categorySlug}/${t.id}`}
              className="block rounded-2xl border p-4 transition hover:opacity-90"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-semibold" style={{ color: 'var(--ink-950)' }}>
                  {t.isPinned && (
                    <span className="mr-2 text-xs font-bold uppercase" style={{ color: 'var(--gold-600)' }}>
                      Épinglé
                    </span>
                  )}
                  {t.title}
                </h2>
                {t.isLocked && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Verrouillé
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                {t.author.firstName} {t.author.lastName} ·{' '}
                {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: fr })} ·{' '}
                {t.replyCount} réponse{t.replyCount > 1 ? 's' : ''}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
