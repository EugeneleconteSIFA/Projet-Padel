import type { DefaultSession } from 'next-auth';

/* =============================================================================
   Extension des types Auth.js v5.
   Ajoute id, role et tier dans session.user côté client et serveur.
   ============================================================================= */

type ValidationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

declare module 'next-auth' {
  interface Session {
    user: {
      id:   string;
      role: 'PLAYER' | 'CLUB' | 'REFEREE' | 'ADMIN';
      tier: 'FREE' | 'PREMIUM';
      validationStatus?: ValidationStatus;
    } & DefaultSession['user'];
  }

  interface User {
    role?: 'PLAYER' | 'CLUB' | 'REFEREE' | 'ADMIN';
    tier?: 'FREE' | 'PREMIUM';
    validationStatus?: ValidationStatus;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?:   string;
    role?: string;
    tier?: string;
    validationStatus?: ValidationStatus;
  }
}
