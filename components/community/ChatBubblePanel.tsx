'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, MessageSquare } from 'lucide-react';
import { ConversationList } from '@/components/community/messaging/ConversationList';
import { useChatBubble } from './ChatBubbleProvider';

export function ChatBubblePanel() {
  const { isOpen, setIsOpen, refreshUnreadCount } = useChatBubble();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      refreshUnreadCount();
    }
  }, [isOpen, refreshUnreadCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg bg-[var(--bg-base)] shadow-lg md:bottom-24 md:right-8 md:w-96">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h2 className="font-medium text-[var(--text-primary)]">Messages</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="h-96 overflow-y-auto">
        <ConversationList />
      </div>
      <div className="border-t border-[var(--border-subtle)] px-4 py-3">
        <button
          onClick={() => {
            router.push('/messages');
            setIsOpen(false);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--court-700)] px-4 py-2 text-[var(--paper-50)] transition-colors hover:bg-[var(--court-700)]/80"
        >
          <MessageSquare className="h-4 w-4" />
          Voir toutes les conversations
        </button>
      </div>
    </div>
  );
}
