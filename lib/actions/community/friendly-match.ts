'use server';

import { FriendlyMatchStatus, NotificationKind } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requirePlayerProfile } from '@/lib/community/player';
import { db } from '@/lib/db';

export type FriendlyMatchActionResult =
  | { ok: true }
  | { error: string };

export async function createFriendlyMatch(formData: FormData): Promise<FriendlyMatchActionResult> {
  const profile = await requirePlayerProfile();
  if (!profile) return { error: 'unauthenticated' };

  const city = String(formData.get('city') ?? '').trim();
  const dateStr = String(formData.get('date') ?? '');
  const levelMin = String(formData.get('levelMin') ?? '').trim() || null;
  const levelMax = String(formData.get('levelMax') ?? '').trim() || null;
  const spotsTotal = Number(formData.get('spotsTotal'));
  const description = String(formData.get('description') ?? '').trim() || null;
  const clubIdRaw = formData.get('clubId');
  const clubId = clubIdRaw ? String(clubIdRaw) : null;

  if (!city) return { error: 'La ville est obligatoire.' };
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime()) || date <= new Date()) {
    return { error: 'Choisissez une date future.' };
  }
  if (![2, 4].includes(spotsTotal)) {
    return { error: 'Nombre de places : 2 ou 4.' };
  }
  if (description && description.length > 300) {
    return { error: 'Description max 300 caractères.' };
  }

  if (clubId) {
    const membership = await db.clubMembership.findFirst({
      where: { playerProfileId: profile.id, clubId, isActive: true },
    });
    if (!membership) return { error: 'Club invalide.' };
  }

  const match = await db.friendlyMatch.create({
    data: {
      creatorId: profile.id,
      clubId,
      city,
      date,
      levelMin,
      levelMax,
      spotsTotal,
      spotsLeft: spotsTotal - 1,
      description,
      status: FriendlyMatchStatus.OPEN,
      participants: {
        create: { playerProfileId: profile.id },
      },
    },
  });

  revalidatePath('/matchs-amicaux');
  return { ok: true };
}

export async function joinFriendlyMatch(matchId: string): Promise<FriendlyMatchActionResult> {
  const profile = await requirePlayerProfile();
  if (!profile) return { error: 'unauthenticated' };

  try {
    const result = await db.$transaction(async tx => {
      const match = await tx.friendlyMatch.findUnique({
        where: { id: matchId },
        include: {
          creator: { include: { user: { select: { id: true } } } },
          participants: {
            include: { player: { include: { user: { select: { id: true } } } } },
          },
        },
      });

      if (!match) return { error: 'Match introuvable.' } as const;
      if (match.status !== FriendlyMatchStatus.OPEN) {
        return { error: 'Ce match n\'accepte plus d\'inscriptions.' } as const;
      }
      if (match.spotsLeft <= 0) {
        return { error: 'Plus de place disponible.' } as const;
      }

      const already = match.participants.some(p => p.playerProfileId === profile.id);
      if (already) return { error: 'Tu es déjà inscrit.' } as const;

      await tx.friendlyMatchParticipant.create({
        data: { matchId, playerProfileId: profile.id },
      });

      const updated = await tx.friendlyMatch.update({
        where: { id: matchId },
        data: { spotsLeft: { decrement: 1 } },
      });

      const joiner = await tx.user.findUnique({
        where: { id: profile.userId },
        select: { firstName: true, lastName: true },
      });

      await tx.notification.create({
        data: {
          userId: match.creator.user.id,
          kind: NotificationKind.FRIENDLY_MATCH_JOINED,
          title: 'Nouveau joueur sur ton match',
          body: joiner
            ? `${joiner.firstName} ${joiner.lastName} a rejoint ton match à ${match.city}.`
            : 'Un joueur a rejoint ton match.',
          data: { matchId },
        },
      });

      if (updated.spotsLeft <= 0) {
        await tx.friendlyMatch.update({
          where: { id: matchId },
          data: { status: FriendlyMatchStatus.FULL, spotsLeft: 0 },
        });

        const notifyIds = new Set<string>([
          match.creator.user.id,
          ...match.participants.map(p => p.player.user.id),
        ]);
        notifyIds.add(
          (await tx.user.findUnique({ where: { id: profile.userId }, select: { id: true } }))!.id,
        );

        for (const userId of notifyIds) {
          await tx.notification.create({
            data: {
              userId,
              kind: NotificationKind.FRIENDLY_MATCH_FULL,
              title: 'Match complet',
              body: `Le match amical à ${match.city} est complet.`,
              data: { matchId },
            },
          });
        }
      }

      return { ok: true } as const;
    });

    revalidatePath('/matchs-amicaux');
    if ('error' in result) return { error: result.error ?? 'Erreur inconnue.' };
    return { ok: true };
  } catch {
    return { error: 'Impossible de rejoindre le match. Réessayez.' };
  }
}
