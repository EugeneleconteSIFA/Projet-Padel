import { ForumCategory, Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import type { ForumReplyView } from '@/components/community/ForumReplyItem';

const authorSelect = {
  include: {
    user: { select: { firstName: true, lastName: true } },
  },
} as const;

export async function getForumCategoryStats() {
  const stats = await Promise.all(
    (Object.values(ForumCategory) as ForumCategory[]).map(async category => {
      const [count, last] = await Promise.all([
        db.forumThread.count({ where: { category } }),
        db.forumThread.findFirst({
          where: { category },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
      ]);
      return {
        category,
        threadCount: count,
        lastActivity: last?.createdAt.toISOString() ?? null,
      };
    }),
  );
  return stats;
}

export type ThreadListItem = {
  id: string;
  title: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  replyCount: number;
  topVotes: number;
  author: { firstName: string; lastName: string };
};

export async function getCategoryThreads(
  category: ForumCategory,
  _sort: 'date' | 'votes',
  cursor?: { createdAt: string; id: string },
) {
  const take = 21;
  const cursorFilter: Prisma.ForumThreadWhereInput | undefined = cursor
    ? {
        OR: [
          { createdAt: { lt: new Date(cursor.createdAt) } },
          { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
        ],
      }
    : undefined;

  const where: Prisma.ForumThreadWhereInput = {
    category,
    ...(cursorFilter ? { AND: [cursorFilter] } : {}),
  };

  const rows = await db.forumThread.findMany({
    where,
    take,
    include: {
      author: authorSelect,
      replies: { select: { votes: true } },
      _count: { select: { replies: true } },
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
  });

  const hasMore = rows.length > 20;
  const page = hasMore ? rows.slice(0, 20) : rows;
  const last = page[page.length - 1];

  const threads: ThreadListItem[] = page.map(t => ({
    id: t.id,
    title: t.title,
    isPinned: t.isPinned,
    isLocked: t.isLocked,
    createdAt: t.createdAt.toISOString(),
    replyCount: t._count.replies,
    topVotes: Math.max(0, ...t.replies.map(r => r.votes)),
    author: {
      firstName: t.author.user.firstName,
      lastName: t.author.user.lastName,
    },
  }));

  return {
    threads,
    nextCursor:
      hasMore && last
        ? { createdAt: last.createdAt.toISOString(), id: last.id }
        : null,
  };
}

function buildReplyTree(
  replies: {
    id: string;
    parentId: string | null;
    content: string;
    votes: number;
    createdAt: Date;
    author: { user: { firstName: string; lastName: string } };
  }[],
): ForumReplyView[] {
  const map = new Map<string, ForumReplyView>();
  const roots: ForumReplyView[] = [];

  for (const r of replies) {
    map.set(r.id, {
      id: r.id,
      content: r.content,
      votes: r.votes,
      createdAt: r.createdAt.toISOString(),
      author: {
        firstName: r.author.user.firstName,
        lastName: r.author.user.lastName,
      },
      replies: [],
    });
  }

  for (const r of replies) {
    const node = map.get(r.id)!;
    if (r.parentId && map.has(r.parentId)) {
      map.get(r.parentId)!.replies.push(node);
    } else if (!r.parentId) {
      roots.push(node);
    }
  }

  for (const node of map.values()) {
    node.replies.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  return roots;
}

export async function getForumThreadDetail(threadId: string) {
  const thread = await db.forumThread.findUnique({
    where: { id: threadId },
    include: {
      author: authorSelect,
      replies: {
        include: { author: authorSelect },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!thread) return null;

  const allRoots = buildReplyTree(thread.replies);
  const opReply = allRoots.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )[0];

  const discussionRoots = allRoots
    .filter(r => r.id !== opReply?.id)
    .sort((a, b) => b.votes - a.votes);

  return {
    id: thread.id,
    title: thread.title,
    category: thread.category,
    isPinned: thread.isPinned,
    isLocked: thread.isLocked,
    tags: thread.tags,
    createdAt: thread.createdAt.toISOString(),
    author: {
      firstName: thread.author.user.firstName,
      lastName: thread.author.user.lastName,
    },
    opContent: opReply?.content ?? '',
    replies: discussionRoots,
  };
}

export type ForumSearchResult = {
  id: string;
  title: string;
  category: ForumCategory;
  createdAt: string;
};

export async function searchForumThreads(query: string): Promise<ForumSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const rows = await db.$queryRaw<ForumSearchResult[]>`
    SELECT id, title, category, "createdAt"
    FROM "ForumThread"
    WHERE to_tsvector('french', title) @@ plainto_tsquery('french', ${q})
    ORDER BY ts_rank(to_tsvector('french', title), plainto_tsquery('french', ${q})) DESC
    LIMIT 20
  `;

  return rows.map(r => ({
    id: r.id,
    title: r.title,
    category: r.category,
    createdAt: new Date(r.createdAt as string | Date).toISOString(),
  }));
}
