import { pipeline, env } from '@huggingface/transformers';
env.allowRemoteModels = false;
env.localModelPath = new URL('../models/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const embed = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5', { dtype: 'q8' });
const vec = async (t) => Array.from((await embed(t, { pooling: 'cls', normalize: true })).data);
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const q = await vec('Represent this sentence for searching relevant passages: What is his experience with Rust?');
const docs = {
  rust: 'Rewrote latency-critical NestJS services in Rust, cutting container image size by 95%.',
  apex: 'Project Apex DB is an open-source embedded database for AI agent memory written in Rust.',
  edu: 'B.Tech in Computer Science and Engineering at Sister Nivedita University.',
  fraud: 'Reduced healthcare-retail fraud by 17% using SQL and K-Means.',
};
const out = {};
for (const [k, t] of Object.entries(docs)) out[k] = +dot(q, await vec(t)).toFixed(3);
console.log('dim', q.length, out);
