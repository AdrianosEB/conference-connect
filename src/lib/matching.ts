import prisma from './db';
import { getEmbedding, cosineSimilarity, generateMatchExplanation } from './embeddings';

export interface MatchResult {
  userId: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  summary: string;
  skills: string[];
  avatarUrl: string;
  score: number;
  reasons: string[];
}

export async function getTopMatches(
  userId: string,
  limit: number = 10
): Promise<MatchResult[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user?.profile) return [];

  const userEmbedding = user.profile.embeddingJson
    ? JSON.parse(user.profile.embeddingJson)
    : null;

  if (!userEmbedding || userEmbedding.length === 0) return [];

  const allProfiles = await prisma.profile.findMany({
    where: { userId: { not: userId } },
  });

  const scored: MatchResult[] = [];

  for (const p of allProfiles) {
    const pEmbedding = p.embeddingJson ? JSON.parse(p.embeddingJson) : null;
    if (!pEmbedding || pEmbedding.length === 0) continue;

    const score = cosineSimilarity(userEmbedding, pEmbedding);
    const reasons = generateMatchExplanation(
      { skillsJson: user.profile.skillsJson, keywordsJson: user.profile.keywordsJson, industry: user.profile.industry },
      { skillsJson: p.skillsJson, keywordsJson: p.keywordsJson, industry: p.industry, name: p.name }
    );

    scored.push({
      userId: p.userId,
      name: p.name,
      title: p.title,
      company: p.company,
      industry: p.industry,
      summary: p.summary,
      skills: JSON.parse(p.skillsJson || '[]'),
      avatarUrl: p.avatarUrl,
      score,
      reasons,
    });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function searchByIntent(
  userId: string,
  query: string,
  limit: number = 10
): Promise<MatchResult[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user?.profile) return [];

  const queryEmbedding = await getEmbedding(query);

  const allProfiles = await prisma.profile.findMany({
    where: { userId: { not: userId } },
  });

  const scored: MatchResult[] = [];

  for (const p of allProfiles) {
    const pEmbedding = p.embeddingJson ? JSON.parse(p.embeddingJson) : null;
    if (!pEmbedding || pEmbedding.length === 0) continue;

    const score = cosineSimilarity(queryEmbedding, pEmbedding);
    const reasons = generateMatchExplanation(
      { skillsJson: user.profile.skillsJson, keywordsJson: user.profile.keywordsJson, industry: user.profile.industry },
      { skillsJson: p.skillsJson, keywordsJson: p.keywordsJson, industry: p.industry, name: p.name }
    );

    scored.push({
      userId: p.userId,
      name: p.name,
      title: p.title,
      company: p.company,
      industry: p.industry,
      summary: p.summary,
      skills: JSON.parse(p.skillsJson || '[]'),
      avatarUrl: p.avatarUrl,
      score,
      reasons,
    });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getThreadKey(userA: string, userB: string): string {
  return [userA, userB].sort().join('_');
}
