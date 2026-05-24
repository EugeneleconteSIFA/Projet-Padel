'use server';

import { PostMediaType, PostVisibility } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getOrCreatePlayerProfile } from '@/lib/community/player';
import { uploadToS3, isS3Configured } from '@/lib/storage/s3';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const MAX_CONTENT = 500;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function createClubAnnouncement(
  clubId: string,
  clubSlug: string,
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
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

  const content = String(formData.get('content') ?? '').trim();
  if (!content || content.length > MAX_CONTENT) {
    return { error: 'Texte entre 1 et 500 caractères.' };
  }

  const profile = await getOrCreatePlayerProfile(session.user.id);
  let mediaUrls: string[] = [];
  const image = formData.get('image');

  if (image instanceof File && image.size > 0) {
    if (!ALLOWED_TYPES.has(image.type)) {
      return { error: 'Format accepté : JPG, PNG ou WebP.' };
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return { error: 'Image max 5 Mo.' };
    }
    if (!isS3Configured()) {
      return { error: 'Upload indisponible.' };
    }
    const buffer = Buffer.from(await image.arrayBuffer());
    mediaUrls = [await uploadToS3(buffer, image.type, 'posts')];
  }

  await db.post.create({
    data: {
      authorId: profile.id,
      clubId,
      content,
      mediaUrls,
      mediaType: PostMediaType.IMAGE,
      visibility: PostVisibility.CLUB,
    },
  });

  revalidatePath(`/club/${clubSlug}/communaute`);
  revalidatePath(`/club/${clubSlug}/dashboard/communaute`);
  return { ok: true };
}

export async function deleteClubPost(
  postId: string,
  clubId: string,
  clubSlug: string,
): Promise<{ ok: true } | { error: string }> {
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

  await db.post.delete({ where: { id: postId } });

  revalidatePath(`/club/${clubSlug}/communaute`);
  revalidatePath(`/club/${clubSlug}/dashboard/communaute`);
  revalidatePath('/feed');
  return { ok: true };
}
