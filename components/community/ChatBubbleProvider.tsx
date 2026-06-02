'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { listMyConversations } from '@/lib/actions/messaging';

interface ChatBubbleContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChatBubbleContext = createContext<ChatBubbleContextType | undefined>(undefined);

export function ChatBubbleProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const refreshUnreadCount = async () => {
    const result = await listMyConversations();
    if (result.ok && result.data) {
      const totalUnread = result.data.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
    }
  };

  return (
    <ChatBubbleContext.Provider value={{ unreadCount, refreshUnreadCount, isOpen, setIsOpen }}>
      {children}
    </ChatBubbleContext.Provider>
  );
}

export function useChatBubble() {
  const context = useContext(ChatBubbleContext);
  if (!context) {
    throw new Error('useChatBubble must be used within ChatBubbleProvider');
  }
  return context;
}
