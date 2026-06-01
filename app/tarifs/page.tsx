import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { PublicFooter } from '@/components/public/public-section-layout';
import { LANDING_PRICING_DISCLAIMER, pricingPlans } from '@/lib/public-sections';

export const metadata: Metadata = {
  title: 'Tarifs — The Court',
  description: 'Gratuit pour jouer. Premium pour aller plus loin. Abonnement club pour organiser vos tournois.',
};

export default function TarifsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pb-8 pt-16 text-center md:px-7 md:pt-20">
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
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 500,
          }}
        >
          Un prix, une cible, une promesse
        </h1>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-7">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {pricingPlans.map((plan) => (
            <article
              key={plan.plan}
              className="relative flex flex-col rounded-3xl border p-6 transition hover:-translate-y-0.5 md:p-7"
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
              <div className="mt-3 flex flex-wrap items-baseline gap-1">
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '32px',
                    fontWeight: 500,
                    color: plan.featured ? 'var(--gold-300)' : 'var(--court-700)',
                  }}
                >
                  {plan.price}
                </span>
                {plan.priceSuffix && (
                  <span
                    className="text-sm"
                    style={{ color: plan.featured ? 'rgba(241,237,229,0.7)' : 'var(--text-muted)' }}
                  >
                    {plan.priceSuffix}
                  </span>
                )}
              </div>
              <p
                className="mt-4 flex-1 text-sm leading-relaxed"
                style={{ color: plan.featured ? 'rgba(241,237,229,0.8)' : 'var(--text-secondary)' }}
              >
                <span className="font-medium" style={{ color: plan.featured ? 'var(--cream-50)' : 'var(--text-primary)' }}>
                  Pour :
                </span>{' '}
                {plan.promise}
              </p>
              <Link
                href={plan.href}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
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

        <p
          className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          {LANDING_PRICING_DISCLAIMER}
        </p>
      </section>

      <PublicFooter />
    </div>
  );
}
