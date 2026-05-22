import { db } from '@/lib/db';
import type { Session } from 'next-auth';

/* =============================================================================
   Helper de dispatch automatique selon rôle et statut de validation.
   Utilisé par le middleware et après connexion pour rediriger l'utilisateur.
   ============================================================================= */

export type DispatchResult =
  | { destination: '/'; reason: 'public' }
  | { destination: '/profil'; reason: 'player' }
  | { destination: '/club'; reason: 'club-approved' }
  | { destination: '/club/attente'; reason: 'club-pending' }
  | { destination: '/arbitre'; reason: 'referee-approved' }
  | { destination: '/arbitre/attente'; reason: 'referee-pending' };

/**
 * Détermine la destination de l'utilisateur selon son rôle et son statut de validation.
 * Si l'utilisateur n'est pas connecté, retourne l'accueil public.
 */
export async function getDispatchDestination(session: Session | null): Promise<DispatchResult> {
  // Utilisateur non connecté → accueil public
  if (!session?.user) {
    return { destination: '/', reason: 'public' };
  }

  const userId = session.user.id;
  const role = session.user.role;

  // Rôle PLAYER → toujours accès direct au profil
  if (role === 'PLAYER') {
    return { destination: '/profil', reason: 'player' };
  }

  // Rôle CLUB → vérifier le statut de validation
  if (role === 'CLUB') {
    const clubProfile = await db.clubProfile.findUnique({
      where: { userId },
      select: { validationStatus: true },
    });

    const status = clubProfile?.validationStatus ?? 'PENDING';

    if (status === 'APPROVED') {
      return { destination: '/club', reason: 'club-approved' };
    } else {
      // PENDING ou REJECTED → page d'attente
      return { destination: '/club/attente', reason: 'club-pending' };
    }
  }

  // Rôle REFEREE → vérifier le statut de validation
  if (role === 'REFEREE') {
    const refereeProfile = await db.refereeProfile.findUnique({
      where: { userId },
      select: { validationStatus: true },
    });

    const status = refereeProfile?.validationStatus ?? 'PENDING';

    if (status === 'APPROVED') {
      return { destination: '/arbitre', reason: 'referee-approved' };
    } else {
      // PENDING ou REJECTED → page d'attente
      return { destination: '/arbitre/attente', reason: 'referee-pending' };
    }
  }

  // Fallback → accueil public
  return { destination: '/', reason: 'public' };
}
