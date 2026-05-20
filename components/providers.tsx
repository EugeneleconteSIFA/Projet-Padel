'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

/* Wrapper client pour SessionProvider.
   On passe la session depuis le layout serveur pour éviter un flash
   "non connecté" au premier rendu côté client. */
export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session:  Session | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
