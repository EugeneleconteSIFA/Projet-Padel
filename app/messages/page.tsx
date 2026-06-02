'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ConversationList } from '@/components/community/messaging/ConversationList';
import { NewConversationDialog } from '@/components/community/messaging/NewConversationDialog';

export default function MessagesPage() {
  const router = useRouter();
  const [showNewDialog, setShowNewDialog] = useState(false);

  return (
    <div className="flex h-full">
      {/* Sidebar - Conversation List */}
      <div className="hidden w-80 flex-col border-r border-[var(--border-subtle)] md:flex">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-4">
          <h1 className="font-display text-2xl text-[var(--text-primary)]" style={{ fontSize: 'clamp(26px, 4vw, 34px)' }}>
            Messages
          </h1>
          <button
            onClick={() => setShowNewDialog(true)}
            className="rounded-lg bg-[var(--court-700)] px-3 py-2 text-[var(--paper-50)] transition-colors hover:bg-[var(--court-700)]/80"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList />
        </div>
      </div>

      {/* Main Content - Empty State */}
      <div className="flex flex-1 items-center justify-center p-6 md:hidden">
        <div className="text-center">
          <p className="text-lg text-[var(--text-secondary)]">Sélectionne une conversation</p>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center p-6 md:flex">
        <div className="text-center">
          <p className="text-lg text-[var(--text-secondary)]">Sélectionne une conversation pour commencer</p>
        </div>
      </div>

      <NewConversationDialog open={showNewDialog} onClose={() => setShowNewDialog(false)} />
    </div>
  );
}
