'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';
import { useChatBubble } from './ChatBubbleProvider';
import { ChatBubblePanel } from './ChatBubblePanel';

export function ChatBubble() {
  const { unreadCount, isOpen, setIsOpen, refreshUnreadCount } = useChatBubble();
  const router = useRouter();

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  const handleClick = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      router.push('/messages');
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--court-700)] text-[var(--paper-50)] shadow-lg transition-all hover:scale-105 md:bottom-8 md:right-8"
      >
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--gold-500)] text-xs font-medium text-[var(--ink-950)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <MessageCircle className="h-6 w-6" />
      </button>
      <ChatBubblePanel />
    </>
  );
}
