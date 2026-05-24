'use server';

import { NotificationKind } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export type PromotePostResult = { ok: true } | { error: string };

export async function promoteClubPost(
  postId: string,
  clubId: string,
  clubSlug: string,
): Promise<PromotePostResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'CLUB') {
    return { error: 'unauthenticated' };
  }

  const clubProfile = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { clubId: true },
  });
  if (clubProfile?.clubId !== clubId) {
    return { error: 'Accès refusé.' };
  }

  const post = await db.post.findUnique({
    where: { id: postId },
    select: { id: true, clubId: true },
  });
  if (!post || post.clubId !== clubId) {
    return { error: 'Post introuvable.' };
  }

  try {
    await db.$transaction(async tx => {
      const active = await tx.clubPromotedPost.findFirst({
        where: { clubId, activeUntil: { gt: new Date() } },
      });
      if (active) {
        throw new Error('PROMO_EXISTS');
      }

      const activeUntil = new Date();
      activeUntil.setDate(activeUntil.getDate() + 7);

      await tx.clubPromotedPost.create({
        data: {
          postId,
          clubId,
          activeUntil,
        },
      });

      await tx.post.update({
        where: { id: postId },
        data: { isPromoted: true, clubId },
      });

      const members = await tx.clubMembership.findMany({
        where: { clubId, isActive: true },
        include: { player: { include: { user: { select: { id: true } } } } },
      });

      for (const m of members) {
        await tx.notification.create({
          data: {
            userId: m.player.user.id,
            kind: NotificationKind.CLUB_PROMOTED_POST,
            title: 'Annonce club',
            body: 'Une nouvelle annonce a été publiée par votre club.',
            data: { postId, clubId },
          },
        });
      }
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'PROMO_EXISTS') {
      return { error: 'Un post est déjà promu cette semaine' };
    }
    return { error: 'Impossible de promouvoir ce post.' };
  }

  revalidatePath(`/club/${clubSlug}/communaute`);
  revalidatePath(`/club/${clubSlug}/dashboard/communaute`);
  revalidatePath('/feed');
  return { ok: true };
}
