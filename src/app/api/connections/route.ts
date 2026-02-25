import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const userId = await getAuthUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sent = await prisma.connectionRequest.findMany({
    where: { fromUserId: userId },
    include: { toUser: { include: { profile: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const received = await prisma.connectionRequest.findMany({
    where: { toUserId: userId },
    include: { fromUser: { include: { profile: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // All accepted connections
  const allConnections = [
    ...sent.filter((c) => c.status === 'accepted').map((c) => ({
      ...c,
      otherUser: c.toUser.profile ? {
        userId: c.toUserId,
        name: c.toUser.profile.name,
        title: c.toUser.profile.title,
        company: c.toUser.profile.company,
      } : null,
    })),
    ...received.filter((c) => c.status === 'accepted').map((c) => ({
      ...c,
      otherUser: c.fromUser.profile ? {
        userId: c.fromUserId,
        name: c.fromUser.profile.name,
        title: c.fromUser.profile.title,
        company: c.fromUser.profile.company,
      } : null,
    })),
  ];

  return NextResponse.json({
    connections: allConnections,
    sent: sent.map((c) => ({
      ...c,
      toUser: c.toUser.profile ? {
        name: c.toUser.profile.name,
        title: c.toUser.profile.title,
      } : null,
    })),
    received: received.map((c) => ({
      ...c,
      fromUser: c.fromUser.profile ? {
        name: c.fromUser.profile.name,
        title: c.fromUser.profile.title,
      } : null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { toUserId } = await req.json();
  if (!toUserId || toUserId === userId) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
  }

  // Check if request already exists
  const existing = await prisma.connectionRequest.findFirst({
    where: {
      OR: [
        { fromUserId: userId, toUserId },
        { fromUserId: toUserId, toUserId: userId },
      ],
    },
  });

  if (existing) {
    return NextResponse.json({ error: 'Connection request already exists', request: existing }, { status: 400 });
  }

  const request = await prisma.connectionRequest.create({
    data: { fromUserId: userId, toUserId },
  });

  return NextResponse.json({ request });
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { requestId, status } = await req.json();
  if (!requestId || !['accepted', 'declined'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const request = await prisma.connectionRequest.findUnique({ where: { id: requestId } });
  if (!request || request.toUserId !== userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const updated = await prisma.connectionRequest.update({
    where: { id: requestId },
    data: { status },
  });

  return NextResponse.json({ request: updated });
}
