import { requireRefereeRole } from '@/lib/auth-guards';

/* Layout arbitre — vérifie le rôle ; le statut d'approbation est géré par page. */
export default async function ArbitreLayout({ children }: { children: React.ReactNode }) {
  await requireRefereeRole();
  return <>{children}</>;
}
