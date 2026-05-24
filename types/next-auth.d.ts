import type { DefaultSession } from 'next-auth';

/* =============================================================================
   Extension des types Auth.js v5.
   Ajoute id, role et tier dans session.user côté client et serveur.
   ============================================================================= */

declare module 'next-auth' {
  interface Session {
    user: {
      id:   string;
      role: 'PLAYER' | 'CLUB' | 'REFEREE' | 'ADMIN';
      tier: 'FREE' | 'PREMIUM';
    } & DefaultSession['user'];
  }

  interface User {
    role?: 'PLAYER' | 'CLUB' | 'REFEREE' | 'ADMIN';
    tier?: 'FREE' | 'PREMIUM';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?:   string;
    role?: string;
    tier?: string;
  }
}
