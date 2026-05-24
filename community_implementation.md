# Module Communauté — Guide d'implémentation Cursor
## The Court × Studio Forge

> Généré le 2026-05-24. Ce document est la source de vérité pour l'implémentation du module Communauté.
> Les décisions produit sont toutes tranchées — ne pas les remettre en question, juste les implémenter.

---

## Décisions produit (toutes validées)

| Décision | Choix retenu |
|---|---|
| Qui peut poster dans le feed public ? | Troisième voie : tout membre peut poster, mais visibilité publique réservée aux joueurs avec ≥ 1 tournoi joué. Sinon : visible cercle + club uniquement. |
| Format vidéo | Photo uniquement en V1. Le schéma prévoit `mediaType` pour ne pas migrer en V2. |
| Matchs amicaux | Inclus en V1 (semaine 3). |
| Modération forum | A posteriori : publication immédiate + système de signalement. |
| Moments de tournoi | Phase séparée, après stabilisation du feed et du forum. |
| Promo club dans le feed | Oui dès V1. Les clubs peuvent promouvoir un post vers des non-membres. Marquage "Annonce club" obligatoire. |

---

## 1. Schéma Prisma — Extensions à ajouter

### 1.1 Nouveaux enums

Ajouter à la suite des enums existants dans `prisma/schema.prisma` :

```prisma
enum PostVisibility {
  PUBLIC   // visible par tous (si hasCompletedTournament = true)
  FRIENDS  // visible par les follows mutuels uniquement
  CLUB     // visible par les membres du club uniquement
}

enum PostMediaType {
  IMAGE
  VIDEO // réservé V2 — champ présent, upload bloqué côté frontend en V1
}

enum ReactionType {
  LIKE
  FIRE
  CLAP
}

enum ForumCategory {
  PARTENAIRE
  MATERIEL
  TECHNIQUE
  CLUBS_TERRAINS
  REGLES_ARBITRAGE
  PETITES_ANNONCES
  ORGANISATION
}

enum FriendlyMatchStatus {
  OPEN
  FULL
  CANCELLED
  COMPLETED
}

enum ReportTargetType {
  POST
  COMMENT
  FORUM_THREAD
  FORUM_REPLY
}

enum ReportStatus {
  PENDING
  REVIEWED
  DISMISSED
  ACTION_TAKEN
}
```

### 1.2 Modifications aux enums existants

Remplacer `NotificationKind` par cette version complète :

```prisma
enum NotificationKind {
  TOURNAMENT_REMINDER
  REGISTRATION_CONFIRMED
  WAITING_LIST_PROMOTED
  PARTNER_REQUEST
  MATCH_SCHEDULED
  SCORE_PUBLISHED
  PAYMENT_RECEIVED
  CLUB_ANNOUNCEMENT
  GENERIC
  // Nouvelles valeurs — module Communauté
  POST_REACTION
  POST_COMMENT
  NEW_FOLLOWER
  FRIENDLY_MATCH_JOINED
  FRIENDLY_MATCH_FULL
  CLUB_PROMOTED_POST
  FORUM_REPLY_RECEIVED
}
```

### 1.3 Modification du modèle PlayerProfile

Ajouter dans `PlayerProfile` :

```prisma
  // Communauté — déverrouillage feed public
  // Mis à jour automatiquement quand une TournamentEdition passe en COMPLETED
  // et que le joueur avait une Registration CONFIRMED sur cette édition.
  hasCompletedTournament Boolean @default(false)

  // Nouvelles relations — module Communauté
  posts              Post[]
  postReactions      PostReaction[]
  comments           Comment[]
  forumThreads       ForumThread[]
  forumReplies       ForumReply[]
  friendlyMatches    FriendlyMatch[]            @relation("FriendlyMatchCreator")
  friendlyMatchParts FriendlyMatchParticipant[]
  reports            Report[]
```

### 1.4 Modification du modèle Club

Ajouter dans `Club` :

```prisma
  // Nouvelles relations — module Communauté
  posts           Post[]
  promotedPosts   ClubPromotedPost[]
  friendlyMatches FriendlyMatch[]
```

### 1.5 Nouveaux modèles à ajouter en fin de fichier

```prisma
// ============================================================================
// COMMUNAUTÉ — FEED & POSTS
// ============================================================================

model Post {
  id           String          @id @default(cuid())
  authorId     String
  clubId       String?
  tournamentId String?
  content      String          @db.Text
  mediaUrls    String[]
  mediaType    PostMediaType   @default(IMAGE)
  visibility   PostVisibility  @default(PUBLIC)
  isPromoted   Boolean         @default(false)
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  author    PlayerProfile    @relation(fields: [authorId], references: [id], onDelete: Cascade)
  club      Club?            @relation(fields: [clubId], references: [id], onDelete: SetNull)
  reactions PostReaction[]
  comments  Comment[]
  promotion ClubPromotedPost?
  reports   Report[]         @relation("PostReports")

  @@index([authorId])
  @@index([clubId])
  @@index([visibility, createdAt])
  @@index([isPromoted])
}

model PostReaction {
  id        String       @id @default(cuid())
  postId    String
  authorId  String
  type      ReactionType
  createdAt DateTime     @default(now())

  post   Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  author PlayerProfile @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@unique([postId, authorId, type])
  @@index([postId])
}

model Comment {
  id        String   @id @default(cuid())
  postId    String
  parentId  String?
  authorId  String
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  post    Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent  Comment?      @relation("CommentReplies", fields: [parentId], references: [id], onDelete: SetNull)
  replies Comment[]     @relation("CommentReplies")
  author  PlayerProfile @relation(fields: [authorId], references: [id], onDelete: Cascade)
  reports Report[]      @relation("CommentReports")

  @@index([postId])
  @@index([parentId])
}

// ============================================================================
// COMMUNAUTÉ — PROMOTION CLUB
// ============================================================================

model ClubPromotedPost {
  id          String   @id @default(cuid())
  postId      String   @unique
  clubId      String
  activeFrom  DateTime @default(now())
  activeUntil DateTime
  createdAt   DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  club Club @relation(fields: [clubId], references: [id], onDelete: Cascade)

  @@index([clubId, activeUntil])
}

// ============================================================================
// COMMUNAUTÉ — FORUM
// ============================================================================

model ForumThread {
  id        String        @id @default(cuid())
  category  ForumCategory
  title     String
  authorId  String
  isPinned  Boolean       @default(false)
  isLocked  Boolean       @default(false)
  tags      String[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  author  PlayerProfile @relation(fields: [authorId], references: [id], onDelete: Cascade)
  replies ForumReply[]
  reports Report[]      @relation("ThreadReports")

  @@index([category, createdAt])
  @@index([isPinned])
  // Index full-text à ajouter manuellement dans la migration SQL :
  // CREATE INDEX "forum_thread_fts_idx" ON "ForumThread" USING GIN (to_tsvector('french', "title"));
}

model ForumReply {
  id        String   @id @default(cuid())
  threadId  String
  parentId  String?
  authorId  String
  content   String   @db.Text
  votes     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  thread  ForumThread   @relation(fields: [threadId], references: [id], onDelete: Cascade)
  parent  ForumReply?   @relation("ReplyReplies", fields: [parentId], references: [id], onDelete: SetNull)
  replies ForumReply[]  @relation("ReplyReplies")
  author  PlayerProfile @relation(fields: [authorId], references: [id], onDelete: Cascade)
  reports Report[]      @relation("ReplyReports")

  @@index([threadId, votes])
}

// ============================================================================
// COMMUNAUTÉ — MATCHS AMICAUX
// ============================================================================

model FriendlyMatch {
  id          String              @id @default(cuid())
  creatorId   String
  clubId      String?
  city        String
  date        DateTime
  levelMin    String?
  levelMax    String?
  spotsTotal  Int
  spotsLeft   Int
  description String?             @db.Text
  status      FriendlyMatchStatus @default(OPEN)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  creator      PlayerProfile              @relation("FriendlyMatchCreator", fields: [creatorId], references: [id], onDelete: Cascade)
  club         Club?                      @relation(fields: [clubId], references: [id], onDelete: SetNull)
  participants FriendlyMatchParticipant[]

  @@index([city, date])
  @@index([status, date])
}

model FriendlyMatchParticipant {
  id              String   @id @default(cuid())
  matchId         String
  playerProfileId String
  joinedAt        DateTime @default(now())

  match  FriendlyMatch @relation(fields: [matchId], references: [id], onDelete: Cascade)
  player PlayerProfile @relation(fields: [playerProfileId], references: [id], onDelete: Cascade)

  @@unique([matchId, playerProfileId])
}

// ============================================================================
// COMMUNAUTÉ — MODÉRATION (a posteriori)
// ============================================================================

model Report {
  id         String           @id @default(cuid())
  reporterId String
  targetType ReportTargetType
  targetId   String
  reason     String           @db.Text
  status     ReportStatus     @default(PENDING)
  reviewedAt DateTime?
  reviewNote String?          @db.Text
  createdAt  DateTime         @default(now())

  reporter    PlayerProfile @relation(fields: [reporterId], references: [id], onDelete: Cascade)
  post        Post?         @relation("PostReports", fields: [targetId], references: [id], onDelete: Cascade, map: "report_post_fk")
  comment     Comment?      @relation("CommentReports", fields: [targetId], references: [id], onDelete: Cascade, map: "report_comment_fk")
  forumThread ForumThread?  @relation("ThreadReports", fields: [targetId], references: [id], onDelete: Cascade, map: "report_thread_fk")
  forumReply  ForumReply?   @relation("ReplyReports", fields: [targetId], references: [id], onDelete: Cascade, map: "report_reply_fk")

  @@index([targetType, status])
  @@index([reporterId])
}
```

---

## 2. Commande de migration

```bash
npx prisma migrate dev --name add_community_module
```

Puis ajouter manuellement dans le fichier SQL généré dans `prisma/migrations/` :

```sql
CREATE INDEX "forum_thread_fts_idx" ON "ForumThread" USING GIN (to_tsvector('french', "title"));
```

---

## 3. Plan de travail mis à jour — 6 semaines

### Semaine 1 — Schéma & fondations
- [ ] Ajouter tous les enums et modèles dans `schema.prisma`
- [ ] `npx prisma migrate dev --name add_community_module`
- [ ] Ajouter l'index full-text manuellement dans la migration SQL
- [ ] Vérifier que `npx prisma generate` passe sans erreur
- [ ] Créer `lib/community/visibility.ts` — logique de visibilité des posts

### Semaine 2 — Feed public + Post basique
- [ ] Composant `<PostCard />` (photo, texte, réactions)
- [ ] Page `/feed` publique (20 posts, pagination cursor-based)
- [ ] Action "publier un post" + upload image Scaleway
- [ ] Réactions (like / fire / clap) via Server Action
- [ ] Auto-publication des résultats de tournois dans le feed

### Semaine 3 — Feed privé + Relations + Matchs amicaux
- [ ] Page `/mon-feed` (filtrage par follows, chronologique)
- [ ] Action "suivre / ne plus suivre un joueur" avec optimistic update
- [ ] Notification `NEW_FOLLOWER`
- [ ] Format de post "Score de match" (UI structurée)
- [ ] Page `/matchs-amicaux` — liste + création + rejoindre

### Semaine 4 — Espaces de club
- [ ] Page `/club/[slug]/communaute` (accès membres uniquement)
- [ ] Annonces club épinglées (prioritaires dans le feed)
- [ ] Dashboard club : modération des posts, promotion
- [ ] `ClubPromotedPost` — max 1 actif/semaine, marquage "Annonce club"
- [ ] Classement interne du club

### Semaine 5 — Forum
- [ ] Page `/forum` — liste des catégories
- [ ] Page `/forum/[categorie]` — threads avec tri date/votes
- [ ] Page `/forum/[categorie]/[threadId]` — thread + réponses
- [ ] Créer thread, répondre, voter
- [ ] Thread épinglé (admin), thread verrouillé
- [ ] Recherche full-text PostgreSQL

### Semaine 6 — Modération, polish & tests
- [ ] Bouton "Signaler" sur Post, Comment, ForumThread, ForumReply
- [ ] Interface modérateur `/admin/moderation`
- [ ] Mobile-first sur tous les composants (touch targets ≥ 44px)
- [ ] Pagination "load more" cursor-based sur tous les feeds
- [ ] Tests Playwright : publier, réagir, suivre, match amical, forum
- [ ] Revue accessibilité complète

---

## 4. Prompts Cursor — par semaine

---

### PROMPT SEMAINE 1 — Logique de visibilité des posts

```
Contexte :
Tu travailles sur "The Court", une plateforme Next.js 15 App Router de gestion de tournois de padel.
Stack : Next.js 15, TypeScript, Prisma, PostgreSQL (Neon), Tailwind CSS, Auth.js v5.

Tâche :
Crée le fichier `lib/community/visibility.ts`.

Ce fichier expose une fonction `getPostFeedQuery` utilisée partout où on affiche des posts.

Règles de visibilité (non négociables) :
1. Un post avec visibility = PUBLIC est visible par tout le monde, MAIS uniquement si
   l'auteur a PlayerProfile.hasCompletedTournament = true.
   Si hasCompletedTournament = false, le post est traité comme FRIENDS même si visibility = PUBLIC.
2. Un post avec visibility = FRIENDS est visible uniquement par les utilisateurs qui
   suivent l'auteur (relation Follow asymétrique) et par l'auteur lui-même.
3. Un post avec visibility = CLUB est visible uniquement par les membres du club
   (ClubMembership avec isActive = true) et par l'auteur lui-même.
4. Les posts isPromoted = true d'un club apparaissent dans le feed de tout utilisateur
   connecté, même non-membre et non-follower.
   Vérifier que ClubPromotedPost.activeUntil > now().

La fonction accepte :
- viewerId: string | null (null = visiteur non connecté)
- viewerPlayerProfileId: string | null
- context: 'public_feed' | 'private_feed' | 'club_feed'
- clubId?: string (requis si context = 'club_feed')

Elle retourne un objet Prisma.PostWhereInput passable directement à prisma.post.findMany({ where: ... }).

Exporter aussi le type FeedContext pour réutilisation.

Contraintes :
- Pas de requêtes N+1 : construire la clause WHERE sans requêtes imbriquées côté TypeScript.
- Typer strictement avec les types Prisma générés.
- Ajouter des commentaires expliquant chaque branche de visibilité.
```

---

### PROMPT SEMAINE 2 — PostCard + Feed public + Auto-publication tournois

```
Contexte :
The Court — Next.js 15 App Router, TypeScript, Prisma, Tailwind CSS, Auth.js v5.
`lib/community/visibility.ts` est créé avec la fonction `getPostFeedQuery`.
Les images sont stockées sur Scaleway Object Storage (client S3 déjà configuré dans le projet).

Tâche 1 — Composant PostCard :
Crée `components/community/PostCard.tsx`.

Affiche :
- Avatar + nom de l'auteur (lien vers /joueur/[id])
- Contenu textuel (max 500 chars affichés, pas de troncature si <= 500)
- Image si mediaUrls non vide — next/image, objectFit cover, ratio 16/9, une seule image en V1
- Badge "Annonce club" si isPromoted = true (style distinct, ex: fond amber)
- 3 boutons de réaction : 👍 LIKE, 🔥 FIRE, 👏 CLAP avec le compte de chaque type
  - Le bouton de la réaction active de l'utilisateur est visuellement mis en évidence
  - Les réactions nécessitent une session (sinon rediriger vers /connexion)
- Nombre de commentaires (lien vers /post/[id])
- Date relative en français (date-fns/fr)

Server Action `toggleReaction(postId: string, type: ReactionType)` dans
`app/actions/community/post-reactions.ts` :
- Si la réaction existe déjà pour cet utilisateur → la supprimer
- Sinon → la créer
- Revalider uniquement le path du feed concerné
- Gérer l'erreur si pas de session (retourner { error: 'unauthenticated' })

Tâche 2 — Page Feed public :
Crée `app/feed/page.tsx` (Server Component).
- Récupère les 20 posts les plus récents via getPostFeedQuery('public_feed', null, null)
- Inclut les posts promus actifs (isPromoted = true, activeUntil > now())
- Liste de <PostCard /> + bouton "Charger plus" (pagination cursor-based sur createdAt)
- État vide si aucun post : "Sois le premier à partager un moment de jeu"
- Accessible sans connexion

Tâche 3 — Auto-publication des résultats de tournois :
Crée `lib/community/tournament-feed.ts` avec la fonction
`publishTournamentResultsToFeed(tournamentEditionId: string)`.

Cette fonction :
1. Récupère l'édition avec le tournoi, le club, et les 3 premières équipes (via Match et MatchScore)
2. Génère un texte : "🏆 [Nom du tournoi] — [Club] — [Date formatée]\n1er : [Équipe A] · 2e : [Équipe B] · 3e : [Équipe C]"
3. Crée un Post avec authorId = PlayerProfile du compte CLUB, visibility = PUBLIC, isPromoted = false
4. Met à jour hasCompletedTournament = true pour tous les PlayerProfile ayant une Registration
   CONFIRMED sur cette édition (prisma.playerProfile.updateMany en batch)
5. Toutes ces opérations dans une transaction Prisma

Appelle cette fonction depuis le code existant qui met TournamentEdition.status = COMPLETED.
Wrapper dans un try/catch — ne jamais faire crasher le flux principal si cette fonction échoue.

Contraintes générales :
- Pagination cursor-based uniquement (pas d'offset).
- Typer toutes les props et retours avec les types Prisma.
- Pas de fetch côté client pour le chargement initial du feed.
```

---

### PROMPT SEMAINE 3 — Feed privé + Follow + Matchs amicaux

```
Contexte :
The Court — Next.js 15, Prisma, Auth.js v5.
Le modèle Follow existe (followerId, followedId sur PlayerProfile).
Les modèles FriendlyMatch et FriendlyMatchParticipant sont dans le schéma.
getPostFeedQuery est disponible dans lib/community/visibility.ts.

Tâche 1 — Feed privé :
Crée `app/(authenticated)/mon-feed/page.tsx`.
- Redirige vers /connexion si pas de session.
- Récupère les posts via getPostFeedQuery('private_feed', viewerId, viewerPlayerProfileId)
  (posts des joueurs suivis + posts promus actifs + propres posts)
- Triés par createdAt DESC, pagination cursor-based
- Réutilise <PostCard />
- Formulaire de création de post intégré en haut du feed (voir Tâche 2)

Tâche 2 — Créer un post :
Crée `components/community/NewPostForm.tsx` (Client Component).
- Textarea : max 500 chars avec compteur live
- Upload photo : 1 image max, 5 Mo max, formats jpg/png/webp uniquement
  Bloquer vidéo côté input : accept="image/jpeg,image/png,image/webp"
  Ajouter un commentaire // V2: débloquer VIDEO ici
- Sélecteur de visibilité : PUBLIC / FRIENDS / CLUB
  Si CLUB sélectionné : afficher un <select> avec les clubs dont l'utilisateur est membre active
- Server Action `createPost` dans `app/actions/community/create-post.ts` :
  - Upload image sur Scaleway Object Storage
  - Crée le Post en base
  - Si visibility = PUBLIC et hasCompletedTournament = false : stocker PUBLIC (le filtre
    getPostFeedQuery gère la visibilité différée, pas besoin de changer le champ)
  - revalidatePath('/feed') et revalidatePath('/mon-feed')

Tâche 3 — Suivre / ne plus suivre :
Crée `components/community/FollowButton.tsx` (Client Component).
- Utilise useOptimistic (React 19) pour l'état du bouton
- Server Action `toggleFollow(targetPlayerProfileId: string)` dans
  `app/actions/community/follow.ts` :
  - Toggle : crée ou supprime le Follow
  - Si nouveau follow : crée une Notification NEW_FOLLOWER pour le joueur suivi
  - revalidatePath sur la page profil du joueur suivi

Tâche 4 — Matchs amicaux :
Crée `app/matchs-amicaux/page.tsx` :
- Liste des FriendlyMatch avec status = OPEN et date > now(), triés par date ASC
- Filtres : ville (text), date (date picker)
- Carte par match : ville, date, niveau, spotsLeft/spotsTotal, bouton "Rejoindre"
- Accessible sans connexion (lecture), rejoindre nécessite une session

Crée `app/matchs-amicaux/nouveau/page.tsx` :
- Guard Auth.js
- Formulaire : ville, date+heure, levelMin/levelMax (textes libres), spotsTotal (radio: 2 ou 4),
  description optionnelle (max 300 chars), club associé (select parmi les clubs membres, optionnel)
- Server Action `createFriendlyMatch` dans `app/actions/community/friendly-match.ts`

Server Action `joinFriendlyMatch(matchId: string)` :
- Transaction Prisma :
  1. Récupère le match avec un verrou (select for update si possible, sinon vérification atomique)
  2. Vérifie status = OPEN et spotsLeft > 0
  3. Crée FriendlyMatchParticipant
  4. Décrémente spotsLeft
  5. Si spotsLeft atteint 0 → status = FULL
- Notification FRIENDLY_MATCH_JOINED pour le créateur
- Si FULL → notification FRIENDLY_MATCH_FULL pour tous les participants

Contraintes :
- Touch targets ≥ 44px sur tous les éléments interactifs.
- useOptimistic pour le bouton Follow.
- Transaction sur joinFriendlyMatch pour éviter les race conditions.
```

---

### PROMPT SEMAINE 4 — Espaces de club

```
Contexte :
The Court — Next.js 15, Prisma, Auth.js v5.
ClubMembership (playerProfileId, clubId, isActive), ClubPromotedPost sont dans le schéma.
Règle produit : un seul ClubPromotedPost actif (activeUntil > now()) par club à la fois.
Les posts promus doivent afficher un badge "Annonce club" visible et distinct.

Tâche 1 — Page espace club :
Crée `app/club/[slug]/communaute/page.tsx`.

Logique d'accès :
- Si l'utilisateur n'est pas connecté ou n'a pas de ClubMembership actif pour ce club :
  afficher "Cet espace est réservé aux membres du club [Nom]" + bouton "Demander à rejoindre"
  (le bouton n'implémente rien pour l'instant — juste un placeholder visuel)
- Si l'utilisateur est membre : afficher le feed du club

Contenu du feed club (dans l'ordre) :
1. Posts épinglés : isPromoted = true, clubId = ce club, activeUntil > now()
2. Tous les posts avec visibility = CLUB et clubId = ce club, triés par createdAt DESC
Réutiliser <PostCard /> avec un prop showClubBadge pour l'affichage du badge.

Formulaire "Publier une annonce" en haut (visible uniquement pour le compte CLUB du club,
c'est-à-dire le User avec role = CLUB et ClubProfile.clubId = ce club).

Tâche 2 — Dashboard modération club :
Crée `app/club/[slug]/dashboard/communaute/page.tsx`.
- Réservé au compte CLUB propriétaire du club (vérifier ClubProfile.clubId = ce club)
- Liste tous les posts des membres (tous visibility, tous statuts)
- Actions sur chaque post :
  - Épingler : crée un ClubPromotedPost (vérifier qu'il n'y en a pas déjà un actif)
  - Désépingler : supprime le ClubPromotedPost, remet Post.isPromoted = false
  - Supprimer : supprime le Post

Tâche 3 — Server Actions club :
`app/actions/community/promote-post.ts` — `promoteClubPost(postId: string, clubId: string)` :
- Vérifie qu'il n'existe pas de ClubPromotedPost avec activeUntil > now() pour ce club
  Si oui : retourner { error: 'Un post est déjà promu cette semaine' }
- Crée ClubPromotedPost avec activeFrom = now(), activeUntil = now() + 7 jours
- Met Post.isPromoted = true
- Crée une Notification CLUB_PROMOTED_POST pour les membres du club

`app/actions/community/unpin-post.ts` — `unpromoteClubPost(postId: string)` :
- Supprime le ClubPromotedPost lié à ce post
- Met Post.isPromoted = false

Contraintes :
- Revalider uniquement /club/[slug]/communaute et /club/[slug]/dashboard/communaute
- La vérification du max 1 post promu/semaine doit être atomique (transaction Prisma)
```

---

### PROMPT SEMAINE 5 — Forum

```
Contexte :
The Court — Next.js 15, Prisma, Auth.js v5.
ForumThread et ForumReply sont dans le schéma.
L'index full-text forum_thread_fts_idx est créé sur ForumThread.title (pg tsvector, french).
Catégories disponibles : PARTENAIRE, MATERIEL, TECHNIQUE, CLUBS_TERRAINS,
REGLES_ARBITRAGE, PETITES_ANNONCES, ORGANISATION.

Labels français pour les catégories (à mettre dans une constante) :
PARTENAIRE → "Cherche partenaire"
MATERIEL → "Matériel"
TECHNIQUE → "Technique & tactique"
CLUBS_TERRAINS → "Clubs & terrains"
REGLES_ARBITRAGE → "Règles & arbitrage"
PETITES_ANNONCES → "Petites annonces"
ORGANISATION → "Organisation"

Tâche 1 — Page liste des catégories : `app/forum/page.tsx`
- Affiche les 7 catégories avec : label, nombre de threads, date du dernier thread
- Barre de recherche full-text (submit → page /forum/recherche?q=...)
- Accessible sans connexion

Tâche 2 — Page catégorie : `app/forum/[categorie]/page.tsx`
- Liste des threads de cette catégorie
- Threads isPinned en premier (toujours), ensuite triés par date ou votes (toggle UI)
- 20 threads par page, pagination cursor-based
- Accessible sans connexion

Tâche 3 — Page thread : `app/forum/[categorie]/[threadId]/page.tsx`
- Affiche le contenu du thread (premier post = contenu du thread)
- Réponses racines triées par votes DESC
- Sous-réponses (parentId non null) triées par createdAt ASC sous leur parent
- Formulaire de réponse en bas (nécessite session)
- Si isLocked = true : afficher "Ce thread est verrouillé" et masquer le formulaire

Tâche 4 — Server Actions dans `app/actions/community/forum.ts` :

`createThread({ category, title, content, tags })` :
- Crée ForumThread + une ForumReply racine avec le contenu
- Redirige vers /forum/[categorie]/[threadId]

`createReply({ threadId, parentId?, content })` :
- Vérifie que le thread n'est pas isLocked
- Crée ForumReply
- Crée une Notification FORUM_REPLY_RECEIVED pour l'auteur du thread
  (pas de notif si l'auteur répond à son propre thread)
- revalidatePath sur la page du thread

`voteReply(replyId: string, direction: 'up' | 'down')` :
- Incrémente ou décrémente ForumReply.votes
- Un même utilisateur peut voter plusieurs fois (pas de modèle ForumReplyVote en V1 — simple)
- revalidatePath sur la page du thread

`pinThread(threadId: string)` :
- Réservé aux users avec role = ADMIN
- Toggle isPinned

Tâche 5 — Recherche full-text : `app/forum/recherche/page.tsx`
```ts
const results = await prisma.$queryRaw`
  SELECT id, title, category, "createdAt"
  FROM "ForumThread"
  WHERE to_tsvector('french', title) @@ plainto_tsquery('french', ${query})
  ORDER BY ts_rank(to_tsvector('french', title), plainto_tsquery('french', ${query})) DESC
  LIMIT 20
`
```
Afficher les résultats avec lien vers chaque thread.

Contraintes :
- Mobile-first sur tous les composants forum.
- Threads verrouillés : vérifier côté Server Action ET afficher message côté UI.
```

---

### PROMPT SEMAINE 6 — Système de signalement + Modération

```
Contexte :
The Court — Next.js 15, Prisma, Auth.js v5.
Le modèle Report est dans le schéma avec ReportTargetType (POST, COMMENT, FORUM_THREAD, FORUM_REPLY)
et ReportStatus (PENDING, REVIEWED, DISMISSED, ACTION_TAKEN).

Tâche 1 — Bouton Signaler :
Crée `components/community/ReportButton.tsx` (Client Component).
Props : targetType: ReportTargetType, targetId: string.
- Affiche une icône drapeau discrète (ex: FlagIcon de lucide-react, taille sm, couleur gris)
- Au clic : ouvre une modale avec :
  - Titre "Signaler ce contenu"
  - Textarea "Raison" (max 300 chars, obligatoire)
  - Bouton "Signaler" + bouton "Annuler"
- Nécessite une session (sinon : "Connecte-toi pour signaler")

Server Action `submitReport(targetType, targetId, reason)` dans
`app/actions/community/report.ts` :
- Vérifie session
- Vérifie qu'un Report n'existe pas déjà de cet utilisateur pour ce targetId
  Si oui : retourner { error: 'Tu as déjà signalé ce contenu' }
- Crée Report avec status = PENDING

Intégrer ReportButton dans :
- <PostCard /> → menu "..." (DropdownMenu) en haut à droite, option "Signaler"
- <Comment /> → menu "..." identique
- Page thread forum → sur chaque ForumReply + sur le thread lui-même

Tâche 2 — Interface modérateur :
Crée `app/admin/moderation/page.tsx`.
- Guard strict : role = ADMIN uniquement (sinon 403)
- Récupère les Reports avec status = PENDING, triés par createdAt DESC
- Pour chaque Report :
  - Type de contenu (badge coloré : Post / Commentaire / Thread / Réponse)
  - Extrait du contenu signalé (50 chars max — si contenu supprimé : "[Contenu supprimé]")
  - Raison du signalement
  - Date
  - Lien "Voir le contenu" → route vers le post/thread concerné
  - Actions : bouton "Ignorer" + bouton "Action prise" (ouvre un champ note optionnel)

Server Action `reviewReport(reportId: string, status: 'DISMISSED' | 'ACTION_TAKEN', note?: string)`
dans `app/actions/admin/review-report.ts` :
- Vérifie role = ADMIN
- Met à jour Report.status, Report.reviewedAt = now(), Report.reviewNote = note
- revalidatePath('/admin/moderation')

Contraintes :
- Si le contenu signalé a été supprimé (relation null) : afficher "[Contenu supprimé]" sans erreur.
- Pagination offset acceptable ici (faible volume de signalements attendu en V1).
- L'interface doit fonctionner sur mobile (le modérateur peut être sur téléphone).
```

---

## 5. Règles transversales pour Cursor

Ces règles s'appliquent à toutes les semaines sans exception :

1. **Pas de requêtes N+1.** Toujours utiliser `include` ou `select` Prisma pour récupérer les relations en une seule requête.

2. **Server Actions pour toutes les mutations.** Pas de routes API `/api/` pour les mutations du module Communauté — utiliser `'use server'` directement.

3. **Revalidation ciblée.** Après chaque mutation, `revalidatePath` uniquement sur les pages impactées — pas de revalidation globale.

4. **Auth.js pour les guards.** Toujours vérifier la session avec `auth()` d'Auth.js v5 avant toute mutation. Retourner `{ error: 'unauthenticated' }` si pas de session — pas de throw.

5. **Pagination cursor-based** sur tous les feeds et listes (pas d'offset). Utiliser `createdAt` comme curseur par défaut.

6. **Mobile-first.** Touch targets ≥ 44px, pas de hover-only interactions.

7. **Pas de vidéo en V1.** Le champ `mediaType` existe dans le schéma mais le frontend n'accepte que `image/*` dans les `<input type="file">`. Ajouter un commentaire `// V2: débloquer VIDEO ici` là où la restriction est appliquée.

8. **Typage strict.** Toujours utiliser les types Prisma générés. Pas de `any`.

---

*The Court × Studio Forge — Généré le 2026-05-24*


---

## État d'implémentation (mise à jour 24/05/2026)

Le plan en 6 semaines ci-dessus est **implémenté**. Présent dans le code déployé :

**Schéma & logique** (`prisma/schema.prisma`, migration `20260524120000_add_community_module`)
- Enums communauté (PostVisibility, ReactionType, ForumCategory, FriendlyMatchStatus, ReportTargetType, ReportStatus…), modèles Post/Reaction/Follow/FriendlyMatch/Forum/Report.
- `lib/community/` : visibilité des posts, posts, feed tournois, accès club, catégories & requêtes forum, signalement.

**Server actions** (`lib/actions/community/`)
- `create-post`, `feed`, `follow`, `forum`, `friendly-match`, `post-reactions`, `promote-post`, `unpin-post`, `report` ; modération admin (`lib/actions/admin/review-report`).

**Pages & composants**
- Pages : `/feed`, `/mon-feed`, `/post/[id]`, `/forum` (+ `[categorie]`, `[categorie]/[threadId]`, `/recherche`), `/matchs-amicaux` (+ `/nouveau`), `/joueur/[id]`, `/club/[slug]/communaute`, `/club/[slug]/dashboard/communaute`, `/admin/moderation`.
- Composants `components/community/` : FeedList, PrivateFeedList, PostCard, NewPostForm, FollowButton, ForumReply*, FriendlyMatch*, ClubModerationPanel, ModerationPanel, ReportButton, etc.

**À noter** — l'accès aux espaces communauté de club et à la modération dépend du système d'auth, qui présente des points ouverts (gating de rôle/statut). Voir **[DIAGNOSTIC-AUTH-ET-CONNECTIVITE.md](./DIAGNOSTIC-AUTH-ET-CONNECTIVITE.md)**.
