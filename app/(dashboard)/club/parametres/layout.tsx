import { requireApprovedClub } from '@/lib/auth-guards';

export default async function ClubParametresLayout({ children }: { children: React.ReactNode }) {
  await requireApprovedClub();
  return <>{children}</>;
}
