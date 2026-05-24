'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useTransition } from 'react';
import { createReply } from '@/lib/actions/community/forum';

type ReplyFormProps = {
  threadId: string;
  categorySlug: string;
  parentId?: string;
  placeholder?: string;
};

export function ReplyForm({
  threadId,
  categorySlug,
  parentId,
  placeholder = 'Ta réponse…',
}: ReplyFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const content = new FormData(form).get('content');
    if (typeof content !== 'string' || !content.trim()) return;

    startTransition(async () => {
      const result = await createReply({
        threadId,
        categorySlug,
        parentId,
        content,
      });
      if ('error' in result) {
        if (result.error === 'unauthenticated') {
          router.push(`/login?callbackUrl=/forum/${categorySlug}/${threadId}`);
          return;
        }
        alert(result.error);
        return;
      }
      form.reset();
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        name="content"
        rows={3}
        required
        maxLength={5000}
        placeholder={placeholder}
        className="w-full rounded-xl border px-3 py-2.5 text-sm"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-page)' }}
      />
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        style={{ background: 'var(--court-700)', color: 'var(--paper-50)' }}
      >
        {pending ? 'Envoi…' : 'Répondre'}
      </button>
    </form>
  );
}
