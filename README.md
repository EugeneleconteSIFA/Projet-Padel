# The Court

Plateforme tout-en-un pour les sports de raquette, padel d'abord. Pour le joueur, le club et le juge-arbitre.

> **Document de référence : [SPEC.md](./SPEC.md)** — toute évolution produit ou technique passe par lui.

---

## Livrables de la phase 0 (cadrage)

| Fichier | Rôle |
|---|---|
| [SPEC.md](./SPEC.md) | Spécification produit complète — vision, personas, parcours, fonctionnalités V1/V2/V3, hosting, règles BDD |
| [prisma/schema.prisma](./prisma/schema.prisma) | **Source de vérité** du modèle de données |
| [prisma/seed.ts](./prisma/seed.ts) | Seed de référence (sports, fédération, catégories de classement) |
| [db/init.sql](./db/init.sql) | Vue SQL dérivée (lecture seule, jamais source de vérité) |
| [branding/BRANDING.md](./branding/BRANDING.md) | Branding validé — nom The Court, direction Bandeja, principes visuels |
| [branding/design-tokens.css](./branding/design-tokens.css) | Tokens design validés (couleurs, typo, spacing, mode sombre) |
| [mockups/03-the-court-vitrine.html](./mockups/03-the-court-vitrine.html) | Mockup HTML standalone canonique — site vitrine The Court |
| [mockups/01-landing.html](./mockups/01-landing.html) | Mockup antérieur pré-branding — référence secondaire à réaligner |
| [mockups/02-dashboard-joueur.html](./mockups/02-dashboard-joueur.html) | Mockup antérieur pré-branding — dashboard joueur à réaligner |

Le scaffold Next.js + Prisma est en place et **l'application est implémentée** : auth, inscription 3 étapes, espaces joueur/club/arbitre, recherche tournoi + carte, module communauté et modération. Voir la section « État actuel du site » plus bas, et [DIAGNOSTIC-AUTH-ET-CONNECTIVITE.md](./DIAGNOSTIC-AUTH-ET-CONNECTIVITE.md) pour les points ouverts sur la connexion.

---

## Stack

- **Next.js 14+** (App Router, TypeScript strict)
- **Prisma** sur **PostgreSQL 16**
- **Auth.js v5** (NextAuth)
- **Tailwind CSS** + tokens via CSS variables
- **Stripe + Stripe Connect** pour les paiements
- **Resend** pour les emails transactionnels
- **Leaflet** pour la cartographie
- Voir [SPEC.md §6](./SPEC.md#6-stack-technique) pour le détail

---

## Source de vérité (code)

**Travailler uniquement dans ce dossier Google Drive** :

`Forge/Studio Forge/The Court.`

| Étape | Commande (depuis ce dossier) |
|---|---|
| Commit local | `git add .` puis `git commit -m "…"` |
| Publier sur GitHub | `git push origin main` |
| Déployer sur le VPS | SSH → `bash scripts/vps-deploy.sh` (voir ci-dessous) |

Le dépôt GitHub [`Projet-Padel`](https://github.com/EugeneleconteSIFA/Projet-Padel) est le **miroir distant** pour le VPS — pas le dossier `Documents/GitHub/PROJET PADEL/`.

> **Attention Google Drive + Git** : Drive peut corrompre `.git/` (fichiers dupliqués `… 2`, `… 3`). En cas d'erreur `unable to read` au push, supprimer `.git`, puis `git init`, `git add .`, `git commit`, `git remote add origin …`, `git push --force origin main`.

### Déploiement VPS (obligatoire après chaque push)

Sur le serveur, **ne pas utiliser `git pull` seul** si le VPS a des commits locaux (erreur « divergent branches »). Utiliser :

```bash
cd /var/www/the-court
bash scripts/vps-deploy.sh
```

Le script fait : `git reset --hard origin/main`, supprime `.next`, `npm run build`, redémarre PM2.

Ensuite dans le navigateur : rechargement forcé (`Cmd+Shift+R`) ou fenêtre privée.

Les erreurs **400** sur `/_next/static/…` viennent presque toujours d'un build obsolète ou d'un HTML en cache qui pointe vers d'anciens hashes de chunks.

---

## Démarrage développeur

### Prérequis
- Node ≥ 20
- PostgreSQL 16 (local via Docker ou base managée Neon/Supabase)
- Compte Stripe en mode test (V1)
- Compte Resend (V1)

### Installation
```bash
# 1. Variables d'environnement
cp .env.example .env.local
# remplir DATABASE_URL, AUTH_SECRET, etc.

# 2. Dépendances
npm install

# 3. Génération du client Prisma
npm run prisma:generate

# 4. Création de la base + migration initiale
npm run prisma:migrate -- --name init

# 5. Données de référence
npm run db:seed

# 6. Lancement dev
npm run dev
```

### Scripts utiles

| Commande | Effet |
|---|---|
| `npm run dev` | Next.js en mode dev sur `:3000` |
| `npm run build` | Build de production |
| `npm run typecheck` | Vérification TypeScript stricte |
| `npm run lint` | ESLint |
| `npm run prisma:studio` | UI graphique pour la base |
| `npm run prisma:migrate -- --name <nom>` | Nouvelle migration |
| `npm run db:seed` | Rejouer le seed de référence |
| `npm run db:reset` | **DESTRUCTIF** — réinitialise la base (dev uniquement) |

---

## Règles de gestion (lire avant tout prompt futur)

1. **Le schéma vit dans `prisma/schema.prisma`.** C'est la seule source. Toute autre représentation est dérivée.
2. **On ne recrée jamais la base.** Toute évolution passe par une migration Prisma nommée :
   ```bash
   npx prisma migrate dev --name ajout_table_xyz
   ```
3. **`db/init.sql` est en lecture seule** — il sert de doc, pas de source.
4. **`SPEC.md` est mis à jour** dès qu'une fonctionnalité ou un parcours change.
5. **Pas de doublon d'entité.** Avant d'en ajouter une, vérifier si une existante peut être étendue.

---

## Hosting recommandé (POC → production)

- **Phase POC** (0 à 200 utilisateurs actifs) → **Vercel** + **Neon Postgres**, ~0 à 50 €/mois
- **Phase MVP** (200 à 5 000 utilisateurs) → **Railway** ou **Render**, ~30 à 100 €/mois
- **Phase production** (5 000+ utilisateurs) → VPS Hetzner/Scaleway + **Coolify**, ~30 à 80 €/mois

Détails et trade-offs : [SPEC.md §7](./SPEC.md#7-hosting--recommandation).

---

---

## État actuel du site (mise à jour 24/05/2026)

POC implémenté et déployé (VPS + PM2, `thecourt.fr`).

**Implémenté**
- **Auth.js v5** : connexion email/mot de passe (bcrypt) + magic link (Resend) ; inscription 3 étapes (identité → profil padel → type de compte) ; création automatique du profil selon le rôle.
- **Espaces** : joueur (`/profil`, `/profil/modifier`, `/mon-feed`), club (`/club`, `/club/tournoi/nouveau`, `/club/parametres`, `/club/stripe`), arbitre (`/arbitre`, `/arbitre/tournoi/[id]`), admin (`/admin/moderation`).
- **Validation** : pages d'attente club/arbitre (`/club/attente`, `/arbitre/attente`).
- **Tournois** : recherche + carte Leaflet (`/tournois`), fiche (`/tournois/[id]`), annuaire clubs (`/clubs`).
- **Communauté** : feed public/privé, posts (`/post/[id]`), forum (`/forum/**`), matchs amicaux (`/matchs-amicaux`), follow, réactions, signalement + modération (club + admin), espaces communauté de club (`/club/[slug]/communaute`).
- **UI** : headers partagés (public + connecté par rôle), thème clair/sombre.

**Points ouverts — connexion & connectivité** — détail et corrections dans **[DIAGNOSTIC-AUTH-ET-CONNECTIVITE.md](./DIAGNOSTIC-AUTH-ET-CONNECTIVITE.md)** :
- 🔴 Statut de validation figé dans le JWT → redirections d'attente incohérentes après approbation admin.
- 🔴 Failles de protection : sous-routes club/arbitre non gardées côté serveur.
- 🔴 Pages publiques `/tournois` et `/clubs` qui renvoient vers `/login` pour les visiteurs déconnectés (`PUBLIC_PATHS` incomplet).
- 🔴 `trustHost` à activer pour NextAuth v5 sur VPS (sessions parfois non reconnues).
- 🟠 Lien « mot de passe oublié » cassé (`/forgot-password` ≠ `/mot-de-passe-oublie`).
- 🟠 `newUser: '/onboarding'` → route inexistante.
- 🟡 Réinitialisation de mot de passe encore en mock.

## Prochaines étapes

1. **Corriger la connexion & la connectivité** — appliquer [DIAGNOSTIC-AUTH-ET-CONNECTIVITE.md](./DIAGNOSTIC-AUTH-ET-CONNECTIVITE.md) (lots 1 à 3).
2. **Brancher la réinitialisation de mot de passe** (Server Action + Resend).
3. **Finaliser Stripe Connect** côté club (encaissement réel des inscriptions).
4. **Bêta fermée** avec un club partenaire (Lille / Hauts-de-France).
