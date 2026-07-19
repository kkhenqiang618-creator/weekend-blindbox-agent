create table if not exists public.wb_user_profiles (
  session_id text primary key,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists wb_user_profiles_updated_at_idx
  on public.wb_user_profiles (updated_at desc);

alter table public.wb_user_profiles enable row level security;

comment on table public.wb_user_profiles is
  'Anonymous WeekendBuddy preference profiles aggregated by the server-side learner.';
