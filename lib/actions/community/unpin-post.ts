'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export type UnpinPostResult = { ok: true } | { error: string };

export async function unpromoteClubPost(
  postId: string,
  clubId: string,
  clubSlug: string,
): Promise<UnpinPostResult> {
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

  await db.$transaction(async tx => {
    await tx.clubPromotedPost.deleteMany({ where: { postId } });
    await tx.post.update({
      where: { id: postId },
      data: { isPromoted: false },
    });
  });

  revalidatePath(`/club/${clubSlug}/communaute`);
  revalidatePath(`/club/${clubSlug}/dashboard/communaute`);
  revalidatePath('/feed');
  return { ok: true };
}
