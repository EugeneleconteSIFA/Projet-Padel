import { listTournaments } from '@/lib/queries/tournaments';
import HomePageClient from './home-page-client';

/* =============================================================================
   The Court — Page d'accueil (server component).
   Lit les tournois publics depuis Prisma puis délègue le rendu interactif
   au client component (filtres + carte).
   ============================================================================= */

export default async function HomePage() {
  const tournaments = await listTournaments();
  return <HomePageClient tournaments={tournaments} />;
}
