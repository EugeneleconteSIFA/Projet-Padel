import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return <div className="flex h-screen bg-[var(--bg-base)]">{children}</div>;
}
