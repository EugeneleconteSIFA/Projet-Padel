'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createFriendlyMatch } from '@/lib/actions/community/friendly-match';

type ClubOption = { id: string; name: string };

type FriendlyMatchFormProps = {
  clubOptions: ClubOption[];
};

export function FriendlyMatchForm({ clubOptions }: FriendlyMatchFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [spotsTotal, setSpotsTotal] = useState<2 | 4>(4);
  const [description, setDescription] = useState('');

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('spotsTotal', String(spotsTotal));
    formData.set('description', description);

    startTransition(async () => {
      const result = await createFriendlyMatch(formData);
      if ('error' in result) {
        if (result.error === 'unauthenticated') {
          router.push('/login?callbackUrl=/matchs-amicaux/nouveau');
          return;
        }
        setError(result.error);
        return;
      }
      router.push('/matchs-amicaux');
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border p-4 sm:p-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div>
        <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Ville *
        </label>
        <input
          name="city"
          required
          className="min-h-11 w-full rounded-xl border px-3 text-sm"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Date et heure *
        </label>
        <input
          type="datetime-local"
          name="date"
          required
          className="min-h-11 w-full rounded-xl border px-3 text-sm"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Niveau min
          </label>
          <input
            name="levelMin"
            placeholder="Ex. P100"
            className="min-h-11 w-full rounded-xl border px-3 text-sm"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Niveau max
          </label>
          <input
            name="levelMax"
            placeholder="Ex. P250"
            className="min-h-11 w-full rounded-xl border px-3 text-sm"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
          />
        </div>
      </div>

      <div>
        <span className="mb-2 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Places *
        </span>
        <div className="flex gap-2">
          {([2, 4] as const).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setSpotsTotal(n)}
              className="min-h-11 flex-1 rounded-xl text-sm font-semibold"
              style={{
                background: spotsTotal === n ? 'var(--court-700)' : 'var(--bg-muted)',
                color: spotsTotal === n ? 'var(--paper-50)' : 'var(--text-secondary)',
              }}
            >
              {n} joueurs
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Description (optionnel)
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={300}
          rows={3}
          className="w-full rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
        />
        <p className="mt-1 text-right text-xs" style={{ color: 'var(--text-muted)' }}>
          {description.length}/300
        </p>
      </div>

      {clubOptions.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Club (optionnel)
          </label>
          <select
            name="clubId"
            defaultValue=""
            className="min-h-11 w-full rounded-xl border px-3 text-sm"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
          >
            <option value="">Aucun</option>
            {clubOptions.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60"
        style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
      >
        {pending ? 'Création…' : 'Créer le match'}
      </button>
    </form>
  );
}
