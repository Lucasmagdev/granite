create table if not exists public.estimate_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text not null,
  address text,
  project_type text not null,
  stone_type text not null,
  measurements text,
  timeline text,
  comments text,
  photo_names text[] default '{}',
  contacted boolean not null default false,
  contacted_at timestamptz,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  notes text,
  source text not null default 'website'
);

alter table public.estimate_requests
  add column if not exists contacted boolean not null default false,
  add column if not exists contacted_at timestamptz,
  add column if not exists status text not null default 'new',
  add column if not exists notes text,
  add column if not exists source text not null default 'website';

alter table public.estimate_requests enable row level security;

drop policy if exists "Allow public estimate submissions" on public.estimate_requests;
drop policy if exists "Allow authenticated admins to manage estimates" on public.estimate_requests;

create policy "Allow public estimate submissions"
  on public.estimate_requests
  for insert
  to anon
  with check (true);

create policy "Allow authenticated admins to manage estimates"
  on public.estimate_requests
  for all
  to authenticated
  using (true)
  with check (true);
