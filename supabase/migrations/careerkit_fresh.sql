-- CareerKit: combined migration for fresh Supabase DB
-- Run once in Supabase SQL editor.
--
-- This script is equivalent to running (in order):
-- 1) 00000000000001_careerkit_schema.sql
-- 2) 00000000000002_careerkit_ats_cache.sql
-- 3) 00000000000003_careerkit_application_search_rpc.sql
--
-- Helper: keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Resumes
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled Resume',
  template_id text not null default 'default',
  content jsonb not null default '{}',
  initial_job_title text,
  initial_job_description text,
  last_ats_score smallint check (last_ats_score is null or (last_ats_score >= 0 and last_ats_score <= 100)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_resumes_user_id on public.resumes(user_id);
create index if not exists idx_resumes_updated_at on public.resumes(updated_at desc);

alter table public.resumes enable row level security;
create policy "Users can do everything on own resumes"
  on public.resumes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger set_resumes_updated_at
  before update on public.resumes
  for each row execute function public.set_updated_at();

-- Applications
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  job_url text,
  job_description text,
  status text not null default 'saved' check (status in (
    'saved', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn'
  )),
  applied_at timestamptz,
  notes text,
  resume_id uuid references public.resumes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_applications_user_id on public.applications(user_id);
create index if not exists idx_applications_status on public.applications(status);
create index if not exists idx_applications_applied_at on public.applications(applied_at desc nulls last);
create index if not exists idx_applications_resume_id on public.applications(resume_id);

alter table public.applications enable row level security;
create policy "Users can do everything on own applications"
  on public.applications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger set_applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- Profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  summary text,
  location text,
  experience jsonb not null default '[]',
  education jsonb not null default '[]',
  certifications jsonb not null default '[]',
  projects jsonb not null default '[]',
  languages jsonb not null default '[]',
  skills jsonb not null default '[]',
  onboarding_skipped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_user_id on public.profiles(user_id);

alter table public.profiles enable row level security;
create policy "Users can do everything on own profile"
  on public.profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ATS caching columns
alter table public.resumes
  add column if not exists last_ats_job_hash text;

alter table public.resumes
  add column if not exists last_ats_feedback text;

alter table public.resumes
  add column if not exists last_ats_aspects jsonb;

-- Application search RPCs (safe, parameterized)

-- Fetch applications for a user with optional filters.
-- q is matched against company and role using ILIKE with wildcard escaping.
create or replace function public.search_applications(
  p_status text,
  p_q text,
  p_page int,
  p_page_size int
)
returns table (
  id uuid,
  company text,
  role text,
  status text,
  applied_at timestamptz,
  updated_at timestamptz,
  resume_id uuid,
  resume_name text
)
language plpgsql
stable
as $$
declare
  v_uid uuid := auth.uid();
  v_offset int := greatest(p_page - 1, 0) * p_page_size;
  v_limit int := greatest(p_page_size, 1);
  v_q_trimmed text;
  v_like_pattern text;
begin
  v_q_trimmed := nullif(btrim(p_q), '');
  if v_q_trimmed is not null then
    -- Escape backslash, percent, underscore for LIKE ... ESCAPE '\'
    v_like_pattern :=
      replace(
        replace(
          replace(v_q_trimmed, '\\', '\\\\'),
          '%',
          '\\%'
        ),
        '_',
        '\\_'
      );
  else
    v_like_pattern := null;
  end if;

  return query
  select
    a.id,
    a.company,
    a.role,
    a.status,
    a.applied_at,
    a.updated_at,
    a.resume_id,
    r.name as resume_name
  from public.applications a
  left join public.resumes r on r.id = a.resume_id
  where a.user_id = v_uid
    and (p_status is null or p_status = '' or a.status = p_status)
    and (
      v_like_pattern is null
      or (
        a.company ilike ('%' || v_like_pattern || '%') escape '\\'
        or a.role ilike ('%' || v_like_pattern || '%') escape '\\'
      )
    )
  order by a.updated_at desc
  limit v_limit offset v_offset;
end;
$$;

-- Count applications for a user with the same optional filters.
create or replace function public.count_applications(
  p_status text,
  p_q text
)
returns bigint
language plpgsql
stable
as $$
declare
  v_uid uuid := auth.uid();
  v_q_trimmed text;
  v_like_pattern text;
begin
  v_q_trimmed := nullif(btrim(p_q), '');
  if v_q_trimmed is not null then
    v_like_pattern :=
      replace(
        replace(
          replace(v_q_trimmed, '\\', '\\\\'),
          '%',
          '\\%'
        ),
        '_',
        '\\_'
      );
  else
    v_like_pattern := null;
  end if;

  return (
    select count(*)
    from public.applications a
    where a.user_id = v_uid
      and (p_status is null or p_status = '' or a.status = p_status)
      and (
        v_like_pattern is null
        or (
          a.company ilike ('%' || v_like_pattern || '%') escape '\\'
          or a.role ilike ('%' || v_like_pattern || '%') escape '\\'
        )
      )
  );
end;
$$;

