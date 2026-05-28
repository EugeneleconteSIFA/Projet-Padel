import type { Metadata } from 'next';
import { PublicSectionLayout } from '@/components/public/public-section-layout';
import { refereeFeatures, refereePricingSummary } from '@/lib/public-sections';

export const metadata: Metadata = {
  title: 'Espace juge-arbitre — The Court',
  description: 'Générez les tableaux, saisissez les scores et publiez les résultats depuis votre mobile.',
};

export default function JugeArbitrePage() {
  return (
    <PublicSectionLayout
      badge="Espace juge-arbitre"
      accent="gold"
      title={
        <>
          Le tournoi se gère
          <span className="italic" style={{ color: 'var(--gold-700)' }}>
            {' '}
            depuis votre téléphone.
          </span>
        </>
      }
      subtitle="Fini les tableaux à la main et les scores sur WhatsApp. Validez les inscrits, générez les brackets et publiez les résultats en direct — gratuitement, après validation de votre compte."
      features={refereeFeatures}
      pricingSummary={refereePricingSummary}
      primaryCta={{ label: 'Créer un compte juge-arbitre', href: '/signup' }}
      secondaryCta={{ label: 'Voir les tarifs', href: '/tarifs' }}
    />
  );
}
