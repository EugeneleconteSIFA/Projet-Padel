'use server';

import { PostMediaType, PostVisibility } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requirePlayerProfile } from '@/lib/community/player';
import { uploadToS3, isS3Configured } from '@/lib/storage/s3';
import { db } from '@/lib/db';

const MAX_CONTENT = 500;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type CreatePostResult = { ok: true } | { error: string };

export async function createPost(formData: FormData): Promise<CreatePostResult> {
  const profile = await requirePlayerProfile();
  if (!profile) return { error: 'unauthenticated' };

  const content = String(formData.get('content') ?? '').trim();
  const visibility = String(formData.get('visibility') ?? 'PUBLIC') as PostVisibility;
  const clubIdRaw = formData.get('clubId');
  const clubId = clubIdRaw ? String(clubIdRaw) : null;
  const image = formData.get('image');

  if (!content || content.length > MAX_CONTENT) {
    return { error: 'Le texte doit faire entre 1 et 500 caractères.' };
  }

  if (!['PUBLIC', 'FRIENDS', 'CLUB'].includes(visibility)) {
    return { error: 'Visibilité invalide.' };
  }

  if (visibility === PostVisibility.CLUB) {
    if (!clubId) return { error: 'Sélectionnez un club.' };
    const membership = await db.clubMembership.findFirst({
      where: { playerProfileId: profile.id, clubId, isActive: true },
    });
    if (!membership) return { error: 'Vous n\'êtes pas membre de ce club.' };
  }

  let mediaUrls: string[] = [];

  if (image instanceof File && image.size > 0) {
    if (!ALLOWED_TYPES.has(image.type)) {
      return { error: 'Format accepté : JPG, PNG ou WebP uniquement.' };
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return { error: 'Image trop lourde (max 5 Mo).' };
    }
    if (!isS3Configured()) {
      return { error: 'Upload temporairement indisponible.' };
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const url = await uploadToS3(buffer, image.type, 'posts');
    mediaUrls = [url];
  }

  await db.post.create({
    data: {
      authorId: profile.id,
      clubId: visibility === PostVisibility.CLUB ? clubId : null,
      content,
      mediaUrls,
      mediaType: PostMediaType.IMAGE,
      visibility,
    },
  });

  revalidatePath('/feed');
  revalidatePath('/mon-feed');
  return { ok: true };
}

export async function getAuthorClubOptions() {
  const profile = await requirePlayerProfile();
  if (!profile) return [];

  const memberships = await db.clubMembership.findMany({
    where: { playerProfileId: profile.id, isActive: true },
    include: { club: { select: { id: true, name: true } } },
    orderBy: { since: 'desc' },
  });

  return memberships.map(m => ({ id: m.club.id, name: m.club.name }));
}
