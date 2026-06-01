export type FeatureTier = 'gratuit' | 'premium' | 'club' | 'bientot';

export type PublicFeature = {
  title: string;
  body: string;
  icon: string;
  tier: FeatureTier;
};

export type PricingPlan = {
  plan: string;
  name: string;
  price: string;
  priceSuffix: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

export type PricingSummary = {
  label: string;
  price: string;
  description: string;
};

export const siteIntroPills = [
  { icon: '🔍', label: 'Cherche' },
  { icon: '✅', label: 'Inscris-toi' },
  { icon: '🎾', label: 'Joue' },
];

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

export type LandingPersonaSection = {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  features: string[];
  premiumFeatures?: string[];
  href: string;
  cta: string;
  accent: 'court' | 'gold';
};

export type LandingBenefit = {
  persona: string;
  title: string;
  items: string[];
};

/** Sections persona pour la landing publique (sans emoji). */
export const landingPersonaSections: LandingPersonaSection[] = [
  {
    id: 'joueurs',
    kicker: 'Pour les joueurs',
    title: 'Trouve, inscris-toi, joue.',
    subtitle:
      'Recherche par ville et date, inscription seule ou en duo, suivi des résultats et historique — le tout depuis votre mobile.',
    features: [
      'Trouver des tournois proches',
      'Filtrer par ville, date, catégorie et prix',
      'S\'inscrire seul ou avec un partenaire',
      'Suivre résultats et historique',
      'Profil joueur gratuit',
      'Communauté de base (feed, forum, matchs)',
    ],
    premiumFeatures: [
      'Priorité d\'inscription aux tournois complets',
      'Statistiques avancées et badge Premium',
      'Pas de publicité',
      'Matchmaking partenaire (à venir)',
    ],
    href: '/joueurs',
    cta: 'Découvrir l\'espace joueur',
    accent: 'court',
  },
  {
    id: 'clubs',
    kicker: 'Pour les clubs',
    title: 'Remplissez vos tournois, encaissez proprement.',
    subtitle:
      'Créez, publiez et suivez vos tournois depuis un back-office pensé pour les responsables de club.',
    features: [
      'Créer et publier des tournois',
      'Suivre les inscriptions en temps réel',
      'Gérer les paiements (simulation, Stripe plus tard)',
      'Voir et activer la liste d\'attente',
      'Assigner un juge-arbitre',
      'Statistiques de remplissage',
    ],
    href: '/clubs',
    cta: 'Découvrir l\'espace club',
    accent: 'gold',
  },
  {
    id: 'arbitres',
    kicker: 'Pour les juges-arbitres',
    title: 'Le tournoi se gère depuis votre téléphone.',
    subtitle:
      'Validation des inscrits, tableaux, scores et résultats — un cockpit mobile-first, gratuit après validation du compte.',
    features: [
      'Voir les tournois assignés',
      'Valider les inscrits et gérer les forfaits',
      'Générer les tableaux',
      'Saisir les scores match par match',
      'Publier les résultats en direct',
    ],
    href: '/juge-arbitre',
    cta: 'Découvrir l\'espace juge-arbitre',
    accent: 'gold',
  },
];

export const landingBenefits: LandingBenefit[] = [
  {
    persona: 'Joueur',
    title: 'Gagnez du temps, jouez plus',
    items: [
      'Trouvez un tournoi en quelques clics',
      'Suivez votre progression sur la saison',
      'Centralisez inscriptions et résultats',
    ],
  },
  {
    persona: 'Club',
    title: 'Remplissez mieux, encaissez plus proprement',
    items: [
      'Taux de remplissage plus élevé',
      'Moins de no-shows grâce aux relances',
      'Paiements centralisés et traçables',
    ],
  },
  {
    persona: 'Juge-arbitre',
    title: 'Moins de tableaux manuels',
    items: [
      'Gagnez du temps le jour J',
      'Scores centralisés, plus de WhatsApp',
      'Résultats publiés automatiquement',
    ],
  },
];

export const landingPricingPlans: PricingPlan[] = [
  {
    plan: 'Joueur',
    name: 'Gratuit',
    price: '0 €',
    priceSuffix: '/ mois',
    description: "Tout ce qu'il faut pour jouer.",
    features: [
      'Recherche illimitée',
      'Inscription tournois',
      'Paiement partagé',
      'Profil + historique',
      'Communauté (connecté)',
    ],
    cta: 'Créer un compte',
    href: '/signup',
  },
  {
    plan: 'Joueur Premium',
    name: 'Premium',
    price: '4,99 €',
    priceSuffix: '/ mois',
    description: 'Pour les compétiteurs réguliers.',
    features: [
      'Inscription prioritaire',
      'Statistiques avancées',
      'Badge Premium',
      'Recommandations personnalisées',
      'Sans publicité',
    ],
    cta: 'Passer Premium',
    href: '/signup',
    featured: true,
  },
  {
    plan: 'Club Starter',
    name: 'Starter',
    price: '29 €',
    priceSuffix: '/ mois',
    description: 'Gestion simple des tournois et inscriptions.',
    features: [
      'Création de tournois',
      'Gestion des inscriptions',
      'Liste d\'attente',
      'Dashboard club',
      'Paiements simulés (Stripe plus tard)',
    ],
    cta: 'Créer un compte club',
    href: '/signup',
  },
  {
    plan: 'Club Pro',
    name: 'Pro',
    price: '79 €',
    priceSuffix: '/ mois',
    description: 'Pour les clubs qui veulent optimiser leur remplissage.',
    features: [
      'Statistiques avancées',
      'CRM joueurs',
      'Relances automatiques',
      'Remplissage optimisé',
      'Options événements',
    ],
    cta: 'Contacter l\'équipe',
    href: '/signup',
  },
  {
    plan: 'Juge-arbitre',
    name: 'Gratuit',
    price: '0 €',
    priceSuffix: '',
    description: 'Accès complet après validation du compte.',
    features: [
      'Tournois assignés',
      'Tableaux et scores',
      'Publication des résultats',
      'Historique d\'arbitrage',
    ],
    cta: 'Créer un compte juge-arbitre',
    href: '/signup',
  },
];

/** Alias complet — 5 plans (joueur, premium, club starter, club pro, JA). */
export const pricingPlans: PricingPlan[] = landingPricingPlans;

export const homeRubrics = [
  {
    title: 'Joueurs',
    tagline: 'Trouve et rejoins un tournoi en quelques clics.',
    href: '/joueurs',
    accent: 'var(--court-700)',
    accentSoft: 'var(--court-100)',
    icon: 'player',
  },
  {
    title: 'Clubs',
    tagline: 'Crée et gère tes tournois simplement.',
    href: '/clubs',
    accent: 'var(--gold-700)',
    accentSoft: 'var(--gold-100)',
    icon: 'club',
  },
  {
    title: 'Juges-arbitres',
    tagline: 'Tableaux, scores et suivi sportif.',
    href: '/juge-arbitre',
    accent: 'var(--gold-700)',
    accentSoft: 'var(--gold-100)',
    icon: 'referee',
  },
  {
    title: 'Tarifs',
    tagline: 'Gratuit pour jouer. Premium pour aller plus loin.',
    href: '/tarifs',
    accent: 'var(--gold-500)',
    accentSoft: 'var(--gold-100)',
    icon: 'pricing',
  },
] as const;

/** @deprecated Utiliser playerFeatures — conservé pour compatibilité interne */
export const playerFacets = playerFeatures;
export const clubFacets = clubFeatures;
export const refereeFacets = refereeFeatures;
