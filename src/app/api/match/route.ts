import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getTopMatches } from '@/lib/matching';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = await getAuthUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
  const matches = await getTopMatches(userId, limit);

  // Add connection status to each match
  const connections = await prisma.connectionRequest.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
  });

  const matchesWithStatus = matches.map((m) => {
    const conn = connections.find(
      (c) =>
        (c.fromUserId === userId && c.toUserId === m.userId) ||
        (c.toUserId === userId && c.fromUserId === m.userId)
    );
    return { ...m, connectionStatus: conn?.status || null };
  });

  return NextResponse.json({ matches: matchesWithStatus });
}
