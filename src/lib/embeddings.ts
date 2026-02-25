import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (openai) return openai;
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai;
  }
  return null;
}

// --- OpenAI Embeddings ---
export async function getEmbedding(text: string): Promise<number[]> {
  const client = getOpenAI();
  if (client) {
    try {
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000),
      });
      return response.data[0].embedding;
    } catch (e) {
      console.warn('OpenAI embedding failed, using fallback:', e);
    }
  }
  return tfidfVector(text);
}

// --- TF-IDF Fallback ---
const VOCAB_SIZE = 500;
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both',
  'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than',
  'too', 'very', 'just', 'because', 'if', 'when', 'where', 'how', 'what',
  'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'i', 'me',
  'my', 'myself', 'we', 'our', 'ours', 'you', 'your', 'he', 'him', 'his',
  'she', 'her', 'it', 'its', 'they', 'them', 'their', 'about', 'also',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function tfidfVector(text: string): number[] {
  const tokens = tokenize(text);
  const freq: Record<string, number> = {};
  for (const t of tokens) {
    freq[t] = (freq[t] || 0) + 1;
  }
  // Simple hash-based vectorization
  const vec = new Array(VOCAB_SIZE).fill(0);
  for (const [word, count] of Object.entries(freq)) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash + word.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % VOCAB_SIZE;
    vec[idx] += count / tokens.length;
  }
  // Normalize
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  }
  return vec;
}

// --- Similarity ---
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// --- AI Summary Generation ---
export async function generateProfileSummary(
  text: string,
  name: string
): Promise<{ summary: string; skills: string[]; keywords: string[]; industry: string }> {
  const client = getOpenAI();
  if (client) {
    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Extract structured info from this resume/profile text. Return JSON only.',
          },
          {
            role: 'user',
            content: `Extract from this text:\n\n${text.slice(0, 4000)}\n\nReturn JSON: {"summary": "1-2 sentence professional summary for ${name}", "skills": ["skill1","skill2",...up to 10], "keywords": ["keyword1",...up to 10], "industry": "primary industry"}`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
      });
      const parsed = JSON.parse(response.choices[0].message.content || '{}');
      return {
        summary: parsed.summary || '',
        skills: parsed.skills || [],
        keywords: parsed.keywords || [],
        industry: parsed.industry || '',
      };
    } catch (e) {
      console.warn('OpenAI summary failed, using fallback:', e);
    }
  }
  return fallbackExtract(text);
}

function fallbackExtract(text: string) {
  const tokens = tokenize(text);
  const freq: Record<string, number> = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  const techSkills = [
    'javascript', 'typescript', 'python', 'react', 'node', 'aws', 'docker',
    'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql', 'redis', 'graphql',
    'rest', 'api', 'machine', 'learning', 'data', 'science', 'analytics',
    'product', 'management', 'design', 'ux', 'ui', 'marketing', 'sales',
    'finance', 'fintech', 'healthcare', 'education', 'climate', 'energy',
    'blockchain', 'crypto', 'ai', 'ml', 'nlp', 'devops', 'security',
    'cloud', 'saas', 'b2b', 'b2c', 'startup', 'enterprise', 'consulting',
    'strategy', 'operations', 'engineering', 'software', 'hardware',
    'mobile', 'ios', 'android', 'flutter', 'swift', 'kotlin', 'java',
    'golang', 'rust', 'scala', 'ruby', 'php', 'vue', 'angular', 'next',
  ];

  const skills = sorted.filter((w) => techSkills.includes(w)).slice(0, 10);
  const keywords = sorted.slice(0, 10);

  const industries = [
    'technology', 'finance', 'healthcare', 'education', 'energy',
    'consulting', 'marketing', 'manufacturing', 'retail', 'media',
  ];
  const industry = sorted.find((w) => industries.includes(w)) || 'technology';

  return {
    summary: `Professional with expertise in ${skills.slice(0, 3).join(', ') || 'various fields'}.`,
    skills,
    keywords,
    industry,
  };
}

// --- Match Explanation ---
export function generateMatchExplanation(
  userProfile: { skillsJson: string; keywordsJson: string; industry: string },
  matchProfile: { skillsJson: string; keywordsJson: string; industry: string; name: string }
): string[] {
  const userSkills: string[] = JSON.parse(userProfile.skillsJson || '[]');
  const matchSkills: string[] = JSON.parse(matchProfile.skillsJson || '[]');
  const userKeywords: string[] = JSON.parse(userProfile.keywordsJson || '[]');
  const matchKeywords: string[] = JSON.parse(matchProfile.keywordsJson || '[]');

  const reasons: string[] = [];

  const sharedSkills = userSkills.filter((s) => matchSkills.includes(s));
  if (sharedSkills.length > 0) {
    reasons.push(`Shared skills: ${sharedSkills.slice(0, 4).join(', ')}`);
  }

  if (userProfile.industry && matchProfile.industry && 
      userProfile.industry.toLowerCase() === matchProfile.industry.toLowerCase()) {
    reasons.push(`Both work in ${matchProfile.industry}`);
  }

  const sharedKeywords = userKeywords.filter((k) => matchKeywords.includes(k));
  if (sharedKeywords.length > 0) {
    reasons.push(`Common interests: ${sharedKeywords.slice(0, 4).join(', ')}`);
  }

  if (reasons.length === 0) {
    reasons.push(`${matchProfile.name} has complementary expertise that could spark great conversations`);
  }

  return reasons.slice(0, 3);
}
