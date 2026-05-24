import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { auth } from '@/lib/auth';
import { SiteHeader } from '@/components/site-header';
import { ReplyForm } from '@/components/community/ForumReplyForm';
import { ForumReplyItem } from '@/components/community/ForumReplyItem';
import { PinThreadButton } from '@/components/community/PinThreadButton';
import { ReportButton } from '@/components/community/ReportButton';
import {
  FORUM_CATEGORY_LABELS,
  categoryToSlug,
  slugToCategory,
} from '@/lib/community/forum-categories';
import { getForumThreadDetail } from '@/lib/community/forum-queries';

type Props = {
  params: Promise<{ categorie: string; threadId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { threadId } = await params;
  const thread = await getForumThreadDetail(threadId);
  return { title: thread ? `${thread.title} — Forum` : 'Thread' };
}

export default async function ForumThreadPage({ params }: Props) {
  const { categorie, threadId } = await params;
  const category = slugToCategory(categorie);
  if (!category) notFound();

  const thread = await getForumThreadDetail(threadId);
  if (!thread || thread.category !== category) notFound();

  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <SiteHeader />
      <main className="mx-auto max-w-screen-md px-4 py-8 sm:px-6">
        <Link
          href={`/forum/${categorie}`}
          className="mb-4 inline-flex min-h-11 items-center text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          ← {FORUM_CATEGORY_LABELS[category]}
        </Link>

        <article
          className="mb-6 rounded-2xl border p-5"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--ink-950)' }}>
              {thread.isPinned && (
                <span className="mr-2 text-xs font-bold uppercase" style={{ color: 'var(--gold-600)' }}>
                  Épinglé
                </span>
              )}
              {thread.title}
            </h1>
            {isAdmin && (
              <PinThreadButton
                threadId={thread.id}
                categorySlug={categorie}
                isPinned={thread.isPinned}
              />
            )}
            <ReportButton
              targetType="FORUM_THREAD"
              targetId={thread.id}
              loginCallbackUrl={`/login?callbackUrl=${encodeURIComponent(`/forum/${categorie}/${threadId}`)}`}
            />
          </div>
          <p className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {thread.author.firstName} {thread.author.lastName} ·{' '}
            {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true, locale: fr })}
          </p>
          {thread.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {thread.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="whitespace-pre-wrap text-sm" style={{ color: 'var(--text-primary)' }}>
            {thread.opContent}
          </p>
        </article>

        <section className="mb-8 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Réponses
          </h2>
          {thread.replies.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Pas encore de réponse.
            </p>
          ) : (
            thread.replies.map(reply => (
              <ForumReplyItem
                key={reply.id}
                reply={reply}
                categorySlug={categorie}
                threadId={threadId}
              />
            ))
          )}
        </section>

        {thread.isLocked ? (
          <p
            className="rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
          >
            Ce thread est verrouillé.
          </p>
        ) : session?.user ? (
          <ReplyForm threadId={threadId} categorySlug={categorie} />
        ) : (
          <Link
            href={`/login?callbackUrl=/forum/${categorie}/${threadId}`}
            className="inline-flex min-h-11 items-center text-sm font-medium"
            style={{ color: 'var(--court-700)' }}
          >
            Connecte-toi pour répondre
          </Link>
        )}
      </main>
    </div>
  );
}
