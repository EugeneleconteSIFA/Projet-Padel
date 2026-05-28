import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import type { FeatureTier, PricingSummary, PublicFeature } from '@/lib/public-sections';

type Props = {
  badge: string;
  title: React.ReactNode;
  subtitle: string;
  features: PublicFeature[];
  pricingSummary: PricingSummary;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  dark?: boolean;
  soft?: boolean;
  accent?: 'court' | 'gold';
};

const tierLabels: Record<FeatureTier, string> = {
  gratuit: 'Gratuit',
  premium: 'Premium',
  club: 'Abonnement club',
  bientot: 'Bientôt',
};

const tierStyles: Record<FeatureTier, { bg: string; color: string }> = {
  gratuit: { bg: 'var(--court-100)', color: 'var(--court-700)' },
  premium: { bg: 'rgba(201,162,74,0.18)', color: 'var(--gold-700)' },
  club: { bg: 'rgba(201,162,74,0.12)', color: 'var(--gold-700)' },
  bientot: { bg: 'var(--cream-200)', color: 'var(--text-muted)' },
};

export function TierBadge({ tier }: { tier: FeatureTier }) {
  const style = tierStyles[tier];
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ background: style.bg, color: style.color }}
    >
      {tierLabels[tier]}
    </span>
  );
}

export function PublicSectionLayout({
  badge,
  title,
  subtitle,
  features,
  pricingSummary,
  primaryCta,
  secondaryCta,
  dark = false,
  soft = false,
  accent = 'court',
}: Props) {
  const sectionBg = dark
    ? 'var(--court-700)'
    : soft
      ? 'var(--cream-100)'
      : 'var(--bg-page)';

  const textPrimary = dark ? 'var(--cream-50)' : 'var(--text-primary)';
  const textSecondary = dark ? 'rgba(241, 237, 229, 0.75)' : 'var(--text-secondary)';

  const accentBadgeBg = accent === 'gold' ? 'var(--gold-100)' : 'var(--court-100)';
  const accentBadgeColor = accent === 'gold' ? 'var(--gold-700)' : 'var(--court-700)';
  const accentLabelColor = accent === 'gold' ? 'var(--gold-700)' : 'var(--court-600)';

  const freeFeatures = features.filter((f) => f.tier === 'gratuit');
  const paidFeatures = features.filter((f) => f.tier !== 'gratuit');

  return (
    <div style={{ minHeight: '100vh', background: sectionBg, color: textPrimary }}>
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-35"
          style={{
            backgroundImage:
              'linear-gradient(var(--cream-200) 1px, transparent 1px), linear-gradient(90deg, var(--cream-200) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse at 80% 10%, black 0%, transparent 65%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 80% 10%, black 0%, transparent 65%)',
          }}
        />
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-16 md:px-7 md:pt-20">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em]"
            style={{
              background: dark ? 'rgba(241,237,229,0.12)' : accentBadgeBg,
              color: dark ? 'var(--gold-300)' : accentBadgeColor,
            }}
          >
            {badge}
          </span>

          <h1
            className="mt-6 max-w-3xl leading-[1.05] tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: 500,
            }}
          >
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-lg" style={{ color: textSecondary }}>
            {subtitle}
          </p>

          {/* Résumé tarif */}
          <div
            className="mt-8 inline-flex flex-col gap-1 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:gap-4"
            style={{
              background: dark ? 'rgba(241,237,229,0.08)' : 'var(--off-white)',
              borderColor: dark ? 'rgba(241,237,229,0.15)' : 'var(--cream-200)',
            }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: dark ? 'var(--gold-300)' : accentLabelColor }}>
                {pricingSummary.label}
              </p>
              <p
                className="mt-0.5"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '28px',
                  fontWeight: 500,
                  color: dark ? 'var(--cream-50)' : 'var(--text-primary)',
                }}
              >
                {pricingSummary.price}
              </p>
            </div>
            <p className="max-w-md text-sm leading-relaxed" style={{ color: textSecondary }}>
              {pricingSummary.description}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-px"
              style={{
                background: dark ? 'var(--gold-500)' : 'var(--court-700)',
                color: dark ? 'var(--court-900)' : 'var(--cream-50)',
              }}
            >
              {primaryCta.label} <span aria-hidden>→</span>
            </Link>
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center rounded-full border px-6 py-3.5 text-sm font-semibold transition hover:bg-[var(--cream-200)]"
                style={{
                  borderColor: dark ? 'rgba(241,237,229,0.25)' : 'var(--paper-200)',
                  color: textPrimary,
                }}
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Fonctionnalités incluses */}
      {freeFeatures.length > 0 && (
        <FeatureSection
          title="Inclus gratuitement"
          features={freeFeatures}
          dark={dark}
          soft={soft}
        />
      )}

      {/* Fonctionnalités payantes / à venir */}
      {paidFeatures.length > 0 && (
        <FeatureSection
          title={paidFeatures.some((f) => f.tier === 'club') ? 'Inclus dans l\'abonnement club' : 'Premium & à venir'}
          features={paidFeatures}
          dark={dark}
          soft={soft}
          alternate
        />
      )}

      <PublicFooter />
    </div>
  );
}

function FeatureSection({
  title,
  features,
  dark,
  soft,
  alternate,
}: {
  title: string;
  features: PublicFeature[];
  dark: boolean;
  soft: boolean;
  alternate?: boolean;
}) {
  return (
    <section
      className="border-t py-16 md:py-20"
      style={{
        borderColor: dark ? 'rgba(241,237,229,0.12)' : 'var(--cream-200)',
        background: alternate
          ? dark
            ? 'var(--court-800)'
            : soft
              ? 'var(--bg-page)'
              : 'var(--cream-100)'
          : dark
            ? 'var(--court-800)'
            : 'var(--bg-page)',
      }}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-7">
        <h2
          className="mb-8"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(22px, 3vw, 28px)',
            fontWeight: 500,
            color: dark ? 'var(--cream-50)' : 'var(--text-primary)',
          }}
        >
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border p-6 transition hover:-translate-y-0.5"
              style={{
                background: dark ? 'var(--court-700)' : 'var(--off-white)',
                borderColor: dark ? 'rgba(241,237,229,0.10)' : 'var(--cream-200)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-2xl" aria-hidden>
                  {feature.icon}
                </span>
                <TierBadge tier={feature.tier} />
              </div>
              <h3
                className="mt-4 tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 500,
                  color: dark ? 'var(--cream-50)' : 'var(--text-primary)',
                }}
              >
                {feature.title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: dark ? 'rgba(241,237,229,0.7)' : 'var(--text-secondary)' }}
              >
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicFooter() {
  return (
    <footer
      className="border-t py-10 text-center text-sm"
      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)' }}>
          the court<span style={{ color: 'var(--gold-500)' }}>.</span>
        </span>
        <p className="mt-2">© {new Date().getFullYear()} The Court · Tout se joue ici. Conçu en France.</p>
      </div>
    </footer>
  );
}
