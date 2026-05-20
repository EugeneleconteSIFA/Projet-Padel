'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/* =============================================================================
   Server Actions — espace club.
   ============================================================================= */

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

/* ── Helpers auth ────────────────────────────────────────────────────────── */

async function requireClub() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Non authentifié.');
  if (session.user.role !== 'CLUB') throw new Error('Accès réservé aux clubs.');

  const clubProfile = await db.clubProfile.findUnique({
    where:   { userId: session.user.id },
    include: { club: true },
  });

  return { session, clubProfile, club: clubProfile?.club ?? null };
}

/* ── Dashboard : données agrégées ───────────────────────────────────────── */

export async function getClubDashboard() {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return null;

  const [tournaments, recentRegistrations] = await Promise.all([
    db.tournament.findMany({
      where:   { clubId: club.id },
      include: {
        editions: {
          orderBy: { startDate: 'desc' },
          take: 1,
          include: {
            _count: { select: { registrations: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

    db.registration.findMany({
      where: {
        edition: { tournament: { clubId: club.id } },
        status: { not: 'WITHDRAWN' },
      },
      include: {
        edition: { include: { tournament: true } },
        team:    { include: { members: { include: { player: { include: { user: true } } } } } },
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { registeredAt: 'desc' },
      take: 10,
    }),
  ]);

  // KPIs
  const totalRevenueCents = recentRegistrations
    .flatMap(r => r.payments)
    .filter(p => p.status === 'SUCCEEDED')
    .reduce((sum, p) => sum + p.amountCents, 0);

  const totalRegistrations = tournaments.reduce(
    (sum, t) => sum + (t.editions[0]?._count?.registrations ?? 0),
    0,
  );

  return {
    club,
    tournaments,
    recentRegistrations,
    kpis: {
      totalTournaments:    tournaments.length,
      totalRegistrations,
      totalRevenueCents,
      publishedCount:      tournaments.filter(t =>
        t.editions[0] && ['PUBLISHED','REGISTRATION_OPEN','RUNNING'].includes(t.editions[0].status)
      ).length,
    },
  };
}

/* ── Création d'un tournoi ───────────────────────────────────────────────── */

export interface CreateTournamentData {
  name:          string;
  description?:  string;
  category:      string;
  gender:        'MIXED' | 'MEN' | 'WOMEN';
  format:        'SINGLE_ELIMINATION' | 'POOLS_PLUS_BRACKET' | 'CONSOLATION';
  startDate:     string;  // ISO
  endDate:       string;  // ISO
  regOpensAt?:   string;  // ISO
  regClosesAt?:  string;  // ISO
  maxTeams:      number;
  priceEuros:    number;
  publishNow:    boolean;
}

export async function createTournament(data: CreateTournamentData): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  // Récupère le sport Padel
  const sport = await db.sport.findFirst({ where: { name: { contains: 'adel' } } });
  if (!sport) return { success: false, error: 'Sport "Padel" introuvable dans la base.' };

  const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

  const tournament = await db.tournament.create({
    data: {
      clubId:      club.id,
      sportId:     sport.id,
      name:        data.name,
      slug,
      description: data.description || null,
      format:      data.format,
      gender:      data.gender,
      category:    data.category,
      isPublic:    true,
      editions: {
        create: {
          startDate:           new Date(data.startDate),
          endDate:             new Date(data.endDate),
          registrationOpensAt: data.regOpensAt  ? new Date(data.regOpensAt)  : null,
          registrationClosesAt: data.regClosesAt ? new Date(data.regClosesAt) : null,
          maxTeams:            data.maxTeams,
          priceCents:          Math.round(data.priceEuros * 100),
          status:              data.publishNow ? 'REGISTRATION_OPEN' : 'DRAFT',
        },
      },
    },
  });

  revalidatePath('/club');
  return { success: true, id: tournament.id };
}

/* ── Récupérer les paramètres du club ───────────────────────────────────── */

export async function getClubSettings() {
  const { club } = await requireClub();
  if (!club) return null;

  return db.club.findUnique({
    where:   { id: club.id },
    include: { address: true },
  });
}

/* ── Mettre à jour les paramètres du club ───────────────────────────────── */

export interface ClubSettingsData {
  name:        string;
  description: string;
  phone:       string;
  email:       string;
  websiteUrl:  string;
  street:      string;
  city:        string;
  postalCode:  string;
}

/* ── Inscriptions en temps réel ─────────────────────────────────────────── */

export async function getClubRegistrations() {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return null;

  const registrations = await db.registration.findMany({
    where: {
      edition: { tournament: { clubId: club.id } },
      status: { not: 'WITHDRAWN' },
    },
    include: {
      edition: {
        include: {
          tournament: { select: { name: true, category: true } }
        }
      },
      team: {
        include: {
          members: {
            include: {
              player: {
                include: {
                  user: { select: { firstName: true, lastName: true, email: true } }
                }
              }
            }
          }
        }
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { status: true, amountCents: true },
      },
    },
    orderBy: { registeredAt: 'desc' },
  });

  return registrations.map(reg => ({
    id: reg.id,
    tournamentName: reg.edition.tournament.name,
    category: (reg.edition.tournament.category ?? 'P100') as string,
    status: reg.status as string,
    registeredAt: reg.registeredAt.toISOString(),
    players: reg.team.members.map(m => ({
      name: `${m.player.user.firstName ?? ''} ${m.player.user.lastName ?? ''}`.trim() || m.player.user.email,
      email: m.player.user.email,
      isCaptain: m.isCaptain,
    })),
    paymentStatus: (reg.payments[0]?.status ?? null) as string | null,
    amountCents: reg.payments[0]?.amountCents ?? null,
  }));
}

export async function updateClubSettings(data: ClubSettingsData): Promise<ActionResult> {
  const { club } = await requireClub().catch(() => ({ club: null, clubProfile: null, session: null }));
  if (!club) return { success: false, error: 'Aucun club associé à ce compte.' };

  try {
    // Upsert de l'adresse
    let addressId = club.addressId;

    if (data.city && data.postalCode) {
      if (addressId) {
        await db.address.update({
          where: { id: addressId },
          data: {
            street:     data.street || null,
            city:       data.city,
            postalCode: data.postalCode,
          },
        });
      } else {
        const newAddress = await db.address.create({
          data: {
            street:     data.street || null,
            city:       data.city,
            postalCode: data.postalCode,
          },
        });
        addressId = newAddress.id;
      }
    }

    await db.club.update({
      where: { id: club.id },
      data: {
        name:        data.name,
        description: data.description || null,
        phone:       data.phone || null,
        email:       data.email || null,
        websiteUrl:  data.websiteUrl || null,
        addressId,
      },
    });

    revalidatePath('/club');
    revalidatePath('/club/parametres');
    return { success: true };
  } catch {
    return { success: false, error: 'Erreur lors de la mise à jour.' };
  }
}
