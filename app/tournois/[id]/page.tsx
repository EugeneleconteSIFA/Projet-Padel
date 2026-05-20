import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  formatDate,
  spotsLeft,
  spotsLabel,
  type Tournament,
} from '@/lib/mock-tournaments';
import {
  getTournamentBySlug,
  listTournamentSlugs,
  listTournaments,
} from '@/lib/queries/tournaments';
import { auth } from '@/lib/auth';
import { checkUserRegistration } from '@/lib/actions/tournament';
import { RegisterButton } from './register-button';
import { CopyLinkButton } from '@/components/copy-link-button';

/* =============================================================================
   The Court — Fiche détail d'un tournoi.
   Server Component : données lues côté serveur, CTA inscription en client.
   Route : /tournois/[id]   (`id` = slug du tournoi, ex. "open-de-loos-mai-2026")
   ============================================================================= */

/* ── generateStaticParams ───────────────────────────────────────────────── */

export async function generateStaticParams() {
  const slugs = await listTournamentSlugs();
  return slugs.map((slug) => ({ id: slug }));
}

/* ── Metadata dynamique ──────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const t = await getTournamentBySlug(id);
  if (!t) return { title: 'Tournoi introuvable' };
  return {
    title: t.name,
    description: `${t.category} ${t.genre} · ${t.city} · ${formatDate(t.date)} — ${t.description.slice(0, 120)}…`,
  };
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [t, session] = await Promise.all([
    getTournamentBySlug(id),
    auth(),
  ]);
  if (!t) notFound();

  const registrationStatus = session?.user
    ? await checkUserRegistration(t.editionId)
    : 'NONE';

  // Liste utilisée par la card "Du même club" — chargée une seule fois.
  const allTournaments = await listTournaments();
  const others = allTournaments.filter(
    (other) => other.club === t.club && other.id !== t.id,
  );

  const spots      = spotsLeft(t);
  const isFull     = spots === 0;
  const isUrgent   = spots > 0 && spots <= 2;
  const isMultiDay = !!t.dateEnd && t.dateEnd !== t.date;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-30 border-b px-6 py-3.5 backdrop-blur-md"
        style={{ borderColor: 'var(--border-subtle)', background: 'color-mix(in srgb, var(--bg-page) 88%, transparent)' }}
      >
        <div className="mx-auto flex max-w-screen-xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium transition hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronLeftIcon />
            Retour aux tournois
          </Link>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: 'var(--text-primary)' }}>
            the court<span style={{ color: 'var(--gold-500)' }}>.</span>
          </span>
          <Link
            href="/login"
            className="rounded-lg px-4 py-1.5 text-sm font-medium transition hover:opacity-80"
            style={{ background: 'var(--court-700)', color: 'var(--cream-50)' }}
          >
            Se connecter
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--court-700)' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-10 md:py-14">
          {/* Breadcrumb */}
          <p className="mb-4 text-xs font-medium uppercase tracking-widest" style={{ color: 'rgba(241,237,229,0.55)' }}>
            {t.city} · {t.club}
          </p>

          {/* Titre */}
          <h1
            className="mb-5"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontWeight: 500,
              color: 'var(--cream-50)',
              lineHeight: 1.08,
            }}
          >
            {t.name}
          </h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge label={t.category} variant="gold" />
            <Badge label={t.genre} />
            <Badge label={t.surface === 'indoor' ? 'Salle' : 'Extérieur'} />
            <Badge label={t.format} />
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── COLONNE PRINCIPALE ───────────────────────────────────────── */}
          <div className="space-y-8 lg:col-span-2">

            {/* Infos clés */}
            <Section title="Informations">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <InfoCard icon={<CalendarIcon />} label="Date" value={
                  isMultiDay
                    ? `${formatDate(t.date, { day: 'numeric', month: 'long' })} – ${formatDate(t.dateEnd!, { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : formatDate(t.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                } />
                <InfoCard icon={<ClockIcon />} label="Heure" value={`Premier match à ${t.time}`} />
                <InfoCard icon={<MapPinIcon />} label="Lieu" value={t.address} />
                <InfoCard icon={<TrophyIcon />} label="Catégorie" value={t.category} />
                <InfoCard icon={<UsersIcon />} label="Équipes" value={`${t.teams} inscrites · max ${t.maxTeams}`} />
                <InfoCard icon={<EuroIcon />} label="Inscription" value={`${t.price} € / équipe`} />
              </div>
            </Section>

            {/* Description */}
            <Section title="À propos de ce tournoi">
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {t.description}
              </p>
              {t.prizes && (
                <div
                  className="mt-4 flex items-center gap-3 rounded-xl border px-4 py-3"
                  style={{ borderColor: 'var(--gold-300)', background: 'color-mix(in srgb, var(--gold-100) 40%, transparent)' }}
                >
                  <StarIcon />
                  <span className="text-sm font-medium" style={{ color: 'var(--gold-700)' }}>
                    Dotation : {t.prizes}
                  </span>
                </div>
              )}
            </Section>

            {/* Programme */}
            {t.schedule.length > 0 && (
              <Section title="Programme">
                <ol className="relative space-y-0 border-l-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  {t.schedule.map((slot, i) => (
                    <li key={i} className="relative pb-5 pl-6 last:pb-0">
                      {/* dot */}
                      <span
                        className="absolute -left-[9px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2"
                        style={{
                          background: i === 0 ? 'var(--court-700)' : 'var(--bg-surface)',
                          borderColor: i === 0 ? 'var(--court-700)' : 'var(--border-strong)',
                        }}
                      />
                      <p
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                      >
                        {slot.time}
                      </p>
                      <p className="mt-0.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {slot.label}
                      </p>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Contact */}
            <Section title="Contact club">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'var(--court-100)', color: 'var(--court-700)' }}
                >
                  <MailIcon />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.club}</p>
                  <a
                    href={`mailto:${t.contact}`}
                    className="text-sm transition hover:underline"
                    style={{ color: 'var(--court-600)' }}
                  >
                    {t.contact}
                  </a>
                </div>
              </div>
            </Section>
          </div>

          {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
          <aside className="space-y-4">

            {/* CTA Card */}
            <div
              className="sticky top-20 rounded-2xl border p-6"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              {/* Prix */}
              <div className="mb-1 flex items-baseline gap-1.5">
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '36px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                  }}
                >
                  {t.price} €
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/ équipe</span>
              </div>
              <p className="mb-5 text-xs" style={{ color: 'var(--text-muted)' }}>
                soit {Math.ceil(t.price / 2)} € par joueur si paiement partagé
              </p>

              {/* Jauge places */}
              <div className="mb-5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {isFull ? 'Complet' : `${t.teams} équipe${t.teams > 1 ? 's' : ''} inscrite${t.teams > 1 ? 's' : ''}`}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: isFull ? 'var(--color-danger)' : isUrgent ? 'var(--gold-700)' : 'var(--court-600)' }}
                  >
                    {spotsLabel(t)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg-muted)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round((t.teams / t.maxTeams) * 100)}%`,
                      background: isFull ? 'var(--color-danger)' : isUrgent ? 'var(--gold-500)' : 'var(--court-600)',
                    }}
                  />
                </div>
              </div>

              {/* CTA */}
              <RegisterButton
                editionId={t.editionId}
                slug={t.id}
                price={t.price}
                maxTeams={t.maxTeams}
                teams={t.teams}
                isLoggedIn={!!session?.user}
                registrationStatus={registrationStatus}
              />

              {/* Note */}
              <p className="mt-4 text-center text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Paiement sécurisé via Stripe.<br />
                Remboursement si le tournoi est annulé.
              </p>
            </div>

            {/* Partager */}
            <div
              className="rounded-2xl border p-4"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <p className="mb-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Partager
              </p>
              <div className="flex gap-2">
                <CopyLinkButton icon={<LinkIcon />} />
                <ShareButton label="WhatsApp" icon={<WhatsappIcon />} />
              </div>
            </div>

            {/* Autres tournois du club */}
            <div
              className="rounded-2xl border p-4"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <p className="mb-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Du même club
              </p>
              <OtherTournaments others={others} />
            </div>
          </aside>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer
        className="mt-8 border-t px-6 py-6 text-sm"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-4">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: 'var(--text-primary)' }}>
            the court<span style={{ color: 'var(--gold-500)' }}>.</span>
          </span>
          <span>© 2026 The Court · Tout se joue ici.</span>
          <Link href="/" className="transition hover:underline" style={{ color: 'var(--text-muted)' }}>
            ← Tous les tournois
          </Link>
        </div>
      </footer>
    </div>
  );
}

/* =============================================================================
   COMPOSANTS LOCAUX (Server)
   ============================================================================= */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2
        className="mb-4 text-base font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h2>
      <div
        className="rounded-2xl border p-5"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        {children}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
          {label}
        </span>
      </div>
      <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

function Badge({
  label,
  variant = 'default',
}: {
  label: string;
  variant?: 'default' | 'gold';
}) {
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
      style={{
        fontFamily: 'var(--font-mono)',
        background: variant === 'gold'
          ? 'rgba(201,162,74,0.18)'
          : 'rgba(241,237,229,0.15)',
        color: variant === 'gold'
          ? 'var(--gold-300)'
          : 'rgba(241,237,229,0.8)',
        border: `1px solid ${variant === 'gold' ? 'rgba(201,162,74,0.35)' : 'rgba(241,237,229,0.2)'}`,
      }}
    >
      {label}
    </span>
  );
}

function ShareButton({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button
      className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 text-xs font-medium transition hover:opacity-80"
      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
    >
      {icon}
      {label}
    </button>
  );
}

function OtherTournaments({ others }: { others: Tournament[] }) {
  if (others.length === 0) {
    return (
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Aucun autre tournoi prévu pour ce club.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {others.map(t => (
        <li key={t.id}>
          <Link
            href={`/tournois/${t.id}`}
            className="block rounded-xl border px-3 py-2.5 transition hover:opacity-80"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-muted)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatDate(t.date, { day: 'numeric', month: 'long' })} · {t.category}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ── Icons (SVG Lucide 1.5px stroke) ──────────────────────────────────────── */

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function TrophyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17a1 1 0 0 1-1 1H8v4h8v-4h-1a1 1 0 0 1-1-1v-2.34" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function EuroIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12" /><path d="M4 14h9" />
      <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold-500)', flexShrink: 0 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function WhatsappIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  );
}
