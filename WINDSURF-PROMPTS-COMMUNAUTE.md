# Prompts Windsurf — Module Communauté (Chat, WhatsApp, Feed+)

Ce fichier contient **4 prompts autonomes** à coller dans Windsurf, dans l'ordre indiqué.

**Ordre recommandé** :
1. Prompt 1 — Fondation messagerie (schéma + server actions + page `/messages`)
2. Prompt 2 — Bulle flottante + temps réel Pusher + salon club auto
3. Prompt 3 — WhatsApp deep link (option A retenue)
4. Prompt 4 — Feed social+ (mentions, profil public, hashtags)

Les prompts 1 et 2 doivent être traités dans l'ordre. Les prompts 3 et 4 sont indépendants.

---

## Préfixe à coller AU DÉBUT de chaque prompt Windsurf

> Tu travailles sur **The Court**, plateforme padel (Next.js 14 App Router + Prisma + Postgres Neon + NextAuth v5 + TailwindCSS). Le schéma Prisma est dans `prisma/schema.prisma` (source de vérité, > 1000 lignes). Les server actions vivent dans `lib/actions/`. Le module Communauté existant utilise `lib/community/` (helpers visibilité, posts, forum) et `components/community/` (UI Feed, Forum, Matchs amicaux, Modération).
>
> **Règles non négociables** :
> - Toute modif du modèle de données passe par `npx prisma migrate dev --name <nom_explicite>`. NE JAMAIS éditer une migration existante.
> - Server Components par défaut. Client Components (`'use client'`) seulement si interactivité (formulaires, listes en temps réel, panneau flottant).
> - Mobile-first. Tester à 375px de large. La bulle de chat doit passer en drawer plein écran < 768px.
> - Design system : variables CSS du fichier `app/globals.css` (`--court-700`, `--court-100`, `--gold-500`, `--gold-700`, `--bg-base`, `--bg-surface`, `--bg-muted`, `--border-subtle`, `--text-primary`, `--text-secondary`, `--text-muted`, `--color-danger`, `--font-display`, `--ink-950`, `--paper-50`, `--cream-50`). Reproduire les patterns visuels de `app/feed/page.tsx` et `app/forum/page.tsx`.
> - Tous les libellés en français.
> - Validation Zod systématique pour les inputs de server actions.
> - Localiser les dates en `fr-FR`, format court (`date-fns/locale/fr` déjà installé via `formatDistanceToNow`).
> - Ne jamais inventer un champ Prisma : si une donnée manque, ajouter une migration explicite et le préciser dans ta réponse.
> - Ne pas casser le module Communauté existant (Feed, Forum, Matchs amicaux, Modération sont en prod).
> - Les notifications passent par le modèle `Notification` existant. Ajouter une valeur à l'enum `NotificationKind` si besoin et le mentionner.

---

# PROMPT 1 — Fondation messagerie (DM, groupes, salon club)

## Mission
Construire la **fondation de la messagerie** de The Court : modèle de données, server actions, et page `/messages` plein écran. Trois usages couverts par un seul moteur :
- **DM 1:1** entre deux joueurs (`kind=DIRECT`)
- **Groupe** ad hoc (`kind=GROUP`, ex. participants d'un match amical)
- **Salon de club** (`kind=CLUB`, un par club, rejoint automatiquement à l'adhésion)

Pas de temps réel dans ce prompt : juste la fondation persistée + UI avec rafraîchissement manuel + bouton "Actualiser". Le live (Pusher) est ajouté au Prompt 2.

## Spécificités à respecter
- Une **conversation DIRECT** est unique pour un couple de participants : si A écrit déjà à B, on rouvre la conv existante au lieu d'en créer une nouvelle.
- Un **salon CLUB** n'a qu'une seule instance par club. Tous les membres `ClubMembership.status = ACTIVE` y sont participants. L'ajout automatique se fait à la création de la `ClubMembership` (hook côté server action existante).
- Un **groupe GROUP** a un titre et un créateur admin.
- Un message peut être édité (15 min après envoi) ou supprimé (soft delete = `deletedAt` non null, affiché "Message supprimé").
- `lastReadAt` par participant pour calculer les non-lus.
- Un participant peut **mute** une conversation (`mutedUntil`), pas de notif tant que la date n'est pas dépassée.
- Aucun upload média dans ce prompt — `mediaUrls` reste vide. L'upload sera ajouté en V2.

## Modèle de données — migration à créer

**Nom suggéré** : `npx prisma migrate dev --name add_messaging`

```prisma
enum ConversationKind {
  DIRECT   // 1:1 entre 2 joueurs
  GROUP    // groupe ad hoc (titre obligatoire, créateur admin)
  CLUB     // salon club (un seul par club, auto-rejoint)
}

enum ConversationRole {
  MEMBER
  ADMIN
}

model Conversation {
  id            String           @id @default(cuid())
  kind          ConversationKind
  clubId        String?          @unique  // seulement pour kind=CLUB, unique
  title         String?          // requis pour GROUP, sinon null
  createdById   String?          // PlayerProfile.id du créateur (null pour CLUB auto)
  createdAt     DateTime         @default(now())
  lastMessageAt DateTime?        // mis à jour à chaque nouveau message
  updatedAt     DateTime         @updatedAt

  club         Club?                     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  participants ConversationParticipant[]
  messages     Message[]

  @@index([kind, lastMessageAt])
}

model ConversationParticipant {
  id              String           @id @default(cuid())
  conversationId  String
  playerProfileId String
  role            ConversationRole @default(MEMBER)
  joinedAt        DateTime         @default(now())
  lastReadAt      DateTime?
  mutedUntil      DateTime?
  leftAt          DateTime?        // soft leave pour GROUP/CLUB

  conversation Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  player       PlayerProfile @relation(fields: [playerProfileId], references: [id], onDelete: Cascade)

  @@unique([conversationId, playerProfileId])
  @@index([playerProfileId, lastReadAt])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  authorId       String   // PlayerProfile.id
  content        String   @db.Text
  mediaUrls      String[] // vide en V1
  replyToId      String?  // citation/réponse
  editedAt       DateTime?
  deletedAt      DateTime?
  createdAt      DateTime @default(now())

  conversation Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  author       PlayerProfile @relation(fields: [authorId], references: [id], onDelete: Cascade)
  replyTo      Message?      @relation("MessageReplies", fields: [replyToId], references: [id], onDelete: SetNull)
  replies      Message[]     @relation("MessageReplies")

  @@index([conversationId, createdAt])
  @@index([authorId])
}
```

### Ajouts aux modèles existants

Dans `PlayerProfile`, ajouter :
```prisma
  conversationParticipations ConversationParticipant[]
  messages                   Message[]
```

Dans `Club`, ajouter :
```prisma
  conversation Conversation?
```

Dans l'enum `NotificationKind`, ajouter :
```prisma
  NEW_MESSAGE
  MENTION_IN_MESSAGE
```

### Index unique partiel pour DIRECT
Postgres ne supporte pas nativement un unique partial via Prisma. À la place, dans la migration générée, ajouter manuellement :
```sql
CREATE UNIQUE INDEX "Conversation_direct_pair_unique"
  ON "Conversation" ("kind")
  WHERE FALSE; -- placeholder, vraie unicité gérée applicativement
```
> En pratique, l'unicité d'une conv DIRECT entre deux participants est garantie côté code via la server action `getOrCreateDirectConversation` (cf. plus bas).

## Routes & fichiers à créer

```
app/messages/
├── layout.tsx                    // wrapper auth (requireAuth), SiteHeader masquée optionnel
├── page.tsx                      // liste des conversations + état vide
└── [conversationId]/
    └── page.tsx                  // fil de messages + composer

components/community/messaging/
├── ConversationList.tsx          // Server Component, liste avec badge non-lus
├── ConversationListItem.tsx
├── MessageThread.tsx             // Client Component (state local + bouton actualiser)
├── MessageBubble.tsx
├── MessageComposer.tsx           // Client Component avec form action
├── NewConversationDialog.tsx     // Client Component (recherche joueurs, démarrer DM ou groupe)
└── ConversationHeader.tsx

lib/actions/messaging.ts          // server actions (créer ce fichier)
lib/messaging/queries.ts          // helpers de requête (créer ce fichier)
lib/messaging/serializers.ts      // mappers vers types UI
```

## Server actions à exposer (`lib/actions/messaging.ts`)

```ts
// Toutes les actions :
// - vérifient via auth() que le user est connecté
// - récupèrent le PlayerProfile du caller
// - vérifient que le caller est participant actif (pas leftAt) de la conv concernée
// - retournent { ok: true, data } | { ok: false, error }
// - appellent revalidatePath('/messages') ou revalidatePath(`/messages/${id}`) après mutation

listMyConversations(): Promise<Array<{
  id: string;
  kind: ConversationKind;
  title: string | null;
  clubName: string | null;
  participants: Array<{ id: string; firstName: string; lastName: string; avatarUrl: string | null }>;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  muted: boolean;
}>>

getOrCreateDirectConversation(otherPlayerProfileId: string): Promise<{ ok: true; conversationId: string } | { ok: false; error: string }>
// Cherche une conv DIRECT dont les 2 participants sont exactement {caller, other}.
// Si trouvée, la renvoie. Sinon, la crée. Bloque le DM avec soi-même.

createGroupConversation(input: {
  title: string;             // 2..80 chars
  participantIds: string[];  // au moins 1 autre que le caller, max 20
}): Promise<{ ok: true; conversationId: string } | { ok: false; error: string }>

listMessages(conversationId: string, cursor?: { beforeId: string }): Promise<{
  messages: Array<SerializedMessage>;
  nextCursor: { beforeId: string } | null;
}>
// Page size 50, ordre antéchronologique pour le composer, réordonné asc côté UI.

sendMessage(input: {
  conversationId: string;
  content: string;           // 1..4000 chars après trim
  replyToId?: string;
}): Promise<{ ok: true; messageId: string } | { ok: false; error: string }>
// Met à jour conversation.lastMessageAt = now()
// Crée une Notification NEW_MESSAGE pour chaque autre participant non muté (mutedUntil null ou < now())

editMessage(messageId: string, content: string): Promise<ActionResult>
// Autorisé si caller == author ET createdAt > now() - 15min ET pas deletedAt

deleteMessage(messageId: string): Promise<ActionResult>
// Soft delete : deletedAt = now(). Author OU admin de la conv.

markConversationRead(conversationId: string): Promise<void>
// participant.lastReadAt = now()

muteConversation(conversationId: string, hours: 1 | 8 | 24 | null): Promise<void>
// null = unmute. mutedUntil = now()+hours ou null.

leaveConversation(conversationId: string): Promise<ActionResult>
// Pour GROUP uniquement. participant.leftAt = now(). Refuser pour DIRECT et CLUB.
```

Valider tous les inputs avec Zod. Refuser proprement si caller n'est pas participant.

## Hook automatique salon club

Dans la server action existante qui crée une `ClubMembership` (à grep dans `lib/actions/`), ajouter après création :
1. Si la `Conversation` du club n'existe pas → la créer (`kind=CLUB`, `clubId=...`, `title="Salon " + club.name`).
2. Ajouter le `PlayerProfile` du nouvel adhérent comme `ConversationParticipant` (`role=MEMBER`).

Faire la même chose lors d'un import en masse d'adhérents (si action existe).

Lors d'un `archiveClubMember` ou passage en `CANCELLED`, mettre `leftAt = now()` sur le participant correspondant (pas de delete).

## Spécification UI

### `/messages` — Liste des conversations

**Layout**
- Pleine largeur sur mobile, deux colonnes sur ≥ 768px (liste à gauche `w-80`, panneau droit "Sélectionne une conversation").
- Header : titre `Messages` (`var(--font-display)`, taille `clamp(26px, 4vw, 34px)`), bouton primaire `+ Nouvelle discussion` (`--court-700`).

**Liste**
- Chaque item : avatar (ou pastille avec initiales pour GROUP/CLUB), nom/titre, dernier message tronqué (1 ligne), heure relative, badge rond doré (`--gold-500`) avec compteur non-lus, icône cloche barrée si mute.
- Tri par `lastMessageAt desc`, conversations sans message au fond.
- État vide : "Aucune discussion pour l'instant. Commence par envoyer un message à un joueur depuis sa fiche."

### `/messages/[conversationId]` — Fil

**Header de conversation**
- Avatar(s) + nom + sous-titre ("En ligne" non géré en V1 → afficher `X participants` pour GROUP/CLUB, vide pour DIRECT).
- Menu kebab : `Muter 1h / 8h / 24h / Réactiver`, `Quitter` (GROUP seulement).
- Sur DIRECT : bouton lien vers la fiche joueur de l'autre.

**Thread**
- Liste asc des messages, regroupés par auteur si < 5 min entre deux messages.
- Mes messages alignés à droite (fond `--court-700`, texte `--paper-50`), ceux des autres à gauche (fond `--bg-surface`, texte `--ink-950`, avatar visible).
- Pour CLUB/GROUP : afficher nom auteur au-dessus du premier message d'un groupement.
- Citation (`replyTo`) affichée au-dessus du message avec barre verticale dorée.
- Message édité : suffix `(modifié)` discret.
- Message supprimé : "Message supprimé" en italique grisé.

**Composer**
- Textarea auto-grow (1 à 6 lignes), Entrée envoie, Maj+Entrée saute une ligne.
- Bouton flèche envoi rond, désactivé si content vide ou > 4000 chars.
- Compteur 4000 visible quand > 3500.

**Marquage lu**
- À l'arrivée sur la page : `markConversationRead(conversationId)`.
- Quand l'onglet redevient visible (`document.visibilitychange`) : refetch + markRead.

### `NewConversationDialog`
- Recherche par nom/prénom (debounced 250ms, server action `searchPlayers(query)` à créer si absente).
- Multi-select pour GROUP : si > 1 sélectionné, demande un titre.
- Bouton "Démarrer" → appelle `getOrCreateDirectConversation` ou `createGroupConversation` puis redirige.

## Tests à fournir
- Un fichier Vitest dans `lib/actions/__tests__/messaging.test.ts` couvrant : DM ré-utilisation (pas de doublon), refus DM avec soi-même, refus envoi par non-participant, soft delete, edit window 15 min, salon club auto-rejoint à l'adhésion.

## Livrable attendu
- 1 migration Prisma
- Composants UI listés
- Server actions complètes et typées
- Hook intégré aux server actions club existantes
- Tests Vitest
- Brève note dans `README.md` section "Messagerie" décrivant les routes et l'état (V1 sans temps réel)

---

# PROMPT 2 — Bulle flottante "Chatter" + temps réel Pusher + badge non-lus global

## Mission
Brancher Pusher Channels pour le **temps réel** (réception live des nouveaux messages, indicateur "X écrit…", mise à jour des badges non-lus) et ajouter la **bulle flottante "Chatter"** persistante en bas à droite, accessible depuis toutes les pages authentifiées sauf `/login`, `/signup`, landing page.

Pré-requis : Prompt 1 mergé (modèles `Conversation`, `Message`, server actions de messaging en place).

## Spécificités à respecter
- Pusher en SaaS (compte gratuit jusqu'à 200k messages/jour, 100 conns simultanées — largement assez pour démarrer).
- Auth Pusher via route privée : `/api/pusher/auth` qui vérifie que le caller est participant de la conv qu'il veut écouter.
- Côté client, **un seul** client Pusher global (provider React), pas un par composant.
- Channels nommés `private-conversation-<conversationId>` et `private-user-<playerProfileId>` (pour les badges globaux).
- Events :
  - `message:new` (payload `SerializedMessage`)
  - `message:edited` (id + content + editedAt)
  - `message:deleted` (id)
  - `typing` (envoyé en client-event, throttle 1.5s)
  - `read` (ack pour badges)
- Fallback : si la connexion Pusher tombe, polling toutes les 15s en secours.

## Variables d'environnement à ajouter

Dans `.env.example` (et expliquer dans `.env` qu'il faut les remplir) :
```
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=eu
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=eu
```

## Dépendances à installer

```bash
npm i pusher pusher-js
```

## Fichiers à créer

```
lib/realtime/pusher-server.ts        // singleton serveur (Pusher class)
lib/realtime/pusher-client.ts        // singleton browser (PusherJS)
lib/realtime/channels.ts             // helpers nommage channels
app/api/pusher/auth/route.ts         // POST handler auth privée

components/community/messaging/
├── ChatBubble.tsx                   // Client Component, bouton flottant + panneau
├── ChatBubblePanel.tsx              // Contenu (liste conv compacte ou thread compact)
├── ChatBubbleProvider.tsx           // Context : état ouverture, conv active, unreadTotal
├── TypingIndicator.tsx
└── usePusherChannel.ts              // hook abonnement + cleanup

components/providers.tsx             // ajouter ChatBubbleProvider dans l'arbre
app/layout.tsx                       // injecter <ChatBubble /> côté client si user connecté
```

## Modifications côté server actions (`lib/actions/messaging.ts`)

- À la fin de `sendMessage`, après commit DB et création de `Notification`, **trigger Pusher** :
  - `trigger('private-conversation-<id>', 'message:new', payloadSerialized)`
  - Pour chaque autre participant non-muté : `trigger('private-user-<participantPlayerProfileId>', 'unread:bump', { conversationId, lastMessageAt, preview })`
- Idem pour `editMessage` (`message:edited`) et `deleteMessage` (`message:deleted`).
- `markConversationRead` trigger `private-user-<self>` event `read` pour synchro multi-onglets.

## Route `/api/pusher/auth`

POST, body form-encoded `socket_id` + `channel_name` (format Pusher standard).
- Auth obligatoire (NextAuth).
- Pour `private-conversation-<id>` : vérifier que `caller.playerProfile` est `ConversationParticipant` actif (pas `leftAt`).
- Pour `private-user-<id>` : vérifier que `id === caller.playerProfile.id`.
- Sinon 403.

## Spécification UI — Bulle flottante

### Visibilité
- Affichée si user connecté ET la route n'est pas dans la blacklist : `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/`, `/vitrine`, `/tarifs`, `/landing-page-client`.
- Position fixe : `bottom: 1.25rem; right: 1.25rem; z-index: 60`.
- Bouton rond 56px, fond `--court-700`, icône messagerie (Lucide `MessageCircle`), badge non-lus en haut à droite (`--gold-500`, texte `--ink-950`), animation pulse quand nouveau message arrive et panneau fermé.

### Panneau (état ouvert)
- Largeur desktop : `360px`, hauteur `560px` max, `max-height: calc(100vh - 6rem)`.
- Mobile (< 768px) : prend tout l'écran, slide-up depuis le bas, bouton croix en haut à droite.
- Deux vues internes (state local du provider) :
  1. **Liste** : reprise compacte de `/messages` (avatar + nom + dernier msg + badge).
  2. **Thread** : header avec flèche retour + nom + bouton "Ouvrir en grand" qui pousse vers `/messages/<id>`, puis `MessageThread` en version compacte (pas de menu kebab), puis composer.
- Bouton "Voir tous les messages" en bas de la vue liste → route vers `/messages`.

### Comportement
- Cliquer la bulle ouvre/ferme le panneau (toggle).
- Le contexte du panneau persiste pendant la navigation (provider monté dans `providers.tsx`, pas démonté entre pages).
- Si l'utilisateur arrive sur `/messages/<id>`, fermer automatiquement le panneau bulle pour éviter le double affichage.
- Touch outside ne ferme pas (sinon trop fragile sur mobile). Bouton croix ou clic sur la bulle pour fermer.

### Badge global non-lus
- Calculé au mount via la server action `listMyConversations` puis maintenu en mémoire via les events Pusher (`unread:bump` increment, `read` reset).
- Affiché sur la bulle ET dans la nav principale (`SiteHeader`) si tu peux y ajouter un petit dot à côté de l'item "Communauté".

### Typing indicator
- Quand l'utilisateur tape dans le composer, throttle 1.5s, envoyer event client `client-typing` sur le channel de la conv.
- Côté UI, afficher "Untel écrit…" pendant 3s après réception.

## Notifications push browser (optionnel ce prompt mais bienvenu)
Si rapide à implémenter : Notification API browser quand panneau fermé ET onglet inactif ET nouveau message reçu sur un channel privé. Demander la permission à la première ouverture de `/messages`.

## Tests à fournir
- Test unitaire de la route `/api/pusher/auth` (403 si non-participant, 200 si OK).
- Test du helper `unreadCount` après reception/lecture.

## Livrable attendu
- Dépendances installées
- Variables d'env documentées dans `.env.example`
- Pusher branché côté serveur (trigger) et client (subscribe)
- Bulle fonctionnelle sur toutes les pages auth sauf blacklist
- Tests passants
- Brève note dans `README.md` section "Temps réel — Pusher" expliquant le setup (créer un compte Pusher, copier les clés)

---

# PROMPT 3 — WhatsApp deep link "Continuer sur WhatsApp"

## Mission
Permettre à un joueur de **partager son numéro WhatsApp** avec ses contacts (au sens application), et afficher un bouton "Continuer sur WhatsApp" qui ouvre `https://wa.me/<numéro>?text=...` natif.

Pas d'intégration API WhatsApp Business dans ce prompt : juste un deep link respectueux de la vie privée.

## Spécificités à respecter
- Le numéro doit être stocké au format **E.164** sans `+` (ex. `33612345678`) car c'est ce que `wa.me` attend.
- Champ optionnel. Si non renseigné, le bouton ne s'affiche pas.
- Visibilité par défaut : `MUTUAL_FOLLOWS_ONLY` (les follows mutuels uniquement). Options : `EVERYONE`, `MUTUAL_FOLLOWS_ONLY`, `CLUB_MEMBERS_ONLY`, `NOBODY`.
- Validation : utiliser `libphonenumber-js` (`npm i libphonenumber-js`) pour parser et normaliser.

## Modèle de données — migration à créer

**Nom suggéré** : `npx prisma migrate dev --name add_whatsapp_contact`

```prisma
enum WhatsAppVisibility {
  EVERYONE              // tous utilisateurs connectés
  MUTUAL_FOLLOWS_ONLY   // par défaut
  CLUB_MEMBERS_ONLY     // mêmes clubs uniquement
  NOBODY                // caché, équivalent à null
}
```

Ajouter dans `PlayerProfile` :
```prisma
  whatsappNumberE164  String?            // sans le '+', ex "33612345678"
  whatsappVisibility  WhatsAppVisibility @default(MUTUAL_FOLLOWS_ONLY)
```

## Fichiers à créer / modifier

```
lib/whatsapp.ts                              // helpers (normalize, isVisibleTo, buildWaUrl)
components/community/WhatsAppButton.tsx      // Client Component (lien <a target="_blank" rel="noopener">)
app/(dashboard)/parametres/contact/page.tsx  // Réglage numéro + visibilité (à intégrer au flux paramètres existant si présent)
```

## Helpers `lib/whatsapp.ts`

```ts
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function normalizeToE164NoPlus(raw: string, defaultCountry?: 'FR' | 'BE' | 'CH'): string | null {
  // Parse, exige valide, retourne sans le '+'. Null si invalide.
}

export function buildWaMeUrl(e164NoPlus: string, prefilledText?: string): string {
  const base = `https://wa.me/${e164NoPlus}`;
  return prefilledText ? `${base}?text=${encodeURIComponent(prefilledText)}` : base;
}

export async function canViewWhatsApp(
  targetPlayerProfileId: string,
  viewerPlayerProfileId: string | null
): Promise<{ visible: false } | { visible: true; e164NoPlus: string }>;
// Logique :
// 1. Charger target (whatsappNumberE164, whatsappVisibility).
// 2. Si number null OU visibility NOBODY → { visible: false }.
// 3. Si viewer null → { visible: false } (pas de fuite anonyme).
// 4. EVERYONE → visible.
// 5. MUTUAL_FOLLOWS_ONLY → vérifier qu'il existe un Follow viewer→target ET target→viewer (ou Friendship ACCEPTED selon ce qui est utilisé pour le cercle).
// 6. CLUB_MEMBERS_ONLY → vérifier au moins une ClubMembership active partagée.
```

## Server actions à exposer (`lib/actions/whatsapp.ts`)

```ts
updateMyWhatsApp(input: {
  number: string;             // input brut depuis le form
  defaultCountry?: 'FR' | 'BE' | 'CH';
  visibility: WhatsAppVisibility;
}): Promise<ActionResult>
// Normalise. Refuse si invalide. Met à jour le PlayerProfile du caller.

removeMyWhatsApp(): Promise<ActionResult>
// Set whatsappNumberE164 = null, visibility = NOBODY.
```

## Composant `WhatsAppButton`

Props :
```ts
{
  targetPlayerProfileId: string;
  targetFirstName: string;     // pour pré-remplir le texte
  prefilledContext?: string;   // ex. "Vu sur The Court – Tournoi Roland Padel"
  className?: string;
}
```

Comportement :
- Au mount, appelle `canViewWhatsApp` côté server (via une route ou une server action), si visible → affiche le bouton, sinon → ne rend rien (ou tooltip "Numéro privé" selon contexte).
- Lien : `target="_blank"` `rel="noopener noreferrer"`.
- Style : bouton outline vert WhatsApp (`#25D366`), icône Lucide `MessageCircleMore` à gauche, label `Continuer sur WhatsApp`.
- Texte pré-rempli par défaut : `Salut ${firstName}, je t'ai trouvé sur The Court${context ? ' (' + context + ')' : ''}.`

## Intégrations à faire

- **Fiche joueur** (`app/joueur/[id]/page.tsx` ou équivalent) : intégrer `<WhatsAppButton />` dans la section contact.
- **Conversation DIRECT** (`MessageThread` du Prompt 1, header) : intégrer le bouton à côté du lien vers la fiche joueur. Bouton secondaire, taille `sm`.
- **Page paramètres** : créer/étendre une page `parametres/contact` avec input téléphone, sélecteur pays (FR/BE/CH/Autre), et radio group visibilité. Aperçu live du format `wa.me/...`.

## Tests à fournir
- Unit tests `lib/whatsapp.test.ts` : normalisation FR/BE/CH/intl, `buildWaMeUrl` encoding, `canViewWhatsApp` pour chaque combinaison visibilité × relation.

## Livrable attendu
- 1 migration Prisma
- Helpers + server actions + composant + page paramètres
- Intégration dans fiche joueur et header conversation DIRECT
- Tests passants
- Mise à jour `SPEC.md` section "Vie privée" : règles de visibilité WhatsApp explicites

---

# PROMPT 4 — Feed social+ : @mentions, profils publics riches, hashtags

## Mission
Enrichir le feed existant pour qu'il ressemble à un vrai feed social : **mentions @joueur**, **hashtags #tournoi/#club**, et **profil public** avec mur de posts. Le but est de donner aux joueurs envie de revenir scroller.

## Spécificités à respecter
- Une mention déclenche une notification `MENTION_IN_POST` (nouveau, à ajouter à l'enum).
- Un hashtag est un tag de surface uniquement (pas de modèle dédié, juste parsing + page de recherche).
- Le mur du profil respecte la visibilité existante (`PostVisibility`).

## Modèle de données

**Nom suggéré** : `npx prisma migrate dev --name add_post_mentions`

Ajouter à l'enum `NotificationKind` :
```prisma
  MENTION_IN_POST
  MENTION_IN_COMMENT
```

Nouveau modèle :
```prisma
model PostMention {
  id                String   @id @default(cuid())
  postId            String?
  commentId         String?
  mentionedPlayerId String
  createdAt         DateTime @default(now())

  post              Post?          @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment           Comment?       @relation(fields: [commentId], references: [id], onDelete: Cascade)
  mentionedPlayer   PlayerProfile  @relation("MentionsReceived", fields: [mentionedPlayerId], references: [id], onDelete: Cascade)

  @@index([mentionedPlayerId, createdAt])
  @@index([postId])
  @@index([commentId])
}
```

Relation inverse à ajouter dans `PlayerProfile`, `Post`, `Comment`.

## Fichiers à créer / modifier

```
lib/community/mentions.ts            // parser @handle + résoudre en playerProfile
lib/community/hashtags.ts            // parser #tag, slugifier, normaliser
components/community/MentionInput.tsx // textarea avec autocomplete @ (Client Component)
components/community/RichPostContent.tsx // rendu : mentions cliquables, hashtags cliquables, liens
app/joueur/[handle]/page.tsx         // profil public (ajouter mur si pas déjà fait)
app/feed/tag/[tag]/page.tsx          // feed filtré par hashtag
```

## Helpers `lib/community/mentions.ts`

```ts
// Format de mention dans le contenu stocké : @[John Doe](playerProfileId)
// Format visible : @John Doe (cliquable)
// Lors du save, on parse le texte avant pour transformer @JohnDoe (handle) → @[John Doe](id).

export function extractMentions(content: string): string[]; // retourne les playerProfileIds
export function renderToReactNodes(content: string): ReactNode[];
export async function resolveHandlesToIds(handles: string[]): Promise<Map<string, string>>;
```

## Helpers `lib/community/hashtags.ts`

```ts
const HASHTAG_REGEX = /#([a-z0-9\-]{2,30})/gi;
export function extractHashtags(content: string): string[];
export function slugify(tag: string): string;
```

## Modifications server actions

Dans la server action de création de post (probablement dans `lib/actions/community.ts` ou équivalent — à grep) :
1. Avant save, parser mentions et hashtags.
2. Pour chaque mention valide (player existe ET le viewer a le droit de la mentionner — pas un user bloqué), créer une `PostMention`.
3. Pour chaque mentionné, créer une `Notification` `MENTION_IN_POST` avec lien vers le post.
4. Idem pour les commentaires (`MENTION_IN_COMMENT`).

## Composant `MentionInput`

- Textarea contrôlée, détecte `@` en cours de saisie → ouvre un popover de suggestions.
- Recherche server action `searchPlayersForMention(query)` debounced 200ms, retourne 8 résultats (firstName, lastName, avatarUrl, id).
- Sélection : remplace le `@xxx` en cours par le format de stockage `@[John Doe](id)` (mais affichage UI : `@John Doe` highlighté).
- Hashtags détectés en surbrillance pendant la frappe (regex live), pas de popover.

À utiliser dans : `NewPostForm`, `ForumReplyForm` (déjà existants — refacto pour basculer leur textarea sur ce composant).

## Composant `RichPostContent`

Reçoit le `content` brut et le rend :
- `@[Nom Prénom](id)` → `<Link href="/joueur/{handle ou id}" className="font-medium text-[color:var(--court-700)]">@Nom Prénom</Link>`
- `#tag` → `<Link href="/feed/tag/{slug}" className="text-[color:var(--gold-700)] font-medium">#tag</Link>`
- URLs http/https → liens externes `target="_blank"`.

Utiliser dans `PostCard`, dans les commentaires, et dans `ForumReplyItem`.

## Page `/joueur/[handle]` — mur de posts

Si la page n'existe pas encore avec un mur :
- Header profil (avatar, nom, ranking, club principal, bouton Suivre, bouton Message [Prompt 1], bouton WhatsApp [Prompt 3]).
- Onglets : `Posts` | `Stats` | `Tournois`.
- Onglet Posts : appelle `fetchPlayerWallPosts(playerProfileId, viewerId)` (nouveau helper dans `lib/community/posts.ts`) qui retourne uniquement les posts dont la visibilité est compatible avec le viewer (PUBLIC toujours, FRIENDS si follow mutuel, CLUB si même club).
- Pagination cursor 20 items.
- État vide : "Ce joueur n'a encore rien partagé."

## Page `/feed/tag/[tag]` — feed par hashtag

- Récupérer les `Post` dont `content` matche `#${tag}` (regex insensible casse) et visibilité compatible viewer.
- Header : `#padel` (style `var(--font-display)`), compteur "X posts".
- Réutiliser `FeedList`.

## Tests à fournir
- Parser mentions : extraction, idempotence, gestion des handles inconnus.
- Parser hashtags : slugify (accents, casse, longueur).
- `fetchPlayerWallPosts` : respect visibilité selon relation viewer↔auteur.

## Livrable attendu
- 1 migration Prisma
- Helpers parsing + composant input + composant render
- Page profil joueur enrichie (mur)
- Page hashtag fonctionnelle
- Refacto `NewPostForm` et `ForumReplyForm` pour utiliser `MentionInput`
- Notifications déclenchées
- Tests passants
- Capture d'écran d'un post avec mentions + hashtags rendus, à coller dans la réponse

---

## Notes globales

- **Ordre de merge** : 1 → 2, puis 3 et 4 en parallèle.
- **Coût mensuel ajouté** : Pusher gratuit jusqu'à ~100 conn simultanées et 200k messages/jour. Au-delà, plan Startup ~49 $/mois. WhatsApp = 0 € (juste un lien).
- **Sécurité** : tout passe par les server actions + `auth()`, aucune table exposée directement. La route `/api/pusher/auth` est l'unique surface API publique à durcir.
- **Accessibilité** : la bulle flottante doit être focusable au clavier (Tab → Entrée ouvre), aria-label "Ouvrir les messages, N non lus".

— Fin du fichier —
