'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

/* =============================================================================
   Server Actions — gestion des cours (LessonGroup, LessonSession, etc.)
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

export async function getLessonGroupsForClub(filters?: {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  audience?: 'MINI' | 'JUNIOR' | 'TEEN' | 'ADULT' | 'SENIOR' | 'MIXED';
  level?: 'INITIATION' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'COMPETITION';
  coachId?: string;
}) {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return null;

  const groups = await db.lessonGroup.findMany({
    where: {
      clubId: club.id,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.audience && { audience: filters.audience }),
      ...(filters?.level && { level: filters.level }),
      ...(filters?.coachId && { coachId: filters.coachId }),
    },
    include: {
      coach: true,
      court: true,
      _count: {
        select: {
          enrollments: true,
          sessions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return groups.map(g => ({
    id: g.id,
    name: g.name,
    audience: g.audience,
    level: g.level,
    capacity: g.capacity,
    weekday: g.weekday,
    startTime: g.startTime,
    durationMinutes: g.durationMinutes,
    seasonStart: g.seasonStart.toISOString(),
    seasonEnd: g.seasonEnd.toISOString(),
    priceCents: g.priceCents,
    status: g.status,
    coach: {
      id: g.coach.id,
      firstName: g.coach.firstName,
      lastName: g.coach.lastName,
      avatarUrl: g.coach.avatarUrl,
    },
    court: g.court ? { id: g.court.id, name: g.court.name } : null,
    enrolledCount: g._count.enrollments,
    sessionCount: g._count.sessions,
  }));
}

export async function getLessonGroupDetail(groupId: string) {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return null;

  const group = await db.lessonGroup.findFirst({
    where: {
      id: groupId,
      clubId: club.id,
    },
    include: {
      coach: true,
      court: true,
      enrollments: {
        include: {
          player: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        where: { status: 'ACTIVE' },
      },
      sessions: {
        where: {
          date: { gte: new Date() },
          status: 'SCHEDULED',
        },
        orderBy: { date: 'asc' },
        take: 10,
      },
    },
  });

  if (!group) return null;

  return {
    id: group.id,
    name: group.name,
    audience: group.audience,
    level: group.level,
    capacity: group.capacity,
    weekday: group.weekday,
    startTime: group.startTime,
    durationMinutes: group.durationMinutes,
    seasonStart: group.seasonStart.toISOString(),
    seasonEnd: group.seasonEnd.toISOString(),
    priceCents: group.priceCents,
    description: group.description,
    status: group.status,
    coach: {
      id: group.coach.id,
      firstName: group.coach.firstName,
      lastName: group.coach.lastName,
      email: group.coach.email,
      phone: group.coach.phone,
      avatarUrl: group.coach.avatarUrl,
    },
    court: group.court ? { id: group.court.id, name: group.court.name } : null,
    enrollments: group.enrollments.map(e => ({
      id: e.id,
      status: e.status,
      enrolledAt: e.enrolledAt.toISOString(),
      player: {
        id: e.player.id,
        firstName: e.player.user.firstName,
        lastName: e.player.user.lastName,
        email: e.player.user.email,
        avatarUrl: e.player.user.avatarUrl,
      },
    })),
    sessions: group.sessions.map(s => ({
      id: s.id,
      date: s.date.toISOString(),
      durationMinutes: s.durationMinutes,
      status: s.status,
      courtId: s.courtId,
    })),
  };
}

export async function getLessonSessionsInRange(from: Date, to: Date, filters?: {
  coachId?: string;
  courtId?: string;
  level?: string;
}) {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return [];

  const sessions = await db.lessonSession.findMany({
    where: {
      date: { gte: from, lte: to },
      group: {
        clubId: club.id,
        ...(filters?.coachId && { coachId: filters.coachId }),
        ...(filters?.level && { level: filters.level as any }),
      },
      ...(filters?.courtId && { courtId: filters.courtId }),
    },
    include: {
      group: {
        include: {
          coach: true,
        },
      },
      court: true,
    },
    orderBy: { date: 'asc' },
  });

  return sessions.map(s => ({
    id: s.id,
    date: s.date.toISOString(),
    durationMinutes: s.durationMinutes,
    status: s.status,
    cancelReason: s.cancelReason,
    notes: s.notes,
    group: {
      id: s.group.id,
      name: s.group.name,
      audience: s.group.audience,
      level: s.group.level,
      capacity: s.group.capacity,
      coach: {
        id: s.group.coach.id,
        firstName: s.group.coach.firstName,
        lastName: s.group.coach.lastName,
        avatarUrl: s.group.coach.avatarUrl,
      },
    },
    court: s.court ? { id: s.court.id, name: s.court.name } : null,
  }));
}

/* ── Mutation groupe ───────────────────────────────────────────────────────── */

const createLessonGroupSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  audience: z.enum(['MINI', 'JUNIOR', 'TEEN', 'ADULT', 'SENIOR', 'MIXED']),
  level: z.enum(['INITIATION', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'COMPETITION']),
  capacity: z.number().int().min(1).max(4).default(4),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM requis'),
  durationMinutes: z.number().int().min(30).max(180).default(60),
  seasonStart: z.string().datetime(),
  seasonEnd: z.string().datetime(),
  priceCents: z.number().int().min(0).default(0),
  coachId: z.string().cuid(),
  courtId: z.string().cuid().optional(),
  description: z.string().optional(),
});

export async function createLessonGroup(input: z.infer<typeof createLessonGroupSchema>): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const validated = createLessonGroupSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const data = validated.data;

  // Vérifier que le coach appartient au club
  const coach = await db.coach.findFirst({
    where: { id: data.coachId, clubId: club.id, isActive: true },
  });
  if (!coach) {
    return { success: false, error: 'Coach introuvable ou inactif.' };
  }

  // Vérifier que le court appartient au club si fourni
  if (data.courtId) {
    const court = await db.court.findFirst({
      where: { id: data.courtId, clubId: club.id, isActive: true },
    });
    if (!court) {
      return { success: false, error: 'Terrain introuvable ou inactif.' };
    }
  }

  try {
    const group = await db.lessonGroup.create({
      data: {
        clubId: club.id,
        coachId: data.coachId,
        courtId: data.courtId,
        name: data.name,
        audience: data.audience,
        level: data.level,
        capacity: data.capacity,
        weekday: data.weekday,
        startTime: data.startTime,
        durationMinutes: data.durationMinutes,
        seasonStart: new Date(data.seasonStart),
        seasonEnd: new Date(data.seasonEnd),
        priceCents: data.priceCents,
        description: data.description,
        status: 'DRAFT',
      },
    });

    revalidatePath('/club/cours');
    return { success: true, id: group.id };
  } catch {
    return { success: false, error: 'Erreur lors de la création du cours.' };
  }
}

const updateLessonGroupSchema = z.object({
  name: z.string().min(1).optional(),
  audience: z.enum(['MINI', 'JUNIOR', 'TEEN', 'ADULT', 'SENIOR', 'MIXED']).optional(),
  level: z.enum(['INITIATION', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'COMPETITION']).optional(),
  capacity: z.number().int().min(1).max(4).optional(),
  weekday: z.number().int().min(0).max(6).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  durationMinutes: z.number().int().min(30).max(180).optional(),
  seasonStart: z.string().datetime().optional(),
  seasonEnd: z.string().datetime().optional(),
  priceCents: z.number().int().min(0).optional(),
  coachId: z.string().cuid().optional(),
  courtId: z.string().cuid().nullable().optional(),
  description: z.string().optional(),
});

export async function updateLessonGroup(groupId: string, patch: z.infer<typeof updateLessonGroupSchema>): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const validated = updateLessonGroupSchema.safeParse(patch);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const data = validated.data;

  // Vérifier que le groupe appartient au club
  const existing = await db.lessonGroup.findFirst({
    where: { id: groupId, clubId: club.id },
  });
  if (!existing) {
    return { success: false, error: 'Cours introuvable.' };
  }

  // Vérifier le coach si changé
  if (data.coachId) {
    const coach = await db.coach.findFirst({
      where: { id: data.coachId, clubId: club.id, isActive: true },
    });
    if (!coach) {
      return { success: false, error: 'Coach introuvable ou inactif.' };
    }
  }

  // Vérifier le court si changé
  if (data.courtId !== undefined) {
    if (data.courtId) {
      const court = await db.court.findFirst({
        where: { id: data.courtId, clubId: club.id, isActive: true },
      });
      if (!court) {
        return { success: false, error: 'Terrain introuvable ou inactif.' };
      }
    }
  }

  try {
    await db.lessonGroup.update({
      where: { id: groupId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.audience && { audience: data.audience }),
        ...(data.level && { level: data.level }),
        ...(data.capacity && { capacity: data.capacity }),
        ...(data.weekday !== undefined && { weekday: data.weekday }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.durationMinutes && { durationMinutes: data.durationMinutes }),
        ...(data.seasonStart && { seasonStart: new Date(data.seasonStart) }),
        ...(data.seasonEnd && { seasonEnd: new Date(data.seasonEnd) }),
        ...(data.priceCents !== undefined && { priceCents: data.priceCents }),
        ...(data.coachId && { coachId: data.coachId }),
        ...(data.courtId !== undefined && { courtId: data.courtId }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    revalidatePath('/club/cours');
    revalidatePath(`/club/cours/${groupId}`);
    return { success: true };
  } catch {
    return { success: false, error: 'Erreur lors de la mise à jour du cours.' };
  }
}

export async function publishLessonGroup(groupId: string): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const group = await db.lessonGroup.findFirst({
    where: { id: groupId, clubId: club.id },
  });
  if (!group) {
    return { success: false, error: 'Cours introuvable.' };
  }

  try {
    // Passer en PUBLISHED
    await db.lessonGroup.update({
      where: { id: groupId },
      data: { status: 'PUBLISHED' },
    });

    // Générer les sessions
    await regenerateSessionsForGroup(groupId);

    revalidatePath('/club/cours');
    revalidatePath(`/club/cours/${groupId}`);
    return { success: true };
  } catch {
    return { success: false, error: 'Erreur lors de la publication du cours.' };
  }
}

export async function archiveLessonGroup(groupId: string): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const group = await db.lessonGroup.findFirst({
    where: { id: groupId, clubId: club.id },
  });
  if (!group) {
    return { success: false, error: 'Cours introuvable.' };
  }

  try {
    await db.lessonGroup.update({
      where: { id: groupId },
      data: { status: 'ARCHIVED' },
    });

    revalidatePath('/club/cours');
    revalidatePath(`/club/cours/${groupId}`);
    return { success: true };
  } catch {
    return { success: false, error: 'Erreur lors de l\'archivage du cours.' };
  }
}

/* ── Helper génération sessions ───────────────────────────────────────────── */

export async function regenerateSessionsForGroup(groupId: string) {
  const group = await db.lessonGroup.findUnique({
    where: { id: groupId },
  });
  if (!group) throw new Error('Groupe introuvable.');

  const { weekday, startTime, durationMinutes, seasonStart, seasonEnd } = group;
  const [hours, minutes] = startTime.split(':').map(Number);

  // Calculer toutes les dates entre seasonStart et seasonEnd qui correspondent au weekday
  const sessions: Array<{ groupId: string; date: Date; durationMinutes: number }> = [];
  const current = new Date(seasonStart);
  const end = new Date(seasonEnd);

  // Aligner sur le bon weekday
  const targetWeekday = weekday; // 0 = dimanche, 1 = lundi, ...
  while (current.getDay() !== targetWeekday) {
    current.setDate(current.getDate() + 1);
  }

  while (current <= end) {
    // Créer la date avec l'heure exacte
    const sessionDate = new Date(current);
    sessionDate.setHours(hours, minutes, 0, 0);

    sessions.push({
      groupId,
      date: sessionDate,
      durationMinutes,
    });

    // Avancer d'une semaine
    current.setDate(current.getDate() + 7);
  }

  // Récupérer les sessions existantes pour éviter les doublons
  const existingDates = await db.lessonSession.findMany({
    where: { groupId },
    select: { date: true },
  });
  const existingDateSet = new Set(
    existingDates.map(d => d.date.toISOString().split('T')[0])
  );

  // Créer uniquement les nouvelles sessions
  const newSessions = sessions.filter(
    s => !existingDateSet.has(s.date.toISOString().split('T')[0])
  );

  if (newSessions.length > 0) {
    await db.lessonSession.createMany({
      data: newSessions,
    });
  }

  return { created: newSessions.length, total: sessions.length };
}

/* ── Mutation session ─────────────────────────────────────────────────────── */

const cancelSessionSchema = z.object({
  reason: z.string().optional(),
});

export async function cancelLessonSession(sessionId: string, input: z.infer<typeof cancelSessionSchema>): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const validated = cancelSessionSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const session = await db.lessonSession.findFirst({
    where: {
      id: sessionId,
      group: { clubId: club.id },
    },
  });
  if (!session) {
    return { success: false, error: 'Session introuvable.' };
  }

  try {
    await db.lessonSession.update({
      where: { id: sessionId },
      data: {
        status: 'CANCELLED',
        cancelReason: validated.data.reason,
      },
    });

    revalidatePath('/club/cours');
    return { success: true };
  } catch {
    return { success: false, error: 'Erreur lors de l\'annulation de la session.' };
  }
}

const rescheduleSessionSchema = z.object({
  newDate: z.string().datetime(),
  newCourtId: z.string().cuid().optional(),
});

export async function rescheduleLessonSession(sessionId: string, input: z.infer<typeof rescheduleSessionSchema>): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const validated = rescheduleSessionSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const session = await db.lessonSession.findFirst({
    where: {
      id: sessionId,
      group: { clubId: club.id },
    },
  });
  if (!session) {
    return { success: false, error: 'Session introuvable.' };
  }

  // Vérifier le court si fourni
  if (validated.data.newCourtId) {
    const court = await db.court.findFirst({
      where: { id: validated.data.newCourtId, clubId: club.id, isActive: true },
    });
    if (!court) {
      return { success: false, error: 'Terrain introuvable ou inactif.' };
    }
  }

  try {
    await db.lessonSession.update({
      where: { id: sessionId },
      data: {
        date: new Date(validated.data.newDate),
        ...(validated.data.newCourtId && { courtId: validated.data.newCourtId }),
      },
    });

    revalidatePath('/club/cours');
    return { success: true };
  } catch {
    return { success: false, error: 'Erreur lors du report de la session.' };
  }
}

/* ── Inscription ──────────────────────────────────────────────────────────── */

const enrollPlayerSchema = z.object({
  playerProfileId: z.string().cuid(),
});

export async function enrollPlayerInGroup(groupId: string, input: z.infer<typeof enrollPlayerSchema>): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const validated = enrollPlayerSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const group = await db.lessonGroup.findFirst({
    where: { id: groupId, clubId: club.id },
    include: {
      enrollments: {
        where: { status: 'ACTIVE' },
      },
    },
  });
  if (!group) {
    return { success: false, error: 'Cours introuvable.' };
  }

  // Vérifier que le joueur est un membre actif du club
  const membership = await db.clubMembership.findFirst({
    where: {
      playerProfileId: validated.data.playerProfileId,
      clubId: club.id,
      isActive: true,
    },
  });
  if (!membership) {
    return { success: false, error: 'Le joueur n\'est pas un membre actif du club.' };
  }

  // Vérifier si déjà inscrit
  const existing = await db.lessonEnrollment.findUnique({
    where: {
      groupId_playerProfileId: {
        groupId,
        playerProfileId: validated.data.playerProfileId,
      },
    },
  });
  if (existing) {
    return { success: false, error: 'Le joueur est déjà inscrit à ce cours.' };
  }

  // Déterminer le statut (ACTIVE ou WAITING_LIST)
  const activeCount = group.enrollments.length;
  const status = activeCount < group.capacity ? 'ACTIVE' : 'WAITING_LIST';

  try {
    await db.lessonEnrollment.create({
      data: {
        groupId,
        playerProfileId: validated.data.playerProfileId,
        status,
      },
    });

    revalidatePath('/club/cours');
    revalidatePath(`/club/cours/${groupId}`);
    return { success: true };
  } catch {
    return { success: false, error: 'Erreur lors de l\'inscription.' };
  }
}

export async function unenrollPlayer(enrollmentId: string): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const enrollment = await db.lessonEnrollment.findFirst({
    where: {
      id: enrollmentId,
      group: { clubId: club.id },
    },
  });
  if (!enrollment) {
    return { success: false, error: 'Inscription introuvable.' };
  }

  try {
    await db.lessonEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    // Si c'était un ACTIVE, promouvoir le premier de la liste d'attente
    if (enrollment.status === 'ACTIVE') {
      const waitingList = await db.lessonEnrollment.findMany({
        where: {
          groupId: enrollment.groupId,
          status: 'WAITING_LIST',
        },
        orderBy: { enrolledAt: 'asc' },
        take: 1,
      });

      if (waitingList.length > 0) {
        await db.lessonEnrollment.update({
          where: { id: waitingList[0].id },
          data: { status: 'ACTIVE' },
        });
      }
    }

    revalidatePath('/club/cours');
    revalidatePath(`/club/cours/${enrollment.groupId}`);
    return { success: true };
  } catch {
    return { success: false, error: 'Erreur lors du désistement.' };
  }
}

/* ── Présences ───────────────────────────────────────────────────────────── */

const markAttendanceSchema = z.object({
  presents: z.array(
    z.object({
      playerProfileId: z.string().cuid(),
      present: z.boolean(),
    })
  ),
});

export async function markAttendance(sessionId: string, input: z.infer<typeof markAttendanceSchema>): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  const validated = markAttendanceSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const session = await db.lessonSession.findFirst({
    where: {
      id: sessionId,
      group: { clubId: club.id },
    },
  });
  if (!session) {
    return { success: false, error: 'Session introuvable.' };
  }

  try {
    // Upsert des présences
    for (const { playerProfileId, present } of validated.data.presents) {
      await db.lessonAttendance.upsert({
        where: {
          sessionId_playerProfileId: {
            sessionId,
            playerProfileId,
          },
        },
        create: {
          sessionId,
          playerProfileId,
          present,
        },
        update: {
          present,
        },
      });
    }

    revalidatePath('/club/cours');
    revalidatePath(`/club/cours/${session.groupId}`);
    return { success: true };
  } catch {
    return { success: false, error: 'Erreur lors de la saisie des présences.' };
  }
}
