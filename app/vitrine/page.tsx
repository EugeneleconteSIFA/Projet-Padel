import Link from 'next/link';
import type { Metadata } from 'next';

/* =============================================================================
   The Court — Page vitrine / présentation de la plateforme.
   Route : /vitrine
   Sert à présenter le projet à des clubs, investisseurs, partenaires.
   La vraie expérience utilisateur commence sur la home (/).
   ============================================================================= */

export const metadata: Metadata = {
  title: 'À propos — The Court',
  description:
    "The Court, la plateforme française des sports de raquette. Découvrez la vision, les fonctionnalités et les espaces joueur, club, juge-arbitre.",
};

/* ── Data ──────────────────────────────────────────────────────────────────── */

const playerFacets = [
  {
    title: 'Recherche par ville et rayon',
    body: 'Filtres par date, catégorie (P25 → P2000), genre, indoor/outdoor, prix. Carte interactive.',
  },
  {
    title: 'Inscription en deux clics',
    body: "Connecté, licence liée, formulaire pré-rempli. Vous validez, c'est fini.",
  },
  {
    title: 'Paiement partagé',
    body: 'Un tournoi, deux paiements. Chaque partenaire paie sa part, factures auto.',
  },
  {
    title: "File d'attente solo",
    body: "Pas de partenaire ? Inscrivez-vous seul, le matching valide l'inscription.",
  },
  {
    title: 'Partenaires favoris',
    body: 'Coéquipiers réguliers, statistiques de duo, invitation en un clic.',
  },
  {
    title: 'Profil et historique',
    body: 'Photo, classement, niveau, main, côté, matchs et stats remplis automatiquement.',
  },
];

const clubFacets = [
  {
    title: 'Création de tournoi',
    body: 'Date, format, prix, équipes max. Publié en 5 minutes, visible immédiatement.',
  },
  {
    title: 'Suivi des inscriptions',
    body: "Liste temps réel, paiements vérifiés, file d'attente, statut par équipe.",
  },
  {
    title: 'Encaissement direct',
    body: "Stripe Connect — l'argent va sur le compte du club, pas un intermédiaire.",
  },
  {
    title: 'Gestion des terrains',
    body: 'Inventaire des courts, indoor/outdoor, attribution automatique aux matchs.',
  },
  {
    title: 'Communication ciblée',
    body: 'Message à vos adhérents, vos inscrits, vos meilleurs joueurs.',
  },
  {
    title: "File d'attente intelligente",
    body: 'Désistement détecté, le suivant est notifié. Le tournoi reste plein.',
  },
];

const refereeFacets = [
  {
    title: 'Tableaux générés',
    body: 'Élimination directe, poules + tableau, consolante. Validation et publication.',
  },
  {
    title: 'Saisie de scores tactile',
    body: "Set par set, jeu par jeu, tie-break. Annulation immédiate en cas d'erreur.",
  },
  {
    title: 'Publication directe',
    body: 'Score saisi = score visible côté joueur. Classements live.',
  },
  {
    title: 'Gestion des forfaits',
    body: "Walkover en un clic, le bracket s'adapte automatiquement.",
  },
  {
    title: "Historique d'arbitrage",
    body: 'Tournois officiés, exportable PDF pour vos justificatifs fédéraux.',
  },
];

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function VitrinePage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(241, 237, 229, 0.90)',
          backdropFilter: 'saturate(140%) blur(12px)',
          WebkitBackdropFilter: 'saturate(140%) blur(12px)',
          borderColor: 'var(--cream-200)',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-7 py-4">
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
            }}
          >
            the court<span style={{ color: 'var(--gold-500)' }}>.</span>
          </Link>
          <nav className="flex items-center gap-1">
            {(['#joueur', '#club', '#arbitre'] as const).map((href, i) => (
              <a
                key={href}
                href={href}
                className="hidden rounded-md px-4 py-2 text-sm font-medium transition hover:bg-[var(--cream-200)] md:inline-block"
                style={{ color: 'var(--text-secondary)' }}
              >
                {['Joueur', 'Club', 'Juge-arbitre'][i]}
              </a>
            ))}
            <Link
              href="/login"
              className="rounded-md px-4 py-2 text-sm font-medium transition hover:bg-[var(--cream-200)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-md px-4 py-2 text-sm font-medium text-white transition"
              style={{ background: 'var(--court-700)' }}
            >
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Grid décoratif */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(var(--cream-200) 1px, transparent 1px), linear-gradient(90deg, var(--cream-200) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at 70% 20%, black 0%, transparent 60%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 70% 20%, black 0%, transparent 60%)',
          }}
        />
        <div className="mx-auto max-w-6xl px-7 pb-20 pt-24">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em]"
            style={{ background: 'var(--court-100)', color: 'var(--court-700)' }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--court-600)' }}
            />
            POC v0.2 · Padel d&apos;abord, autres raquettes ensuite
          </span>

          <h1
            className="mt-7 leading-[0.98] tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(46px, 7vw, 96px)',
              fontWeight: 500,
            }}
          >
            Tout se joue
            <br />
            sur{' '}
            <span className="italic" style={{ color: 'var(--court-700)' }}>
              The Court
            </span>
            <span style={{ color: 'var(--gold-500)' }}>.</span>
          </h1>

          <p
            className="mt-7 max-w-2xl text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Recherche de tournois, inscription en deux clics, paiement partagé, partenaires,
            résultats, espaces club et arbitrage. Une seule app pour tout votre padel.
          </p>

          <div className="mt-11 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md px-6 py-3.5 text-sm font-medium text-white transition hover:-translate-y-px"
              style={{ background: 'var(--court-700)' }}
            >
              Trouver un tournoi <span aria-hidden>→</span>
            </Link>
            <a
              href="mailto:eugeneleconte@outlook.com"
              className="inline-flex items-center rounded-md border px-6 py-3.5 text-sm font-medium transition hover:bg-[var(--cream-200)]"
              style={{ borderColor: 'var(--paper-200)', color: 'var(--text-primary)' }}
            >
              Rejoindre la bêta
            </a>
          </div>

          {/* Stats */}
          <div
            className="mt-20 grid grid-cols-2 gap-8 border-t pt-10 md:grid-cols-4"
            style={{ borderColor: 'var(--cream-200)' }}
          >
            <Stat num="3" label="Espaces — joueur, club, juge-arbitre" />
            <Stat num="2 min" label="De l'arrivée sur le site à l'inscription validée" />
            <Stat num="1" label="Outil — fini Tenup, Excel, WhatsApp et Facebook" />
            <Stat num="5" label="Sports prévus — padel, tennis, badminton, ping, squash" />
          </div>
        </div>
      </section>

      {/* ── CONSTAT ───────────────────────────────────────────────────────── */}
      <section className="border-t" style={{ borderColor: 'var(--cream-200)' }}>
        <div className="mx-auto max-w-6xl px-7 py-24">
          <h2
            className="max-w-3xl leading-tight tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              fontWeight: 500,
            }}
          >
            Aujourd&apos;hui, votre padel
            <br />
            <span className="italic" style={{ color: 'var(--court-700)' }}>
              vit dans cinq endroits différents.
            </span>
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            <Constat
              n="01"
              title="Pour trouver un tournoi"
              body="Tenup, les pages Facebook des clubs, le bouche-à-oreille. Trois sources, jamais à jour en même temps."
            />
            <Constat
              n="02"
              title="Pour trouver un partenaire"
              body="WhatsApp, Instagram DM, le groupe du club. Vous demandez à dix personnes, deux répondent."
            />
            <Constat
              n="03"
              title="Pour suivre vos résultats"
              body="Un carnet, des screens, un tableau Excel. Vos statistiques n'existent nulle part en vrai."
            />
          </div>
        </div>
      </section>

      {/* ── JOUEUR ────────────────────────────────────────────────────────── */}
      <FacetsSection
        id="joueur"
        kicker="— 01 / Espace joueur"
        title={
          <>
            Tout ce qu&apos;un joueur fait dans une saison
            <span className="italic" style={{ color: 'var(--court-700)' }}>
              ,{'\n'}dans une seule app.
            </span>
          </>
        }
        sub="On a regardé ce qui prend du temps à un joueur amateur — chercher, s'inscrire, payer, trouver un partenaire, suivre ses matchs. Puis on l'a réduit au minimum nécessaire."
        items={playerFacets}
      />

      {/* ── CLUB ──────────────────────────────────────────────────────────── */}
      <FacetsSection
        id="club"
        kicker="— 02 / Espace club"
        soft
        title={
          <>
            Vos tournois remplis,{' '}
            <span className="italic" style={{ color: 'var(--court-700)' }}>
              vos joueurs contents.
            </span>
          </>
        }
        sub="Conçu avec les clubs en tête. Pas un logiciel qu'on adopte par contrainte — un outil qui remplace les fichiers, les SMS, les rappels manuels."
        items={clubFacets}
      />

      {/* ── JUGE-ARBITRE ──────────────────────────────────────────────────── */}
      <FacetsSection
        id="arbitre"
        dark
        kicker="— 03 / Espace juge-arbitre"
        title={
          <>
            Le tournoi se gère{' '}
            <span className="italic" style={{ color: 'var(--gold-300)' }}>
              depuis votre téléphone.
            </span>
          </>
        }
        sub="Mobile-first, tactile, pensé pour quelqu'un qui court entre quatre courts pendant une journée entière."
        items={refereeFacets}
      />

      {/* ── PROMESSE 2 MINUTES ───────────────────────────────────────────── */}
      <section className="py-24 text-center">
        <div className="mx-auto max-w-4xl px-7">
          <div
            className="font-mono text-[11px] uppercase tracking-[0.14em]"
            style={{ color: 'var(--court-600)' }}
          >
            — Notre engagement
          </div>
          <h2
            className="mt-6 leading-none tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 6vw, 80px)',
              fontWeight: 500,
            }}
          >
            De l&apos;arrivée sur le site
            <br />à l&apos;inscription validée
            <span className="italic" style={{ color: 'var(--court-700)' }}>
              ,
            </span>
            <br />
            <span
              style={{
                backgroundImage: 'linear-gradient(transparent 75%, var(--gold-300) 75%)',
              }}
            >
              moins de deux minutes.
            </span>
          </h2>
          <p
            className="mx-auto mt-7 max-w-xl text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Si une fonctionnalité ralentit le joueur, elle dégage. C&apos;est notre seul KPI produit.
          </p>
          <div
            className="mt-14 inline-flex items-baseline gap-3 border-y px-8 py-4"
            style={{ borderColor: 'var(--paper-200)' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '48px',
                color: 'var(--court-700)',
              }}
            >
              2:00
            </span>
            <span
              className="font-mono text-xs uppercase tracking-[0.1em]"
              style={{ color: 'var(--text-muted)' }}
            >
              — max, du clic à la confirmation
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-32 text-center"
        style={{ background: 'var(--court-700)', color: 'var(--cream-50)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(241,237,229,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(241,237,229,0.04) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-7">
          <h2
            className="leading-none tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(44px, 6vw, 88px)',
              fontWeight: 500,
              color: 'var(--cream-50)',
            }}
          >
            On se voit
            <br />
            sur{' '}
            <span className="italic" style={{ color: 'var(--gold-300)' }}>
              The Court
            </span>
            .
          </h2>
          <p
            className="mx-auto mt-7 max-w-lg text-lg"
            style={{ color: 'rgba(241, 237, 229, 0.75)' }}
          >
            Le POC démarre cet été en bêta fermée. Pour rejoindre la liste, ou si vous gérez un club
            des Hauts-de-France et voulez en parler — un email suffit.
          </p>
          <div className="mt-11 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:eugeneleconte@outlook.com"
              className="rounded-md px-6 py-3.5 text-sm font-medium transition"
              style={{
                background: 'var(--gold-500)',
                color: 'var(--court-900)',
              }}
            >
              Rejoindre la bêta
            </a>
            <Link
              href="/"
              className="rounded-md border px-6 py-3.5 text-sm font-medium transition"
              style={{
                borderColor: 'rgba(241, 237, 229, 0.25)',
                color: 'var(--cream-50)',
              }}
            >
              Trouver un tournoi →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer
        className="py-14"
        style={{ background: 'var(--court-900)', color: 'rgba(241, 237, 229, 0.7)' }}
      >
        <div className="mx-auto max-w-6xl px-7">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2">
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  color: 'var(--cream-50)',
                }}
              >
                the court<span style={{ color: 'var(--gold-500)' }}>.</span>
              </div>
              <p className="mt-3 max-w-xs text-sm">
                La plateforme française des sports de raquette. Padel d&apos;abord, le reste ensuite.
              </p>
            </div>
            <FooterCol
              title="Produit"
              links={[
                { label: 'Espace joueur', href: '#joueur' },
                { label: 'Espace club', href: '#club' },
                { label: 'Espace juge-arbitre', href: '#arbitre' },
                { label: 'Trouver un tournoi', href: '/' },
              ]}
            />
            <FooterCol
              title="Légal"
              links={[
                { label: 'Mentions légales', href: '#' },
                { label: 'CGU', href: '#' },
                { label: 'Confidentialité', href: '#' },
                { label: 'Cookies', href: '#' },
              ]}
            />
          </div>
          <div
            className="mt-12 flex flex-wrap justify-between gap-3 border-t pt-6 text-xs"
            style={{
              borderColor: 'rgba(241, 237, 229, 0.10)',
              color: 'rgba(241, 237, 229, 0.5)',
            }}
          >
            <span>© {new Date().getFullYear()} The Court · Tout se joue ici.</span>
            <span>Conçu en France</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* =============================================================================
   COMPOSANTS LOCAUX
   ============================================================================= */

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '36px',
          fontWeight: 500,
          color: 'var(--court-700)',
        }}
      >
        {num}
      </div>
      <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
    </div>
  );
}

function Constat({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border-t-2 pt-5" style={{ borderColor: 'var(--court-700)' }}>
      <span className="font-mono text-xs" style={{ color: 'var(--ink-400)' }}>
        {n}
      </span>
      <h3
        className="mt-2"
        style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500 }}
      >
        {title}
      </h3>
      <p className="mt-3 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
        {body}
      </p>
    </div>
  );
}

function FacetsSection({
  id,
  kicker,
  title,
  sub,
  items,
  dark = false,
  soft = false,
}: {
  id: string;
  kicker: string;
  title: React.ReactNode;
  sub: string;
  items: { title: string; body: string }[];
  dark?: boolean;
  soft?: boolean;
}) {
  const sectionStyle = dark
    ? { background: 'var(--court-700)', color: 'var(--cream-50)' }
    : soft
    ? { background: 'var(--cream-100)' }
    : undefined;

  return (
    <section id={id} className="py-24" style={sectionStyle}>
      <div className="mx-auto max-w-6xl px-7">
        <div className="mb-16 max-w-3xl">
          <div
            className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em]"
            style={{ color: dark ? 'var(--gold-300)' : 'var(--court-600)' }}
          >
            {kicker}
          </div>
          <h2
            className="leading-tight tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 500,
            }}
          >
            {title}
          </h2>
          <p
            className="mt-5 max-w-2xl text-[17px]"
            style={{ color: dark ? 'rgba(241,237,229,0.75)' : 'var(--text-secondary)' }}
          >
            {sub}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <Facet key={item.title} title={item.title} body={item.body} dark={dark} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Facet({ title, body, dark }: { title: string; body: string; dark?: boolean }) {
  return (
    <article
      className="rounded-2xl border p-7 transition hover:-translate-y-0.5"
      style={{
        background: dark ? 'var(--court-800)' : 'var(--off-white)',
        borderColor: dark ? 'rgba(241, 237, 229, 0.10)' : 'var(--cream-200)',
        color: dark ? 'var(--cream-50)' : 'var(--ink-950)',
      }}
    >
      <h4
        className="tracking-tight"
        style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500 }}
      >
        {title}
      </h4>
      <p
        className="mt-2 text-sm"
        style={{ color: dark ? 'rgba(241,237,229,0.7)' : 'var(--ink-700)' }}
      >
        {body}
      </p>
    </article>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h5
        className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em]"
        style={{ color: 'rgba(241, 237, 229, 0.4)' }}
      >
        {title}
      </h5>
      <ul className="space-y-2">
        {links.map(l => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm transition hover:text-[var(--gold-300)]"
              style={{ color: 'rgba(241, 237, 229, 0.8)' }}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
