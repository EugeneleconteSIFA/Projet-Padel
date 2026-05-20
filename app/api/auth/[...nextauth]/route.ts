import { handlers } from '@/lib/auth';

/* =============================================================================
   Route handler Auth.js v5.
   Gère GET /api/auth/[...nextauth] et POST /api/auth/[...nextauth] :
   signin, signout, callback, csrf, session, providers…
   ============================================================================= */

export const { GET, POST } = handlers;
