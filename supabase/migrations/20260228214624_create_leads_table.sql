-- OddBot leads table
-- Stores every email submission along with the project brief captured in conversation.

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  name        text,
  project_type  text,
  description text,
  timeline    text,
  budget_range text,
  raw_brief   jsonb,          -- full brief object as fallback
  source      text default 'oddbot',
  created_at  timestamptz not null default now()
);

-- Index on email for quick lookups / deduplication
create index if not exists leads_email_idx on public.leads (email);

-- Index on created_at for dashboard ordering
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Row Level Security — table is insert-only from the public anon key
alter table public.leads enable row level security;

-- Allow the serverless function (service role) to insert freely
create policy "service role can insert leads"
  on public.leads for insert
  with check (true);

-- Block all public reads — only the Supabase dashboard / service role can read
create policy "no public read"
  on public.leads for select
  using (false);
