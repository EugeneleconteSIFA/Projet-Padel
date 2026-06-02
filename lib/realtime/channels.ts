export const CHANNELS = {
  CONVERSATION: (conversationId: string) => `conversation-${conversationId}`,
  USER: (userId: string) => `user-${userId}`,
  GLOBAL: 'global',
} as const;

export const EVENTS = {
  NEW_MESSAGE: 'new-message',
  EDIT_MESSAGE: 'edit-message',
  DELETE_MESSAGE: 'delete-message',
  CONVERSATION_READ: 'conversation-read',
  UNREAD_COUNT_UPDATE: 'unread-count-update',
} as const;
