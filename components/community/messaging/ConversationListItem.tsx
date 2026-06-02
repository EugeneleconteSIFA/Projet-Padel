import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ConversationKind } from '@prisma/client';
import { MessageCircle, Bell, BellOff } from 'lucide-react';

interface ConversationListItemProps {
  id: string;
  kind: ConversationKind;
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
  isActive?: boolean;
}

export function ConversationListItem({
  id,
  kind,
  title,
  clubName,
  participants,
  lastMessagePreview,
  lastMessageAt,
  unreadCount,
  muted,
  isActive,
}: ConversationListItemProps) {
  const getDisplayTitle = () => {
    if (title) return title;
    if (clubName) return clubName;
    if (kind === ConversationKind.DIRECT) {
      const other = participants.find((p) => p.id !== 'current-user-id');
      return other ? `${other.firstName} ${other.lastName}` : 'Conversation';
    }
    return participants.map((p) => p.firstName).join(', ');
  };

  const getAvatar = () => {
    if (kind === ConversationKind.GROUP || kind === ConversationKind.CLUB) {
      const initials = getDisplayTitle()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--court-700)] text-[var(--paper-50)]">
          {initials}
        </div>
      );
    }
    const other = participants.find((p) => p.id !== 'current-user-id');
    if (other?.avatarUrl) {
      return (
        <img
          src={other.avatarUrl}
          alt={`${other.firstName} ${other.lastName}`}
          className="h-12 w-12 rounded-full object-cover"
        />
      );
    }
    const initials = other
      ? `${other.firstName[0]}${other.lastName[0]}`.toUpperCase()
      : '??';
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--court-700)] text-[var(--paper-50)]">
        {initials}
      </div>
    );
  };

  const getSubtitle = () => {
    if (kind === ConversationKind.DIRECT) return '';
    if (participants.length === 1) return '1 participant';
    return `${participants.length} participants`;
  };

  const getTimeAgo = () => {
    if (!lastMessageAt) return '';
    return formatDistanceToNow(new Date(lastMessageAt), { addSuffix: true, locale: fr });
  };

  return (
    <Link
      href={`/messages/${id}`}
      className={`flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--bg-surface)] ${
        isActive ? 'bg-[var(--bg-surface)]' : ''
      }`}
    >
      {getAvatar()}
      <div className="flex min-w-0 flex-1">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-[var(--text-primary)]">
                {getDisplayTitle()}
              </p>
              {muted && <BellOff className="h-3 w-3 text-[var(--text-muted)]" />}
            </div>
            {getSubtitle() && (
              <p className="text-xs text-[var(--text-muted)]">{getSubtitle()}</p>
            )}
            <p className="truncate text-sm text-[var(--text-secondary)]">
              {lastMessagePreview || 'Aucun message'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-[var(--text-muted)]">{getTimeAgo()}</span>
            {unreadCount > 0 && (
              <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--gold-500)] px-1.5 text-xs font-medium text-[var(--ink-950)]">
                {unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
