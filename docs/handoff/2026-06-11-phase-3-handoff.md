# Handoff — Фаза 3 завершена

**Дата:** 2026-06-11  
**Repo:** https://github.com/Baddog3/apex  
**Последний коммит:** `20359ff` — feat: Фаза 3 — онбординг, сохранение карты и CTA времени рождения

---

## Что сделано

### Шаг 3.1 — Wizard UI (3 шага)
- `/onboarding` — wizard без TabBar, мобильная вёрстка (`min-h-dvh`, sticky footer)
- **Шаг 1:** имя + дата рождения (нативный date picker)
- **Шаг 2:** город через `CityInput` (обязателен выбор из списка)
- **Шаг 3:** время (time picker) + «Готово» / «Не знаю»
- Прогресс-индикатор (3 точки) + подпись текущего шага
- Валидация на клиенте: `src/lib/onboarding/validation.ts` + unit-тесты
- i18n: `onboarding.*` в `src/lib/i18n/ru.ts`

### Шаг 3.2 — Сохранение и расчёт
- `POST /api/onboarding/complete` — валидация тела, сохранение профиля, расчёт карты
- `onboarding_completed = true`, обновление `sun_sign` / `moon_sign` / `rising_sign`
- Upsert в `natal_charts` через общий хелпер `persistNatalChart()`
- Wizard → API → редирект `/today`
- Middleware: незавершённый онбординг → `/onboarding`; завершённый на `/onboarding` → `/today`
- API-маршруты (`/api/geocode` и др.) доступны во время wizard

### Шаг 3.3 — CTA «добавь время»
- `BirthTimeBanner` на `/today` и `/chart`, если `birth_time IS NULL`
- Страница `/profile/birth-time` — форма ввода времени
- `POST /api/profile/birth-time` — обновление времени + пересчёт карты
- После сохранения — редирект на `/chart`, баннер исчезает

### Рефакторинг
- `src/lib/astrology/persist-natal-chart.ts` — общая логика расчёта + upsert (используется в `chart/compute`, onboarding, birth-time)
- `src/lib/auth/get-profile.ts` — серверный доступ к профилю
- `src/lib/onboarding/parse-body.ts` — серверная валидация тела onboarding API

### Проверки
- `npm test` ✓ (22 теста)
- `npm run build` ✓
- `npm run lint` ✓

---

## Что не сделано / открыто

| Пункт | Статус | Действие |
|---|---|---|
| Фаза 4 — экран «Сегодня» | Не начата | `GET /api/horoscope/today` + UI карточки |
| Фаза 5 — экран «Моя карта» | Заглушка | SVG-колесо + список планет |
| Экраны `/today`, `/chart` | Минимальный UI | Только приветствие / empty state + баннер времени |
| `GEOCODING_API_KEY` | Опционально | DaData для лучшего RU-autocomplete; без ключа — Nominatim |
| Telegram / Email auth | Как в Фазе 1 | Ручная настройка env + Supabase Dashboard |
| CI (GitHub Actions) | Нет | Добавить `npm test` + lint + build на PR |
| `CityInput` на `/design` | Не подключён | Компонент используется в онбординге |
| Rate limit на `/api/geocode` | Нет | Nominatim: 1 req/s — debounce помогает, но нет серверного лимита |
| Модалка для birth-time | Страница вместо модалки | План допускал модалку; реализована отдельная страница — ок для MVP |

---

## Что сломано

**Ничего критичного.** Сборка, lint и тесты проходят.

Мелочи (не блокеры):
- Next.js 16: предупреждение `middleware` → `proxy` (работает)
- Middleware делает запрос к `profiles` на каждый авторизованный hit — ок для MVP, позже кэшировать
- `/api/geocode`, `/api/chart/compute`, onboarding API — только для авторизованных (401 без сессии, ожидаемо)
- `GET /api/transits` вернёт 404, если карта ещё не посчитана
- Nominatim может быть медленным или rate-limit из некоторых сетей
- Пользователь, прошедший онбординг без времени, видит частичную карту (планеты на полдень) — ожидаемо
- `npm audit` — moderate в dev-зависимостях

---

## Как проверить локально

```bash
cd /Users/hilulai/Documents/Apex
npm install
npm test
npm run dev
```

### Flow онбординга
1. Войти через `/login`
2. Редирект на `/onboarding` (если `onboarding_completed = false`)
3. Имя + дата → город (выбрать из списка) → «Не знаю» на времени
4. Попасть на `/today` с баннером «Добавь время рождения»
5. `/profile/birth-time` → указать время → редирект на `/chart`, баннер исчезает

### API (нужна сессия)

```bash
# Завершение онбординга
curl -X POST http://localhost:3000/api/onboarding/complete \
  -H "Content-Type: application/json" \
  -H "Cookie: <session>" \
  -d '{
    "name": "Аня",
    "birthDate": "1990-05-15",
    "birthTime": null,
    "lat": 55.7558,
    "lng": 37.6173,
    "timezone": "Europe/Moscow",
    "placeName": "Москва"
  }'

# Дозаполнение времени
curl -X POST http://localhost:3000/api/profile/birth-time \
  -H "Content-Type: application/json" \
  -H "Cookie: <session>" \
  -d '{"time": "14:30"}'
```

---

## С чего начать следующий чат

### Рекомендуемый порядок Фазы 4

1. **4.1** — `GET /api/horoscope/today`: транзиты → шаблон / AI, кэш на день
2. **4.2** — UI экрана: приветствие по имени, карточка гороскопа, главный транзит

### Ключевые файлы для контекста

- `src/lib/astrology/transits.ts` + `GET /api/transits`
- `src/lib/astrology/chart-to-prompt.ts` — текст карты для AI
- `src/lib/auth/get-profile.ts` — имя, знаки, birth data
- `src/app/today/page.tsx` — заглушка, ждёт Фазу 4
- `src/lib/i18n/ru.ts` — UI-строки
- `docs/plans/2026-06-07-apex-implementation-plan.md` — Фаза 4

---

## Безопасность

- `.env.local` не в git
- `GEOCODING_API_KEY` — только сервер (DaData Token)
- Onboarding / chart / transits / geocode API — только для авторизованных пользователей
- Серверная валидация тела onboarding (не полагаться только на клиент)

---

## Первая фраза для нового чата

```
Продолжаем Apex. Handoff: docs/handoff/2026-06-11-phase-3-handoff.md
План: docs/plans/2026-06-07-apex-implementation-plan.md

Задача: Фаза 4 — Экран «Сегодня» (шаги 4.1–4.2).
Начни с 4.1: GET /api/horoscope/today (транзиты → текст дня).
```
