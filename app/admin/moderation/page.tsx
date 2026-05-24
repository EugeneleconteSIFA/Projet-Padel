import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SiteHeader } from '@/components/site-header';
import { ModerationPanel } from '@/components/community/ModerationPanel';
import { getReportContentPreviews } from '@/lib/community/report-content';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Modération — The Court',
};

export default async function AdminModerationPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    notFound();
  }

  const reports = await db.report.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const previews = await getReportContentPreviews(reports);

  const items = reports.map(report => {
    const preview = previews.get(`${report.targetType}:${report.targetId}`)!;
    return {
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      createdAt: report.createdAt.toISOString(),
      excerpt: preview.excerpt,
      contentUrl: preview.contentUrl,
    };
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <SiteHeader />
      <main className="mx-auto max-w-screen-md px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--ink-950)' }}>
          Modération
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          Signalements en attente de revue
        </p>
        <ModerationPanel reports={items} />
      </main>
    </div>
  );
}
