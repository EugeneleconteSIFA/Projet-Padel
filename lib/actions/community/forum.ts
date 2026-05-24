'use server';

import { ForumCategory, NotificationKind } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { categoryToSlug } from '@/lib/community/forum-categories';
import { getOrCreatePlayerProfile } from '@/lib/community/player';
import { db } from '@/lib/db';

export type ForumActionResult = { ok: true } | { error: string };

export async function createThread(input: {
  category: ForumCategory;
  title: string;
  content: string;
  tags: string[];
}): Promise<ForumActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'unauthenticated' };

  const profile = await getOrCreatePlayerProfile(session.user.id);
  const title = input.title.trim();
  const content = input.content.trim();

  if (title.length < 3 || title.length > 200) {
    return { error: 'Titre entre 3 et 200 caractères.' };
  }
  if (content.length < 1 || content.length > 5000) {
    return { error: 'Contenu entre 1 et 5000 caractères.' };
  }

  const thread = await db.$transaction(async tx => {
    const t = await tx.forumThread.create({
      data: {
        category: input.category,
        title,
        authorId: profile.id,
        tags: input.tags.slice(0, 5),
      },
    });
    await tx.forumReply.create({
      data: {
        threadId: t.id,
        authorId: profile.id,
        content,
      },
    });
    return t;
  });

  const slug = categoryToSlug(input.category);
  redirect(`/forum/${slug}/${thread.id}`);
}

export async function createReply(input: {
  threadId: string;
  parentId?: string;
  content: string;
  categorySlug: string;
}): Promise<ForumActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'unauthenticated' };

  const profile = await getOrCreatePlayerProfile(session.user.id);
  const content = input.content.trim();
  if (content.length < 1 || content.length > 5000) {
    return { error: 'Contenu invalide.' };
  }

  const thread = await db.forumThread.findUnique({
    where: { id: input.threadId },
    include: { author: { include: { user: { select: { id: true } } } } },
  });
  if (!thread) return { error: 'Thread introuvable.' };
  if (thread.isLocked) return { error: 'Ce thread est verrouillé.' };

  await db.forumReply.create({
    data: {
      threadId: input.threadId,
      parentId: input.parentId ?? null,
      authorId: profile.id,
      content,
    },
  });

  if (thread.author.user.id !== session.user.id) {
    await db.notification.create({
      data: {
        userId: thread.author.user.id,
        kind: NotificationKind.FORUM_REPLY_RECEIVED,
        title: 'Nouvelle réponse',
        body: `Quelqu'un a répondu à « ${thread.title.slice(0, 60)} »`,
        data: { threadId: thread.id },
      },
    });
  }

  revalidatePath(`/forum/${input.categorySlug}/${input.threadId}`);
  return { ok: true };
}

export async function voteReply(
  replyId: string,
  direction: 'up' | 'down',
  categorySlug: string,
  threadId: string,
): Promise<ForumActionResult> {
  const delta = direction === 'up' ? 1 : -1;
  await db.forumReply.update({
    where: { id: replyId },
    data: { votes: { increment: delta } },
  });
  revalidatePath(`/forum/${categorySlug}/${threadId}`);
  return { ok: true };
}

export async function pinThread(threadId: string, categorySlug: string): Promise<ForumActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: 'Accès refusé.' };
  }

  const thread = await db.forumThread.findUnique({
    where: { id: threadId },
    select: { isPinned: true },
  });
  if (!thread) return { error: 'Thread introuvable.' };

  await db.forumThread.update({
    where: { id: threadId },
    data: { isPinned: !thread.isPinned },
  });

  revalidatePath(`/forum/${categorySlug}`);
  revalidatePath(`/forum/${categorySlug}/${threadId}`);
  return { ok: true };
}
