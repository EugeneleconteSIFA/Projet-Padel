import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/* =============================================================================
   Middleware Auth.js v5.
   Protège les routes privées (/profil, /dashboard, /club, /arbitre…).
   Dispatch automatique selon rôle et statut de validation.
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
  const session = req.auth;

  // Vérifier si la route est publique
  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/tournois/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon');

  // Si pas de session et route privée → rediriger vers login
  if (!isPublic && !session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si session existe, faire le dispatch automatique
  if (session) {
    const role = session.user.role;
    const validationStatus = (session.user as any).validationStatus;

    // Rôle PLAYER → toujours autorisé sur /profil
    if (role === 'PLAYER' && pathname === '/profil') {
      return NextResponse.next();
    }

    // Rôle CLUB
    if (role === 'CLUB') {
      if (validationStatus === 'APPROVED') {
        // Si validé, rediriger /club/attente vers /club
        if (pathname === '/club/attente') {
          return NextResponse.redirect(new URL('/club', req.url));
        }
        // Autoriser l'accès à /club
        if (pathname === '/club' || pathname.startsWith('/club/')) {
          return NextResponse.next();
        }
      } else {
        // Si non validé, rediriger /club vers /club/attente
        if (pathname === '/club' && !pathname.startsWith('/club/attente')) {
          return NextResponse.redirect(new URL('/club/attente', req.url));
        }
        // Autoriser l'accès à /club/attente
        if (pathname === '/club/attente') {
          return NextResponse.next();
        }
      }
    }

    // Rôle REFEREE
    if (role === 'REFEREE') {
      if (validationStatus === 'APPROVED') {
        // Si validé, rediriger /arbitre/attente vers /arbitre
        if (pathname === '/arbitre/attente') {
          return NextResponse.redirect(new URL('/arbitre', req.url));
        }
        // Autoriser l'accès à /arbitre
        if (pathname === '/arbitre' || pathname.startsWith('/arbitre/')) {
          return NextResponse.next();
        }
      } else {
        // Si non validé, rediriger /arbitre vers /arbitre/attente
        if (pathname === '/arbitre' && !pathname.startsWith('/arbitre/attente')) {
          return NextResponse.redirect(new URL('/arbitre/attente', req.url));
        }
        // Autoriser l'accès à /arbitre/attente
        if (pathname === '/arbitre/attente') {
          return NextResponse.next();
        }
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  /* Matcher global — exclut les fichiers statiques */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
