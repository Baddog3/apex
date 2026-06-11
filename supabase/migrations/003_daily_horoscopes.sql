-- Daily horoscope cache: one row per user per local calendar day

create table public.daily_horoscopes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  horoscope_date date not null,
  text text not null,
  main_transit jsonb,
  chart_fingerprint text not null,
  source text not null,
  created_at timestamptz not null default now(),
  constraint daily_horoscopes_user_date_key unique (user_id, horoscope_date),
  constraint daily_horoscopes_source_check
    check (source in ('ai', 'fallback'))
);

create index daily_horoscopes_user_id_date_idx
  on public.daily_horoscopes (user_id, horoscope_date desc);

alter table public.daily_horoscopes enable row level security;

create policy "daily_horoscopes_select_own"
  on public.daily_horoscopes
  for select
  to authenticated
  using (auth.uid() = user_id);

grant select on table public.daily_horoscopes to authenticated;
grant all on table public.daily_horoscopes to postgres, service_role;
