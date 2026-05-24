import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function getClubBySlug(slug: string) {
  return db.club.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, logoUrl: true },
  });
}

export async function getClubMemberAccess(clubId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { isMember: false, isClubOwner: false, playerProfileId: null as string | null };
  }

  const [clubProfile, playerProfile] = await Promise.all([
    session.user.role === 'CLUB'
      ? db.clubProfile.findUnique({
          where: { userId: session.user.id },
          select: { clubId: true },
        })
      : Promise.resolve(null),
    db.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    }),
  ]);

  const isClubOwner = clubProfile?.clubId === clubId;

  if (!playerProfile) {
    return { isMember: isClubOwner, isClubOwner, playerProfileId: null };
  }

  const membership = await db.clubMembership.findFirst({
    where: { clubId, playerProfileId: playerProfile.id, isActive: true },
  });

  return {
    isMember: Boolean(membership) || isClubOwner,
    isClubOwner,
    playerProfileId: playerProfile.id,
  };
}

export async function requireClubOwner(slug: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'CLUB') {
    return null;
  }

  const club = await getClubBySlug(slug);
  if (!club) return null;

  const clubProfile = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { clubId: true },
  });

  if (clubProfile?.clubId !== club.id) return null;

  return { club, session };
}
