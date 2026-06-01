'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { LandingHeroBackground } from '@/components/public/landing-hero-background';
import {
  landingBenefits,
  landingPersonaSections,
  landingPricingPlans,
} from '@/lib/public-sections';
import { PublicFooter } from '@/components/public/public-section-layout';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={className}>
      <path d="M3.5 8.5l3 3 6-6" {...stroke} />
    </svg>
  );
}

function StepIcon({ type }: { type: 'search' | 'check' | 'play' }) {
  if (type === 'search') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <circle cx="11" cy="11" r="6" {...stroke} />
        <path d="M16 16l4 4" {...stroke} />
      </svg>
    );
  }
  if (type === 'check') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path d="M5 12l5 5L20 7" {...stroke} />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="8" {...stroke} />
      <path d="M10 8.5c0 2 1.5 3.5 2 5 .5-1.5 2-3 2-5a2 2 0 1 0-4 0" {...stroke} />
    </svg>
  );
}

export default function LandingPageClient() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <SiteHeader />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <LandingHeroBackground />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-12 text-center md:px-7 md:pb-24 md:pt-16">
          <p
            className="font-mono text-sm uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.02em', fontSize: 'clamp(18px, 3vw, 26px)' }}
          >
            the court<span style={{ color: 'var(--gold-500)' }}>.</span>
          </p>

          <h1
            className="mx-auto mt-6 max-w-4xl leading-[1.05] tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 6.5vw, 64px)',
              fontWeight: 500,
            }}
          >
            Tout se joue sur{' '}
            <span style={{ color: 'var(--court-700)' }}>The Court</span>
            <span style={{ color: 'var(--gold-500)' }}>.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Tournois, partenaires, paiements, résultats : une seule plateforme pour joueurs, clubs
            et juges-arbitres — pensée mobile-first.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tournois"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-px"
              style={{ background: 'var(--court-700)' }}
            >
              Trouver un tournoi
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full border px-6 py-3.5 text-sm font-semibold transition hover:bg-[var(--cream-200)]"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--court-700)' }}
            >
              Créer un compte
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full px-5 py-3.5 text-sm font-semibold transition hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              Connexion
            </Link>
          </div>

          <div className="mx-auto mt-12 flex max-w-sm items-center justify-center gap-8 md:gap-10">
            {(
              [
                { type: 'search' as const, label: 'Cherche' },
                { type: 'check' as const, label: 'Inscris-toi' },
                { type: 'play' as const, label: 'Joue' },
              ] as const
            ).map((step) => (
              <div key={step.label} className="flex flex-col items-center gap-2">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    background: 'color-mix(in srgb, var(--bg-surface) 88%, transparent)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--court-700)',
                  }}
                >
                  <StepIcon type={step.type} />
                </span>
                <span className="text-xs font-semibold" style={{ color: 'var(--court-700)' }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personas */}
      {landingPersonaSections.map((section, index) => {
        const isGold = section.accent === 'gold';
        const isDark = section.id === 'arbitres';

        return (
          <section
            key={section.id}
            id={section.id}
            className="border-t"
            style={{
              borderColor: 'var(--cream-200)',
              background: isDark ? 'var(--court-700)' : index % 2 === 1 ? 'color-mix(in srgb, var(--cream-100) 50%, var(--bg-page))' : 'var(--bg-page)',
              color: isDark ? 'var(--cream-50)' : 'var(--text-primary)',
            }}
          >
            <div className="mx-auto max-w-6xl px-6 py-16 md:px-7 md:py-20">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
                <div>
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.14em]"
                    style={{ color: isDark ? 'var(--gold-300)' : isGold ? 'var(--gold-700)' : 'var(--court-600)' }}
                  >
                    {section.kicker}
                  </p>
                  <h2
                    className="mt-4 leading-tight tracking-tight"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(28px, 4vw, 40px)',
                      fontWeight: 500,
                    }}
                  >
                    {section.title}
                  </h2>
                  <p
                    className="mt-4 max-w-lg text-base leading-relaxed"
                    style={{ color: isDark ? 'rgba(241,237,229,0.78)' : 'var(--text-secondary)' }}
                  >
                    {section.subtitle}
                  </p>
                  <Link
                    href={section.href}
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold transition hover:gap-3"
                    style={{ color: isDark ? 'var(--gold-300)' : isGold ? 'var(--gold-700)' : 'var(--court-700)' }}
                  >
                    {section.cta}
                    <span aria-hidden>→</span>
                  </Link>
                </div>

                <div className="space-y-6">
                  <ul className="space-y-3">
                    {section.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed">
                        <span
                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: isDark ? 'rgba(241,237,229,0.12)' : isGold ? 'var(--gold-100)' : 'var(--court-100)',
                            color: isDark ? 'var(--gold-300)' : isGold ? 'var(--gold-700)' : 'var(--court-700)',
                          }}
                        >
                          <CheckIcon />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {section.premiumFeatures && (
                    <div
                      className="rounded-2xl border p-5"
                      style={{
                        borderColor: isDark ? 'rgba(241,237,229,0.15)' : 'var(--border-subtle)',
                        background: isDark ? 'rgba(241,237,229,0.06)' : 'var(--bg-surface)',
                      }}
                    >
                      <p
                        className="font-mono text-[10px] uppercase tracking-[0.12em]"
                        style={{ color: isDark ? 'var(--gold-300)' : 'var(--gold-700)' }}
                      >
                        Premium
                      </p>
                      <ul className="mt-3 space-y-2">
                        {section.premiumFeatures.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5 text-sm">
                            <span style={{ color: isDark ? 'var(--gold-300)' : 'var(--gold-600)' }} aria-hidden>
                              +
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Tarifs */}
      <section id="tarifs" className="border-t py-16 md:py-20" style={{ borderColor: 'var(--cream-200)' }}>
        <div className="mx-auto max-w-6xl px-6 md:px-7">
          <div className="text-center">
            <span
              className="inline-flex items-center rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em]"
              style={{ background: 'var(--gold-100)', color: 'var(--gold-700)' }}
            >
              Tarification
            </span>
            <h2
              className="mx-auto mt-6 max-w-2xl leading-tight tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4.5vw, 48px)',
                fontWeight: 500,
              }}
            >
              Gratuit pour jouer.
              <br />
              <span className="italic" style={{ color: 'var(--court-700)' }}>
                Premium pour aller plus loin.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
              L&apos;inscription à un tournoi reste payée au club. Les abonnements débloquent les
              fonctionnalités avancées.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {landingPricingPlans.map((plan) => (
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
                <h3
                  className="mt-2"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500 }}
                >
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '36px',
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
                  className="mt-2 text-sm"
                  style={{ color: plan.featured ? 'rgba(241,237,229,0.75)' : 'var(--text-secondary)' }}
                >
                  {plan.description}
                </p>
                <ul className="mt-5 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: plan.featured ? 'rgba(241,237,229,0.15)' : 'var(--court-100)',
                          color: plan.featured ? 'var(--gold-300)' : 'var(--court-700)',
                        }}
                      >
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
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

          <p className="mt-8 text-center">
            <Link href="/tarifs" className="text-sm font-semibold hover:underline" style={{ color: 'var(--court-700)' }}>
              Voir tous les détails tarifaires →
            </Link>
          </p>
        </div>
      </section>

      {/* Ce que ça rapporte */}
      <section className="border-t py-16 md:py-20" style={{ borderColor: 'var(--cream-200)', background: 'color-mix(in srgb, var(--cream-100) 40%, var(--bg-page))' }}>
        <div className="mx-auto max-w-6xl px-6 md:px-7">
          <div className="text-center">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--court-600)' }}
            >
              Ce que ça rapporte
            </p>
            <h2
              className="mx-auto mt-4 max-w-xl leading-tight tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 500,
              }}
            >
              Une plateforme, trois bénéfices concrets
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {landingBenefits.map((benefit) => (
              <article
                key={benefit.persona}
                className="rounded-3xl border p-6 md:p-7"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              >
                <p
                  className="font-mono text-[11px] uppercase tracking-[0.12em]"
                  style={{ color: 'var(--gold-700)' }}
                >
                  {benefit.persona}
                </p>
                <h3
                  className="mt-3 leading-snug"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500 }}
                >
                  {benefit.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {benefit.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: 'var(--court-600)' }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section
        className="relative overflow-hidden py-20 text-center md:py-24"
        style={{ background: 'var(--court-700)', color: 'var(--cream-50)' }}
      >
        <div className="relative mx-auto max-w-2xl px-6 md:px-7">
          <h2
            className="leading-tight tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 500,
            }}
          >
            Prêt à entrer sur le court ?
          </h2>
          <p className="mt-4 text-base" style={{ color: 'rgba(241,237,229,0.78)' }}>
            Rejoignez la plateforme padel qui centralise tournois, inscriptions et résultats.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-px"
              style={{ background: 'var(--gold-500)', color: 'var(--court-900)' }}
            >
              Créer un compte
            </Link>
            <Link
              href="/tournois"
              className="inline-flex items-center rounded-full border px-6 py-3.5 text-sm font-semibold transition hover:bg-white/10"
              style={{ borderColor: 'rgba(241,237,229,0.3)', color: 'var(--cream-50)' }}
            >
              Explorer les tournois
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
