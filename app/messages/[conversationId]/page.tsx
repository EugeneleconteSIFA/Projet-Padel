'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { listMyConversations } from '@/lib/actions/messaging';
import { ConversationKind } from '@prisma/client';
import { ArrowLeft } from 'lucide-react';
import { ConversationHeader } from '@/components/community/messaging/ConversationHeader';
import { MessageThread } from '@/components/community/messaging/MessageThread';

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
  const router = useRouter();
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversation();
    markConversationRead(params.conversationId);
  }, [params.conversationId]);

  const loadConversation = async () => {
    setLoading(true);
    const result = await listMyConversations();
    if (result.ok && result.data) {
      const conv = result.data.find((c) => c.id === params.conversationId);
      setConversation(conv);
    }
    setLoading(false);
  };

  const markConversationRead = async (conversationId: string) => {
    // Call markConversationRead server action
    // This will be implemented when we have the action
  };

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
    <div className="flex h-full flex-col md:hidden">
      {/* Mobile View */}
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
