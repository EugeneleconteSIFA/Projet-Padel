'use client';

import { useState, useEffect } from 'react';
import { listMessages, markConversationRead } from '@/lib/actions/messaging';
import { SerializedMessage } from '@/lib/messaging/serializers';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';

interface MessageThreadProps {
  conversationId: string;
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const [messages, setMessages] = useState<SerializedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyToId, setReplyToId] = useState<string | undefined>();
  const [nextCursor, setNextCursor] = useState<{ beforeId: string } | null>(null);

  useEffect(() => {
    loadMessages();
    markConversationRead(conversationId);
  }, [conversationId]);

  const loadMessages = async (cursor?: { beforeId: string }) => {
    setLoading(true);
    const result = await listMessages(conversationId, cursor);
    if (result.ok && result.data) {
      if (cursor) {
        setMessages((prev) => [...result.data!.messages, ...prev]);
      } else {
        setMessages(result.data.messages);
      }
      setNextCursor(result.data.nextCursor);
    }
    setLoading(false);
  };

  const handleLoadMore = () => {
    if (nextCursor) {
      loadMessages(nextCursor);
    }
  };

  const handleReply = (messageId: string) => {
    setReplyToId(messageId);
  };

  const groupMessages = (msgs: SerializedMessage[]) => {
    const grouped: SerializedMessage[][] = [];
    let currentGroup: SerializedMessage[] = [];

    for (let i = 0; i < msgs.length; i++) {
      const msg = msgs[i];
      const prevMsg = msgs[i - 1];

      if (
        prevMsg &&
        prevMsg.authorId === msg.authorId &&
        !prevMsg.deletedAt &&
        !msg.deletedAt &&
        new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000
      ) {
        currentGroup.push(msg);
      } else {
        if (currentGroup.length > 0) {
          grouped.push(currentGroup);
        }
        currentGroup = [msg];
      }
    }

    if (currentGroup.length > 0) {
      grouped.push(currentGroup);
    }

    return grouped;
  };

  const groupedMessages = groupMessages(messages);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {loading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[var(--text-muted)]">Chargement...</p>
          </div>
        ) : (
          <>
            {nextCursor && (
              <button
                onClick={handleLoadMore}
                className="mb-4 w-full rounded-lg bg-[var(--bg-surface)] py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
              >
                Charger plus de messages
              </button>
            )}
            {groupedMessages.map((group, groupIndex) => {
              const firstMsg = group[0];
              const showAuthor = !firstMsg.isMine && groupIndex > 0;
              
              return (
                <div key={`${firstMsg.id}-${groupIndex}`} className="mb-4">
                  {group.map((msg, msgIndex) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      showAuthor={showAuthor && msgIndex === 0}
                      isGrouped={msgIndex > 0}
                    />
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>
      <MessageComposer
        conversationId={conversationId}
        replyToId={replyToId}
        onCancelReply={() => setReplyToId(undefined)}
      />
    </div>
  );
}
