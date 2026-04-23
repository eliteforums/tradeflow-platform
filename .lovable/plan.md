

# MindEase-Inspired UI Redesign — Full Platform

Visual-only redesign across every screen. **No functional/logic changes** — same routes, same hooks, same data, same roles. Only markup, classes, and design tokens change.

## Design language (the new "Eternia Soft")

Adopted from the reference, kept compatible with Eternia branding:

- **Background**: warm cream `#FBF5EC` (light) / deep ink `#1B1F3B` (dark)
- **Surface cards**: pastel tints — pink `#FFD9DC`, butter `#FCE6A8`, mint `#CFE8D8`, sky `#CFE0F4`, lavender `#D9D6F5`, peach `#FCD9B8`
- **Primary** stays Eternia Purple `#6C63FF`; **accent** stays Coral `#FA7E61` — used as the "active" mood / CTA color
- **Typography**: display headings switch to a rounded serif (Fraunces via Google Fonts, already loadable); body stays Inter
- **Shapes**: 24–32px rounded corners on cards, pill buttons, soft drop shadows (`shadow-[0_8px_30px_rgb(0,0,0,0.04)]`)
- **Iconography**: keep lucide icons but pair with emoji chips for moods/categories (matches reference)

## Phase 1 — Design tokens (one-time foundation)

**Files**: `src/index.css`, `tailwind.config.ts`, `index.html`

- Add 6 pastel surface tokens (`--surface-pink`, `--surface-mint`, `--surface-sky`, `--surface-butter`, `--surface-lavender`, `--surface-peach`) + `--surface-cream` background
- Add Fraunces font link in `index.html`; map `font-display` → Fraunces in tailwind
- Add reusable utilities: `.card-soft`, `.pill`, `.mood-chip`, `.tile-pastel-{color}`
- Dark mode keeps Eternia ink palette; pastel tints get muted dark variants

## Phase 2 — Student mobile (the 3 reference screens, mapped 1:1)

| Reference screen | Eternia file |
|---|---|
| "Good morning + mood log + activity tiles" | `src/components/mobile/MobileDashboard.tsx` |
| "Meditation Stress Relaxation" player | `src/components/mobile/MobileSoundTherapy.tsx` |
| "7 Days Mood Reflection" + bubbles + bar chart | `src/pages/dashboard/MoodTracker.tsx` |

**MobileDashboard** — greeting + date pill, "How are you feeling today?" headline, "Your thought…" input (links to Journaling), 5-emoji `Daily mood log` row (wired to existing `useMoodTracker.logMood`), 2×2 pastel activity tiles (Meditation→SoundTherapy, Just need to talk→PeerConnect, Reduce anxiety→QuestCards, Handle stress→BlackBox). Stats row + Connect grid kept but restyled.

**MobileSoundTherapy** — centered meditation illustration (CSS-drawn lotus/circle motif using the existing `TibetanBowl3D`-style aesthetic, no copyrighted art), "Powered by AI" pill, animated waveform bars (CSS-only, driven by playing state), timer, circular play/pause + skip pills.

**MoodTracker** — bubble cluster sized by mood frequency over 7 days (sized circles with mood labels), "Take charge of your mind / Help with AI" gradient card, bar chart with emoji-headed bars for "Your Statistic". All driven by existing `last7Days` data from the hook.

## Phase 3 — Other student screens (visual refresh, same components)

`MobileSelfHelp`, `MobileBlackBox`, `MobilePeerConnect`, `MobileAppointments`, `MobileCredits`, `MobileProfile`, `MobileRecoverySetup`, plus desktop `Dashboard.tsx`, `SelfHelp.tsx`, `Journaling.tsx`, `Gratitude.tsx`, `QuestCards.tsx`, `Appointments.tsx`, `PeerConnect.tsx`, `BlackBox.tsx`, `SoundTherapy.tsx`, `Profile.tsx`, `Credits.tsx`, `WreckBuddy.tsx`, `TibetanBowl.tsx` — apply pastel tiles + Fraunces headings + soft cards. No logic touched.

## Phase 4 — Auth + Landing

- `Login`, `Register`, `InstitutionCode`, `QRScan`, `ForgotPassword`: cream background, soft card, Fraunces heading, pastel illustrative sidebar on desktop
- `Landing.tsx` sections (Hero, Features, HowItWorks, Stats, Testimonials, FAQ, CTA, Footer, Navbar): re-skin to soft pastel — keeping all copy, links, and structure

## Phase 5 — Staff & admin dashboards

Visual refresh only. Keep tables, charts, edge-function wiring, role logic intact.

- `AdminDashboard` + every component under `src/components/admin/*` (Overview, Analytics, Audit, Members, Institutions, etc.) — soften cards, switch to Fraunces headings, use pastel category badges, keep recharts data
- `ExpertDashboard`, `InternDashboard`, `SPOCDashboard`, `TherapistDashboard` and their `*DashboardContent` components
- `DashboardLayout` (sidebar + topbar): cream background, rounded sidebar, pastel active-state pill

## Phase 6 — Shared components

- `EterniaLogo`, `NotificationBell`, `NovaOrb`, `ResolvedAvatar`, `AvatarUpload`, `EmojiPicker`, `EmergencyAlertOverlay` — restyle to match
- shadcn primitives (`button`, `card`, `input`, `tabs`, `dialog`, `badge`): tweak default variants for softer radius + pastel ghost variant (no API changes — every existing usage keeps working)

## What stays exactly the same

- All routes in `App.tsx`
- All hooks, queries, edge functions, RLS, auth flow, role redirects
- Component prop signatures (so no consumer breaks)
- Database schema — no migrations
- Eternia name + logo asset
- All copy/text content (only typography changes)

## Rollout order (each phase is shippable on its own)

1. Tokens + fonts (Phase 1) — global look shifts immediately
2. Three hero screens (Phase 2) — matches reference
3. Remaining student surfaces (Phase 3)
4. Auth + Landing (Phase 4)
5. Staff/admin (Phase 5)
6. Shared polish pass (Phase 6)

## Notes on the reference

The exact illustrations on Dribbble are copyrighted — I'll recreate the *style* (rounded pastel cards, emoji moods, soft waveforms, bubble charts, "Powered by AI" chips, hand-drawn rounded headings) rather than copying the artwork. The layout, spacing, color feel, and component structure will match closely.

