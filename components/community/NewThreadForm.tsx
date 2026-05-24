'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { ForumCategory } from '@prisma/client';
import { createThread } from '@/lib/actions/community/forum';
import { categoryToSlug } from '@/lib/community/forum-categories';

type NewThreadFormProps = {
  category: ForumCategory;
};

export function NewThreadForm({ category }: NewThreadFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title') ?? '');
    const content = String(fd.get('content') ?? '');
    const tagsRaw = String(fd.get('tags') ?? '');
    const tags = tagsRaw
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        const result = await createThread({ category, title, content, tags });
        if (result && 'error' in result) {
          if (result.error === 'unauthenticated') {
            router.push(`/login?callbackUrl=/forum/${categoryToSlug(category)}`);
            return;
          }
          setError(result.error);
        }
      } catch {
        // redirect() lance une exception — succès
      }
    });
  };

  return (
    <form
      onSubmit={submit}
      className="mb-6 rounded-2xl border p-4"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Nouveau sujet
      </h2>
      <input
        name="title"
        required
        maxLength={200}
        placeholder="Titre du sujet"
        className="mb-2 min-h-11 w-full rounded-xl border px-3 text-sm"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
      />
      <textarea
        name="content"
        required
        rows={5}
        maxLength={5000}
        placeholder="Décris ton sujet…"
        className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
      />
      <input
        name="tags"
        placeholder="Tags (séparés par des virgules)"
        className="mb-3 min-h-11 w-full rounded-xl border px-3 text-sm"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
      />
      {error && <p className="mb-2 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
      >
        {pending ? 'Publication…' : 'Publier'}
      </button>
    </form>
  );
}
