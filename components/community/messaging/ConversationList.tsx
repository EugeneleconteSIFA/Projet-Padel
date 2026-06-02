'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { listMyConversations } from '@/lib/actions/messaging';
import { ConversationListItem } from './ConversationListItem';

type Conversation = {
  id: string;
  kind: any;
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
};

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await listMyConversations();
      if (cancelled) return;
      if (!result.ok || !result.data) {
        setError(true);
        setConversations([]);
        return;
      }
      setConversations(result.data as Conversation[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (conversations === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--text-muted)]">Chargement…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--text-muted)]">Erreur lors du chargement des conversations</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <MessageCircle className="mb-4 h-12 w-12 text-[var(--text-muted)]" />
        <p className="text-[var(--text-secondary)]">
          Aucune discussion pour l&apos;instant. Commence par envoyer un message à un joueur depuis sa fiche.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {conversations.map((conv) => (
        <ConversationListItem key={conv.id} {...conv} />
      ))}
    </div>
  );
}
