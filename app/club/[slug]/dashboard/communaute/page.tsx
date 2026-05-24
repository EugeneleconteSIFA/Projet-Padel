import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardHeader } from '@/components/dashboard-header';
import { ClubAnnouncementForm } from '@/components/community/ClubAnnouncementForm';
import { ClubModerationPanel } from '@/components/community/ClubModerationPanel';
import { getClubBySlug, requireClubOwner } from '@/lib/community/club-access';
import { fetchClubModerationPosts } from '@/lib/community/posts';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  return {
    title: club ? `Modération — ${club.name}` : 'Modération club',
  };
}

export default async function ClubDashboardCommunautePage({ params }: Props) {
  const { slug } = await params;
  const owner = await requireClubOwner(slug);
  if (!owner) {
    const session = await auth();
    if (!session?.user) {
      redirect(`/login?callbackUrl=/club/${slug}/dashboard/communaute`);
    }
    redirect(`/club/${slug}/communaute`);
  }

  const club = owner.club;
  const posts = await fetchClubModerationPosts(club.id);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <DashboardHeader />
      <main className="mx-auto max-w-screen-md px-4 py-8 sm:px-6">
        <Link
          href={`/club/${slug}/communaute`}
          className="mb-4 inline-flex min-h-11 items-center text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          ← Espace communauté
        </Link>
        <h1
          className="mb-2 text-2xl font-medium"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-950)' }}
        >
          Modération — {club.name}
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          Épingler une annonce (max 1 active par semaine), désépingler ou supprimer les posts des membres.
        </p>

        <ClubAnnouncementForm clubId={club.id} clubSlug={slug} />
        <ClubModerationPanel clubId={club.id} clubSlug={slug} posts={posts} />
      </main>
    </div>
  );
}
