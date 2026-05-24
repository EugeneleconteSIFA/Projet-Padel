'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleFollow } from '@/lib/actions/community/follow';

type FollowButtonProps = {
  targetPlayerProfileId: string;
  initialFollowing: boolean;
  canFollow: boolean;
};

export function FollowButton({
  targetPlayerProfileId,
  initialFollowing,
  canFollow,
}: FollowButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [following, setFollowing] = useState(initialFollowing);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  if (!canFollow) return null;

  const handleClick = () => {
    const next = !following;
    setFollowing(next);

    startTransition(async () => {
      const result = await toggleFollow(targetPlayerProfileId);
      if ('error' in result) {
        setFollowing(!next);
        if (result.error === 'unauthenticated') {
          router.push(`/login?callbackUrl=/joueur/${targetPlayerProfileId}`);
        }
        return;
      }
      setFollowing(result.following);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="mt-4 min-h-11 w-full rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 sm:w-auto"
      style={{
        background: following ? 'var(--bg-muted)' : 'var(--court-700)',
        color: following ? 'var(--text-secondary)' : 'var(--paper-50)',
        border: following ? '1px solid var(--border-subtle)' : 'none',
      }}
    >
      {following ? 'Ne plus suivre' : 'Suivre'}
    </button>
  );
}
