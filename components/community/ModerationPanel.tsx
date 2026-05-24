'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ReportTargetType } from '@prisma/client';
import { reviewReport } from '@/lib/actions/admin/review-report';
import { REPORT_TYPE_COLORS, REPORT_TYPE_LABELS } from '@/lib/community/report-content';

export type ModerationReportView = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  createdAt: string;
  excerpt: string;
  contentUrl: string | null;
};

type ModerationPanelProps = {
  reports: ModerationReportView[];
};

export function ModerationPanel({ reports }: ModerationPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const review = (reportId: string, status: 'DISMISSED' | 'ACTION_TAKEN') => {
    startTransition(async () => {
      await reviewReport(reportId, status, note || undefined);
      setActiveId(null);
      setNote('');
      router.refresh();
    });
  };

  if (reports.length === 0) {
    return (
      <p className="rounded-xl border px-4 py-8 text-center text-sm" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        Aucun signalement en attente.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reports.map(report => {
        const colors = REPORT_TYPE_COLORS[report.targetType];
        const isActionOpen = activeId === report.id;

        return (
          <li
            key={report.id}
            className="rounded-2xl border p-4 sm:p-5"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ background: colors.bg, color: colors.text }}
              >
                {REPORT_TYPE_LABELS[report.targetType]}
              </span>
              <time className="text-xs" style={{ color: 'var(--text-muted)' }} dateTime={report.createdAt}>
                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: fr })}
              </time>
            </div>

            <p className="mb-2 text-sm italic" style={{ color: 'var(--text-secondary)' }}>
              « {report.excerpt} »
            </p>
            <p className="mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>
              <span className="font-medium">Raison :</span> {report.reason}
            </p>

            {report.contentUrl && (
              <Link
                href={report.contentUrl}
                className="mb-4 inline-flex min-h-11 items-center text-sm font-medium"
                style={{ color: 'var(--court-700)' }}
              >
                Voir le contenu →
              </Link>
            )}

            {isActionOpen && (
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Note (optionnelle)
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
                  placeholder="Note interne…"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => review(report.id, 'DISMISSED')}
                className="min-h-11 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
              >
                Ignorer
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (isActionOpen) {
                    review(report.id, 'ACTION_TAKEN');
                  } else {
                    setActiveId(report.id);
                    setNote('');
                  }
                }}
                className="min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
              >
                {isActionOpen ? 'Confirmer action prise' : 'Action prise'}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
