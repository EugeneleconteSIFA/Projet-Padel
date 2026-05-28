import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDispatchDestination } from '@/lib/dispatch';
import LandingPageClient from './landing-page-client';
import PlayerHome from './player-home';

/* =============================================================================
   The Court — Accueil.
   Visiteur : hub public. Joueur connecté : dashboard visuel.
   ============================================================================= */

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.role === 'PLAYER') {
    return <PlayerHome />;
  }

  if (session?.user) {
    const { destination } = await getDispatchDestination(session);
    if (destination !== '/') redirect(destination);
  }

  return <LandingPageClient />;
}
