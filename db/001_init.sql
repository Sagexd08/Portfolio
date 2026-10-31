-- Applied to Neon project portfolio-rag. 384 dimensions = bge-small-en-v1.5.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE portfolio_sources (
  id bigserial PRIMARY KEY,
  source_url text NOT NULL UNIQUE,
  source_type text NOT NULL,
  title text NOT NULL,
  project_slug text,
  checksum text NOT NULL,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility = 'public'),
  indexed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE portfolio_chunks (
  id bigserial PRIMARY KEY,
  source_id bigint NOT NULL REFERENCES portfolio_sources(id) ON DELETE CASCADE,
  chunk_index int NOT NULL,
  content text NOT NULL,
  embedding vector(384) NOT NULL,
  fts tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, chunk_index)
);
CREATE INDEX portfolio_chunks_embedding_idx ON portfolio_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX portfolio_chunks_fts_idx ON portfolio_chunks USING gin (fts);

CREATE TABLE ingestion_runs (
  id bigserial PRIMARY KEY,
  status text NOT NULL,
  sources_processed int NOT NULL DEFAULT 0,
  chunks_created int NOT NULL DEFAULT 0,
  errors jsonb NOT NULL DEFAULT '[]',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
