'use client';

import Link from 'next/link';

export type UpcomingTournament = {
  id: string;
  slug: string;
  tournamentName: string;
  clubName: string;
  date: string;
  category: string;
  partnerName: string | null;
  status: string;
};

export type SuggestedTournament = {
  slug: string;
  name: string;
  city: string;
  category: string;
  date: string;
  price: number;
  spotsLabel: string;
};

export type PlayerHomeData = {
  firstName: string;
  initials: string;
  isPremium: boolean;
  lookingForPartner: boolean;
  ranking: string;
  stats: {
    upcoming: number;
    past: number;
    waitlisted: number;
    totalConfirmed: number;
  };
  upcoming: UpcomingTournament[];
  suggested: SuggestedTournament[];
};

const QUICK_ACTIONS = [
  {
    href: '/tournois',
    label: 'Tournois',
    sub: 'Carte & filtres',
    bg: 'var(--court-700)',
    fg: 'var(--cream-50)',
    icon: SearchGlyph,
  },
  {
    href: '/matchs-amicaux',
    label: 'Partenaire',
    sub: 'Matchs amicaux',
    bg: 'var(--gold-100)',
    fg: 'var(--gold-700)',
    icon: UsersGlyph,
  },
  {
    href: '/mon-feed',
    label: 'Feed',
    sub: 'Ton cercle',
    bg: 'var(--court-100)',
    fg: 'var(--court-700)',
    icon: FeedGlyph,
  },
  {
    href: '/profil',
    label: 'Profil',
    sub: 'Stats & historique',
    bg: 'var(--cream-200)',
    fg: 'var(--ink-700)',
    icon: UserGlyph,
  },
] as const;

const COMMUNITY = [
  { href: '/mon-feed', label: 'Mon feed', sub: 'Posts de ton cercle' },
  { href: '/forum', label: 'Forum', sub: 'Entraide & conseils' },
  { href: '/matchs-amicaux', label: 'Matchs', sub: 'Joue entre tournois' },
] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export default function PlayerHomeClient({ data }: { data: PlayerHomeData }) {
  const next = data.upcoming[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-8 md:px-10 md:py-10"
        style={{ background: 'var(--court-700)', color: 'var(--cream-50)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-20"
          style={{ background: 'var(--court-300)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full opacity-10"
          style={{ background: 'var(--gold-300)' }}
        />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold"
              style={{ background: 'rgba(241,237,229,0.15)', border: '2px solid rgba(241,237,229,0.25)' }}
            >
              {data.initials}
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">
                Espace joueur
              </p>
              <h1
                className="mt-1 leading-tight tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 5vw, 40px)',
                  fontWeight: 500,
                }}
              >
                Bonjour, {data.firstName}
              </h1>
              <p className="mt-2 text-sm opacity-80">Prêt pour ton prochain tournoi ?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold"
                  style={{ background: 'rgba(241,237,229,0.15)' }}
                >
                  {data.ranking}
                </span>
                {data.isPremium && (
                  <span
                    className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold"
                    style={{ background: 'var(--gold-500)', color: 'var(--court-900)' }}
                  >
                    PREMIUM
                  </span>
                )}
                {data.lookingForPartner && (
                  <span
                    className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold"
                    style={{ background: 'rgba(241,237,229,0.12)', color: 'var(--gold-300)' }}
                  >
                    Cherche partenaire
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/tournois"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-px"
            style={{ background: 'var(--gold-500)', color: 'var(--court-900)' }}
          >
            Trouver un tournoi
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Stats visuelles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile value={data.stats.upcoming} label="À venir" accent />
        <StatTile value={data.stats.totalConfirmed} label="Confirmés" />
        <StatTile value={data.stats.past} label="Joués" />
        <StatTile value={data.stats.waitlisted} label="En attente" muted />
      </div>

      {/* Raccourcis */}
      <section>
        <SectionLabel>Raccourcis</SectionLabel>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col gap-4 rounded-2xl p-5 transition hover:-translate-y-0.5"
              style={{ background: action.bg, color: action.fg }}
            >
              <action.icon />
              <div>
                <p className="text-base font-semibold">{action.label}</p>
                <p className="mt-0.5 text-xs opacity-75">{action.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Prochain tournoi mis en avant */}
        <section className="lg:col-span-3">
          <SectionLabel>Prochain tournoi</SectionLabel>
          {next ? (
            <Link
              href={`/tournois/${next.slug}`}
              className="mt-4 block overflow-hidden rounded-3xl border transition hover:-translate-y-0.5"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="px-6 py-4" style={{ background: 'var(--court-100)' }}>
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold"
                    style={{ background: 'var(--court-700)', color: 'var(--cream-50)' }}
                  >
                    {next.status === 'CONFIRMED' ? 'Inscrit' : next.status}
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'var(--court-700)' }}>
                    {next.category}
                  </span>
                </div>
              </div>
              <div className="space-y-2 px-6 py-5">
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(22px, 3vw, 28px)',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {next.tournamentName}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {next.clubName}
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--court-700)' }}>
                  {formatDate(next.date)}
                  {next.partnerName ? ` · avec ${next.partnerName}` : ''}
                </p>
              </div>
            </Link>
          ) : (
            <EmptyPanel
              message="Aucun tournoi à venir pour l'instant."
              cta="Explorer les tournois"
              href="/tournois"
            />
          )}

          {data.upcoming.length > 1 && (
            <div className="mt-4 space-y-2">
              {data.upcoming.slice(1, 4).map((t) => (
                <Link
                  key={t.id}
                  href={`/tournois/${t.slug}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition hover:bg-[var(--cream-100)]"
                  style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.tournamentName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(t.date)} · {t.clubName}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs" style={{ color: 'var(--court-600)' }}>
                    {t.category}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Communauté */}
        <section className="lg:col-span-2">
          <SectionLabel>Communauté</SectionLabel>
          <div className="mt-4 space-y-2">
            {COMMUNITY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-2xl border px-4 py-4 transition hover:-translate-y-0.5"
                style={{ background: 'var(--off-white)', borderColor: 'var(--cream-200)' }}
              >
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {item.label}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {item.sub}
                  </p>
                </div>
                <span style={{ color: 'var(--court-600)' }} aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Tournois suggérés */}
      {data.suggested.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-4">
            <SectionLabel>Tournois près de toi</SectionLabel>
            <Link href="/tournois" className="text-sm font-medium" style={{ color: 'var(--court-700)' }}>
              Tout voir →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.suggested.map((t) => (
              <Link
                key={t.slug}
                href={`/tournois/${t.slug}`}
                className="flex flex-col rounded-2xl border p-5 transition hover:-translate-y-0.5"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
                    style={{ background: 'var(--court-100)', color: 'var(--court-700)' }}
                  >
                    {t.category}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--court-700)' }}>
                    {t.price} €
                  </span>
                </div>
                <h3
                  className="mt-3 line-clamp-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 500,
                  }}
                >
                  {t.name}
                </h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {t.city} · {formatDate(t.date)}
                </p>
                <p className="mt-3 text-xs font-medium" style={{ color: 'var(--court-600)' }}>
                  {t.spotsLabel}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[11px] uppercase tracking-[0.14em]"
      style={{ color: 'var(--court-600)' }}
    >
      {children}
    </p>
  );
}

function StatTile({
  value,
  label,
  accent,
  muted,
}: {
  value: number;
  label: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border px-4 py-5 text-center"
      style={{
        background: accent ? 'var(--court-100)' : 'var(--bg-surface)',
        borderColor: accent ? 'var(--court-300)' : 'var(--border-subtle)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          fontWeight: 500,
          lineHeight: 1,
          color: muted ? 'var(--text-muted)' : accent ? 'var(--court-700)' : 'var(--text-primary)',
        }}
      >
        {value}
      </p>
      <p className="mt-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

function EmptyPanel({ message, cta, href }: { message: string; cta: string; href: string }) {
  return (
    <div
      className="mt-4 rounded-3xl border px-6 py-10 text-center"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {message}
      </p>
      <Link href={href} className="mt-4 inline-block text-sm font-semibold" style={{ color: 'var(--court-700)' }}>
        {cta} →
      </Link>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function UsersGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

function FeedGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
    </svg>
  );
}

function UserGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
