/** Aperçu visuel statique pour le hero landing — cartes tournoi empilées. */

const PREVIEW_CARDS = [
  {
    name: 'Open P100 · Lille',
    club: 'Padel Club Loos',
    date: '15 juin',
    category: 'P100',
    spots: '4 places',
    surface: 'Indoor',
    fill: 75,
  },
  {
    name: 'Tournoi Mixte · Roubaix',
    club: 'Arena Raquette',
    date: '22 juin',
    category: 'P250',
    spots: '8 places',
    surface: 'Outdoor',
    fill: 50,
  },
  {
    name: 'Summer Cup · Valenciennes',
    club: 'TPC Valenciennes',
    date: '5 juil.',
    category: 'P100',
    spots: 'Complet',
    surface: 'Indoor',
    fill: 100,
  },
] as const;

export function LandingAppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm md:max-w-none" aria-hidden>
      {/* Phone frame */}
      <div
        className="relative mx-auto overflow-hidden rounded-[2rem] border shadow-2xl md:mx-0"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-surface)',
          boxShadow: '0 24px 64px rgba(15,76,58,0.12), 0 4px 16px rgba(15,76,58,0.06)',
        }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <span
            className="text-sm font-medium"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--court-700)' }}
          >
            the court<span style={{ color: 'var(--gold-500)' }}>.</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Tournois
          </span>
        </div>

        {/* Search bar mock */}
        <div className="px-4 py-3">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm"
            style={{ background: 'var(--cream-100)', color: 'var(--text-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="6" />
              <path d="M16 16l4 4" />
            </svg>
            Lille, P100, juin…
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-2.5 px-4 pb-5">
          {PREVIEW_CARDS.map((card, i) => (
            <div
              key={card.name}
              className="rounded-2xl border p-3.5 transition"
              style={{
                borderColor: 'var(--border-subtle)',
                background: i === 0 ? 'var(--court-700)' : 'var(--bg-page)',
                color: i === 0 ? 'var(--cream-50)' : 'var(--text-primary)',
                transform: i === 1 ? 'scale(0.98)' : i === 2 ? 'scale(0.96)' : undefined,
                opacity: i === 2 ? 0.85 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide" style={{ opacity: 0.7 }}>
                    {card.category} · {card.surface}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold leading-snug">{card.name}</p>
                  <p className="mt-0.5 text-xs" style={{ opacity: 0.75 }}>
                    {card.club} · {card.date}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: i === 0 ? 'rgba(241,237,229,0.15)' : 'var(--court-100)',
                    color: i === 0 ? 'var(--gold-300)' : 'var(--court-700)',
                  }}
                >
                  {card.spots}
                </span>
              </div>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full" style={{ background: i === 0 ? 'rgba(241,237,229,0.2)' : 'var(--cream-200)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${card.fill}%`,
                    background: i === 0 ? 'var(--gold-500)' : 'var(--court-600)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative cards behind (desktop) */}
      <div
        className="absolute -right-4 top-8 hidden h-24 w-32 rounded-2xl border md:block lg:-right-8"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'color-mix(in srgb, var(--gold-100) 60%, var(--bg-surface))',
          transform: 'rotate(6deg)',
          zIndex: -1,
        }}
      />
      <div
        className="absolute -left-3 bottom-12 hidden h-20 w-28 rounded-2xl border md:block lg:-left-6"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'color-mix(in srgb, var(--court-100) 50%, var(--bg-surface))',
          transform: 'rotate(-4deg)',
          zIndex: -1,
        }}
      />
    </div>
  );
}
