import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { getEmbedding } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            name,
            vectorText: name,
          },
        },
      },
    });

    // Generate initial embedding
    try {
      const embedding = await getEmbedding(name);
      await prisma.profile.update({
        where: { userId: user.id },
        data: { embeddingJson: JSON.stringify(embedding) },
      });
    } catch {}

    const token = await createToken(user.id);
    setAuthCookie(token);

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
