'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/* =============================================================================
   Server Actions — inscription joueur à un tournoi.
   ============================================================================= */

export type RegistrationResult =
  | { status: 'CONFIRMED';     registrationId: string }
  | { status: 'WAITING_LIST';  position: number }
  | { status: 'ALREADY_REGISTERED' }
  | { status: 'AUTH_REQUIRED' }
  | { status: 'ERROR';         message: string };

export type UserRegistrationStatus = 'CONFIRMED' | 'WAITING_LIST' | 'NONE';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

async function getOrCreatePlayerProfile(userId: string) {
  const existing = await db.playerProfile.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.playerProfile.create({ data: { userId } });
}

/* ── Actions publiques ────────────────────────────────────────────────────── */

/**
 * Inscrit le joueur connecté à une édition de tournoi.
 * POC : paiement non branché — la registration est directement CONFIRMED.
 */
export async function registerForTournament(
  editionId: string,
): Promise<RegistrationResult> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'AUTH_REQUIRED' };

  const playerProfile = await getOrCreatePlayerProfile(session.user.id);

  // Charge l'édition + registrations CONFIRMED / PENDING
  const edition = await db.tournamentEdition.findUnique({
    where: { id: editionId },
    include: {
      registrations: {
        where: { status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] } },
        select: { id: true, leadPlayerId: true },
      },
    },
  });

  if (!edition) return { status: 'ERROR', message: 'Édition introuvable.' };

  // Déjà inscrit ?
  const alreadyIn = edition.registrations.some(
    (r) => r.leadPlayerId === playerProfile.id,
  );
  if (alreadyIn) return { status: 'ALREADY_REGISTERED' };

  const isFull = edition.registrations.length >= edition.maxTeams;

  // ── Tournoi complet → liste d'attente ─────────────────────────────────
  if (isFull) {
    // Déjà en liste d'attente ?
    const onWaitlist = await db.waitingListEntry.findFirst({
      where: { tournamentEditionId: editionId, soloPlayerId: playerProfile.id },
    });
    if (onWaitlist) return { status: 'ALREADY_REGISTERED' };

    const last = await db.waitingListEntry.findFirst({
      where:   { tournamentEditionId: editionId },
      orderBy: { position: 'desc' },
    });
    const position = (last?.position ?? 0) + 1;

    await db.waitingListEntry.create({
      data: {
        tournamentEditionId: editionId,
        mode:          'SOLO',
        soloPlayerId:  playerProfile.id,
        position,
      },
    });

    revalidatePath('/tournois');
    return { status: 'WAITING_LIST', position };
  }

  // ── Places disponibles → inscription ──────────────────────────────────
  const registration = await db.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        members: {
          create: { playerProfileId: playerProfile.id, isCaptain: true },
        },
      },
    });

    return tx.registration.create({
      data: {
        tournamentEditionId: editionId,
        teamId:              team.id,
        leadPlayerId:        playerProfile.id,
        // POC : on confirme directement, sans passer par Stripe
        status:              'CONFIRMED',
        confirmedAt:         new Date(),
      },
    });
  });

  revalidatePath('/tournois');
  return { status: 'CONFIRMED', registrationId: registration.id };
}

/**
 * Vérifie si le joueur connecté est déjà inscrit (ou en liste d'attente)
 * à cette édition. Utilisé côté Server Component pour pré-remplir l'état du bouton.
 */
export async function checkUserRegistration(
  editionId: string,
): Promise<UserRegistrationStatus> {
  const session = await auth();
  if (!session?.user?.id) return 'NONE';

  const playerProfile = await db.playerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!playerProfile) return 'NONE';

  const registration = await db.registration.findFirst({
    where: {
      tournamentEditionId: editionId,
      leadPlayerId:        playerProfile.id,
      status:              { not: 'WITHDRAWN' },
    },
  });
  if (registration) return 'CONFIRMED';

  const waitlistEntry = await db.waitingListEntry.findFirst({
    where: {
      tournamentEditionId: editionId,
      soloPlayerId:        playerProfile.id,
    },
  });
  return waitlistEntry ? 'WAITING_LIST' : 'NONE';
}
