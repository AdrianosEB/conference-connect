# Conference Connect 🤝

A networking web app for conferences — find your perfect connections using AI-powered matching.

## Features

- **Resume Upload & AI Parsing**: Upload PDF/DOCX resumes, auto-extract skills, industry, and generate summaries
- **Smart Matching**: AI-powered Top 10 recommendations based on profile + resume similarity
- **Intent Search**: Natural language search ("product leaders in fintech") returns ranked matches with explanations
- **Connection Requests**: Send, accept, and decline connection requests
- **Direct Messaging**: 1:1 messaging between connected users
- **Post Feed**: Share updates with the conference community
- **Demo Mode**: Pre-seeded with 10 realistic users so you can explore immediately

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma + SQLite (dev) / PostgreSQL (production)
- **Auth**: Custom JWT-based authentication
- **AI**: OpenAI embeddings (with TF-IDF fallback when no API key)
- **File Parsing**: pdf-parse + mammoth (DOCX)

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd conference-connect
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
- `JWT_SECRET`: Change to a random string (run `openssl rand -base64 32`)
- `OPENAI_API_KEY`: (Optional) Add for AI-powered embeddings. App works without it using keyword matching.

### 3. Setup Database & Seed

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

Or run everything at once:
```bash
npm run setup
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### Demo Login

All demo accounts use password: **password123**

| Email | Name | Role |
|-------|------|------|
| demo1@example.com | Sarah Chen | VP of Product @ FinanceAI |
| demo2@example.com | Marcus Johnson | Senior Data Scientist @ ClimaTech |
| demo3@example.com | Priya Patel | Engineering Manager @ HealthOS |
| demo4@example.com | Alex Rivera | Founding Partner @ Horizon Ventures |
| demo5@example.com | Emma Nakamura | Head of AI Research @ LangTech |

...and 5 more demo users across Marketing, EdTech, Blockchain, UX, and Operations.

## Deploy to Vercel

1. Push code to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add env vars: `DATABASE_URL` (Postgres), `JWT_SECRET`, `OPENAI_API_KEY` (optional)
4. Change `prisma/schema.prisma` provider to `"postgresql"` for production
5. Deploy!

For free Postgres hosting, use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app).

## How Matching Works

1. Profile + Resume text → concatenated vector text
2. Embedding via OpenAI `text-embedding-3-small` (or TF-IDF fallback)
3. Cosine similarity between all user embeddings
4. Top N results returned with "why this match" explanations

## Privacy

- Raw resume text is **never shared** with other users
- Only derived fields (skills, summary, industry) are visible
- Users must consent before uploading

## License

MIT
