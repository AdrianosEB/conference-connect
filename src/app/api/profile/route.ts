import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { getEmbedding } from '@/lib/embeddings';

export async function GET() {
  const userId = await getAuthUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, resume: true },
  });

  return NextResponse.json({
    profile: user?.profile || null,
    resume: user?.resume ? { fileName: user.resume.fileName, createdAt: user.resume.createdAt } : null,
    consent: user?.consentGiven || false,
  });
}

export async function PUT(req: NextRequest) {
  const userId = await getAuthUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, title, company, industry, interests, linkedinUrl } = body;

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      name: name || '',
      title: title || '',
      company: company || '',
      industry: industry || '',
      interests: interests || '',
      linkedinUrl: linkedinUrl || '',
      vectorText: [name, title, company, industry, interests].filter(Boolean).join(' '),
    },
    update: {
      ...(name !== undefined && { name }),
      ...(title !== undefined && { title }),
      ...(company !== undefined && { company }),
      ...(industry !== undefined && { industry }),
      ...(interests !== undefined && { interests }),
      ...(linkedinUrl !== undefined && { linkedinUrl }),
    },
  });

  // Update vector text and embedding
  const vectorText = [profile.name, profile.title, profile.company, profile.industry, profile.interests, profile.summary].filter(Boolean).join(' ');
  
  // Also include resume text if available
  const resume = await prisma.resume.findUnique({ where: { userId } });
  const fullText = resume ? `${vectorText} ${resume.extractedText}` : vectorText;

  try {
    const embedding = await getEmbedding(fullText);
    await prisma.profile.update({
      where: { userId },
      data: {
        vectorText: fullText.slice(0, 10000),
        embeddingJson: JSON.stringify(embedding),
      },
    });
  } catch {}

  return NextResponse.json({ profile });
}
