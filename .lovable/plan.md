

# Pixel-Match MindEase Reference — Continue Rollout

You've approved Phases 1-2 already (tokens + 3 hero screens). To get the platform looking *exactly* like the MindEase reference, here's what I'll do next, with a focus on faithfully reproducing the reference style on every remaining surface.

## What "exact" means here

The Dribbble shot is copyrighted — I cannot copy the artwork or illustrations 1:1. What I will reproduce precisely:

- Cream `#FBF5EC` background everywhere
- Pastel cards (pink / butter / mint / sky / lavender / peach) with 24–32px radius
- Fraunces serif for all headings, DM Sans for body
- Pill chips, emoji mood rows, soft shadows, "Powered by AI" badges
- Layout structure of every reference screen (greeting block, mood log row, 2×2 tile grid, waveform player, bubble cluster, emoji bar charts)

Illustrations will be CSS/SVG recreations in the same flat-pastel style (no copied art).

## Phase 3 — Remaining student screens

Visual refresh, no logic changes:

- **Mobile**: `MobileSelfHelp`, `MobileBlackBox`, `MobilePeerConnect`, `MobileAppointments`, `MobileCredits`, `MobileProfile`, `MobileRecoverySetup`, `MobileAdminDashboard`, `MobileExpertDashboard`, `MobileInternDashboard`
- **Desktop pages**: `Dashboard`, `SelfHelp`, `Journaling`, `Gratitude`, `QuestCards`, `Appointments`, `PeerConnect`, `BlackBox`, `SoundTherapy`, `Profile`, `Credits`, `WreckBuddy`, `TibetanBowl`

Each gets: cream background, pastel category tiles, Fraunces headings, soft cards, pill buttons, emoji accents.

## Phase 4 — Auth + Landing

- `Login`, `Register`, `InstitutionCode`, `QRScan`, `ForgotPassword`: cream split-layout with pastel illustration panel on desktop; soft card form
- `Landing.tsx` + all `src/components/landing/*` sections (Hero, Features, HowItWorks, Stats, Security, About, Testimonials, FAQ, CTA, Footer, Navbar, AnnouncementBanner, TrustLogos, CodePreviewSection): re-skin to soft pastel — keep all copy and structure, replace gradient/dark hero with cream + pastel cards, Fraunces headlines

## Phase 5 — Staff & admin dashboards

Visual refresh only — recharts, tables, edge functions, role logic untouched.

- `AdminDashboard` + every `src/components/admin/*` (Overview, Analytics, Audit, Members, Institutions, Roles, Sounds, QuestCards, Training, Inquiries, Escalations, Sessions, PasswordReset, AccountDeletion, DeletionRequests, CreditGrant, SPOCTools, Experts)
- `ExpertDashboard`, `InternDashboard`, `SPOCDashboard`, `TherapistDashboard` + `*DashboardContent` + `ExpertL3AlertPanel`, `StudentIdVerificationSection`, `TherapistSessionControls`
- `DashboardLayout`: cream bg, rounded sidebar with pastel active-pill, Fraunces in topbar

## Phase 6 — Shared components polish

- `EterniaLogo`, `NotificationBell`, `NovaOrb`, `ResolvedAvatar`, `AvatarUpload`, `EmojiPicker`, `EmergencyAlertOverlay`, `CookieConsent`, `PWAUpdatePrompt`, `Navbar`/`NavLink` — restyle to match
- shadcn primitives (`button`, `card`, `input`, `tabs`, `dialog`, `badge`, `select`, `tooltip`, `dropdown-menu`): softer default radius + add `pastel-{color}` variants. **No prop API changes** — every existing usage keeps working.

## What stays exactly the same

- All routes, hooks, queries, edge functions, RLS, auth flow, role redirects
- Component prop signatures, database schema
- Eternia name + logo
- All copy/text content

## Rollout order

1. **Phase 3** — remaining student screens (mobile + desktop)
2. **Phase 4** — auth screens + landing page
3. **Phase 5** — staff/admin dashboards + DashboardLayout
4. **Phase 6** — shared components + shadcn polish

Each phase is shippable independently. After each phase you can review and request adjustments before the next.

## Note on illustrations

For places the reference uses custom illustrations (meditation lotus, mood characters, hero artwork), I'll build CSS/SVG equivalents in the same flat-pastel aesthetic. If you want a closer match to the *exact* illustration vibe, the cleanest path is to either (a) commission/license illustrations and drop them in as assets, or (b) generate a matching set via AI image generation and I'll wire them in — let me know if you want either after Phase 3 lands.

