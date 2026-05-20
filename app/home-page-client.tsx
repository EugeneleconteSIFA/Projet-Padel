'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavUser } from '@/components/nav-user';
import {
  CATEGORIES,
  RADII,
  formatDate,
  spotsLeft,
  spotsLabel,
  type Tournament,
  type Genre,
  type Surface,
  type Category,
} from '@/lib/mock-tournaments';

/* =============================================================================
   The Court — Page d'accueil = page de recherche tournois.
   Client component : data injectée par app/page.tsx (server component).
   ============================================================================= */

const TournamentMap = dynamic(() => import('@/components/tournament-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full flex-col items-center justify-center" style={{ minHeight: '480px' }}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: 'var(--court-700)' }} />
    </div>
  ),
});

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function HomePageClient({ tournaments }: { tournaments: Tournament[] }) {
  const [city,         setCity]         = useState('Lille');
  const [radius,       setRadius]       = useState(50);
  const [selCategories, setSelCategories] = useState<Category[]>([]);
  const [selGenres,    setSelGenres]    = useState<Genre[]>([]);
  const [selSurface,   setSelSurface]   = useState<'all' | Surface>('all');
  const [mobileFilter, setMobileFilter] = useState(false);

  function toggleCategory(c: Category) {
    setSelCategories(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c],
    );
  }
  function toggleGenre(g: Genre) {
    setSelGenres(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g],
    );
  }

  const results = useMemo(() => {
    return tournaments.filter(t => {
      if (t.distance > radius) return false;
      if (selCategories.length > 0 && !selCategories.includes(t.category)) return false;
      if (selGenres.length > 0 && !selGenres.includes(t.genre)) return false;
      if (selSurface !== 'all' && t.surface !== selSurface) return false;
      return true;
    }).sort((a, b) => a.distance - b.distance);
  }, [tournaments, radius, selCategories, selGenres, selSurface]);

  const activeFilterCount =
    selCategories.length + selGenres.length + (selSurface !== 'all' ? 1 : 0);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(241, 237, 229, 0.95)',
          backdropFilter: 'saturate(140%) blur(12px)',
          WebkitBackdropFilter: 'saturate(140%) blur(12px)',
          borderColor: 'var(--paper-200)',
        }}
      >
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3">
          <Link
            href="/"
            className="shrink-0"
            style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink-950)' }}
          >
            the court<span style={{ color: 'var(--gold-500)' }}>.</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/vitrine"
              className="hidden rounded-md px-3 py-1.5 text-sm font-medium transition hover:opacity-70 md:inline-block"
              style={{ color: 'var(--text-secondary)' }}
            >
              À propos
            </Link>
            <NavUser />
          </nav>
        </div>
      </header>

      <section
        className="border-b px-6 py-3 text-center text-sm font-semibold"
        style={{
          background: 'var(--gold-100)',
          borderColor: 'var(--gold-500)',
          color: 'var(--court-700)',
        }}
      >
        Test partage dossier : modification visible depuis The Court.
      </section>

      {/* ── SEARCH STRIP ──────────────────────────────────────────────────── */}
      <div
        className="border-b px-6 py-5"
        style={{ borderColor: 'var(--paper-200)', background: 'var(--court-700)' }}
      >
        <div className="mx-auto max-w-screen-xl">
          <div
            className="flex flex-wrap items-end gap-3 rounded-xl border p-4"
            style={{
              background: '#ffffff',
              borderColor: 'var(--paper-200)',
              boxShadow: '0 4px 24px rgba(15,76,58,0.15)',
            }}
          >
            {/* Ville */}
            <div className="flex-1" style={{ minWidth: '130px' }}>
              <label
                className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: 'var(--court-700)' }}
              >
                Ville
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm font-medium outline-none transition"
                style={{
                  background: 'var(--cream-100)',
                  borderColor: 'var(--paper-200)',
                  color: 'var(--ink-950)',
                }}
                placeholder="Votre ville"
              />
            </div>

            {/* Rayon */}
            <div style={{ minWidth: '100px' }}>
              <label
                className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: 'var(--court-700)' }}
              >
                Rayon
              </label>
              <select
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2 text-sm font-medium outline-none"
                style={{
                  background: 'var(--cream-100)',
                  borderColor: 'var(--paper-200)',
                  color: 'var(--ink-950)',
                }}
              >
                {RADII.map(r => (
                  <option key={r} value={r}>
                    {r} km
                  </option>
                ))}
              </select>
            </div>

            {/* Catégorie — pills */}
            <div className="flex-1" style={{ minWidth: '200px' }}>
              <label
                className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: 'var(--court-700)' }}
              >
                Catégorie
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => {
                  const active = selCategories.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCategory(c)}
                      className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium transition"
                      style={{
                        background: active ? 'var(--court-700)' : 'var(--cream-200)',
                        color: active ? '#ffffff' : 'var(--ink-950)',
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              className="shrink-0 rounded-lg px-5 py-2 text-sm font-medium text-white transition"
              style={{ background: 'var(--court-700)' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--court-600)')}
              onMouseOut={e => (e.currentTarget.style.background = 'var(--court-700)')}
            >
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-xl px-6 py-8">
        <div className="flex gap-8">

          {/* ── SIDEBAR (desktop) ─────────────────────────────────────────── */}
          <aside className="hidden w-48 shrink-0 md:block">
            <FilterSection title="Genre">
              {(['Hommes', 'Femmes', 'Mixte'] as Genre[]).map(g => {
                const active = selGenres.includes(g);
                return (
                  <FilterRow
                    key={g}
                    label={g}
                    active={active}
                    type="checkbox"
                    onClick={() => toggleGenre(g)}
                  />
                );
              })}
            </FilterSection>

            <FilterSection title="Terrain">
              {([['all', 'Tous'], ['indoor', 'Indoor'], ['outdoor', 'Outdoor']] as const).map(
                ([val, label]) => (
                  <FilterRow
                    key={val}
                    label={label}
                    active={selSurface === val}
                    type="radio"
                    onClick={() => setSelSurface(val)}
                  />
                ),
              )}
            </FilterSection>
          </aside>

          {/* ── MAIN ─────────────────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {/* Results header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span
                  style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em' }}
                >
                  {results.length} tournoi{results.length !== 1 ? 's' : ''}
                </span>
                <span className="text-sm" style={{ color: 'var(--ink-700)' }}>
                  · dans {radius} km autour de {city || '…'}
                </span>
              </div>

              {/* Filtres mobile */}
              <button
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition md:hidden"
                style={{ borderColor: 'var(--paper-200)', color: 'var(--ink-950)' }}
                onClick={() => setMobileFilter(!mobileFilter)}
              >
                <FilterIcon />
                Filtres
                {activeFilterCount > 0 && (
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full font-mono text-[10px] text-white"
                    style={{ background: 'var(--court-700)' }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile filter panel */}
            {mobileFilter && (
              <div
                className="mb-5 rounded-xl border p-4 md:hidden"
                style={{ borderColor: 'var(--cream-200)', background: 'var(--off-white)' }}
              >
                <div className="grid grid-cols-2 gap-6">
                  <FilterSection title="Genre">
                    {(['Hommes', 'Femmes', 'Mixte'] as Genre[]).map(g => (
                      <FilterRow
                        key={g}
                        label={g}
                        active={selGenres.includes(g)}
                        type="checkbox"
                        onClick={() => toggleGenre(g)}
                      />
                    ))}
                  </FilterSection>
                  <FilterSection title="Terrain">
                    {([['all', 'Tous'], ['indoor', 'Indoor'], ['outdoor', 'Outdoor']] as const).map(
                      ([val, label]) => (
                        <FilterRow
                          key={val}
                          label={label}
                          active={selSurface === val}
                          type="radio"
                          onClick={() => setSelSurface(val)}
                        />
                      ),
                    )}
                  </FilterSection>
                </div>
              </div>
            )}

            {/* Tournament grid */}
            {results.length === 0 ? (
              <div
                className="rounded-xl border py-20 text-center"
                style={{ borderColor: 'var(--cream-200)' }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Aucun tournoi trouvé
                </div>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Essayez un rayon plus large ou retirez des filtres.
                </p>
                <button
                  className="mt-5 text-sm font-medium underline underline-offset-2"
                  style={{ color: 'var(--court-600)' }}
                  onClick={() => {
                    setSelCategories([]);
                    setSelGenres([]);
                    setSelSurface('all');
                    setRadius(100);
                  }}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map(t => (
                  <TournamentCard key={t.id} t={t} />
                ))}
              </div>
            )}
          </div>

          {/* ── CARTE INTERACTIVE (xl+) ───────────────────────────────────── */}
          <div
            className="hidden w-72 shrink-0 overflow-hidden rounded-xl border xl:block"
            style={{
              borderColor: 'var(--cream-200)',
              minHeight: '480px',
              position: 'sticky',
              top: '80px',
              alignSelf: 'flex-start',
            }}
          >
            <TournamentMap tournaments={results} />
          </div>
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer
        className="mt-16 border-t px-6 py-7 text-sm"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-4">
          <span
            style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: 'var(--text-primary)' }}
          >
            the court<span style={{ color: 'var(--gold-500)' }}>.</span>
          </span>
          <span>© 2026 The Court · Tout se joue ici. Conçu en France.</span>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Link
              href="/vitrine"
              className="transition hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              À propos →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =============================================================================
   COMPOSANTS LOCAUX
   ============================================================================= */

/* ── TournamentCard ────────────────────────────────────────────────────────── */

function TournamentCard({ t }: { t: Tournament }) {
  const left = spotsLeft(t);
  const full   = left === 0;
  const urgent = !full && left <= 2;

  return (
    <article
      className="flex flex-col rounded-xl border p-5 transition-transform hover:-translate-y-px"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--cream-200)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Badges */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge
          label={t.category}
          style={{ background: 'var(--court-100)', color: 'var(--court-700)' }}
        />
        <Badge
          label={t.genre}
          style={{ background: 'var(--cream-200)', color: 'var(--text-secondary)' }}
        />
        <Badge
          label={t.surface === 'indoor' ? 'Indoor' : 'Outdoor'}
          style={
            t.surface === 'indoor'
              ? { background: 'var(--court-100)', color: 'var(--court-700)' }
              : { background: 'var(--cream-200)', color: 'var(--text-secondary)' }
          }
        />
      </div>

      {/* Title + club */}
      <h3
        className="leading-tight"
        style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 500 }}
      >
        {t.name}
      </h3>
      <p className="mt-1 text-[13px]" style={{ color: 'var(--text-muted)' }}>
        {t.club} · {t.distance} km
      </p>

      {/* Date */}
      <p className="mt-3 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        {formatDate(t.date)} · {t.time}
      </p>

      {/* Price + spots */}
      <div className="mt-auto flex items-baseline justify-between pt-4">
        <span
          style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500 }}
        >
          {t.price} €
        </span>
        <span
          className="font-mono text-[11px]"
          style={{
            color: full
              ? 'var(--color-danger)'
              : urgent
              ? 'var(--gold-700)'
              : 'var(--text-muted)',
          }}
        >
          {spotsLabel(t)}
        </span>
      </div>

      {/* CTA */}
      <Link
        href={`/tournois/${t.id}`}
        className="mt-3 block rounded-lg py-2 text-center text-sm font-medium transition"
        style={{
          background: full ? 'var(--cream-200)' : 'var(--court-700)',
          color: full ? 'var(--text-secondary)' : 'var(--cream-50)',
        }}
        onMouseOver={e => {
          if (!full) e.currentTarget.style.background = 'var(--court-600)';
        }}
        onMouseOut={e => {
          if (!full) e.currentTarget.style.background = 'var(--court-700)';
        }}
      >
        {full ? "Liste d'attente" : 'Voir le tournoi →'}
      </Link>
    </article>
  );
}

/* ── Badge ─────────────────────────────────────────────────────────────────── */

function Badge({
  label,
  style,
}: {
  label: string;
  style: React.CSSProperties;
}) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium"
      style={style}
    >
      {label}
    </span>
  );
}

/* ── FilterSection ─────────────────────────────────────────────────────────── */

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div
        className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: 'var(--court-700)' }}
      >
        {title}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

/* ── FilterRow ─────────────────────────────────────────────────────────────── */

function FilterRow({
  label,
  active,
  type,
  onClick,
}: {
  label: string;
  active: boolean;
  type: 'checkbox' | 'radio';
  onClick: () => void;
}) {
  return (
    <button
      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition"
      onClick={onClick}
      style={{
        background: active ? 'var(--court-100)' : 'transparent',
        color: active ? 'var(--court-700)' : 'var(--text-secondary)',
      }}
    >
      <span
        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center border transition"
        style={{
          borderRadius: type === 'radio' ? '999px' : '3px',
          borderColor: active ? 'var(--court-700)' : 'var(--paper-200)',
          background: active ? 'var(--court-700)' : 'transparent',
        }}
      >
        {active && (
          <span
            className="block"
            style={{
              width: type === 'radio' ? '5px' : '6px',
              height: type === 'radio' ? '5px' : '4px',
              borderRadius: type === 'radio' ? '999px' : '1px',
              background: 'var(--cream-50)',
            }}
          />
        )}
      </span>
      {label}
    </button>
  );
}

/* ── Icons ─────────────────────────────────────────────────────────────────── */

function FilterIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}
