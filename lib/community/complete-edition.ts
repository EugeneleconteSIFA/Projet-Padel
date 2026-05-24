// =============================================================================
// Finalisation d’une édition — COMPLETED + publication feed (non bloquant)
// =============================================================================

import { db } from '@/lib/db';
import { publishTournamentResultsToFeed } from '@/lib/community/tournament-feed';

/** Si tous les matchs sont terminés, passe l’édition en COMPLETED et publie le feed. */
export async function tryCompleteTournamentEdition(editionId: string): Promise<void> {
  const incomplete = await db.match.count({
    where: {
      tournamentEditionId: editionId,
      status: { not: 'completed' },
    },
  });

  if (incomplete > 0) return;

  const edition = await db.tournamentEdition.findUnique({
    where: { id: editionId },
    select: { status: true },
  });

  if (!edition || edition.status === 'COMPLETED' || edition.status === 'CANCELLED') {
    return;
  }

  await db.tournamentEdition.update({
    where: { id: editionId },
    data: { status: 'COMPLETED' },
  });

  try {
    await publishTournamentResultsToFeed(editionId);
  } catch (err) {
    console.error('[community] publishTournamentResultsToFeed failed', err);
  }
}
