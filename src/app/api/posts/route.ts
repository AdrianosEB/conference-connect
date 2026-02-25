import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = await getAuthUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const feed = req.nextUrl.searchParams.get('feed') || 'global';

  let where = {};

  if (feed === 'connections') {
    // Get connected user IDs
    const connections = await prisma.connectionRequest.findMany({
      where: {
        status: 'accepted',
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
    });
    const connectedIds = connections.map((c) =>
      c.fromUserId === userId ? c.toUserId : c.fromUserId
    );
    connectedIds.push(userId); // Include own posts
    where = { userId: { in: connectedIds } };
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      user: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      userId: p.userId,
      body: p.body,
      linkUrl: p.linkUrl,
      createdAt: p.createdAt.toISOString(),
      user: p.user.profile
        ? {
            name: p.user.profile.name,
            title: p.user.profile.title,
            company: p.user.profile.company,
            avatarUrl: p.user.profile.avatarUrl,
          }
        : null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { body, linkUrl } = await req.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: 'Post body is required' }, { status: 400 });
  }

  // Validate URL if provided
  if (linkUrl) {
    try {
      new URL(linkUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
  }

  const post = await prisma.post.create({
    data: {
      userId,
      body: body.trim(),
      linkUrl: linkUrl || '',
    },
  });

  return NextResponse.json({ post });
}
