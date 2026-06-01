'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { LandingHeroBackground } from '@/components/public/landing-hero-background';
import { LandingAppPreview } from '@/components/public/landing-app-preview';
import {
  LANDING_PRICING_DISCLAIMER,
  landingHowItWorks,
  landingPricingPlans,
  landingRoleCards,
  landingSimplifyBenefits,
  type LandingHowItWorksStep,
  type LandingSimplifyBenefit,
} from '@/lib/public-sections';
import { PublicFooter } from '@/components/public/public-section-layout';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function HowItWorksIcon({ icon }: { icon: LandingHowItWorksStep['icon'] }) {
  if (icon === 'search') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
        <circle cx="11" cy="11" r="6" {...stroke} />
        <path d="M16 16l4 4" {...stroke} />
      </svg>
    );
  }
  if (icon === 'register') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...stroke} />
        <circle cx="9" cy="7" r="3" {...stroke} />
        <path d="M19 8v6M22 11h-6" {...stroke} />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="M3 3v18h18" {...stroke} />
      <path d="M7 14l4-4 3 3 5-6" {...stroke} />
    </svg>
  );
}

function SimplifyIcon({ icon }: { icon: LandingSimplifyBenefit['icon'] }) {
  const paths: Record<LandingSimplifyBenefit['icon'], React.ReactNode> = {
    messages: (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...stroke} />
      </>
    ),
    clipboard: (
      <>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" {...stroke} />
        <rect x="8" y="2" width="8" height="4" rx="1" {...stroke} />
      </>
    ),
    scoreboard: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" {...stroke} />
        <path d="M7 8h4M7 12h10M7 16h6" {...stroke} />
      </>
    ),
    flow: (
      <>
        <path d="M5 12h14M12 5l7 7-7 7" {...stroke} />
      </>
    ),
  };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      {paths[icon]}
    </svg>
  );
}

export default function LandingPageClient() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative w-full overflow-hidden">
        <LandingHeroBackground />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-12 md:px-7 md:pb-28 md:pt-16 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: 'clamp(20px, 3vw, 28px)',
                letterSpacing: '-0.02em',
              }}
            >
              the court<span style={{ color: 'var(--gold-500)' }}>.</span>
            </p>

            <h1
              className="mt-5 max-w-lg leading-[1.08] tracking-tight lg:mx-0 mx-auto"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 5.5vw, 52px)',
                fontWeight: 500,
              }}
            >
              Tout ton padel, au même endroit.
            </h1>

            <p
              className="mx-auto mt-5 max-w-md text-base leading-relaxed lg:mx-0"
              style={{ color: 'var(--text-secondary)' }}
            >
              Trouve un tournoi, inscris-toi, suis tes matchs. Clubs et juges-arbitres gèrent tout
              depuis un espace dédié.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
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
                Se connecter
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <LandingAppPreview />
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section
        id="comment-ca-marche"
        className="border-t py-16 md:py-20"
        style={{ borderColor: 'var(--cream-200)' }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-7">
          <div className="text-center">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--court-600)' }}
            >
              Comment ça marche
            </p>
            <h2
              className="mx-auto mt-4 max-w-lg leading-tight tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 4vw, 36px)',
                fontWeight: 500,
              }}
            >
              Du tournoi trouvé au résultat publié
            </h2>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {landingHowItWorks.map((step) => (
              <li
                key={step.step}
                className="flex flex-col items-center rounded-3xl border p-6 text-center md:p-8"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: 'var(--court-100)', color: 'var(--court-700)' }}
                >
                  <HowItWorksIcon icon={step.icon} />
                </span>
                <span
                  className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--gold-700)' }}
                >
                  Étape {step.step}
                </span>
                <p
                  className="mt-2 text-sm font-medium leading-snug md:text-base"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {step.title}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Un espace pour chaque rôle ── */}
      <section
        className="border-t py-16 md:py-20"
        style={{
          borderColor: 'var(--cream-200)',
          background: 'color-mix(in srgb, var(--cream-100) 35%, var(--bg-page))',
        }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-7">
          <div className="text-center">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--court-600)' }}
            >
              Un espace pour chaque rôle
            </p>
            <h2
              className="mx-auto mt-4 max-w-xl leading-tight tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 4vw, 36px)',
                fontWeight: 500,
              }}
            >
              Joueurs, clubs et juges-arbitres — chacun son outil
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {landingRoleCards.map((card) => {
              const isGold = card.accent === 'gold';
              return (
                <article
                  key={card.id}
                  className="flex flex-col rounded-3xl border p-6 md:p-7"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                >
                  <h3
                    className="leading-snug"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      fontWeight: 500,
                      color: isGold ? 'var(--gold-700)' : 'var(--court-700)',
                    }}
                  >
                    {card.title}
                  </h3>
                  <ul className="mt-5 flex-1 space-y-3">
                    {card.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 text-sm leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: isGold ? 'var(--gold-500)' : 'var(--court-600)' }}
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={card.href}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition hover:gap-2.5"
                    style={{ color: isGold ? 'var(--gold-700)' : 'var(--court-700)' }}
                  >
                    En savoir plus
                    <span aria-hidden>→</span>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Ce que The Court simplifie ── */}
      <section className="border-t py-16 md:py-20" style={{ borderColor: 'var(--cream-200)' }}>
        <div className="mx-auto max-w-6xl px-6 md:px-7">
          <div className="text-center">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--court-600)' }}
            >
              Ce que The Court simplifie
            </p>
            <h2
              className="mx-auto mt-4 max-w-lg leading-tight tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 4vw, 36px)',
                fontWeight: 500,
              }}
            >
              Moins de friction, plus de padel
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {landingSimplifyBenefits.map((benefit) => (
              <article
                key={benefit.title}
                className="flex flex-col items-center rounded-3xl border p-5 text-center md:p-6"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: 'var(--court-100)', color: 'var(--court-700)' }}
                >
                  <SimplifyIcon icon={benefit.icon} />
                </span>
                <p
                  className="mt-4 text-sm font-medium leading-snug"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {benefit.title}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tarifs ── */}
      <section
        id="tarifs"
        className="border-t py-16 md:py-20"
        style={{
          borderColor: 'var(--cream-200)',
          background: 'color-mix(in srgb, var(--cream-100) 35%, var(--bg-page))',
        }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-7">
          <div className="text-center">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--gold-700)' }}
            >
              Tarification
            </p>
            <h2
              className="mx-auto mt-4 max-w-xl leading-tight tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 4vw, 36px)',
                fontWeight: 500,
              }}
            >
              Un prix, une cible, une promesse
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {landingPricingPlans.map((plan) => (
              <article
                key={plan.plan}
                className="relative flex flex-col rounded-3xl border p-5 md:p-6"
                style={{
                  background: plan.featured ? 'var(--court-700)' : 'var(--bg-surface)',
                  borderColor: plan.featured ? 'var(--court-600)' : 'var(--border-subtle)',
                  color: plan.featured ? 'var(--cream-50)' : 'var(--text-primary)',
                }}
              >
                {plan.featured && (
                  <span
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                    style={{ background: 'var(--gold-500)', color: 'var(--court-900)' }}
                  >
                    Populaire
                  </span>
                )}
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.12em]"
                  style={{ color: plan.featured ? 'var(--gold-300)' : 'var(--text-muted)' }}
                >
                  {plan.plan}
                </p>
                <div className="mt-2 flex flex-wrap items-baseline gap-1">
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '28px',
                      fontWeight: 500,
                      color: plan.featured ? 'var(--gold-300)' : 'var(--court-700)',
                    }}
                  >
                    {plan.price}
                  </span>
                  {plan.priceSuffix && (
                    <span
                      className="text-xs"
                      style={{ color: plan.featured ? 'rgba(241,237,229,0.7)' : 'var(--text-muted)' }}
                    >
                      {plan.priceSuffix}
                    </span>
                  )}
                </div>
                <p
                  className="mt-3 flex-1 text-sm leading-relaxed"
                  style={{ color: plan.featured ? 'rgba(241,237,229,0.8)' : 'var(--text-secondary)' }}
                >
                  <span className="font-medium" style={{ color: plan.featured ? 'var(--cream-50)' : 'var(--text-primary)' }}>
                    Pour :
                  </span>{' '}
                  {plan.promise}
                </p>
                <Link
                  href={plan.href}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-xs font-semibold transition"
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
            className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            {LANDING_PRICING_DISCLAIMER}
          </p>

          <p className="mt-4 text-center">
            <Link href="/tarifs" className="text-sm font-semibold hover:underline" style={{ color: 'var(--court-700)' }}>
              Voir la page tarifs →
            </Link>
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
