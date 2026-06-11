# Handoff — Фаза 4 завершена

**Дата:** 2026-06-11  
**Repo:** https://github.com/Baddog3/apex  
**Последний коммит:** `20359ff` — feat: Фаза 3 — онбординг, сохранение карты и CTA времени рождения  
**Статус:** изменения Фазы 4 в рабочей директории, **ещё не закоммичены**

---

## Что сделано

### Шаг 4.1 — Генерация текста гороскопа
- `GET /api/horoscope/today` — авторизованный endpoint, JSON с текстом дня
- Пайплайн: натальная карта → транзиты на «сегодня» → AI (DeepSeek → Qwen) или fallback
- `src/lib/ai/client.ts` — минимальный OpenAI-compatible клиент с автопереключением провайдеров
- `src/lib/horoscope/` — генерация, fallback по главному транзиту, формат подписи, дата в таймзоне
- Кэш в БД: таблица `daily_horoscopes` (миграция `003_daily_horoscopes.sql`)
  - уникальность `(user_id, horoscope_date)`
  - инвалидация при смене карты через `chart_fingerprint`
- Без AI-ключей: `source: "fallback"`, текст из шаблонов

### Шаг 4.2 — UI экрана «Сегодня»
- `/today` — SSR через `getTodayHoroscope()`, без лишнего спиннера на первом рендере
- Приветствие: «Привет, {имя}» (fallback — знак Солнца)
- Карточка гороскопа — крупный текст, минималистичная рамка
- Карточка главного транзита — «Сатурн □ твоя луна» и т.п.
- Pull-to-refresh на мобильном + кнопка «Попробовать снова» при ошибке
- `BirthTimeBanner` сохранён для пользователей без `birth_time`

### Рефакторинг
- `getTodayHoroscope()` — общая серверная логика для API и страницы
- API route `horoscope/today` — тонкая обёртка над хелпером
- `TabPage` — `description` стал опциональным

### Проверки
- `npm test` ✓ (28 тестов)
- `npm run build` ✓
- `npm run lint` ✓

---

## Что не сделано / открыто

| Пункт | Статус | Действие |
|---|---|---|
| Фаза 5 — экран «Моя карта» | Заглушка | SVG-колесо + список планет |
| Миграция `003_daily_horoscopes.sql` | Файл есть | `npm run db:push` на каждом окружении |
| Коммит Фазы 4 | Не сделан | Закоммитить перед PR |
| Фаза 6 — AI-чат | Не начата | Полный `ai/client` + промпты + UI чата |
| `GEOCODING_API_KEY` | Опционально | DaData для лучшего RU-autocomplete |
| Telegram / Email auth | Как в Фазе 1 | Ручная настройка env + Supabase Dashboard |
| CI (GitHub Actions) | Нет | `npm test` + lint + build на PR |
| Rate limit на `/api/geocode` | Нет | Debounce на клиенте есть, серверного лимита нет |
| Redis для кэша гороскопа | Не нужен в MVP | Используется PostgreSQL |

---

## Что сломано

**Ничего критичного.** Сборка, lint и тесты проходят.

Мелочи (не блокеры):
- **Без `db:push` гороскоп падает** — таблица `daily_horoscopes` не существует → 500 на `/today` и API
- Next.js 16: предупреждение `middleware` → `proxy` (работает)
- Pull-to-refresh не перегенерирует текст в тот же день — отдаёт кэш из БД (ожидаемо)
- «Сегодня» считается по `birth_timezone` профиля, не по текущей геолокации — ок для MVP
- Без `DEEPSEEK_API_KEY` / `QWEN_API_KEY` всегда fallback-текст (не баг)
- `natal_charts` upsert из user-клиента — как в Фазе 2/3; в миграции задуман service role
- `npm audit` — moderate в dev-зависимостях

---

## Как проверить локально

```bash
cd /Users/hilulai/Documents/Apex
npm install
npm run db:push    # обязательно: миграция 003
npm test
npm run dev
```

### Flow «Сегодня»
1. Войти через `/login`, пройти онбординг (если ещё не)
2. Открыть `/today` — приветствие + текст гороскопа + карточка транзита
3. Потянуть экран вниз (мобильный) — обновление из API
4. Без AI-ключей в `.env.local` — `source: "fallback"` в ответе API

### API (нужна сессия)

```bash
curl http://localhost:3000/api/horoscope/today \
  -H "Cookie: <session>"
```

Пример ответа:

```json
{
  "date": "2026-06-11",
  "text": "…",
  "mainTransit": { "transitPlanet": "saturn", "natalBody": "moon", "type": "square", "orb": 1.2 },
  "mainTransitLabel": "Сатурн □ твоя луна",
  "source": "fallback",
  "cached": false
}
```

---

## С чего начать следующий чат

### Рекомендуемый порядок Фазы 5

1. **5.1** — `NatalChartWheel`: SVG-колесо (знаки, планеты, аспекты; без домов без `birth_time`)
2. **5.2** — список планет под колесом + freemium-заглушки для premium-секций

### Ключевые файлы для контекста

- `src/lib/astrology/calculate.ts` — структура `NatalChartResult`
- `src/lib/astrology/persist-natal-chart.ts` + `natal_charts` в БД
- `src/app/chart/page.tsx` — заглушка, ждёт Фазу 5
- `src/app/api/chart/compute/route.ts` — получение/пересчёт карты
- `src/lib/i18n/ru.ts` — `astrology.planets`, `astrology.signs`
- `docs/plans/2026-06-07-apex-implementation-plan.md` — Фаза 5

---

## Безопасность

- `.env.local` не в git
- `DEEPSEEK_API_KEY` / `QWEN_API_KEY` — только сервер
- `daily_horoscopes` — SELECT через RLS; запись через `createAdminClient()` в API
- Horoscope API — только для авторизованных пользователей

---

## Первая фраза для нового чата

```
Продолжаем Apex. Handoff: docs/handoff/2026-06-11-phase-4-handoff.md
План: docs/plans/2026-06-07-apex-implementation-plan.md

Задача: Фаза 5 — Экран «Моя карта» (шаги 5.1–5.2).
Начни с 5.1: компонент NatalChartWheel (SVG-колесо).
```
