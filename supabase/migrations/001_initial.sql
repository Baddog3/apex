-- Apex initial schema: profiles, natal charts, compatibility, chat
-- RLS: authenticated users see and mutate only their own rows

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  birth_date date,
  birth_time time,
  birth_place_name text,
  birth_lat double precision,
  birth_lng double precision,
  birth_timezone text,
  sun_sign text,
  moon_sign text,
  rising_sign text,
  subscription_tier text not null default 'free',
  messages_today_count int not null default 0,
  messages_reset_date date not null default current_date,
  dossier jsonb not null default '[]'::jsonb,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint profiles_subscription_tier_check
    check (subscription_tier in ('free', 'premium'))
);

-- ---------------------------------------------------------------------------
-- natal_charts (cached computation)
-- ---------------------------------------------------------------------------
create table public.natal_charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  chart_data jsonb not null,
  has_birth_time boolean not null default false,
  computed_at timestamptz not null default now(),
  constraint natal_charts_user_id_key unique (user_id)
);

create index natal_charts_user_id_idx on public.natal_charts (user_id);

-- ---------------------------------------------------------------------------
-- compatibility_links
-- ---------------------------------------------------------------------------
create table public.compatibility_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  partner_name text not null,
  partner_birth_date date not null,
  partner_birth_time time,
  partner_birth_place_name text,
  partner_lat double precision,
  partner_lng double precision,
  partner_timezone text,
  synastry_data jsonb,
  created_at timestamptz not null default now()
);

create index compatibility_links_user_id_idx on public.compatibility_links (user_id);

-- ---------------------------------------------------------------------------
-- chat_messages
-- ---------------------------------------------------------------------------
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now(),
  constraint chat_messages_role_check
    check (role in ('user', 'assistant'))
);

create index chat_messages_user_id_created_at_idx
  on public.chat_messages (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.natal_charts enable row level security;
alter table public.compatibility_links enable row level security;
alter table public.chat_messages enable row level security;

-- profiles
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- natal_charts: read-only for clients; writes via service role in API
create policy "natal_charts_select_own"
  on public.natal_charts
  for select
  to authenticated
  using (auth.uid() = user_id);

-- compatibility_links
create policy "compatibility_links_select_own"
  on public.compatibility_links
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "compatibility_links_insert_own"
  on public.compatibility_links
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "compatibility_links_update_own"
  on public.compatibility_links
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "compatibility_links_delete_own"
  on public.compatibility_links
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- chat_messages: users read own thread; user-role inserts from client if needed
create policy "chat_messages_select_own"
  on public.chat_messages
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "chat_messages_insert_own_user_role"
  on public.chat_messages
  for insert
  to authenticated
  with check (auth.uid() = user_id and role = 'user');

-- Grants for Supabase API roles
grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant select, update on table public.profiles to authenticated;
grant select on table public.natal_charts to authenticated;
grant select, insert, update, delete on table public.compatibility_links to authenticated;
grant select, insert on table public.chat_messages to authenticated;

grant all on all sequences in schema public to postgres, service_role;

alter default privileges in schema public
  grant all on sequences to postgres, service_role;
