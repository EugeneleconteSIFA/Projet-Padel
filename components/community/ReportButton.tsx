'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { ReportTargetType } from '@prisma/client';
import { submitReport } from '@/lib/actions/community/report';

type ReportModalProps = {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  loginCallbackUrl?: string;
};

function FlagIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

export function ReportModal({
  open,
  onClose,
  targetType,
  targetId,
  loginCallbackUrl,
}: ReportModalProps) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) return null;

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await submitReport(targetType, targetId, reason);
      if ('error' in result) {
        if (result.error === 'unauthenticated') {
          onClose();
          router.push(loginCallbackUrl ?? '/login');
          return;
        }
        setError(result.error);
        return;
      }
      setReason('');
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-5 shadow-lg"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 id="report-title" className="mb-3 text-lg font-semibold" style={{ color: 'var(--ink-950)' }}>
          Signaler ce contenu
        </h2>
        <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Raison
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          maxLength={300}
          rows={4}
          required
          className="mb-1 w-full rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
          placeholder="Explique brièvement pourquoi tu signales…"
        />
        <p className="mb-3 text-right text-xs" style={{ color: 'var(--text-muted)' }}>
          {reason.length}/300
        </p>
        {error && (
          <p className="mb-3 text-sm" style={{ color: '#b91c1c' }}>
            {error === 'unauthenticated' ? 'Connecte-toi pour signaler' : error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending || !reason.trim()}
            onClick={submit}
            className="min-h-11 flex-1 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60"
            style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
          >
            {pending ? 'Envoi…' : 'Signaler'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-xl py-2.5 text-sm font-medium"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

type ReportButtonProps = {
  targetType: ReportTargetType;
  targetId: string;
  loginCallbackUrl?: string;
};

export function ReportButton({ targetType, targetId, loginCallbackUrl }: ReportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg transition hover:opacity-70"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Signaler ce contenu"
      >
        <FlagIcon />
      </button>
      <ReportModal
        open={open}
        onClose={() => setOpen(false)}
        targetType={targetType}
        targetId={targetId}
        loginCallbackUrl={loginCallbackUrl}
      />
    </>
  );
}

type ReportMenuItemProps = ReportButtonProps & {
  onSelect?: () => void;
};

export function ReportMenuItem({ onSelect, ...props }: ReportMenuItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onSelect?.();
          setOpen(true);
        }}
        className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-sm hover:opacity-80"
        style={{ color: 'var(--text-secondary)' }}
      >
        <FlagIcon />
        Signaler
      </button>
      <ReportModal open={open} onClose={() => setOpen(false)} {...props} />
    </>
  );
}
