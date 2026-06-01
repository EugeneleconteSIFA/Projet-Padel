import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProfile, getPlayerDashboard } from '@/lib/actions/profil';
import { listTournaments } from '@/lib/queries/tournaments';
import JoueurClient from './joueur-client';

export const metadata: Metadata = { title: 'Espace joueur — The Court' };

export default async function JoueurPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  if (session.user.role !== 'PLAYER') {
    redirect(session.user.role === 'CLUB' ? '/club' : session.user.role === 'REFEREE' ? '/arbitre' : '/');
  }

  const [profile, dashboard, tournaments] = await Promise.all([
    getProfile().catch(() => null),
    getPlayerDashboard().catch(() => null),
    listTournaments().catch(() => []),
  ]);

  const firstName = profile?.firstName ?? session.user.name?.split(' ')[0] ?? 'Joueur';
  const isPremium = session.user.tier === 'PREMIUM';

  const now = new Date().toISOString().slice(0, 10);
  const upcomingRegistrations =
    dashboard?.history.filter((h) => h.status === 'CONFIRMED' && h.date >= now).slice(0, 4) ?? [];

  return (
    <JoueurClient
      firstName={firstName}
      isPremium={isPremium}
      stats={dashboard?.stats ?? null}
      upcomingRegistrations={upcomingRegistrations}
      suggestedTournaments={tournaments.slice(0, 6)}
    />
  );
}
