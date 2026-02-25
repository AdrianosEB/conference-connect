import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { extractTextFromFile } from '@/lib/resume-parser';
import { getEmbedding, generateProfileSummary } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
  const userId = await getAuthUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF and DOCX files are accepted' }, { status: 400 });
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    // Check consent
    const user = await prisma.user.findUnique({ where: { id: userId } });
    // Auto-set consent on upload
    await prisma.user.update({ where: { id: userId }, data: { consentGiven: true } });

    // Save file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const fileName = `${userId}_${Date.now()}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Extract text
    const extractedText = await extractTextFromFile(buffer, file.name);

    // Get profile for name
    const profile = await prisma.profile.findUnique({ where: { userId } });
    const name = profile?.name || 'Unknown';

    // Generate summary
    const { summary, skills, keywords, industry } = await generateProfileSummary(extractedText, name);

    // Save resume
    const resume = await prisma.resume.upsert({
      where: { userId },
      create: {
        userId,
        fileUrl: `/uploads/${fileName}`,
        fileName: file.name,
        extractedText: extractedText.slice(0, 50000),
      },
      update: {
        fileUrl: `/uploads/${fileName}`,
        fileName: file.name,
        extractedText: extractedText.slice(0, 50000),
      },
    });

    // Update profile with derived fields
    const vectorText = [name, profile?.title, profile?.company, industry, profile?.interests, summary, extractedText].filter(Boolean).join(' ');
    
    const embedding = await getEmbedding(vectorText.slice(0, 10000));

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        summary,
        skillsJson: JSON.stringify(skills),
        keywordsJson: JSON.stringify(keywords),
        industry: industry || profile?.industry || '',
        vectorText: vectorText.slice(0, 10000),
        embeddingJson: JSON.stringify(embedding),
      },
    });

    return NextResponse.json({
      resume: { fileName: file.name, createdAt: resume.createdAt },
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
