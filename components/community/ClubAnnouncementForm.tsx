'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createClubAnnouncement } from '@/lib/actions/community/club-community';

type ClubAnnouncementFormProps = {
  clubId: string;
  clubSlug: string;
};

export function ClubAnnouncementForm({ clubId, clubSlug }: ClubAnnouncementFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('content', content);

    startTransition(async () => {
      const result = await createClubAnnouncement(clubId, clubSlug, formData);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      setContent('');
      e.currentTarget.reset();
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={submit}
      className="mb-6 rounded-2xl border p-4 sm:p-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--gold-600)' }}>
        Publier une annonce
      </h2>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Message aux membres du club…"
        className="mb-2 w-full resize-none rounded-xl border px-3 py-2.5 text-sm"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
        required
      />
      <input
        type="file"
        name="image"
        accept="image/jpeg,image/png,image/webp"
        className="mb-3 block w-full min-h-11 text-sm file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-2"
      />
      {/* V2: débloquer VIDEO ici */}
      {error && <p className="mb-2 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        style={{ background: 'var(--gold-500)', color: 'var(--ink-950)' }}
      >
        {pending ? 'Publication…' : 'Publier l\'annonce'}
      </button>
    </form>
  );
}
