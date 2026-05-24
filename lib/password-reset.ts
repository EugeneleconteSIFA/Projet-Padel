import { createHash, randomBytes } from 'crypto';
import { Resend } from 'resend';
import { db } from '@/lib/db';

const RESET_PREFIX = 'password-reset:';
const RESET_TTL_MS = 60 * 60 * 1000; // 1 h

function resetIdentifier(email: string) {
  return `${RESET_PREFIX}${email.toLowerCase().trim()}`;
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function getAppUrl() {
  return (
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

function getResendClient() {
  const apiKey = process.env.AUTH_RESEND_KEY ?? process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function createPasswordResetToken(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  const user = await db.user.findUnique({
    where: { email: normalized },
    select: { id: true, passwordHash: true },
  });

  // Ne pas révéler si le compte existe ; ignorer les comptes sans mot de passe (OAuth seul)
  if (!user?.passwordHash) return;

  const rawToken = randomBytes(32).toString('hex');
  const identifier = resetIdentifier(normalized);
  const expires = new Date(Date.now() + RESET_TTL_MS);

  await db.verificationToken.deleteMany({ where: { identifier } });
  await db.verificationToken.create({
    data: {
      identifier,
      token: hashToken(rawToken),
      expires,
      userId: user.id,
    },
  });

  const resetUrl = `${getAppUrl()}/reinitialiser-mot-de-passe?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(normalized)}`;
  const from = process.env.EMAIL_FROM ?? 'The Court <noreply@thecourt.fr>';
  const resend = getResendClient();

  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[password-reset] Lien (Resend non configuré):', resetUrl);
    }
    return;
  }

  await resend.emails.send({
    from,
    to: normalized,
    subject: 'Réinitialisation de votre mot de passe — The Court',
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe sur The Court.</p>
      <p><a href="${resetUrl}">Choisir un nouveau mot de passe</a></p>
      <p>Ce lien expire dans une heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `,
    text: `Réinitialisez votre mot de passe : ${resetUrl}\n\nCe lien expire dans une heure.`,
  });
}

export async function resetPasswordWithToken(
  email: string,
  rawToken: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = email.toLowerCase().trim();
  const identifier = resetIdentifier(normalized);
  const tokenHash = hashToken(rawToken.trim());

  const record = await db.verificationToken.findFirst({
    where: { identifier, token: tokenHash },
    include: { user: { select: { id: true } } },
  });

  if (!record || record.expires < new Date()) {
    if (record) {
      await db.verificationToken.deleteMany({ where: { identifier } });
    }
    return { ok: false, error: 'Lien invalide ou expiré. Demandez un nouveau lien.' };
  }

  if (!record.user) {
    return { ok: false, error: 'Compte introuvable.' };
  }

  const { hash } = await import('bcryptjs');
  const passwordHash = await hash(newPassword, 12);

  await db.$transaction([
    db.user.update({
      where: { id: record.user.id },
      data: { passwordHash },
    }),
    db.verificationToken.deleteMany({ where: { identifier } }),
  ]);

  return { ok: true };
}
