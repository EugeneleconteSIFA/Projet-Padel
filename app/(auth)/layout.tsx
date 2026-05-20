import Link from 'next/link';

/* =============================================================================
   The Court — Layout partagé pour les pages d'authentification.
   Deux colonnes :
   - Gauche (caché sur mobile) : branding The Court
   - Droite : contenu de la page (formulaire, etc.)
   ============================================================================= */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      {/* ── COLONNE GAUCHE — branding (md+) ──────────────────────────────── */}
      <div
        className="relative hidden flex-col justify-between px-12 py-12 md:flex md:w-[42%] lg:w-[38%]"
        style={{ background: 'var(--court-700)', color: 'var(--cream-50)' }}
      >
        {/* Grille décorative */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(241,237,229,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(241,237,229,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Logo */}
        <Link
          href="/"
          className="relative"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: 'var(--cream-50)',
            textDecoration: 'none',
          }}
        >
          the court<span style={{ color: 'var(--gold-500)' }}>.</span>
        </Link>

        {/* Citation centrale */}
        <div className="relative">
          <blockquote
            className="leading-tight tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 3vw, 40px)',
              fontWeight: 500,
              color: 'var(--cream-50)',
            }}
          >
            Tout se joue
            <br />
            sur{' '}
            <span className="italic" style={{ color: 'var(--gold-300)' }}>
              The Court
            </span>
            .
          </blockquote>
          <p
            className="mt-4 text-[15px]"
            style={{ color: 'rgba(241, 237, 229, 0.65)' }}
          >
            La plateforme française des sports de raquette. Tournois, partenaires, résultats — tout en un.
          </p>
        </div>

        {/* Bottom stats */}
        <div
          className="relative flex gap-8 border-t pt-6"
          style={{ borderColor: 'rgba(241, 237, 229, 0.15)' }}
        >
          <div>
            <div
              style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--cream-50)' }}
            >
              2 min
            </div>
            <div className="mt-0.5 text-xs" style={{ color: 'rgba(241, 237, 229, 0.55)' }}>
              Arrivée → inscription validée
            </div>
          </div>
          <div>
            <div
              style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--cream-50)' }}
            >
              3
            </div>
            <div className="mt-0.5 text-xs" style={{ color: 'rgba(241, 237, 229, 0.55)' }}>
              Espaces — joueur, club, arbitre
            </div>
          </div>
        </div>
      </div>

      {/* ── COLONNE DROITE — contenu ──────────────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        {/* Nav mobile */}
        <div
          className="flex items-center justify-between border-b px-6 py-4 md:hidden"
          style={{ borderColor: 'var(--cream-200)' }}
        >
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              textDecoration: 'none',
            }}
          >
            the court<span style={{ color: 'var(--gold-500)' }}>.</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium transition hover:underline"
            style={{ color: 'var(--court-600)' }}
          >
            ← Retour aux tournois
          </Link>
        </div>

        {/* Page content */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Footer minimal */}
        <div
          className="border-t px-6 py-4 text-center text-xs"
          style={{ borderColor: 'var(--cream-200)', color: 'var(--text-muted)' }}
        >
          © 2026 The Court · Conçu en France ·{' '}
          <Link href="#" className="hover:underline" style={{ color: 'var(--court-600)' }}>
            CGU
          </Link>{' '}
          ·{' '}
          <Link href="#" className="hover:underline" style={{ color: 'var(--court-600)' }}>
            Confidentialité
          </Link>
        </div>
      </div>
    </div>
  );
}
