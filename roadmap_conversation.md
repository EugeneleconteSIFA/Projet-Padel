# roadmap_conversation.md — Module Communauté
## The Court × Studio Forge

> Document de travail collaboratif — sessions Eugène × Claude.
> Mis à jour au fil des semaines. La vérité produit reste dans `SPEC.md`.

**Démarré le :** 2026-05-20
**Statut :** Phase de cadrage

---

## Pourquoi une communauté maintenant ?

La SPEC place le réseau social en V3+. Mais la logique est inversée : sans communauté, The Court est un outil de gestion de tournois parmi d'autres. Avec une communauté vivante, c'est un terrain. Un endroit où les joueurs restent même entre les tournois.

Les outils existants — Playtomic, Tenup, pages Facebook de clubs, groupes WhatsApp — ne créent pas de lieu. Ils traitent des transactions. The Court peut faire les deux.

**Objectif de ce module :** transformer chaque joueur inscrit en membre actif d'une communauté, et chaque club en espace de vie, pas seulement en organisateur.

---

## Ce que "tout gérer de sa vie de joueur" veut dire

Quand un joueur vit son padel, voilà ce qui se passe dans sa semaine :

- Il cherche un tournoi → couvert par le module Tournois
- Il cherche un partenaire → couvert partiellement dans la SPEC
- Il partage un moment de jeu (photo, résultat, anecdote) → **pas couvert**
- Il veut se comparer aux joueurs de son niveau → **pas couvert**
- Il veut savoir ce qui se passe dans son club → **pas couvert**
- Il a une question sur une raquette, une règle, un format → **pas couvert**
- Il veut organiser un match amical (pas un tournoi) → **pas couvert**
- Il suit l'évolution d'un joueur qu'il admire → **pas couvert**
- Il revend sa vieille raquette → **pas couvert** (long terme)

Ce module couvre tout ça. Progressivement.

---

## Structure du module Communauté

Le module est organisé en 4 espaces distincts. Ils partagent une infrastructure commune (posts, réactions, modération) mais ont des logiques d'accès différentes.

### 1. Feed public — La vitrine communautaire

**C'est quoi :** Un fil d'actualité visible sans compte. Contenu issu de la plateforme et des joueurs publics.

**Ce qu'on y trouve :**
- Résultats de tournois publiés automatiquement
- Posts publics de joueurs (photos de matchs, moments de jeu)
- Actualités des clubs (nouveau tournoi, info pratique)
- Classements hebdomadaires mis en avant
- "Match de la semaine" généré automatiquement depuis les résultats

**Logique d'accès :** Tout visiteur peut voir. Seuls les membres peuvent poster, liker, commenter.

**Pourquoi c'est utile :** C'est la vitrine SEO et acquisition. Un joueur cherche "tournoi padel Lille" → tombe sur le feed → crée un compte.

---

### 2. Feed privé — Le fil de mon cercle

**C'est quoi :** Le fil personnel du joueur connecté. Contenu filtré selon ses relations et ses clubs.

**Ce qu'on y trouve :**
- Posts des joueurs qu'il suit
- Activité de ses partenaires habituels (tournois joués, résultats)
- Actualités des clubs dont il est membre
- Notifications d'inscrits dans ses tournois
- Ses propres posts et interactions

**Logique d'accès :** Réservé aux membres connectés. Personnalisé par un algorithme simple (chronologique d'abord, pas de black box).

**Types de posts possibles :**
- Photo / vidéo courte
- Score de match (format rapide : 6-4 / 6-2 avec les noms des joueurs)
- "Je cherche un partenaire" (format structuré, lié au module partenaire)
- Texte libre (court, max 500 caractères)
- Partage d'un tournoi (depuis le module Tournois)

---

### 3. Espaces de club — La vie du club en privé

**C'est quoi :** Un espace dédié à chaque club, accessible uniquement à ses membres.

**Ce qu'on y trouve :**
- Annonces officielles du club (prioritaires, épinglées)
- Feed des membres du club (entre eux uniquement)
- Tableau des prochains tournois du club
- Classement interne du club (ranking maison, pas FFT)
- "Cherche partenaire" limité aux membres du club
- Agenda des créneaux libres (si le club gère ses terrains sur la plateforme)

**Logique d'accès :** Un joueur doit être membre validé du club pour accéder à cet espace. Le club gère la liste des membres.

**Pourquoi c'est stratégique :** C'est la fonctionnalité qui fait revenir tous les jours. Le joueur ouvre The Court pour voir ce qui se passe dans son club, pas juste pour s'inscrire à un tournoi.

---

### 4. Forum — Les discussions structurées

**C'est quoi :** Un espace de discussion thématique, hybride entre Reddit et un forum classique.

**Catégories à définir ensemble (proposition) :**
- **Cherche partenaire** — fil structuré (ville, niveau, dispo) — doublon intentionnel avec le module partenaire pour la visibilité
- **Matériel** — raquettes, chaussures, avis, comparatifs
- **Technique & tactique** — questions de jeu, conseils, vidéos
- **Clubs & terrains** — avis sur les clubs, photos de courts
- **Règles & arbitrage** — questions officielles, litiges, clarifications
- **Petites annonces** — revente de matériel (V2, à confirmer)
- **Organisation** — créer un match amical, trouver des coéquipiers hors tournoi

**Logique d'accès :**
- Catégories publiques : visible sans compte, commentaires réservés aux membres
- Catégories de club : visible et accessible aux membres seulement

**Fonctionnement :**
- Thread = question ou post ouvert
- Réponses classées par vote ou chronologie
- Modération : signalement + rôle modérateur (joueur senior, équipe The Court)
- Tags sur chaque post (ville, niveau, catégorie de tournoi)

---

## Idées à explorer ensemble (non arbitrées)

Ces idées sont posées sur la table. On les priorise ou on les élimine au fil des sessions.

### Les matchs amicaux
Permettre à un joueur de créer un "match amical" visible sur la plateforme — pas un tournoi officiel, juste "je cherche 2 joueurs pour jouer samedi matin à Lille, niveau P100". L'inscription est en un clic, pas de paiement. Ça crée du liant entre les tournois.

### Le Wall of Fame
Mettre en avant automatiquement les performances remarquables de la semaine : victoire surprise, série en cours, premier podium. Contenu généré depuis les résultats de tournois. Aucune saisie manuelle.

### Les défis entre joueurs
Système de défi léger : un joueur en défie un autre sur un set. L'acceptation génère une proposition de match amical. Les scores sont ensuite publiés sur le feed.

### Les communautés géolocalisées
En plus des espaces de club, créer des espaces ville/région : "Communauté Padel Lille", "Padel Hauts-de-France". Les joueurs sans club y trouvent leur place. Le contenu est public mais l'ambiance est locale.

### Les "moments" de tournoi
Pendant un tournoi actif, un fil de posts automatiquement taggé sur ce tournoi. Les photos, scores et réactions se retrouvent toutes au même endroit. Après le tournoi, le fil est archivé sur la fiche tournoi.

### Les avis joueurs sur les clubs (déjà dans la SPEC)
À intégrer dans l'espace communauté, pas uniquement sur la fiche club. Un avis récent = contenu dans le feed.

---

## Ce qu'on ne fera pas (limites claires)

- Pas de messagerie privée en V1. Trop de surface d'abus, trop lourd à modérer. Les échanges passent par les commentaires de posts ou les threads de forum.
- Pas d'algorithme opaque. Le feed suit une logique chronologique + pertinence simple (relations directes d'abord). On n'optimise pas pour l'engagement à tout prix.
- Pas de publicité. Le modèle est clair : gratuit pour les membres, le club paye la plateforme.
- Pas de stories éphémères en V1. On commence par du contenu permanent.
- Pas de live streaming. Long terme, si les clubs s'équipent.

---

## Modèle de données — Extensions nécessaires

Le schéma Prisma actuel a déjà `Friendship`, `Follow`, `Notification`, et `ClubReview`. Il manque :

**À ajouter au schéma :**
```
Post            — id, authorId, clubId?, tournamentId?, content, mediaUrls[], visibility (public/friends/club), createdAt
PostReaction    — id, postId, userId, type (like/fire/clap)
Comment         — id, postId, parentId?, authorId, content, createdAt
ForumThread     — id, category, title, authorId, isPinned, tags[], createdAt
ForumReply      — id, threadId, parentId?, authorId, content, votes, createdAt
ClubSpace       — id, clubId, membersOnly (bool), pinnedPostIds[]
FriendlyMatch   — id, creatorId, clubId?, city, date, levelMin, levelMax, spotsTotal, spotsLeft, status
```

**Décision à prendre :** est-ce qu'on étend le schéma maintenant (clean, futur-proof) ou on prototype avec un modèle simplifié puis on migre ? Recommandation : on l'intègre proprement dès le début, le coût d'une migration Feed est élevé.

---

## Stack spécifique communauté

| Besoin | Solution proposée | Raison |
|---|---|---|
| Temps réel (feed live, notifications) | **Pusher** ou **Supabase Realtime** | Léger, pas besoin de WebSocket maison en V1 |
| Upload médias (photos posts) | **Scaleway Object Storage** (déjà prévu) | Cohérent avec la stack existante |
| Modération | Signalement manuel + liste blocage | Pas d'IA de modération en V1 |
| Recherche forum | **Full-text search Postgres** (pg tsvector) | Suffisant pour le volume V1, pas besoin d'Algolia |
| Notifications push (mobile) | **Expo Notifications** (quand app native) | À brancher quand on fait l'app mobile |

---

## Séquence de travail — Semaines à venir

### Semaine 1 — Décisions structurelles
- [ ] Valider la liste des catégories de forum
- [ ] Décider du périmètre exact du feed public (qu'est-ce qui est auto-publié depuis les tournois ?)
- [ ] Valider le modèle d'accès des espaces de club (validation manuelle par le club ?)
- [ ] Étendre le schéma Prisma avec les nouveaux modèles
- [ ] Créer la migration Prisma nommée `add_community_module`

### Semaine 2 — Feed public + Post basique
- [ ] Composant `<PostCard />` (photo, texte, réactions)
- [ ] Page `/feed` publique avec les posts récents
- [ ] Action "publier un post" (joueur connecté)
- [ ] Réactions (like / fire / clap) — sans rechargement de page
- [ ] Auto-publication des résultats de tournois dans le feed

### Semaine 3 — Feed privé + Relations
- [ ] Page `/feed` connectée (filtrage par follows)
- [ ] Action "suivre un joueur" (asymétrique)
- [ ] Notification "X a posté" pour les abonnés
- [ ] Format de post "Score de match" (UI structurée)
- [ ] Format de post "Cherche partenaire" (lié au module partenaire)

### Semaine 4 — Espaces de club
- [ ] Page `/club/[slug]/communaute`
- [ ] Logique d'accès (membre du club uniquement)
- [ ] Feed du club (posts des membres + annonces du club)
- [ ] Tableau de bord club : voir les posts de ses membres
- [ ] Classement interne du club (basé sur les résultats de tournois du club)

### Semaine 5 — Forum
- [ ] Page `/forum` avec liste des catégories
- [ ] Page `/forum/[categorie]` avec liste des threads
- [ ] Créer un thread
- [ ] Répondre à un thread
- [ ] Vote sur les réponses
- [ ] Thread épinglé (admin / modérateur)

### Semaine 6 — Polish, mobile & tests
- [ ] Interface mobile-first sur tous les composants communauté
- [ ] Système de signalement (post / commentaire)
- [ ] Tests Playwright sur les parcours critiques (publier, réagir, suivre)
- [ ] Performance : pagination infinie ou "load more" sur le feed
- [ ] Revue complète accessibilité (contrastes, touch targets)

---

## Questions ouvertes — à trancher ensemble

1. **Qui peut poster dans le feed public ?** Tous les membres, ou seulement les membres "vérifiés" (avec un tournoi joué) ?
2. **Les clubs peuvent-ils sponsoriser un post** pour qu'il apparaisse dans le feed de joueurs non-membres ? (logique de promotion légère)
3. **Le forum est-il modéré a priori ou a posteriori ?** Recommandation : a posteriori avec système de signalement.
4. **Les matchs amicaux** font-ils partie de la V1 ou V2 communauté ?
5. **Les "moments de tournoi"** (fil de posts sur un tournoi actif) — à construire en même temps que le feed, ou phase séparée ?
6. **Format vidéo** : on accepte les vidéos courtes dans les posts dès la V1 (15 sec max) ou on commence photo uniquement ?

---

## Métriques de succès du module communauté

À 3 mois après le lancement communauté :

- **DAU/MAU ratio** ≥ 30% (les joueurs reviennent même sans tournoi en cours)
- **Posts par joueur actif** ≥ 2 par mois
- **% de membres qui suivent au moins 3 joueurs** ≥ 50%
- **Threads de forum** avec au moins 3 réponses ≥ 40% des threads créés
- **Espaces de club actifs** (au moins 1 post par semaine) ≥ 70% des clubs partenaires

---

## Journal des sessions

| Date | Sujets traités | Décisions prises | Fichiers modifiés |
|---|---|---|---|
| 2026-05-20 | Cadrage initial, structure du module, idées | — | `roadmap_conversation.md` créé |

---

*Forge × The Court — Ce document est vivant. On le met à jour après chaque session de travail.*
