import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { getThreadKey } from '@/lib/matching';

export async function GET(req: NextRequest) {
  const userId = await getAuthUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const threadKey = req.nextUrl.searchParams.get('threadKey');

  if (threadKey) {
    // Verify user is part of thread
    if (!threadKey.includes(userId)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { threadKey },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json({ messages });
  }

  // List all threads
  const allMessages = await prisma.message.findMany({
    where: {
      threadKey: { contains: userId },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by thread
  const threadMap = new Map<string, any>();
  for (const msg of allMessages) {
    if (!threadMap.has(msg.threadKey)) {
      const otherUserId = msg.threadKey.split('_').find((id) => id !== userId);
      const otherProfile = otherUserId
        ? await prisma.profile.findUnique({ where: { userId: otherUserId } })
        : null;

      threadMap.set(msg.threadKey, {
        threadKey: msg.threadKey,
        lastMessage: msg.body.slice(0, 100),
        lastMessageAt: msg.createdAt,
        otherUser: otherProfile
          ? {
              userId: otherUserId,
              name: otherProfile.name,
              title: otherProfile.title,
              avatarUrl: otherProfile.avatarUrl,
            }
          : null,
      });
    }
  }

  return NextResponse.json({ threads: Array.from(threadMap.values()) });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { toUserId, body } = await req.json();
  if (!toUserId || !body?.trim()) {
    return NextResponse.json({ error: 'toUserId and body are required' }, { status: 400 });
  }

  // Check they're connected
  const connection = await prisma.connectionRequest.findFirst({
    where: {
      status: 'accepted',
      OR: [
        { fromUserId: userId, toUserId },
        { fromUserId: toUserId, toUserId: userId },
      ],
    },
  });

  if (!connection) {
    return NextResponse.json({ error: 'You must be connected to message this user' }, { status: 403 });
  }

  const threadKey = getThreadKey(userId, toUserId);

  const message = await prisma.message.create({
    data: {
      threadKey,
      fromUserId: userId,
      body: body.trim(),
    },
  });

  return NextResponse.json({ message });
}
