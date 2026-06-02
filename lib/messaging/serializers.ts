import { ConversationKind } from '@prisma/client';

export interface SerializedMessage {
  id: string;
  conversationId: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  content: string;
  mediaUrls: string[];
  replyTo: {
    id: string;
    author: {
      firstName: string;
      lastName: string;
    };
    content: string;
  } | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  isMine: boolean;
}

export interface SerializedConversation {
  id: string;
  kind: ConversationKind;
  title: string | null;
  clubName: string | null;
  participants: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  }>;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  muted: boolean;
}
