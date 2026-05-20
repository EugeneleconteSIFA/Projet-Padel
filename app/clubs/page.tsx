import { SiteHeader } from '@/components/site-header';

/**
 * Page clubs — placeholder POC.
 */
export default function ClubsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="font-display text-3xl font-bold tracking-tight">Clubs</h1>
        <p className="mt-2 text-sm text-secondary">À implémenter.</p>
      </main>
    </div>
  );
}
