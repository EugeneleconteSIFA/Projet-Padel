import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Resend from 'next-auth/providers/resend';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';

/* =============================================================================
   Auth.js v5 — configuration centrale.
   Providers :
   - Credentials (email + mot de passe hashé bcrypt)
   - Resend (magic link / email OTP)
   OAuth Google / Apple → V2
   ============================================================================= */

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

  session: {
    strategy: 'jwt',   // JWT pour Credentials ; database pour magic link
  },

  pages: {
    signIn:      '/login',
    signOut:     '/',
    error:       '/login',
    verifyRequest: '/login?verify=1',   // page "vérifie ta boîte mail"
    newUser:     '/onboarding',          // après magic link + nouveau compte
  },

  providers: [
    /* ── Email + mot de passe ─────────────────────────────────────────── */
    Credentials({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',        type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await compare(
          credentials.password as string,
          user.passwordHash,
        );
        if (!valid) return null;

        // Met à jour lastLoginAt
        await db.user.update({
          where: { id: user.id },
          data:  { lastLoginAt: new Date() },
        });

        return {
          id:    user.id,
          email: user.email,
          name:  `${user.firstName} ${user.lastName}`,
          role:  user.role,
          tier:  user.tier,
        };
      },
    }),

    /* ── Magic link (Resend) ──────────────────────────────────────────── */
    Resend({
      from: 'The Court <noreply@thecourt.fr>',
    }),
  ],

  callbacks: {
    /* Injecte role + tier + validationStatus dans le JWT */
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
        token.tier = user.tier;
        // Pour CLUB et REFEREE, on récupère le statut de validation
        if (user.role === 'CLUB' || user.role === 'REFEREE') {
          try {
            const db = (await import('@/lib/db')).db;
            if (user.role === 'CLUB') {
              const clubProfile = await db.clubProfile.findUnique({
                where: { userId: user.id },
                select: { validationStatus: true },
              });
              token.validationStatus = clubProfile?.validationStatus ?? 'PENDING';
            } else if (user.role === 'REFEREE') {
              const refereeProfile = await db.refereeProfile.findUnique({
                where: { userId: user.id },
                select: { validationStatus: true },
              });
              token.validationStatus = refereeProfile?.validationStatus ?? 'PENDING';
            }
          } catch (e) {
            // En cas d'erreur, on met PENDING par défaut
            token.validationStatus = 'PENDING';
          }
        }
      }
      return token;
    },

    /* Expose role + tier + validationStatus dans la session côté client */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id   = token.id as string;
        session.user.role = token.role as 'PLAYER' | 'CLUB' | 'REFEREE' | 'ADMIN';
        session.user.tier = token.tier as 'FREE' | 'PREMIUM';
        if (token.validationStatus) {
          session.user.validationStatus = token.validationStatus as 'PENDING' | 'APPROVED' | 'REJECTED';
        }
      }
      return session;
    },
  },
});
