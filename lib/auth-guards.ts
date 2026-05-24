import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Session } from 'next-auth';

export async function requireClubRole(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'CLUB') redirect('/profil');
  return session;
}

export async function requireApprovedClub(): Promise<Session> {
  const session = await requireClubRole();
  const profile = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { validationStatus: true },
  });
  if (profile?.validationStatus !== 'APPROVED') redirect('/club/attente');
  return session;
}

export async function redirectApprovedClubFromAttente(): Promise<Session> {
  const session = await requireClubRole();
  const profile = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { validationStatus: true },
  });
  if (profile?.validationStatus === 'APPROVED') redirect('/club');
  return session;
}

export async function requireRefereeRole(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'REFEREE') redirect('/profil');
  return session;
}

export async function requireApprovedReferee(): Promise<Session> {
  const session = await requireRefereeRole();
  const profile = await db.refereeProfile.findUnique({
    where: { userId: session.user.id },
    select: { validationStatus: true },
  });
  if (profile?.validationStatus !== 'APPROVED') redirect('/arbitre/attente');
  return session;
}

export async function redirectApprovedRefereeFromAttente(): Promise<Session> {
  const session = await requireRefereeRole();
  const profile = await db.refereeProfile.findUnique({
    where: { userId: session.user.id },
    select: { validationStatus: true },
  });
  if (profile?.validationStatus === 'APPROVED') redirect('/arbitre');
  return session;
}
