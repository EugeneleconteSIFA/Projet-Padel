'use client';

/* =============================================================================
   TournamentsClient — Page /tournois côté client.
   Panel filtres + liste de cards + carte Leaflet lazy-loadée.
   ============================================================================= */

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  type Tournament,
  CATEGORIES,
  RADII,
  spotsLeft,
  spotsLabel,
  formatDate,
} from '@/lib/mock-tournaments';
import { NavUser } from '@/components/nav-user';

/* ── Carte lazy (SSR off — Leaflet exige window) ──────────────────────────── */
const TournamentMap = dynamic(
  () => import('./tournament-map').then(m => m.TournamentMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: '100%',
          minHeight: 360,
          background: 'var(--bg-muted)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: 14,
        }}
      >
        Chargement de la carte…
      </div>
    ),
  }
);

/* ── Types ────────────────────────────────────────────────────────────────── */

interface Filters {
  ville: string;
  rayon: number;
  dateMin: string;
  dateMax: string;
  categories: string[];
  genres: string[];
  surface: '' | 'indoor' | 'outdoor';
  prixMax: number;
}

const INIT_FILTERS: Filters = {
  ville: '',
  rayon: 0,
  dateMin: '',
  dateMax: '',
  categories: [],
  genres: [],
  surface: '',
  prixMax: 0,
};

const GENRES = ['Hommes', 'Femmes', 'Mixte'] as const;
const PRIX_OPTIONS = [0, 30, 50, 80, 100];

/* ── Helpers UI ───────────────────────────────────────────────────────────── */

function SpotsBar({ t }: { t: Tournament }) {
  const left = spotsLeft(t);
  const pct = Math.round((t.teams / t.maxTeams) * 100);
  const full = left === 0;
  const warn = !full && left <= 2;

  const barColor = full
    ? 'var(--color-danger)'
    : warn
    ? 'var(--gold-500)'
    : 'var(--court-500)';

  const labelColor = full
    ? 'var(--color-danger)'
    : warn
    ? 'var(--gold-700)'
    : 'var(--text-muted)';

  return (
    <div>
      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: 'var(--bg-muted)',
          overflow: 'hidden',
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            borderRadius: 999,
            transition: 'width .3s ease',
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: labelColor, fontWeight: full || warn ? 600 : 400 }}>
        {spotsLabel(t)}
      </span>
    </div>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 8px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.04em',
        background: 'var(--gold-100)',
        color: 'var(--gold-700)',
        border: '1px solid var(--gold-300)',
      }}
    >
      {cat}
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 8px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 500,
        fontFamily: 'var(--font-mono)',
        background: 'var(--bg-muted)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {children}
    </span>
  );
}

function TournamentCard({ t }: { t: Tournament }) {
  const left = spotsLeft(t);
  const full = left === 0;

  return (
    <Link
      href={`/tournois/${t.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <article
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: '20px 20px 16px',
          transition: 'box-shadow .2s ease, border-color .2s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
        }}
      >
        {/* Ligne 1 : badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          <CategoryBadge cat={t.category} />
          <Badge>{t.genre}</Badge>
          <Badge>{t.surface === 'indoor' ? 'Salle' : 'Extérieur'}</Badge>
          <Badge>{t.format}</Badge>
        </div>

        {/* Titre + sous-titre */}
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 2,
            lineHeight: 1.25,
          }}
        >
          {t.name}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
          {t.club} · {t.city}
        </p>

        {/* Méta : date / prix / distance */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 20px',
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginBottom: 14,
          }}
        >
          <span>
            {formatDate(t.date, { weekday: 'short', day: 'numeric', month: 'short' })}
            {t.dateEnd ? ` – ${formatDate(t.dateEnd, { day: 'numeric', month: 'short' })}` : ''}
            {' '}· {t.time}
          </span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {t.price} €/équipe
          </span>
          <span style={{ color: 'var(--text-muted)' }}>{t.distance} km</span>
        </div>

        {/* Jauge places */}
        <SpotsBar t={t} />

        {/* CTA visuel */}
        <div
          style={{
            marginTop: 14,
            display: 'inline-block',
            fontSize: 12,
            fontWeight: 600,
            color: full ? 'var(--text-muted)' : 'var(--court-700)',
          }}
        >
          {full ? "Liste d'attente →" : 'Voir la fiche →'}
        </div>
      </article>
    </Link>
  );
}

/* ── Panel filtres ────────────────────────────────────────────────────────── */

interface FilterPanelProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
}

function FilterPanel({ filters, onChange, onReset }: FilterPanelProps) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const toggleArr = (key: 'categories' | 'genres', val: string) => {
    const arr = filters[key];
    onChange({
      ...filters,
      [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val],
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid var(--border-strong)',
    background: 'var(--bg-muted)',
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 22,
  };

  const checkLabel: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    userSelect: 'none',
    marginBottom: 5,
  };

  const surfaceBtn = (val: '' | 'indoor' | 'outdoor', label: string) => (
    <button
      key={val}
      onClick={() => set('surface', filters.surface === val ? '' : val)}
      style={{
        flex: 1,
        padding: '7px 4px',
        borderRadius: 8,
        border: '1px solid',
        borderColor: filters.surface === val ? 'var(--court-600)' : 'var(--border-strong)',
        background: filters.surface === val ? 'var(--court-700)' : 'var(--bg-muted)',
        color: filters.surface === val ? '#fff' : 'var(--text-secondary)',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all .15s ease',
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: '20px 18px',
        position: 'sticky',
        top: 80,
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
          Filtres
        </span>
        <button
          onClick={onReset}
          style={{
            fontSize: 12,
            color: 'var(--court-600)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            padding: 0,
          }}
        >
          Réinitialiser
        </button>
      </div>

      {/* Ville */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Ville</label>
        <input
          type="text"
          placeholder="Paris, Lille, Lyon…"
          value={filters.ville}
          onChange={e => set('ville', e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Rayon */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Rayon</label>
        <select
          value={filters.rayon}
          onChange={e => set('rayon', Number(e.target.value))}
          style={inputStyle}
        >
          <option value={0}>Toute distance</option>
          {RADII.map(r => (
            <option key={r} value={r}>{r} km</option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Période</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="date"
            value={filters.dateMin}
            onChange={e => set('dateMin', e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="date"
            value={filters.dateMax}
            onChange={e => set('dateMax', e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      </div>

      {/* Catégories */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Catégorie</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
          {CATEGORIES.map(cat => (
            <label key={cat} style={checkLabel}>
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleArr('categories', cat)}
                style={{ accentColor: 'var(--court-600)', width: 14, height: 14 }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: filters.categories.includes(cat) ? 700 : 400,
                  color: filters.categories.includes(cat) ? 'var(--court-700)' : undefined,
                }}
              >
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Genre */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Genre</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {GENRES.map(g => (
            <label key={g} style={checkLabel}>
              <input
                type="checkbox"
                checked={filters.genres.includes(g)}
                onChange={() => toggleArr('genres', g)}
                style={{ accentColor: 'var(--court-600)', width: 14, height: 14 }}
              />
              {g}
            </label>
          ))}
        </div>
      </div>

      {/* Surface */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Surface</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {surfaceBtn('', 'Tous')}
          {surfaceBtn('indoor', 'Salle')}
          {surfaceBtn('outdoor', 'Extérieur')}
        </div>
      </div>

      {/* Prix max */}
      <div style={{ marginBottom: 0 }}>
        <label style={labelStyle}>
          Prix max {filters.prixMax > 0 ? `— ${filters.prixMax} €` : '— pas de limite'}
        </label>
        <select
          value={filters.prixMax}
          onChange={e => set('prixMax', Number(e.target.value))}
          style={inputStyle}
        >
          {PRIX_OPTIONS.map(p => (
            <option key={p} value={p}>
              {p === 0 ? 'Pas de limite' : `≤ ${p} €/équipe`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ── Composant principal ──────────────────────────────────────────────────── */

export function TournamentsClient({ tournaments }: { tournaments: Tournament[] }) {
  const [filters, setFilters] = useState<Filters>(INIT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return tournaments.filter(t => {
      if (filters.ville && !t.city.toLowerCase().includes(filters.ville.toLowerCase())) return false;
      if (filters.rayon > 0 && t.distance > filters.rayon) return false;
      if (filters.dateMin && t.date < filters.dateMin) return false;
      if (filters.dateMax && t.date > filters.dateMax) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(t.category)) return false;
      if (filters.genres.length > 0 && !filters.genres.includes(t.genre)) return false;
      if (filters.surface && t.surface !== filters.surface) return false;
      if (filters.prixMax > 0 && t.price > filters.prixMax) return false;
      return true;
    });
  }, [tournaments, filters]);

  const handleReset = useCallback(() => setFilters(INIT_FILTERS), []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '0 24px',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--court-700)',
                letterSpacing: '-0.01em',
              }}
            >
              The Court
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link
              href="/tournois"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--court-700)',
                textDecoration: 'none',
              }}
            >
              Tournois
            </Link>
            <NavUser />
          </div>
        </div>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '40px 24px 24px',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          Trouver un tournoi
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
          {filtered.length} tournoi{filtered.length !== 1 ? 's' : ''} disponible
          {filtered.length !== 1 ? 's' : ''}
          {filtered.length !== tournaments.length && (
            <span style={{ color: 'var(--text-muted)' }}>
              {' '}sur {tournaments.length}
            </span>
          )}
        </p>

        {/* Bouton filtres mobile */}
        <button
          onClick={() => setMobileFiltersOpen(o => !o)}
          style={{
            display: 'none',
            marginTop: 12,
            padding: '8px 16px',
            borderRadius: 999,
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-surface)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
          className="show-on-mobile"
        >
          {mobileFiltersOpen ? 'Masquer les filtres' : 'Filtres'}
        </button>
      </header>

      {/* ── Corps : sidebar + liste + carte ───────────────────────────── */}
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px 60px',
          display: 'grid',
          gridTemplateColumns: '280px 1fr 440px',
          gap: 24,
          alignItems: 'start',
        }}
        className="tournaments-layout"
      >
        {/* Sidebar filtres */}
        <aside className="filters-sidebar">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onReset={handleReset}
          />
        </aside>

        {/* Liste cards */}
        <main>
          {filtered.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 24px',
                background: 'var(--bg-surface)',
                borderRadius: 16,
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎾</div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                }}
              >
                Aucun tournoi trouvé
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
                Aucun tournoi ne correspond à vos critères de recherche.
              </p>
              <button
                onClick={handleReset}
                style={{
                  padding: '10px 24px',
                  borderRadius: 999,
                  border: 'none',
                  background: 'var(--court-700)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filtered.map(t => (
                <TournamentCard key={t.editionId} t={t} />
              ))}
            </div>
          )}
        </main>

        {/* Carte sticky */}
        <aside
          style={{
            position: 'sticky',
            top: 80,
            height: 'calc(100vh - 100px)',
            minHeight: 400,
          }}
          className="map-aside"
        >
          <TournamentMap tournaments={filtered} />
        </aside>
      </div>

      {/* ── Responsive styles ─────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 1100px) {
          .tournaments-layout {
            grid-template-columns: 260px 1fr !important;
          }
          .map-aside {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .tournaments-layout {
            grid-template-columns: 1fr !important;
          }
          .filters-sidebar {
            display: none;
          }
          .filters-sidebar.mobile-open {
            display: block !important;
          }
          .show-on-mobile {
            display: inline-block !important;
          }
          .map-aside {
            display: block !important;
            height: 320px !important;
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
