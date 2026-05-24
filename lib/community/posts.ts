// =============================================================================
// Requêtes partagées — feed public & sérialisation PostCard
// =============================================================================

import { Prisma, ReactionType } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPostFeedQuery } from '@/lib/community/visibility';

export const FEED_PAGE_SIZE = 20;

export const postFeedInclude = {
  author: {
    include: {
      user: { select: { firstName: true, lastName: true, avatarUrl: true } },
    },
  },
  club: { select: { name: true } },
  reactions: { select: { type: true, authorId: true } },
  promotion: { select: { activeUntil: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.PostInclude;

export type PostFeedRow = Prisma.PostGetPayload<{ include: typeof postFeedInclude }>;

export type SerializedPost = {
  id: string;
  content: string;
  mediaUrl: string | null;
  isPromoted: boolean;
  createdAt: string;
  commentCount: number;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  reactionCounts: Record<ReactionType, number>;
  viewerReactions: ReactionType[];
};

export function serializePost(
  post: PostFeedRow,
  viewerPlayerProfileId: string | null,
): SerializedPost {
  const reactionCounts: Record<ReactionType, number> = { LIKE: 0, FIRE: 0, CLAP: 0 };
  const viewerReactions: ReactionType[] = [];

  for (const r of post.reactions) {
    reactionCounts[r.type]++;
    if (viewerPlayerProfileId && r.authorId === viewerPlayerProfileId) {
      viewerReactions.push(r.type);
    }
  }

  return {
    id: post.id,
    content: post.content,
    mediaUrl: post.mediaUrls[0] ?? null,
    isPromoted: post.isPromoted,
    createdAt: post.createdAt.toISOString(),
    commentCount: post._count.comments,
    author: {
      id: post.author.id,
      firstName: post.author.user.firstName,
      lastName: post.author.user.lastName,
      avatarUrl: post.author.user.avatarUrl,
    },
    reactionCounts,
    viewerReactions,
  };
}

export type FeedCursor = { createdAt: string; id: string };

export async function resolveFeedViewer() {
  const session = await auth();
  if (!session?.user?.id) {
    return { viewerId: null, viewerPlayerProfileId: null };
  }

  const profile = await db.playerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  return {
    viewerId: session.user.id,
    viewerPlayerProfileId: profile?.id ?? null,
  };
}

export async function fetchPublicFeedPosts(cursor?: FeedCursor) {
  const { viewerId, viewerPlayerProfileId } = await resolveFeedViewer();

  const visibilityWhere = getPostFeedQuery({
    viewerId,
    viewerPlayerProfileId,
    context: 'public_feed',
  });

  const cursorFilter: Prisma.PostWhereInput | undefined = cursor
    ? {
        OR: [
          { createdAt: { lt: new Date(cursor.createdAt) } },
          {
            createdAt: new Date(cursor.createdAt),
            id: { lt: cursor.id },
          },
        ],
      }
    : undefined;

  const where: Prisma.PostWhereInput = cursorFilter
    ? { AND: [visibilityWhere, cursorFilter] }
    : visibilityWhere;

  const rows = await db.post.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: FEED_PAGE_SIZE + 1,
    include: postFeedInclude,
  });

  const hasMore = rows.length > FEED_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, FEED_PAGE_SIZE) : rows;
  const last = page[page.length - 1];

  return {
    posts: page.map(p => serializePost(p, viewerPlayerProfileId)),
    nextCursor:
      hasMore && last
        ? { createdAt: last.createdAt.toISOString(), id: last.id }
        : null,
    viewerPlayerProfileId,
  };
}
