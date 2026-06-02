'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ConversationKind, ConversationRole, NotificationKind } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { findDirectConversation, getClubConversation, isConversationAdmin } from '@/lib/messaging/queries';
import { pusher } from '@/lib/realtime/pusher-server';
import { CHANNELS, EVENTS } from '@/lib/realtime/channels';

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(4000).transform((val) => val.trim()),
  replyToId: z.string().optional(),
});

const createGroupConversationSchema = z.object({
  title: z.string().min(2).max(80),
  participantIds: z.array(z.string()).min(1).max(20),
});

const editMessageSchema = z.object({
  messageId: z.string(),
  content: z.string().min(1).max(4000).transform((val) => val.trim()),
});

const muteConversationSchema = z.object({
  conversationId: z.string(),
  hours: z.union([z.literal(1), z.literal(8), z.literal(24), z.null()]),
});

type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function listMyConversations(): Promise<ActionResult<any[]>> {
  try {
    const session = await auth();
    if (!session?.user?.playerProfileId) {
      return { ok: false, error: 'Non authentifié' };
    }

    const conversations = await prisma.conversationParticipant.findMany({
      where: {
        playerProfileId: session.user.playerProfileId,
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

    const result = await Promise.all(
      conversations.map(async (p) => {
        const conv = p.conversation;
        const lastMessage = conv.messages[0];
        
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            createdAt: { gt: p.lastReadAt || new Date(0) },
            deletedAt: null,
            authorId: { not: session.user.playerProfileId },
          },
        });

        return {
          id: conv.id,
          kind: conv.kind,
          title: conv.title,
          clubName: conv.club?.name || null,
          participants: conv.participants.map((part: any) => ({
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
      })
    );

    return { ok: true, data: result };
  } catch (error) {
    console.error('Error listing conversations:', error);
    return { ok: false, error: 'Erreur lors de la récupération des conversations' };
  }
}

export async function getOrCreateDirectConversation(
  otherPlayerProfileId: string
): Promise<ActionResult<{ conversationId: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.playerProfileId) {
      return { ok: false, error: 'Non authentifié' };
    }

    if (otherPlayerProfileId === session.user.playerProfileId) {
      return { ok: false, error: 'Impossible de créer une conversation avec soi-même' };
    }

    const existingConvId = await findDirectConversation(
      session.user.playerProfileId,
      otherPlayerProfileId
    );

    if (existingConvId) {
      return { ok: true, data: { conversationId: existingConvId } };
    }

    const conversation = await prisma.conversation.create({
      data: {
        kind: ConversationKind.DIRECT,
        createdById: session.user.playerProfileId,
        participants: {
          create: [
            {
              playerProfileId: session.user.playerProfileId,
              role: ConversationRole.MEMBER,
            },
            {
              playerProfileId: otherPlayerProfileId,
              role: ConversationRole.MEMBER,
            },
          ],
        },
      },
    });

    revalidatePath('/messages');
    return { ok: true, data: { conversationId: conversation.id } };
  } catch (error) {
    console.error('Error creating direct conversation:', error);
    return { ok: false, error: 'Erreur lors de la création de la conversation' };
  }
}

export async function createGroupConversation(
  input: z.infer<typeof createGroupConversationSchema>
): Promise<ActionResult<{ conversationId: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.playerProfileId) {
      return { ok: false, error: 'Non authentifié' };
    }

    const validated = createGroupConversationSchema.parse(input);

    if (!validated.participantIds.includes(session.user.playerProfileId)) {
      validated.participantIds.push(session.user.playerProfileId);
    }

    const conversation = await prisma.conversation.create({
      data: {
        kind: ConversationKind.GROUP,
        title: validated.title,
        createdById: session.user.playerProfileId,
        participants: {
          create: validated.participantIds.map((id) => ({
            playerProfileId: id,
            role: id === session.user.playerProfileId ? ConversationRole.ADMIN : ConversationRole.MEMBER,
          })),
        },
      },
    });

    revalidatePath('/messages');
    return { ok: true, data: { conversationId: conversation.id } };
  } catch (error) {
    console.error('Error creating group conversation:', error);
    return { ok: false, error: 'Erreur lors de la création du groupe' };
  }
}

export async function listMessages(
  conversationId: string,
  cursor?: { beforeId: string }
): Promise<ActionResult<{ messages: any[]; nextCursor: { beforeId: string } | null }>> {
  try {
    const session = await auth();
    if (!session?.user?.playerProfileId) {
      return { ok: false, error: 'Non authentifié' };
    }

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_playerProfileId: {
          conversationId,
          playerProfileId: session.user.playerProfileId,
        },
      },
    });

    if (!participant || participant.leftAt) {
      return { ok: false, error: 'Vous n\'êtes pas participant de cette conversation' };
    }

    const pageSize = 50;

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

    const serialized = messages.map((msg: any) => ({
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
      isMine: msg.authorId === session.user.playerProfileId,
    }));

    const nextCursor =
      messages.length === pageSize ? { beforeId: messages[messages.length - 1].id } : null;

    return { ok: true, data: { messages: serialized.reverse(), nextCursor } };
  } catch (error) {
    console.error('Error listing messages:', error);
    return { ok: false, error: 'Erreur lors de la récupération des messages' };
  }
}

export async function sendMessage(
  input: z.infer<typeof sendMessageSchema>
): Promise<ActionResult<{ messageId: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.playerProfileId) {
      return { ok: false, error: 'Non authentifié' };
    }

    const validated = sendMessageSchema.parse(input);

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_playerProfileId: {
          conversationId: validated.conversationId,
          playerProfileId: session.user.playerProfileId,
        },
      },
    });

    if (!participant || participant.leftAt) {
      return { ok: false, error: 'Vous n\'êtes pas participant de cette conversation' };
    }

    const message = await prisma.message.create({
      data: {
        conversationId: validated.conversationId,
        authorId: session.user.playerProfileId,
        content: validated.content,
        replyToId: validated.replyToId,
      },
    });

    await prisma.conversation.update({
      where: { id: validated.conversationId },
      data: { lastMessageAt: new Date() },
    });

    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: validated.conversationId,
        playerProfileId: { not: session.user.playerProfileId },
        leftAt: null,
        OR: [
          { mutedUntil: null },
          { mutedUntil: { lt: new Date() } },
        ],
      },
      include: {
        player: {
          include: {
            user: true,
          },
        },
      },
    });

    for (const other of otherParticipants) {
      await prisma.notification.create({
        data: {
          userId: other.player.user.id,
          kind: NotificationKind.NEW_MESSAGE,
          title: 'Nouveau message',
          body: validated.content.substring(0, 100),
          data: {
            conversationId: validated.conversationId,
            messageId: message.id,
          },
        },
      });
    }

    // Trigger Pusher event
    await pusher.trigger(CHANNELS.CONVERSATION(validated.conversationId), EVENTS.NEW_MESSAGE, {
      messageId: message.id,
      conversationId: validated.conversationId,
      authorId: session.user.playerProfileId,
      content: validated.content,
      createdAt: message.createdAt.toISOString(),
    });

    revalidatePath(`/messages/${validated.conversationId}`);
    revalidatePath('/messages');
    return { ok: true, data: { messageId: message.id } };
  } catch (error) {
    console.error('Error sending message:', error);
    return { ok: false, error: 'Erreur lors de l\'envoi du message' };
  }
}

export async function editMessage(
  input: z.infer<typeof editMessageSchema>
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.playerProfileId) {
      return { ok: false, error: 'Non authentifié' };
    }

    const validated = editMessageSchema.parse(input);

    const message = await prisma.message.findUnique({
      where: { id: validated.messageId },
    });

    if (!message) {
      return { ok: false, error: 'Message non trouvé' };
    }

    if (message.authorId !== session.user.playerProfileId) {
      return { ok: false, error: 'Vous n\'êtes pas l\'auteur de ce message' };
    }

    if (message.deletedAt) {
      return { ok: false, error: 'Ce message a été supprimé' };
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
      return { ok: false, error: 'Le délai de 15 minutes pour éditer est écoulé' };
    }

    await prisma.message.update({
      where: { id: validated.messageId },
      data: {
        content: validated.content,
        editedAt: new Date(),
      },
    });

    // Trigger Pusher event
    await pusher.trigger(CHANNELS.CONVERSATION(message.conversationId), EVENTS.EDIT_MESSAGE, {
      messageId: validated.messageId,
      conversationId: message.conversationId,
      content: validated.content,
      editedAt: new Date().toISOString(),
    });

    revalidatePath(`/messages/${message.conversationId}`);
    return { ok: true };
  } catch (error) {
    console.error('Error editing message:', error);
    return { ok: false, error: 'Erreur lors de l\'édition du message' };
  }
}

export async function deleteMessage(messageId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.playerProfileId) {
      return { ok: false, error: 'Non authentifié' };
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return { ok: false, error: 'Message non trouvé' };
    }

    if (message.authorId !== session.user.playerProfileId) {
      const isAdmin = await isConversationAdmin(message.conversationId, session.user.playerProfileId);
      if (!isAdmin) {
        return { ok: false, error: 'Vous n\'avez pas le droit de supprimer ce message' };
      }
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });

    // Trigger Pusher event
    await pusher.trigger(CHANNELS.CONVERSATION(message.conversationId), EVENTS.DELETE_MESSAGE, {
      messageId,
      conversationId: message.conversationId,
    });

    revalidatePath(`/messages/${message.conversationId}`);
    return { ok: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { ok: false, error: 'Erreur lors de la suppression du message' };
  }
}

export async function markConversationRead(conversationId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.playerProfileId) {
      return { ok: false, error: 'Non authentifié' };
    }

    await prisma.conversationParticipant.update({
      where: {
        conversationId_playerProfileId: {
          conversationId,
          playerProfileId: session.user.playerProfileId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    // Trigger Pusher event
    await pusher.trigger(CHANNELS.CONVERSATION(conversationId), EVENTS.CONVERSATION_READ, {
      conversationId,
      playerProfileId: session.user.playerProfileId,
      readAt: new Date().toISOString(),
    });

    revalidatePath('/messages');
    return { ok: true };
  } catch (error) {
    console.error('Error marking conversation read:', error);
    return { ok: false, error: 'Erreur lors du marquage comme lu' };
  }
}

export async function muteConversation(
  input: z.infer<typeof muteConversationSchema>
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.playerProfileId) {
      return { ok: false, error: 'Non authentifié' };
    }

    const validated = muteConversationSchema.parse(input);

    const mutedUntil = validated.hours
      ? new Date(Date.now() + validated.hours * 60 * 60 * 1000)
      : null;

    await prisma.conversationParticipant.update({
      where: {
        conversationId_playerProfileId: {
          conversationId: validated.conversationId,
          playerProfileId: session.user.playerProfileId,
        },
      },
      data: { mutedUntil },
    });

    revalidatePath('/messages');
    return { ok: true };
  } catch (error) {
    console.error('Error muting conversation:', error);
    return { ok: false, error: 'Erreur lors du muet de la conversation' };
  }
}

export async function leaveConversation(conversationId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.playerProfileId) {
      return { ok: false, error: 'Non authentifié' };
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return { ok: false, error: 'Conversation non trouvée' };
    }

    if (conversation.kind === ConversationKind.DIRECT) {
      return { ok: false, error: 'Impossible de quitter une conversation directe' };
    }

    if (conversation.kind === ConversationKind.CLUB) {
      return { ok: false, error: 'Impossible de quitter le salon du club' };
    }

    await prisma.conversationParticipant.update({
      where: {
        conversationId_playerProfileId: {
          conversationId,
          playerProfileId: session.user.playerProfileId,
        },
      },
      data: { leftAt: new Date() },
    });

    revalidatePath('/messages');
    return { ok: true };
  } catch (error) {
    console.error('Error leaving conversation:', error);
    return { ok: false, error: 'Erreur lors du départ de la conversation' };
  }
}
