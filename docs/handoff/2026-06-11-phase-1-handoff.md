# Handoff — Фаза 1 завершена

**Дата:** 2026-06-11  
**Repo:** https://github.com/Baddog3/apex  
**Последний коммит:** `896ca9a` — feat: Фаза 1 — Supabase, авторизация и навигация

---

## Что сделано

### Шаг 1.1 — Supabase и схема
- Cloud-проект Supabase создан и связан (`supabase link`)
- Миграции: `001_initial.sql` (profiles, natal_charts, compatibility_links, chat_messages, RLS, триггер профиля), `002_telegram_id.sql`
- Клиенты: `src/lib/db/{client,server,admin,middleware}.ts`, типы `types.ts`
- Скрипты: `npm run db:{start,stop,reset,push}`

### Шаг 1.2 — Email magic link
- `/login` — форма OTP (`signInWithOtp`)
- `/auth/callback` — `exchangeCodeForSession` → редирект на `/today`
- `src/middleware.ts` — защита маршрутов, публичные: `/`, `/login`, `/auth/callback`, `/design`, `/api/auth`
- `getUser()` / `useUser()` в `src/lib/auth/`

### Шаг 1.3 — Telegram Login Widget
- `POST /api/auth/telegram` — HMAC-верификация hash, создание пользователя, сессия
- Виджет на `/login` (`telegram-login.tsx`)
- Колонка `profiles.telegram_id`

### Шаг 1.4 — Навигация
- `AppLayout` + `TabPage`, общий `APP_TABS` в `src/lib/navigation.ts`
- Заглушки: `/today`, `/chart`, `/compatibility`, `/chat`, `/profile`
- На `/profile` — кнопка «Выйти»
- Лендинг `/` с CTA «Вход»

### Инфраструктура
- `.env.example` дополнен Telegram-переменными
- `npm run build` ✓ · `npm run lint` ✓
- Push в `main` на GitHub

---

## Что не сделано / открыто

| Пункт | Статус | Действие |
|---|---|---|
| Telegram Bot (@BotFather) | Код готов, бот не подтверждён | `TELEGRAM_BOT_TOKEN` + `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` в `.env.local`, `/setdomain` → `localhost` |
| Supabase Email Auth URLs | Ручная настройка | Dashboard → Auth → Site URL `http://localhost:3000`, Redirect `http://localhost:3000/auth/callback` |
| Vercel deploy | Не подтверждён | Import repo + env vars из `.env.example` |
| CI (GitHub Actions) | Нет | lint + build на PR — по желанию |
| `supabase db push` | Таймаут из локальной сети | Миграции применены через Management API; для новых — `db push` или SQL Editor |
| Локальный Supabase | Docker не запущен | `npm run db:start` после Docker Desktop |
| Линковка email ↔ Telegram | Не реализована | Один аккаунт = один способ входа; merge — позже при необходимости |

---

## Что сломано

**Ничего критичного.** Сборка и lint проходят.

Мелочи (не блокеры):
- Next.js 16 предупреждает: `middleware` deprecated → `proxy` (пока работает)
- `npm audit` — 2 moderate в dev-зависимостях
- Без Telegram env на `/login` показывается «Telegram-вход не настроен» — ожидаемо
- Magic link не сработает без Email provider + redirect URLs в Supabase Dashboard
- Папки `src/lib/astrology/` и `src/lib/ai/` — пустые заготовки, к Фазе 2

---

## Как проверить локально

```bash
cd /Users/hilulai/Documents/Apex
cp .env.example .env.local   # заполнить Supabase keys
npm install
npm run dev
```

| URL | Ожидание |
|---|---|
| http://localhost:3000 | Лендинг + кнопка «Вход» |
| http://localhost:3000/login | Email + Telegram (если настроен) |
| http://localhost:3000/today | Редирект на `/login` без сессии |
| После входа | 5 вкладок, заглушки, выход на `/profile` |

```bash
npm run build   # должен быть зелёным
```

---

## С чего начать следующий чат

Скопируй в новый чат:

```
Продолжаем Apex. Handoff: docs/handoff/2026-06-11-phase-1-handoff.md
План: docs/plans/2026-06-07-apex-implementation-plan.md

Задача: Фаза 2 — Астрологический движок (шаги 2.1–2.5).
Начни с 2.1: ephemeris + src/lib/astrology/calculate.ts.
```

### Рекомендуемый порядок Фазы 2

1. **2.1** — `circular-natal-horoscope-js` (или аналог) + `calculate.ts` + unit-тест эталонной карты
2. **2.2** — `POST /api/geocode` + autocomplete города
3. **2.3** — `transits.ts` + `GET /api/transits`
4. **2.4** — `POST /api/chart/compute` + кэш в `natal_charts`
5. **2.5** — `chartToPrompt()` для AI-контекста

### Env на Фазу 2

```
# уже есть из Фазы 1
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# для геокодинга (шаг 2.2)
GEOCODING_API_KEY=          # DaData или Nominatim
```

### Ключевые файлы для контекста

- `docs/plans/2026-06-07-apex-astrology-design.md` — продукт и архитектура
- `supabase/migrations/001_initial.sql` — схема profiles + natal_charts
- `src/lib/db/` — Supabase clients
- `src/types/index.ts` — `SubscriptionTier`
- `src/lib/i18n/ru.ts` — все UI-строки

---

## Безопасность

- `.env.local` не в git — не коммитить
- `SUPABASE_SERVICE_ROLE_KEY` и `TELEGRAM_BOT_TOKEN` — только сервер / локальный файл
- Supabase Access Token (`sbp_…`) — для CLI; хранить локально, не в чат
