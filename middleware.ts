import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/* =============================================================================
   Middleware Auth.js v5.
   Protège les routes privées (/profil, /dashboard, /club, /arbitre…).
   Routes publiques laissées ouvertes : /, /vitrine, /tournois/[id], /login,
   /signup, /api/auth/*, /forgot-password.
   ============================================================================= */

const PUBLIC_PATHS = [
  '/',
  '/vitrine',
  '/login',
  '/signup',
  '/forgot-password',
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/tournois/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon');

  if (!isPublic && !req.auth) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  /* Matcher global — exclut les fichiers statiques */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
