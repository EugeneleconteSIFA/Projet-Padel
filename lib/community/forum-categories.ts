import { ForumCategory } from '@prisma/client';

/** Labels français des catégories forum (spec produit). */
export const FORUM_CATEGORY_LABELS: Record<ForumCategory, string> = {
  PARTENAIRE: 'Cherche partenaire',
  MATERIEL: 'Matériel',
  TECHNIQUE: 'Technique & tactique',
  CLUBS_TERRAINS: 'Clubs & terrains',
  REGLES_ARBITRAGE: 'Règles & arbitrage',
  PETITES_ANNONCES: 'Petites annonces',
  ORGANISATION: 'Organisation',
};

export const FORUM_CATEGORIES = Object.keys(FORUM_CATEGORY_LABELS) as ForumCategory[];

export function categoryToSlug(category: ForumCategory): string {
  return category.toLowerCase().replace(/_/g, '-');
}

export function slugToCategory(slug: string): ForumCategory | null {
  const key = slug.toUpperCase().replace(/-/g, '_');
  if (key in FORUM_CATEGORY_LABELS) {
    return key as ForumCategory;
  }
  return null;
}
