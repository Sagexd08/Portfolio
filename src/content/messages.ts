// PARODY. Messages are written by Sohom; any reply from a named person is a fictional joke written for this site, never
// a real quote, and no real conversation, hire or relationship is implied.
// Skill / project claims come only from src/content/portfolio.ts (Deloitte OCR, HackQuest scoring, Lumeo ML services,
// Project Apex DB in Rust, LoRA/QLoRA fine-tuning, LangGraph/LangChain, GCP, explainable plant-disease detection).

export interface Chat {
  id: string;
  name: string;
  /** Accurate public role or company line shown under the name. */
  subtitle: string;
  initials: string;
  /** Avatar gradient [top, bottom]. */
  tint: readonly [string, string];
  time: string;
  receipt: 'Delivered' | 'Read';
  /** Messages sent by Sohom; the last one carries the call to action. */
  messages: readonly string[];
  /** Parody replies, keyed by the index of the Sohom message they follow. All fictional jokes, never real quotes. */
  replies?: Readonly<Record<number, readonly string[]>>;
  /** False when the thread ends with a real-looking back-and-forth and no endless typing bubble. */
  endsTyping?: boolean;
}

const CTA = 'Fastest way to reach me is the Contact app below. Hire me?';

export const CHATS: readonly Chat[] = [
  {
    id: 'future-employer',
    name: 'Your Future Employer',
    subtitle: 'Imaginary. Could be you.',
    initials: 'FE',
    tint: ['#34d399', '#0f766e'],
    time: 'Today',
    receipt: 'Read',
    endsTyping: false,
    messages: [
      'Hi! I saw your open role. I build production ML and I ship it with the customer.',
      'OCR and document extraction at Deloitte, behavioral scoring at HackQuest, ML services for a live fintech platform at Lumeo, and a Rust database for agent memory.',
      'I am based in Kolkata and looking for forward-deployed engineering and machine learning roles.',
      'When can we talk?',
    ],
    replies: {
      0: ['Hi Sohom! We were hoping to hear from you.'],
      1: ['That is exactly what we need. Can you explain a model to a customer who is not technical?'],
      2: ['Great. Send over your resume?'],
      3: ['Perfect. Open the Contact app and we will take it from there.'],
    },
  },
  {
    id: 'zuckerberg',
    replies: { 0: ['Ha. A smaller GPU budget? Relatable.'], 3: ['Evaluate before you celebrate. Noted. Is this a pitch or a unit test?'] },
    name: 'Mark Zuckerberg',
    subtitle: 'Founder & CEO, Meta',
    initials: 'MZ',
    tint: ['#6aa9ff', '#2d5fd6'],
    time: '9:41 AM',
    receipt: 'Delivered',
    messages: [
      'Hi Mark, Sohom here. I train models for a living and my GPU budget is slightly smaller than yours.',
      'I build production ML: OCR and document extraction at Deloitte, behavioral scoring at HackQuest, ML services for a live fintech platform at Lumeo.',
      'I also wrote an open-source embedded database in Rust for AI agent memory. Project Apex DB: memory for agents, but exactly-once.',
      'Llama is great, by the way. I fine-tune with LoRA/QLoRA and I promise to evaluate before I celebrate.',
      CTA,
    ],
  },
  {
    id: 'jensen',
    replies: { 1: ['Free tiers are the best tier. Until the queue gets long.'], 3: ['Ship the model, then sit with the customer. Bold. I like it.'] },
    name: 'Jensen Huang',
    subtitle: 'Founder & CEO, NVIDIA',
    initials: 'JH',
    tint: ['#9be564', '#3f9b1c'],
    time: '9:12 AM',
    receipt: 'Read',
    messages: [
      'Hi Jensen. Thank you for CUDA. Every loss curve I have ever watched go down owes you a coffee.',
      'My PyTorch and TensorFlow jobs run best on your GPUs. My bank account runs best on free tiers.',
      'I care about models you can explain: SHAP, LIME and Grad-CAM++ on a plant disease detector, not just a pretty accuracy number.',
      'Looking for ML or forward-deployed engineering roles. I ship the model and then sit with the customer until it works.',
      CTA,
    ],
  },
  {
    id: 'scott-wu',
    replies: { 0: ['Parallelizing is overrated. Sleep is underrated.'], 3: ['Polite code review comments: the only kind that merge.'] },
    name: 'Scott Wu',
    subtitle: 'Co-founder & CEO, Cognition (Devin)',
    initials: 'SW',
    tint: ['#c79bff', '#6a3fe0'],
    time: 'Yesterday',
    receipt: 'Delivered',
    messages: [
      'Hi Scott. Big fan of what Devin is doing for software engineering. I am basically Devin, except I sleep and I cannot parallelize.',
      'I build agentic workflows too, with LangGraph and LangChain, and I like keeping a human in the loop.',
      'Forward-deployed work is where I thrive: messy real-world documents, OCR pipelines, and a customer who needs it to work on Monday.',
      'Happy to review Devin\'s pull requests. I will be very polite in the comments.',
      CTA,
    ],
  },
  {
    id: 'musk',
    replies: { 2: ['Exactly once is a high bar. Even for rockets.'], 3: ['Summary: hire this person. Soon.'] },
    name: 'Elon Musk',
    subtitle: 'xAI · X · SpaceX · Tesla',
    initials: 'EM',
    tint: ['#9aa3b2', '#3b4252'],
    time: 'Yesterday',
    receipt: 'Delivered',
    messages: [
      'Hi Elon. Quick pitch, shorter than a thread.',
      'ML engineer: NLP, computer vision, OCR, agentic workflows, forecasting. Python and Rust, plus Docker and CI/CD to ship it.',
      'I cannot promise Mars-grade reliability, but my Rust database applies retried writes exactly once.',
      'If this is too long, Grok can summarize it. Probably faster than I can scroll.',
      CTA,
    ],
  },
  {
    id: 'altman',
    replies: { 0: ['A model summarized the docs, then summarized the summary. Peak efficiency.'] },
    name: 'Sam Altman',
    subtitle: 'CEO, OpenAI',
    initials: 'SA',
    tint: ['#5eead4', '#0f9488'],
    time: 'Tuesday',
    receipt: 'Read',
    messages: [
      'Hi Sam. I read the API docs, then asked a model to summarize them. Efficient, and a little meta.',
      'I work with LLMs end to end: fine-tuning, evaluation, retrieval, and the boring parts that make them reliable in production.',
      'I would like to be the engineer who gets the model into a customer\'s workflow and makes it stay there.',
      CTA,
    ],
  },
  {
    id: 'pichai',
    replies: { 0: ['Circular but valid. Customer and applicant, same person. Respect.'], 2: ['Boring demos are the best demos.'] },
    name: 'Sundar Pichai',
    subtitle: 'CEO, Google and Alphabet',
    initials: 'SP',
    tint: ['#ffd36b', '#e8892a'],
    time: 'Tuesday',
    receipt: 'Delivered',
    messages: [
      'Hi Sundar. I already use GCP, so technically I am a Google customer applying for a job. Circular, I know.',
      'Gemini has probably read my resume already, so I will skip the long intro.',
      'ML engineer, comfortable with PyTorch and TensorFlow, and happier when the evaluation is solid and the demo is boring.',
      CTA,
    ],
  },
  {
    id: 'mom',
    replies: { 0: ['Beta, did you eat? Send a photo.'], 1: ['Computers are fine. Just call your grandmother.'], 2: ['I am proud of you. I have already shown the neighbours. Sorry.'] },
    endsTyping: false,
    name: 'Mom',
    subtitle: 'Home',
    initials: 'M',
    tint: ['#ff9fb8', '#e5457a'],
    time: 'Sunday',
    receipt: 'Read',
    messages: [
      'Hi Mom! Yes, I am eating properly.',
      'Yes, I am still looking for a job. Yes, it is something with computers. Machine learning, to be precise.',
      'I made a very silly portfolio with pitch chats to famous tech people. None of it is real, so please do not forward it to the neighbours.',
      CTA,
    ],
  },
];

export const SATIRE_NOTE = 'Parody: replies from real people are fictional jokes. Not real conversations.';
