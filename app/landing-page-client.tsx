'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { homeRubrics } from '@/lib/public-sections';
import { PublicFooter } from '@/components/public/public-section-layout';

function RubricIcon({ type }: { type: (typeof homeRubrics)[number]['icon'] }) {
  const stroke = 'currentColor';
  const common = { fill: 'none', stroke, strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (type === 'player') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="7" r="3.5" {...common} />
        <path d="M6 21v-1.5a6 6 0 0 1 12 0V21" {...common} />
        <path d="M16 4l3 2-2 3" {...common} />
      </svg>
    );
  }
  if (type === 'club') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden>
        <path d="M4 10h16v10H4z" {...common} />
        <path d="M8 10V6h8v4" {...common} />
        <path d="M12 14v4M10 16h4" {...common} />
      </svg>
    );
  }
  if (type === 'referee') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden>
        <rect x="5" y="3" width="14" height="18" rx="2" {...common} />
        <path d="M9 8h6M9 12h6M9 16h4" {...common} />
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="8" {...common} />
      <path d="M12 8v8M9 10h4a2 2 0 1 1 0 4H9" {...common} />
    </svg>
  );
}

export default function LandingPageClient() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 70% 0%, color-mix(in srgb, var(--court-100) 80%, transparent), transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(var(--cream-200) 1px, transparent 1px), linear-gradient(90deg, var(--cream-200) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="mx-auto max-w-6xl px-6 pb-12 pt-14 text-center md:px-7 md:pt-20">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 7vw, 72px)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Trouve ton prochain
            <br />
            <span style={{ color: 'var(--court-700)' }}>tournoi de padel</span>
            <span style={{ color: 'var(--gold-500)' }}>.</span>
          </h1>

          <p
            className="mx-auto mt-5 max-w-md text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Cherche, inscris-toi, joue.
          </p>

          <div className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-6">
            {[
              { icon: '🔍', label: 'Cherche' },
              { icon: '✅', label: 'Inscris-toi' },
              { icon: '🎾', label: 'Joue' },
            ].map((step) => (
              <div key={step.label} className="flex flex-col items-center gap-1.5">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg"
                  style={{ background: 'var(--court-100)' }}
                  aria-hidden
                >
                  {step.icon}
                </span>
                <span className="text-xs font-semibold" style={{ color: 'var(--court-700)' }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tournois"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-px"
              style={{ background: 'var(--court-700)' }}
            >
              Explorer les tournois <span aria-hidden>→</span>
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full border px-7 py-3.5 text-sm font-semibold transition hover:bg-[var(--cream-200)]"
              style={{ borderColor: 'var(--court-700)', color: 'var(--court-700)' }}
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Rubriques visuelles */}
      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-7">
        <p
          className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.14em]"
          style={{ color: 'var(--court-600)' }}
        >
          Choisis ton espace
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {homeRubrics.map((rubric) => (
            <Link
              key={rubric.href}
              href={rubric.href}
              className="group relative overflow-hidden rounded-3xl border p-7 transition hover:-translate-y-1 hover:shadow-lg md:p-8"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div
                className="absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-60 transition group-hover:scale-110"
                style={{ background: rubric.accentSoft }}
              />
              <div
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: rubric.accentSoft, color: rubric.accent }}
              >
                <RubricIcon type={rubric.icon} />
              </div>
              <h2
                className="relative mt-5"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(24px, 3vw, 28px)',
                  fontWeight: 500,
                }}
              >
                {rubric.title}
              </h2>
              <p className="relative mt-2 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {rubric.tagline}
              </p>
              <span
                className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition group-hover:gap-2.5"
                style={{ color: rubric.accent }}
              >
                Voir les fonctionnalités <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
