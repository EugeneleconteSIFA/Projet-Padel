import { requireApprovedClub } from '@/lib/auth-guards';

export default async function ClubTournoiLayout({ children }: { children: React.ReactNode }) {
  await requireApprovedClub();
  return <>{children}</>;
}
