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
  trustHost: true,
  adapter: PrismaAdapter(db),

  session: {
    strategy: 'jwt',   // JWT pour Credentials ; database pour magic link
  },

  pages: {
    signIn:      '/login',
    signOut:     '/',
    error:       '/login',
    verifyRequest: '/login?verify=1',   // page "vérifie ta boîte mail"
    newUser:     '/profil/modifier',
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
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
        token.tier = user.tier;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id   = token.id as string;
        session.user.role = token.role as 'PLAYER' | 'CLUB' | 'REFEREE' | 'ADMIN';
        session.user.tier = token.tier as 'FREE' | 'PREMIUM';
      }
      return session;
    },
  },
});
