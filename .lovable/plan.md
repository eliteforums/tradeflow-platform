

## Plan: Activate Self-Help Tools (Quest Cards, Journaling, Mood Tracker, Gratitude)

### Overview

Make 4 self-help tools fully functional with dedicated sub-pages: **Quest Cards** (already has backend), **Journaling**, **Mood Tracker**, and **Gratitude**. Keep **Wreck the Buddy** and **Tibetan Bowl** as "Coming Soon".

### Database Changes (Migration)

Create 3 new tables:

| Table | Columns | Purpose |
|-------|---------|---------|
| `journal_entries` | id, user_id, title, content, mood_tag, created_at | Guided reflective writing |
| `mood_entries` | id, user_id, mood (1-5 scale), note, created_at | Daily emotional tracking |
| `gratitude_entries` | id, user_id, entry_1, entry_2, entry_3, created_at | Daily 3-item gratitude practice |

All tables: RLS enabled, user can only CRUD own rows. Each tool awards ECC on daily completion (using existing `useEccEarn` cap logic).

### New Hooks (3 files)

| Hook | File | Purpose |
|------|------|---------|
| `useJournaling` | `src/hooks/useJournaling.ts` | CRUD journal entries, daily ECC earn on first entry |
| `useMoodTracker` | `src/hooks/useMoodTracker.ts` | Insert mood, query history/trends |
| `useGratitude` | `src/hooks/useGratitude.ts` | Submit daily 3 gratitudes, ECC earn |

### New Pages/Components (8 files)

| File | Purpose |
|------|---------|
| `src/pages/dashboard/QuestCards.tsx` | Quest cards page using existing `useQuests` + `QuestCard3D` |
| `src/pages/dashboard/Journaling.tsx` | Journal entry form + past entries list |
| `src/pages/dashboard/MoodTracker.tsx` | Mood selector (1-5 emoji scale) + 7-day visual history |
| `src/pages/dashboard/Gratitude.tsx` | 3-field gratitude form + past entries |
| `src/components/mobile/MobileQuestCards.tsx` | Mobile variant |
| `src/components/mobile/MobileJournaling.tsx` | Mobile variant |
| `src/components/mobile/MobileMoodTracker.tsx` | Mobile variant |
| `src/components/mobile/MobileGratitude.tsx` | Mobile variant |

### Modified Files

| File | Change |
|------|--------|
| `src/pages/dashboard/SelfHelp.tsx` | Hub page — active cards link to sub-routes; Wreck Buddy & Tibetan Bowl show lock |
| `src/components/mobile/MobileSelfHelp.tsx` | Same hub logic for mobile |
| `src/App.tsx` | Add 4 new protected routes: `/dashboard/quest-cards`, `/dashboard/journaling`, `/dashboard/mood-tracker`, `/dashboard/gratitude` |
| `src/components/mobile/MobileDashboard.tsx` | Update self-help quick links to point to new routes |
| `src/pages/dashboard/Dashboard.tsx` | Update self-help quick links to point to new routes |

### Self-Help Hub Behavior

- **Active tools** (Quest Cards, Journaling, Mood Tracker, Gratitude): Full-color cards, clickable, link to their dedicated pages
- **Coming Soon** (Wreck the Buddy, Tibetan Bowl): Greyed out with lock icon, non-clickable
- "Coming Soon" banner only shown for the locked tools, not the whole page

### ECC Integration

Each tool awards ECC on first daily use (respecting the existing daily cap from `useEccEarn`):
- Quest Cards: existing logic (per-quest XP)
- Journaling: +5 ECC for first journal entry of the day
- Mood Tracker: +3 ECC for first mood log of the day
- Gratitude: +5 ECC for first gratitude entry of the day

