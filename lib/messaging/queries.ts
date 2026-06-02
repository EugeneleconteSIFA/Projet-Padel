import { prisma } from '@/lib/prisma';
import { ConversationKind, ConversationRole } from '@prisma/client';
import { SerializedMessage, SerializedConversation } from './serializers';

export async function getMyConversations(playerProfileId: string): Promise<SerializedConversation[]> {
  const participations = await prisma.conversationParticipant.findMany({
    where: {
      playerProfileId,
      leftAt: null,
    },
    include: {
      conversation: {
        include: {
          participants: {
            where: { leftAt: null },
            include: {
              player: {
                select: {
                  id: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },
          club: {
            select: {
              name: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            where: { deletedAt: null },
          },
        },
      },
    },
    orderBy: {
      conversation: {
        lastMessageAt: 'desc',
      },
    },
  });

  const now = new Date();

  return participations.map((p) => {
    const conv = p.conversation;
    const lastMessage = conv.messages[0];
    const unreadCount = conv.participants.find((part) => part.playerId === playerProfileId)?.lastReadAt
      ? await prisma.message.count({
          where: {
            conversationId: conv.id,
            createdAt: { gt: p.lastReadAt || new Date(0) },
            deletedAt: null,
            authorId: { not: playerProfileId },
          },
        })
      : await prisma.message.count({
          where: {
            conversationId: conv.id,
            deletedAt: null,
            authorId: { not: playerProfileId },
          },
        });

    return {
      id: conv.id,
      kind: conv.kind,
      title: conv.title,
      clubName: conv.club?.name || null,
      participants: conv.participants.map((part) => ({
        id: part.player.id,
        firstName: part.player.user.firstName,
        lastName: part.player.user.lastName,
        avatarUrl: part.player.user.avatarUrl,
      })),
      lastMessagePreview: lastMessage?.content || null,
      lastMessageAt: conv.lastMessageAt?.toISOString() || null,
      unreadCount,
      muted: p.mutedUntil ? p.mutedUntil > now : false,
    };
  });
}

export async function getConversationMessages(
  conversationId: string,
  playerProfileId: string,
  cursor?: { beforeId: string }
): Promise<{ messages: SerializedMessage[]; nextCursor: { beforeId: string } | null }> {
  const pageSize = 50;

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_playerProfileId: {
        conversationId,
        playerProfileId,
      },
    },
  });

  if (!participant || participant.leftAt) {
    throw new Error('Not a participant of this conversation');
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(cursor?.beforeId
        ? {
            id: {
              lt: cursor.beforeId,
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: pageSize,
    include: {
      author: {
        select: {
          id: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
      replyTo: {
        select: {
          id: true,
          author: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          content: true,
        },
      },
    },
  });

  const serialized: SerializedMessage[] = messages.map((msg) => ({
    id: msg.id,
    conversationId: msg.conversationId,
    authorId: msg.authorId,
    author: {
      id: msg.author.id,
      firstName: msg.author.user.firstName,
      lastName: msg.author.user.lastName,
      avatarUrl: msg.author.user.avatarUrl,
    },
    content: msg.content,
    mediaUrls: msg.mediaUrls,
    replyTo: msg.replyTo
      ? {
          id: msg.replyTo.id,
          author: {
            firstName: msg.replyTo.author.user.firstName,
            lastName: msg.replyTo.author.user.lastName,
          },
          content: msg.replyTo.content,
        }
      : null,
    editedAt: msg.editedAt?.toISOString() || null,
    deletedAt: msg.deletedAt?.toISOString() || null,
    createdAt: msg.createdAt.toISOString(),
    isMine: msg.authorId === playerProfileId,
  }));

  const nextCursor = messages.length === pageSize ? { beforeId: messages[messages.length - 1].id } : null;

  return {
    messages: serialized.reverse(),
    nextCursor,
  };
}

export async function findDirectConversation(
  playerProfileId1: string,
  playerProfileId2: string
): Promise<string | null> {
  const conv = await prisma.conversation.findFirst({
    where: {
      kind: ConversationKind.DIRECT,
      participants: {
        some: {
          playerProfileId: playerProfileId1,
          leftAt: null,
        },
      },
    },
    include: {
      participants: {
        where: { leftAt: null },
      },
    },
  });

  if (!conv) return null;

  const participantIds = conv.participants.map((p) => p.playerProfileId);
  if (participantIds.includes(playerProfileId1) && participantIds.includes(playerProfileId2)) {
    return conv.id;
  }

  return null;
}

export async function getClubConversation(clubId: string): Promise<string | null> {
  const conv = await prisma.conversation.findUnique({
    where: {
      kind_clubId: {
        kind: ConversationKind.CLUB,
        clubId,
      },
    },
  });

  return conv?.id || null;
}

export async function isConversationAdmin(conversationId: string, playerProfileId: string): Promise<boolean> {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_playerProfileId: {
        conversationId,
        playerProfileId,
      },
    },
    select: {
      role: true,
      leftAt: true,
    },
  });

  return participant?.role === ConversationRole.ADMIN && !participant.leftAt;
}
