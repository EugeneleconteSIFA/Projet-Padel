'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { joinFriendlyMatch } from '@/lib/actions/community/friendly-match';

export type FriendlyMatchItem = {
  id: string;
  city: string;
  date: string;
  levelMin: string | null;
  levelMax: string | null;
  spotsLeft: number;
  spotsTotal: number;
  description: string | null;
  clubName: string | null;
  creatorName: string;
};

type FriendlyMatchesClientProps = {
  matches: FriendlyMatchItem[];
  isLoggedIn: boolean;
};

export function FriendlyMatchesClient({ matches, isLoggedIn }: FriendlyMatchesClientProps) {
  const router = useRouter();
  const [ville, setVille] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return matches.filter(m => {
      if (ville && !m.city.toLowerCase().includes(ville.toLowerCase())) return false;
      if (dateFilter) {
        const day = format(new Date(m.date), 'yyyy-MM-dd');
        if (day !== dateFilter) return false;
      }
      return true;
    });
  }, [matches, ville, dateFilter]);

  const join = (matchId: string) => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/matchs-amicaux`);
      return;
    }
    setPendingId(matchId);
    startTransition(async () => {
      const result = await joinFriendlyMatch(matchId);
      setPendingId(null);
      if ('error' in result) {
        if (result.error === 'unauthenticated') {
          router.push('/login?callbackUrl=/matchs-amicaux');
          return;
        }
        alert(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <>
      <div
        className="mb-6 grid gap-3 rounded-2xl border p-4 sm:grid-cols-2"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Ville
          </label>
          <input
            type="text"
            value={ville}
            onChange={e => setVille(e.target.value)}
            placeholder="Ex. Lille"
            className="min-h-11 w-full rounded-xl border px-3 text-sm"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Date
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="min-h-11 w-full rounded-xl border px-3 text-sm"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
          Aucun match ouvert pour ces critères.
        </p>
      ) : (
        <ul className="space-y-4">
          {filtered.map(m => (
            <li
              key={m.id}
              className="rounded-2xl border p-4 sm:p-5"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold" style={{ color: 'var(--ink-950)' }}>
                    {m.city}
                    {m.clubName ? ` · ${m.clubName}` : ''}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {format(new Date(m.date), "EEEE d MMMM 'à' HH:mm", { locale: fr })}
                  </p>
                  {(m.levelMin || m.levelMax) && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      Niveau : {m.levelMin ?? '—'} → {m.levelMax ?? '—'}
                    </p>
                  )}
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Organisé par {m.creatorName}
                  </p>
                  {m.description && (
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                      {m.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: 'var(--court-700)' }}>
                    {m.spotsLeft}/{m.spotsTotal} places
                  </p>
                  <button
                    type="button"
                    onClick={() => join(m.id)}
                    disabled={pendingId === m.id || m.spotsLeft <= 0}
                    className="mt-3 min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
                    style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
                  >
                    {pendingId === m.id ? '…' : 'Rejoindre'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href={isLoggedIn ? '/matchs-amicaux/nouveau' : '/login?callbackUrl=/matchs-amicaux/nouveau'}
          className="inline-flex min-h-11 items-center rounded-xl px-6 py-2.5 text-sm font-semibold"
          style={{ background: 'var(--gold-500)', color: 'var(--ink-950)' }}
        >
          Proposer un match
        </Link>
      </div>
    </>
  );
}
