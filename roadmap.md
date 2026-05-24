# Roadmap — The Court

## Vision du projet

**The Court** est une plateforme web moderne, minimaliste et mobile-first dédiée aux tournois de padel.

L’objectif de la V1 est de créer une base simple et fonctionnelle permettant de :

- rechercher des tournois de padel ;
- créer un compte avec un rôle spécifique ;
- rediriger chaque utilisateur vers le bon espace ;
- permettre aux joueurs de consulter et rejoindre des tournois ;
- permettre aux clubs de créer et gérer des tournois ;
- permettre aux juges-arbitres de gérer les tableaux et scores de base.

Le site doit s’inspirer de Playtomic dans l’expérience utilisateur : interface simple, cartes visuelles, navigation fluide, design premium et logique mobile-first.

---

## Objectif de la V1

Créer une première version claire, propre et réaliste, sans fonctionnalités avancées.

La V1 doit prioriser :

- l’accueil public ;
- l’inscription et la connexion ;
- le choix du rôle utilisateur ;
- le dispatch automatique vers le bon espace ;
- la page de recherche de tournois ;
- la fiche tournoi ;
- l’espace joueur basique ;
- l’espace club basique ;
- l’espace juge-arbitre basique.

Les fonctionnalités avancées comme l’IA, le dynamic pricing, le CRM avancé, le live vidéo, la marketplace ou le réseau social ne sont pas à intégrer dans cette première version.

---

## Identité visuelle

### Nom

**the court.**

### Style graphique

- Fond beige clair ;
- vert foncé comme couleur principale ;
- touches dorées discrètes ;
- design premium ;
- cartes arrondies ;
- boutons visibles ;
- interface mobile-first ;
- peu de texte ;
- navigation fluide ;
- typographie élégante ;
- inspiration Playtomic.

---

# Phase 1 — Structure globale du site

## 1.1. Créer l’architecture principale

Mettre en place les grandes pages du site :

- accueil public ;
- page inscription ;
- page connexion ;
- accueil joueur ;
- accueil club ;
- accueil juge-arbitre ;
- page tournois ;
- fiche tournoi ;
- création tournoi club.

## 1.2. Créer le header général

### Header public

Contenu :

- logo **the court.** ;
- lien **Tournois** ;
- lien **Clubs** ;
- lien **Connexion** ;
- bouton **Créer un compte**.

### Header connecté joueur

Contenu :

- logo ;
- Accueil ;
- Tournois ;
- Profil ;
- Déconnexion.

### Header connecté club

Contenu :

- logo ;
- Accueil ;
- Mes tournois ;
- Créer un tournoi ;
- Paiements ;
- Déconnexion.

### Header connecté juge-arbitre

Contenu :

- logo ;
- Accueil ;
- Mes tournois ;
- Tableaux ;
- Scores ;
- Déconnexion.

---

# Phase 2 — Authentification et dispatch utilisateur

## 2.1. Création de compte

Créer un formulaire d’inscription simple en 3 étapes.

### Étape 1 — Informations générales

Champs :

- nom ;
- prénom ;
- email ;
- mot de passe ;
- ville ;
- code postal.

### Étape 2 — Profil padel

Champs :

- numéro de licence FFT ;
- classement FFT ;
- niveau estimé ;
- côté préféré :
  - droite ;
  - gauche ;
  - les deux.

### Étape 3 — Type de compte

Choix :

- joueur ;
- club ;
- juge-arbitre.

## 2.2. Connexion

Créer une page de connexion avec :

- email ;
- mot de passe ;
- bouton **Se connecter** ;
- lien **Mot de passe oublié**.

## 2.3. Dispatch automatique

Mettre en place la logique suivante :

```txt
Utilisateur non connecté
→ Accueil public

Utilisateur connecté + rôle joueur
→ Accueil joueur

Utilisateur connecté + rôle club + validé
→ Accueil club

Utilisateur connecté + rôle club + non validé
→ Page attente validation club

Utilisateur connecté + rôle juge-arbitre + validé
→ Accueil juge-arbitre

Utilisateur connecté + rôle juge-arbitre + non validé
→ Page attente validation juge-arbitre
```

## 2.4. Validation club et juge-arbitre

Les comptes club et juge-arbitre doivent avoir un statut :

- en attente de validation ;
- validé ;
- refusé.

Si le compte est en attente, afficher un écran simple :

**Votre compte est en attente de validation. Vous serez prévenu dès que votre espace sera activé.**

---

# Phase 3 — Accueil public

## Objectif

L’accueil public doit expliquer rapidement le concept et pousser l’utilisateur à rechercher un tournoi ou créer un compte.

## Contenu de la page

### Hero section

Titre :

**Trouve ton prochain tournoi de padel.**

Sous-titre :

**Recherche, inscription, paiement et partenaire : tout ton tournoi au même endroit.**

### Barre de recherche

Champs :

- ville ;
- date ;
- catégorie ;
- bouton **Rechercher**.

### Boutons principaux

- **Trouver un tournoi** ;
- **Créer un compte**.

### Section profils

Créer 3 cartes :

#### Joueur

Texte :

**Trouve et rejoins un tournoi de padel en quelques clics.**

#### Club

Texte :

**Crée et gère tes tournois simplement.**

#### Juge-arbitre

Texte :

**Organise les tableaux, les scores et le suivi sportif.**

---

# Phase 4 — Page Tournois

## Objectif

Créer une page de recherche de tournois claire, proche du fonctionnement déjà imaginé.

## Recherche

Champs :

- ville ;
- rayon ;
- catégorie.

Catégories :

- P25 ;
- P100 ;
- P250 ;
- P500 ;
- P1000 ;
- P2000.

## Filtres

Filtres disponibles :

- hommes ;
- femmes ;
- mixte ;
- indoor ;
- outdoor.

## Cartes tournois

Chaque carte tournoi doit afficher :

- catégorie ;
- genre ;
- indoor / outdoor ;
- nom du tournoi ;
- club ;
- distance ;
- date ;
- prix ;
- nombre d’équipes inscrites ;
- nombre de places disponibles ;
- bouton **Voir le tournoi**.

## Carte interactive

Ajouter une carte interactive à droite sur desktop.

Sur mobile, la carte doit pouvoir être masquée ou affichée via un bouton.

---

# Phase 5 — Fiche tournoi

## Objectif

Permettre au joueur de consulter les détails du tournoi et de s’inscrire.

## Informations affichées

La fiche tournoi doit afficher :

- nom du tournoi ;
- club ;
- ville ;
- adresse ;
- date ;
- heure ;
- catégorie ;
- genre ;
- indoor / outdoor ;
- prix ;
- nombre de places ;
- équipes inscrites ;
- statut : ouvert / complet / liste d’attente ;
- description.

## Actions

Boutons :

- **S’inscrire** ;
- **Trouver un partenaire** ;
- **Rejoindre la liste d’attente** si le tournoi est complet.

## Inscription

Le joueur peut :

- s’inscrire avec un partenaire ;
- s’inscrire seul en attente de partenaire ;
- rejoindre la liste d’attente si le tournoi est complet.

---

# Phase 6 — Accueil joueur

## Objectif

Créer un dashboard joueur simple permettant de jouer rapidement.

## Contenu

Message principal :

**Bonjour, prêt pour ton prochain tournoi ?**

## Cartes principales

Créer 4 cartes :

### Rechercher un tournoi

Bouton : **Rechercher**

### Mes prochains tournois

Afficher les tournois auxquels le joueur est inscrit.

### Trouver un partenaire

Bouton : **Chercher un partenaire**

### Mon profil

Bouton : **Voir mon profil**

## Bloc tournois recommandés

Afficher 3 cartes tournois avec :

- nom du tournoi ;
- ville ;
- catégorie ;
- date ;
- prix ;
- bouton **Voir**.

---

# Phase 7 — Accueil club

## Objectif

Créer un dashboard club simple pour gérer les tournois.

## Condition d’accès

Si le compte club n’est pas validé, afficher uniquement :

**Votre compte club est en attente de validation. Vous serez prévenu dès que votre espace sera activé.**

## Contenu si compte validé

Message principal :

**Bienvenue dans votre espace club.**

## Cartes principales

Créer 4 cartes :

### Créer un tournoi

Bouton : **Créer**

### Mes tournois

Afficher les tournois créés par le club.

### Inscriptions reçues

Afficher le nombre d’inscriptions reçues.

### Paiements

Afficher les paiements reçus.

## Bloc mes prochains tournois

Afficher les tournois du club avec :

- nom ;
- date ;
- catégorie ;
- statut : ouvert / complet / brouillon ;
- bouton **Gérer**.

---

# Phase 8 — Création tournoi club

## Objectif

Permettre à un club validé de créer un tournoi.

## Formulaire

Champs :

- nom du tournoi ;
- catégorie ;
- genre ;
- date ;
- heure ;
- prix ;
- nombre d’équipes ;
- indoor / outdoor ;
- format ;
- juge-arbitre ;
- description.

## Formats disponibles

- poules ;
- élimination directe ;
- consolante.

## Action

Bouton :

**Publier le tournoi**

---

# Phase 9 — Accueil juge-arbitre

## Objectif

Créer un dashboard simple pour les juges-arbitres.

## Condition d’accès

Si le compte juge-arbitre n’est pas validé, afficher uniquement :

**Votre compte juge-arbitre est en attente de validation. Vous serez prévenu dès que votre espace sera activé.**

## Contenu si compte validé

Message principal :

**Bienvenue dans votre espace juge-arbitre.**

## Cartes principales

Créer 4 cartes :

### Mes tournois assignés

Afficher les tournois assignés au JA.

### Inscriptions à valider

Afficher les équipes à valider.

### Générer les tableaux

Bouton : **Générer**

### Saisir les scores

Bouton : **Saisir**

## Bloc tournois à gérer

Afficher :

- nom du tournoi ;
- club ;
- date ;
- catégorie ;
- statut : à préparer / en cours / terminé ;
- bouton **Gérer**.

---

# Phase 10 — Données minimales à prévoir

## Utilisateur

Champs :

- id ;
- nom ;
- prénom ;
- email ;
- mot de passe ;
- ville ;
- code postal ;
- rôle : joueur / club / juge-arbitre ;
- statut validation : validé / en attente / refusé.

## Profil joueur

Champs :

- utilisateur_id ;
- licence_fft ;
- classement_fft ;
- niveau_estime ;
- cote_prefere ;
- tournois_inscrits.

## Club

Champs :

- utilisateur_id ;
- nom_club ;
- ville ;
- adresse ;
- terrains ;
- statut_validation.

## Juge-arbitre

Champs :

- utilisateur_id ;
- numero_ja ;
- nom ;
- statut_validation.

## Tournoi

Champs :

- id ;
- nom ;
- club_id ;
- juge_arbitre_id ;
- ville ;
- adresse ;
- date ;
- heure ;
- catégorie ;
- genre ;
- indoor_outdoor ;
- prix ;
- nombre_equipes_max ;
- nombre_equipes_inscrites ;
- format ;
- statut ;
- description.

## Inscription tournoi

Champs :

- id ;
- tournoi_id ;
- joueur_1_id ;
- joueur_2_id ;
- statut ;
- paiement_statut ;
- date_inscription.

---

# Phase 11 — Fonctionnalités volontairement exclues de la V1

Ne pas intégrer dans la première version :

- intelligence artificielle ;
- matchmaking avancé ;
- dynamic pricing ;
- CRM avancé ;
- campagnes SMS/email ;
- live vidéo ;
- marketplace ;
- réseau social ;
- coach IA ;
- classement ELO parallèle ;
- système XP ;
- récompenses partenaires ;
- proshop ;
- réservations de terrains ;
- statistiques avancées ;
- paiement réel complexe.

Ces fonctionnalités pourront être ajoutées plus tard lorsque la V1 sera stable.

---

# Priorités de développement

## Priorité 1 — MVP indispensable

- Accueil public ;
- inscription ;
- connexion ;
- choix du rôle ;
- dispatch utilisateur ;
- page tournois ;
- fiche tournoi ;
- accueil joueur ;
- accueil club avec validation ;
- accueil juge-arbitre avec validation.

## Priorité 2 — Gestion simple

- création tournoi club ;
- inscription joueur à un tournoi ;
- liste d’attente basique ;
- affichage des tournois du club ;
- affichage des tournois assignés au JA.

## Priorité 3 — Amélioration expérience

- filtres plus complets ;
- carte interactive mobile ;
- page profil joueur ;
- meilleure interface de gestion club ;
- meilleure interface de gestion JA ;
- début de système de paiement.

---

# Résultat attendu

À la fin de cette roadmap, la plateforme doit permettre à un utilisateur de :

- visiter le site sans compte ;
- rechercher un tournoi ;
- créer un compte ;
- choisir son rôle ;
- être redirigé vers le bon espace ;
- consulter une liste de tournois ;
- ouvrir une fiche tournoi ;
- s’inscrire à un tournoi ;
- créer un tournoi côté club ;
- consulter les tournois assignés côté juge-arbitre.

L’objectif n’est pas encore de créer une plateforme complète et avancée, mais de construire une base solide, claire et évolutive.


---

# État d'avancement (mise à jour 24/05/2026)

POC implémenté et déployé (VPS + PM2, `thecourt.fr`).

| Phase | Sujet | État |
|---|---|---|
| 1 | Structure globale + headers | ✅ Fait (header public + headers connectés par rôle) |
| 2 | Authentification & dispatch | ⚠️ Implémenté **mais bugs connus** (voir encadré) |
| 3 | Accueil public | ✅ Fait (`/`, landing) |
| 4 | Page Tournois (recherche + carte) | ✅ Fait |
| 5 | Fiche tournoi + inscription | ✅ Fait (`/tournois/[id]`) |
| 6 | Accueil joueur | ✅ Fait (`/profil`, `/mon-feed`) |
| 7 | Accueil club | ✅ Fait (dashboard, condition d'accès via validation) |
| 8 | Création tournoi club | ✅ Fait (`/club/tournoi/nouveau`) |
| 9 | Accueil juge-arbitre | ✅ Fait (`/arbitre`, gestion tournoi) |
| 10 | Données minimales | ✅ Schéma Prisma complet + migrations |
| — | **Module Communauté** (hors roadmap initiale) | ✅ Feed, forum, matchs amicaux, follow, réactions, modération |

**⚠️ Phase 2 — Authentification & dispatch (2.2, 2.3) et Validation club/arbitre (2.4)** présentent des bugs vérifiés :
- statut de validation **figé dans le JWT** (le dispatch §2.3 ne reflète pas l'approbation admin en temps réel) ;
- **failles de protection** des sous-routes club/arbitre ;
- `trustHost` manquant pour NextAuth v5 sur le VPS ;
- lien « mot de passe oublié » cassé.

➡️ Diagnostic détaillé et plan de correction : **[DIAGNOSTIC-AUTH-ET-CONNECTIVITE.md](./DIAGNOSTIC-AUTH-ET-CONNECTIVITE.md)**.
