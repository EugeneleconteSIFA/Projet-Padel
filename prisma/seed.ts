/**
 * SEED — Données de référence rejouables.
 *
 * Règles :
 *   - Toutes les opérations sont des `upsert` : rejouer le seed n'écrase pas
 *     les données utilisateur et ne casse pas la base existante.
 *   - On insère uniquement le référentiel (sport, fédération, catégories).
 *   - Les comptes de démo vivent dans un seed séparé (seed-demo.ts) qu'on
 *     joue uniquement en local / preview, jamais en production.
 *
 * Usage :
 *   npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ---------------------------------------------------------------------------
  // Sports (POC = padel uniquement, mais on prépare le multi-sport)
  // ---------------------------------------------------------------------------
  const padel = await prisma.sport.upsert({
    where: { slug: 'padel' },
    update: { name: 'Padel', enabled: true },
    create: { slug: 'padel', name: 'Padel', enabled: true },
  });

  // Sports désactivés pour V1 mais présents dans le référentiel pour la suite
  for (const s of [
    { slug: 'tennis', name: 'Tennis' },
    { slug: 'badminton', name: 'Badminton' },
    { slug: 'tennis-de-table', name: 'Tennis de table' },
    { slug: 'squash', name: 'Squash' },
  ]) {
    await prisma.sport.upsert({
      where: { slug: s.slug },
      update: { name: s.name, enabled: false },
      create: { slug: s.slug, name: s.name, enabled: false },
    });
  }

  // ---------------------------------------------------------------------------
  // Fédérations
  // ---------------------------------------------------------------------------
  await prisma.federation.upsert({
    where: { slug: 'fft' },
    update: { name: 'Fédération Française de Tennis', country: 'FR' },
    create: { slug: 'fft', name: 'Fédération Française de Tennis', country: 'FR' },
  });

  // ---------------------------------------------------------------------------
  // Catégories de classement padel (FFT)
  // ---------------------------------------------------------------------------
  const categories = [
    { code: 'P25', label: 'P25', sortOrder: 10 },
    { code: 'P100', label: 'P100', sortOrder: 20 },
    { code: 'P250', label: 'P250', sortOrder: 30 },
    { code: 'P500', label: 'P500', sortOrder: 40 },
    { code: 'P1000', label: 'P1000', sortOrder: 50 },
    { code: 'P2000', label: 'P2000', sortOrder: 60 },
  ];

  for (const c of categories) {
    await prisma.rankingCategory.upsert({
      where: { sportId_code: { sportId: padel.id, code: c.code } },
      update: { label: c.label, sortOrder: c.sortOrder },
      create: {
        sportId: padel.id,
        code: c.code,
        label: c.label,
        sortOrder: c.sortOrder,
      },
    });
  }

  console.log('Seed terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
