import { requireApprovedClub } from '@/lib/auth-guards';

export default async function ClubStripeLayout({ children }: { children: React.ReactNode }) {
  await requireApprovedClub();
  return <>{children}</>;
}
