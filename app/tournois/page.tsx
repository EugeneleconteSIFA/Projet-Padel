import type { Metadata } from 'next';
import { listTournaments } from '@/lib/queries/tournaments';
import { TournamentsClient } from './tournaments-client';

export const metadata: Metadata = { title: 'Trouver un tournoi · The Court' };

// Revalide toutes les 60 secondes
export const revalidate = 60;

export default async function TournamentsPage() {
  const tournaments = await listTournaments();
  return <TournamentsClient tournaments={tournaments} />;
}
