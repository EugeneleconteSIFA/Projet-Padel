import type { Metadata } from 'next';
import { PublicSectionLayout } from '@/components/public/public-section-layout';
import { playerFeatures, playerPricingSummary } from '@/lib/public-sections';

export const metadata: Metadata = {
  title: 'Espace joueur — The Court',
  description: 'Recherche de tournois, inscription, paiement partagé et profil padel sur The Court.',
};

export default function JoueursPage() {
  return (
    <PublicSectionLayout
      badge="Espace joueur"
      title={
        <>
          Tout ton padel
          <span className="italic" style={{ color: 'var(--court-700)' }}>
            {' '}
            en un seul endroit.
          </span>
        </>
      }
      subtitle="Chercher un tournoi, s'inscrire, payer sa part et suivre tes matchs — sans jongler entre Tenup, WhatsApp et Facebook."
      features={playerFeatures}
      pricingSummary={playerPricingSummary}
      primaryCta={{ label: 'Explorer les tournois', href: '/tournois' }}
      secondaryCta={{ label: 'Créer un compte joueur', href: '/signup' }}
      soft
      headerVariant="rose"
    />
  );
}
