'use client';

import { useState } from 'react';
import { sendMessage } from '@/lib/actions/messaging';
import { Send } from 'lucide-react';

interface MessageComposerProps {
  conversationId: string;
  replyToId?: string;
  onCancelReply?: () => void;
}

export function MessageComposer({ conversationId, replyToId, onCancelReply }: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    setIsSending(true);
    const result = await sendMessage({
      conversationId,
      content: content.trim(),
      replyToId,
    });

    setIsSending(false);

    if (result.ok) {
      setContent('');
      onCancelReply?.();
    } else {
      console.error('Error sending message:', result.error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-[var(--border-subtle)] p-4">
      {replyToId && onCancelReply && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-[var(--bg-muted)] px-3 py-2">
          <span className="text-sm text-[var(--text-secondary)]">Répondre à un message</span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Annuler
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écris ton message..."
          rows={1}
          className="flex min-h-[44px] flex-1 resize-none rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--court-700)]"
          style={{ minHeight: '44px', maxHeight: '144px' }}
        />
        <button
          type="submit"
          disabled={!content.trim() || isSending || content.length > 4000}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--court-700)] text-[var(--paper-50)] transition-colors hover:bg-[var(--court-700)]/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      {content.length > 3500 && (
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {content.length}/4000 caractères
        </p>
      )}
    </form>
  );
}
