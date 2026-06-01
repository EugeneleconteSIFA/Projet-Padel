import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDispatchDestination } from '@/lib/dispatch';
import LandingPageClient from './landing-page-client';

/* =============================================================================
   The Court — Accueil public.
   Visiteur et joueur : landing vitrine. Club / JA : dispatch vers leur espace.
   L'espace joueur connecté est sur /joueur.
   ============================================================================= */

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    const { destination } = await getDispatchDestination(session);
    if (destination !== '/') redirect(destination);
  }

  return <LandingPageClient />;
}
