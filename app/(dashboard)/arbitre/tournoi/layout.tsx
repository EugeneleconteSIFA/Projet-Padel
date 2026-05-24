import { requireApprovedReferee } from '@/lib/auth-guards';

export default async function ArbitreTournoiLayout({ children }: { children: React.ReactNode }) {
  await requireApprovedReferee();
  return <>{children}</>;
}
