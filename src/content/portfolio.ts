// Source of truth: Resume.pdf (Oct 2026). Do not add claims that are not in the resume or a linked public repo.
// `verification`: 'resume' = stated in resume; 'github' = only a public GitHub description backs it.

export type Verification = 'resume' | 'github';

export const profile = {
  name: 'Sohom Chatterjee',
  initials: 'SC',
  headline: 'CS undergraduate and ML engineer',
  location: 'Kolkata, West Bengal, India',
  summary:
    'CS undergraduate and ML engineer building production AI systems across document intelligence, NLP, computer vision, agentic workflows, and data analytics. Built OCR/document-extraction systems at Deloitte, behavioral scoring at HackQuest, and ML services for a live fintech platform at Lumeo. Focused on measurable outcomes and end-to-end ownership.',
  availability: 'Open to forward-deployed & ML engineering roles',
  targetRoles: ['Forward-deployed engineer', 'Machine learning engineer'],
  email: 'sohomchatterjee07@gmail.com',
  github: 'https://github.com/Sagexd08',
  linkedin: 'https://www.linkedin.com/in/sagexd',
  website: 'https://sohomchatterjee.vercel.app',
  resumeUrl: '/Resume.pdf',
  avatarUrl: '/brand/avatar-512.webp',
  avatarAlt: 'Portrait of Sohom Chatterjee in a red plaid shirt',
} as const;

export const skills = [
  { group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'SQL', 'Rust', 'C', 'Solidity'] },
  { group: 'ML / AI', items: ['PyTorch', 'TensorFlow', 'scikit-learn', 'Hugging Face', 'BERT', 'LangChain', 'LangGraph', 'LLMs', 'OCR', 'NLP', 'Computer Vision'] },
  { group: 'ML practice', items: ['Data Preprocessing', 'Feature Engineering', 'Fine-Tuning (LoRA/QLoRA/PEFT)', 'Evaluation', 'SHAP', 'LIME', 'Grad-CAM++', 'MLOps', 'K-Means', 'Forecasting', 'RFM'] },
  { group: 'Backend / data', items: ['NestJS', 'Node.js', 'FastAPI', 'Flask', 'REST APIs', 'Prisma', 'PostgreSQL', 'MongoDB', 'Redis', 'BullMQ', 'Docker', 'CI/CD'] },
  { group: 'Cloud / web', items: ['AWS', 'GCP', 'Vercel', 'Linux', 'Git', 'React', 'Next.js', 'Tailwind CSS'] },
] as const;

export interface Project {
  slug: string;
  name: string;
  description: string;
  category: string;
  role: string;
  status?: string;
  technologies: string[];
  featured: boolean;
  githubUrl?: string;
  liveUrl?: string;
  verification: Verification;
  evidenceSources: string[];
}

export const projects: Project[] = [
  {
    slug: 'project-apex',
    name: 'Project Apex DB',
    description:
      'Open-source embedded database for AI agent memory, written in Rust. Logs every change to a write-ahead log, isolates each tenant’s records, and applies retried writes exactly once.',
    category: 'Database / systems',
    role: 'Author',
    status: 'Open source',
    technologies: ['Rust'],
    featured: true,
    githubUrl: 'https://github.com/Sagexd08/Project-Apex',
    liveUrl: 'https://project-apex-db.vercel.app',
    verification: 'resume',
    evidenceSources: ['Resume.pdf', 'github.com/Sagexd08/Project-Apex'],
  },
  {
    slug: 'lumeo',
    name: 'Lumeo',
    description:
      'AI-native financial OS built by a 4-engineer team: 150+ REST endpoints, 79 Prisma models on PostgreSQL, Redis/BullMQ queues, a double-entry ledger, and Python/FastAPI ML services for document parsing, compliance, and reconciliation.',
    category: 'Fintech / product',
    role: 'Co-founder & CEO; owns product and backend architecture',
    status: '40,000+ waitlist signups pre-launch',
    technologies: ['NestJS', 'Rust', 'Prisma', 'PostgreSQL', 'Redis', 'BullMQ', 'FastAPI'],
    featured: true,
    verification: 'resume',
    evidenceSources: ['Resume.pdf'],
  },
  {
    slug: 'aether-ai',
    name: 'AETHER AI',
    description:
      'End-to-end multimodal training platform: dataset connectors, schema/quality/lineage inspection, LoRA/QLoRA/adapter/prompt tuning, 0.85 F1 baselines, and a versioned model registry.',
    category: 'ML platform',
    role: 'Author',
    technologies: ['FastAPI', 'PyTorch', 'Hugging Face', 'PEFT/LoRA', 'Next.js', 'Celery', 'PostgreSQL', 'Redis', 'Docker'],
    featured: true,
    githubUrl: 'https://github.com/Sagexd08/Aether',
    verification: 'resume',
    evidenceSources: ['Resume.pdf', 'github.com/Sagexd08/Aether'],
  },
  {
    slug: 'xai-plant-disease',
    name: 'Explainable AI for Plant Disease Detection',
    description:
      'XAI-enhanced CNN research: a 20-paper literature survey and an interpretable visual-explanation pipeline for plant disease classification.',
    category: 'Research',
    role: 'Co-author',
    status: 'In progress (co-authoring)',
    technologies: ['CNN', 'SHAP', 'LIME', 'Grad-CAM++', 'TensorFlow'],
    featured: true,
    verification: 'resume',
    evidenceSources: ['Resume.pdf'],
  },
  {
    slug: 'serene-mind',
    name: 'Serene Mind',
    description: 'Multimodal text, voice and facial emotion detection with fused risk scoring.',
    category: 'Computer vision / NLP',
    role: 'Author',
    technologies: ['Python', 'PyTorch', 'OpenCV', 'AWS', 'FaceNet', 'MTCNN'],
    featured: false,
    githubUrl: 'https://github.com/Sagexd08/Serene-Mind-AI-Powered-Mental-Health-Emotion-Detection',
    verification: 'resume',
    evidenceSources: ['Resume.pdf', 'github.com/Sagexd08/Serene-Mind-AI-Powered-Mental-Health-Emotion-Detection'],
  },
  {
    slug: 'zelda',
    name: 'Zelda',
    description: 'Facial authentication system with anti-spoofing.',
    category: 'Computer vision',
    role: 'Author',
    technologies: ['Python', 'PyTorch', 'OpenCV', 'FaceNet', 'MTCNN'],
    featured: false,
    githubUrl: 'https://github.com/Sagexd08/Zelda',
    verification: 'resume',
    evidenceSources: ['Resume.pdf', 'github.com/Sagexd08/Zelda'],
  },
  {
    slug: 'archi-dev',
    name: 'Archi.dev',
    description: 'LLM and graph-reasoning microservice architect.',
    category: 'Developer tools',
    role: 'Author',
    technologies: ['LangChain', 'TypeScript', 'Next.js'],
    featured: false,
    githubUrl: 'https://github.com/Sagexd08/Archi.dev',
    liveUrl: 'https://archi-dev.vercel.app',
    verification: 'resume',
    evidenceSources: ['Resume.pdf', 'github.com/Sagexd08/Archi.dev'],
  },
  {
    slug: 'shortlist-ai',
    name: 'Shortlist AI',
    description: 'NLP resume ranking against job descriptions.',
    category: 'NLP',
    role: 'Author',
    technologies: ['Next.js', 'NLP', 'AWS S3', 'DynamoDB'],
    featured: false,
    githubUrl: 'https://github.com/Sagexd08/shortlist-ai',
    verification: 'resume',
    evidenceSources: ['Resume.pdf', 'github.com/Sagexd08/shortlist-ai'],
  },
  {
    slug: 'autofi',
    name: 'AutoFi',
    description: 'Multi-agent treasury and risk automation.',
    category: 'Agents / DeFi',
    role: 'Author',
    technologies: ['LangChain', 'Celo', 'TypeScript'],
    featured: false,
    githubUrl: 'https://github.com/Sagexd08/AutoFi',
    verification: 'resume',
    evidenceSources: ['Resume.pdf', 'github.com/Sagexd08/AutoFi'],
  },
  {
    slug: 'dacap',
    name: 'DACAP',
    description: 'AI smart-contract auditor.',
    category: 'Agents / Web3',
    role: 'Author',
    technologies: ['Solidity', 'Rust', 'LangChain'],
    featured: false,
    verification: 'resume',
    evidenceSources: ['Resume.pdf'],
  },
  {
    slug: 'causalmesh',
    name: 'CausalMesh',
    description:
      'Experimental framework for isolating information, enforcement, and coordination costs in distributed LLM coding agents.',
    category: 'Research',
    role: 'Author',
    status: 'Experimental',
    technologies: ['Python'],
    featured: false,
    githubUrl: 'https://github.com/Sagexd08/CausalMesh',
    verification: 'github',
    evidenceSources: ['github.com/Sagexd08/CausalMesh (repository description)'],
  },
  {
    slug: 'auralis',
    name: 'Auralis',
    description: 'Your voice, your model, your compute.',
    category: 'Voice',
    role: 'Author',
    technologies: [],
    featured: false,
    githubUrl: 'https://github.com/Sagexd08/Auralis',
    verification: 'github',
    evidenceSources: ['github.com/Sagexd08/Auralis (repository description)'],
  },
];

export type ExperienceType = 'education' | 'employment' | 'founder' | 'open-source' | 'achievement' | 'community';

export interface ExperienceEntry {
  id: string;
  type: ExperienceType;
  title: string;
  organization: string;
  /** ISO year-month, e.g. 2026-02. Undated entries are shown last, never given an invented date. */
  startDate?: string;
  endDate?: string | 'present';
  description: string;
  achievements: string[];
  technologies?: string[];
  projectSlug?: string;
}

export const experience: ExperienceEntry[] = [
  {
    id: 'lumeo',
    type: 'founder',
    title: 'Co-founder & Chief Executive Officer',
    organization: 'Lumeo (Oxify Labs Tech Pvt. Ltd.), Kolkata',
    startDate: '2026-02',
    endDate: 'present',
    description: 'Leads a 4-engineer team building an AI-native financial OS.',
    achievements: [
      'Owns product and backend architecture: 150+ REST endpoints, 79 Prisma models on PostgreSQL, Redis/BullMQ queues, a double-entry ledger, and Python/FastAPI ML services for document parsing, compliance, and reconciliation.',
      'Rewrote latency-critical NestJS services in Rust, cutting container image size by 95% and lowering p95 latency on hot paths.',
      'Grew the product to 40,000+ waitlist signups with zero ad spend and secured enterprise and design-partner traction pre-launch.',
    ],
    technologies: ['NestJS', 'Rust', 'Prisma', 'PostgreSQL', 'Redis', 'BullMQ', 'FastAPI'],
    projectSlug: 'lumeo',
  },
  {
    id: 'hackquest',
    type: 'employment',
    title: 'Developer Advocate (Internship)',
    organization: 'HackQuest, Remote',
    startDate: '2025-11',
    endDate: 'present',
    description: 'Built an ML pipeline scoring learning progress from in-platform user actions.',
    achievements: [
      'Improved point-attribution accuracy by 50%.',
      'Mentored 25+ students on Web3 and Solidity and wrote technical tutorials.',
    ],
    technologies: ['Solidity', 'Python'],
  },
  {
    id: 'deloitte',
    type: 'employment',
    title: 'Machine Learning Engineer (Freelance)',
    organization: 'Deloitte, Remote (APAC). Client: Integra LifeSciences Holdings Corporation',
    startDate: '2025-06',
    endDate: '2025-09',
    description: 'Built OCR and document-intelligence workflows and analytics for a healthcare client.',
    achievements: [
      'Built an OCR/document-intelligence workflow to classify and extract information from messy healthcare and business documents; added layout detection, denoising, deskewing, and post-OCR processing, cutting processing time by 20%.',
      'Delivered 4x ROI through data-driven campaigns across legal, finance, and marketing; unified datasets with automated data-cleaning pipelines.',
      'Reduced healthcare-retail fraud by 17% using SQL, K-Means, and predictive models; increased CRM growth by 20% through RFM segmentation, demand forecasting, and market-basket analysis.',
      'Improved client retention using CSI/NPS metrics built with 20+ advanced SQL analytics; built centralized dashboards.',
    ],
    technologies: ['OCR', 'SQL', 'K-Means', 'RFM', 'Forecasting'],
  },
  {
    id: 'snu',
    type: 'education',
    title: 'B.Tech, Computer Science & Engineering (Data Science)',
    organization: 'Sister Nivedita University, Kolkata',
    startDate: '2024-08',
    endDate: '2028',
    description: 'Undergraduate degree, expected 2028.',
    achievements: [
      'Smart India Hackathon 2024: National Finalist.',
      'Google Solution Challenge 2025: Awardee.',
      'Gemini Campus Ambassador, 2025.',
      'Certifications: MLOps for Generative AI; Transformer Models & BERT (Google Cloud); Full Stack & AI/ML Developer (Sheryians).',
    ],
  },
  {
    id: 'oss-graphify',
    type: 'open-source',
    title: 'Fixed an import-type normalizer performance bug',
    organization: 'Graphify',
    description: 'Fixed a TypeScript import-type normalizer performance bug using a sorted-index lookup. Merged in v0.9.56 (issue #3359).',
    achievements: [],
    technologies: ['TypeScript'],
  },
  {
    id: 'oss-inspect-ai',
    type: 'open-source',
    title: 'Fixed JSON-formatting failures in grading templates',
    organization: 'Inspect AI',
    description: 'Fixed three JSON-formatting failures in Inspect AI grading templates. Filed issue #5276; the fix builds on PR #5256.',
    achievements: [],
    technologies: ['Python'],
  },
  {
    id: 'gfg-snu',
    type: 'community',
    title: 'Technical Executive',
    organization: 'GeeksforGeeks SNU',
    description: 'Mentored 15+ teams.',
    achievements: [],
  },
  {
    id: 'lnc',
    type: 'community',
    title: 'Open-source contributor',
    organization: 'LNC Network',
    description: 'Open-source work in the LNC Network community.',
    achievements: [],
  },
];

export interface OpenSourceContribution {
  id: string;
  repo: string;
  repoUrl: string;
  title: string;
  description: string;
  meta: string;
  url: string;
}

export const openSource: OpenSourceContribution[] = [
  {
    id: 'graphify',
    repo: 'Graphify-Labs/graphify',
    repoUrl: 'https://github.com/Graphify-Labs/graphify',
    title: 'Fixed a TypeScript import-type normalizer performance bug',
    description: 'Replaced a per-match scan of type-argument ranges with a sorted-index lookup.',
    meta: 'Merged in v0.9.56 · issue #3359',
    url: 'https://github.com/Graphify-Labs/graphify/issues/3359',
  },
  {
    id: 'inspect-ai',
    repo: 'UKGovernmentBEIS/inspect_ai',
    repoUrl: 'https://github.com/UKGovernmentBEIS/inspect_ai',
    title: 'Fixed three JSON-formatting failures in grading templates',
    description: 'Filed the issue and wrote a fix that builds on an earlier PR.',
    meta: 'Issue #5276 · builds on PR #5256',
    url: 'https://github.com/UKGovernmentBEIS/inspect_ai/issues/5276',
  },
];
