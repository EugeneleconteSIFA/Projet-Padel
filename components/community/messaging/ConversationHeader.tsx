'use client';

import { ConversationKind } from '@prisma/client';
import { MoreVertical, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConversationHeaderProps {
  kind: ConversationKind;
  title: string | null;
  clubName: string | null;
  participants: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  }>;
  onBack?: () => void;
  onOpenProfile?: () => void;
}

export function ConversationHeader({
  kind,
  title,
  clubName,
  participants,
  onBack,
  onOpenProfile,
}: ConversationHeaderProps) {
  const getDisplayTitle = () => {
    if (title) return title;
    if (clubName) return clubName;
    if (kind === ConversationKind.DIRECT) {
      const other = participants.find((p) => p.id !== 'current-user-id');
      return other ? `${other.firstName} ${other.lastName}` : 'Conversation';
    }
    return participants.map((p) => p.firstName).join(', ');
  };

  const getSubtitle = () => {
    if (kind === ConversationKind.DIRECT) return '';
    if (participants.length === 1) return '1 participant';
    return `${participants.length} participants`;
  };

  return (
    <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
      {onBack && (
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      <div className="flex min-w-0 flex-1">
        <p className="truncate font-medium text-[var(--text-primary)]">{getDisplayTitle()}</p>
        {getSubtitle() && (
          <p className="text-xs text-[var(--text-muted)]">{getSubtitle()}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {kind === ConversationKind.DIRECT && onOpenProfile && (
          <Button variant="ghost" size="icon" onClick={onOpenProfile}>
            <User className="h-5 w-5" />
          </Button>
        )}
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
