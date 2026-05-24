'use server';

import { createPasswordResetToken, resetPasswordWithToken } from '@/lib/password-reset';
import type { ActionResult } from '@/lib/actions/auth';

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  const trimmed = email?.trim();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { success: false, error: 'Adresse email invalide.' };
  }

  try {
    await createPasswordResetToken(trimmed);
    return {
      success: true,
      message: 'Si un compte existe pour cet email, un lien a été envoyé.',
    };
  } catch {
    return { success: false, error: 'Impossible d\'envoyer l\'email. Réessayez plus tard.' };
  }
}

export async function confirmPasswordReset(
  email: string,
  token: string,
  password: string,
  confirmPassword: string,
): Promise<ActionResult> {
  if (!email?.trim() || !token?.trim()) {
    return { success: false, error: 'Lien invalide.' };
  }
  if (password.length < 8) {
    return { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }
  if (password !== confirmPassword) {
    return { success: false, error: 'Les mots de passe ne correspondent pas.' };
  }

  const result = await resetPasswordWithToken(email, token, password);
  if (!result.ok) {
    return { success: false, error: result.error };
  }

  return { success: true, message: 'Mot de passe mis à jour. Vous pouvez vous connecter.' };
}
