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

Le scaffold Next.js + Prisma est en place. `app/`, `lib/`, `prisma/` sont prêts ; les pages publiques sont des placeholders documentés.

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
| Déployer sur le VPS | SSH → `cd /var/www/the-court` → `git pull` → `npm run build` → redémarrer l'app |

Le dépôt GitHub [`Projet-Padel`](https://github.com/EugeneleconteSIFA/Projet-Padel) est le **miroir distant** pour le VPS — pas le dossier `Documents/GitHub/PROJET PADEL/`.

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

## Prochaines étapes (suggestion)

1. **Aligner les vues existantes sur la DA Bandeja** (landing, dashboard joueur, composants partagés)
2. **Implémenter l'auth** (Auth.js v5 + Prisma adapter, magic link via Resend)
3. **Implémenter le formulaire d'inscription** (3 étapes : identité → padel → type de compte)
4. **Implémenter la recherche tournoi** (filtres + carte Leaflet)
5. **Brancher Stripe Connect** côté club
6. **Bêta fermée** avec un club partenaire (Lille / Hauts-de-France)
