// =============================================================================
// Visibilité des posts — clause WHERE Prisma pour les feeds Communauté.
// Aucune requête supplémentaire : uniquement des filtres relationnels.
// =============================================================================

import { PostVisibility, Prisma } from '@prisma/client';

export type FeedContext = 'public_feed' | 'private_feed' | 'club_feed';

export type GetPostFeedQueryParams = {
  viewerId: string | null;
  viewerPlayerProfileId: string | null;
  context: FeedContext;
  clubId?: string;
};

/** Post dont la promotion club est encore active. */
function activeClubPromotionWhere(now: Date): Prisma.PostWhereInput {
  return {
    isPromoted: true,
    promotion: {
      activeUntil: { gt: now },
    },
  };
}

/** L'auteur du post est le viewer. */
function isOwnPost(viewerPlayerProfileId: string): Prisma.PostWhereInput {
  return { authorId: viewerPlayerProfileId };
}

/** Le viewer suit l'auteur (Follow asymétrique : follower → followed). */
function viewerFollowsAuthor(viewerPlayerProfileId: string): Prisma.PostWhereInput {
  return {
    author: {
      followsReceived: {
        some: { followerId: viewerPlayerProfileId },
      },
    },
  };
}

/** Auteur ou follower de l'auteur. */
function authorOrFollower(viewerPlayerProfileId: string): Prisma.PostWhereInput {
  return {
    OR: [isOwnPost(viewerPlayerProfileId), viewerFollowsAuthor(viewerPlayerProfileId)],
  };
}

/**
 * PUBLIC réellement public : visibility PUBLIC + auteur ayant terminé ≥ 1 tournoi.
 * Visible par tous (connectés ou non).
 */
function globallyPublicPost(): Prisma.PostWhereInput {
  return {
    visibility: PostVisibility.PUBLIC,
    author: { hasCompletedTournament: true },
  };
}

/**
 * PUBLIC différé : stocké PUBLIC mais auteur sans tournoi terminé.
 * Traité comme FRIENDS — cercle + club uniquement (pas le feed public global).
 */
function deferredPublicAsFriends(viewerPlayerProfileId: string): Prisma.PostWhereInput {
  return {
    AND: [
      { visibility: PostVisibility.PUBLIC },
      { author: { hasCompletedTournament: false } },
      authorOrFollower(viewerPlayerProfileId),
    ],
  };
}

/** visibility FRIENDS — followers de l'auteur + auteur. */
function friendsVisibilityPost(viewerPlayerProfileId: string): Prisma.PostWhereInput {
  return {
    AND: [{ visibility: PostVisibility.FRIENDS }, authorOrFollower(viewerPlayerProfileId)],
  };
}

/** visibility CLUB — membres actifs du club + auteur. */
function clubVisibilityPost(viewerPlayerProfileId: string): Prisma.PostWhereInput {
  return {
    AND: [
      { visibility: PostVisibility.CLUB },
      {
        OR: [
          isOwnPost(viewerPlayerProfileId),
          {
            club: {
              memberships: {
                some: {
                  playerProfileId: viewerPlayerProfileId,
                  isActive: true,
                },
              },
            },
          },
        ],
      },
    ],
  };
}

/** Posts des joueurs suivis (toutes visibilités autorisées pour le viewer). */
function followedAuthorsPosts(viewerPlayerProfileId: string): Prisma.PostWhereInput {
  return {
    AND: [
      viewerFollowsAuthor(viewerPlayerProfileId),
      {
        OR: [
          { visibility: PostVisibility.FRIENDS },
          { visibility: PostVisibility.PUBLIC },
          {
            visibility: PostVisibility.CLUB,
            club: {
              memberships: {
                some: {
                  playerProfileId: viewerPlayerProfileId,
                  isActive: true,
                },
              },
            },
          },
        ],
      },
    ],
  };
}

function buildPublicFeedWhere(
  viewerPlayerProfileId: string | null,
  now: Date,
): Prisma.PostWhereInput {
  const branches: Prisma.PostWhereInput[] = [globallyPublicPost()];

  // Annonces club promues : visibles par tout utilisateur connecté.
  if (viewerPlayerProfileId) {
    branches.push(activeClubPromotionWhere(now));
  }

  return { OR: branches };
}

function buildPrivateFeedWhere(
  viewerPlayerProfileId: string,
  now: Date,
): Prisma.PostWhereInput {
  return {
    OR: [
      isOwnPost(viewerPlayerProfileId),
      activeClubPromotionWhere(now),
      followedAuthorsPosts(viewerPlayerProfileId),
      deferredPublicAsFriends(viewerPlayerProfileId),
      friendsVisibilityPost(viewerPlayerProfileId),
      clubVisibilityPost(viewerPlayerProfileId),
    ],
  };
}

function buildClubFeedWhere(
  clubId: string,
  viewerPlayerProfileId: string | null,
  now: Date,
): Prisma.PostWhereInput {
  const branches: Prisma.PostWhereInput[] = [
    {
      visibility: PostVisibility.CLUB,
      clubId,
    },
    activeClubPromotionWhere(now),
  ];

  if (viewerPlayerProfileId) {
    branches.push(isOwnPost(viewerPlayerProfileId));
  }

  return {
    AND: [{ clubId }, { OR: branches }],
  };
}

/** Clause WHERE impossible — feed privé sans session. */
function noResultsWhere(): Prisma.PostWhereInput {
  return { id: { in: [] } };
}

/**
 * Construit la clause `where` Prisma pour lister les posts d'un feed.
 *
 * @see FeedContext — public_feed | private_feed | club_feed
 */
export function getPostFeedQuery(params: GetPostFeedQueryParams): Prisma.PostWhereInput {
  const { viewerPlayerProfileId, context, clubId } = params;
  const now = new Date();

  switch (context) {
    case 'public_feed':
      return buildPublicFeedWhere(viewerPlayerProfileId, now);

    case 'private_feed':
      if (!viewerPlayerProfileId) {
        return noResultsWhere();
      }
      return buildPrivateFeedWhere(viewerPlayerProfileId, now);

    case 'club_feed':
      if (!clubId) {
        throw new Error('clubId est requis pour context = club_feed');
      }
      return buildClubFeedWhere(clubId, viewerPlayerProfileId, now);

    default: {
      const _exhaustive: never = context;
      return _exhaustive;
    }
  }
}
