import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SerializedMessage } from '@/lib/messaging/serializers';

interface MessageBubbleProps {
  message: SerializedMessage;
  showAuthor?: boolean;
  isGrouped?: boolean;
}

export function MessageBubble({ message, showAuthor = false, isGrouped = false }: MessageBubbleProps) {
  if (message.deletedAt) {
    return (
      <div className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}>
        <div className="rounded-lg px-4 py-2 text-sm italic text-[var(--text-muted)]">
          Message supprimé
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] flex-col ${message.isMine ? 'items-end' : 'items-start'}`}>
        {showAuthor && !message.isMine && (
          <p className="mb-1 text-xs font-medium text-[var(--text-secondary)]">
            {message.author.firstName} {message.author.lastName}
          </p>
        )}
        {message.replyTo && (
          <div className={`mb-1 rounded-lg border-l-2 border-[var(--gold-500)] bg-[var(--bg-muted)] px-3 py-1 text-xs text-[var(--text-muted)] ${message.isMine ? 'self-end' : 'self-start'}`}>
            <p className="font-medium">
              {message.replyTo.author.firstName} {message.replyTo.author.lastName}
            </p>
            <p className="truncate">{message.replyTo.content}</p>
          </div>
        )}
        <div
          className={`rounded-lg px-4 py-2 ${
            message.isMine
              ? 'bg-[var(--court-700)] text-[var(--paper-50)]'
              : 'bg-[var(--bg-surface)] text-[var(--ink-950)]'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: fr })}</span>
          {message.editedAt && <span>(modifié)</span>}
        </div>
      </div>
    </div>
  );
}
