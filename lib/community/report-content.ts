import { ReportTargetType } from '@prisma/client';
import { categoryToSlug } from '@/lib/community/forum-categories';
import { db } from '@/lib/db';

export type ReportContentPreview = {
  excerpt: string;
  contentUrl: string | null;
};

const DELETED = '[Contenu supprimé]';

function excerpt(text: string, max = 50): string {
  const t = text.trim();
  if (!t) return DELETED;
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function previewKey(targetType: ReportTargetType, targetId: string) {
  return `${targetType}:${targetId}`;
}

export async function getReportContentPreview(
  targetType: ReportTargetType,
  targetId: string,
): Promise<ReportContentPreview> {
  const map = await getReportContentPreviews([{ targetType, targetId }]);
  return map.get(previewKey(targetType, targetId)) ?? { excerpt: DELETED, contentUrl: null };
}

export async function getReportContentPreviews(
  reports: { targetType: ReportTargetType; targetId: string }[],
) {
  const unique = new Map<string, { targetType: ReportTargetType; targetId: string }>();
  for (const r of reports) {
    unique.set(previewKey(r.targetType, r.targetId), r);
  }

  const byType = {
    POST: [] as string[],
    COMMENT: [] as string[],
    FORUM_THREAD: [] as string[],
    FORUM_REPLY: [] as string[],
  };
  for (const r of unique.values()) {
    byType[r.targetType].push(r.targetId);
  }

  const [posts, comments, threads, replies] = await Promise.all([
    byType.POST.length
      ? db.post.findMany({
          where: { id: { in: byType.POST } },
          select: { id: true, content: true },
        })
      : [],
    byType.COMMENT.length
      ? db.comment.findMany({
          where: { id: { in: byType.COMMENT } },
          select: { id: true, content: true, postId: true },
        })
      : [],
    byType.FORUM_THREAD.length
      ? db.forumThread.findMany({
          where: { id: { in: byType.FORUM_THREAD } },
          select: { id: true, title: true, category: true },
        })
      : [],
    byType.FORUM_REPLY.length
      ? db.forumReply.findMany({
          where: { id: { in: byType.FORUM_REPLY } },
          select: {
            id: true,
            content: true,
            threadId: true,
            thread: { select: { category: true } },
          },
        })
      : [],
  ]);

  const result = new Map<string, ReportContentPreview>();

  for (const r of unique.values()) {
    result.set(previewKey(r.targetType, r.targetId), {
      excerpt: DELETED,
      contentUrl: null,
    });
  }

  for (const post of posts) {
    result.set(previewKey('POST', post.id), {
      excerpt: excerpt(post.content),
      contentUrl: `/post/${post.id}`,
    });
  }

  for (const comment of comments) {
    result.set(previewKey('COMMENT', comment.id), {
      excerpt: excerpt(comment.content),
      contentUrl: `/post/${comment.postId}`,
    });
  }

  for (const thread of threads) {
    const slug = categoryToSlug(thread.category);
    result.set(previewKey('FORUM_THREAD', thread.id), {
      excerpt: excerpt(thread.title),
      contentUrl: `/forum/${slug}/${thread.id}`,
    });
  }

  for (const reply of replies) {
    const slug = categoryToSlug(reply.thread.category);
    result.set(previewKey('FORUM_REPLY', reply.id), {
      excerpt: excerpt(reply.content),
      contentUrl: `/forum/${slug}/${reply.threadId}`,
    });
  }

  return result;
}

export const REPORT_TYPE_LABELS: Record<ReportTargetType, string> = {
  POST: 'Post',
  COMMENT: 'Commentaire',
  FORUM_THREAD: 'Thread',
  FORUM_REPLY: 'Réponse',
};

export const REPORT_TYPE_COLORS: Record<ReportTargetType, { bg: string; text: string }> = {
  POST: { bg: 'var(--court-100)', text: 'var(--court-800)' },
  COMMENT: { bg: 'var(--bg-muted)', text: 'var(--text-secondary)' },
  FORUM_THREAD: { bg: 'var(--gold-100)', text: 'var(--gold-800)' },
  FORUM_REPLY: { bg: '#fef3c7', text: '#92400e' },
};
