'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PLAYER_HOME_ACTIONS } from '@/components/player/player-nav-config';
import {
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
  const [search, setSearch] = useState('');

  const displayStats = stats ?? MOCK_STATS;

  const filteredTournaments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suggestedTournaments.slice(0, 3);
    return suggestedTournaments
      .filter(
        (t) =>
          t.city.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.club.toLowerCase().includes(q),
      )
      .slice(0, 3);
  }, [search, suggestedTournaments]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      router.push(`/tournois?ville=${encodeURIComponent(q)}`);
    } else {
      router.push('/tournois');
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* En-tête */}
      <header className="space-y-3">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.14em]"
          style={{ color: 'var(--court-600)' }}
        >
          Espace joueur
        </p>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4.5vw, 40px)',
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Bonjour{firstName !== 'Joueur' ? ` ${firstName}` : ''}
          </h1>
          {isPremium && (
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--gold-100)', color: 'var(--gold-700)' }}
            >
              Premium
            </span>
          )}
        </div>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Trouve un tournoi, suis tes inscriptions et accède à ton padel en un coup d&apos;œil.
        </p>
      </header>

      {/* Stats compactes */}
      <section aria-label="Statistiques">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard value={displayStats.upcoming} label="À venir" accent />
          <StatCard value={displayStats.totalConfirmed} label="Confirmés" />
          <StatCard value={displayStats.past} label="Passés" />
          <StatCard value={displayStats.waitlisted} label="En attente" />
        </div>
      </section>

      {/* Recherche tournois */}
      <section
        className="rounded-2xl border p-5"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        aria-label="Rechercher un tournoi"
      >
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Trouver un tournoi
        </h2>
        <form onSubmit={handleSearch} className="mt-3 flex gap-2">
          <label htmlFor="joueur-search" className="sr-only">
            Ville ou nom du tournoi
          </label>
          <input
            id="joueur-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ville, club ou tournoi…"
            className="min-w-0 flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
            style={{
              borderColor: 'var(--border-subtle)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: 'var(--court-700)' }}
          >
            Rechercher
          </button>
        </form>
        <Link
          href="/tournois"
          className="mt-3 inline-block text-sm font-medium hover:underline"
          style={{ color: 'var(--court-700)' }}
        >
          Voir tous les tournois avec carte et filtres →
        </Link>
      </section>

      {/* Mes prochains tournois */}
      {upcomingRegistrations.length > 0 && (
        <section aria-label="Mes prochains tournois">
          <SectionHeader title="Mes prochains tournois" href="/profil" linkLabel="Mon profil" />
          <ul className="space-y-2">
            {upcomingRegistrations.map((reg) => (
              <li key={reg.id}>
                <Link
                  href={`/tournois/${reg.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition hover:-translate-y-px"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{reg.tournamentName}</p>
                    <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                      {reg.clubName}
                      {reg.partnerName ? ` · avec ${reg.partnerName}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium" style={{ color: 'var(--court-700)' }}>
                      {formatDate(reg.date, { day: 'numeric', month: 'short' })}
                    </p>
                    <p
                      className="mt-0.5 font-mono text-[10px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {reg.category}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Suggestions tournois */}
      <section aria-label="Tournois disponibles">
        <SectionHeader title="Tournois à découvrir" href="/tournois" linkLabel="Tout voir" />
        {filteredTournaments.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucun tournoi ne correspond à votre recherche.
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredTournaments.map((t) => (
              <li key={t.editionId}>
                <CompactTournamentCard t={t} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Accès rapides */}
      <section aria-label="Accès rapides">
        <p
          className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em]"
          style={{ color: 'var(--court-600)' }}
        >
          Accès rapides
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PLAYER_HOME_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col gap-2 rounded-xl border p-3.5 transition hover:-translate-y-px"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                style={{ background: action.accentSoft, color: action.accent }}
                aria-hidden
              >
                →
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
    <div className="mb-3 flex items-center justify-between gap-2">
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
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl border px-3 py-3 text-center"
      style={{
        background: accent ? 'var(--court-100)' : 'var(--bg-surface)',
        borderColor: accent ? 'color-mix(in srgb, var(--court-700) 12%, transparent)' : 'var(--border-subtle)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 500,
          color: accent ? 'var(--court-700)' : 'var(--text-primary)',
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

function CompactTournamentCard({ t }: { t: Tournament }) {
  return (
    <Link
      href={`/tournois/${t.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition hover:-translate-y-px"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
            style={{ background: 'var(--court-100)', color: 'var(--court-700)' }}
          >
            {t.category}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {t.city} · {t.distance} km
          </span>
        </div>
        <p className="mt-1 truncate text-sm font-semibold">{t.name}</p>
        <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--text-muted)' }}>
          {formatDate(t.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {t.price} € ·{' '}
          {spotsLabel(t)}
        </p>
      </div>
      <span className="shrink-0 text-lg" style={{ color: 'var(--court-600)' }} aria-hidden>
        →
      </span>
    </Link>
  );
}
