import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { PublicFooter } from '@/components/public/public-section-layout';
import { pricingPlans } from '@/lib/public-sections';

export const metadata: Metadata = {
  title: 'Tarifs — The Court',
  description: 'Gratuit pour jouer. Premium pour aller plus loin. Abonnement club pour organiser vos tournois.',
};

export default function TarifsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center md:px-7 md:pt-20">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em]"
          style={{ background: 'var(--gold-100)', color: 'var(--gold-700)' }}
        >
          Tarification
        </span>
        <h1
          className="mx-auto mt-6 max-w-2xl leading-tight tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 500,
          }}
        >
          Gratuit pour jouer.
          <br />
          <span className="italic" style={{ color: 'var(--court-700)' }}>
            Premium pour aller plus loin.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base" style={{ color: 'var(--text-secondary)' }}>
          Le joueur ne paie rien pour s&apos;inscrire à un tournoi — les frais sont inclus dans le prix
          payé au club. Les abonnements ouvrent les fonctionnalités avancées.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-7">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article
              key={plan.plan}
              className="relative flex flex-col rounded-3xl border p-7 transition hover:-translate-y-0.5"
              style={{
                background: plan.featured ? 'var(--court-700)' : 'var(--bg-surface)',
                borderColor: plan.featured ? 'var(--court-600)' : 'var(--border-subtle)',
                color: plan.featured ? 'var(--cream-50)' : 'var(--text-primary)',
                boxShadow: plan.featured ? '0 12px 40px rgba(15,76,58,0.18)' : undefined,
              }}
            >
              {plan.featured && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: 'var(--gold-500)', color: 'var(--court-900)' }}
                >
                  Populaire
                </span>
              )}
              <p
                className="font-mono text-[11px] uppercase tracking-[0.12em]"
                style={{ color: plan.featured ? 'var(--gold-300)' : 'var(--text-muted)' }}
              >
                {plan.plan}
              </p>
              <h2
                className="mt-2"
                style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 500 }}
              >
                {plan.name}
              </h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '40px',
                    fontWeight: 500,
                    color: plan.featured ? 'var(--gold-300)' : 'var(--court-700)',
                  }}
                >
                  {plan.price}
                </span>
                <span className="text-sm" style={{ color: plan.featured ? 'rgba(241,237,229,0.7)' : 'var(--text-muted)' }}>
                  {plan.priceSuffix}
                </span>
              </div>
              <p
                className="mt-3 text-sm"
                style={{ color: plan.featured ? 'rgba(241,237,229,0.75)' : 'var(--text-secondary)' }}
              >
                {plan.description}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs"
                      style={{
                        background: plan.featured ? 'rgba(241,237,229,0.15)' : 'var(--court-100)',
                        color: plan.featured ? 'var(--gold-300)' : 'var(--court-700)',
                      }}
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
                style={
                  plan.featured
                    ? { background: 'var(--gold-500)', color: 'var(--court-900)' }
                    : { background: 'var(--court-700)', color: 'var(--cream-50)' }
                }
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Tarifs indicatifs — bêta fermée en cours. Les prix définitifs seront confirmés avant le lancement public.
        </p>
      </section>

      <PublicFooter />
    </div>
  );
}
