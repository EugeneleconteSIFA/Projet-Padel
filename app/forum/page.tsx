import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SiteHeader } from '@/components/site-header';
import {
  FORUM_CATEGORIES,
  FORUM_CATEGORY_LABELS,
  categoryToSlug,
} from '@/lib/community/forum-categories';
import { getForumCategoryStats } from '@/lib/community/forum-queries';

export const metadata: Metadata = {
  title: 'Forum — The Court',
};

export default async function ForumPage() {
  const stats = await getForumCategoryStats();
  const statsMap = new Map(stats.map(s => [s.category, s]));

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <SiteHeader />
      <main className="mx-auto max-w-screen-md px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1
            className="text-3xl font-medium"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-950)' }}
          >
            Forum
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Échanges entre joueurs : matériel, technique, partenaires…
          </p>
        </header>

        <form action="/forum/recherche" method="get" className="mb-8 flex gap-2">
          <input
            name="q"
            type="search"
            required
            minLength={2}
            placeholder="Rechercher un sujet…"
            className="min-h-11 flex-1 rounded-xl border px-3 text-sm"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
          />
          <button
            type="submit"
            className="min-h-11 rounded-xl px-5 text-sm font-semibold"
            style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
          >
            Rechercher
          </button>
        </form>

        <ul className="space-y-3">
          {FORUM_CATEGORIES.map(category => {
            const s = statsMap.get(category);
            const slug = categoryToSlug(category);
            return (
              <li key={category}>
                <Link
                  href={`/forum/${slug}`}
                  className="flex items-center justify-between rounded-2xl border p-4"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--ink-950)' }}>
                      {FORUM_CATEGORY_LABELS[category]}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {s?.threadCount ?? 0} sujet{(s?.threadCount ?? 0) !== 1 ? 's' : ''}
                      {s?.lastActivity
                        ? ` · actif ${formatDistanceToNow(new Date(s.lastActivity), { addSuffix: true, locale: fr })}`
                        : ''}
                    </p>
                  </div>
                  <span style={{ color: 'var(--court-700)' }}>→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
