import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Communauté — The Court',
};

const LINKS = [
  {
    href: '/mon-feed',
    title: 'Feed',
    description: 'Suis les posts de ton cercle et de tes clubs.',
  },
  {
    href: '/forum',
    title: 'Forum',
    description: 'Entraide, conseils et discussions padel.',
  },
  {
    href: '/matchs-amicaux',
    title: 'Matchs amicaux',
    description: 'Organise ou rejoins une partie entre tournois.',
  },
] as const;

export default function CommunautePage() {
  return (
    <div className="mx-auto max-w-screen-md">
      <header className="mb-8">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.14em]"
          style={{ color: 'var(--court-600)' }}
        >
          Communauté
        </p>
        <h1
          className="mt-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          Ton espace social padel
        </h1>
        <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Feed, forum et matchs amicaux — tout ce qui connecte les joueurs entre les tournois.
        </p>
      </header>

      <div className="space-y-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition hover:-translate-y-0.5"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {link.title}
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                {link.description}
              </p>
            </div>
            <span style={{ color: 'var(--court-600)' }} aria-hidden>
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
