# BRANDING — The Court

> **Choix figé le 2026-05-10.** Nom : **The Court**. Direction artistique : Bandeja (crème argentée, vert profond, or, mix serif / sans serif).

---

## 1. Le nom — The Court

**Pourquoi "The Court" plutôt que "Court"**
L'article défini change tout. *"Court"* est un nom commun, dilué dans le legaltech. *"The Court"* devient une affirmation : il y a *un* terrain, *celui* où tout se joue. Le nom prend une posture, une signature. Dit en français, l'effet reste : *"On se voit sur The Court."*

**Ce que le nom porte**
- *Court* (anglais) = terrain. *Cour* (français) = lieu où l'on rend justice — clin d'œil au juge-arbitre.
- Court, simple, lisible. Trois mots qui tiennent dans n'importe quel logo.
- Universel sur les sports de raquette : tennis, padel, badminton, tennis de table, squash. Tous se jouent sur un *court*.
- L'article anglais donne un statut, un côté "club" assumé.

**Tagline principale**
> Tout se joue sur The Court.

**Variantes contextuelles**
- Tournoi : *Trouvez votre tournoi sur The Court.*
- Club : *The Court · pour les clubs qui prennent leur sport au sérieux.*
- Joueur : *Une seule app. Tout votre padel. The Court.*

**Wordmark**
`the court` en minuscules, serif, avec l'article aussi présent visuellement que le nom — pas de hiérarchisation forte. Possibilité d'une variante avec un point final discret : `the court.`

**Domaines à sécuriser (à vérifier)**
- `thecourt.fr` (priorité 1)
- `thecourt.app`, `thecourt.io`, `thecourt.com` si dispos
- À éviter en signature publique : `the-court.com` (avec tiret) — plus faible

---

## 2. Direction artistique — Bandeja

L'inspiration vient du coup typique du padel et de l'esthétique des clubs argentins historiques : terre battue, bois, métal patiné, lumière chaude. Premium, racines authentiques, jamais clinquant.

### Palette

| Rôle | Token | HEX | Usage |
|---|---|---|---|
| Crème argentée (fond principal) | `--cream-50` | `#F1EDE5` | Fond mode clair, surfaces principales |
| Crème claire | `--cream-100` | `#F8F6F0` | Surfaces alternatives, cartes |
| Crème ombrée | `--cream-200` | `#E5DFD3` | Bordures discrètes, hover |
| Vert padel profond (signature) | `--court-700` | `#0F4C3A` | Texte sur crème, accents forts, fond mode sombre |
| Vert padel medium | `--court-600` | `#176B53` | Hover, état actif |
| Vert padel pâle | `--court-100` | `#D7E5DD` | Fond de tag, badge |
| Or signature (rare) | `--gold-500` | `#C9A24A` | Highlights ponctuels — max 1 par écran |
| Or pâle | `--gold-100` | `#F0E4C2` | Fond de badge premium |
| Noir profond | `--ink-950` | `#15171A` | Texte principal mode clair |
| Gris papier | `--paper-200` | `#D8D2C5` | Séparations, lignes |
| Blanc cassé | `--off-white` | `#FBFAF6` | Surfaces lumineuses |

**Règle d'or :** sur chaque écran, l'or apparaît au plus une à deux fois. Le vert porte la marque, l'or signe.

### Typographie

| Usage | Font | Notes |
|---|---|---|
| Titres (H1, H2, H3) | **Fraunces** (Google Fonts) | Serif moderne, optical size variable, contraste élevé. Alternative premium : GT Sectra, Tiempos Headline. |
| Corps | **Inter** | Sans serif neutre, lisible à toute taille. |
| Mono ponctuel | **JetBrains Mono** | Numéros de licence, IDs, valeurs techniques. |

**Mix serif / sans-serif** = la signature visuelle de The Court. Les titres en serif donnent le ton premium ; le corps reste un sans-serif rationnel pour la lisibilité fonctionnelle.

### Iconographie

- Lucide (style ligne 1.5px) — cohérent partout.
- Pas d'illustrations cartoonesques. Si illustration : lignes fines, sépia, esprit gravure technique.

### Photographie

- Photos réelles de matchs, joueurs, clubs.
- Traitement chaud, légèrement désaturé, jamais saturé.
- Pas de stock générique souriant.
- Le terrain (le *court* lui-même) est un sujet à part entière.

### Motion

- Discret. Pas d'animations décoratives.
- Easing : `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo).
- Durées : 120ms / 200ms / 360ms, jamais plus.

---

## 3. Ce qu'on ne fait jamais

- ❌ Dégradés, gloss, ombres tape-à-l'œil
- ❌ Polices script ou décoratives
- ❌ Emojis dans titres ou nav
- ❌ Photos de stock génériques
- ❌ Or sur or sur or — l'or doit rester rare
- ❌ Néon, fluo, rouge "alerte" en couleur principale (réservé à l'état d'erreur, ponctuellement)

---

## 4. Mode sombre

Inversion contrôlée :
- Fond : `--court-700` (vert profond)
- Texte : crème
- Or : reste l'or (visibilité encore meilleure sur fond sombre)

Le mode sombre prend une teinte verte plutôt qu'un noir pur. C'est délibéré : The Court reste *The Court* même de nuit.

---

## 5. Quelques exemples d'application

**Bouton primaire**
- Fond : `--court-700`
- Texte : `--cream-50`
- Hover : `--court-600`

**Bouton secondaire**
- Fond : transparent
- Texte : `--court-700`
- Bordure : `--paper-200`
- Hover fond : `--cream-200`

**Badge premium**
- Fond : `--gold-100`
- Texte : `--gold-500`

**Tag classement (P250, P500…)**
- Fond : `--court-100`
- Texte : `--court-700`
- Police : Inter mono ou serif minuscule

---

## 6. Logo et signature visuelle

### Wordmark
```
the court.
```
- Police : Fraunces, italic optionnel
- Taille minimale : 14px
- Espace de protection : hauteur du `c` autour du wordmark
- Couleurs autorisées : `--court-700` sur crème · `--cream-50` sur vert profond · `--gold-500` réservé aux usages spéciaux

### Logomark (à finaliser avec un graphiste)
Idée à explorer : un encadré rectangulaire fin (1.5px) divisé par une ligne médiane horizontale (le filet), proportions 2:1. Forme abstraite et reconnaissable, marche en 16x16 comme en 1024x1024.

---

## 7. Signature pied de page

> The Court · Tout se joue ici.
> © 2026 — Conçu en France.
