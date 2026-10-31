import assert from 'node:assert/strict';
import { test } from 'node:test';
import { REFUSAL, composeAnswer, isGrounded } from '../src/ai/extractive.ts';
import { bm25Rank, rrf, tokenize, type Hit, type IndexChunk } from '../src/ai/retrieve.ts';

const chunk = (id: string, title: string, text: string): IndexChunk => ({ id, title, text, source_url: `https://example.com/${id}`, source_type: 'project' });

const CHUNKS = [
  chunk('apex', 'Project Apex DB', 'Project Apex DB is an open-source embedded database for AI agent memory, written in Rust. It logs every change to a write-ahead log.'),
  chunk('deloitte', 'ML Engineer, Deloitte', 'Built an OCR and document-intelligence workflow for a healthcare client, cutting processing time by 20%.'),
  chunk('edu', 'Education', 'B.Tech in Computer Science and Engineering at Sister Nivedita University, 2024 to 2028.'),
];

const toHit = (c: IndexChunk): Hit => ({ id: c.id, title: c.title, text: c.text, url: c.source_url, type: c.source_type, score: 1 });

test('tokenize drops stop words and keeps technical tokens', () => {
  assert.deepEqual(tokenize('What is the Rust C++ experience?'), ['rust', 'c++', 'experience']);
});

test('bm25 ranks the matching chunk first', () => {
  assert.equal(bm25Rank(CHUNKS, 'Rust database write-ahead log')[0].chunk.id, 'apex');
  assert.equal(bm25Rank(CHUNKS, 'OCR healthcare')[0].chunk.id, 'deloitte');
});

test('bm25 returns nothing for out-of-domain queries', () => {
  assert.equal(bm25Rank(CHUNKS, 'basketball playoffs').length, 0);
});

test('rrf fuses lists and prefers items ranked high in both', () => {
  const a = [{ chunk: CHUNKS[0] }, { chunk: CHUNKS[1] }];
  const b = [{ chunk: CHUNKS[0] }, { chunk: CHUNKS[2] }];
  const fused = rrf([a, b], 3);
  assert.equal(fused[0].id, 'apex');
  assert.equal(fused.length, 3);
});

test('composeAnswer cites its sources and never invents text', () => {
  const answer = composeAnswer('What is Project Apex DB?', [toHit(CHUNKS[0])]);
  assert.equal(answer.refused, false);
  assert.match(answer.text, /embedded database/);
  assert.match(answer.text, /\[1\]/);
  assert.equal(answer.sources[0].url, 'https://example.com/apex');
});

test('composeAnswer refuses when the sources do not cover the question', () => {
  const answer = composeAnswer('Has he worked at Amazon?', CHUNKS.map(toHit));
  assert.equal(answer.refused, true);
  assert.equal(answer.text, REFUSAL);
});

test('isGrounded accepts supported claims and rejects invented numbers', () => {
  const hits = CHUNKS.map(toHit);
  assert.equal(isGrounded('The OCR workflow cut processing time by 20%.', hits), true);
  assert.equal(isGrounded('The OCR workflow cut processing time by 80%.', hits), false);
});

test('isGrounded rejects answers full of unknown proper nouns', () => {
  assert.equal(isGrounded('He founded Quantum Dynamics and led Nebula Systems.', CHUNKS.map(toHit)), false);
});
