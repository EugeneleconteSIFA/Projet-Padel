'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PLAYER_HOME_ACTIONS } from '@/components/player/player-nav-config';
import {
  CATEGORIES,
  formatDate,
  spotsLabel,
  type Tournament,
} from '@/lib/mock-tournaments';

type RegistrationItem = {
  id: string;
  tournamentName: string;
  clubName: string;
  date: string;
  status: string;
  category: string;
  partnerName: string | null;
  slug: string;
};

type Stats = {
  totalConfirmed: number;
  upcoming: number;
  past: number;
  waitlisted: number;
};

const MOCK_STATS: Stats = {
  totalConfirmed: 3,
  upcoming: 2,
  past: 1,
  waitlisted: 1,
};

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function QuickActionIcon({ type }: { type: (typeof PLAYER_HOME_ACTIONS)[number]['icon'] }) {
  const icons = {
    search: (
      <>
        <circle cx="11" cy="11" r="6" {...stroke} />
        <path d="M16 16l4 4" {...stroke} />
      </>
    ),
    partner: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...stroke} />
        <circle cx="9" cy="7" r="3" {...stroke} />
        <path d="M19 8v6M22 11h-6" {...stroke} />
      </>
    ),
    registrations: (
      <>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" {...stroke} />
        <rect x="9" y="3" width="6" height="4" rx="1" {...stroke} />
        <path d="M9 12h6M9 16h4" {...stroke} />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="3" {...stroke} />
        <path d="M5 20v-1a5 5 0 0 1 10 0v1" {...stroke} />
      </>
    ),
  };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      {icons[type]}
    </svg>
  );
}

function MetaIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
      {children}
    </span>
  );
}

export default function JoueurClient({
  firstName,
  isPremium,
  stats,
  upcomingRegistrations,
  suggestedTournaments,
}: {
  firstName: string;
  isPremium: boolean;
  stats: Stats | null;
  upcomingRegistrations: RegistrationItem[];
  suggestedTournaments: Tournament[];
}) {
  const router = useRouter();
  const [ville, setVille] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  const displayStats = stats ?? MOCK_STATS;

  const filteredTournaments = useMemo(() => {
    return suggestedTournaments
      .filter((t) => {
        if (ville.trim() && !t.city.toLowerCase().includes(ville.trim().toLowerCase())) return false;
        if (date && t.date < date) return false;
        if (category && t.category !== category) return false;
        return true;
      })
      .slice(0, 5);
  }, [ville, date, category, suggestedTournaments]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const v = ville.trim();
    if (v) params.set('ville', v);
    if (date) params.set('date', date);
    if (category) params.set('categorie', category);
    const qs = params.toString();
    router.push(qs ? `/tournois?${qs}` : '/tournois');
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7 pb-4">
      {/* En-tête */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 4vw, 36px)',
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Bonjour{firstName !== 'Joueur' ? `, ${firstName}` : ''}
        </h1>
        {isPremium && (
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'var(--gold-100)', color: 'var(--gold-700)' }}
          >
            Premium
          </span>
        )}
      </header>

      {/* Stats */}
      <section aria-label="Statistiques">
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard value={displayStats.past} label="Tournois joués" />
          <StatCard value={displayStats.upcoming} label="À venir" accent />
          {displayStats.waitlisted > 0 ? (
            <StatCard value={displayStats.waitlisted} label="En attente" warn />
          ) : (
            <StatCard value={displayStats.totalConfirmed} label="Confirmés" />
          )}
        </div>
      </section>

      {/* Recherche */}
      <section
        className="rounded-2xl border p-4 md:p-5"
        style={{ background: 'var(--court-700)', borderColor: 'var(--court-600)' }}
        aria-label="Rechercher un tournoi"
      >
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium" style={{ color: 'rgba(241,237,229,0.75)' }}>
                Ville
              </span>
              <input
                type="search"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder="Lille, Loos…"
                className="w-full rounded-xl border-0 px-3.5 py-2.5 text-sm outline-none focus:ring-2"
                style={{
                  background: 'rgba(241,237,229,0.95)',
                  color: 'var(--ink-950)',
                }}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium" style={{ color: 'rgba(241,237,229,0.75)' }}>
                Date
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border-0 px-3.5 py-2.5 text-sm outline-none focus:ring-2"
                style={{
                  background: 'rgba(241,237,229,0.95)',
                  color: 'var(--ink-950)',
                }}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium" style={{ color: 'rgba(241,237,229,0.75)' }}>
                Catégorie
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border-0 px-3.5 py-2.5 text-sm outline-none focus:ring-2"
                style={{
                  background: 'rgba(241,237,229,0.95)',
                  color: 'var(--ink-950)',
                }}
              >
                <option value="">Toutes</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl py-3 text-sm font-semibold transition hover:opacity-90 sm:w-auto sm:px-8"
            style={{ background: 'var(--gold-500)', color: 'var(--court-900)' }}
          >
            Rechercher
          </button>
        </form>
      </section>

      {/* Mes prochains tournois */}
      {upcomingRegistrations.length > 0 && (
        <section aria-label="Mes prochains tournois">
          <SectionHeader title="Mes prochains tournois" href="/profil" linkLabel="Mes inscriptions" />
          <ul className="space-y-2">
            {upcomingRegistrations.map((reg) => (
              <li key={reg.id}>
                <Link
                  href={`/tournois/${reg.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition hover:-translate-y-px"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{reg.tournamentName}</p>
                    <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                      {reg.clubName}
                      {reg.partnerName ? ` · ${reg.partnerName}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium" style={{ color: 'var(--court-700)' }}>
                      {formatDate(reg.date, { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {reg.category}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tournois recommandés */}
      <section aria-label="Tournois recommandés">
        <SectionHeader title="Proches de toi" href="/tournois" linkLabel="Tout voir" />
        {filteredTournaments.length === 0 ? (
          <p className="rounded-xl border px-4 py-6 text-center text-sm" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
            Aucun tournoi ne correspond.{' '}
            <Link href="/tournois" className="font-medium hover:underline" style={{ color: 'var(--court-700)' }}>
              Voir tous les tournois
            </Link>
          </p>
        ) : (
          <ul className="space-y-2.5">
            {filteredTournaments.map((t) => (
              <li key={t.editionId}>
                <CompactTournamentCard t={t} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Actions rapides */}
      <section aria-label="Actions rapides">
        <p
          className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Actions rapides
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PLAYER_HOME_ACTIONS.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="flex items-center gap-3 rounded-xl border px-3.5 py-3 transition hover:-translate-y-px"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: action.accentSoft, color: action.accent }}
              >
                <QuickActionIcon type={action.icon} />
              </span>
              <span className="text-sm font-semibold leading-tight">{action.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>
      <Link href={href} className="text-xs font-medium hover:underline" style={{ color: 'var(--court-700)' }}>
        {linkLabel}
      </Link>
    </div>
  );
}

function StatCard({
  value,
  label,
  accent,
  warn,
}: {
  value: number;
  label: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className="rounded-xl border px-3 py-3 text-center"
      style={{
        background: accent ? 'var(--court-100)' : warn ? 'var(--gold-100)' : 'var(--bg-surface)',
        borderColor: accent
          ? 'color-mix(in srgb, var(--court-700) 12%, transparent)'
          : warn
            ? 'color-mix(in srgb, var(--gold-500) 20%, transparent)'
            : 'var(--border-subtle)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: 500,
          color: accent ? 'var(--court-700)' : warn ? 'var(--gold-700)' : 'var(--text-primary)',
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

function CompactTournamentCard({ t }: { t: Tournament }) {
  const surfaceLabel = t.surface === 'indoor' ? 'Indoor' : 'Outdoor';

  return (
    <Link
      href={`/tournois/${t.id}`}
      className="block rounded-xl border p-3.5 transition hover:-translate-y-px"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <p className="truncate text-sm font-semibold">{t.name}</p>
      <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--text-muted)' }}>
        {t.club}
      </p>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        <MetaIcon>
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" {...stroke} />
            <path d="M16 2v4M8 2v4M3 10h18" {...stroke} />
          </svg>
          {formatDate(t.date, { day: 'numeric', month: 'short' })}
        </MetaIcon>
        <MetaIcon>
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10" {...stroke} />
            <circle cx="12" cy="11" r="2" {...stroke} />
          </svg>
          {t.city}
        </MetaIcon>
        <MetaIcon>
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" {...stroke} />
            <path d="M4 22h16M10 14v8M14 14v8M8 9h8v5H8z" {...stroke} />
          </svg>
          {t.category}
        </MetaIcon>
        <MetaIcon>
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" {...stroke} />
          </svg>
          {t.price} €
        </MetaIcon>
        <MetaIcon>
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...stroke} />
            <circle cx="9" cy="7" r="4" {...stroke} />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...stroke} />
          </svg>
          {spotsLabel(t)}
        </MetaIcon>
        <MetaIcon>
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
            {t.surface === 'indoor' ? (
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" {...stroke} />
            ) : (
              <path d="M12 3v18M4 12h16M6 6l12 12M18 6L6 18" {...stroke} />
            )}
          </svg>
          {surfaceLabel}
        </MetaIcon>
      </div>
    </Link>
  );
}
