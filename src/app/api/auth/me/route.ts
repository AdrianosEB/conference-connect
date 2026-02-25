import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found', user: null }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        userId: user.id,
        email: user.email,
        name: user.profile?.name || '',
        title: user.profile?.title || '',
        company: user.profile?.company || '',
        hasProfile: !!user.profile?.title,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal error', user: null }, { status: 500 });
  }
}
