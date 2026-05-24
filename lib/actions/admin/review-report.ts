'use server';

import { ReportStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export type ReviewReportResult = { ok: true } | { error: string };

export async function reviewReport(
  reportId: string,
  status: 'DISMISSED' | 'ACTION_TAKEN',
  note?: string,
): Promise<ReviewReportResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: 'Accès refusé.' };
  }

  await db.report.update({
    where: { id: reportId },
    data: {
      status: status as ReportStatus,
      reviewedAt: new Date(),
      reviewNote: note?.trim() || null,
    },
  });

  revalidatePath('/admin/moderation');
  return { ok: true };
}
