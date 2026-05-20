/**
 * Queries Prisma — tournois publics.
 *
 * Adaptateurs : Prisma → forme `Tournament` (cf. lib/mock-tournaments.ts),
 * pour que les pages existantes consomment des données réelles sans renoncer
 * à leur typage de surface.
 */

import { prisma } from '@/lib/prisma';
import {
  TournamentFormat,
  TournamentGender,
  TournamentStatus,
  CourtKind,
  type Prisma,
} from '@prisma/client';
import type {
  Category,
  Format,
  Genre,
  Surface,
  Tournament,
} from '@/lib/mock-tournaments';

/* ──────────────────────────────────────────────────────────────────────────
 * Constantes
 * ────────────────────────────────────────────────────────────────────── */

// Centre du calcul de distance (V1 : Lille — V2 = position utilisateur)
const REFERENCE_LAT = 50.6292;
const REFERENCE_LNG = 3.0573;

/* ──────────────────────────────────────────────────────────────────────────
 * Helpers de mapping
 * ────────────────────────────────────────────────────────────────────── */

function mapGender(g: TournamentGender): Genre {
  switch (g) {
    case TournamentGender.MEN: return 'Hommes';
    case TournamentGender.WOMEN: return 'Femmes';
    case TournamentGender.MIXED: return 'Mixte';
  }
}

function mapFormat(f: TournamentFormat): Format {
  switch (f) {
    case TournamentFormat.SINGLE_ELIMINATION: return 'Élimination directe';
    case TournamentFormat.POOLS_PLUS_BRACKET: return 'Poules + tableau';
    case TournamentFormat.CONSOLATION: return 'Poules + consolante';
    // Formats non encore représentés côté UI — fallback générique.
    case TournamentFormat.POOLS_ONLY: return 'Poules + tableau';
    case TournamentFormat.AMERICANO: return 'Poules + tableau';
    case TournamentFormat.ROUND_ROBIN: return 'Poules + tableau';
  }
}

function mapSurface(kind: CourtKind | undefined): Surface {
  return kind === CourtKind.OUTDOOR ? 'outdoor' : 'indoor';
}

function isPaddingCategory(c: string | null): c is Category {
  return c === 'P25' || c === 'P100' || c === 'P250'
      || c === 'P500' || c === 'P1000' || c === 'P2000';
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatTime(d: Date): string {
  // Toujours en heure locale Europe/Paris pour cohérence
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(d);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Forme Prisma retenue
 * ────────────────────────────────────────────────────────────────────── */

const editionInclude = {
  tournament: {
    include: {
      club: {
        include: {
          address: true,
          courts: {
            where: { isActive: true },
            take: 1,
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  },
  registrations: {
    where: { status: 'CONFIRMED' as const },
    select: { id: true },
  },
} satisfies Prisma.TournamentEditionInclude;

type EditionRow = Prisma.TournamentEditionGetPayload<{ include: typeof editionInclude }>;

/* ──────────────────────────────────────────────────────────────────────────
 * Adapter
 * ────────────────────────────────────────────────────────────────────── */

function toDisplayTournament(row: EditionRow): Tournament | null {
  const t = row.tournament;
  const club = t.club;
  const address = club.address;
  if (!address?.latitude || !address.longitude) {
    // Sans coordonnées, on ne peut pas placer le tournoi sur la carte —
    // on filtre pour ne pas casser le rendu.
    return null;
  }

  const category: Category = isPaddingCategory(t.category) ? t.category : 'P100';
  const surface = mapSurface(club.courts[0]?.kind);
  const sameDay =
    row.startDate.toISOString().slice(0, 10) ===
    row.endDate.toISOString().slice(0, 10);

  return {
    id: t.slug,        // slug → URL publique /tournois/[slug]
    editionId: row.id, // CUID → écriture en base (inscriptions)
    name: t.name,
    club: club.name,
    city: address.city,
    address: [address.street, [address.postalCode, address.city].filter(Boolean).join(' ')]
      .filter(Boolean)
      .join(', '),
    distance: haversineKm(REFERENCE_LAT, REFERENCE_LNG, address.latitude, address.longitude),
    date: formatIsoDate(row.startDate),
    dateEnd: sameDay ? undefined : formatIsoDate(row.endDate),
    time: formatTime(row.startDate),
    category,
    genre: mapGender(t.gender),
    surface,
    price: Math.round(row.priceCents / 100),
    teams: row.registrations.length,
    maxTeams: row.maxTeams,
    format: mapFormat(t.format),
    description: t.description ?? '',
    schedule: [], // V2 : table TournamentScheduleSlot dédiée
    prizes: undefined, // V2 : champ dédié sur TournamentEdition
    contact: club.email ?? '',
    lat: address.latitude,
    lng: address.longitude,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * API publique
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Liste les tournois publics avec inscription ouverte ou bientôt ouverte.
 * Triés par date de début croissante.
 */
export async function listTournaments(): Promise<Tournament[]> {
  const rows = await prisma.tournamentEdition.findMany({
    where: {
      tournament: { isPublic: true },
      status: {
        in: [
          TournamentStatus.PUBLISHED,
          TournamentStatus.REGISTRATION_OPEN,
          TournamentStatus.REGISTRATION_CLOSED,
          TournamentStatus.RUNNING,
        ],
      },
    },
    include: editionInclude,
    orderBy: { startDate: 'asc' },
  });

  return rows
    .map(toDisplayTournament)
    .filter((t): t is Tournament => t !== null);
}

/**
 * Récupère une fiche tournoi par son slug (utilisé dans l'URL /tournois/[id]).
 * Retourne l'édition la plus proche / à venir.
 */
export async function getTournamentBySlug(slug: string): Promise<Tournament | null> {
  const row = await prisma.tournamentEdition.findFirst({
    where: {
      tournament: { slug, isPublic: true },
    },
    include: editionInclude,
    // édition la plus proche dans le futur, sinon la plus récente passée
    orderBy: { startDate: 'asc' },
  });

  return row ? toDisplayTournament(row) : null;
}

/**
 * Génère la liste des slugs pour `generateStaticParams`.
 */
export async function listTournamentSlugs(): Promise<string[]> {
  const rows = await prisma.tournament.findMany({
    where: { isPublic: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
