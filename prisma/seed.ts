import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    email: 'demo1@example.com',
    name: 'Sarah Chen',
    title: 'VP of Product',
    company: 'FinanceAI',
    industry: 'Finance',
    interests: 'AI/ML, fintech, product strategy, user research',
    summary: 'Experienced product leader driving AI-powered financial products. Passionate about making finance accessible through technology.',
    skills: ['product management', 'ai', 'fintech', 'user research', 'strategy', 'roadmapping', 'agile'],
    keywords: ['product', 'finance', 'ai', 'fintech', 'strategy', 'leadership', 'user experience'],
    resumeText: 'Sarah Chen VP of Product at FinanceAI. 12 years experience in product management across fintech and enterprise SaaS. Led teams building AI-powered credit scoring, fraud detection, and personal finance tools. Previously at Stripe and Square. Stanford MBA. Expertise in product strategy, user research, go-to-market, and cross-functional leadership. Passionate about financial inclusion and AI ethics.',
  },
  {
    email: 'demo2@example.com',
    name: 'Marcus Johnson',
    title: 'Senior Data Scientist',
    company: 'ClimaTech',
    industry: 'Energy',
    interests: 'climate tech, machine learning, sustainability, renewable energy',
    summary: 'Data scientist applying ML to climate and energy problems. Building models for renewable energy optimization and carbon tracking.',
    skills: ['python', 'machine learning', 'data science', 'tensorflow', 'climate', 'energy', 'statistics'],
    keywords: ['data', 'machine learning', 'climate', 'energy', 'sustainability', 'python', 'modeling'],
    resumeText: 'Marcus Johnson Senior Data Scientist at ClimaTech. PhD in Environmental Data Science from MIT. Specializes in applying machine learning to climate change problems. Built predictive models for solar and wind energy output optimization. Experience with satellite imagery analysis for deforestation tracking. Published researcher in Nature Climate Change. Skills: Python, TensorFlow, PyTorch, SQL, GIS, time series analysis.',
  },
  {
    email: 'demo3@example.com',
    name: 'Priya Patel',
    title: 'Engineering Manager',
    company: 'HealthOS',
    industry: 'Healthcare',
    interests: 'healthtech, engineering leadership, distributed systems, HIPAA compliance',
    summary: 'Engineering leader building secure, scalable healthcare platforms. Focus on interoperability and patient data privacy.',
    skills: ['engineering management', 'healthcare', 'distributed systems', 'kubernetes', 'security', 'hipaa', 'golang'],
    keywords: ['engineering', 'healthcare', 'security', 'distributed systems', 'leadership', 'hipaa', 'platform'],
    resumeText: 'Priya Patel Engineering Manager at HealthOS. 10 years in software engineering, 4 in management. Building HIPAA-compliant healthcare data platforms serving 50M patients. Previously at Epic Systems and Google Health. Expertise in distributed systems, microservices, Kubernetes, and healthcare interoperability standards (FHIR, HL7). UC Berkeley CS degree.',
  },
  {
    email: 'demo4@example.com',
    name: 'Alex Rivera',
    title: 'Founding Partner',
    company: 'Horizon Ventures',
    industry: 'Finance',
    interests: 'venture capital, AI startups, B2B SaaS, deep tech investing',
    summary: 'VC investor focused on early-stage AI and deep tech companies. Led investments in 30+ startups with 4 unicorn outcomes.',
    skills: ['venture capital', 'investing', 'ai', 'saas', 'due diligence', 'fundraising', 'strategy'],
    keywords: ['venture capital', 'investing', 'ai', 'startups', 'saas', 'fundraising', 'deep tech'],
    resumeText: 'Alex Rivera Founding Partner at Horizon Ventures. $500M fund focused on Series A and B investments in AI, enterprise SaaS, and deep tech. Previously Principal at a16z and Associate at Sequoia. MBA from Wharton. Led investments in 30+ companies including 4 that reached unicorn status. Board member at multiple AI startups. Interested in: AI infrastructure, developer tools, vertical SaaS, robotics.',
  },
  {
    email: 'demo5@example.com',
    name: 'Emma Nakamura',
    title: 'Head of AI Research',
    company: 'LangTech',
    industry: 'Technology',
    interests: 'NLP, large language models, AI safety, responsible AI',
    summary: 'Leading AI research team building next-generation language understanding systems. Published 40+ papers on NLP and AI safety.',
    skills: ['nlp', 'machine learning', 'python', 'transformers', 'ai safety', 'research', 'deep learning'],
    keywords: ['nlp', 'language models', 'ai', 'research', 'transformers', 'safety', 'deep learning'],
    resumeText: 'Emma Nakamura Head of AI Research at LangTech. PhD from Stanford in NLP. 40+ published papers including top venues (NeurIPS, ICML, ACL). Leading a team of 25 researchers building large language models and studying AI alignment. Previously Research Scientist at DeepMind. Focus areas: language understanding, reasoning, AI safety, and responsible deployment of foundation models.',
  },
  {
    email: 'demo6@example.com',
    name: 'David Okonkwo',
    title: 'Chief Marketing Officer',
    company: 'GrowthStack',
    industry: 'Marketing',
    interests: 'growth marketing, PLG, content strategy, B2B marketing',
    summary: 'CMO scaling B2B SaaS through product-led growth and data-driven marketing. Grew ARR from $5M to $80M.',
    skills: ['marketing', 'growth', 'plg', 'content strategy', 'analytics', 'branding', 'demand generation'],
    keywords: ['marketing', 'growth', 'saas', 'plg', 'content', 'demand generation', 'branding'],
    resumeText: 'David Okonkwo CMO at GrowthStack. 15 years in B2B marketing leadership. Scaled GrowthStack from $5M to $80M ARR through product-led growth strategy. Previously VP Marketing at HubSpot and Director at Salesforce. Expert in demand generation, content marketing, brand building, and marketing analytics. Speaker at SaaStr and Dreamforce.',
  },
  {
    email: 'demo7@example.com',
    name: 'Lisa Wang',
    title: 'CTO',
    company: 'EduNext',
    industry: 'Education',
    interests: 'edtech, AI tutoring, personalized learning, accessibility',
    summary: 'CTO building AI-powered personalized learning platform reaching 2M students. Passionate about education equity.',
    skills: ['engineering', 'ai', 'edtech', 'react', 'python', 'aws', 'system design'],
    keywords: ['education', 'ai', 'personalized learning', 'engineering', 'accessibility', 'edtech', 'tutoring'],
    resumeText: 'Lisa Wang CTO at EduNext. Building AI-powered adaptive learning platform serving 2M+ students. 18 years in engineering, previously VP Engineering at Coursera and Staff Engineer at Google. Expertise in recommendation systems, personalized learning algorithms, and scalable web platforms. UC Berkeley CS + Education dual degree. Focus on making quality education accessible globally.',
  },
  {
    email: 'demo8@example.com',
    name: 'James Mitchell',
    title: 'Blockchain Lead',
    company: 'DeFi Protocol',
    industry: 'Finance',
    interests: 'blockchain, DeFi, smart contracts, tokenomics, web3',
    summary: 'Building decentralized finance infrastructure. Leading development of lending and governance protocols.',
    skills: ['solidity', 'blockchain', 'defi', 'smart contracts', 'ethereum', 'rust', 'tokenomics'],
    keywords: ['blockchain', 'defi', 'smart contracts', 'web3', 'ethereum', 'crypto', 'finance'],
    resumeText: 'James Mitchell Blockchain Lead at DeFi Protocol. 8 years in blockchain development. Built lending protocols with $500M TVL. Previously at Coinbase and ConsenSys. Expert in Solidity, Rust, smart contract security, and DeFi mechanism design. Ethereum core contributor. Published research on MEV and governance token economics.',
  },
  {
    email: 'demo9@example.com',
    name: 'Rachel Kim',
    title: 'Director of UX',
    company: 'DesignCraft',
    industry: 'Technology',
    interests: 'UX design, design systems, accessibility, AI-assisted design',
    summary: 'Design leader building world-class user experiences. Expert in design systems, accessibility, and emerging AI design tools.',
    skills: ['ux design', 'design systems', 'accessibility', 'figma', 'user research', 'prototyping', 'leadership'],
    keywords: ['design', 'ux', 'accessibility', 'design systems', 'user research', 'figma', 'ai design'],
    resumeText: 'Rachel Kim Director of UX at DesignCraft. 12 years in design leadership. Built and scaled design systems used by 500+ designers. Previously at Airbnb and Apple. Expert in accessibility (WCAG 2.1), inclusive design, and design operations. Exploring AI-assisted design workflows. RISD graduate. Speaker at Config, DesignOps Summit.',
  },
  {
    email: 'demo10@example.com',
    name: 'Omar Hassan',
    title: 'Head of Operations',
    company: 'LogiFlow',
    industry: 'Manufacturing',
    interests: 'supply chain, automation, IoT, operations excellence',
    summary: 'Operations leader automating supply chains with IoT and AI. Reduced logistics costs by 40% through intelligent optimization.',
    skills: ['operations', 'supply chain', 'iot', 'automation', 'logistics', 'lean', 'six sigma'],
    keywords: ['operations', 'supply chain', 'automation', 'iot', 'logistics', 'manufacturing', 'optimization'],
    resumeText: 'Omar Hassan Head of Operations at LogiFlow. 14 years in operations and supply chain management. Implemented IoT-based warehouse automation reducing costs by 40%. Previously at Amazon Logistics and McKinsey. Lean Six Sigma Black Belt. Expertise in demand forecasting, inventory optimization, and last-mile delivery. MBA from INSEAD.',
  },
];

// Simple hash-based embedding fallback for seeding
function simpleEmbedding(text: string): number[] {
  const VOCAB_SIZE = 500;
  const STOP_WORDS = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'and', 'but', 'or', 'not', 'so', 'yet', 'both', 'either', 'each', 'every', 'all', 'any', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'about']);
  
  const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const freq: Record<string, number> = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  
  const vec = new Array(VOCAB_SIZE).fill(0);
  for (const [word, count] of Object.entries(freq)) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash + word.charCodeAt(i)) | 0;
    }
    vec[Math.abs(hash) % VOCAB_SIZE] += count / tokens.length;
  }
  const norm = Math.sqrt(vec.reduce((s: number, v: number) => s + v * v, 0));
  if (norm > 0) for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  return vec;
}

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  for (const demo of DEMO_USERS) {
    const vectorText = [demo.name, demo.title, demo.company, demo.industry, demo.interests, demo.summary, demo.resumeText].join(' ');
    const embedding = simpleEmbedding(vectorText);

    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {},
      create: {
        email: demo.email,
        passwordHash,
        consentGiven: true,
        profile: {
          create: {
            name: demo.name,
            title: demo.title,
            company: demo.company,
            industry: demo.industry,
            interests: demo.interests,
            summary: demo.summary,
            skillsJson: JSON.stringify(demo.skills),
            keywordsJson: JSON.stringify(demo.keywords),
            vectorText: vectorText.slice(0, 10000),
            embeddingJson: JSON.stringify(embedding),
          },
        },
        resume: {
          create: {
            fileUrl: '',
            fileName: 'demo-resume.pdf',
            extractedText: demo.resumeText,
            embeddingJson: JSON.stringify(embedding),
          },
        },
      },
    });

    console.log(`  ✓ ${demo.name} (${demo.email})`);
  }

  // Create some sample posts
  const users = await prisma.user.findMany({ take: 5, include: { profile: true } });
  
  const samplePosts = [
    { body: 'Excited to be at Conference Connect! Looking forward to meeting fellow product leaders and AI enthusiasts. Who else is working on LLM applications?', linkUrl: '' },
    { body: 'Just published our research on sustainable AI training — reducing compute costs by 60% while maintaining model quality. Happy to discuss with anyone interested!', linkUrl: 'https://arxiv.org' },
    { body: 'We\'re hiring! Looking for senior engineers passionate about healthcare tech. HIPAA experience a plus but not required. DM me!', linkUrl: '' },
    { body: 'Great panel on the future of fintech regulation. Key takeaway: compliance can be a competitive advantage if you build it into your product DNA.', linkUrl: '' },
    { body: 'Anyone interested in a lunch meetup to discuss climate tech investing? Thinking noon at the main conference hall café.', linkUrl: '' },
  ];

  for (let i = 0; i < Math.min(samplePosts.length, users.length); i++) {
    await prisma.post.create({
      data: {
        userId: users[i].id,
        body: samplePosts[i].body,
        linkUrl: samplePosts[i].linkUrl,
      },
    });
  }

  // Create some connections between demo users
  if (users.length >= 4) {
    await prisma.connectionRequest.create({
      data: { fromUserId: users[0].id, toUserId: users[1].id, status: 'accepted' },
    }).catch(() => {});
    await prisma.connectionRequest.create({
      data: { fromUserId: users[0].id, toUserId: users[3].id, status: 'accepted' },
    }).catch(() => {});
    await prisma.connectionRequest.create({
      data: { fromUserId: users[2].id, toUserId: users[0].id, status: 'pending' },
    }).catch(() => {});

    // Add some messages
    const threadKey = [users[0].id, users[1].id].sort().join('_');
    await prisma.message.createMany({
      data: [
        { threadKey, fromUserId: users[0].id, body: 'Hi! I saw we have a lot of overlap in AI and fintech. Would love to chat about your work at ClimaTech!' },
        { threadKey, fromUserId: users[1].id, body: 'Hey Sarah! Absolutely, I\'d love to connect. We\'re actually looking at how ML can optimize green finance products. Are you at the main hall?' },
        { threadKey, fromUserId: users[0].id, body: 'Yes! Let\'s grab coffee after the next session. I have some ideas about using embeddings for ESG scoring that might interest you.' },
      ],
    });
  }

  console.log('\n✅ Seeding complete!');
  console.log('\n📧 Demo accounts (all use password: password123):');
  for (const demo of DEMO_USERS) {
    console.log(`   ${demo.email} — ${demo.name}, ${demo.title} at ${demo.company}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
