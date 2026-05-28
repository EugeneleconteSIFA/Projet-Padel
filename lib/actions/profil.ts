'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/* =============================================================================
   Server Actions — profil utilisateur.
   ============================================================================= */

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

/* ── Récupération du profil complet ─────────────────────────────────────── */

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.user.findUnique({
    where: { id: session.user.id },
    include: {
      playerProfile: {
        include: {
          licenses: { include: { federation: true } },
          favoriteClubs: { include: { club: true } },
        },
      },
      address: true,
    },
  });
}

/* ── Mise à jour identité ────────────────────────────────────────────────── */

export interface UpdateIdentityData {
  firstName: string;
  lastName:  string;
  phone?:    string;
  bio?:      string;
}

export async function updateIdentity(data: UpdateIdentityData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Non authentifié.' };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      firstName: data.firstName,
      lastName:  data.lastName,
      phone:     data.phone || null,
    },
  });

  if (data.bio !== undefined && session.user.role === 'PLAYER') {
    await db.playerProfile.upsert({
      where:  { userId: session.user.id },
      update: { bio: data.bio },
      create: { userId: session.user.id, bio: data.bio },
    });
  }

  revalidatePath('/profil');
  return { success: true };
}

/* ── Mise à jour profil padel ────────────────────────────────────────────── */

export interface UpdatePadelProfileData {
  dominantHand?:     'LEFT' | 'RIGHT' | 'AMBIDEXTROUS';
  preferredSide?:    'LEFT' | 'RIGHT' | 'BOTH';
  lookingForPartner?: boolean;
  estimatedLevel?:   string;
}

export async function updatePadelProfile(data: UpdatePadelProfileData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Non authentifié.' };

  await db.playerProfile.upsert({
    where:  { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  });

  revalidatePath('/profil');
  return { success: true };
}

/* ── Upload avatar (URL Scaleway S3) ─────────────────────────────────────── */

export async function updateAvatarUrl(url: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Non authentifié.' };

  await db.user.update({
    where: { id: session.user.id },
    data:  { avatarUrl: url },
  });

  revalidatePath('/profil');
  return { success: true };
}

/* ── Dashboard joueur : historique + stats ──────────────────────────────── */

export async function getPlayerDashboard() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const playerProfile = await db.playerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      registrationsAsLead: {
        where: { status: { not: 'WITHDRAWN' } },
        include: {
          edition: {
            include: {
              tournament: { include: { club: true } }
            }
          },
          team: {
            include: {
              members: {
                include: {
                  player: { include: { user: true } }
                }
              }
            }
          }
        },
        orderBy: { registeredAt: 'desc' },
        take: 20,
      }
    }
  });

  if (!playerProfile) return null;

  const now = new Date().toISOString().slice(0, 10);

  const history = playerProfile.registrationsAsLead.map(reg => {
    const partner = reg.team.members.find(m => m.playerProfileId !== playerProfile.id);
    const partnerUser = partner?.player?.user;
    const partnerName = partnerUser
      ? `${partnerUser.firstName ?? ''} ${partnerUser.lastName ?? ''}`.trim() || partnerUser.email
      : null;

    return {
      id: reg.id,
      tournamentName: reg.edition.tournament.name,
      clubName: reg.edition.tournament.club.name,
      date: reg.edition.startDate.toISOString().slice(0, 10),
      status: reg.status as string,
      category: (reg.edition.tournament.category ?? 'P100') as string,
      partnerName,
      editionId: reg.edition.id,
      slug: reg.edition.tournament.slug,
    };
  });

  const upcoming   = history.filter(h => h.status === 'CONFIRMED' && h.date >= now);
  const past       = history.filter(h => h.status === 'CONFIRMED' && h.date < now);
  const waitlisted = history.filter(h => h.status === 'WAITING_LIST');

  return {
    history,
    stats: {
      totalConfirmed: upcoming.length + past.length,
      upcoming:       upcoming.length,
      past:           past.length,
      waitlisted:     waitlisted.length,
    },
  };
}
