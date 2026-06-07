# Apex — Design Document

**Date:** 2026-06-07  
**Status:** Validated  
**Type:** Astrology web product (Russian-speaking, Western tradition)

---

## 1. Vision & Positioning

**Apex** is a Russian-language astrology web product inspired by Co-Star: minimalist black-and-white UI, Western astrology, and a direct AI tone without sugary mysticism.

**Core value:** Not entertainment by sun sign — a personal "astrologer in your pocket" with honest insights about self, relationships, and the current day.

**Brand tone:** Honesty over comfort. Not "everything will be fine" — "here's what's happening and why."

### User Journey

1. **Onboarding** — birth date and place required; birth time optional. Without time: Sun, approximate Moon, planets without houses/ascendant. Prompt: "Add birth time to unlock your full chart."
2. **Today** — personalized daily horoscope (transits to natal chart). Short, punchy Co-Star-style copy.
3. **Chart** — natal wheel visualization; premium unlocks full house/aspect breakdown and "big three."
4. **Compatibility** — manual partner/friend data entry at launch; invite-by-link in phase 2.
5. **AI Chat** — virtual astrologer knows the user's chart and dossier; speaks directly.

---

## 2. Architecture & Screens

### Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js + TypeScript | SSR/SEO, PWA support |
| Backend | Next.js API routes | Single codebase for MVP |
| Calculations | Swiss Ephemeris (`sweph` / `astronomy-engine`) | Accurate planetary positions, houses, aspects |
| AI | **DeepSeek** (primary), **Qwen** (fallback) | Low cost, OpenAI-compatible API, good Russian |
| Database | PostgreSQL via Supabase | Users, charts, chat, compatibility, pgvector later |
| Auth | Email magic link + Google + Telegram | Telegram important for RU/CIS audience |
| Push | Service Worker + Web Push API | Browser push now; Firebase for native app later |

### Core Screens

| Screen | Purpose |
|---|---|
| Onboarding | 3 steps: date → place → time (skippable) |
| Today | Daily horoscope + transit card |
| My Chart | Natal wheel + planet breakdown |
| Compatibility | Connection list + "add person" |
| Chat | AI astrologer dialogue |
| Profile | Settings, subscription, notifications, **user dossier** |

### Navigation

- Mobile: bottom tab bar (5 tabs)
- Desktop: side navigation
- Visual: typography and thin lines only — no decorative illustrations

### Key Principle

Astrological calculations are **server-side and deterministic**. AI only **interprets** pre-computed data — never guesses planetary positions.

---

## 3. Freemium Model

| Feature | Free | Premium (~299–499 ₽/mo) |
|---|---|---|
| Daily horoscope | ✅ | ✅ + detailed transits |
| Natal chart | Basic (no houses) | Full + aspect breakdown |
| Compatibility | 1 connection | Unlimited + synastry |
| AI chat | **5 messages/day** | Unlimited |
| Push notifications | Morning horoscope | + transits, lunar phases |

### Abuse Protection

- Rate limits on free tier
- Captcha on registration
- Per-message token cap

---

## 4. AI Chat & Memory System

### Model Strategy

- **Primary:** DeepSeek (~$0.14/1M tokens) — tone tuned via system prompt
- **Fallback:** Qwen — if DeepSeek unavailable
- Both via OpenAI-compatible API for easy provider swap

### Chat Pipeline

1. Inject into prompt: natal chart, current transits, user dossier, last 10 session messages
2. System prompt enforces Co-Star tone in Russian: direct, no filler, no toxic positivity
3. AI interprets server-computed astrology only
4. Cache responses for common queries ("what's today?") to reduce API cost

### Three-Tier Memory

**Tier 1 — Core (always in prompt, ~300 tokens)**

Never forgotten:
- Natal chart + current transits
- Name, age, city
- **User dossier** — structured facts extracted from conversations

Example dossier:
```
Relationships: dating Anya (Taurus), anxious about future
Work: changed jobs in March, hates meetings
Triggers: dislikes "everything will work out" advice
```

Updated **after each session** via cheap DeepSeek call: "extract new facts from this dialogue." User can view/edit/delete in profile ("What Apex knows about me").

**Tier 2 — Episodic (on-demand) — Phase 2**

Past conversations chunked and stored in **pgvector** (Supabase). Semantic search retrieves 3–5 relevant fragments per query — not full history.

**Tier 3 — Session context**

Last 10 messages of current conversation for immediate coherence.

### User Experience

- First visit: AI knows chart, asks 2–3 grounding questions
- Week later: "You mentioned Anya — Venus aspects your Moon today, that's about you two"
- Month later: no need to re-explain life context

---

## 5. Compatibility

### Phase 1 (MVP)

Manual entry of partner/friend birth data (date, optional time/place).

### Phase 2

Invite-by-link — friend registers, charts link automatically (Co-Star-style social layer).

---

## 6. MVP Scope

### In MVP (v1)

- [ ] Onboarding (hybrid: optional birth time)
- [ ] Daily personalized horoscope
- [ ] Basic natal chart (full chart if time provided)
- [ ] 1 compatibility connection (manual entry)
- [ ] AI chat with dossier memory (Tier 1 only)
- [ ] Auth (email + Telegram)
- [ ] Freemium gates (5 msgs/day, chart limits)
- [ ] Responsive web + PWA shell for future push
- [ ] Profile with editable dossier

### Phase 2

- [ ] pgvector episodic memory
- [ ] Invite-by-link compatibility
- [ ] Web Push notifications
- [ ] Payment integration (ЮKassa / CloudPayments)
- [ ] Premium subscription

### Phase 3

- [ ] Native iOS/Android app
- [ ] Firebase push migration
- [ ] Social features (friend feed, shared transits)

---

## 7. Data Model (Core Entities)

```
User
  ├── birth_date, birth_time?, birth_place (lat/lng/timezone)
  ├── sun_sign, moon_sign, rising_sign? (computed)
  ├── subscription_tier, messages_today_count
  └── dossier (JSONB — structured memory facts)

NatalChart (computed, cached per user)
  ├── planets[], houses[], aspects[]

CompatibilityLink
  ├── user_id, partner_name
  ├── partner_birth_data
  └── synastry_score? (premium)

ChatMessage
  ├── user_id, role, content, created_at

ChatSession (triggers dossier update on close)
```

---

## 8. Error Handling

| Scenario | Behavior |
|---|---|
| Birth time unknown | Show partial chart; persistent CTA to add time |
| Geocoding fails for city | Manual lat/lng picker or city autocomplete retry |
| AI API down | Fallback to Qwen; if both fail, show cached daily insight |
| Rate limit hit (free) | Inline upsell: "5 messages used — upgrade or return tomorrow" |
| Invalid birth data | Inline validation; never silently compute wrong chart |

---

## 9. Testing Strategy

- **Unit:** ephemeris calculations against known reference charts
- **Integration:** dossier extraction pipeline (input conversation → expected facts)
- **E2E:** onboarding → chart render → chat message → dossier update
- **Manual QA:** 10 Russian test users verify AI tone matches Co-Star directness

---

## 10. Visual Design Principles

- Black/white palette, single accent color (user's chart highlight color optional)
- System font stack or single geometric sans (e.g., Inter, Geist)
- Natal chart: line art wheel, no gradients
- Chat: monospace or clean sans for AI responses; user messages right-aligned
- No zodiac clipart — sign names as text only

---

## Decisions Log

| Decision | Choice | Rationale |
|---|---|---|
| Astrology tradition | Western | User preference; matches Co-Star/Chani model |
| Audience | Russian-speaking | UI, AI, payments localized |
| Monetization | Freemium | Industry standard; low barrier |
| Platform | Web now, app later | Faster to market; PWA push groundwork |
| Onboarding | Hybrid (optional time) | Reduces drop-off; upsell full chart |
| Compatibility | Manual + social later | Value day 1 without network effects dependency |
| AI tone | Co-Star direct | Differentiator in RU market |
| Visual style | Minimalist B&W | Matches tone; low design cost |
| AI provider | DeepSeek + Qwen | Cost; OpenAI-compatible |
| Free chat limit | 5 messages/day | User preference |
| Memory | Dossier + session (MVP) | "Old friend" feel without full RAG cost |
