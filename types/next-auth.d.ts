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
      playerProfileId?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role?: 'PLAYER' | 'CLUB' | 'REFEREE' | 'ADMIN';
    tier?: 'FREE' | 'PREMIUM';
    playerProfileId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?:   string;
    role?: string;
    tier?: string;
    playerProfileId?: string | null;
  }
}
