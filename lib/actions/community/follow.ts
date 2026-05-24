'use server';

import { NotificationKind } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requirePlayerProfile } from '@/lib/community/player';
import { db } from '@/lib/db';

export type ToggleFollowResult =
  | { ok: true; following: boolean }
  | { error: 'unauthenticated' | 'self' | 'not_found' };

export async function getFollowState(targetPlayerProfileId: string) {
  const profile = await requirePlayerProfile();
  if (!profile) return { following: false, canFollow: false };

  if (profile.id === targetPlayerProfileId) {
    return { following: false, canFollow: false };
  }

  const follow = await db.follow.findUnique({
    where: {
      followerId_followedId: {
        followerId: profile.id,
        followedId: targetPlayerProfileId,
      },
    },
  });

  return { following: Boolean(follow), canFollow: true };
}

export async function toggleFollow(
  targetPlayerProfileId: string,
): Promise<ToggleFollowResult> {
  const profile = await requirePlayerProfile();
  if (!profile) return { error: 'unauthenticated' };

  if (profile.id === targetPlayerProfileId) {
    return { error: 'self' };
  }

  const target = await db.playerProfile.findUnique({
    where: { id: targetPlayerProfileId },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
  });
  if (!target) return { error: 'not_found' };

  const existing = await db.follow.findUnique({
    where: {
      followerId_followedId: {
        followerId: profile.id,
        followedId: targetPlayerProfileId,
      },
    },
  });

  if (existing) {
    await db.follow.delete({ where: { id: existing.id } });
    revalidatePath(`/joueur/${targetPlayerProfileId}`);
    return { ok: true, following: false };
  }

  await db.follow.create({
    data: { followerId: profile.id, followedId: targetPlayerProfileId },
  });

  const followerUser = await db.user.findUnique({
    where: { id: profile.userId },
    select: { firstName: true, lastName: true },
  });

  await db.notification.create({
    data: {
      userId: target.user.id,
      kind: NotificationKind.NEW_FOLLOWER,
      title: 'Nouveau follower',
      body: followerUser
        ? `${followerUser.firstName} ${followerUser.lastName} te suit.`
        : 'Un joueur te suit.',
      data: { followerPlayerProfileId: profile.id },
    },
  });

  revalidatePath(`/joueur/${targetPlayerProfileId}`);
  return { ok: true, following: true };
}
