'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { pinThread } from '@/lib/actions/community/forum';

type PinThreadButtonProps = {
  threadId: string;
  categorySlug: string;
  isPinned: boolean;
};

export function PinThreadButton({ threadId, categorySlug, isPinned }: PinThreadButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await pinThread(threadId, categorySlug);
          router.refresh();
        })
      }
      className="min-h-11 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60"
      style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
    >
      {isPinned ? 'Désépingler' : 'Épingler'}
    </button>
  );
}
