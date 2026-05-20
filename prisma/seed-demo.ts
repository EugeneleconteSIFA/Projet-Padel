/**
 * SEED DÉMO — Jeu de données fictives pour la dev / preview.
 *
 * NE JAMAIS jouer en production.
 *
 * Insère :
 *   - 8 adresses + 8 clubs + 1 court padel par club
 *   - 8 tournois + 1 édition active par tournoi
 *
 * Tout est en `upsert` rejouable : on peut relancer sans casser la base.
 *
 * Usage :
 *   npm run db:seed:demo
 */

import {
  PrismaClient,
  TournamentFormat,
  TournamentGender,
  TournamentStatus,
  CourtKind,
  CourtSurface,
} from '@prisma/client';

const prisma = new PrismaClient();

/* ──────────────────────────────────────────────────────────────────────────
 * Données — alignées sur l'ancien mock pour préserver l'UI existante.
 * ────────────────────────────────────────────────────────────────────── */

type DemoTournament = {
  clubSlug: string;
  clubName: string;
  clubEmail: string;
  street: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  tournamentSlug: string;
  tournamentName: string;
  description: string;
  format: TournamentFormat;
  gender: TournamentGender;
  category: string;
  surface: 'indoor' | 'outdoor';
  startDate: string; // ISO datetime
  endDate: string;   // ISO datetime
  registrationClosesAt: string;
  maxTeams: number;
  priceCents: number;
  status: TournamentStatus;
};

const DEMOS: DemoTournament[] = [
  {
    clubSlug: 'padel-club-loos',
    clubName: 'Padel Club Loos',
    clubEmail: 'contact@padelclubloos.fr',
    street: '42 rue de la République',
    city: 'Loos',
    postalCode: '59120',
    latitude: 50.6075,
    longitude: 3.0195,
    tournamentSlug: 'open-de-loos-mai-2026',
    tournamentName: 'Open de Loos · Mai',
    description:
      'Tournoi mixte P100 en salle. Format poules de 4 équipes puis tableau final. Idéal pour les joueurs de niveau intermédiaire souhaitant découvrir la compétition dans une ambiance conviviale. Buvette sur place.',
    format: TournamentFormat.POOLS_PLUS_BRACKET,
    gender: TournamentGender.MIXED,
    category: 'P100',
    surface: 'indoor',
    startDate: '2026-05-17T09:00:00+02:00',
    endDate: '2026-05-17T18:00:00+02:00',
    registrationClosesAt: '2026-05-15T23:59:00+02:00',
    maxTeams: 16,
    priceCents: 4000,
    status: TournamentStatus.REGISTRATION_OPEN,
  },
  {
    clubSlug: 'padel-roubaix',
    clubName: 'Padel Roubaix',
    clubEmail: 'tournois@padelroubaix.fr',
    street: '18 avenue des Nations',
    city: 'Roubaix',
    postalCode: '59100',
    latitude: 50.6942,
    longitude: 3.1746,
    tournamentSlug: 'tournoi-de-roubaix-mai-2026',
    tournamentName: 'Tournoi de Roubaix',
    description:
      'Open masculin P250 en plein air. Tableau à élimination directe sur 4 terrains. Niveau homologué FFT requis. Arbitrage assuré par des juges-arbitres fédéraux.',
    format: TournamentFormat.SINGLE_ELIMINATION,
    gender: TournamentGender.MEN,
    category: 'P250',
    surface: 'outdoor',
    startDate: '2026-05-17T10:00:00+02:00',
    endDate: '2026-05-17T18:00:00+02:00',
    registrationClosesAt: '2026-05-14T23:59:00+02:00',
    maxTeams: 16,
    priceCents: 6000,
    status: TournamentStatus.REGISTRATION_OPEN,
  },
  {
    clubSlug: 'padel-metropole',
    clubName: 'Padel Métropole',
    clubEmail: 'open@padelmetropole.fr',
    street: '1 boulevard de Tournai',
    city: 'Lille',
    postalCode: '59000',
    latitude: 50.6292,
    longitude: 3.0573,
    tournamentSlug: 'hauts-de-france-open-2026',
    tournamentName: 'Hauts-de-France Open',
    description:
      'Grand tournoi féminin P500 sur 2 jours. Format poules + tableau avec consolante. Le plus grand open féminin de la métropole lilloise. Présence de joueuses classées au niveau national.',
    format: TournamentFormat.CONSOLATION,
    gender: TournamentGender.WOMEN,
    category: 'P500',
    surface: 'indoor',
    startDate: '2026-05-17T08:00:00+02:00',
    endDate: '2026-05-18T18:00:00+02:00',
    registrationClosesAt: '2026-05-12T23:59:00+02:00',
    maxTeams: 16,
    priceCents: 8000,
    status: TournamentStatus.REGISTRATION_OPEN,
  },
  {
    clubSlug: 'tpc-valenciennes',
    clubName: 'Tennis Padel Club Valenciennes',
    clubEmail: 'tpcvalenciennes@gmail.com',
    street: '5 rue du Stade',
    city: 'Valenciennes',
    postalCode: '59300',
    latitude: 50.3574,
    longitude: 3.5237,
    tournamentSlug: 'cup-valenciennes-mai-2026',
    tournamentName: 'Cup Valenciennes',
    description:
      'Tournoi P100 masculin en salle. Petit format 8 équipes, ambiance familiale. Parfait pour les débutants en compétition. Prix attractif et organisation soignée.',
    format: TournamentFormat.POOLS_PLUS_BRACKET,
    gender: TournamentGender.MEN,
    category: 'P100',
    surface: 'indoor',
    startDate: '2026-05-24T09:30:00+02:00',
    endDate: '2026-05-24T15:00:00+02:00',
    registrationClosesAt: '2026-05-22T23:59:00+02:00',
    maxTeams: 8,
    priceCents: 3500,
    status: TournamentStatus.REGISTRATION_OPEN,
  },
  {
    clubSlug: 'padel-arras',
    clubName: 'Padel Arras',
    clubEmail: 'grandprix@padelarras.fr',
    street: '12 route de Doullens',
    city: 'Arras',
    postalCode: '62000',
    latitude: 50.2929,
    longitude: 2.7812,
    tournamentSlug: 'grand-prix-arras-mai-2026',
    tournamentName: "Grand Prix d'Arras",
    description:
      'Grand Prix mixte P250 en plein air. Sur les courts panoramiques du Padel Arras. Restauration sur place, bonne ambiance garantie.',
    format: TournamentFormat.POOLS_PLUS_BRACKET,
    gender: TournamentGender.MIXED,
    category: 'P250',
    surface: 'outdoor',
    startDate: '2026-05-24T10:00:00+02:00',
    endDate: '2026-05-24T18:00:00+02:00',
    registrationClosesAt: '2026-05-21T23:59:00+02:00',
    maxTeams: 16,
    priceCents: 5000,
    status: TournamentStatus.REGISTRATION_OPEN,
  },
  {
    clubSlug: 'padel-douai',
    clubName: 'Padel Douai',
    clubEmail: 'padeldouai@gmail.com',
    street: '8 avenue Albert 1er',
    city: 'Douai',
    postalCode: '59500',
    latitude: 50.3715,
    longitude: 3.0794,
    tournamentSlug: 'open-douai-printemps-2026',
    tournamentName: 'Open Douai Printemps',
    description:
      "Tournoi d'initiation P25 pour les joueurs débutants. Format simple, encadrement assuré. Idéal pour se lancer dans la compétition sans pression.",
    format: TournamentFormat.SINGLE_ELIMINATION,
    gender: TournamentGender.MIXED,
    category: 'P25',
    surface: 'indoor',
    startDate: '2026-05-31T09:00:00+02:00',
    endDate: '2026-05-31T13:00:00+02:00',
    registrationClosesAt: '2026-05-29T23:59:00+02:00',
    maxTeams: 8,
    priceCents: 2500,
    status: TournamentStatus.REGISTRATION_OPEN,
  },
  {
    clubSlug: 'padel-le-touquet',
    clubName: 'Padel Le Touquet',
    clubEmail: 'open@padeltouquet.fr',
    street: '2 avenue du Golf',
    city: 'Le Touquet',
    postalCode: '62520',
    latitude: 50.5228,
    longitude: 1.5874,
    tournamentSlug: 'tournoi-du-touquet-mai-2026',
    tournamentName: 'Tournoi du Touquet',
    description:
      "Tournoi prestige P1000 au Touquet. L'un des tournois les plus relevés du Nord. Niveau national attendu, dotation exceptionnelle. Cadre balnéaire unique.",
    format: TournamentFormat.CONSOLATION,
    gender: TournamentGender.MEN,
    category: 'P1000',
    surface: 'indoor',
    startDate: '2026-05-31T09:00:00+02:00',
    endDate: '2026-05-31T19:00:00+02:00',
    registrationClosesAt: '2026-05-28T23:59:00+02:00',
    maxTeams: 16,
    priceCents: 12000,
    status: TournamentStatus.REGISTRATION_OPEN,
  },
  {
    clubSlug: 'padel-bethune',
    clubName: 'Padel Béthune',
    clubEmail: 'contact@padelbethune.fr',
    street: '30 rue de Lille',
    city: 'Béthune',
    postalCode: '62400',
    latitude: 50.5303,
    longitude: 2.6384,
    tournamentSlug: 'tournoi-bethune-ete-2026',
    tournamentName: 'Tournoi Béthune · Été',
    description:
      'Open estival P500 en plein air. Premier tournoi de la saison été à Béthune. Inscriptions ouvertes, toutes les places disponibles.',
    format: TournamentFormat.POOLS_PLUS_BRACKET,
    gender: TournamentGender.MEN,
    category: 'P500',
    surface: 'outdoor',
    startDate: '2026-06-07T10:00:00+02:00',
    endDate: '2026-06-07T18:30:00+02:00',
    registrationClosesAt: '2026-06-04T23:59:00+02:00',
    maxTeams: 16,
    priceCents: 7000,
    status: TournamentStatus.REGISTRATION_OPEN,
  },
];

async function main() {
  // Le sport "padel" doit déjà exister (cf. seed.ts référentiel)
  const padel = await prisma.sport.findUniqueOrThrow({ where: { slug: 'padel' } });

  for (const d of DEMOS) {
    // Adresse
    // On ne peut pas upsert par (street, postalCode) sans index unique,
    // donc on retrouve via une recherche, sinon on crée.
    const existingAddress = await prisma.address.findFirst({
      where: { street: d.street, postalCode: d.postalCode, city: d.city },
    });
    const address =
      existingAddress ??
      (await prisma.address.create({
        data: {
          street: d.street,
          city: d.city,
          postalCode: d.postalCode,
          country: 'FR',
          latitude: d.latitude,
          longitude: d.longitude,
        },
      }));

    // Club
    const club = await prisma.club.upsert({
      where: { slug: d.clubSlug },
      update: {
        name: d.clubName,
        email: d.clubEmail,
        addressId: address.id,
      },
      create: {
        slug: d.clubSlug,
        name: d.clubName,
        email: d.clubEmail,
        addressId: address.id,
      },
    });

    // Court padel principal — kind suit le terrain du tournoi
    const courtKind: CourtKind =
      d.surface === 'indoor' ? CourtKind.INDOOR : CourtKind.OUTDOOR;
    await prisma.court.upsert({
      where: { clubId_name: { clubId: club.id, name: 'Court 1' } },
      update: {
        kind: courtKind,
        surface: CourtSurface.ARTIFICIAL_GRASS,
        isActive: true,
      },
      create: {
        clubId: club.id,
        sportId: padel.id,
        name: 'Court 1',
        kind: courtKind,
        surface: CourtSurface.ARTIFICIAL_GRASS,
        isActive: true,
      },
    });

    // Tournament (modèle)
    const tournament = await prisma.tournament.upsert({
      where: { slug: d.tournamentSlug },
      update: {
        name: d.tournamentName,
        description: d.description,
        format: d.format,
        gender: d.gender,
        category: d.category,
        clubId: club.id,
        sportId: padel.id,
        isPublic: true,
      },
      create: {
        slug: d.tournamentSlug,
        name: d.tournamentName,
        description: d.description,
        format: d.format,
        gender: d.gender,
        category: d.category,
        clubId: club.id,
        sportId: padel.id,
        isPublic: true,
      },
    });

    // Édition active — on identifie par (tournamentId, startDate) en cherchant
    // sans index unique : si une édition existe pour la date, on update, sinon on crée.
    const startDate = new Date(d.startDate);
    const endDate = new Date(d.endDate);
    const regClose = new Date(d.registrationClosesAt);

    const existingEdition = await prisma.tournamentEdition.findFirst({
      where: { tournamentId: tournament.id, startDate },
    });

    if (existingEdition) {
      await prisma.tournamentEdition.update({
        where: { id: existingEdition.id },
        data: {
          endDate,
          registrationClosesAt: regClose,
          maxTeams: d.maxTeams,
          priceCents: d.priceCents,
          status: d.status,
        },
      });
    } else {
      await prisma.tournamentEdition.create({
        data: {
          tournamentId: tournament.id,
          startDate,
          endDate,
          registrationClosesAt: regClose,
          maxTeams: d.maxTeams,
          priceCents: d.priceCents,
          status: d.status,
          currency: 'EUR',
        },
      });
    }
  }

  console.log(`Seed démo terminé : ${DEMOS.length} tournois insérés / mis à jour.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
