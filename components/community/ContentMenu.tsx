'use client';

import { useState } from 'react';
import { ReportMenuItem } from '@/components/community/ReportButton';
import type { ReportTargetType } from '@prisma/client';

type ContentMenuProps = {
  targetType: ReportTargetType;
  targetId: string;
  loginCallbackUrl?: string;
};

export function ContentMenu({ targetType, targetId, loginCallbackUrl }: ContentMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-lg leading-none"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Options"
        aria-expanded={open}
      >
        ⋯
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl border shadow-lg"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <ReportMenuItem
              targetType={targetType}
              targetId={targetId}
              loginCallbackUrl={loginCallbackUrl}
              onSelect={() => setOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
