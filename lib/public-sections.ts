export type FeatureTier = 'gratuit' | 'premium' | 'club' | 'bientot';

export type PublicFeature = {
  title: string;
  body: string;
  icon: string;
  tier: FeatureTier;
};

export type PricingPlan = {
  plan: string;
  price: string;
  priceSuffix: string;
  /** Promesse courte — une cible, pas de liste de features. */
  promise: string;
  cta: string;
  href: string;
  featured?: boolean;
};

export type LandingHowItWorksStep = {
  step: number;
  title: string;
  icon: 'search' | 'register' | 'track';
};

export type LandingRoleCard = {
  id: string;
  title: string;
  bullets: string[];
  href: string;
  accent: 'court' | 'gold';
};

export type LandingSimplifyBenefit = {
  title: string;
  icon: 'messages' | 'clipboard' | 'scoreboard' | 'flow';
};

export type PricingSummary = {
  label: string;
  price: string;
  description: string;
};

export const playerFeatures: PublicFeature[] = [
  {
    icon: '🔍',
    title: 'Recherche de tournois',
    body: 'Filtres par ville, rayon, date, catégorie (P25 → P2000), genre, indoor/outdoor et prix. Carte interactive incluse.',
    tier: 'gratuit',
  },
  {
    icon: '⚡',
    title: 'Inscription rapide',
    body: 'Compte connecté, profil padel pré-rempli. Validez votre place en quelques clics.',
    tier: 'gratuit',
  },
  {
    icon: '💳',
    title: 'Paiement partagé',
    body: 'Chaque joueur paie sa part directement. Facture automatique — le prix du tournoi est payé au club, pas à The Court.',
    tier: 'gratuit',
  },
  {
    icon: '👥',
    title: "File d'attente solo",
    body: "Pas de partenaire ? Rejoignez la liste d'attente seul en attendant un coéquipier.",
    tier: 'gratuit',
  },
  {
    icon: '📊',
    title: 'Profil et historique',
    body: 'Classement FFT, niveau, main, côté préféré et historique de vos tournois joués.',
    tier: 'gratuit',
  },
  {
    icon: '💬',
    title: 'Communauté',
    body: 'Feed, forum et matchs amicaux — accessible une fois connecté, pour échanger entre les tournois.',
    tier: 'gratuit',
  },
  {
    icon: '🤝',
    title: 'Partenaires favoris',
    body: 'Coéquipiers réguliers, stats de duo et invitation en un clic.',
    tier: 'premium',
  },
  {
    icon: '🚀',
    title: 'Inscription prioritaire',
    body: 'Accès en avance aux tournois très demandés, avant les places limitées.',
    tier: 'premium',
  },
  {
    icon: '📈',
    title: 'Statistiques avancées',
    body: 'Analyse de forme, performances par catégorie et suivi détaillé de votre saison.',
    tier: 'premium',
  },
  {
    icon: '🤖',
    title: 'Matchmaking intelligent',
    body: 'Suggestion de partenaires compatibles selon niveau et disponibilités.',
    tier: 'bientot',
  },
];

export const clubFeatures: PublicFeature[] = [
  {
    icon: '🏆',
    title: 'Création de tournoi',
    body: 'Date, catégorie, format, prix et nombre d\'équipes. Publié en 5 minutes, visible immédiatement dans la recherche.',
    tier: 'club',
  },
  {
    icon: '📋',
    title: 'Suivi des inscriptions',
    body: 'Liste en temps réel, statut par équipe, paiements vérifiés et file d\'attente.',
    tier: 'club',
  },
  {
    icon: '💶',
    title: 'Encaissement Stripe Connect',
    body: 'Les inscriptions arrivent directement sur le compte bancaire du club. Pas d\'intermédiaire.',
    tier: 'club',
  },
  {
    icon: '🎾',
    title: 'Gestion des terrains',
    body: 'Inventaire indoor/outdoor et attribution aux matchs du tournoi.',
    tier: 'club',
  },
  {
    icon: '📣',
    title: 'Annonces club',
    body: 'Publiez des actualités visibles par vos membres et dans le feed communautaire.',
    tier: 'club',
  },
  {
    icon: '🔔',
    title: "File d'attente intelligente",
    body: 'Désistement détecté → le joueur suivant est notifié automatiquement.',
    tier: 'club',
  },
  {
    icon: '📊',
    title: 'Statistiques de remplissage',
    body: 'Taux de remplissage, revenus et tendances par tournoi.',
    tier: 'club',
  },
  {
    icon: '🎯',
    title: 'CRM joueurs',
    body: 'Segmentation des adhérents, relances et communication ciblée.',
    tier: 'bientot',
  },
  {
    icon: '💡',
    title: 'Dynamic pricing',
    body: 'Ajustement automatique des prix selon la demande et le remplissage.',
    tier: 'bientot',
  },
];

export const refereeFeatures: PublicFeature[] = [
  {
    icon: '📐',
    title: 'Génération des tableaux',
    body: 'Élimination directe, poules + tableau ou consolante. Validation et publication en un clic.',
    tier: 'gratuit',
  },
  {
    icon: '📱',
    title: 'Saisie de scores tactile',
    body: 'Interface mobile-first : set par set, jeu par jeu, tie-break. Correction immédiate.',
    tier: 'gratuit',
  },
  {
    icon: '📢',
    title: 'Publication des résultats',
    body: 'Score saisi = résultat visible côté joueur. Classements mis à jour en direct.',
    tier: 'gratuit',
  },
  {
    icon: '✅',
    title: 'Validation des inscrits',
    body: 'Contrôle des équipes, gestion des litiges et forfaits avant le début du tournoi.',
    tier: 'gratuit',
  },
  {
    icon: '🚫',
    title: 'Gestion des forfaits',
    body: 'Walkover en un clic — le tableau s\'adapte automatiquement.',
    tier: 'gratuit',
  },
  {
    icon: '📁',
    title: "Historique d'arbitrage",
    body: 'Tournois officiés, export PDF pour vos justificatifs fédéraux.',
    tier: 'gratuit',
  },
];

export const playerPricingSummary: PricingSummary = {
  label: 'Compte joueur',
  price: '0 € / mois',
  description:
    'Gratuit pour chercher, s\'inscrire et jouer. Premium (4,99 €/mois) pour les fonctionnalités avancées. L\'inscription à un tournoi reste payée au club, pas à The Court.',
};

export const clubPricingSummary: PricingSummary = {
  label: 'Abonnement club',
  price: '29 € / mois',
  description:
    'Inclut la création illimitée de tournois, le suivi des inscriptions et l\'encaissement Stripe Connect. Les joueurs ne paient pas The Court pour s\'inscrire.',
};

export const refereePricingSummary: PricingSummary = {
  label: 'Compte juge-arbitre',
  price: 'Gratuit',
  description:
    'Accès complet aux outils d\'arbitrage après validation de votre compte. Aucun abonnement requis pour les juges-arbitres.',
};

/** Parcours global — section « Comment ça marche » (landing). */
export const landingHowItWorks: LandingHowItWorksStep[] = [
  { step: 1, title: 'Cherche un tournoi', icon: 'search' },
  { step: 2, title: 'Inscris-toi seul ou avec partenaire', icon: 'register' },
  { step: 3, title: 'Suis l\'organisation, les scores et les résultats', icon: 'track' },
];

/** Cartes rôles — angles distincts, sans redondance. */
export const landingRoleCards: LandingRoleCard[] = [
  {
    id: 'joueur',
    title: 'Joueur',
    bullets: [
      'Cherche des tournois',
      'S\'inscrit rapidement',
      'Suit ses prochains matchs et son historique',
    ],
    href: '/joueurs',
    accent: 'court',
  },
  {
    id: 'club',
    title: 'Club',
    bullets: [
      'Publie ses tournois',
      'Suit les inscriptions et la liste d\'attente',
      'Prépare les paiements et l\'organisation',
    ],
    href: '/clubs',
    accent: 'gold',
  },
  {
    id: 'arbitre',
    title: 'Juge-arbitre',
    bullets: [
      'Consulte ses tournois assignés',
      'Prépare les tableaux',
      'Saisit les scores et publie les résultats',
    ],
    href: '/juge-arbitre',
    accent: 'gold',
  },
];

/** Bénéfices transversaux — section « Ce que The Court simplifie ». */
export const landingSimplifyBenefits: LandingSimplifyBenefit[] = [
  { title: 'Moins d\'échanges dispersés', icon: 'messages' },
  { title: 'Inscriptions plus claires', icon: 'clipboard' },
  { title: 'Suivi sportif centralisé', icon: 'scoreboard' },
  { title: 'Organisation plus fluide', icon: 'flow' },
];

/** Tarifs landing + page /tarifs — modifier ici pour ajuster les prix. */
export const landingPricingPlans: PricingPlan[] = [
  {
    plan: 'Joueur',
    price: 'Gratuit',
    priceSuffix: '',
    promise: 'Trouver et rejoindre des tournois',
    cta: 'Créer un compte',
    href: '/signup',
  },
  {
    plan: 'Joueur Premium',
    price: '4,99 €',
    priceSuffix: '/ mois',
    promise: 'Aller plus loin dans le suivi, les statistiques et les avantages joueur',
    cta: 'Passer Premium',
    href: '/signup',
    featured: true,
  },
  {
    plan: 'Club Starter',
    price: '29 €',
    priceSuffix: '/ mois',
    promise: 'Publier des tournois et suivre les inscriptions',
    cta: 'Créer un compte club',
    href: '/signup',
  },
  {
    plan: 'Club Pro',
    price: '79 €',
    priceSuffix: '/ mois',
    promise: 'Piloter l\'activité avec plus de statistiques et d\'outils avancés',
    cta: 'Contacter l\'équipe',
    href: '/signup',
  },
  {
    plan: 'Juge-arbitre',
    price: 'Gratuit',
    priceSuffix: '',
    promise: 'Gérer les tournois assignés',
    cta: 'Créer un compte juge-arbitre',
    href: '/signup',
  },
];

export const LANDING_PRICING_DISCLAIMER =
  'Les paiements réels et les commissions plateforme seront branchés plus tard. Pour l\'instant, la tarification sert à présenter le modèle économique.';

/** Alias — 5 plans (joueur, premium, club starter, club pro, JA). */
export const pricingPlans: PricingPlan[] = landingPricingPlans;

/** @deprecated Utiliser playerFeatures — conservé pour compatibilité interne */
export const playerFacets = playerFeatures;
export const clubFacets = clubFeatures;
export const refereeFacets = refereeFeatures;
