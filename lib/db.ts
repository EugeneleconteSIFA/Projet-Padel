import { PrismaClient } from '@prisma/client';

/* =============================================================================
   Singleton Prisma Client.
   En développement, Next.js recharge le module à chaque hot-reload — sans
   ce singleton, on ouvrirait une nouvelle connexion BDD à chaque save.
   ============================================================================= */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
