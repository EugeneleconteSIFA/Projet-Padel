import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import {
  FORUM_CATEGORY_LABELS,
  categoryToSlug,
} from '@/lib/community/forum-categories';
import { searchForumThreads } from '@/lib/community/forum-queries';

type Props = { searchParams: Promise<{ q?: string }> };

export const metadata: Metadata = {
  title: 'Recherche forum — The Court',
};

export default async function ForumSearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const results = q.trim().length >= 2 ? await searchForumThreads(q) : [];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <SiteHeader />
      <main className="mx-auto max-w-screen-md px-4 py-8 sm:px-6">
        <Link
          href="/forum"
          className="mb-4 inline-flex min-h-11 items-center text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          ← Forum
        </Link>
        <h1 className="mb-4 text-2xl font-medium" style={{ color: 'var(--ink-950)' }}>
          Recherche
        </h1>

        <form action="/forum/recherche" method="get" className="mb-6 flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={q}
            required
            minLength={2}
            className="min-h-11 flex-1 rounded-xl border px-3 text-sm"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
          />
          <button
            type="submit"
            className="min-h-11 rounded-xl px-5 text-sm font-semibold"
            style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
          >
            OK
          </button>
        </form>

        {q.trim().length < 2 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Saisis au moins 2 caractères.
          </p>
        ) : results.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucun résultat pour « {q} ».
          </p>
        ) : (
          <ul className="space-y-3">
            {results.map(r => {
              const slug = categoryToSlug(r.category);
              return (
                <li key={r.id}>
                  <Link
                    href={`/forum/${slug}/${r.id}`}
                    className="block rounded-xl border p-4"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                  >
                    <p className="font-semibold" style={{ color: 'var(--ink-950)' }}>
                      {r.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {FORUM_CATEGORY_LABELS[r.category]}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
