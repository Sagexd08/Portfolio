export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl?: string;
  language: string;
  stars: number;
  featured?: boolean;
  gradient: string;
}

export interface ExperienceItem {
  year: string;
  title: string;
  org: string;
  description: string;
  type: 'education' | 'project' | 'achievement';
}

export interface TechItem {
  name: string;
  category: 'language' | 'framework' | 'tool' | 'ai' | 'cloud';
  level: number; // 0-100
  iconKey?: string;
}

export interface OpenSourceItem {
  id: string;
  repo: string;
  title: string;
  description: string;
  meta: string;
  url: string;
}

export const profile = {
  name: 'Sohom Chatterjee',
  initials: 'SC',
  title: 'CS & Engineering Student',
  university: 'Sister Nivedita University',
  location: 'Kolkata, India',
  bio: "CS undergraduate building Gen AI systems in production, not just coursework. At Lumeo I'm building an AI-native financial OS from scratch with LangChain and LangGraph agentic pipelines. On campus I teach ML to 15+ teams and run AI workshops — build the model, ship it, then teach someone else how it works.",
  roles: ['CEO & Co-founder @ Lumeo', 'Gen AI Engineer', 'ML & Agentic Systems', 'Open Source Contributor'],
  github: 'https://github.com/Sagexd08',
  linkedin: 'https://www.linkedin.com/in/sagexd',
  email: 'sohomchatterjee07@gmail.com',
  avatarUrl: '/Sohom.jpg',
  stats: {
    repos: 51,
    projects: '20+',
    commits: '500+',
    experience: '2+',
  },
};

export const featuredProjects: Project[] = [
  {
    id: 'archi-dev',
    title: 'Archi.dev',
    description: 'AI tool that plans microservice architecture by having an LLM reason over a graph of system components and their dependencies.',
    tags: ['TypeScript', 'Next.js', 'LangChain', 'Graph Reasoning'],
    githubUrl: 'https://github.com/Sagexd08/Archi.dev',
    liveUrl: 'https://archi-dev.vercel.app',
    language: 'TypeScript',
    stars: 0,
    featured: true,
    gradient: 'from-blue-900/40 to-indigo-900/40',
  },
  {
    id: 'iris-protocol',
    title: 'IRIS Protocol',
    description: 'Agentic ML layer for an autonomous trading system. Four strategy agents run on a shared LangGraph state graph, use FAISS for retrieval, and log to a hash-committed ledger so performance is verifiable.',
    tags: ['Python', 'LangGraph', 'FAISS', 'Solana'],
    githubUrl: 'https://github.com/Sagexd08',
    language: 'Python',
    stars: 0,
    featured: true,
    gradient: 'from-purple-900/40 to-pink-900/40',
  },
  {
    id: 'reforge',
    title: 'Reforge',
    description: 'ML system that retrains and restructures its own models instead of needing manual retraining.',
    tags: ['Python', 'MLOps', 'AutoML'],
    githubUrl: 'https://github.com/Sagexd08/Reforge',
    language: 'Python',
    stars: 0,
    featured: true,
    gradient: 'from-emerald-900/40 to-teal-900/40',
  },
  {
    id: 'xai-plant-disease',
    title: 'XAI for Plant Disease',
    description: 'Co-authoring a paper on explainable CNNs for plant disease detection, with a 20-paper literature review and a visual explanation pipeline farmers can actually read.',
    tags: ['CNN', 'SHAP', 'Grad-CAM++', 'TensorFlow'],
    githubUrl: 'https://github.com/Sagexd08',
    language: 'Python',
    stars: 0,
    featured: true,
    gradient: 'from-orange-900/40 to-red-900/40',
  },
  {
    id: 'neural-network-scratch',
    title: 'Neural Network From Scratch',
    description: 'Feedforward network and backpropagation written from raw math, no ML framework, to understand what is actually happening under the hood.',
    tags: ['Python', 'NumPy', 'Deep Learning'],
    githubUrl: 'https://github.com/Sagexd08/Neural-Network-From-Scratch',
    language: 'Python',
    stars: 0,
    featured: false,
    gradient: 'from-cyan-900/40 to-blue-900/40',
  },
  {
    id: 'sage-ai',
    title: 'Sage AI',
    description: 'Voice assistant that switches between Gemini 2.5 Flash and a Mistral 7B model fine-tuned locally, depending on the task.',
    tags: ['Python', 'Gemini', 'Mistral 7B', 'TTS'],
    githubUrl: 'https://github.com/Sagexd08/Sage-AI',
    language: 'Python',
    stars: 0,
    featured: false,
    gradient: 'from-violet-900/40 to-purple-900/40',
  },
  {
    id: 'shortlist-ai',
    title: 'Shortlist AI',
    description: 'Serverless tool that scores resumes against job descriptions with an NLP pipeline.',
    tags: ['Next.js', 'NLP', 'AWS S3', 'DynamoDB'],
    githubUrl: 'https://github.com/Sagexd08/shortlist-ai',
    language: 'TypeScript',
    stars: 0,
    featured: false,
    gradient: 'from-sky-900/40 to-indigo-900/40',
  },
  {
    id: 'brier',
    title: 'Brier',
    description: 'On-chain insurance that slashes AI model operators for being confidently wrong, not just wrong, using zkML to prove the model’s stated confidence.',
    tags: ['Solidity', 'zkML', 'DeFi'],
    githubUrl: 'https://github.com/Sagexd08',
    language: 'Solidity',
    stars: 0,
    featured: false,
    gradient: 'from-amber-900/40 to-yellow-900/40',
  },
  {
    id: 'dacap',
    title: 'DACAP',
    description: 'AI auditor that checks, optimizes, and upgrades smart contracts for autonomous finance systems.',
    tags: ['Solidity', 'Rust', 'AI Agents'],
    githubUrl: 'https://github.com/Sagexd08/Decentralized-Autonomous-Hedge-Fund-Protocol',
    language: 'Solidity',
    stars: 0,
    featured: false,
    gradient: 'from-lime-900/40 to-green-900/40',
  },
];

export const openSource: OpenSourceItem[] = [
  {
    id: 'graphify',
    repo: 'Graphify-Labs/graphify',
    title: 'Fixed a CPU-pinning bug in the TypeScript import-type normalizer',
    description: 'It was scanning every type-argument range on each match, which pinned CPU at 100% on large files. Rewrote it as a sorted-index lookup with the same output.',
    meta: 'Merged in v0.9.56 · issue #3359 · commit 67f99bd',
    url: 'https://github.com/Graphify-Labs/graphify/issues/3359',
  },
  {
    id: 'inspect-ai',
    repo: 'UKGovernmentBEIS/inspect_ai',
    title: 'Hardened grading and multiple-choice templates against unescaped JSON',
    description: 'Found three more places where Inspect AI’s templates used raw str.format() and broke on unescaped JSON in examples. Filed the issue and wrote the fix, building on an earlier PR.',
    meta: 'Issue #5276 · stacked on PR #5256',
    url: 'https://github.com/UKGovernmentBEIS/inspect_ai/issues/5276',
  },
];

export const experienceTimeline: ExperienceItem[] = [
  {
    year: 'Nov 2025 – Present',
    title: 'CEO & Co-founder',
    org: 'Lumeo',
    description: 'Leading a 4-person team building an AI-native financial OS: NestJS/Prisma backend, Next.js 14 frontend, a Python ML server, and Stellar/Soroban smart contracts. 40,000+ people on the waitlist without any ad spend. Own the product architecture end-to-end, including the AI-driven compliance and reconciliation layer that is the core of the product.',
    type: 'project',
  },
  {
    year: 'Nov 2025 – Present',
    title: 'Developer Advocate (Internship)',
    org: 'HackQuest India',
    description: 'Built an ML pipeline that scores user progress from in-platform activity, improving point-attribution accuracy by 50%. Mentored 25+ students on Web3 and Solidity development, and write technical tutorials for a global developer audience.',
    type: 'achievement',
  },
  {
    year: 'Oct 2025 – Present',
    title: 'Dev Team Member',
    org: 'LNC Community',
    description: 'Contribute to and maintain open-source projects in the LNC Network. Work with designers and other developers to ship features and solve real development problems.',
    type: 'project',
  },
  {
    year: 'Aug 2025 – Jun 2026',
    title: 'Gemini Student Campus Ambassador',
    org: 'Google',
    description: 'Lead AI-driven initiatives on campus: organize hands-on workshops and tech events, and build a community of student developers around emerging AI tools.',
    type: 'achievement',
  },
  {
    year: 'Mar 2025 – Nov 2025',
    title: 'Technical Executive',
    org: 'GeeksforGeeks SNU Chapter',
    description: 'Mentored 15+ teams through full ML projects, from problem framing to deployment, using Python, TensorFlow, Flask, and Docker. Ran code reviews and hyperparameter-tuning sessions. Helped ship 10+ live demos.',
    type: 'education',
  },
  {
    year: 'Aug 2024 – 2028',
    title: 'B.Tech, Computer Science & Engineering (Data Science)',
    org: 'Sister Nivedita University (MAKAUT)',
    description: 'Coursework in Data Structures & Algorithms, Machine Learning, DBMS, Operating Systems, and OOP, with a strong focus on algorithmic problem-solving.',
    type: 'education',
  },
  {
    year: '2024 – 2025',
    title: 'SIH’24 Finalist & Google Solution Challenge',
    org: 'Smart India Hackathon · Google',
    description: 'National finalist at Smart India Hackathon 2024, and a Certificate of Achievement in the Google Solution Challenge 2025. Certified in MLOps for Generative AI and Transformer Models & BERT (Google Cloud Skills Boost).',
    type: 'achievement',
  },
];

export const techStack: TechItem[] = [
  // Languages
  { name: 'Python', category: 'language', level: 95, iconKey: 'python' },
  { name: 'TypeScript', category: 'language', level: 90, iconKey: 'typescript' },
  { name: 'JavaScript', category: 'language', level: 88, iconKey: 'javascript' },
  { name: 'SQL', category: 'language', level: 85, iconKey: 'postgresql' },
  { name: 'Solidity', category: 'language', level: 80, iconKey: 'solidity' },
  // Frameworks
  { name: 'Next.js', category: 'framework', level: 92, iconKey: 'nextdotjs' },
  { name: 'React', category: 'framework', level: 92, iconKey: 'react' },
  { name: 'NestJS', category: 'framework', level: 85, iconKey: 'nestjs' },
  { name: 'FastAPI', category: 'framework', level: 88, iconKey: 'fastapi' },
  { name: 'Flask', category: 'framework', level: 82, iconKey: 'flask' },
  { name: 'Tailwind CSS', category: 'framework', level: 95, iconKey: 'tailwindcss' },
  // AI/ML
  { name: 'LangChain', category: 'ai', level: 92, iconKey: 'langchain' },
  { name: 'LangGraph', category: 'ai', level: 90, iconKey: 'langchain' },
  { name: 'PyTorch', category: 'ai', level: 88, iconKey: 'pytorch' },
  { name: 'TensorFlow', category: 'ai', level: 85, iconKey: 'tensorflow' },
  { name: 'HuggingFace', category: 'ai', level: 85, iconKey: 'huggingface' },
  { name: 'scikit-learn', category: 'ai', level: 85, iconKey: 'scikitlearn' },
  { name: 'RAG / FAISS', category: 'ai', level: 88, iconKey: 'meta' },
  // Tools
  { name: 'Git', category: 'tool', level: 92, iconKey: 'git' },
  { name: 'Docker', category: 'tool', level: 85, iconKey: 'docker' },
  { name: 'Prisma', category: 'tool', level: 85, iconKey: 'prisma' },
  { name: 'Redis', category: 'tool', level: 78, iconKey: 'redis' },
  // Cloud
  { name: 'AWS', category: 'cloud', level: 80, iconKey: 'amazonwebservices' },
  { name: 'GCP', category: 'cloud', level: 78, iconKey: 'googlecloud' },
  { name: 'Vercel', category: 'cloud', level: 92, iconKey: 'vercel' },
];

export const techCategories = [
  { key: 'language', label: 'Languages' },
  { key: 'framework', label: 'Frameworks' },
  { key: 'ai', label: 'AI / ML' },
  { key: 'tool', label: 'DevTools' },
  { key: 'cloud', label: 'Cloud' },
] as const;
