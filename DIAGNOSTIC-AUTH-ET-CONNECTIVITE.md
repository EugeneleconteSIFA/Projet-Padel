# Diagnostic connexion & connectivité — The Court

> **But du document** — Cartographie de l'état réel du site (routes + système d'auth) et **spec de correction prête pour Cursor**. Chaque problème : sévérité, cause racine, fichier exact, correction proposée.
> **Périmètre** — Analyse initiale (commit `54aa921`) + **implémentation appliquée** (24 mai 2026).
> **Date diagnostic** — 24 mai 2026 · **Date implémentation** — 24 mai 2026.

---

## 0. TL;DR — les 3 symptômes → leurs causes

| Symptôme rapporté | Cause racine principale | Sévérité |
|---|---|---|
| « Ça me redemande de me connecter alors que je le suis déjà » | **`trustHost` absent** côté NextAuth v5 sur VPS derrière reverse-proxy (+ pistes cookie/`AUTH_SECRET`/`AUTH_URL` en prod) | 🔴 Critique (prod) |
| « Des attentes d'approbation dans tous les sens » | **`validationStatus` figé dans le JWT** : lu une seule fois au login, jamais rafraîchi après l'approbation admin | 🔴 Critique |
| « Ça ne me demande pas de me connecter quand c'est sensé l'être » | **Failles de protection** : le middleware ne garde que `/club` et `/arbitre` exacts ; aucune page ne contrôle le rôle/statut côté serveur | 🔴 Critique |
| Bonus — « Mot de passe oublié » tombe sur une 404 | **Route cassée** : le lien pointe vers `/forgot-password`, la vraie page est `/mot-de-passe-oublie` (et elle n'est pas publique) | 🟠 Élevée |
| Bonus — Pages publiques `/tournois` et `/clubs` renvoient vers `/login` pour un visiteur déconnecté | **`PUBLIC_PATHS` incomplet** : `/tournois` (exact) et `/clubs` absents ; `startsWith('/tournois/')` exige le slash final | 🔴 Critique |

**Diagnostic d'ensemble** — le contrôle d'accès est aujourd'hui *éclaté* entre deux mécanismes incohérents :
1. le **middleware** (runtime Edge) qui lit le **statut figé du token** ;
2. des **gardes de page** (runtime Node) inconsistants — certains vérifient le rôle, **aucun** ne vérifie le statut de validation.

Résultat : deux sources de vérité qui se contredisent. La correction de fond (§6) consiste à **unifier le gating côté serveur (Node) avec lecture DB fraîche**, et à réduire le middleware à « connecté ou pas ».

---

## 1. Tableau récapitulatif des problèmes

| # | Problème | Fichier(s) | Sévérité | Type |
|---|---|---|---|---|
| C1 | Statut de validation figé dans le JWT → boucles d'attente après approbation | `lib/auth.ts`, `middleware.ts` | 🔴 Critique | Logique auth |
| C2 | Failles de protection : sous-routes club/arbitre non gardées, aucun contrôle de statut côté page | `middleware.ts`, `app/(dashboard)/**` | 🔴 Critique | Sécurité accès |
| C3 | `trustHost` absent (NextAuth v5 sur VPS) → sessions non reconnues en prod | `lib/auth.ts`, env | 🔴 Critique (prod) | Config prod |
| C4 | Lien « Mot de passe oublié » cassé : `/forgot-password` ≠ `/mot-de-passe-oublie`, route absente de `PUBLIC_PATHS` | `app/(auth)/login/page.tsx`, `middleware.ts`, `lib/auth.ts` | 🟠 Élevée | Routing |
| C12 | Pages publiques verrouillées : `/tournois` (exact) et `/clubs` redirigent vers `/login` pour les visiteurs non connectés | `middleware.ts` | 🔴 Critique | Routing/accès |
| C5 | `newUser: '/onboarding'` → route inexistante → 404 après magic link (nouveau compte) | `lib/auth.ts` | 🟠 Élevée | Routing |
| C6 | Double source de vérité : `lib/dispatch.ts` (lecture DB fraîche) jamais utilisé ; le login ne dispatch pas (push vers `/`) | `lib/dispatch.ts`, `app/(auth)/login/page.tsx` | 🟠 Élevée | Cohérence |
| C7 | Le middleware ne redirige pas l'utilisateur déjà connecté hors de `/login` et `/signup` | `middleware.ts` | 🟡 Moyenne | UX auth |
| C8 | Déconnexion des pages d'attente : `<form POST /api/auth/signout>` sans `csrfToken` → peut échouer en v5 | `app/(dashboard)/club/attente/page.tsx`, `arbitre/attente/page.tsx` | 🟡 Moyenne | Auth |
| C9 | Page « Mot de passe oublié » = mock (TODO), pas de vraie réinitialisation | `app/(auth)/mot-de-passe-oublie/page.tsx` | 🟡 Moyenne | Fonctionnalité incomplète |
| C10 | Identifiants Neon réels en clair dans `.env.example` (doit être un placeholder) | `.env.example` | 🔴 Sécurité | Secret exposé |
| C11 | Fichier orphelin `app/home-page-client.tsx` (jamais importé ; la home utilise `landing-page-client`) | `app/home-page-client.tsx` | ⚪ Nettoyage | Code mort |

---

## 2. Cartographie des routes (état réel)

### Routes publiques (pas d'auth)
`/` · `/vitrine` · `/tournois` · `/tournois/[id]` · `/clubs` · `/feed` · `/matchs-amicaux` · `/matchs-amicaux/nouveau` · `/forum` (+ `/forum/[categorie]`, `/forum/[categorie]/[threadId]`, `/forum/recherche`) · `/joueur/[id]` · `/post/[id]` · `/club/[slug]/communaute` · `/login` · `/signup` · `/mot-de-passe-oublie`

### Routes privées (auth requise)
- **Joueur** : `/profil`, `/profil/modifier`, `/mon-feed`
- **Club** : `/club`, `/club/attente`, `/club/tournoi/nouveau`, `/club/parametres`, `/club/stripe`, `/club/[slug]/dashboard/communaute`
- **Arbitre** : `/arbitre`, `/arbitre/attente`, `/arbitre/tournoi/[id]`
- **Admin** : `/admin/moderation`

### Incohérences de connectivité détectées
- 🔴 `/forgot-password` (lien dans login) **n'existe pas** — la page est `/mot-de-passe-oublie` (voir C4).
- 🔴 `/onboarding` (config NextAuth `newUser`) **n'existe pas** (voir C5).
- 🟠 `/matchs-amicaux` est **public** côté middleware mais nécessite une session pour publier (`/matchs-amicaux/nouveau` est listé public dans `PUBLIC_PATHS` via préfixe `/matchs-amicaux` ? non — seul `/matchs-amicaux` exact est public). À clarifier (voir §5).
- ⚪ `app/home-page-client.tsx` orphelin (voir C11).

---

## 3. Détail — Système de connexion (auth)

### C1 — 🔴 Statut de validation figé dans le JWT *(cause des « attentes d'approbation dans tous les sens »)*

**Fichiers** : `lib/auth.ts` (callback `jwt`) + `middleware.ts`

**Cause racine.** Dans `lib/auth.ts`, le callback `jwt` ne lit `validationStatus` en base **que lorsque `user` est défini**, c'est-à-dire **uniquement au moment du login** :

```ts
async jwt({ token, user }) {
  if (user) {                       // ← seulement au login
    ...
    if (user.role === 'CLUB') {
      const clubProfile = await db.clubProfile.findUnique({ ... });
      token.validationStatus = clubProfile?.validationStatus ?? 'PENDING';
    }
    ...
  }
  return token;
}
```

Ensuite, le token JWT conserve cette valeur **jusqu'à expiration ou reconnexion**. Le `middleware.ts` lit ce statut figé :

```ts
const validationStatus = (session.user as any).validationStatus;
```

**Conséquences concrètes :**
- Un club s'inscrit → `PENDING` gravé dans le token → l'admin **approuve** en base → mais le token dit toujours `PENDING` → le middleware renvoie en boucle vers `/club/attente`. **L'utilisateur reste bloqué en attente alors qu'il est approuvé.**
- Inversement, si un compte est rejeté/suspendu après coup, le token garde `APPROVED` → accès maintenu à tort.

**⚠️ Piège à éviter (Edge + Prisma).** Le réflexe « rafraîchir `validationStatus` à chaque appel `jwt` » **ne marche pas** ici : le middleware NextAuth v5 tourne sur le **runtime Edge**, où Prisma (`@/lib/db`) ne fonctionne pas. C'est précisément pour ça que le code actuel ne requête la DB qu'au login (runtime Node). La bonne correction est architecturale → **voir §6**.

**Correction recommandée** : sortir le gating de statut du middleware et le faire côté serveur (Node) avec lecture DB fraîche (réutilise `getDispatchDestination`). Détail complet en **§6**.

---

### C2 — 🔴 Failles de protection des routes *(cause de « ça ne me demande pas de me connecter quand c'est sensé l'être »)*

**Fichiers** : `middleware.ts` + toutes les pages sous `app/(dashboard)/`

**Constats vérifiés :**
1. `grep validationStatus app/` → **aucun résultat**. Aucune page ne contrôle le statut de validation. Le seul contrôle est dans le middleware (sur le token figé — cf. C1).
2. La branche « non validé » du middleware ne garde **que** `/club` et `/arbitre` **exacts** :

```ts
// CLUB non validé :
if (pathname === '/club' && !pathname.startsWith('/club/attente')) {
  return NextResponse.redirect(new URL('/club/attente', req.url));
}
```

→ Un club **non approuvé** accède librement à `/club/tournoi/nouveau`, `/club/parametres`, `/club/stripe` (ces chemins ne matchent ni `=== '/club'` ni `/club/attente` → ils tombent dans le `return NextResponse.next()` final).
3. Les sous-pages n'ont **aucun garde de rôle** côté serveur :

| Page | Contrôle `auth()` | Contrôle rôle | Contrôle statut |
|---|---|---|---|
| `(dashboard)/layout.tsx` | ✅ oui | ❌ non | ❌ non |
| `club/page.tsx` | ✅ oui | ✅ `=== 'CLUB'` | ❌ non |
| `club/tournoi/nouveau/page.tsx` | ❌ non* | ❌ non | ❌ non |
| `club/parametres/page.tsx` | ❌ non* | ❌ non | ❌ non |
| `club/stripe/page.tsx` | ❌ non* | ❌ non | ❌ non |
| `arbitre/page.tsx` | ❌ non* | ❌ non | ❌ non |
| `arbitre/tournoi/[id]/page.tsx` | ❌ non* | ❌ non | ❌ non |

\* seul le `(dashboard)/layout.tsx` protège l'accès « connecté ou pas ». **Donc n'importe quel utilisateur connecté** (un joueur, un arbitre, un club en attente) **peut atteindre `/club/parametres`, `/club/stripe`, `/club/tournoi/nouveau`, `/arbitre/tournoi/[id]`.**

**Correction** : gardes de rôle + statut côté serveur, idéalement via des layouts de section (`app/(dashboard)/club/layout.tsx`, `app/(dashboard)/arbitre/layout.tsx`). Détail en **§6**.

> ✅ Bon point : `app/admin/moderation/page.tsx` contrôle correctement `session.user.role !== 'ADMIN' → notFound()`. C'est le modèle à généraliser.

---

### C3 — 🔴 `trustHost` absent → sessions non reconnues en production *(cause probable de « ça me redemande de me connecter »)*

**Fichiers** : `lib/auth.ts` + variables d'environnement

**Constat.** `grep trustHost / AUTH_TRUST_HOST` → **aucun résultat** dans le code ni dans `.env`. Or le déploiement est un **VPS + PM2 derrière reverse-proxy** (`scripts/vps-deploy.sh` : `curl http://127.0.0.1:3000`, PM2, build Node standalone). NextAuth v5 (Auth.js) **rejette par défaut** les requêtes dont l'hôte n'est pas de confiance hors Vercel — ce qui casse la résolution de session dans le middleware et provoque des redirections vers `/login` alors que l'utilisateur est connecté.

**Correction** (dans `lib/auth.ts`) :

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,            // ← requis derrière reverse-proxy (VPS non-Vercel)
  adapter: PrismaAdapter(db),
  ...
});
```

Ou via env (au choix) : `AUTH_TRUST_HOST=true`.

**À vérifier aussi en prod (mêmes symptômes possibles) :**
- `AUTH_URL` doit pointer vers l'URL **publique HTTPS** exacte (ex. `https://thecourt.fr`), pas `http://localhost:3000`.
- `AUTH_SECRET` doit être **identique** entre le build et le runtime PM2, et réellement chargé par PM2 (vérifier `pm2 env <id>`). Un secret différent ⇒ JWT indécodable ⇒ déconnexion forcée.
- En HTTPS, le cookie de session prend le préfixe `__Secure-`. Si le proxy ne transmet pas `X-Forwarded-Proto: https`, le cookie peut être ignoré. Vérifier la conf nginx (`proxy_set_header X-Forwarded-Proto $scheme;`).

---

### C6 — 🟠 Double source de vérité + login qui ne dispatch pas

**Fichiers** : `lib/dispatch.ts`, `app/(auth)/login/page.tsx`

- `lib/dispatch.ts` expose `getDispatchDestination(session)` qui lit le **statut frais en DB** et renvoie la bonne destination (`/profil`, `/club`, `/club/attente`, `/arbitre`, `/arbitre/attente`). **Vérifié : ce helper n'est importé nulle part.** C'est du code mort — alors qu'il résout exactement le problème C1.
- Dans `login/page.tsx`, après `signIn('credentials', { redirect:false })`, on fait `router.push(callbackUrl)` avec `callbackUrl` défaut `'/'`. Donc après connexion, l'utilisateur atterrit sur l'accueil public, **jamais dispatché** vers son espace.

**Correction** : brancher `getDispatchDestination` après login (et le réutiliser dans les gardes serveur de §6) pour avoir **une seule source de vérité = la DB**.

---

### C8 — 🟡 Déconnexion des pages d'attente potentiellement cassée

**Fichiers** : `app/(dashboard)/club/attente/page.tsx`, `app/(dashboard)/arbitre/attente/page.tsx`

Les deux pages utilisent :

```tsx
<form action="/api/auth/signout" method="POST">
  <button type="submit">Se déconnecter</button>
</form>
```

En NextAuth v5, le POST `/api/auth/signout` attend un champ caché `csrfToken`. Un POST nu peut échouer (403/redirect). **Correction** : utiliser le même `LogoutButton` (server action `logout()` de `lib/actions/auth.ts`) que le reste de l'app, qui est déjà correct.

```tsx
import { LogoutButton } from '@/components/logout-button';
// ...
<LogoutButton />
```

---

## 4. Détail — Connectivité & routing

### C4 — 🟠 Lien « Mot de passe oublié » cassé

**Fichiers** : `app/(auth)/login/page.tsx` (ligne ~179), `middleware.ts`, `lib/auth.ts`

Trois incohérences sur la même fonctionnalité :
1. `login/page.tsx` : `<Link href="/forgot-password">` → **route inexistante** (la page est `app/(auth)/mot-de-passe-oublie/page.tsx` = `/mot-de-passe-oublie`).
2. `middleware.ts` : `PUBLIC_PATHS` contient `/forgot-password` (qui n'existe pas) **mais pas** `/mot-de-passe-oublie` → si on atteint la vraie page sans être connecté, le middleware **redirige vers `/login`**.
3. `lib/auth.ts` : le commentaire d'en-tête liste `/forgot-password` comme route publique.

**Correction** (choisir une convention — recommandé : garder l'URL FR existante) :

```ts
// login/page.tsx
<Link href="/mot-de-passe-oublie"> ... </Link>

// middleware.ts — PUBLIC_PATHS
const PUBLIC_PATHS = [
  '/', '/vitrine', '/feed', '/matchs-amicaux',
  '/login', '/signup', '/mot-de-passe-oublie',   // ← remplace /forgot-password
];
```

---

### C12 — 🔴 Pages publiques verrouillées pour les visiteurs déconnectés

**Fichier** : `middleware.ts` (`PUBLIC_PATHS` + `isPublic`)

`PUBLIC_PATHS` ne contient ni `/tournois` (la page de recherche, en chemin exact) ni `/clubs` (l'annuaire). Et la condition `pathname.startsWith('/tournois/')` **exige le slash final** : elle couvre `/tournois/123` mais **pas** `/tournois`. Conséquence : un visiteur **non connecté** qui clique sur « Tournois » ou « Clubs » dans le header public est **redirigé vers `/login`**.

Vérifié : `components/site-header.tsx` lie `/tournois`, `/clubs`, `/feed`, `/matchs-amicaux`, `/forum` → **2 liens sur 5 sont cassés** pour un visiteur déconnecté (`/tournois`, `/clubs`). De même, `/post/[id]` n'est pas public alors que la page utilise le header public.

**Correction** (dans `middleware.ts`) :

```ts
const isPublic =
  PUBLIC_PATHS.includes(pathname) ||
  pathname === '/tournois' || pathname.startsWith('/tournois/') ||
  pathname === '/clubs' ||
  pathname.startsWith('/post/') ||
  pathname.startsWith('/forum') ||
  pathname.startsWith('/joueur/') ||
  /^\/club\/[^/]+\/communaute$/.test(pathname) ||
  pathname.startsWith('/api/auth/') ||
  pathname.startsWith('/_next/') ||
  pathname.startsWith('/favicon');
```

(Déjà intégré dans le middleware réduit proposé en §6.)

### C5 — 🟠 `newUser: '/onboarding'` → 404

**Fichier** : `lib/auth.ts`

```ts
pages: {
  ...
  newUser: '/onboarding',   // ← aucune page /onboarding n'existe
}
```

Après une connexion par **magic link** créant un nouveau compte, NextAuth redirige vers `/onboarding` → 404.

**Correction** (au choix) :
- soit créer la page `app/onboarding/page.tsx` (parcours de complétion de profil) et l'ajouter à `PUBLIC_PATHS` (route accessible juste après création) ;
- soit, en attendant, pointer `newUser` vers une route existante : `newUser: '/profil/modifier'` (et retirer la ligne si on ne gère pas encore l'inscription par magic link).

---

### C7 — 🟡 Pas de redirection des utilisateurs déjà connectés hors des pages d'auth

**Fichier** : `middleware.ts`

Un utilisateur connecté qui navigue vers `/login` ou `/signup` voit quand même le formulaire (contribue au ressenti « ça me demande de me connecter alors que je le suis »).

**Correction** (à ajouter en tête de la logique `if (session)` du middleware) :

```ts
if (session && (pathname === '/login' || pathname === '/signup')) {
  // dispatch via le statut frais se fera côté serveur ;
  // ici on renvoie simplement vers l'accueil de l'espace
  return NextResponse.redirect(new URL('/', req.url));
}
```

---

### C9 — 🟡 « Mot de passe oublié » = mock

**Fichier** : `app/(auth)/mot-de-passe-oublie/page.tsx`

La page simule l'envoi (`setTimeout` + `// TODO : Server Action sendPasswordResetEmail(email)`). Aucune réinitialisation réelle. À brancher (Server Action + token Resend) pour que le site soit « hyper fonctionnel ». Tant que ce n'est pas fait, au minimum corriger le routing C4 pour que la page soit atteignable.

---

### C10 — 🔴 Secret en clair dans `.env.example`

**Fichier** : `.env.example`

`DATABASE_URL` et `DIRECT_URL` contiennent une **vraie URL Neon avec mot de passe** (`npg_...`). Un `.env.example` doit contenir des **placeholders**. Risque : credentials commités dans Git.

**Correction** :
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```
Puis **faire tourner (rotate) le mot de passe Neon** s'il a été poussé sur GitHub, et vérifier que `.env.example` ne contient plus aucun secret réel.

---

### C11 — ⚪ Fichier orphelin

**Fichier** : `app/home-page-client.tsx`

`HomePageClient` n'est importé nulle part (la home `app/page.tsx` rend `LandingPageClient`). Code mort à supprimer pour éviter la confusion lors des prochaines évolutions.

---

## 6. Correction de fond — architecture d'auth recommandée

**Principe : une seule source de vérité (la DB), un gating côté serveur (Node), un middleware réduit à l'authentification.**

Aujourd'hui le statut transite par le JWT (figé) et est lu sur l'Edge. On inverse : le middleware ne répond plus qu'à « connecté ou pas », et chaque espace protégé vérifie rôle + statut **frais en DB** dans son layout serveur.

### Étape 1 — Middleware réduit (Edge-safe, sans DB)

```ts
// middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/', '/vitrine', '/feed', '/matchs-amicaux',
  '/login', '/signup', '/mot-de-passe-oublie',
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

  // Connecté qui va sur une page d'auth → on le sort
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Non connecté sur une page privée → login
  if (!isPublic && !session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // PLUS de dispatch rôle/statut ici — c'est fait côté serveur (étape 2)
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

### Étape 2 — Gardes serveur par espace (lecture DB fraîche)

Créer un layout par espace qui réutilise `getDispatchDestination` (`lib/dispatch.ts`) — fini le code mort, fini le statut figé.

```tsx
// app/(dashboard)/club/layout.tsx  (NOUVEAU)
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDispatchDestination } from '@/lib/dispatch';

export default async function ClubLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'CLUB') redirect('/');

  const { destination } = await getDispatchDestination(session); // lit la DB
  // destination = '/club' (approuvé) ou '/club/attente' (PENDING/REJECTED)
  // La page /club/attente reste accessible ; tout le reste exige l'approbation.
  // → on autorise /club/attente, on bloque le reste si non approuvé.
  return <>{children}</>;
}
```

> Implémentation fine du garde : dans le layout, comparer le `pathname` (via `headers()`/segment) ; ou, plus simple et explicite, ajouter en tête de **chaque page club non-attente** un appel à un helper `requireApprovedClub()` qui `redirect('/club/attente')` si le statut DB ≠ `APPROVED`. Idem `requireApprovedReferee()` pour l'arbitre. C'est le modèle déjà appliqué (et correct) sur `admin/moderation`.

Helper proposé (`lib/auth-guards.ts`, NOUVEAU) :

```ts
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function requireApprovedClub() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'CLUB') redirect('/profil');
  const profile = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { validationStatus: true },
  });
  if (profile?.validationStatus !== 'APPROVED') redirect('/club/attente');
  return session;
}
// + requireApprovedReferee() sur le même modèle (refereeProfile → /arbitre/attente)
```

Puis en tête de `club/page.tsx`, `club/tournoi/nouveau/page.tsx`, `club/parametres/page.tsx`, `club/stripe/page.tsx` :

```ts
const session = await requireApprovedClub();
```

Et la page `/club/attente` redirige vers `/club` **si le statut DB est déjà APPROVED** (lecture fraîche), ce qui remplace la redirection middleware figée.

### Étape 3 — Nettoyer le JWT

Comme le statut n'est plus lu dans le middleware, on peut **retirer `validationStatus` du token** (`lib/auth.ts`, callback `jwt`) pour supprimer toute confusion. On garde `role` et `tier` (changent rarement). Si `tier` doit refléter un upgrade en temps réel, appliquer la même logique de lecture DB côté page.

### Étape 4 — Brancher le dispatch au login

Dans `login/page.tsx`, après `signIn(..., { redirect:false })` réussi, rediriger via le dispatch frais plutôt que vers `callbackUrl='/'` :

```ts
// si callbackUrl explicite (deep-link) → on l'honore ;
// sinon → dispatch selon rôle + statut DB
router.push(callbackUrl !== '/' ? callbackUrl : '/'); // puis le layout serveur dispatch
```

> Le plus robuste : laisser `router.push('/')` et **laisser le garde serveur de chaque espace faire le dispatch**. Un seul chemin de vérité.

**Bénéfices de cette architecture :**
- ✅ Le statut est **toujours frais** → fin des « attentes dans tous les sens » (C1).
- ✅ Toutes les sous-routes sont gardées rôle + statut (C2).
- ✅ Plus de Prisma sur l'Edge → robustesse accrue.
- ✅ `lib/dispatch.ts` redevient utile (fin du code mort, C6).

---

## 7. Checklist production (VPS)

À valider sur le serveur — ces points expliquent le plus probablement « ça me redemande de me connecter » :

- [ ] `trustHost: true` dans `lib/auth.ts` (ou `AUTH_TRUST_HOST=true`). **(C3)**
- [ ] `AUTH_URL=https://thecourt.fr` (URL publique HTTPS exacte, pas localhost).
- [ ] `AUTH_SECRET` identique build/runtime et bien chargé par PM2 (`pm2 env <id>` pour vérifier).
- [ ] nginx transmet `proxy_set_header X-Forwarded-Proto $scheme;` et `Host $host;` (sinon cookie `__Secure-` ignoré).
- [ ] `.env.example` sans secret réel + rotation du mot de passe Neon si déjà poussé. **(C10)**
- [ ] Après déploiement, tester le cycle complet : login club PENDING → page attente → approbation admin → **rechargement** → accès `/club` (doit marcher sans reconnexion une fois §6 appliqué).

---

## 8. Plan d'application proposé pour Cursor (priorisé)

**Lot 1 — Quick wins routing (≈30 min, faible risque)**
1. C4 : `login/page.tsx` `href="/mot-de-passe-oublie"` + `middleware.ts` `PUBLIC_PATHS`.
2. C5 : corriger/retirer `newUser`.
3. C7 : redirection des connectés hors `/login` `/signup`.
4. C11 : supprimer `app/home-page-client.tsx`.
5. C10 : nettoyer `.env.example`.
6. C12 : compléter `PUBLIC_PATHS` (`/tournois`, `/clubs`, `/post/`) dans le middleware.

**Lot 2 — Refonte du gating auth (cœur, ≈2-3 h)**
6. §6 étape 1 : middleware réduit.
7. §6 étapes 2-3 : `lib/auth-guards.ts` + gardes dans les pages club/arbitre + nettoyage `validationStatus` du JWT.
8. C8 : remplacer les `<form signout>` des pages d'attente par `<LogoutButton />`.
9. §6 étape 4 : dispatch au login.

**Lot 3 — Production (≈1 h)**
10. C3 + §7 : `trustHost`, vérifs env/nginx, test du cycle d'approbation de bout en bout.

**Lot 4 — Fonctionnalité (optionnel, hors « hyper fonctionnel » strict)**
11. C9 : vraie réinitialisation de mot de passe (Server Action + Resend).

---

---

## 9. Statut d'implémentation (24 mai 2026)

| # | Statut | Fichiers modifiés / créés |
|---|---|---|
| C1 | ✅ Fait | `lib/auth.ts` (JWT sans `validationStatus`), `middleware.ts` (sans dispatch statut) |
| C2 | ✅ Fait | `lib/auth-guards.ts`, layouts `club/**`, `arbitre/**`, gardes pages |
| C3 | ✅ Fait (code) | `lib/auth.ts` (`trustHost: true`) · **VPS** : checklist §7 + `scripts/verify-prod-auth.sh` |
| C4 | ✅ Fait | `login/page.tsx`, `middleware.ts` |
| C12 | ✅ Fait | `middleware.ts` (`/tournois`, `/clubs`, `/post/`) |
| C5 | ✅ Fait | `lib/auth.ts` (`newUser: '/profil/modifier'`) |
| C6 | ✅ Fait | `lib/dispatch.ts`, `getPostLoginDestination()`, `login/page.tsx`, `signup/page.tsx` |
| C7 | ✅ Fait | `middleware.ts` (redirect connectés hors `/login` `/signup`) |
| C8 | ✅ Fait | `club/attente`, `arbitre/attente` → `LogoutButton` |
| C9 | ✅ Fait | `lib/password-reset.ts`, `lib/actions/password-reset.ts`, `mot-de-passe-oublie/page.tsx`, `reinitialiser-mot-de-passe/page.tsx` |
| C10 | ✅ Fait | `.env.example` (placeholders) · **Action manuelle** : rotation Neon si secret commité |
| C11 | ✅ Fait | `app/home-page-client.tsx` supprimé |

**Clarification `/matchs-amicaux/nouveau`** — reste **privé** (seul `/matchs-amicaux` exact est public) ; la page `app/matchs-amicaux/nouveau/page.tsx` redirige vers `/login` si non connecté. ✅ Comportement attendu.

---

## 10. Tests à réaliser

Cocher au fur et à mesure des validations (local puis production).

### 10.1 — Routing & pages publiques (C4, C12, C7)

- [ ] **T1** — Visiteur déconnecté : `/tournois` s'affiche sans redirection vers `/login`
- [ ] **T2** — Visiteur déconnecté : `/clubs` s'affiche sans redirection vers `/login`
- [ ] **T3** — Visiteur déconnecté : `/tournois/[id]` (détail tournoi) accessible
- [ ] **T4** — Visiteur déconnecté : `/post/[id]` accessible
- [ ] **T5** — Visiteur déconnecté : `/feed`, `/forum`, `/matchs-amicaux` accessibles
- [ ] **T6** — Visiteur déconnecté : `/mot-de-passe-oublie` accessible (pas de redirect `/login`)
- [ ] **T7** — Page login : lien « Mot de passe oublié » → `/mot-de-passe-oublie` (pas de 404)
- [ ] **T8** — Utilisateur **connecté** : accès à `/login` ou `/signup` → redirection vers `/` (pas de formulaire en double)

### 10.2 — Protection des routes (C2)

- [ ] **T9** — Visiteur déconnecté : `/profil` → redirect `/login?callbackUrl=/profil`
- [ ] **T10** — Joueur connecté : `/club/parametres` → redirect (pas CLUB)
- [ ] **T11** — Club **PENDING** : `/club` → `/club/attente`
- [ ] **T12** — Club **PENDING** : `/club/tournoi/nouveau` → `/club/attente`
- [ ] **T13** — Club **PENDING** : `/club/parametres`, `/club/stripe` → `/club/attente`
- [ ] **T14** — Club **APPROVED** : `/club/attente` → `/club`
- [ ] **T15** — Arbitre **PENDING** : `/arbitre` → `/arbitre/attente` ; `/arbitre/tournoi/[id]` → `/arbitre/attente`
- [ ] **T16** — Arbitre **APPROVED** : `/arbitre/attente` → `/arbitre`
- [ ] **T17** — Visiteur déconnecté : `/matchs-amicaux/nouveau` → `/login?callbackUrl=...`

### 10.3 — Statut de validation & dispatch (C1, C6)

- [ ] **T18** — Inscription **club** : après signup → arrive sur `/club/attente` (pas `/club`)
- [ ] **T19** — Inscription **arbitre** : après signup → `/arbitre/attente`
- [ ] **T20** — Login **joueur** sans `callbackUrl` → `/profil`
- [ ] **T21** — Login **club approuvé** → `/club`
- [ ] **T22** — Login avec `callbackUrl=/tournois/xyz` → respecte le deep-link
- [ ] **T23** — **Cycle critique** : club PENDING → admin approuve en base → **F5 sur `/club/attente`** → redirect `/club` **sans reconnexion**
- [ ] **T24** — Admin rejette un club déjà connecté → rechargement → reste bloqué sur `/club/attente` (lecture DB fraîche)

### 10.4 — Mot de passe oublié (C9)

- [ ] **T25** — `/mot-de-passe-oublie` : soumission email valide → message « lien envoyé » (même si email inconnu)
- [ ] **T26** — Email reçu (Resend configuré : `AUTH_RESEND_KEY` ou `RESEND_API_KEY`) avec lien `/reinitialiser-mot-de-passe?token=…&email=…`
- [ ] **T27** — Lien valide : nouveau mot de passe enregistré → connexion avec nouveau MDP OK
- [ ] **T28** — Lien expiré (> 1 h) ou token invalide → message d'erreur + lien vers `/mot-de-passe-oublie`
- [ ] **T29** — Dev sans Resend : vérifier que le lien s'affiche dans les logs serveur (`[password-reset]`)

### 10.5 — Déconnexion & magic link (C5, C8)

- [ ] **T30** — `/club/attente` et `/arbitre/attente` : bouton « Se déconnecter » fonctionne (pas d'erreur 403)
- [ ] **T31** — Magic link nouveau compte : pas de 404 `/onboarding` → arrive sur `/profil/modifier` ou flux attendu

### 10.6 — Production VPS (C3, C10, §7)

- [ ] **T32** — Sur le serveur : `pm2 env the-court` → `AUTH_SECRET`, `AUTH_URL=https://thecourt.fr` présents
- [ ] **T33** — `curl -I https://thecourt.fr/login` : cookies/session OK après login navigateur
- [ ] **T34** — nginx : `proxy_set_header X-Forwarded-Proto $scheme;` et `Host $host;`
- [ ] **T35** — Lancer `./scripts/verify-prod-auth.sh` sur le VPS après déploiement
- [ ] **T36** — Si credentials Neon étaient dans Git : **rotation mot de passe** Neon + mise à jour `.env` serveur

### 10.7 — Régression rapide (smoke)

- [ ] **T37** — Header public (déconnecté) : les 5 liens (`/tournois`, `/clubs`, `/feed`, `/matchs-amicaux`, `/forum`) fonctionnent
- [ ] **T38** — Admin : `/admin/moderation` inaccessible aux non-ADMIN (`notFound` ou équivalent)
- [ ] **T39** — Déploiement : `npm run build` + `prisma migrate deploy` sans erreur

---

*Document généré à partir de l'analyse statique du codebase, puis mis à jour après implémentation. Les tests §10.6 (production) et la rotation Neon (C10) restent à valider manuellement sur le serveur.*
