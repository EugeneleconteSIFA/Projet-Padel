import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SiteHeader } from '@/components/site-header';
import { CategoryThreadsList } from '@/components/community/CategoryThreadsList';
import { NewThreadForm } from '@/components/community/NewThreadForm';
import {
  FORUM_CATEGORY_LABELS,
  categoryToSlug,
  slugToCategory,
} from '@/lib/community/forum-categories';
import { getCategoryThreads } from '@/lib/community/forum-queries';

type Props = {
  params: Promise<{ categorie: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorie } = await params;
  const category = slugToCategory(categorie);
  return {
    title: category ? `${FORUM_CATEGORY_LABELS[category]} — Forum` : 'Forum',
  };
}

export default async function ForumCategoryPage({ params, searchParams }: Props) {
  const { categorie } = await params;
  const { sort: sortParam } = await searchParams;
  const category = slugToCategory(categorie);
  if (!category) notFound();

  const sort = sortParam === 'votes' ? 'votes' : 'date';
  const { threads } = await getCategoryThreads(category, sort);
  const session = await auth();

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
        <h1
          className="mb-6 text-2xl font-medium"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-950)' }}
        >
          {FORUM_CATEGORY_LABELS[category]}
        </h1>

        {session?.user && <NewThreadForm category={category} />}

        {threads.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucun sujet pour l&apos;instant. Lance la discussion !
          </p>
        ) : (
          <CategoryThreadsList
            categorySlug={categoryToSlug(category)}
            threads={threads}
            initialSort={sort}
          />
        )}
      </main>
    </div>
  );
}
