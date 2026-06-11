-- Telegram Login Widget: store Telegram user id on profile
alter table public.profiles
  add column if not exists telegram_id bigint;

create unique index if not exists profiles_telegram_id_key
  on public.profiles (telegram_id)
  where telegram_id is not null;
