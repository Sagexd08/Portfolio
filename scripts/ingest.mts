// Builds the knowledge base: chunks the portfolio content (+ allowlisted public READMEs), embeds them with the
// local bge-small model, computes a 2D PCA for the Embedding Space viewer, writes public/rag/index.json,
// and (unless --dry-run) upserts everything into Neon. Run: npm run ingest [-- --dry-run]

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pipeline, env } from '@huggingface/transformers';
import { neon } from '@neondatabase/serverless';
import { experience, openSource, profile, projects, skills } from '../src/content/portfolio.ts';

const SITE = 'https://sohomchatterjee.vercel.app';
const MODEL = 'Xenova/bge-small-en-v1.5';
const README_REPOS = ['Project-Apex', 'Aether', 'CausalMesh', 'Auralis', 'Zelda', 'AutoFi', 'Archi.dev', 'shortlist-ai'];
const MAX_README_CHUNKS = 5;
const MAX_CHUNK_CHARS = 1100;
const dryRun = process.argv.includes('--dry-run');

interface Chunk {
  id: string;
  title: string;
  source_type: 'profile' | 'project' | 'experience' | 'skills' | 'open-source' | 'readme';
  source_url: string;
  project_slug?: string;
  text: string;
}

function loadEnvFile(): void {
  if (!existsSync('.env.local')) return;
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^"|"$/g, '');
  }
}

function contentChunks(): Chunk[] {
  const chunks: Chunk[] = [
    { id: 'profile', title: `About ${profile.name}`, source_type: 'profile', source_url: `${SITE}/about`, text: `${profile.name} (${profile.headline}), based in ${profile.location}. ${profile.summary} Currently: ${profile.availability}. B.Tech in Computer Science & Engineering (Data Science) at Sister Nivedita University, 2024-2028.` },
  ];
  for (const project of projects) {
    chunks.push({
      id: `project-${project.slug}`,
      title: project.name,
      source_type: 'project',
      source_url: `${SITE}/projects/${project.slug}`,
      project_slug: project.slug,
      text: `${project.name} (${project.category}). ${project.description} Role: ${project.role}.${project.status ? ` Status: ${project.status}.` : ''}${project.technologies.length ? ` Stack: ${project.technologies.join(', ')}.` : ''}${project.githubUrl ? ` Repository: ${project.githubUrl}.` : ''}`,
    });
  }
  for (const entry of experience.filter((item) => item.type !== 'open-source')) {
    const when = entry.startDate ? `${entry.startDate} to ${entry.endDate ?? entry.startDate}` : 'undated';
    chunks.push({ id: `exp-${entry.id}`, title: `${entry.title}, ${entry.organization}`, source_type: 'experience', source_url: `${SITE}/resume`, text: `${entry.title} at ${entry.organization} (${when}). ${entry.description} ${entry.achievements.join(' ')}` });
  }
  for (const group of skills) {
    chunks.push({ id: `skills-${group.group}`, title: `Skills: ${group.group}`, source_type: 'skills', source_url: `${SITE}/about`, text: `${group.group}: ${group.items.join(', ')}.` });
  }
  for (const item of openSource) {
    chunks.push({ id: `oss-${item.id}`, title: `Open source: ${item.repo}`, source_type: 'open-source', source_url: item.url, text: `${item.title} in ${item.repo}. ${item.description} ${item.meta}.` });
  }
  return chunks;
}

function cleanReadme(markdown: string): string {
  return markdown.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '').replace(/<[^>]+>/g, '').replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n');
}

function readmeChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  for (const repo of README_REPOS) {
    try {
      const b64 = execFileSync('gh', ['api', `repos/Sagexd08/${repo}/readme`, '--jq', '.content'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      const sections = cleanReadme(Buffer.from(b64.trim(), 'base64').toString('utf8')).split(/^#{1,3}\s+/m).filter((s) => s.trim().length > 80);
      sections.slice(0, MAX_README_CHUNKS).forEach((section, index) => {
        const [heading, ...rest] = section.split('\n');
        chunks.push({ id: `readme-${repo}-${index}`, title: `${repo} README: ${heading.trim().slice(0, 60)}`, source_type: 'readme', source_url: `https://github.com/Sagexd08/${repo}#readme`, project_slug: repo.toLowerCase(), text: rest.join(' ').replace(/\s+/g, ' ').trim().slice(0, MAX_CHUNK_CHARS) });
      });
    } catch {
      console.warn(`skip README: ${repo} (not found or gh unavailable)`);
    }
  }
  return chunks;
}

async function embedAll(texts: string[]): Promise<number[][]> {
  env.allowRemoteModels = false;
  env.localModelPath = new URL('../models/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
  const extract = (await (pipeline as unknown as (t: string, m: string, o: object) => Promise<(x: string, o: object) => Promise<{ data: Float32Array }>>)('feature-extraction', MODEL, { dtype: 'q8' }));
  const out: number[][] = [];
  for (const text of texts) out.push(Array.from((await extract(text, { pooling: 'cls', normalize: true })).data));
  return out;
}

/** Top-2 principal components by power iteration with deflation. */
function pca2(vectors: number[][]): [number, number][] {
  const n = vectors.length;
  const d = vectors[0].length;
  const mean = Array.from({ length: d }, (_, j) => vectors.reduce((s, v) => s + v[j], 0) / n);
  const data = vectors.map((v) => v.map((x, j) => x - mean[j]));
  const comps: number[][] = [];
  for (let c = 0; c < 2; c++) {
    let v = Array.from({ length: d }, (_, j) => Math.sin(j * 12.9898 + c * 78.233));
    for (let iter = 0; iter < 80; iter++) {
      const scores = data.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
      const next = Array.from({ length: d }, (_, j) => data.reduce((s, row, i) => s + row[j] * scores[i], 0));
      const norm = Math.hypot(...next) || 1;
      v = next.map((x) => x / norm);
    }
    comps.push(v);
    data.forEach((row) => {
      const proj = row.reduce((s, x, j) => s + x * v[j], 0);
      row.forEach((_, j) => (row[j] -= proj * v[j]));
    });
  }
  return vectors.map((vec) => [0, 1].map((c) => vec.reduce((s, x, j) => s + (x - mean[j]) * comps[c][j], 0)) as [number, number]);
}

async function writeToNeon(chunks: Chunk[], embeddings: number[][]): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!);
  const [run] = await sql.query(`INSERT INTO ingestion_runs (status) VALUES ('running') RETURNING id`);
  const bySource = new Map<string, number[]>();
  chunks.forEach((chunk, index) => bySource.set(chunk.source_url, [...(bySource.get(chunk.source_url) ?? []), index]));
  let created = 0;
  for (const [url, indexes] of bySource) {
    const first = chunks[indexes[0]];
    const checksum = createHash('sha256').update(indexes.map((i) => chunks[i].text).join('\n')).digest('hex');
    const [source] = await sql.query(
      `INSERT INTO portfolio_sources (source_url, source_type, title, project_slug, checksum, indexed_at) VALUES ($1,$2,$3,$4,$5,now())
       ON CONFLICT (source_url) DO UPDATE SET checksum = EXCLUDED.checksum, title = EXCLUDED.title, indexed_at = now(), updated_at = now() RETURNING id`,
      [url, first.source_type, first.title, first.project_slug ?? null, checksum],
    );
    await sql.query('DELETE FROM portfolio_chunks WHERE source_id = $1', [source.id]);
    for (const [position, index] of indexes.entries()) {
      await sql.query(
        'INSERT INTO portfolio_chunks (source_id, chunk_index, content, embedding, metadata) VALUES ($1,$2,$3,$4::vector,$5)',
        [source.id, position, `${chunks[index].title}. ${chunks[index].text}`, `[${embeddings[index].join(',')}]`, JSON.stringify({ chunk_id: chunks[index].id, title: chunks[index].title })],
      );
      created += 1;
    }
  }
  await sql.query(`UPDATE ingestion_runs SET status='ok', sources_processed=$2, chunks_created=$3, completed_at=now() WHERE id=$1`, [run.id, bySource.size, created]);
  console.log(`neon: ${bySource.size} sources, ${created} chunks written (run ${run.id})`);
}

async function main(): Promise<void> {
  loadEnvFile();
  const chunks = [...contentChunks(), ...readmeChunks()].filter((chunk) => chunk.text.length > 20);
  console.log(`chunks: ${chunks.length}`);
  const embeddings = await embedAll(chunks.map((chunk) => `${chunk.title}. ${chunk.text}`));
  const coords = pca2(embeddings);
  mkdirSync('public/rag', { recursive: true });
  const index = {
    model: MODEL,
    dim: embeddings[0].length,
    builtAt: new Date().toISOString(),
    chunks: chunks.map((chunk, i) => ({
      id: chunk.id,
      title: chunk.title,
      source_type: chunk.source_type,
      source_url: chunk.source_url,
      text: chunk.text,
      embedding: embeddings[i].map((x) => Math.round(x * 1e4) / 1e4),
      pca: coords[i].map((x) => Math.round(x * 1e4) / 1e4),
    })),
  };
  writeFileSync('public/rag/index.json', JSON.stringify(index));
  console.log(`wrote public/rag/index.json (${Math.round(JSON.stringify(index).length / 1024)} KB)`);
  if (dryRun || !process.env.DATABASE_URL) console.log(dryRun ? 'dry run: skipped Neon' : 'DATABASE_URL not set: skipped Neon');
  else await writeToNeon(chunks, embeddings);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
