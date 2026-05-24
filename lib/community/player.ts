import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function getOrCreatePlayerProfile(userId: string) {
  const existing = await db.playerProfile.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.playerProfile.create({ data: { userId } });
}

export async function requirePlayerProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return getOrCreatePlayerProfile(session.user.id);
}
