# THE COURT — Spécification produit

> Document de référence du projet. Toute évolution de fonctionnalité, de modèle de données ou de stack passe par une mise à jour de ce fichier.

**Nom du produit :** The Court
**Auteur :** Eugène Leconte
**Statut :** v0.2 — POC en conception, branding figé
**Dernière mise à jour :** 2026-05-10

---

## 1. Vision

Construire la plateforme qui couvre **tout l'univers du joueur de raquette en France**, peu importe son rôle : joueur, joueur premium, club, juge-arbitre.

Aujourd'hui, le joueur de padel doit jongler entre Tenup, le site de la FFT, les pages Facebook de clubs, WhatsApp pour trouver un partenaire, et son carnet pour suivre ses résultats. Le club, lui, gère ses tournois sur Excel et relance ses joueurs à la main.

L'objectif : un seul outil, pensé comme un ERP du joueur, qui remplace cet éparpillement.

**Phrase produit :**
> Tout se joue sur The Court.

**Tagline secondaire :** *Une seule app. Tout votre padel.*

---

## 2. Principes produit (non négociables)

1. **Fonctionnel avant beau.** Si une fonctionnalité ralentit l'utilisateur, elle dégage.
2. **Deux minutes max.** Toute action courante (chercher un tournoi, s'inscrire, voir son prochain match) doit aboutir en moins de 2 minutes depuis l'arrivée sur le site.
3. **Premier regard = compréhension.** Pas de tutoriel, pas d'onboarding long. L'interface s'explique seule.
4. **Lisibilité absolue.** Typo généreuse, contrastes forts, hiérarchie claire. On lit aussi sur un téléphone, sous le soleil, à la sortie d'un match.
5. **Mobile-first.** Le joueur consulte la plateforme depuis le club, pas depuis son bureau.
6. **Données fiables.** Une seule source de vérité par entité. Pas de doublons, pas de saisies redondantes.

---

## 3. Personas

### 3.1 — Joueur (rôle par défaut)
**Profil :** Compétiteur amateur, classement P25 à P500. Joue 1 à 3 fois par semaine.
**Besoins :** Trouver des tournois proches, s'inscrire vite, trouver un partenaire, suivre ses résultats.
**Frustrations :** Inscriptions sur Tenup peu lisibles, pas de visibilité sur la liste d'attente, perdre son partenaire le matin du tournoi.

### 3.2 — Joueur Premium
**Profil :** Joueur engagé qui paie un abonnement pour des fonctionnalités avancées.
**Bénéfices différenciés :** Inscription prioritaire, statistiques avancées, matchmaking IA (roadmap), pas de pub, badge premium.

### 3.3 — Gérant de club
**Profil :** Responsable d'un club avec 2 à 8 terrains. Organise 1 à 4 tournois par mois.
**Besoins :** Remplir ses tournois, encaisser, communiquer avec les joueurs, suivre la fréquentation.
**Frustrations :** Désistements de dernière minute, no-shows, paiements à relancer, joueurs qui appellent pour demander les horaires.

### 3.4 — Juge-arbitre
**Profil :** Juge-arbitre fédéral ou de club. Officie sur 1 à 5 tournois par mois.
**Besoins :** Constituer les tableaux, gérer les horaires, saisir les scores, arbitrer les litiges.
**Frustrations :** Tableaux faits à la main, scores transmis par WhatsApp, classements à corriger après coup.

---

## 4. Parcours clés (V1 — POC)

### 4.1 — Joueur : "Je veux jouer un tournoi ce week-end"
1. Arrive sur la home → recherche par ville/rayon, filtre date = ce week-end
2. Voit la liste + carte des tournois compatibles avec son classement
3. Clique sur un tournoi → fiche claire (date, prix, niveau, places restantes)
4. Inscription : invite un partenaire (par email ou via la base joueurs) OU se met en file d'attente seul
5. Paiement (sa part ou la totalité, selon accord avec le partenaire)
6. Confirmation par email + SMS + ajout dans son espace personnel

**Cible :** moins de 2 minutes depuis l'arrivée sur le site jusqu'à la confirmation de paiement.

### 4.2 — Club : "Je crée un tournoi pour le mois prochain"
1. Espace club → "Nouveau tournoi"
2. Formulaire court (date, catégorie, prix, format, nombre d'équipes max)
3. Publication immédiate ou différée
4. Le tournoi apparaît dans la recherche joueurs
5. Suivi en temps réel : inscriptions, paiements, liste d'attente

### 4.3 — Juge-arbitre : "Je gère le tournoi du week-end"
1. Espace juge-arbitre → tournoi assigné
2. Validation des inscrits, génération des tableaux
3. Saisie des scores match par match (interface tactile, mobile-first)
4. Publication automatique des résultats côté joueurs

---

## 5. Fonctionnalités détaillées

### 5.0 — Création de compte / Connexion
**Données collectées :**
- Identité : nom, prénom, date de naissance, email, téléphone, mot de passe, ville, code postal, photo (optionnelle, sinon avatar généré)
- Padel : numéro de licence FFT, classement FFT, niveau estimé, main dominante, côté préféré (droite / gauche / les deux), clubs favoris, disponibilités habituelles, recherche partenaire (oui/non)
- Type de compte : joueur, club, juge-arbitre

**Authentification :**
- Email + mot de passe (V1)
- Magic link (V1)
- OAuth Google / Apple (V2)
- 2FA (V2)

### 5.1 — Espace joueur
- **Profil :** photo, classement FFT, historique tournois, statistiques, partenaires favoris, clubs favoris, badges
- **Recherche tournois :** par ville, rayon km, date, catégorie (P25/P100/P250/P500/P1000/P2000), genre (H/F/Mixte), indoor/outdoor, prix
- **Carte interactive** des tournois (Leaflet + tuiles OpenStreetMap)
- **Inscription :** invitation partenaire, file d'attente automatique, paiement sécurisé, paiement partagé entre partenaires, factures auto, file d'attente solo (greffe d'un partenaire = validation)
- **Expérience tournoi :** notifications, horaires, terrain attribué, scores en direct, résultats, historique
- **Communauté :** recherche partenaire, ajout d'amis, avis sur clubs, suivi de joueurs, classement plateforme, récompenses fidélité, notation club

### 5.2 — Espace club
- Création et gestion des tournois (CRUD complet)
- Suivi inscriptions, paiements, liste d'attente
- Liste des adhérents, communication ciblée (V2)
- Statistiques de remplissage et fréquentation
- Encaissement Stripe Connect (compte bancaire du club)

### 5.3 — Espace juge-arbitre
- Liste des tournois assignés
- Validation des inscrits, gestion des forfaits
- Génération des tableaux (formats : élimination directe, poules + tableau, consolante)
- Saisie des scores (mobile-first, tactile)
- Publication des résultats

### 5.4 — Roadmap (V2 et au-delà — résumé)

**V2 — Espace joueur enrichi**
- Style de jeu (agressif / défenseur)
- Compatibilité partenaire (matching IA)
- Forme récente (10 derniers matchs, code couleur)
- Score fairplay (notation pairs)
- Synchronisation FFT / Tenup
- Highlights vidéo sur profil
- "Trouve-moi mon tournoi" (suggestion IA selon niveau et forme)
- Matchmaking intelligent
- Mode "Padel Tinder" (dispos + ambitions)
- Heatmap de performance (terrain, créneaux, météo)
- Replay automatique (clubs équipés)
- Classement activité plateforme

**V2 — Espace club avancé**
- Prédiction de remplissage (IA)
- Dynamic pricing
- Anti no-show (caution / priorité / validation selon historique)
- CRM joueurs (réguliers, perdus, fréquence, relance)
- Remplissage automatique sur désistement
- Mode événement (live, sponsors, statistiques)
- IA de programmation (optimisation terrains et horaires)

**V2 — Espace juge-arbitre avancé**
- Génération intelligente des tableaux (anti-affrontements répétés)
- Assistant ordre des matchs
- Détection d'incohérences de classement
- Gestion prédictive des retards
- Arbitrage vidéo (très long terme)

**V3+ — Plateforme étendue**
- ELO parallèle propriétaire
- Réseau social padel (feed, abonnements, posts)
- Pronostics gratuits avec récompenses partenaires
- Proshop intégré
- Marketplace (réservation terrain, coachs, stages)
- Coach IA personnel
- Système d'XP / badges / cashback

**Extension long terme :** badminton, tennis, tennis de table, squash. L'architecture data prévoit le multi-sport dès la V1.

---

## 6. Stack technique

| Couche | Choix | Justification |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | Fullstack, SSR/SSG/ISR, API routes, Server Actions. Un seul repo. |
| Langage | **TypeScript** | Strict mode, contrats clairs entre client et serveur. |
| ORM | **Prisma** | Source de vérité unique du schéma. Migrations versionnées. |
| Base de données | **PostgreSQL 16** | Relationnel solide, JSONB pour les zones flexibles, géo via PostGIS si besoin. |
| Auth | **NextAuth (Auth.js v5)** | Email/password, magic link, OAuth, support multi-provider. |
| Paiement | **Stripe + Stripe Connect** | Encaissement par les clubs, paiements partagés, factures, webhooks. |
| Cartographie | **Leaflet + OSM** | Gratuit, libre, suffisant pour V1. Mapbox si besoin V2. |
| Emails transactionnels | **Resend** | API simple, bons templates React Email. |
| SMS | **Twilio** ou **OVH SMS** | À arbitrer V1 vs V2. |
| Stockage fichiers | **S3 (Scaleway Object Storage)** | Photos profil, images tournois, documents. |
| Styling | **Tailwind CSS + shadcn/ui** | Cohérence visuelle, composants accessibles, vitesse de dev. |
| Validation | **Zod** | Schémas partagés entre formulaires et API. |
| Tests | **Vitest + Playwright** | Unitaires + E2E sur les parcours critiques. |
| CI/CD | **GitHub Actions** | Tests + déploiement automatique sur main. |
| Monitoring | **Sentry + Plausible** | Erreurs + analytics respectueux du RGPD. |

---

## 7. Hosting — Recommandation

### Question initiale
> Faut-il passer sur un plan VPS ou alors autre chose ?

### Réponse synthétique

**Phase POC (0 à 200 utilisateurs actifs) → Vercel + Neon**
- **Vercel** pour Next.js : déploiement automatique sur push, CDN mondial, scale à zéro, gratuit jusqu'à un certain seuil puis ~20€/mois.
- **Neon** ou **Supabase** pour PostgreSQL managé : branches de DB pour preview, backups auto, ~0 à 25€/mois.
- **Total : 0 à 50€/mois**, zéro ops, focus 100% sur le produit.

**Phase MVP (200 à 5 000 utilisateurs actifs) → Railway ou Render**
- Plateformes intermédiaires : pricing prévisible, plus de contrôle qu'un PaaS pur.
- Postgres managé inclus.
- ~30 à 100€/mois selon trafic.

**Phase production (5 000+ utilisateurs ou besoins spécifiques) → VPS Hetzner / Scaleway + Coolify**
- VPS dédié : Hetzner (CX22, 5€/mois) ou Scaleway (DEV1-S, 8€/mois) en France pour la latence et le RGPD.
- **Coolify** ou **Dokploy** pour orchestrer Next.js + Postgres + Redis sans Kubernetes.
- Postgres self-hosted avec backups vers S3 (pgBackRest ou wal-g).
- ~30 à 80€/mois pour une infra solide. Demande des compétences ops basiques.

### Recommandation pour le projet
**Démarrer sur Vercel + Neon dès maintenant.** Tu mets la priorité sur le produit, pas sur l'infra. Le jour où ça décolle, on bascule sur Hetzner/Coolify en quelques jours sans rien casser puisque le code est portable (rien de spécifique Vercel).

**À éviter d'emblée :** AWS / GCP / Azure (complexité hors-sujet), Kubernetes (lourd pour le POC), Heroku (cher pour ce qu'il offre).

---

## 8. Règles de gestion de la base de données

> Règle d'or : **on ne recrée jamais la base.**

### 8.1 — Source de vérité unique
Le schéma vit dans `prisma/schema.prisma`. C'est le seul fichier qui décrit le modèle. Toute autre représentation (SQL, diagrammes, doc) est dérivée.

### 8.2 — Migrations versionnées
Toute modification du schéma passe par une migration Prisma :
```bash
npx prisma migrate dev --name nom_explicite_du_changement
```
Les migrations vivent dans `prisma/migrations/` et sont commitées.

### 8.3 — Environnements
- `DATABASE_URL` en local → Postgres Docker ou Neon branch perso
- `DATABASE_URL` en preview → Neon branch par PR
- `DATABASE_URL` en prod → instance Neon production

### 8.4 — Données de test (seed)
Les données de seed vivent dans `prisma/seed.ts` et sont rejouables sans casser la base existante (upserts, pas d'inserts bruts).

### 8.5 — Sauvegardes
- Neon : snapshots auto + point-in-time recovery 7 jours minimum (offre Pro).
- Production VPS : `pg_dump` quotidien vers S3, rétention 30 jours.

### 8.6 — Règles pour les prompts futurs
Quand tu demandes une nouvelle fonctionnalité, je dois :
1. Ouvrir `prisma/schema.prisma` et lire l'existant.
2. **Étendre** le schéma, pas le refondre.
3. Générer une migration Prisma nommée explicitement.
4. Mettre à jour la section "Modèle de données" du SPEC.md si nécessaire.

Je ne crée **jamais** un nouveau fichier `schema.sql` parallèle. Une seule source.

---

## 9. Modèle de données — Vue d'ensemble

Le schéma détaillé est dans `prisma/schema.prisma`. Vue de haut :

**Identité et comptes**
- `User` — compte de base (email, mot de passe, vérifications)
- `PlayerProfile`, `ClubProfile`, `RefereeProfile` — profils selon le rôle, liés à `User`
- `Address` — adresses normalisées (joueurs, clubs)

**Padel — référentiel**
- `Sport` — padel, badminton, tennis, etc. (préparation multi-sport)
- `RankingCategory` — P25, P100, P250, P500, P1000, P2000
- `Federation` — FFT (extensible)

**Clubs**
- `Club` — données du club, terrains
- `Court` — terrain individuel (indoor/outdoor, surface)
- `ClubMembership` — adhésion d'un joueur à un club

**Tournois**
- `Tournament` — métadonnées du tournoi
- `TournamentEdition` — édition datée d'un tournoi (récurrence)
- `Registration` — inscription d'une équipe
- `Team` — paire de joueurs
- `WaitingList` — file d'attente (équipe ou joueur solo)
- `Match` — match joué
- `MatchScore` — score détaillé
- `Bracket` — tableau du tournoi

**Paiements**
- `Payment` — paiement d'une inscription
- `PaymentSplit` — répartition entre partenaires
- `Invoice` — facture générée
- `StripeAccount` — compte Stripe Connect du club

**Communauté**
- `Friendship` — relation entre deux joueurs
- `Follow` — abonnement (asymétrique)
- `ClubReview` — avis sur club
- `Notification` — notifications utilisateur

**Logs et audit**
- `AuditLog` — actions sensibles (changement de mot de passe, modification de tournoi…)
- `Session` — sessions Auth.js

---

## 10. Branding

**Nom :** The Court (figé le 2026-05-10).
**Direction artistique :** Bandeja — crème argentée, vert padel profond, or signature, mix serif (Fraunces) / sans-serif (Inter).

**Principes visuels (validés) :**
- Premium par la sobriété. Le serif aux titres, le sans au corps, l'or rare.
- Lisibilité absolue : contrastes forts, hiérarchie typographique nette.
- Mode sombre = fond vert profond, jamais noir pur. Signature The Court.
- Photos réelles uniquement (matchs, joueurs, clubs). Pas de stock.
- Iconographie Lucide ligne 1.5px. Cohérent partout.

Détails complets dans `branding/BRANDING.md`. Tokens dans `branding/design-tokens.css`.

---

## 11. Critères de succès du POC

Le POC est validé si, sur 3 mois après lancement :
1. **3 clubs partenaires** ont organisé au moins 2 tournois chacun via la plateforme.
2. **300 joueurs actifs** se sont inscrits et ont participé à au moins 1 tournoi.
3. **Taux de conversion** recherche → inscription tournoi ≥ 15%.
4. **Temps moyen** entre arrivée et inscription ≤ 2 minutes (mesuré).
5. **NPS joueurs** ≥ 40.
6. **Zéro incident critique** sur paiements ou données.

Si ces critères sont atteints, la phase 2 démarre : extension multi-sports, app mobile native, fonctionnalités IA.

---

## 12. Roadmap macro

| Phase | Durée | Livrables | Statut |
|---|---|---|---|
| **0 — Cadrage** | en cours | Spec, schéma BDD, branding, scaffold | en cours |
| **1 — Fondations** | 4 semaines | Auth, profils, modèle de données complet, design system | à venir |
| **2 — Espace joueur V1** | 6 semaines | Recherche, inscription, paiement, profil | à venir |
| **3 — Espace club V1** | 4 semaines | Création de tournois, gestion des inscrits | à venir |
| **4 — Espace juge-arbitre V1** | 3 semaines | Tableaux, scores, publication | à venir |
| **5 — Bêta fermée** | 3 semaines | 1 club partenaire, retours terrain | à venir |
| **6 — Lancement public POC** | — | Mise en prod, communication | à venir |

---

## 13. Annexes

- `branding/BRANDING.md` — Branding validé : nom The Court, direction Bandeja, principes visuels
- `branding/design-tokens.css` — Tokens de design (couleurs, typo, spacing)
- `prisma/schema.prisma` — Schéma de la base
- `db/init.sql` — Script SQL initial dérivé (lecture seule, non source de vérité)
- `mockups/` — Maquettes HTML standalone
- `README.md` — Guide de démarrage développeur
