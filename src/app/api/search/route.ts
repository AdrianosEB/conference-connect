import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { searchByIntent } from '@/lib/matching';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  const userId = await getAuthUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { query } = await req.json();
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const results = await searchByIntent(userId, query, 10);

  // Add connection status
  const connections = await prisma.connectionRequest.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
  });

  const resultsWithStatus = results.map((m) => {
    const conn = connections.find(
      (c) =>
        (c.fromUserId === userId && c.toUserId === m.userId) ||
        (c.toUserId === userId && c.fromUserId === m.userId)
    );
    return { ...m, connectionStatus: conn?.status || null };
  });

  return NextResponse.json({ results: resultsWithStatus });
}
