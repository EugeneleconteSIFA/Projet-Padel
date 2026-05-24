'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createPost } from '@/lib/actions/community/create-post';

type ClubOption = { id: string; name: string };

type NewPostFormProps = {
  clubOptions: ClubOption[];
};

export function NewPostForm({ clubOptions }: NewPostFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'FRIENDS' | 'CLUB'>('PUBLIC');
  const [clubId, setClubId] = useState(clubOptions[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('content', content);
    formData.set('visibility', visibility);
    if (visibility === 'CLUB') formData.set('clubId', clubId);

    startTransition(async () => {
      const result = await createPost(formData);
      if ('error' in result) {
        if (result.error === 'unauthenticated') {
          router.push('/login?callbackUrl=/mon-feed');
          return;
        }
        setError(result.error);
        return;
      }
      setContent('');
      form.reset();
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={submit}
      className="mb-6 rounded-2xl border p-4 sm:p-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Publier
      </h2>

      <textarea
        name="content"
        value={content}
        onChange={e => setContent(e.target.value)}
        maxLength={500}
        rows={4}
        placeholder="Partage un moment de jeu…"
        className="mb-1 w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-page)',
          color: 'var(--text-primary)',
        }}
        required
      />
      <p className="mb-3 text-right text-xs" style={{ color: 'var(--text-muted)' }}>
        {content.length}/500
      </p>

      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Photo (optionnel, max 5 Mo)
        </label>
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full min-h-11 text-sm file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-2 file:text-sm file:font-medium"
          style={{ color: 'var(--text-secondary)' }}
        />
        {/* V2: débloquer VIDEO ici */}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {(['PUBLIC', 'FRIENDS', 'CLUB'] as const).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setVisibility(v)}
            className="min-h-11 rounded-xl px-4 py-2 text-sm font-medium transition"
            style={{
              background: visibility === v ? 'var(--court-700)' : 'var(--bg-muted)',
              color: visibility === v ? 'var(--paper-50)' : 'var(--text-secondary)',
            }}
          >
            {v === 'PUBLIC' ? 'Public' : v === 'FRIENDS' ? 'Cercle' : 'Club'}
          </button>
        ))}
      </div>

      {visibility === 'CLUB' && (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Club
          </label>
          {clubOptions.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Aucun club actif — rejoins un club pour publier en visibilité club.
            </p>
          ) : (
            <select
              value={clubId}
              onChange={e => setClubId(e.target.value)}
              className="min-h-11 w-full rounded-xl border px-3 text-sm"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
              required
            >
              {clubOptions.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {error && (
        <p className="mb-3 text-sm" style={{ color: 'var(--error, #b91c1c)' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || (visibility === 'CLUB' && clubOptions.length === 0)}
        className="min-h-11 w-full rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 sm:w-auto"
        style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
      >
        {pending ? 'Publication…' : 'Publier'}
      </button>
    </form>
  );
}
