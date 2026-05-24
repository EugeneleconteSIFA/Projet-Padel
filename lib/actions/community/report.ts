'use server';

import { ReportTargetType } from '@prisma/client';
import { requirePlayerProfile } from '@/lib/community/player';
import { db } from '@/lib/db';

const MAX_REASON = 300;

export type SubmitReportResult = { ok: true } | { error: string };

export async function submitReport(
  targetType: ReportTargetType,
  targetId: string,
  reason: string,
): Promise<SubmitReportResult> {
  const profile = await requirePlayerProfile();
  if (!profile) return { error: 'unauthenticated' };

  const trimmed = reason.trim();
  if (!trimmed || trimmed.length > MAX_REASON) {
    return { error: 'Raison obligatoire (max 300 caractères).' };
  }

  const existing = await db.report.findFirst({
    where: {
      reporterId: profile.id,
      targetType,
      targetId,
    },
  });
  if (existing) {
    return { error: 'Tu as déjà signalé ce contenu' };
  }

  await db.report.create({
    data: {
      reporterId: profile.id,
      targetType,
      targetId,
      reason: trimmed,
    },
  });

  return { ok: true };
}
