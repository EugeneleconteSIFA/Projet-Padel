'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

/* =============================================================================
   Server Actions — gestion des coachs
   ============================================================================= */

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

/* ── Helpers auth ────────────────────────────────────────────────────────── */

async function requireClub() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Non authentifié.');
  if (session.user.role !== 'CLUB') throw new Error('Accès réservé aux clubs.');

  const clubProfile = await db.clubProfile.findUnique({
    where:   { userId: session.user.id },
    include: { club: true },
  });

  return { session, clubProfile, club: clubProfile?.club ?? null };
}

/* ── Lecture ──────────────────────────────────────────────────────────────── */

export async function listCoaches() {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return null;

  const coaches = await db.coach.findMany({
    where: { clubId: club.id },
    include: {
      _count: {
        select: {
          groups: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return coaches.map(c => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    avatarUrl: c.avatarUrl,
    isActive: c.isActive,
    activeGroupsCount: c._count.groups,
    createdAt: c.createdAt.toISOString(),
  }));
}

/* ── Mutation ─────────────────────────────────────────────────────────────── */

const createCoachSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  userId: z.string().cuid().optional(),
});

export async function createCoach(input: z.infer<typeof createCoachSchema>): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const validated = createCoachSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const data = validated.data;

  // Si userId fourni, vérifier que l'utilisateur existe
  if (data.userId) {
    const user = await db.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      return { success: false, error: 'Utilisateur introuvable.' };
    }
  }

  try {
    const coach = await db.coach.create({
      data: {
        clubId: club.id,
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        isActive: true,
      },
    });

    revalidatePath('/club/cours/coachs');
    return { success: true, id: coach.id };
  } catch {
    return { success: false, error: 'Erreur lors de la création du coach.' };
  }
}

const updateCoachSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export async function updateCoach(coachId: string, patch: z.infer<typeof updateCoachSchema>): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const validated = updateCoachSchema.safeParse(patch);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const data = validated.data;

  // Vérifier que le coach appartient au club
  const existing = await db.coach.findFirst({
    where: { id: coachId, clubId: club.id },
  });
  if (!existing) {
    return { success: false, error: 'Coach introuvable.' };
  }

  try {
    await db.coach.update({
      where: { id: coachId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    revalidatePath('/club/cours/coachs');
    return { success: true };
  } catch {
    return { success: false, error: 'Erreur lors de la mise à jour du coach.' };
  }
}

export async function archiveCoach(coachId: string): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const coach = await db.coach.findFirst({
    where: { id: coachId, clubId: club.id },
  });
  if (!coach) {
    return { success: false, error: 'Coach introuvable.' };
  }

  try {
    await db.coach.update({
      where: { id: coachId },
      data: { isActive: false },
    });

    revalidatePath('/club/cours/coachs');
    return { success: true };
  } catch {
    return { success: false, error: 'Erreur lors de l\'archivage du coach.' };
  }
}
