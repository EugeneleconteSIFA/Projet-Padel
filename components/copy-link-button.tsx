'use client';

import { useState } from 'react';

export function CopyLinkButton({
  icon,
}: {
  icon: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard refusé ou indisponible */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 text-xs font-medium transition hover:opacity-80"
      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
    >
      {icon}
      {copied ? 'Copié !' : 'Copier le lien'}
    </button>
  );
}
