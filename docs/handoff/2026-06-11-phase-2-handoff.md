# Handoff — Фаза 2 завершена

**Дата:** 2026-06-11  
**Repo:** https://github.com/Baddog3/apex  
**Последний коммит:** `c0eca24` — feat: Фаза 2 — астрологический движок, геокодинг и API карты

---

## Что сделано

### Шаг 2.1 — Ephemeris + расчёт натальной карты
- Выбран **`circular-natal-horoscope-js`** (tropical, Placidus)
- `src/lib/astrology/calculate.ts` — `calculateNatalChart()`
- Типы: `BirthData`, `NatalChartResult`, планеты, дома, аспекты
- Без времени рождения: планеты на полдень, без домов/углов
- Unit-тест эталонной карты Barack Obama (astro.com)
- **Vitest** добавлен: `npm test`, `npm run test:watch`

### Шаг 2.2 — Геокодинг
- `src/lib/geocoding/` — DaData (если `GEOCODING_API_KEY`) + fallback Nominatim
- `geo-tz` — IANA timezone по координатам
- `POST /api/geocode` — `{ query }` → `{ results: [{ name, lat, lng, timezone }] }`
- `CityInput` — autocomplete с debounce 300 ms

### Шаг 2.3 — Транзиты
- `src/lib/astrology/transits.ts` — `calculateTransits(natal, at?)`
- `GET /api/transits` — транзиты для авторизованного пользователя (`?date=YYYY-MM-DD` опционально)
- Доступ только к своей карте (userId в query игнорируется, если не совпадает с сессией)

### Шаг 2.4 — Кэш карты
- `POST /api/chart/compute` — расчёт + upsert в `natal_charts`
- Fingerprint birth data → повторный запрос отдаёт кэш (`cached: true`)
- Обновляет `profiles`: `sun_sign`, `moon_sign`, `rising_sign`, birth fields
- `force: true` — принудительный пересчёт

### Шаг 2.5 — Текст для AI
- `chartToPrompt(chart, transits?)` — компактный русский текст для промпта
- i18n: знаки, планеты, аспекты в `src/lib/i18n/ru.ts` → `astrology.*`
- Unit-тест на стабильный output

### Зависимости
- `circular-natal-horoscope-js`, `geo-tz`, `vitest`

### Проверки
- `npm test` ✓ (13 тестов)
- `npm run build` ✓
- `npm run lint` ✓

---

## Что не сделано / открыто

| Пункт | Статус | Действие |
|---|---|---|
| Фаза 3 — онбординг wizard | Не начата | 3 шага: имя+дата → `CityInput` → время |
| `POST /api/onboarding/complete` | Нет | Связать wizard → profile + chart/compute |
| UI экранов «Сегодня» / «Карта» | Заглушки | Фазы 4–5 |
| `GEOCODING_API_KEY` | Опционально | DaData для лучшего RU-autocomplete; без ключа — Nominatim |
| Telegram / Email auth | Как в Фазе 1 | Ручная настройка env + Supabase Dashboard |
| CI (GitHub Actions) | Нет | Добавить `npm test` + lint + build на PR |
| `CityInput` на `/design` | Не подключён | Компонент готов, ждёт онбординг |
| Rate limit на `/api/geocode` | Нет | Nominatim: 1 req/s — debounce помогает, но нет серверного лимита |

---

## Что сломано

**Ничего критичного.** Сборка, lint и тесты проходят.

Мелочи (не блокеры):
- Next.js 16: предупреждение `middleware` → `proxy` (работает)
- `/api/geocode` и `/api/chart/compute` требуют авторизации — без сессии 401 (ожидаемо)
- `GET /api/transits` вернёт 404, если карта ещё не посчитана в `natal_charts`
- Nominatim может быть медленным или rate-limit из некоторых сетей
- `npm audit` — 2 moderate в dev-зависимостях

---

## Как проверить локально

```bash
cd /Users/hilulai/Documents/Apex
npm install
npm test
npm run dev
```

### API (нужна сессия — войти через `/login`)

```bash
# Геокодинг
curl -X POST http://localhost:3000/api/geocode \
  -H "Content-Type: application/json" \
  -H "Cookie: <session>" \
  -d '{"query":"Москва"}'
# → lat ~55.7558, lng ~37.6173, timezone Europe/Moscow

# Расчёт карты
curl -X POST http://localhost:3000/api/chart/compute \
  -H "Content-Type: application/json" \
  -H "Cookie: <session>" \
  -d '{"date":"1990-05-15","time":"14:30","lat":55.7558,"lng":37.6173,"timezone":"Europe/Moscow","placeName":"Москва"}'

# Транзиты (после compute)
curl http://localhost:3000/api/transits \
  -H "Cookie: <session>"
```

---

## С чего начать следующий чат

Скопируй в новый чат:

```
Продолжаем Apex. Handoff: docs/handoff/2026-06-11-phase-2-handoff.md
План: docs/plans/2026-06-07-apex-implementation-plan.md

Задача: Фаза 3 — Онбординг (шаги 3.1–3.3).
Начни с 3.1: wizard UI (дата → город → время).
```

### Рекомендуемый порядок Фазы 3

1. **3.1** — Wizard: 3 шага, `CityInput`, прогресс, валидация
2. **3.2** — `POST /api/onboarding/complete` → profiles + chart/compute → редирект `/today`
3. **3.3** — CTA «добавь время» для пользователей без `birth_time`

### Ключевые файлы для контекста

- `src/lib/astrology/` — расчёты, `chartToPrompt`
- `src/lib/geocoding/` + `src/components/CityInput.tsx`
- `src/app/api/chart/compute/route.ts`
- `src/app/api/geocode/route.ts`
- `supabase/migrations/001_initial.sql` — profiles, natal_charts
- `src/lib/i18n/ru.ts` — UI-строки

---

## Безопасность

- `.env.local` не в git
- `GEOCODING_API_KEY` — только сервер (DaData Token)
- API chart/transits/geocode — только для авторизованных пользователей
