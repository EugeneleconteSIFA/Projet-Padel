# Prompts Windsurf — Refonte /club (gestion club padel)

Ce fichier contient **3 prompts autonomes** à coller dans Windsurf, dans l'ordre indiqué. Chaque prompt est rédigé pour pouvoir être traité en une seule itération sans dépendance aux autres (à part le préfixe de contexte commun).

**Ordre recommandé** :
1. Prompt 1 — Gestion des adhérents (fondation)
2. Prompt 2 — Suivi joueurs et tournois
3. Prompt 3 — Planning des cours

---

## Préfixe à coller AU DÉBUT de chaque prompt Windsurf

> Tu travailles sur **The Court**, plateforme padel (Next.js 14 App Router + Prisma + Postgres Neon + NextAuth v5 + TailwindCSS). Le schéma Prisma est dans `prisma/schema.prisma` (1070 lignes, source de vérité). Les server actions club vivent dans `lib/actions/club.ts`. La route club est `app/(dashboard)/club/`, protégée par `requireApprovedClub()` (`lib/auth-guards.ts`). Le dashboard actuel est `app/(dashboard)/club/page.tsx`.
>
> **Règles non négociables** :
> - Toute modif du modèle de données passe par `npx prisma migrate dev --name <nom_explicite>`. NE JAMAIS éditer une migration existante.
> - Server Components par défaut. Client Components (`'use client'`) seulement si interactivité (formulaires, calendrier interactif, filtres réactifs).
> - Mobile-first. Tester à 375px de large.
> - Design system : variables CSS du fichier `app/globals.css` (`--court-700`, `--court-100`, `--gold-500`, `--gold-700`, `--bg-surface`, `--bg-muted`, `--bg-page`, `--border-subtle`, `--text-primary`, `--text-secondary`, `--text-muted`, `--color-danger`, `--font-display`, `--cream-50`). Reproduire le pattern de `app/(dashboard)/club/page.tsx` (KPI cards, Section, EmptyState).
> - Tous les libellés en français.
> - Validation Zod systématique pour les inputs de server actions.
> - Localiser les dates en `fr-FR`, format court (`day: 'numeric', month: 'short'`).
> - Ne jamais inventer un champ Prisma : si une donnée manque, ajouter une migration explicite et le préciser dans ta réponse.
> - Mocks autorisés en fallback (cf. `MOCK_TOURNAMENTS` dans `app/(dashboard)/club/page.tsx`) tant que la DB n'est pas seedée.

---

# PROMPT 1 — Gestion des adhérents

## Mission
Construire l'écran de gestion des **adhérents** d'un club padel. L'admin du club doit pouvoir lister, rechercher, filtrer et fiche-par-fiche consulter ses adhérents, avec les infos critiques pour la gestion FFT (licence, certificat médical, cotisation).

## Spécificités padel à respecter
- **Licence FFT** : un numéro unique par joueur, valide d'une date à une date. Le padel utilise la même licence que le tennis.
- **Certificat médical** : obligatoire pour la compétition en France (valide 1 an, prochaine échéance à afficher en rouge si < 30 jours).
- **Saison sportive** : septembre N → août N+1 (pas année civile). Les cotisations s'alignent dessus.
- **Classement** : codes officiels FFT (P25, P100, P250, P500, P1000, P2000) déjà seedés dans `RankingCategory`.

## Modèle de données — migration à créer

**Nom suggéré** : `npx prisma migrate dev --name enrich_club_membership`

Modifier `ClubMembership` :
```prisma
enum MembershipType {
  ADULT          // Adulte (>=18 ans)
  YOUTH          // Jeune (<18 ans)
  STUDENT        // Étudiant
  FAMILY         // Pack famille
  LEISURE        // Loisir (jeu libre seulement)
  COMPETITION    // Compétiteur (accès tournois club)
}

enum MembershipStatus {
  ACTIVE
  EXPIRED
  PENDING_PAYMENT
  CANCELLED
}

model ClubMembership {
  id                          String           @id @default(cuid())
  playerProfileId             String
  clubId                      String
  membershipType              MembershipType   @default(ADULT)
  status                      MembershipStatus @default(ACTIVE)
  validFrom                   DateTime         @default(now())
  validUntil                  DateTime?        // null = pas de fin (jeu libre permanent)
  feesPaidCents               Int              @default(0)
  currency                    String           @default("EUR")
  medicalCertificateValidUntil DateTime?       // null si pas fourni
  notes                       String?          @db.Text
  since                       DateTime         @default(now())  // existant — conserver
  isActive                    Boolean          @default(true)   // existant — conserver, dérivé de status

  player PlayerProfile @relation(fields: [playerProfileId], references: [id], onDelete: Cascade)
  club   Club          @relation(fields: [clubId], references: [id], onDelete: Cascade)

  @@unique([playerProfileId, clubId])
  @@index([clubId, status])
  @@index([validUntil])
  @@index([medicalCertificateValidUntil])
}
```

> Important : ne pas casser la rétrocompatibilité avec `since` et `isActive` (utilisés ailleurs dans le code, à grep avant migration). Ajouter les nouveaux champs en nullable ou avec un default.

## Routes & fichiers à créer

```
app/(dashboard)/club/adherents/
├── layout.tsx                  // Wrapper avec requireApprovedClub()
├── page.tsx                    // Liste + recherche + filtres
└── [membershipId]/
    └── page.tsx                // Fiche détaillée d'un adhérent

lib/actions/club-members.ts     // Server actions dédiées (créer ce fichier)
```

## Server actions à exposer (`lib/actions/club-members.ts`)

```ts
// Toutes ces actions doivent appeler un helper requireClub() identique à celui de lib/actions/club.ts
// et garantir que les memberships retournés appartiennent bien au club du caller.

getClubMembers(filters?: {
  search?: string;              // nom, prénom, email, numéro licence
  type?: MembershipType;
  status?: MembershipStatus;
  certificateExpiring?: boolean; // < 30 jours
  licenseExpiring?: boolean;     // < 30 jours
}): Promise<MemberRow[]>

getClubMemberDetail(membershipId: string): Promise<MemberDetail | null>

createClubMember(input: {
  // Mode 1 : lier un joueur existant par email
  existingPlayerEmail?: string;
  // Mode 2 : créer le joueur "à la main" (mode club secondaire)
  newPlayer?: { firstName: string; lastName: string; email: string; phone?: string; birthDate?: string };
  membershipType: MembershipType;
  validFrom: string;            // ISO
  validUntil?: string;
  feesPaidCents: number;
  medicalCertificateValidUntil?: string;
  licenseNumber?: string;
  ranking?: string;             // P25..P2000
}): Promise<ActionResult>

updateClubMember(membershipId: string, patch: {
  membershipType?: MembershipType;
  status?: MembershipStatus;
  validUntil?: string;
  feesPaidCents?: number;
  medicalCertificateValidUntil?: string;
  notes?: string;
}): Promise<ActionResult>

archiveClubMember(membershipId: string): Promise<ActionResult>  // status = CANCELLED, isActive=false
```

Valider tous les inputs avec Zod. Renvoyer `revalidatePath('/club/adherents')` après mutation.

## Spécification UI — `/club/adherents`

**Header**
- Titre `Adhérents` (style `var(--font-display)`, taille `clamp(26px, 4vw, 34px)`).
- Bouton primaire `+ Nouvel adhérent` (couleur `--court-700`).
- Sous-titre : "X adhérents actifs · Y en attente de renouvellement".

**KPI cards (4 colonnes desktop, 2 mobile)** — composant `KpiCard` repris de `app/(dashboard)/club/page.tsx` :
- Adhérents actifs (count `status = ACTIVE`)
- Renouvellements à venir (count `validUntil` < 30 jours)
- Certificats médicaux expirant (count `medicalCertificateValidUntil` < 30 jours)
- Revenu cotisations saison en cours (somme `feesPaidCents` membres saison N → N+1)

**Barre filtres**
- Input recherche (debounce 200ms côté client).
- Select type adhésion (avec option "Tous").
- Select status.
- Toggle "Certificat à renouveler".

**Liste**
- Table desktop / cards mobile.
- Colonnes : Nom (avatar + nom complet + email), Type, Classement, Licence (numéro + date validité), Certificat médical (badge couleur), Validité adhésion, Actions.
- Badges colorés :
  - Certificat OK : `--court-700`, fond `--court-100`.
  - Expirant (< 30j) : `--gold-700`, fond `--gold-100`.
  - Expiré : `--color-danger`, fond `rgba(166,51,46,0.08)`.
- Empty state : "Aucun adhérent. Ajoutez votre premier membre."
- Pagination 50 par page (ou scroll infini, au choix).

**Formulaire création (modal ou page)**
- 2 onglets : "Lier un joueur existant (email)" / "Créer un nouvel adhérent".
- Mode "existant" : input email → server action cherche un `User` avec `PlayerProfile`. Si trouvé, on lie. Sinon erreur.
- Mode "nouveau" : crée un `User` rôle PLAYER + `PlayerProfile` + `ClubMembership` + optionnellement `PlayerLicense` (federation = FFT par défaut). Génère un mot de passe temporaire, envoie un email d'invitation via Resend (template dans `lib/dispatch.ts`, vérifier si existant).

## Spécification UI — `/club/adherents/[membershipId]`

**Header**
- Avatar + Nom Prénom + badge type adhésion.
- Boutons : Modifier · Archiver.

**3 colonnes desktop (1 colonne mobile)** :

*Colonne 1 — Identité*
- Email, téléphone, date naissance, ville.
- Bio joueur (`PlayerProfile.bio`).

*Colonne 2 — Padel*
- Licence FFT (numéro + validité).
- Classement (`PlayerLicense.ranking`).
- Main dominante, côté préféré.
- Niveau estimé (`PlayerProfile.estimatedLevel`).

*Colonne 3 — Adhésion*
- Type, status, validité.
- Cotisation payée.
- Certificat médical (date + bouton "Renouveler").
- Notes admin (`notes` éditable).

**Section pleine largeur en bas — Activité au club**
- Liste des inscriptions à tournois internes (`Registration` via `Team` → joueur).
- Liste des cours en cours (en attente du prompt 3, mock pour l'instant).

## Critères d'acceptation
- [ ] La migration `enrich_club_membership` s'applique sans casser le seed démo.
- [ ] `getClubMembers()` filtre correctement par nom, type, status, certificat expirant.
- [ ] Création d'un adhérent en mode "existant" : ne duplique pas le `User`.
- [ ] Création en mode "nouveau" : un email d'invitation part (mock console.log accepté si Resend pas configuré).
- [ ] Les badges certificat médical changent de couleur selon délai.
- [ ] Mobile 375px : tous les boutons restent cliquables, la table devient cards.
- [ ] `requireApprovedClub()` protège les deux pages.
- [ ] Un admin du club A ne peut JAMAIS lire/écrire un membership du club B (tester en passant un `membershipId` étranger → 404).

## Hors-scope explicite
- Pas de Stripe Connect pour le paiement cotisation (juste un champ montant).
- Pas de relance email automatique.
- Pas d'export CSV (à venir en V2).
- Pas d'interface joueur côté adhérent.

---

# PROMPT 2 — Suivi joueurs et tournois

## Mission
Donner à l'admin du club une vue d'ensemble de **l'activité tournoi** de ses adhérents : tournois prévus / en cours / terminés, équipes, résultats, et participation à des tournois externes (saisie manuelle ultra-light).

**Hypothèse à confirmer avec l'utilisateur Eugène** : on ne tracke pas les brackets de tournois externes — juste une participation et un résultat textuel. Pour les tournois INTERNES (organisés par le club), on utilise le modèle `Tournament` / `TournamentEdition` / `Registration` / `Match` déjà en place.

## Modèle de données — migration à créer

**Nom suggéré** : `npx prisma migrate dev --name add_external_tournament_tracking`

```prisma
enum ExternalTournamentResult {
  WINNER
  FINALIST
  SEMI_FINALIST
  QUARTER_FINALIST
  POOL_STAGE
  ELIMINATED_R32
  ELIMINATED_R16
  WITHDREW
  NOT_REPORTED
}

model ExternalTournamentEntry {
  id              String                    @id @default(cuid())
  clubId          String                    // club qui suit ce joueur
  playerProfileId String
  tournamentName  String
  location        String?                   // ville
  category        String?                   // P100, P250, ...
  startDate       DateTime
  endDate         DateTime?
  partnerName     String?                   // si saisi en libre
  partnerPlayerId String?                   // si lié à un autre adhérent du club
  result          ExternalTournamentResult  @default(NOT_REPORTED)
  notes           String?                   @db.Text
  externalUrl     String?                   // ex: Ten'Up
  createdById     String                    // user admin club ayant saisi
  createdAt       DateTime                  @default(now())
  updatedAt       DateTime                  @updatedAt

  club    Club          @relation(fields: [clubId], references: [id], onDelete: Cascade)
  player  PlayerProfile @relation(fields: [playerProfileId], references: [id], onDelete: Cascade)
  partner PlayerProfile? @relation("ExternalPartner", fields: [partnerPlayerId], references: [id], onDelete: SetNull)

  @@index([clubId, startDate])
  @@index([playerProfileId, startDate])
}
```

Ajouter les relations inverses dans `Club` et `PlayerProfile` (champs `externalTournamentEntries` et `externalTournamentEntriesAsPartner`).

## Routes & fichiers à créer

```
app/(dashboard)/club/joueurs/
├── layout.tsx
├── page.tsx                    // Vue d'ensemble : liste des adhérents avec leur activité tournoi
└── [playerProfileId]/
    ├── page.tsx                // Détail activité tournoi d'un joueur
    └── ajouter-participation/
        └── page.tsx            // Formulaire saisie tournoi externe

app/(dashboard)/club/tournois/
└── page.tsx                    // Vue consolidée : tournois internes + externes du club
                                 // (remplace la section "Tournois" du dashboard actuel)

lib/actions/club-players.ts
lib/actions/club-external-tournaments.ts
```

## Server actions (`lib/actions/club-players.ts`)

```ts
// Liste joueurs avec compte d'inscriptions tournoi
getClubPlayersWithTournamentActivity(): Promise<Array<{
  membership: { id, type, status };
  player: { id, firstName, lastName, avatarUrl, ranking };
  upcomingCount: number;     // Registration status=CONFIRMED, edition.startDate>now
  ongoingCount: number;      // Registration via edition.status=RUNNING
  completedCount: number;    // Registration via edition.status=COMPLETED (12 derniers mois)
  externalCount: number;     // ExternalTournamentEntry sur 12 derniers mois
  lastResult?: { tournamentName: string; date: Date; result: string };
}>>

getPlayerTournamentTimeline(playerProfileId: string): Promise<Array<{
  kind: 'INTERNAL' | 'EXTERNAL';
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  date: Date;
  name: string;
  category?: string;
  partner?: string;
  result?: string;
  link?: string;             // /tournois/[slug] si INTERNAL, externalUrl sinon
}>>
```

## Server actions (`lib/actions/club-external-tournaments.ts`)

```ts
createExternalEntry(input: {
  playerProfileId: string;
  tournamentName: string;
  location?: string;
  category?: string;
  startDate: string;
  endDate?: string;
  partnerName?: string;
  partnerPlayerId?: string;
  result?: ExternalTournamentResult;
  notes?: string;
  externalUrl?: string;
}): Promise<ActionResult>

updateExternalEntry(id: string, patch: Partial<...>): Promise<ActionResult>
deleteExternalEntry(id: string): Promise<ActionResult>
```

Vérification systématique : le `playerProfileId` doit avoir un `ClubMembership` actif avec le `clubId` du caller.

## Spécification UI — `/club/joueurs`

**Header** : "Activité tournoi de mes adhérents · 12 derniers mois".

**3 KPI cards** :
- Joueurs ayant joué un tournoi (count distinct).
- Tournois internes joués (count `Registration` CONFIRMED).
- Participations externes saisies.

**Filtres**
- Recherche nom.
- Toggle "Avec activité seulement".
- Sélecteur période (3 mois / 6 mois / 12 mois / saison en cours).

**Tableau / cards**
- Une ligne par adhérent.
- Colonnes : Joueur (avatar + nom + classement), À venir (badge nombre), En cours (badge), Terminés, Externes, Dernier résultat, Action ("Voir →").
- Cliquer sur une ligne → `/club/joueurs/[playerProfileId]`.

## Spécification UI — `/club/joueurs/[playerProfileId]`

**Header** : avatar + nom + classement + bouton `+ Saisir tournoi externe`.

**3 onglets** : `À venir` · `En cours` · `Terminés`. Compteurs dans les onglets.

**Liste** (par onglet)
- Carte par tournoi avec : date, nom, lieu, catégorie, partenaire, badge interne/externe, résultat (terminé), bouton "Détails".
- Différencier visuellement interne (fond `--court-100` léger) vs externe (fond `--bg-muted`).

**Bloc statistiques** (calculs simples) :
- Nombre de tournois joués cette saison.
- Meilleur résultat (1er résultat trouvé ≠ NOT_REPORTED selon ordre WINNER > FINALIST > ...).
- Partenaires fréquents (top 3 par fréquence).

## Spécification UI — `/club/joueurs/[playerProfileId]/ajouter-participation`

Formulaire 1 page :
- Nom tournoi (texte libre).
- Ville.
- Date début / fin.
- Catégorie (select P25..P2000).
- Partenaire : 2 modes (sélecteur d'adhérent du club / texte libre).
- Résultat (select).
- URL externe (Ten'Up, etc.).
- Notes.

Après soumission → redirige vers `/club/joueurs/[playerProfileId]`.

## Spécification UI — `/club/tournois`

Vue consolidée club, 3 sections empilées :

**Tournois INTERNES** (tournois où le clubId = mon club)
- Reprise du composant `CompactTournamentCard` existant.
- 3 sous-sections : Actifs · Brouillons · Historique.
- Bouton `+ Nouveau tournoi` → route existante `/club/tournoi/nouveau`.

**Participations EXTERNES** (tournois externes auxquels les joueurs du club ont participé)
- Liste regroupée par mois (titre `mai 2026`).
- 1 ligne par participation : Joueur · Tournoi · Catégorie · Résultat.
- Bouton `+ Saisir une participation`.

**Stats club**
- Nombre de participations externes / mois (mini chart simple en CSS, pas de lib graph).
- Top 5 joueurs les plus actifs.

## Critères d'acceptation
- [ ] Migration `add_external_tournament_tracking` clean.
- [ ] L'admin du club A ne voit AUCUNE entry du club B.
- [ ] Saisie d'un tournoi externe pour un joueur non-membre → erreur 403.
- [ ] La timeline d'un joueur fusionne correctement internal + external, triée par date desc.
- [ ] Les compteurs onglets matchent le nombre d'items affichés.
- [ ] Mobile 375px : les filtres deviennent un drawer ou sélecteurs empilés.
- [ ] Le filtre "saison en cours" prend bien sept N → août N+1.

## Hors-scope explicite
- Pas d'intégration Ten'Up (V2).
- Pas de saisie de scores match-par-match pour les externes.
- Pas de notification "ton joueur a gagné un tournoi" automatique.

---

# PROMPT 3 — Planning des cours (calendrier visuel)

## Mission
Permettre à l'admin du club de **gérer les cours du club** : créer des cours récurrents (ex : "Mardi 19h Adultes Intermédiaire"), voir le planning hebdo en calendrier visuel, voir le mois en agenda, gérer les inscriptions élèves par cours.

## Spécificités padel critiques
- Un cours = **1 coach + 1 à 4 élèves + 1 terrain** (capacité max 4 par essence).
- Cours typiquement **récurrents par trimestre/saison** : "Le mardi 19h-20h de septembre à juin". Donc on a besoin d'un modèle "récurrence" + génération automatique des sessions.
- Cours **collectif** (groupe stable) vs cours **individuel** (1 à 1, ponctuel).
- Niveaux : Initiation · Débutant · Intermédiaire · Confirmé · Compétition.
- Tranches d'âge : Mini (5-7) · Junior (8-12) · Ado (13-17) · Adulte (18+) · Senior (50+).

## Modèle de données — migration à créer

**Nom suggéré** : `npx prisma migrate dev --name add_lessons`

```prisma
enum LessonAudience {
  MINI            // 5-7 ans
  JUNIOR          // 8-12 ans
  TEEN            // 13-17 ans
  ADULT
  SENIOR
  MIXED
}

enum LessonLevel {
  INITIATION
  BEGINNER
  INTERMEDIATE
  ADVANCED
  COMPETITION
}

enum LessonGroupStatus {
  DRAFT
  PUBLISHED       // visible en planning
  ARCHIVED
}

enum LessonSessionStatus {
  SCHEDULED
  CANCELLED       // annulé (météo, coach absent, etc.)
  COMPLETED
}

enum LessonEnrollmentStatus {
  ACTIVE
  WAITING_LIST
  CANCELLED
}

// Coach — table dédiée au club, optionnellement liée à un User (un coach peut être un User PLAYER aussi)
model Coach {
  id        String   @id @default(cuid())
  clubId    String
  userId    String?  @unique
  firstName String
  lastName  String
  email     String?
  phone     String?
  bio       String?  @db.Text
  avatarUrl String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  club    Club           @relation(fields: [clubId], references: [id], onDelete: Cascade)
  groups  LessonGroup[]

  @@index([clubId, isActive])
}

// LessonGroup — cours récurrent (modèle de récurrence)
model LessonGroup {
  id              String              @id @default(cuid())
  clubId          String
  coachId         String
  courtId         String?             // null = court non fixé (assigné session par session)
  name            String              // ex: "Adultes Intermédiaire — Mardi 19h"
  audience        LessonAudience
  level           LessonLevel
  capacity        Int                 @default(4)
  weekday         Int                 // 0=dimanche, 1=lundi, ... 6=samedi
  startTime       String              // "19:00"
  durationMinutes Int                 @default(60)
  seasonStart     DateTime            // ex: 2026-09-01
  seasonEnd       DateTime            // ex: 2027-06-30
  priceCents      Int                 @default(0)
  currency        String              @default("EUR")
  description     String?             @db.Text
  status          LessonGroupStatus   @default(DRAFT)
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  club        Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
  coach       Coach               @relation(fields: [coachId], references: [id])
  court       Court?              @relation(fields: [courtId], references: [id], onDelete: SetNull)
  sessions    LessonSession[]
  enrollments LessonEnrollment[]

  @@index([clubId, status])
  @@index([weekday])
}

// LessonSession — instance datée d'un cours (générée automatiquement à partir du LessonGroup)
model LessonSession {
  id            String              @id @default(cuid())
  groupId       String
  courtId       String?             // peut surcharger celui du groupe
  date          DateTime            // date + heure de début (UTC stocké)
  durationMinutes Int               @default(60)
  status        LessonSessionStatus @default(SCHEDULED)
  cancelReason  String?
  notes         String?             @db.Text
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  group        LessonGroup     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  court        Court?          @relation(fields: [courtId], references: [id], onDelete: SetNull)
  attendances  LessonAttendance[]

  @@index([groupId, date])
  @@index([date, status])
}

// LessonEnrollment — élève inscrit à un groupe pour la saison
model LessonEnrollment {
  id              String                  @id @default(cuid())
  groupId         String
  playerProfileId String
  status          LessonEnrollmentStatus  @default(ACTIVE)
  enrolledAt      DateTime                @default(now())
  cancelledAt     DateTime?

  group  LessonGroup   @relation(fields: [groupId], references: [id], onDelete: Cascade)
  player PlayerProfile @relation(fields: [playerProfileId], references: [id], onDelete: Cascade)

  @@unique([groupId, playerProfileId])
  @@index([groupId, status])
}

// LessonAttendance — présence par session (optionnel mais utile pour suivi assiduité)
model LessonAttendance {
  id              String   @id @default(cuid())
  sessionId       String
  playerProfileId String
  present         Boolean  @default(true)
  notedAt         DateTime @default(now())

  session LessonSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  player  PlayerProfile  @relation(fields: [playerProfileId], references: [id], onDelete: Cascade)

  @@unique([sessionId, playerProfileId])
}
```

Ajouter relations inverses : `Club.coaches`, `Club.lessonGroups`, `Court.lessonGroups`, `Court.lessonSessions`, `PlayerProfile.lessonEnrollments`, `PlayerProfile.lessonAttendances`.

## Génération des sessions
Lors du passage d'un `LessonGroup` au statut `PUBLISHED`, générer automatiquement les `LessonSession` correspondantes entre `seasonStart` et `seasonEnd` selon `weekday` et `startTime` (sauter les sessions déjà existantes pour idempotence). Helper dans `lib/actions/club-lessons.ts` : `regenerateSessionsForGroup(groupId)`.

## Routes & fichiers à créer

```
app/(dashboard)/club/cours/
├── layout.tsx
├── page.tsx                    // Vue d'ensemble : KPIs + 2 onglets : Calendrier semaine / Agenda mois
├── nouveau/
│   └── page.tsx                // Formulaire création LessonGroup
├── [groupId]/
│   ├── page.tsx                // Détail groupe + élèves inscrits + sessions à venir
│   └── modifier/
│       └── page.tsx            // Édition LessonGroup
└── coachs/
    ├── page.tsx                // Liste / gestion coachs
    └── nouveau/
        └── page.tsx

lib/actions/club-lessons.ts
lib/actions/club-coaches.ts
components/club/lesson-calendar-week.tsx    // Client component
components/club/lesson-calendar-month.tsx   // Client component
```

## Server actions (`lib/actions/club-lessons.ts`)

```ts
// Lecture
getLessonGroupsForClub(filters?: { status?, audience?, level?, coachId? }): Promise<...>
getLessonGroupDetail(groupId: string): Promise<...>
getLessonSessionsInRange(from: Date, to: Date, filters?): Promise<LessonSession[]>

// Mutation groupe
createLessonGroup(input: {...}): Promise<ActionResult>
updateLessonGroup(groupId, patch): Promise<ActionResult>
publishLessonGroup(groupId): Promise<ActionResult>  // status=PUBLISHED + regenerateSessionsForGroup
archiveLessonGroup(groupId): Promise<ActionResult>

// Mutation session
cancelLessonSession(sessionId, reason: string): Promise<ActionResult>
rescheduleLessonSession(sessionId, newDate: Date, newCourtId?: string): Promise<ActionResult>

// Inscription
enrollPlayerInGroup(groupId, playerProfileId): Promise<ActionResult>
  // Refuse si groupe plein → enrollment WAITING_LIST
unenrollPlayer(enrollmentId): Promise<ActionResult>

// Présences
markAttendance(sessionId, presents: Array<{ playerProfileId: string; present: boolean }>): Promise<ActionResult>
```

## Server actions (`lib/actions/club-coaches.ts`)

```ts
listCoaches(): Promise<...>
createCoach(input): Promise<ActionResult>
updateCoach(coachId, patch): Promise<ActionResult>
archiveCoach(coachId): Promise<ActionResult>
```

## Spécification UI — `/club/cours`

**Header** : titre `Cours` + boutons `+ Nouveau cours` et `Coachs`.

**4 KPI cards** :
- Groupes actifs (status=PUBLISHED).
- Élèves inscrits (count distinct LessonEnrollment ACTIVE).
- Sessions cette semaine.
- Taux de remplissage moyen (somme enrollments actifs / somme capacities).

**Toggle vue** : `Semaine` · `Mois (agenda)`.

### Vue Semaine — composant `lesson-calendar-week.tsx`
- 7 colonnes (lun → dim), 1 colonne d'horaires à gauche.
- Plage 7h → 23h.
- Chaque `LessonSession` rendue comme bloc coloré (couleur dérivée du `coachId` ou du `level`).
- Cliquer un bloc → modal détail (groupe, coach, élèves, court).
- Boutons flèches pour naviguer semaine précédente/suivante.
- Bouton "Aujourd'hui" reset.
- Affichage compact en mobile : 1 colonne par jour mais swipe horizontal entre jours.

### Vue Mois (agenda) — composant `lesson-calendar-month.tsx`
- Liste verticale groupée par date.
- 1 ligne par session : heure · coach · groupe · court · X/Y inscrits.
- Filtres : par coach, par court, par niveau.

## Spécification UI — `/club/cours/nouveau`

Formulaire en sections :

*Section 1 — Identité*
- Nom du cours (suggestion auto : "{audience} {level} — {jour} {heure}").
- Audience (select).
- Niveau (select).

*Section 2 — Récurrence*
- Jour de la semaine (radio).
- Heure début (input time).
- Durée (select 60/90/120 min).
- Saison : date début + date fin (defaults : 1er septembre N → 30 juin N+1).

*Section 3 — Logistique*
- Coach (select Coachs actifs).
- Court (select Courts du club, optionnel).
- Capacité (input number, default 4, max 4).

*Section 4 — Prix*
- Prix par élève sur la saison (input €).

*Section 5 — Description*
- Textarea optionnel.

Boutons : `Enregistrer brouillon` (status=DRAFT) · `Publier` (status=PUBLISHED → génère les sessions).

## Spécification UI — `/club/cours/[groupId]`

**Header** : nom + badges (niveau, audience) + statut + boutons Modifier · Publier/Archiver.

**3 colonnes (1 colonne mobile)** :

*Colonne 1 — Infos*
- Coach (avatar + nom).
- Court.
- Jour + heure + durée.
- Saison.
- Prix.

*Colonne 2 — Élèves inscrits (X/capacité)*
- Liste enrollments ACTIVE.
- Bouton `+ Inscrire un adhérent` (modal avec recherche dans les memberships actifs).
- Section "Liste d'attente" si dépassement capacité.

*Colonne 3 — Stats*
- Sessions à venir.
- Sessions passées.
- Taux de présence (sur LessonAttendance).

**Section pleine largeur — Sessions à venir**
- Liste cards par date.
- Sur chaque card : statut (Scheduled / Cancelled), bouton "Annuler", bouton "Faire l'appel" (modal présences).

## Spécification UI — `/club/cours/coachs`

Liste + bouton `+ Nouveau coach`. Cards avec avatar, nom, nombre de groupes actifs, bouton modifier/archiver.

## Critères d'acceptation
- [ ] Migration `add_lessons` clean, n'affecte pas les modèles existants.
- [ ] Publier un `LessonGroup` génère N `LessonSession` correctes (vérifier dates, weekday, heure).
- [ ] Re-publier (idempotence) : ne duplique pas les sessions existantes.
- [ ] Inscrire un élève quand le groupe est plein → WAITING_LIST automatique.
- [ ] Annuler une session ne supprime pas les enrollments.
- [ ] Vue semaine : sessions du lundi affichées au bon créneau, fuseau Europe/Paris.
- [ ] Vue semaine mobile 375px : swipe horizontal entre jours, lisible.
- [ ] Vue mois : filtres par coach/court fonctionnent.
- [ ] Marquer l'appel d'une session crée/met à jour les `LessonAttendance`.
- [ ] Un admin club A ne voit aucune session du club B.

## Hors-scope explicite
- Pas de paiement en ligne des cours (juste champ prix).
- Pas d'auto-inscription côté joueur.
- Pas de gestion des absences avec rattrapage automatique.
- Pas d'export iCal (V2).
- Pas de cours one-shot non récurrents (V2 — pour l'instant tout passe par LessonGroup).

---

# Annexe — Modifs du dashboard principal `/club`

Une fois les 3 chantiers livrés, ajouter dans `app/(dashboard)/club/page.tsx` :

- Dans `CLUB_MAIN_ACTIONS` :
  - `{ href: '/club/adherents', label: 'Adhérents', icon: 'users' }`
  - `{ href: '/club/joueurs', label: 'Suivi joueurs', icon: 'list' }`
  - `{ href: '/club/cours', label: 'Cours', icon: 'calendar' }`
- Dans les KPIs : ajouter "Adhérents actifs" et "Sessions cette semaine".
- Ajouter une nouvelle section "Cours du jour" sous "Tournois actifs" (liste des `LessonSession` SCHEDULED de la journée).

À mentionner explicitement dans le 3ᵉ prompt : "Quand tu as terminé le module cours, ouvre `app/(dashboard)/club/page.tsx` et ajoute la section Cours du jour + l'action de navigation."
