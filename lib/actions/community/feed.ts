'use server';

import { fetchPublicFeedPosts, type FeedCursor } from '@/lib/community/posts';

export async function loadMoreFeedPosts(cursor: FeedCursor) {
  return fetchPublicFeedPosts(cursor);
}
