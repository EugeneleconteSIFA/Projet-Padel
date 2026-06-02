'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { listMyConversations, markConversationRead } from '@/lib/actions/messaging';
import { ConversationHeader } from '@/components/community/messaging/ConversationHeader';
import { MessageThread } from '@/components/community/messaging/MessageThread';

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
  const router = useRouter();
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await listMyConversations();
      if (cancelled) return;
      if (result.ok && result.data) {
        const conv = (result.data as any[]).find((c) => c.id === params.conversationId);
        setConversation(conv ?? null);
      }
      setLoading(false);
      // marquer lue (best effort, on ignore l'erreur)
      try {
        await markConversationRead(params.conversationId);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [params.conversationId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--text-muted)]">Chargement...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--text-muted)]">Conversation non trouvée</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ConversationHeader
        kind={conversation.kind}
        title={conversation.title}
        clubName={conversation.clubName}
        participants={conversation.participants}
        onBack={() => router.push('/messages')}
      />
      <MessageThread conversationId={params.conversationId} />
    </div>
  );
}
