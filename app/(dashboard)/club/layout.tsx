import { requireClubRole } from '@/lib/auth-guards';

/* Layout club — vérifie le rôle ; le statut d'approbation est géré par page. */
export default async function ClubLayout({ children }: { children: React.ReactNode }) {
  await requireClubRole();
  return <>{children}</>;
}
