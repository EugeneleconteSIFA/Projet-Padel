// =============================================================================
// Requêtes partagées — feed public & sérialisation PostCard
// =============================================================================

import { Prisma, ReactionType } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPostFeedQuery, type FeedContext } from '@/lib/community/visibility';

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

async function fetchFeedPosts(context: FeedContext, cursor?: FeedCursor) {
  const { viewerId, viewerPlayerProfileId } = await resolveFeedViewer();

  const visibilityWhere = getPostFeedQuery({
    viewerId,
    viewerPlayerProfileId,
    context,
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

export function fetchPublicFeedPosts(cursor?: FeedCursor) {
  return fetchFeedPosts('public_feed', cursor);
}

export function fetchPrivateFeedPosts(cursor?: FeedCursor) {
  return fetchFeedPosts('private_feed', cursor);
}

/** Feed espace club : épinglés actifs en premier, puis posts club chronologiques. */
export async function fetchClubCommunityPosts(clubId: string) {
  const { viewerId, viewerPlayerProfileId } = await resolveFeedViewer();
  const now = new Date();

  const visibilityWhere = getPostFeedQuery({
    viewerId,
    viewerPlayerProfileId,
    context: 'club_feed',
    clubId,
  });

  const rows = await db.post.findMany({
    where: visibilityWhere,
    include: postFeedInclude,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 100,
  });

  const sorted = [...rows].sort((a, b) => {
    const aPinned =
      a.isPromoted && a.promotion != null && a.promotion.activeUntil > now;
    const bPinned =
      b.isPromoted && b.promotion != null && b.promotion.activeUntil > now;
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return {
    posts: sorted.map(p => serializePost(p, viewerPlayerProfileId)),
    viewerPlayerProfileId,
  };
}

/** Tous les posts liés au club (modération dashboard). */
export async function fetchClubModerationPosts(clubId: string) {
  const members = await db.clubMembership.findMany({
    where: { clubId, isActive: true },
    select: { playerProfileId: true },
  });
  const memberIds = members.map(m => m.playerProfileId);

  const rows = await db.post.findMany({
    where: {
      OR: [{ clubId }, { authorId: { in: memberIds } }],
    },
    include: postFeedInclude,
    orderBy: [{ createdAt: 'desc' }],
    take: 100,
  });

  const now = new Date();

  return rows.map(p => ({
    ...serializePost(p, null),
    visibility: p.visibility,
    hasActivePromotion:
      p.isPromoted && p.promotion != null && p.promotion.activeUntil > now,
    promotionEndsAt: p.promotion?.activeUntil.toISOString() ?? null,
  }));
}
