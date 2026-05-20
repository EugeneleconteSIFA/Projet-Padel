import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { getProfile, getPlayerDashboard } from '@/lib/actions/profil';

/* =============================================================================
   The Court — Page profil joueur.
   Server Component : données récupérées côté serveur depuis Prisma.
   ============================================================================= */

export const metadata: Metadata = { title: 'Mon profil' };

/* ── Mock stats (fallback si BDD non connectée) ──────────────────────────── */
const MOCK_STATS = {
  tournamentsPlayed: 12,
  wins:              4,
  podiums:           7,
  winRate:           33,
};

const MOCK_HISTORY = [
  { id: 't1', tournamentName: 'Open de Loos · Avril',      clubName: 'Padel Loos', date: '2026-04-13', status: 'CONFIRMED', partnerName: 'Lucas M.',  category: 'P100' },
  { id: 't3', tournamentName: 'Hauts-de-France Open',       clubName: 'Padel Nord', date: '2026-03-22', status: 'CONFIRMED', partnerName: 'Thomas D.', category: 'P100' },
  { id: 't2', tournamentName: 'Tournoi de Roubaix · Hiver', clubName: 'Padel Roubaix', date: '2026-02-15', status: 'CONFIRMED', partnerName: 'Lucas M.',  category: 'P100' },
  { id: 't5', tournamentName: "Grand Prix d'Arras",          clubName: 'Padel Arras', date: '2026-01-18', status: 'WAITING_LIST', partnerName: 'Antoine B.', category: 'P100' },
];

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [profile, dashboard] = await Promise.all([
    getProfile().catch(() => null),
    getPlayerDashboard().catch(() => null),
  ]);

  const firstName  = profile?.firstName  ?? session.user.name?.split(' ')[0] ?? 'Joueur';
  const lastName   = profile?.lastName   ?? session.user.name?.split(' ')[1] ?? '';
  const email      = profile?.email      ?? session.user.email ?? '';
  const avatarUrl  = profile?.avatarUrl  ?? null;
  const phone      = profile?.phone      ?? null;
  const isPremium  = session.user.tier === 'PREMIUM';

  const playerProfile = profile?.playerProfile;
  const license       = playerProfile?.licenses?.[0];

  const initials = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase();

  const handLabel: Record<string, string> = {
    LEFT: 'Gaucher', RIGHT: 'Droitier', AMBIDEXTROUS: 'Ambidextre',
  };
  const sideLabel: Record<string, string> = {
    LEFT: 'Côté gauche', RIGHT: 'Côté droit', BOTH: 'Les deux côtés',
  };

  return (
    <div className="space-y-8">

      {/* ── EN-TÊTE PROFIL ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        {/* Bandeau vert décoratif */}
        <div
          className="absolute inset-x-0 top-0 h-24 rounded-t-2xl"
          style={{ background: 'linear-gradient(135deg, var(--court-700) 0%, var(--court-500) 100%)' }}
        />

        <div className="relative mt-8 flex flex-col gap-6 sm:flex-row sm:items-end">
          {/* Avatar */}
          <div className="shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${firstName} ${lastName}`}
                className="h-24 w-24 rounded-2xl border-4 object-cover"
                style={{ borderColor: 'var(--bg-surface)' }}
              />
            ) : (
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 text-2xl font-semibold"
                style={{
                  background: 'var(--court-700)',
                  color: 'var(--cream-50)',
                  borderColor: 'var(--bg-surface)',
                }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Identité */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(22px, 4vw, 32px)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                }}
              >
                {firstName} {lastName}
              </h1>
              {isPremium && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(201,162,74,0.15)',
                    color: 'var(--gold-500)',
                    border: '1px solid rgba(201,162,74,0.3)',
                  }}
                >
                  PREMIUM
                </span>
              )}
              {playerProfile?.lookingForPartner && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(42,130,100,0.15)',
                    color: 'var(--court-600)',
                    border: '1px solid rgba(42,130,100,0.3)',
                  }}
                >
                  CHERCHE PARTENAIRE
                </span>
              )}
            </div>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{email}</p>
            {phone && (
              <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>{phone}</p>
            )}
          </div>

          {/* CTA Modifier */}
          <Link
            href="/profil/modifier"
            className="shrink-0 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-80"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
          >
            Modifier le profil
          </Link>
        </div>

        {/* Bio */}
        {playerProfile?.bio && (
          <p
            className="mt-5 border-t pt-5 text-sm leading-relaxed"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            {playerProfile.bio}
          </p>
        )}
      </div>

      {/* ── GRILLE PRINCIPALE ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── COL PRINCIPALE (stats + historique) ──────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Stats tournois */}
          {(() => {
            const stats = dashboard?.stats;
            const total    = stats ? stats.totalConfirmed : MOCK_STATS.tournamentsPlayed;
            const upcoming = stats ? stats.upcoming       : MOCK_STATS.wins;
            const past     = stats ? stats.past           : MOCK_STATS.podiums;
            const waiting  = stats ? stats.waitlisted     : MOCK_STATS.winRate;
            return (
              <Card title="Statistiques">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <StatBlock value={total}    label="Confirmés"       accent />
                  <StatBlock value={upcoming} label="À venir"         />
                  <StatBlock value={past}     label="Passés"          />
                  <StatBlock value={waiting}  label="Liste d'attente" />
                </div>
              </Card>
            );
          })()}

          {/* Historique */}
          {(() => {
            const history = dashboard?.history ?? MOCK_HISTORY;
            return (
              <Card title="Derniers tournois">
                {history.length === 0 ? (
                  <EmptyState
                    message="Vous n'avez pas encore de tournoi."
                    cta="Trouver un tournoi"
                    href="/tournois"
                  />
                ) : (
                  <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {history.map(t => {
                      const statusBadge = (() => {
                        if (t.status === 'CONFIRMED')     return { label: 'Confirmé',       bg: 'rgba(42,130,100,0.12)',   color: 'var(--court-600)' };
                        if (t.status === 'WAITING_LIST') return { label: "Liste d'attente", bg: 'var(--bg-muted)',         color: 'var(--text-muted)' };
                        if (t.status === 'PENDING_PAYMENT') return { label: 'En attente',   bg: 'rgba(201,162,74,0.15)',   color: 'var(--gold-700)' };
                        return { label: t.status,                                            bg: 'var(--bg-muted)',         color: 'var(--text-muted)' };
                      })();
                      return (
                        <li key={t.id} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {t.tournamentName}
                            </p>
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                              {t.clubName}
                            </p>
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                              {new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              {t.partnerName ? ` · avec ${t.partnerName}` : ''}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span
                              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                              style={{
                                fontFamily: 'var(--font-mono)',
                                background: statusBadge.bg,
                                color:      statusBadge.color,
                              }}
                            >
                              {statusBadge.label}
                            </span>
                            <span
                              className="text-xs"
                              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                            >
                              {t.category}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            );
          })()}
        </div>

        {/* ── SIDEBAR (profil padel + infos) ────────────────────────────── */}
        <div className="space-y-4">

          {/* Profil padel */}
          <Card title="Profil padel">
            <dl className="space-y-3">
              <InfoRow
                label="Classement FFT"
                value={license?.ranking ?? playerProfile?.estimatedLevel ?? 'Non renseigné'}
                highlight={!!license?.ranking}
              />
              {license?.licenseNumber && (
                <InfoRow label="Licence FFT" value={license.licenseNumber} />
              )}
              <InfoRow
                label="Main dominante"
                value={playerProfile?.dominantHand
                  ? handLabel[playerProfile.dominantHand] ?? playerProfile.dominantHand
                  : 'Non renseigné'}
              />
              <InfoRow
                label="Côté préféré"
                value={playerProfile?.preferredSide
                  ? sideLabel[playerProfile.preferredSide] ?? playerProfile.preferredSide
                  : 'Non renseigné'}
              />
              <InfoRow
                label="Recherche partenaire"
                value={playerProfile?.lookingForPartner ? 'Oui — disponible' : 'Non'}
                accent={playerProfile?.lookingForPartner}
              />
            </dl>
            {(!playerProfile || (!playerProfile.dominantHand && !license)) && (
              <Link
                href="/profil/modifier"
                className="mt-4 block rounded-xl border py-2.5 text-center text-sm font-medium transition hover:opacity-80"
                style={{ borderColor: 'var(--court-600)', color: 'var(--court-600)' }}
              >
                Compléter mon profil →
              </Link>
            )}
          </Card>

          {/* Prochain tournoi */}
          <Card title="Prochain tournoi">
            <EmptyState
              message="Aucune inscription en cours."
              cta="Chercher un tournoi"
              href="/"
            />
          </Card>

          {/* Clubs favoris */}
          <Card title="Clubs favoris">
            {(playerProfile?.favoriteClubs?.length ?? 0) === 0 ? (
              <EmptyState message="Aucun club favori." />
            ) : (
              <ul className="space-y-2">
                {playerProfile!.favoriteClubs.map(fc => (
                  <li
                    key={fc.clubId}
                    className="rounded-xl border px-3 py-2.5 text-sm"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    {fc.club.name}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   COMPOSANTS LOCAUX
   ============================================================================= */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatBlock({
  value,
  label,
  accent = false,
}: {
  value: number | string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 500,
          lineHeight: 1,
          color: accent ? 'var(--court-600)' : 'var(--text-primary)',
        }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
  accent = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>{label}</dt>
      <dd
        className="text-right text-sm font-medium"
        style={{
          color: accent
            ? 'var(--court-600)'
            : highlight
            ? 'var(--text-primary)'
            : 'var(--text-secondary)',
          fontFamily: highlight ? 'var(--font-mono)' : undefined,
        }}
      >
        {value}
      </dd>
    </div>
  );
}

function EmptyState({
  message,
  cta,
  href,
}: {
  message: string;
  cta?: string;
  href?: string;
}) {
  return (
    <div className="py-2 text-center">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
      {cta && href && (
        <Link
          href={href}
          className="mt-3 inline-block text-sm font-medium transition hover:underline"
          style={{ color: 'var(--court-600)' }}
        >
          {cta} →
        </Link>
      )}
    </div>
  );
}
