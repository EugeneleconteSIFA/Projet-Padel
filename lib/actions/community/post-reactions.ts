'use server';

import { ReactionType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export type ToggleReactionResult =
  | { ok: true }
  | { error: 'unauthenticated' | 'not_found' | 'unknown' };

export async function toggleReaction(
  postId: string,
  type: ReactionType,
): Promise<ToggleReactionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'unauthenticated' };
  }

  const profile = await db.playerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return { error: 'unauthenticated' };
  }

  const post = await db.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return { error: 'not_found' };
  }

  const existing = await db.postReaction.findUnique({
    where: {
      postId_authorId_type: {
        postId,
        authorId: profile.id,
        type,
      },
    },
  });

  if (existing) {
    await db.postReaction.delete({ where: { id: existing.id } });
  } else {
    await db.postReaction.create({
      data: { postId, authorId: profile.id, type },
    });
  }

  revalidatePath('/feed');
  return { ok: true };
}
