import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/* =============================================================================
   Middleware Auth.js v5 — authentification uniquement (Edge-safe, sans DB).
   Le gating rôle + statut de validation est fait côté serveur (lib/auth-guards).
   ============================================================================= */

const PUBLIC_PATHS = [
  '/',
  '/vitrine',
  '/feed',
  '/matchs-amicaux',
  '/login',
  '/signup',
  '/mot-de-passe-oublie',
  '/reinitialiser-mot-de-passe',
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/tournois') ||
    pathname.startsWith('/forum') ||
    pathname.startsWith('/joueur/') ||
    pathname.startsWith('/post/') ||
    pathname === '/clubs' ||
    /^\/club\/[^/]+\/communaute$/.test(pathname) ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon');

  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!isPublic && !session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
