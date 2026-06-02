'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { tryCompleteTournamentEdition } from '@/lib/community/complete-edition';
import { revalidatePath } from 'next/cache';

/* =============================================================================
   Actions serveur — Espace Arbitre
   ============================================================================= */

/* ── Garde : vérifie que l'utilisateur est un arbitre connecté ── */
async function requireReferee() {
  const session = await auth();
  if (!session?.user) throw new Error('Non authentifié');
  if (session.user.role !== 'REFEREE') throw new Error('Accès réservé aux arbitres');

  const profile = await db.refereeProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error('Profil arbitre introuvable');
  return { session, profile };
}

/* ── Tableau de bord arbitre ────────────────────────────────────────────────── */
export async function getArbitreDashboard() {
  const { profile, session } = await requireReferee();

  const assignments = await db.tournamentReferee.findMany({
    where: { refereeProfileId: profile.id },
    include: {
      edition: {
        include: {
          tournament: { include: { club: true } },
          registrations: {
            include: {
              team: {
                include: {
                  members: {
                    include: {
                      player: {
                        include: {
                          user: { select: { firstName: true, lastName: true, email: true } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          matches: true,
          brackets: { select: { id: true } },
          _count: { select: { matches: true } },
        },
      },
    },
    orderBy: { edition: { startDate: 'asc' } },
  });

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  type MappedTournament = {
    id: string;
    slug: string;
    tournamentName: string;
    clubName: string;
    startDate: string;
    endDate: string;
    status: string;
    isHead: boolean;
    teamsConfirmed: number;
    maxTeams: number;
    totalMatches: number;
    playedMatches: number;
    liveMatches: number;
    pendingMatches: number;
    pendingPayment: number;
    hasBracket: boolean;
    isToday: boolean;
    category: string;
    assignmentStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    assignmentId: string;
  };

  const mapAssignment = (a: (typeof assignments)[number]): MappedTournament => {
    const edition = a.edition;
    const teamsConfirmed = edition.registrations.filter((r) => r.status === 'CONFIRMED').length;
    const pendingPayment = edition.registrations.filter((r) => r.status === 'PENDING_PAYMENT').length;
    const playedMatches = edition.matches.filter((m) => m.status === 'completed').length;
    const liveMatches = edition.matches.filter((m) => m.status === 'live').length;
    const pendingMatches = edition.matches.filter((m) => m.status !== 'completed').length;
    const startDateStr = edition.startDate.toISOString().slice(0, 10);

    return {
      id: edition.id,
      slug: edition.tournament.slug,
      tournamentName: edition.tournament.name,
      clubName: edition.tournament.club.name,
      startDate: edition.startDate.toISOString(),
      endDate: edition.endDate.toISOString(),
      status: edition.status,
      isHead: a.isHead,
      teamsConfirmed,
      maxTeams: edition.maxTeams,
      totalMatches: edition._count.matches,
      playedMatches,
      liveMatches,
      pendingMatches,
      pendingPayment,
      hasBracket: edition.brackets.length > 0,
      isToday: startDateStr === todayStr || edition.status === 'RUNNING',
      category: edition.tournament.category ?? 'P100',
      assignmentStatus: a.status,
      assignmentId: a.id,
    };
  };

  const isUpcoming = (a: (typeof assignments)[number]) => {
    const e = a.edition;
    if (['RUNNING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'PUBLISHED'].includes(e.status)) {
      return true;
    }
    return new Date(e.startDate) >= now;
  };

  const upcoming = assignments.filter(isUpcoming).map(mapAssignment);

  const past = assignments
    .filter((a) => !isUpcoming(a))
    .slice(-5)
    .reverse()
    .map(mapAssignment);

  const pendingRegistrations = assignments
    .filter(isUpcoming)
    .flatMap((a) =>
      a.edition.registrations
        .filter((r) => r.status === 'PENDING_PAYMENT')
        .map((r) => ({
          id: r.id,
          editionId: a.edition.id,
          tournamentName: a.edition.tournament.name,
          registeredAt: r.registeredAt.toISOString(),
          players: r.team.members.map((m) => {
            const u = m.player.user;
            return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;
          }),
        })),
    )
    .slice(0, 8);

  const kpis = {
    upcomingCount: upcoming.length,
    pastCount: past.length,
    pendingPaymentCount: upcoming.reduce((sum, t) => sum + t.pendingPayment, 0),
    liveMatchesCount: upcoming.reduce((sum, t) => sum + t.liveMatches, 0),
    pendingScoreMatches: upcoming.reduce((sum, t) => sum + t.pendingMatches, 0),
    needsBracketCount: upcoming.filter((t) => !t.hasBracket && t.teamsConfirmed >= 2).length,
  };

  const firstName = session.user.name?.split(' ')[0] ?? 'Arbitre';

  return { upcoming, past, pendingRegistrations, kpis, firstName };
}

/* ── Détail tournoi pour l'arbitre ─────────────────────────────────────────── */
export async function getArbitreTournoi(editionId: string) {
  const { profile } = await requireReferee();

  // Vérifie l'assignation
  const assignment = await db.tournamentReferee.findFirst({
    where: { tournamentEditionId: editionId, refereeProfileId: profile.id },
  });
  if (!assignment) throw new Error('Vous n\'êtes pas assigné à ce tournoi');

  const edition = await db.tournamentEdition.findUnique({
    where: { id: editionId },
    include: {
      tournament: { include: { club: true } },
      brackets: {
        include: {
          matches: {
            include: {
              teamA: { include: { members: { include: { player: { include: { user: true } } } } } },
              teamB: { include: { members: { include: { player: { include: { user: true } } } } } },
              scores: { orderBy: { setNumber: 'asc' } },
            },
            orderBy: { scheduledAt: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
      matches: {
        where: { bracketId: null }, // matches sans bracket assigné
        include: {
          teamA: true,
          teamB: true,
          scores: { orderBy: { setNumber: 'asc' } },
        },
      },
      referees: {
        include: { referee: { include: { user: true } } },
      },
    },
  });

  if (!edition) throw new Error('Édition introuvable');
  return edition;
}

/* ── Sauvegarder le score d'un match ────────────────────────────────────────── */
export async function saveMatchScore(matchId: string, sets: { teamA: number; teamB: number }[]) {
  await requireReferee();

  // Upsert chaque set
  for (let i = 0; i < sets.length; i++) {
    await db.matchScore.upsert({
      where: { matchId_setNumber: { matchId, setNumber: i + 1 } },
      create: {
        matchId,
        setNumber:  i + 1,
        teamAGames: sets[i].teamA,
        teamBGames: sets[i].teamB,
      },
      update: {
        teamAGames: sets[i].teamA,
        teamBGames: sets[i].teamB,
      },
    });
  }

  // Détermine le vainqueur (meilleure des 3 sets)
  const setsWonA = sets.filter(s => s.teamA > s.teamB).length;
  const setsWonB = sets.filter(s => s.teamB > s.teamA).length;

  const match = await db.match.findUnique({
    where: { id: matchId },
    select: { teamAId: true, teamBId: true },
  });

  let winnerTeamId: string | null = null;
  if (match) {
    if (setsWonA > setsWonB && match.teamAId) winnerTeamId = match.teamAId;
    else if (setsWonB > setsWonA && match.teamBId) winnerTeamId = match.teamBId;
  }

  const updated = await db.match.update({
    where: { id: matchId },
    data: {
      status:      'completed',
      endedAt:     new Date(),
      winnerTeamId,
    },
    select: { tournamentEditionId: true },
  });

  await tryCompleteTournamentEdition(updated.tournamentEditionId);

  revalidatePath('/arbitre');
  revalidatePath('/feed');
}

/* ── Démarrer un match ──────────────────────────────────────────────────────── */
export async function startMatch(matchId: string) {
  await requireReferee();
  await db.match.update({
    where: { id: matchId },
    data: { status: 'live', startedAt: new Date() },
  });
  revalidatePath('/arbitre');
}

/* ── Générer le tableau d'un tournoi ────────────────────────────────────────── */
export async function generateBracket(editionId: string): Promise<{ success: boolean; error?: string }> {
  await requireReferee();

  const edition = await db.tournamentEdition.findUnique({
    where: { id: editionId },
    include: {
      tournament: { select: { format: true } },
      registrations: {
        where: { status: 'CONFIRMED' },
        include: { team: { select: { id: true } } },
        orderBy: { registeredAt: 'asc' },
      },
      brackets: { select: { id: true } },
    },
  });

  if (!edition) return { success: false, error: 'Édition introuvable.' };
  if (edition.brackets.length > 0) return { success: false, error: 'Un tableau existe déjà pour cette édition.' };

  const teams = edition.registrations.map(r => r.team);
  if (teams.length < 2) return { success: false, error: 'Il faut au moins 2 équipes inscrites.' };

  const format = edition.tournament.format;
  const shuffled = [...teams].sort(() => Math.random() - 0.5);

  if (format === 'SINGLE_ELIMINATION') {
    const bracket = await db.bracket.create({
      data: { tournamentEditionId: editionId, label: 'Tableau principal', order: 0 },
    });
    const createOps = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      const teamA = shuffled[i];
      const teamB = shuffled[i + 1] ?? null;
      createOps.push(db.match.create({
        data: {
          bracketId: bracket.id,
          tournamentEditionId: editionId,
          metadata: { round: 1, position: i / 2 },
          teamAId: teamA.id,
          teamBId: teamB?.id ?? null,
          status: teamB ? 'scheduled' : 'completed',
          winnerTeamId: teamB ? null : teamA.id,
        },
      }));
    }
    await Promise.all(createOps);
  } else {
    // Poules (POOLS_PLUS_BRACKET, CONSOLATION, etc.)
    const poolSize = 4;
    const pools: (typeof shuffled)[] = [];
    for (let i = 0; i < shuffled.length; i += poolSize) {
      pools.push(shuffled.slice(i, i + poolSize));
    }
    for (let pi = 0; pi < pools.length; pi++) {
      const pool = pools[pi];
      const bracket = await db.bracket.create({
        data: { tournamentEditionId: editionId, label: `Poule ${String.fromCharCode(65 + pi)}`, order: pi },
      });
      let pos = 0;
      for (let a = 0; a < pool.length; a++) {
        for (let b = a + 1; b < pool.length; b++) {
          await db.match.create({
            data: {
              bracketId: bracket.id,
              tournamentEditionId: editionId,
              metadata: { round: 1, position: pos++ },
              teamAId: pool[a].id,
              teamBId: pool[b].id,
              status: 'scheduled',
            },
          });
        }
      }
    }
  }

  await db.tournamentEdition.update({ where: { id: editionId }, data: { status: 'RUNNING' } });
  revalidatePath(`/arbitre/tournoi/${editionId}`);
  return { success: true };
}

/* ── Soumettre le score d'un match ──────────────────────────────────────────── */
export async function submitScore(
  matchId: string,
  scores: { setNumber: number; teamAGames: number; teamBGames: number }[],
): Promise<{ success: boolean; error?: string }> {
  await requireReferee();

  const match = await db.match.findUnique({ where: { id: matchId } });
  if (!match) return { success: false, error: 'Match introuvable.' };
  if (!match.teamAId || !match.teamBId) return { success: false, error: 'Match incomplet (bye).' };

  let teamASets = 0, teamBSets = 0;
  for (const s of scores) {
    if (s.teamAGames > s.teamBGames) teamASets++;
    else if (s.teamBGames > s.teamAGames) teamBSets++;
  }
  const winnerTeamId = teamASets > teamBSets ? match.teamAId : teamBSets > teamASets ? match.teamBId : null;

  await db.$transaction([
    db.matchScore.deleteMany({ where: { matchId } }),
    ...scores.map(s => db.matchScore.create({
      data: { matchId, setNumber: s.setNumber, teamAGames: s.teamAGames, teamBGames: s.teamBGames },
    })),
    db.match.update({
      where: { id: matchId },
      data: { status: 'completed', winnerTeamId },
    }),
  ]);

  await tryCompleteTournamentEdition(match.tournamentEditionId);

  revalidatePath(`/arbitre/tournoi/${match.tournamentEditionId}`);
  revalidatePath('/feed');
  return { success: true };
}

/* ── Clôturer manuellement une édition (tous matchs terminés) ─────────────── */
export async function completeTournamentEdition(
  editionId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireReferee();

  const assignment = await db.tournamentReferee.findFirst({
    where: { tournamentEditionId: editionId },
  });
  if (!assignment) return { success: false, error: 'Vous n\'êtes pas assigné à ce tournoi.' };

  const incomplete = await db.match.count({
    where: { tournamentEditionId: editionId, status: { not: 'completed' } },
  });
  if (incomplete > 0) {
    return { success: false, error: `${incomplete} match(s) encore en cours.` };
  }

  await tryCompleteTournamentEdition(editionId);
  revalidatePath(`/arbitre/tournoi/${editionId}`);
  revalidatePath('/feed');
  return { success: true };
}
