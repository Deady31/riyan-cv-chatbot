-- A exécuter une fois dans le SQL editor du projet Supabase.

create extension if not exists vector;

create table if not exists documents (
  id bigint generated always as identity primary key,
  content text not null,
  source text not null,
  embedding vector(768) not null,
  created_at timestamptz not null default now()
);

-- Pas d'index ivfflat/hnsw ici : sur un volume de quelques centaines/milliers
-- de chunks (cas d'une base connaissance CV perso), un full scan sur <=> est
-- plus simple, exact, et évite le comportement dégénéré d'ivfflat quand
-- `lists` dépasse le nombre de lignes. À revisiter seulement si la table
-- dépasse plusieurs dizaines de milliers de lignes.

create or replace function match_documents (
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  id bigint,
  content text,
  source text,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.source,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;

-- Lecture publique (anon key) autorisée en lecture seule pour le chat
alter table documents enable row level security;

create policy "Public read access"
  on documents for select
  to anon
  using (true);
