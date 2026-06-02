import { listMyConversations } from '@/lib/actions/messaging';
import { ConversationListItem } from './ConversationListItem';

export async function ConversationList() {
  const result = await listMyConversations();

  if (!result.ok || !result.data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--text-muted)]">Erreur lors du chargement des conversations</p>
      </div>
    );
  }

  const conversations = result.data;

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <MessageCircle className="mb-4 h-12 w-12 text-[var(--text-muted)]" />
        <p className="text-[var(--text-secondary)]">
          Aucune discussion pour l'instant. Commence par envoyer un message à un joueur depuis sa fiche.
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

import { MessageCircle } from 'lucide-react';
