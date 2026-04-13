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

export const profile = {
  name: 'Sohom Chatterjee',
  initials: 'SC',
  title: 'CS & Engineering Student',
  university: 'Sister Nivedita University',
  location: 'Kolkata, India',
  bio: 'Founder of Oxify Labs and AI/ML Researcher focused on architecting resilient digital foundations and scalable intelligent systems. B.Tech CSE student at Sister Nivedita University with expertise in full-stack engineering, applied AI, and decentralized protocols.',
  roles: ['Founder @ Oxify Labs', 'AI/ML Researcher', 'Full-Stack Engineer', 'Web3 Developer'],
  github: 'https://github.com/Sagexd08',
  linkedin: 'https://www.linkedin.com/in/sohom-chatterjee-61828a312/',
  email: 'sohomchatterjee07@oxifylabs.app',
  avatarUrl: 'https://avatars.githubusercontent.com/u/122352413?v=4',
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
    description: 'AI backend architect that automates the design and implementation of scalable microservices architectures using LLMs and graph-based reasoning.',
    tags: ['TypeScript', 'Next.js', 'AI', 'LLM'],
    githubUrl: 'https://github.com/Sagexd08/Archi.dev',
    liveUrl: 'https://archi-dev.vercel.app',
    language: 'TypeScript',
    stars: 0,
    featured: true,
    gradient: 'from-blue-900/40 to-indigo-900/40',
  },
  {
    id: 'serene-mind',
    title: 'Serene Mind',
    description: 'Privacy-first multimodal AI system detecting emotions from text, voice, and facial expressions with risk scoring and mental health support resources.',
    tags: ['PyTorch', 'OpenCV', 'AWS', 'TypeScript'],
    githubUrl: 'https://github.com/Sagexd08/Serene-Mind-AI-Powered-Mental-Health-Emotion-Detection',
    liveUrl: 'https://serene-mind-ai-powered-mental-healt.vercel.app/',
    language: 'TypeScript',
    stars: 0,
    featured: true,
    gradient: 'from-purple-900/40 to-pink-900/40',
  },
  {
    id: 'dacap',
    title: 'DACAP',
    description: 'Decentralized Autonomous Hedge Fund Protocol — a next-gen AI auditor that secures, optimizes, and upgrades smart contracts for autonomous financial systems.',
    tags: ['Solidity', 'AI', 'DeFi', 'Blockchain'],
    githubUrl: 'https://github.com/Sagexd08/Decentralized-Autonomous-Hedge-Fund-Protocol',
    language: 'Makefile',
    stars: 0,
    featured: true,
    gradient: 'from-emerald-900/40 to-teal-900/40',
  },
  {
    id: 'lexigraph',
    title: 'LexiGraph',
    description: 'Open-source text-to-image generator powered by a custom-trained Stable Diffusion model, turning words into stunning visuals without paid APIs.',
    tags: ['Python', 'Stable Diffusion', 'TypeScript'],
    githubUrl: 'https://github.com/Sagexd08/LexiGraph',
    language: 'TypeScript',
    stars: 0,
    featured: true,
    gradient: 'from-orange-900/40 to-red-900/40',
  },
  {
    id: 'zelda',
    title: 'Zelda',
    description: 'Production-ready ML-driven facial authentication system with multi-layer security, adaptive learning, and advanced anti-spoofing capabilities.',
    tags: ['Python', 'FaceNet', 'MTCNN', 'OpenCV'],
    githubUrl: 'https://github.com/Sagexd08/Zelda',
    liveUrl: 'https://zelda-beta.vercel.app',
    language: 'Python',
    stars: 0,
    featured: false,
    gradient: 'from-cyan-900/40 to-blue-900/40',
  },
  {
    id: 'sage-ai',
    title: 'Sage AI',
    description: 'All-in-one voice companion powered by Google Gemini 2.5 Flash & Mistral 7B for seamless speech control, media, camera, email & system integration.',
    tags: ['Python', 'Gemini', 'Mistral', 'TTS'],
    githubUrl: 'https://github.com/Sagexd08/Sage-AI',
    language: 'Python',
    stars: 0,
    featured: false,
    gradient: 'from-violet-900/40 to-purple-900/40',
  },
  {
    id: 'shortlist-ai',
    title: 'Shortlist AI',
    description: 'Serverless ATS-grade AI resume screening engine that analyzes resumes against job descriptions and estimates shortlisting probability using NLP.',
    tags: ['Next.js', 'NLP', 'AWS S3', 'DynamoDB'],
    githubUrl: 'https://github.com/Sagexd08/shortlist-ai',
    language: 'TypeScript',
    stars: 0,
    featured: false,
    gradient: 'from-sky-900/40 to-indigo-900/40',
  },
  {
    id: 'autofi',
    title: 'AutoFi',
    description: 'Next-generation DeFi automation platform on Celo blockchain using Multi-Agent Swarm Architecture for risk analysis, treasury management, and transaction composition.',
    tags: ['TypeScript', 'Celo', 'DeFi', 'AI Agents'],
    githubUrl: 'https://github.com/Sagexd08/AutoFi',
    language: 'TypeScript',
    stars: 0,
    featured: false,
    gradient: 'from-lime-900/40 to-green-900/40',
  },
];

export const experienceTimeline: ExperienceItem[] = [
  {
    year: 'Feb 2026 – Present',
    title: 'Founder & AI/ML Researcher',
    org: 'Oxify Labs',
    description: 'Leading the intersection of high-performance product engineering and applied AI research. Focusing on architecting digital foundations built for long-term resilience and global scale, with an execution-first roadmap centered on clean architecture and production-ready platforms.',
    type: 'project',
  },
  {
    year: 'Nov 2025 – Present',
    title: 'Developer Advocate',
    org: 'HackQuest',
    description: 'Advocating for developer excellence in Solidity and Web3. Bridging the gap between conceptual decentralized models and practical engineering implementations for the next generation of builders.',
    type: 'achievement',
  },
  {
    year: 'Nov 2025 – Present',
    title: 'Campus Ambassador',
    org: 'NAMESPACE',
    description: 'Fostering engineering and leadership excellence within the developer community, focusing on technical innovation and student engagement.',
    type: 'achievement',
  },
  {
    year: 'Oct 2025 – Present',
    title: 'Dev Team Member',
    org: 'LNC COMMUNITY',
    description: 'Maintaining open-source projects and collaborating with cross-functional teams of designers and developers to solve complex development problems and address real-world technical challenges.',
    type: 'project',
  },
  {
    year: 'Aug 2025 – Present',
    title: 'Tech Team Member',
    org: 'Coding Ninjas SNU',
    description: 'Contributing to impactful technical projects and brainstorming innovative solutions to support the 10X Club’s technical initiatives and institutional growth.',
    type: 'achievement',
  },
  {
    year: 'Aug 2025- Dec 2025',
    title: 'Gemini Student Campus Ambassador',
    org: 'Google',
    description: 'Leading AI-driven initiatives, organizing hands-on workshops, and building a thriving community of innovators to bridge the gap between cutting-edge technology and real-world impact.',
    type: 'achievement',
  },
  {
    year: 'Jul 2025 – Dec 2025',
    title: 'Campus Ambassador',
    org: 'GirlScript Summer of Code',
    description: 'Empowering aspiring coders and promoting inclusivity in STEM by mentoring peers and building community engagement during the global open-source program.',
    type: 'achievement',
  },
  {
    year: 'Mar 2025 – Nov 2025',
    title: 'Technical Executive',
    org: 'GeeksforGeeks Sister Nivedita University Chapter',
    description: 'Mentored 15+ student teams through the full AI/ML project lifecycle, helping them define problem statements, select appropriate algorithms, and design solution architectures while providing in-depth code reviews and technical feedback to boost solution robustness and learning outcomes.',
    type: 'education',
  },
  {
    year: 'Jul 2025 – Sep 2025',
    title: 'AI Intern',
    org: 'Brainwave Matrix Solutions',
    description: 'Developed machine learning models for real-world applications, focusing on supervised/unsupervised learning, NLP, and computer vision while participating in research initiatives and code reviews.',
    type: 'education',
  },
  {
    year: '2024 – Present',
    title: 'B.Tech Computer Science & Engineering',
    org: 'Sister Nivedita University, Kolkata',
    description: 'Pursuing undergraduate degree with a focus on AI/ML research, computational infrastructure, and high-performance system design.',
    type: 'education',
  },
];

export const techStack: TechItem[] = [
  // Languages
  { name: 'Python', category: 'language', level: 95, iconKey: 'python' },
  { name: 'TypeScript', category: 'language', level: 90, iconKey: 'typescript' },
  { name: 'JavaScript', category: 'language', level: 88, iconKey: 'javascript' },
  { name: 'Solidity', category: 'language', level: 85, iconKey: 'solidity' },
  { name: 'C++', category: 'language', level: 75, iconKey: 'cplusplus' },
  // Frameworks
  { name: 'React', category: 'framework', level: 92, iconKey: 'react' },
  { name: 'Next.js', category: 'framework', level: 90, iconKey: 'nextdotjs' },
  { name: 'FastAPI', category: 'framework', level: 85, iconKey: 'fastapi' },
  { name: 'Web3.js', category: 'framework', level: 82, iconKey: 'web3dotjs' },
  { name: 'Tailwind CSS', category: 'framework', level: 95, iconKey: 'tailwindcss' },
  // AI/ML
  { name: 'PyTorch', category: 'ai', level: 88, iconKey: 'pytorch' },
  { name: 'TensorFlow', category: 'ai', level: 80, iconKey: 'tensorflow' },
  { name: 'OpenCV', category: 'ai', level: 85, iconKey: 'opencv' },
  { name: 'Transformers', category: 'ai', level: 82, iconKey: 'huggingface' },
  { name: 'LangChain', category: 'ai', level: 80, iconKey: 'langchain' },
  { name: 'Stable Diffusion', category: 'ai', level: 78, iconKey: 'stabilityai' },
  // Tools
  { name: 'Git', category: 'tool', level: 92, iconKey: 'git' },
  { name: 'Docker', category: 'tool', level: 80, iconKey: 'docker' },
  { name: 'Vite', category: 'tool', level: 90, iconKey: 'vite' },
  // Cloud
  { name: 'AWS', category: 'cloud', level: 75, iconKey: 'amazonwebservices' },
  { name: 'Vercel', category: 'cloud', level: 92, iconKey: 'vercel' },
];

export const techCategories = [
  { key: 'language', label: 'Languages' },
  { key: 'framework', label: 'Frameworks' },
  { key: 'ai', label: 'AI / ML' },
  { key: 'tool', label: 'DevTools' },
  { key: 'cloud', label: 'Cloud' },
] as const;
