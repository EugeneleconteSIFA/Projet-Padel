import { auth } from '@/lib/auth';
import { getProfile, getPlayerDashboard } from '@/lib/actions/profil';
import { listTournaments } from '@/lib/queries/tournaments';
import { spotsLabel } from '@/lib/mock-tournaments';
import { PlayerDashboardShell } from '@/components/player/player-dashboard-shell';
import PlayerHomeClient, { type PlayerHomeData } from './player-home-client';

const MOCK_UPCOMING = [
  {
    id: 't1',
    slug: 'open-de-loos-avril',
    tournamentName: 'Open de Loos · Avril',
    clubName: 'Padel Loos',
    date: '2026-04-13',
    category: 'P100',
    partnerName: 'Lucas M.',
    status: 'CONFIRMED',
  },
];

const MOCK_STATS = { upcoming: 2, past: 7, waitlisted: 1, totalConfirmed: 12 };

export default async function PlayerHome() {
  const session = await auth();
  if (!session?.user) return null;

  const [profile, dashboard, tournaments] = await Promise.all([
    getProfile().catch(() => null),
    getPlayerDashboard().catch(() => null),
    listTournaments().catch(() => []),
  ]);

  const firstName = profile?.firstName ?? session.user.name?.split(' ')[0] ?? 'Joueur';
  const lastName = profile?.lastName ?? session.user.name?.split(' ')[1] ?? '';
  const initials = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || 'J';

  const license = profile?.playerProfile?.licenses?.[0];
  const ranking =
    license?.ranking ?? profile?.playerProfile?.estimatedLevel ?? 'P100';

  const now = new Date().toISOString().slice(0, 10);
  const history = dashboard?.history ?? MOCK_UPCOMING;
  const upcoming = history
    .filter((t) => t.date >= now && (t.status === 'CONFIRMED' || t.status === 'PENDING_PAYMENT'))
    .sort((a, b) => a.date.localeCompare(b.date));

  const stats = dashboard?.stats ?? MOCK_STATS;

  const suggested = tournaments.slice(0, 3).map((t) => ({
    slug: t.id,
    name: t.name,
    city: t.city,
    category: t.category,
    date: t.date,
    price: t.price,
    spotsLabel: spotsLabel(t),
  }));

  const data: PlayerHomeData = {
    firstName,
    initials,
    isPremium: session.user.tier === 'PREMIUM',
    lookingForPartner: profile?.playerProfile?.lookingForPartner ?? false,
    ranking,
    stats,
    upcoming,
    suggested,
  };

  return (
    <PlayerDashboardShell role="PLAYER">
      <PlayerHomeClient data={data} />
    </PlayerDashboardShell>
  );
}
