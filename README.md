# Apex

Астрологический веб-продукт на русском языке — минималистичный UI в стиле Co-Star, персональный гороскоп, натальная карта и AI-чат.

## Быстрый старт

```bash
cp .env.example .env.local
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000). Дизайн-система: [http://localhost:3000/design](http://localhost:3000/design).

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Dev-сервер |
| `npm run build` | Production-сборка |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Деплой на Vercel

1. Создай проект на [vercel.com/new](https://vercel.com/new) и подключи репозиторий.
2. Framework preset: **Next.js** (определяется автоматически).
3. Скопируй переменные из `.env.example` в Environment Variables.
4. Push в `main` → автодеплой на staging URL.

## Структура

```
src/
  app/           # routes
  components/    # UI
  lib/
    astrology/   # расчёты
    ai/          # DeepSeek/Qwen
    db/          # Supabase
    i18n/        # русские строки
  types/
```

## Документация

- [Design doc](./docs/plans/2026-06-07-apex-astrology-design.md)
- [Implementation plan](./docs/plans/2026-06-07-apex-implementation-plan.md)
