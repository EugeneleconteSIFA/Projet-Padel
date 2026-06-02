'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

async function requireClub() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Non authentifié.');
  if (session.user.role !== 'CLUB') throw new Error('Accès réservé aux clubs.');

  const clubProfile = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    include: { club: true },
  });

  return { session, clubProfile, club: clubProfile?.club ?? null };
}

export async function searchReferees(query: string) {
  if (query.length < 2) return [];

  const referees = await db.user.findMany({
    where: {
      role: 'REFEREE',
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      refereeProfile: {
        select: { id: true, certificationLevel: true },
      },
    },
    take: 10,
  });

  return referees.map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    refereeProfile: r.refereeProfile,
  }));
}

export async function assignReferee(
  tournamentEditionId: string,
  refereeProfileId: string,
  isHead: boolean,
): Promise<ActionResult> {
  const { club } = await requireClub();
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const edition = await db.tournamentEdition.findUnique({
    where: { id: tournamentEditionId },
    include: { tournament: true },
  });

  if (!edition) return { success: false, error: 'Édition introuvable.' };
  if (edition.tournament.clubId !== club.id) {
    return { success: false, error: 'Ce tournoi n\'appartient pas à votre club.' };
  }

  const existing = await db.tournamentReferee.findUnique({
    where: {
      tournamentEditionId_refereeProfileId: {
        tournamentEditionId,
        refereeProfileId,
      },
    },
  });

  if (existing) {
    return { success: false, error: 'Cet arbitre est déjà assigné à cette édition.' };
  }

  if (isHead) {
    await db.tournamentReferee.updateMany({
      where: { tournamentEditionId, isHead: true },
      data: { isHead: false },
    });
  }

  const assignment = await db.tournamentReferee.create({
    data: {
      tournamentEditionId,
      refereeProfileId,
      isHead,
      status: 'PENDING',
    },
  });

  const refereeProfile = await db.refereeProfile.findUnique({
    where: { id: refereeProfileId },
    include: { user: true },
  });

  if (refereeProfile?.user) {
    await createRefereeAssignmentNotification(refereeProfile.user.id, edition.tournament.name);
  }

  revalidatePath('/club');
  revalidatePath(`/club/tournoi/${edition.tournament.slug}`);

  return { success: true, id: assignment.id };
}

export async function removeRefereeAssignment(tournamentRefereeId: string): Promise<ActionResult> {
  const { club } = await requireClub();
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const assignment = await db.tournamentReferee.findUnique({
    where: { id: tournamentRefereeId },
    include: { edition: { include: { tournament: true } } },
  });

  if (!assignment) return { success: false, error: 'Assignation introuvable.' };
  if (assignment.edition.tournament.clubId !== club.id) {
    return { success: false, error: 'Cette assignation n\'appartient pas à votre club.' };
  }

  await db.tournamentReferee.delete({
    where: { id: tournamentRefereeId },
  });

  revalidatePath('/club');
  revalidatePath(`/club/tournoi/${assignment.edition.tournament.slug}`);

  return { success: true };
}

export async function createRefereeAssignmentNotification(refereeUserId: string, tournamentName: string) {
  await db.notification.create({
    data: {
      userId: refereeUserId,
      kind: 'REFEREE_ASSIGNED',
      title: 'Nouvelle assignation',
      body: `Vous avez été assigné au tournoi "${tournamentName}".`,
    },
  });
}

async function requireReferee() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Non authentifié.');
  if (session.user.role !== 'REFEREE') throw new Error('Accès réservé aux arbitres.');

  const profile = await db.refereeProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error('Profil arbitre introuvable.');
  return { session, profile };
}

export async function respondToAssignment(
  tournamentRefereeId: string,
  response: 'ACCEPTED' | 'DECLINED',
): Promise<ActionResult> {
  const { profile } = await requireReferee();

  const assignment = await db.tournamentReferee.findUnique({
    where: { id: tournamentRefereeId },
  });

  if (!assignment) return { success: false, error: 'Assignation introuvable.' };
  if (assignment.refereeProfileId !== profile.id) {
    return { success: false, error: 'Cette assignation ne vous appartient pas.' };
  }

  await db.tournamentReferee.update({
    where: { id: tournamentRefereeId },
    data: {
      status: response,
      respondedAt: new Date(),
    },
  });

  revalidatePath('/arbitre');
  return { success: true };
}
