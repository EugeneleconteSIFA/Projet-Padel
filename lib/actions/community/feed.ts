'use server';

import {
  fetchPrivateFeedPosts,
  fetchPublicFeedPosts,
  type FeedCursor,
} from '@/lib/community/posts';

export async function loadMoreFeedPosts(cursor: FeedCursor) {
  return fetchPublicFeedPosts(cursor);
}

export async function loadMorePrivateFeedPosts(cursor: FeedCursor) {
  return fetchPrivateFeedPosts(cursor);
}
