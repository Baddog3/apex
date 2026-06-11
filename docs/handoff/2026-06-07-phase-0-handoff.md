# Handoff — Фаза 0 завершена

**Дата:** 2026-06-07  
**Repo:** https://github.com/Baddog3/apex  
**Последний коммит:** `3f98e54` — feat: инициализация Apex — Next.js скелет и дизайн-система

---

## Что сделано

### Шаг 0.1 — Next.js скелет
- Next.js 16.2.7, TypeScript, Tailwind 4, App Router, `src/`
- ESLint (`eslint-config-next`) + Prettier (`eslint-config-prettier`)
- Структура: `src/app`, `src/components/ui`, `src/lib/{astrology,ai,db,i18n}`, `src/types`
- Главная `/` — минимальная заглушка «Apex»
- `npm run build` ✓ · `npm run lint` ✓

### Шаг 0.2 — Дизайн-система
- Палитра: `#000` / `#fff` / `#888`, тёмная тема по умолчанию (`html.dark`)
- Шрифт Geist Sans + Geist Mono (кириллица)
- Компоненты: `Button`, `Input`, `Card`, `TabBar`, `Layout` → `src/components/ui/`
- Витрина: **`/design`** — все базовые компоненты
- i18n-заготовка: `src/lib/i18n/ru.ts` (nav + app name)

### Шаг 0.3 — Env и Git
- `.env.example` — Supabase, DeepSeek, Qwen, geocoding
- `vercel.json` — конфиг деплоя
- `README.md` — инструкции по запуску и деплою
- GitHub repo создан, `main` запушен

---

## Что не сделано / открыто

| Пункт | Статус | Действие |
|---|---|---|
| Vercel import | ❓ Не подтверждено | [vercel.com/new](https://vercel.com/new) → Import `Baddog3/apex` → Deploy |
| CI (GitHub Actions) | Не настроен | Не было в Фазе 0; можно добавить lint+build на PR позже |
| `.env.local` | Нет | Нужен только с Фазы 1 (Supabase keys) |
| Storybook | Не используется | Вместо него `/design` |
| `.claude/` | Не в git | Локальные Cursor skills; в репо не коммитили |

---

## Что сломано

**Ничего критичного.** Сборка и л lint проходят.

Мелочи (не блокеры):
- `npm audit` — 2 moderate vulnerabilities в dev-зависимостях (стандартно для create-next-app)
- TabBar/Layout ссылаются на `/today`, `/chart` и т.д. — **маршрутов пока нет**, клик → 404 (ожидаемо до Фазы 1.4)
- i18n частичный: только `app` + `nav`, не все строки UI через ключи (расширять по мере экранов)

---

## Как проверить локально

```bash
cd /Users/hilulai/Documents/Apex
npm install
npm run dev
# http://localhost:3000       — главная
# http://localhost:3000/design — дизайн-система
npm run build   # должен быть зелёным
```

---

## С чего начать следующий чат

Скопируй в новый чат:

```
Продолжаем Apex. Handoff: docs/handoff/2026-06-07-phase-0-handoff.md
План: docs/plans/2026-06-07-apex-implementation-plan.md

Задача: Фаза 1 — База и авторизация (шаги 1.1–1.4).
Начни с 1.1: Supabase project + миграция 001_initial.sql + RLS.
```

### Рекомендуемый порядок Фазы 1

1. **1.1** — Supabase: создать project, `supabase/migrations/001_initial.sql`, RLS policies, `@supabase/ssr` клиент в `src/lib/db/`
2. **1.2** — Email magic link: `/login`, `/auth/callback`, middleware, `getUser()` / `useUser()`
3. **1.3** — Telegram Login Widget (нужен BotFather + env `TELEGRAM_BOT_TOKEN`)
4. **1.4** — `AppLayout` + TabBar на реальных страницах-заглушках (5 вкладок)

### Env, которые понадобятся в Фазе 1

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# + позже для Telegram:
TELEGRAM_BOT_TOKEN=
```

### Ключевые файлы для контекста

- `docs/plans/2026-06-07-apex-astrology-design.md` — продукт и архитектура
- `src/components/ui/Layout.tsx` — навигация уже готова
- `src/lib/i18n/ru.ts` — русские строки nav
- `src/types/index.ts` — `SubscriptionTier`

---

## Безопасность

GitHub PAT был отправлен в чат ранее — **отозвать**, если ещё не сделано: https://github.com/settings/tokens
