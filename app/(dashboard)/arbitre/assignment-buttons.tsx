'use client';

import { useTransition } from 'react';
import { respondToAssignment } from '@/lib/actions/referee';

export function AssignmentButtons({ assignmentId }: { assignmentId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleAccept = () => {
    startTransition(async () => {
      await respondToAssignment(assignmentId, 'ACCEPTED');
    });
  };

  const handleDecline = () => {
    startTransition(async () => {
      await respondToAssignment(assignmentId, 'DECLINED');
    });
  };

  return (
    <>
      <button
        onClick={handleAccept}
        disabled={isPending}
        className="flex-1 rounded-xl py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: 'var(--court-700)' }}
      >
        {isPending ? '...' : 'Accepter'}
      </button>
      <button
        onClick={handleDecline}
        disabled={isPending}
        className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-80 disabled:opacity-50"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
      >
        Décliner
      </button>
    </>
  );
}
