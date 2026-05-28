import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PlayerDashboardShell } from '@/components/player/player-dashboard-shell';

/* =============================================================================
   Layout dashboard — routes protégées post-connexion.
   ============================================================================= */

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = session.user.role ?? 'PLAYER';

  return (
    <PlayerDashboardShell role={role}>
      {children}
    </PlayerDashboardShell>
  );
}
