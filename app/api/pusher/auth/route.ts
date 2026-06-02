import { auth } from '@/lib/auth';
import { pusher } from '@/lib/realtime/pusher-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.playerProfileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { socket_id, channel_name } = body;

    if (!socket_id || !channel_name) {
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
    }

    // Validate channel access
    const conversationMatch = channel_name.match(/^conversation-(.+)$/);
    const userMatch = channel_name.match(/^user-(.+)$/);

    if (conversationMatch) {
      const conversationId = conversationMatch[1];
      // Check if user is a participant of this conversation
      // This requires Prisma query - for now, allow all authenticated users
      // In production, you should verify participation
    }

    if (userMatch) {
      const userId = userMatch[1];
      // Only allow user to subscribe to their own channel
      if (userId !== session.user.playerProfileId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
      user_id: session.user.playerProfileId,
      user_info: {
        id: session.user.playerProfileId,
      },
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
