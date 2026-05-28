import type { Metadata } from 'next';
import { PublicSectionLayout } from '@/components/public/public-section-layout';
import { clubFeatures, clubPricingSummary } from '@/lib/public-sections';

export const metadata: Metadata = {
  title: 'Espace club — The Court',
  description: 'Créez et gérez vos tournois de padel, suivez les inscriptions et encaissez via Stripe Connect.',
};

export default function ClubsPage() {
  return (
    <PublicSectionLayout
      badge="Espace club"
      title={
        <>
          Vos tournois remplis,
          <span className="italic" style={{ color: 'var(--court-700)' }}>
            {' '}
            vos joueurs contents.
          </span>
        </>
      }
      subtitle="Remplacez Excel, les SMS et les relances manuelles. Publiez un tournoi en 5 minutes et suivez inscriptions, paiements et file d'attente en temps réel."
      features={clubFeatures}
      pricingSummary={clubPricingSummary}
      primaryCta={{ label: 'Créer un compte club', href: '/signup' }}
      secondaryCta={{ label: 'Voir les tarifs détaillés', href: '/tarifs' }}
    />
  );
}
