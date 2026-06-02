import PusherJS from 'pusher-js';

const globalForPusherClient = globalThis as unknown as { pusherClient?: PusherJS };

export const pusherClient =
  globalForPusherClient.pusherClient ??
  new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
  });

if (process.env.NODE_ENV !== 'production') globalForPusherClient.pusherClient = pusherClient;
