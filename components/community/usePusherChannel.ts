'use client';

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/realtime/pusher-client';
import { CHANNELS } from '@/lib/realtime/channels';

export function usePusherChannel(channelName: string) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channel = pusherClient.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
    });

    channel.bind('pusher:subscription_error', () => {
      setIsConnected(false);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [channelName]);

  return { isConnected, channel: pusherClient.channel(channelName) };
}
