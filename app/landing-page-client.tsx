'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';

/* =============================================================================
   The Court — Page d'accueil publique explicative.
   Présente le concept, les profils utilisateurs et oriente vers les bonnes pages.
   ============================================================================= */

export default function LandingPageClient() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      <SiteHeader />

      {/* ── HERO SECTION ───────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(48px, 8vw, 96px) 24px',
          maxWidth: 1200,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 'clamp(16px, 3vw, 24px)',
            color: 'var(--text-primary)',
          }}
        >
          Trouve ton prochain tournoi de padel.
        </h1>
        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 18px)',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: 640,
            margin: '0 auto clamp(32px, 5vw, 48px)',
          }}
        >
          Recherche, inscription, paiement et partenaire : tout ton tournoi au même endroit.
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/tournois"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 32px',
              borderRadius: 999,
              background: 'var(--court-700)',
              color: 'var(--cream-50)',
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--court-600)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--court-700)'; }}
          >
            Trouver un tournoi
          </Link>
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 32px',
              borderRadius: 999,
              background: 'transparent',
              color: 'var(--court-700)',
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid var(--court-700)',
              transition: 'background 0.2s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--cream-200)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Créer un compte
          </Link>
        </div>
      </section>

      {/* ── BARRE DE RECHERCHE ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: '0 24px clamp(32px, 5vw, 48px)',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <form
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
            gap: 12,
            alignItems: 'end',
          }}
          onSubmit={(e) => { e.preventDefault(); window.location.href = '/tournois'; }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
                color: 'var(--text-secondary)',
              }}
            >
              Ville
            </label>
            <input
              type="text"
              placeholder="Lille, Paris..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--cream-200)',
                background: 'var(--off-white)',
                fontSize: 14,
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
                color: 'var(--text-secondary)',
              }}
            >
              Date
            </label>
            <input
              type="date"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--cream-200)',
                background: 'var(--off-white)',
                fontSize: 14,
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
                color: 'var(--text-secondary)',
              }}
            >
              Catégorie
            </label>
            <select
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--cream-200)',
                background: 'var(--off-white)',
                fontSize: 14,
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="">Toutes</option>
              <option value="P25">P25</option>
              <option value="P100">P100</option>
              <option value="P250">P250</option>
              <option value="P500">P500</option>
              <option value="P1000">P1000</option>
              <option value="P2000">P2000</option>
            </select>
          </div>
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              background: 'var(--court-700)',
              color: 'var(--cream-50)',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--court-600)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--court-700)'; }}
          >
            Rechercher
          </button>
        </form>
      </section>

      {/* ── POURQUOI THE COURT ? ─────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(48px, 6vw, 80px) 24px',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: 24,
            color: 'var(--text-primary)',
          }}
        >
          Fini les infos dispersées.
        </h2>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
          }}
        >
          Aujourd'hui, les joueurs jonglent entre Tenup, la FFT, WhatsApp, Facebook et les appels aux clubs. Les clubs gèrent encore beaucoup de choses sur Excel. Les juges-arbitres perdent du temps avec les tableaux et scores dispersés.
        </p>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            marginTop: 16,
          }}
        >
          The Court centralise ce qui se passe avant, pendant et après un tournoi : recherche, inscription, partenaires, suivi club, tableaux et résultats.
        </p>
      </section>

      {/* ── TROIS ESPACES ─────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(48px, 6vw, 80px) 24px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: 'clamp(32px, 5vw, 48px)',
            textAlign: 'center',
            color: 'var(--text-primary)',
          }}
        >
          Une app, trois espaces
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {/* Joueur */}
          <ProfileCard
            title="Joueur"
            description="Trouve et rejoins un tournoi de padel en quelques clics."
            ctaText="Explorer les tournois"
            ctaHref="/tournois"
          />
          {/* Club */}
          <ProfileCard
            title="Club"
            description="Crée et gère tes tournois simplement."
            ctaText="Voir l'espace club"
            ctaHref="/clubs"
          />
          {/* Juge-arbitre */}
          <ProfileCard
            title="Juge-arbitre"
            description="Organise les tableaux, les scores et le suivi sportif."
            ctaText="Créer un compte"
            ctaHref="/signup"
          />
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(48px, 6vw, 80px) 24px',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: 'clamp(32px, 5vw, 48px)',
            textAlign: 'center',
            color: 'var(--text-primary)',
          }}
        >
          Comment ça marche
        </h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
          }}
        >
          <StepCard
            number="1"
            title="Crée ton compte"
            description="Inscris-toi avec tes informations essentielles et ton profil padel."
          />
          <StepCard
            number="2"
            title="Choisis ton rôle"
            description="Joueur, club ou juge-arbitre : chaque profil accède à un espace adapté."
          />
          <StepCard
            number="3"
            title="Passe à l'action"
            description="Recherche un tournoi, crée une compétition ou prépare les tableaux selon ton rôle."
          />
        </div>
      </section>

      {/* ── CE QUE LA V1 PERMET ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(48px, 6vw, 80px) 24px',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: 24,
            color: 'var(--text-primary)',
          }}
        >
          Ce que la V1 permet
        </h2>
        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 12,
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {[
            'Recherche de tournois',
            'Fiche tournoi détaillée',
            'Inscription et compte utilisateur',
            'Espace joueur',
            'Espace club',
            'Espace juge-arbitre',
            'Création de tournoi club',
            'Suivi basique des tableaux et scores',
          ].map((item) => (
            <li
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 15,
                color: 'var(--text-secondary)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--court-100)',
                  color: 'var(--court-700)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(64px, 8vw, 96px) 24px',
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 500,
            lineHeight: 1.1,
            marginBottom: 16,
            color: 'var(--text-primary)',
          }}
        >
          Tout se joue sur The Court.
        </h2>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: 'clamp(32px, 5vw, 48px)',
          }}
        >
          Commence par chercher un tournoi ou crée ton compte pour accéder à ton espace.
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/tournois"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 32px',
              borderRadius: 999,
              background: 'var(--court-700)',
              color: 'var(--cream-50)',
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--court-600)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--court-700)'; }}
          >
            Explorer les tournois
          </Link>
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 32px',
              borderRadius: 999,
              background: 'transparent',
              color: 'var(--court-700)',
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid var(--court-700)',
              transition: 'background 0.2s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--cream-200)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Créer un compte
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer
        style={{
          marginTop: 'clamp(48px, 6vw, 80px)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px',
          fontSize: 14,
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)' }}>
            the court<span style={{ color: 'var(--gold-500)' }}>.</span>
          </span>
          <span>© 2026 The Court · Tout se joue ici. Conçu en France.</span>
        </div>
      </footer>
    </div>
  );
}

/* =============================================================================
   COMPOSANTS LOCAUX
   ============================================================================= */

function ProfileCard({
  title,
  description,
  ctaText,
  ctaHref,
}: {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 500,
          marginBottom: 16,
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          marginBottom: 24,
        }}
      >
        {description}
      </p>
      <Link
        href={ctaHref}
        style={{
          marginTop: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 24px',
          borderRadius: 999,
          background: 'var(--court-700)',
          color: 'var(--cream-50)',
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'background 0.2s ease',
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--court-600)'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = 'var(--court-700)'; }}
      >
        {ctaText}
      </Link>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: 999,
          background: 'var(--court-700)',
          color: 'var(--cream-50)',
          fontSize: 20,
          fontWeight: 600,
          fontFamily: 'var(--font-display)',
          flexShrink: 0,
        }}
      >
        {number}
      </div>
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 500,
            marginBottom: 8,
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
