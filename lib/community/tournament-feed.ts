// =============================================================================
// Auto-publication des résultats de tournoi dans le feed
// =============================================================================

import { PostVisibility, RegistrationStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';

const teamInclude = {
  name: true,
  members: {
    include: {
      player: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  },
} as const;

type TeamWithMembers = {
  id: string;
  name: string | null;
  members: {
    player: { user: { firstName: string; lastName: string } };
  }[];
};

function formatTeamLabel(team: TeamWithMembers): string {
  if (team.name?.trim()) return team.name.trim();
  return team.members
    .map(m => `${m.player.user.firstName} ${m.player.user.lastName.charAt(0)}.`)
    .join(' / ');
}

function matchRound(metadata: unknown): number {
  if (metadata && typeof metadata === 'object' && 'round' in metadata) {
    const round = Number((metadata as { round?: number }).round);
    return Number.isFinite(round) ? round : 0;
  }
  return 0;
}

/** Déduit le podium (1er, 2e, 3e) depuis les matchs terminés du tableau principal. */
function deriveTopThreeTeams(
  matches: {
    metadata: unknown;
    winnerTeamId: string | null;
    teamAId: string | null;
    teamBId: string | null;
    teamA: TeamWithMembers | null;
    teamB: TeamWithMembers | null;
  }[],
): TeamWithMembers[] {
  const completed = matches.filter(m => m.winnerTeamId && m.teamA && m.teamB);
  if (completed.length === 0) return [];

  const maxRound = Math.max(...completed.map(m => matchRound(m.metadata)), 0);
  const finals = completed.filter(m => matchRound(m.metadata) === maxRound);
  const final = finals[0];
  if (!final?.winnerTeamId) return [];

  const firstId = final.winnerTeamId;
  const first =
    final.teamA?.id === firstId ? final.teamA : final.teamB?.id === firstId ? final.teamB : null;
  const secondId = final.teamA?.id === firstId ? final.teamBId : final.teamAId;
  const second =
    final.teamA?.id === secondId ? final.teamA : final.teamB?.id === secondId ? final.teamB : null;

  const semis = completed.filter(m => matchRound(m.metadata) === maxRound - 1 && maxRound > 0);
  let third: TeamWithMembers | null = null;
  for (const semi of semis) {
    const loserId =
      semi.winnerTeamId === semi.teamA?.id ? semi.teamBId : semi.teamAId;
    if (loserId && loserId !== firstId && loserId !== secondId) {
      third =
        semi.teamA?.id === loserId ? semi.teamA : semi.teamB?.id === loserId ? semi.teamB : null;
      break;
    }
  }

  return [first, second, third].filter((t): t is TeamWithMembers => t != null);
}

async function resolveClubAuthorId(clubId: string): Promise<string> {
  const clubProfile = await db.clubProfile.findFirst({
    where: { clubId },
    select: { userId: true },
  });
  if (!clubProfile) {
    throw new Error(`Aucun compte club pour clubId=${clubId}`);
  }

  const profile = await db.playerProfile.upsert({
    where: { userId: clubProfile.userId },
    create: { userId: clubProfile.userId },
    update: {},
    select: { id: true },
  });

  return profile.id;
}

async function confirmedPlayerProfileIds(editionId: string): Promise<string[]> {
  const registrations = await db.registration.findMany({
    where: { tournamentEditionId: editionId, status: RegistrationStatus.CONFIRMED },
    include: { team: { include: { members: { select: { playerProfileId: true } } } } },
  });

  return [
    ...new Set(registrations.flatMap(r => r.team.members.map(m => m.playerProfileId))),
  ];
}

/**
 * Publie les résultats d’une édition terminée dans le feed et déverrouille le feed public
 * pour tous les joueurs inscrits confirmés.
 */
export async function publishTournamentResultsToFeed(
  tournamentEditionId: string,
): Promise<void> {
  const existing = await db.post.findFirst({
    where: { tournamentId: tournamentEditionId },
    select: { id: true },
  });
  if (existing) return;

  const edition = await db.tournamentEdition.findUnique({
    where: { id: tournamentEditionId },
    include: {
      tournament: { include: { club: true } },
      brackets: {
        where: { order: 0 },
        include: {
          matches: {
            where: { status: 'completed', winnerTeamId: { not: null } },
            include: {
              teamA: { include: teamInclude },
              teamB: { include: teamInclude },
            },
          },
        },
      },
      matches: {
        where: {
          bracketId: null,
          status: 'completed',
          winnerTeamId: { not: null },
        },
        include: {
          teamA: { include: teamInclude },
          teamB: { include: teamInclude },
        },
      },
    },
  });

  if (!edition) throw new Error('Édition introuvable');

  const mainMatches = edition.brackets[0]?.matches ?? edition.matches;
  const podium = deriveTopThreeTeams(mainMatches);

  const labels = podium.map(formatTeamLabel);
  while (labels.length < 3) labels.push('—');

  const club = edition.tournament.club;
  const dateLabel = formatDate(edition.endDate);
  const content = [
    `🏆 ${edition.tournament.name} — ${club.name} — ${dateLabel}`,
    `1er : ${labels[0]} · 2e : ${labels[1]} · 3e : ${labels[2]}`,
  ].join('\n');

  const authorId = await resolveClubAuthorId(club.id);
  const playerIds = await confirmedPlayerProfileIds(tournamentEditionId);

  await db.$transaction(async tx => {
    await tx.post.create({
      data: {
        authorId,
        clubId: club.id,
        tournamentId: tournamentEditionId,
        content,
        mediaUrls: [],
        visibility: PostVisibility.PUBLIC,
        isPromoted: false,
      },
    });

    if (playerIds.length > 0) {
      await tx.playerProfile.updateMany({
        where: { id: { in: playerIds } },
        data: { hasCompletedTournament: true },
      });
    }
  });
}
