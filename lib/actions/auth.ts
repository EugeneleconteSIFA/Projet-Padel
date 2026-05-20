'use server';

import { signIn, signOut } from '@/lib/auth';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

/* =============================================================================
   Server Actions — authentification.
   Appelées directement depuis les composants client (login/signup pages).
   ============================================================================= */

/* ── Types ─────────────────────────────────────────────────────────────────── */

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

/* ── Connexion email + mot de passe ────────────────────────────────────────── */

export async function loginWithCredentials(
  email: string,
  password: string,
  callbackUrl = '/',
): Promise<ActionResult> {
  try {
    await signIn('credentials', { email, password, redirect: false });
    return { success: true };
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Email ou mot de passe incorrect.' };
        default:
          return { success: false, error: 'Une erreur est survenue. Réessayez.' };
      }
    }
    throw err; // re-throw les erreurs inattendues
  }
}

/* ── Magic link (Resend) ───────────────────────────────────────────────────── */

export async function loginWithMagicLink(email: string): Promise<ActionResult> {
  try {
    await signIn('resend', { email, redirect: false });
    return { success: true, message: 'Lien envoyé — vérifiez votre boîte mail.' };
  } catch (err) {
    if (err instanceof AuthError) {
      return { success: false, error: 'Impossible d\'envoyer le lien. Réessayez.' };
    }
    throw err;
  }
}

/* ── Inscription ───────────────────────────────────────────────────────────── */

export interface SignupData {
  firstName:  string;
  lastName:   string;
  email:      string;
  password:   string;
  city:       string;
  postalCode: string;
  role:       'PLAYER' | 'CLUB' | 'REFEREE';
  // Profil padel (optionnel selon le rôle)
  licenceFFT?:  string;
  classement?:  string;
  hand?:        string;
  side?:        string;
  lookingForPartner?: boolean;
}

export async function signup(data: SignupData): Promise<ActionResult> {
  /* 1. Vérif email unique */
  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { success: false, error: 'Un compte existe déjà avec cet email.' };
  }

  /* 2. Hash du mot de passe */
  const passwordHash = await hash(data.password, 12);

  /* 3. Création User */
  const user = await db.user.create({
    data: {
      email:        data.email,
      passwordHash,
      firstName:    data.firstName,
      lastName:     data.lastName,
      role:         data.role,
    },
  });

  /* 4. Création du profil selon le rôle */
  if (data.role === 'PLAYER') {
    await db.playerProfile.create({
      data: {
        userId:           user.id,
        lookingForPartner: data.lookingForPartner ?? false,
        // licenceFFT, classement, hand, side à ajouter quand le schéma les expose
      },
    });
  } else if (data.role === 'REFEREE') {
    await db.refereeProfile.create({ data: { userId: user.id } });
  } else if (data.role === 'CLUB') {
    // Crée le Club + ClubProfile dès l'inscription.
    // Le gérant met à jour le vrai nom dans /club/parametres.
    const slug = `${data.firstName}-${data.lastName}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-');

    const club = await db.club.create({
      data: {
        name:  `Club de ${data.firstName} ${data.lastName}`,
        slug,
        email: data.email,
      },
    });

    await db.clubProfile.create({
      data: { userId: user.id, clubId: club.id },
    });
  }

  /* 5. Retourne succès — le client appellera signIn('credentials') directement
     (signIn depuis une Server Action avec redirect:false ne pose pas le cookie) */
  return { success: true };
}

/* ── Déconnexion ────────────────────────────────────────────────────────────── */

export async function logout() {
  await signOut({ redirect: false });
  redirect('/');
}
