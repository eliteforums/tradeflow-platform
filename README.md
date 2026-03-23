<p align="center">
  <img src="public/eternia_logo_main.svg" alt="Eternia Logo" width="200" />
</p>

<h1 align="center">Eternia</h1>

<p align="center">
  <strong>Anonymous Mental Wellness Platform for Indian College Students</strong>
</p>

<p align="center">
  <em>Developed by <a href="https://eliteforums.in">Elite Forums</a> under the guidance of Mr. Harsh Santosh Tambade (Founder, Elite Forums) & Team ETERNIA</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/PWA-Enabled-5A0FC8?logo=pwa" alt="PWA" />
  <img src="https://img.shields.io/badge/DPDP_2023-Compliant-00C853" alt="DPDP Compliant" />
  <img src="https://img.shields.io/badge/License-Proprietary-red" alt="Proprietary" />
</p>

---

## Table of Contents

- [About](#about)
- [Architecture](#architecture)
- [Core Features](#core-features)
- [ECC Economy](#ecc-economy)
- [Role-Based Dashboards](#role-based-dashboards)
- [Privacy & Security](#privacy--security)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Edge Functions](#edge-functions)
- [Onboarding Flow](#onboarding-flow)
- [Performance & Scale](#performance--scale-60k-concurrent-users)
- [DPDP Act 2023 Compliance](#dpdp-act-2023-compliance)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [PWA Installation](#pwa-installation)
- [Recent Updates](#recent-updates)
- [Screenshots](#screenshots)
- [Acknowledgements](#acknowledgements)
- [Team](#team)
- [Contact](#contact)
- [License](#license)

---

## About

**Eternia** is a privacy-first, institution-controlled mental wellness platform purpose-built for college students across India. Designed to handle **60,000+ concurrent users**, it delivers expert counselling, peer support, emotional expression tools, and sound therapy — all completely anonymously and in full compliance with the **Digital Personal Data Protection (DPDP) Act, 2023**.

### Mission

To make professional mental health support accessible to every college student in India — without stigma, without identity exposure, and without financial barriers — through a secure, scalable, and institution-integrated platform.

### Key Differentiators

- **Zero PII exposure** — No email, phone number, or real name required
- **Institution-controlled access** — Onboarding gated by verified institution codes and SPOC QR scans
- **Internal credit economy (ECC)** — Removes direct payment friction; students earn credits through engagement
- **AI-powered safety net** — Automated crisis detection on anonymous emotional entries with real-time audio monitoring
- **Device-bound sessions** — SHA-256 fingerprinted device binding prevents account sharing
- **Temp ID Onboarding** — Bulk-generated temporary credentials for streamlined institutional onboarding

---

## Architecture

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **UI Components** | shadcn/ui + Framer Motion + Recharts |
| **State Management** | TanStack React Query (2 min stale, 10 min GC) |
| **Backend** | Lovable Cloud — Postgres + Edge Functions |
| **Authentication** | Username/password (email-less, anonymous via `@eternia.local`) + Temp ID activation |
| **Video/Audio** | VideoSDK.live (WebRTC) with SDK error handling & auto-retry |
| **AI Moderation** | Groq API (GPT OSS 20B 128k) for content risk classification |
| **Real-time Audio Monitoring** | AI-powered audio classification during live sessions (15s intervals) |
| **Payments** | Razorpay (ECC credit bundles in INR) |
| **PWA** | vite-plugin-pwa with offline support + Workbox runtime caching |
| **3D Graphics** | React Three Fiber + Drei (self-help interactive tools) |
| **Hosting** | Vercel (with `vercel.json` SPA rewrites + relaxed CSP for embedded content) |

---

## Core Features

### Student Portal

| Feature | Description | Cost |
|---------|-------------|------|
| **Expert Appointments** | Book video/audio sessions with verified M.Phil RCI-licensed professionals | 50 ECC |
| **Peer Connect** | WhatsApp-style encrypted text chat with trained psychology interns (real-time messaging) | 20 ECC |
| **BlackBox** | Anonymous emotional expression journal with AI crisis detection (flag levels 0–3) | Free (journal) / 30 ECC (Talk Now voice session) |
| **Sound Therapy** | Curated audio library for meditation, relaxation, deep sleep, and focus | Free |
| **Self-Help Tools** | Interactive 3D tools — Quest Cards, Wreck the Buddy (stress relief), Tibetan Bowl (breathing) | Free |
| **Mood Tracker** | Daily mood logging with notes and visual history | Free |
| **Gratitude Journal** | Daily three-item gratitude entries | Free |
| **Journaling** | Free-form journal entries with mood tagging | Free |
| **Care Credits (ECC)** | Internal economy with 5 ECC/day earn cap via quests, journaling, and self-help engagement | — |
| **Recovery Setup** | Fragment word pairs + emoji pattern based account recovery (no email/phone needed) | — |

### AI-Powered Safety

- **Automated Risk Classification** — Every BlackBox entry is analyzed by Groq GPT OSS 20B 128k
- **4-Level Flag System:**
  - `L0` — Normal/healthy expression
  - `L1` — Mild distress (frustration, sadness, anxiety)
  - `L2` — Moderate concern (persistent hopelessness, self-harm ideation without plan)
  - `L3` — Critical/crisis (explicit self-harm intent, danger to self/others)
- **L3 Host-Swap** — Therapists can take over BlackBox crisis sessions from interns in real-time
- **Real-time Audio Monitoring** — AI-powered audio classification during live voice sessions at 15-second intervals, with risk level badges and automatic escalation triggers
- **Emergency Contact Retrieval** — On L3 escalation, authorized staff can retrieve encrypted emergency contact details via the `get-emergency-contact` edge function
- **Trigger Snippet Storage** — Escalation requests capture the triggering content snippet and timestamp for audit purposes

### Video & Audio Sessions

- **WebRTC via VideoSDK.live** — Low-latency, encrypted video/audio with robust error handling
- **SDK Error Recovery** — `onError` and `onMeetingStateChanged` callbacks capture SDK failures (WebSocket disconnects, room join failures) with user-facing error messages instead of silent timeouts
- **Auto-Join with Retry** — Sessions auto-join on acceptance with up to 3 retry attempts and a 20-second timeout with manual retry option
- **JWT-authenticated rooms** — Each session gets a unique room ID via the `videosdk-token` edge function
- **Session notes** — Experts can write AES-256 encrypted session notes post-call
- **BlackBox Talk Now** — Voice sessions between students and therapists, queued and matched in real-time

---

## ECC Economy

Eternia Care Credits (ECC) form an internal micro-economy that removes direct payment friction while ensuring sustainable platform usage.

| Mechanism | Details |
|-----------|---------|
| **Welcome Bonus** | 100 ECC on signup |
| **Daily Earn Cap** | 5 ECC/day via quests, self-help tools, journaling |
| **Expert Session** | 50 ECC per appointment |
| **Peer Connect** | 20 ECC per session |
| **BlackBox Talk Now** | 30 ECC per voice session |
| **Stability Pool** | 1 ECC/month auto-contribution per student; zero-balance students can access emergency sessions from the shared institutional pool |

### Top-Up Bundles (Razorpay)

| Bundle | Price (INR) | Credits |
|--------|-------------|---------|
| Starter | ₹49 | 10 ECC |
| Standard | ₹99 | 25 ECC |
| Premium | ₹199 | 60 ECC |
| Mega | ₹499 | 200 ECC |

---

## Role-Based Dashboards

### Student Dashboard
Appointments, Peer Connect, BlackBox, Sound Therapy, Self-Help Tools, Mood Tracker, Gratitude Journal, Journaling, Credits Management, Profile Settings, Recovery Setup.

### Expert Dashboard
Schedule management (recurring availability slots), session completion tracking, encrypted session notes, BlackBox crisis queue access.

### Therapist Dashboard
BlackBox crisis queue with L3 host-swap capability, session notes, escalation handling, crisis intervention tools. Distinct from Expert role for specialized crisis management.

### Intern Dashboard
7-day training module progression (DB-driven, managed by superadmin), peer session logs, training gate (Peer Connect locked until Day 7 approval by admin). Tab locking enforced — sessions, notes, and profile tabs locked until `training_status` is `active` or `completed`.

### SPOC Dashboard
Institution overview, member management (bulk add via CSV), flagged entry monitoring, escalation request management with real-time notifications, QR code generation for onboarding, M.Phil override reports.

### Super Admin Dashboard
Full platform control via grouped sidebar navigation:

| Group | Tools |
|-------|-------|
| **Analytics** | Overview with role counts, session stats, flagged entries, visitor analytics |
| **People** | Members browser with role/search filters (grouped by institution), Role & Credit management |
| **Activity** | Unified session feed (appointments, peer sessions, blackbox entries) |
| **Institutions** | SPOC tools, institution detail views, credit pool management |
| **Content** | Database-driven training modules (CRUD + quiz editor), sound management |
| **Safety** | Escalation manager, audit logs, account deletion tools |

---

## Privacy & Security

| Measure | Implementation |
|---------|---------------|
| **Anonymous Identity** | Username-based auth; no email, phone, or real name collected publicly |
| **Encryption at Rest** | All PII AES-256-GCM encrypted in `user_private` table |
| **Device Binding** | SHA-256 composite fingerprint (userAgent + screen + timezone + language) stored encrypted |
| **Recovery** | Fragment word pairs + emoji pattern — no email/phone recovery possible |
| **Row-Level Security** | RLS on all 20+ tables with `has_role()` SECURITY DEFINER function |
| **DPDP Compliance** | Data minimization, right to erasure, explicit consent, audit trail |
| **Escalation Consent** | Explicit opt-in during registration for crisis-triggered identity disclosure to SPOC |
| **AI Moderation** | Automated sentiment classification on BlackBox entries + real-time audio monitoring in live sessions |
| **Audit Trail** | All admin/SPOC actions logged to `audit_logs` table with actor ID, timestamp, and metadata |
| **JWT Rotation** | Device sessions table tracks refresh tokens with expiry and revocation |
| **Temp ID System** | Bulk-generated temporary credentials for institutional onboarding with activation tracking |

### Security Headers

All responses include hardened HTTP security headers enforced via `vercel.json`:

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Broad `https:` whitelist for scripts, styles, fonts, images, connections, media, and frames | Prevents XSS while allowing CDN assets and embedded game content |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for 2 years with HSTS preload |
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking via iframe embedding from external origins |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing attacks |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` | Balances browsing context isolation with WebRTC peer connection requirements |
| `Permissions-Policy` | `camera=(self), microphone=(self), geolocation=(), payment=(), usb=()` | Restricts browser API access — camera/mic for video calls only |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer information leakage |
| `X-DNS-Prefetch-Control` | `on` | Enables DNS prefetching for performance |

> **Note:** `Cross-Origin-Embedder-Policy` and `Cross-Origin-Resource-Policy` headers were intentionally removed to support WebRTC signaling and embedded game/CDN content loading.

### Edge Function Security

All 19 edge functions are hardened with defense-in-depth:

| Protection | Details |
|------------|---------|
| **Rate Limiting** | In-memory IP-based rate limiter per function (10–30 req/min depending on sensitivity) |
| **JWT Validation** | `getClaims()` for token verification — faster than `getUser()`, prevents session replay |
| **Input Sanitization** | Length limits, null-byte stripping, UUID format validation, type coercion |
| **Amount Caps** | `spend-credits`: 1–500 ECC, `grant-credits`: 1–10,000 ECC per transaction |
| **Ownership Checks** | `purchase-credits` verifies Razorpay `order.notes.user_id` matches authenticated caller |
| **Role Enforcement** | `grant-credits` requires admin/SPOC role; `reset-device` requires SPOC/admin with institution scoping |
| **Error Sanitization** | Generic error messages in production; no stack traces or internal details leaked |

### RLS Hardening (Vulnerability Patches)

Critical Row-Level Security vulnerabilities identified and patched:

| Vulnerability | Severity | Fix Applied |
|---------------|----------|-------------|
| **Self-insert credit transactions** — any authenticated user could fabricate unlimited ECC | 🔴 Critical | Removed `System can insert credit transactions` policy; credits now only via trusted edge functions |
| **All profiles readable** — any user could read all profiles including sensitive fields | 🔴 Critical | Replaced with scoped policies: own profile (students), all profiles (admin/spoc), session-related (staff) |
| **Escalation request impersonation** — experts/interns could insert requests with arbitrary `spoc_id` | 🟡 Medium | Added `WITH CHECK` binding session/entry ownership to `auth.uid()` |
| **Institution codes exposed to anon** — unauthenticated users could enumerate institution join codes | 🟡 Medium | Removed broad anon policy; re-added minimal anon access for onboarding verification only |

### Client-Side Security

| Protection | Details |
|------------|---------|
| **Password Strength** | Minimum 8 chars, requires uppercase + lowercase + number + special character |
| **Password Blacklist** | Password cannot contain username |
| **Login Brute-Force** | 5-attempt lockout with 5-minute cooldown (client-side) |
| **Username Validation** | Alphanumeric + underscore only, 4–30 characters |
| **Phone Validation** | Indian mobile format only (`+91 6-9XXXXXXXXX`) |
| **Input Length Limits** | All form fields capped (username: 30, password: 128, notes: 200–500) |

### Database-Level Rate Limiting

A `rate_limits` table with `check_rate_limit()` SECURITY DEFINER function provides database-level rate limiting:

```sql
-- Check if a request is within limits (60 requests per minute default)
SELECT public.check_rate_limit('function:user_id', 60, 60);
```

- Service-role access only (RLS blocks all authenticated users)
- Auto-cleanup via `cleanup_rate_limits()` function (entries expire after 1 hour)

---

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin tools (RoleManager, MemberManager, TrainingModuleManager,
│   │                   #   SoundManager, AnalyticsDashboard, AuditLogViewer,
│   │                   #   EscalationManager, ExpertManager, InstitutionManager, etc.)
│   ├── blackbox/       # BlackBox UI components (NovaOrb animated visual)
│   ├── expert/         # Expert dashboard content & session management
│   ├── intern/         # Intern dashboard with training gate (fetches modules from DB)
│   ├── landing/        # Landing page sections (Hero, Features, CTA, Testimonials,
│   │                   #   FAQ, Security, Stats, TrustLogos, Footer, Navbar,
│   │                   #   HowItWorks, CodePreview, AnnouncementBanner)
│   ├── layout/         # DashboardLayout with sidebar + bottom nav + mobile detection
│   ├── mobile/         # Mobile-optimized variants of all dashboard pages
│   ├── selfhelp/       # 3D interactive tools (QuestCard3D, TibetanBowl3D, WreckBuddy3D)
│   ├── spoc/           # SPOC dashboard content
│   ├── therapist/      # Therapist/BlackBox crisis queue with L3 host-swap
│   ├── ui/             # shadcn/ui primitives (40+ components)
│   ├── videosdk/       # VideoSDK meeting components (MeetingView, MeetingControls,
│   │                   #   ParticipantView, VideoCallModal)
│   ├── CookieConsent.tsx       # DPDP-compliant cookie consent banner
│   ├── EterniaLogo.tsx         # Brand logo component
│   ├── NavLink.tsx             # Navigation link wrapper
│   ├── ProtectedRoute.tsx      # Auth guard with role-based access
│   └── PWAUpdatePrompt.tsx     # Service worker update notification
├── contexts/
│   └── AuthContext.tsx  # Auth state + credit balance + profile + session management
├── hooks/
│   ├── useAdmin.ts             # Admin role verification
│   ├── useAnalytics.ts         # Page view tracking (excludes admin traffic)
│   ├── useAnalyticsData.ts     # Analytics data aggregation
│   ├── useAppointments.ts      # Expert appointment CRUD
│   ├── useAudioMonitor.ts      # AI-powered audio level monitoring for live calls
│   ├── useBlackBox.ts          # BlackBox entry management
│   ├── useBlackBoxSession.ts   # BlackBox crisis session management with debug logging
│   ├── useCredits.ts           # ECC balance, transactions, earn/spend
│   ├── useDebouncedValue.ts    # Input debounce utility
│   ├── useDeviceValidation.ts  # Device fingerprint validation
│   ├── useEccEarn.ts           # Daily ECC earning logic
│   ├── useGratitude.ts         # Gratitude journal entries
│   ├── useJournaling.ts        # Free-form journal management
│   ├── useMoodTracker.ts       # Daily mood logging
│   ├── usePeerConnect.ts       # Peer session management
│   ├── usePurchaseCredits.ts   # Razorpay credit purchase
│   ├── useQuests.ts            # Quest cards & completions
│   ├── useSoundTherapy.ts      # Sound content & playback
│   └── useSpendCredits.ts      # Credit spending logic
├── lib/
│   ├── deviceFingerprint.ts    # SHA-256 device binding
│   ├── utils.ts                # Tailwind merge utility (cn)
│   └── videosdk.ts             # VideoSDK helper with auth retry & error parsing
├── pages/
│   ├── auth/           # InstitutionCode → QRScan → Register → Login
│   ├── dashboard/      # All dashboard pages (lazy-loaded via React.lazy)
│   │                   # Includes: Appointments, BlackBox, Credits, Dashboard,
│   │                   # ExpertDashboard, Gratitude, InternDashboard, Journaling,
│   │                   # MoodTracker, PeerConnect, Profile, QuestCards,
│   │                   # RecoverySetup, SPOCDashboard, SelfHelp, SoundTherapy,
│   │                   # TherapistDashboard, WreckBuddy
│   ├── admin/          # Admin dashboard (sidebar-driven layout)
│   ├── legal/          # Terms, Privacy Policy, DPDP Compliance Statement
│   ├── Landing.tsx     # Public landing page
│   └── NotFound.tsx    # 404 page
└── integrations/
    └── supabase/       # Auto-generated client + types (DO NOT EDIT)

supabase/
├── functions/
│   ├── _shared/        # Shared security utilities (rate limiter, input sanitization)
│   ├── activate-account/       # Temp ID activation into permanent account
│   ├── add-member/             # Admin: single user creation
│   ├── ai-moderate/            # AI content risk classification
│   ├── ai-transcribe/          # Audio transcription for accessibility
│   ├── bulk-add-members/       # Batch user creation (CSV import)
│   ├── cleanup-deleted-accounts/ # Scheduled account purge
│   ├── create-bulk-temp-ids/   # Bulk temporary credential generation
│   ├── delete-account/         # DPDP-compliant account erasure
│   ├── generate-spoc-qr/       # SPOC QR code generation
│   ├── get-emergency-contact/  # Encrypted emergency contact retrieval
│   ├── grant-credits/          # Admin credit grants
│   ├── purchase-credits/       # Razorpay payment processing
│   ├── reset-device/           # Device binding reset
│   ├── seed-admin/             # Initial superadmin creation
│   ├── spend-credits/          # Credit deduction with balance validation
│   ├── stability-pool-auto-contribute/  # Monthly auto-contribution
│   ├── stability-pool-contribute/       # Manual pool contribution
│   ├── validate-spoc-qr/       # QR verification during onboarding
│   ├── verify-temp-credentials/ # Temp ID credential verification
│   └── videosdk-token/         # VideoSDK JWT token generation
├── migrations/         # Database schema migrations
└── config.toml         # Function-level configuration
```

---

## Database Schema

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User identity (username, role, institution, training_status, streak) | ✅ |
| `user_private` | Encrypted PII (emergency contacts, student ID, device fingerprint, APAAR/ERP IDs) | ✅ |
| `user_roles` | RBAC role assignments (student, intern, expert, therapist, spoc, admin) | ✅ |
| `institutions` | Partnered institutions with Eternia codes, credit pools, plan types | ✅ |
| `temp_credentials` | Bulk-generated temporary credentials for institutional onboarding | ✅ |
| `appointments` | Expert session bookings with slot reference, room ID, session notes | ✅ |
| `expert_availability` | Expert schedule slots per institution (with recurrence_rule) | ✅ |
| `peer_sessions` | Peer Connect session records (student ↔ intern) | ✅ |
| `peer_messages` | Encrypted chat messages (realtime-enabled via Supabase Realtime) | ✅ |
| `blackbox_entries` | Anonymous emotional entries with AI flag levels (0–3) | ✅ |
| `blackbox_sessions` | Crisis intervention sessions (expert/therapist ↔ student, L3 host-swap) | ✅ |
| `credit_transactions` | ECC economy ledger (earn, spend, grant, purchase) | ✅ |
| `ecc_stability_pool` | Shared emergency credit pool per institution | ✅ |
| `training_modules` | DB-driven intern training content with quiz questions (managed by superadmin) | ✅ |
| `quest_cards` | Daily wellbeing quest definitions with XP rewards | ✅ |
| `quest_completions` | User quest completion records (daily deduplication) | ✅ |
| `sound_content` | Audio therapy tracks with category, duration, play count | ✅ |
| `recovery_credentials` | Fragment pairs + emoji pattern (write-only, no read access) | ✅ |
| `escalation_requests` | SPOC/admin escalation requests with justification + trigger snippets (realtime-enabled) | ✅ |
| `audit_logs` | Immutable action log for compliance (actor, action, target, metadata) | ✅ |
| `device_sessions` | JWT rotation & multi-device management per user | ✅ |
| `analytics_events` | Page view tracking (event type, path, session hash, user agent) | ✅ |
| `rate_limits` | Database-level rate limiting with auto-cleanup | ✅ |
| `gratitude_entries` | Daily three-item gratitude journal entries | ✅ |
| `journal_entries` | Free-form journal entries with mood tagging | ✅ |
| `mood_entries` | Daily mood score logging with optional notes | ✅ |

### Key Database Functions

| Function | Purpose |
|----------|---------|
| `has_role(_user_id, _role)` | SECURITY DEFINER — checks user role without RLS recursion |
| `get_credit_balance(_user_id)` | Returns computed ECC balance from transaction ledger |
| `get_credit_balance_fast(_user_id)` | Optimized balance query using `credit_balance_view` |
| `get_daily_earn_total(_user_id)` | Returns today's total earned ECC (for 5/day cap enforcement) |
| `get_pool_balance(_institution_id)` | Returns institution's stability pool balance |
| `increment_play_count(_track_id)` | Atomically increments sound track play counter |
| `check_rate_limit(_key, _max, _window)` | Database-level rate limiting with sliding window |
| `handle_new_user()` | Trigger: auto-creates profile, assigns student role, grants 100 ECC welcome bonus |
| `generate_student_id()` | Trigger: generates unique ETN-XXXX-XXXXX student IDs |
| `refresh_credit_balance()` | Trigger: refreshes materialized credit balance view |

### Key Views

| View | Purpose |
|------|---------|
| `credit_balance_view` | Materialized balance + last transaction timestamp per user |

---

## Edge Functions

All edge functions are deployed as serverless Deno functions on Lovable Cloud.

| Function | Description | JWT Verified |
|----------|-------------|:------------:|
| `activate-account` | Activate a temporary credential into a permanent user account | ❌ |
| `add-member` | Admin-only: Create new platform user with role and institution assignment | ✅ |
| `ai-moderate` | Classify BlackBox entry risk level (0–3) using Groq GPT OSS 20B 128k | ❌ |
| `ai-transcribe` | Transcribe audio content for accessibility | ❌ |
| `bulk-add-members` | Batch user creation for institutions (CSV import) | ✅ |
| `cleanup-deleted-accounts` | Scheduled: Purge soft-deleted accounts past retention period | ✅ |
| `create-bulk-temp-ids` | Generate temporary credentials in bulk for institutional onboarding | ✅ |
| `delete-account` | DPDP-compliant account erasure (hard-delete PII, soft-delete profile) | ✅ |
| `generate-spoc-qr` | Generate institution-specific QR codes for SPOC onboarding | ❌ |
| `get-emergency-contact` | Retrieve encrypted emergency contact for L3 escalation (authorized only) | ✅ |
| `grant-credits` | Admin: Grant ECC credits to users with audit logging | ✅ |
| `purchase-credits` | Razorpay order creation + payment verification for ECC top-up | ❌ |
| `reset-device` | Admin: Reset device binding for locked-out users | ❌ |
| `seed-admin` | One-time: Create initial superadmin account | ✅ |
| `spend-credits` | Deduct ECC credits for service usage with balance validation | ❌ |
| `stability-pool-auto-contribute` | Scheduled: Auto-deduct 1 ECC/month per student to stability pool | ✅ |
| `stability-pool-contribute` | Manual contribution to institution's stability pool | ❌ |
| `validate-spoc-qr` | Verify SPOC QR code during student onboarding | ❌ |
| `verify-temp-credentials` | Verify temporary credentials during Temp ID login | ❌ |
| `videosdk-token` | Generate JWT tokens for VideoSDK.live WebRTC sessions | ❌ |

---

## Onboarding Flow

### Standard Onboarding

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────┐
│ Institution Code │ ──▶ │  SPOC QR     │ ──▶ │  Registration   │ ──▶ │  Login  │
│ (DEMO123, etc.)  │     │  Scan/Verify │     │  + Device Bind  │     │         │
└─────────────────┘     └──────────────┘     └─────────────────┘     └─────────┘
                                                      │
                                               ┌──────┴──────┐
                                               │ username    │
                                               │ password    │
                                               │ emergency   │
                                               │ contact     │
                                               │ escalation  │
                                               │ consent     │
                                               │ device      │
                                               │ fingerprint │
                                               └─────────────┘
```

### Temp ID Onboarding (Institutional Bulk)

```
┌──────────────────┐     ┌───────────────┐     ┌─────────────────┐     ┌─────────┐
│ SPOC generates   │ ──▶ │ Student gets  │ ──▶ │ Activate with   │ ──▶ │  Login  │
│ bulk Temp IDs    │     │ temp username │     │ new username +  │     │         │
│ (CSV download)   │     │ + password    │     │ password + data │     │         │
└──────────────────┘     └───────────────┘     └─────────────────┘     └─────────┘
```

1. **Institution Code** → Validated against `institutions` table
2. **SPOC QR Scan** → Verified by institution's Grievance Officer via `validate-spoc-qr`
3. **Registration** → Username + password + encrypted private data + device binding + escalation consent
4. **Welcome Bonus** → 100 ECC automatically credited on first login

---

## Performance & Scale (60K+ Concurrent Users)

### PWA Service Worker Strategy

- **skipWaiting + clientsClaim** — New service worker versions activate immediately; no stale tabs
- **PWA Update Prompt** — Toast notification when a new version is available; one-tap update
- **Navigation Preload** — Enabled for faster route transitions on supported browsers

### Runtime Caching (Workbox)

| Pattern | Strategy | TTL | Purpose |
|---------|----------|-----|---------|
| API calls (`/rest/`, `/auth/`, `/functions/`) | NetworkFirst (5s timeout) | 1 hour, 200 entries | API resilience — serves cached data on network failure |
| Google Fonts CSS | StaleWhileRevalidate | 1 year | Font stylesheet always fresh |
| Google Fonts WOFF2 | CacheFirst | 1 year | Immutable font files cached permanently |
| Static images (png/svg/jpg) | CacheFirst | 30 days, 100 entries | Images rarely change |

### Frontend Optimizations

- **Code splitting** — All dashboard pages lazy-loaded via `React.lazy` + `Suspense`
- **Query optimization** — 2 min staleTime, window focus refetch disabled, retry budget (2× queries, 1× mutations)
- **Memoized components** — `React.memo` on DashboardLayout + heavy list components
- **Skeleton loaders** — Mobile-first loading states for perceived performance
- **Debounced search** — 300ms debounce on all search inputs via `useDebouncedValue`
- **GPU acceleration** — `will-change: transform` on animated elements
- **Reduced motion** — Respects `prefers-reduced-motion` media query
- **Safe area insets** — Proper handling for notched devices (iPhone X+)
- **Touch targets** — Minimum 44×44px on all interactive mobile elements
- **Preconnect** — DNS prefetch to backend API for faster initial requests
- **Max cache size** — 4 MB per precached file for larger production bundles

### Concurrency Design

- **No thundering herd** — `refetchOnWindowFocus: false` prevents 60K simultaneous refetches
- **Retry budget** — Queries retry 2×, mutations 1× — prevents retry storms under load
- **Stale-while-revalidate** — 2 min stale window means most reads are instant from cache
- **Edge Functions** — Stateless, horizontally scalable — no session affinity required
- **RLS at DB layer** — Authorization pushed to Postgres — no application-level auth bottleneck

---

## DPDP Act 2023 Compliance

Eternia is fully compliant with India's **Digital Personal Data Protection Act, 2023**:

| Principle | Implementation |
|-----------|---------------|
| **Data Minimization** (§4) | Only username required; no email, phone, or real name collected publicly |
| **Purpose Limitation** (§5) | Data collected solely for mental wellness service delivery |
| **Right to Erasure** (§12) | One-click account deletion — hard-deletes all PII, soft-deletes profile, removes auth user |
| **Right to Information** (§11) | Users can view all stored data via Profile page |
| **Consent** (§6) | Explicit escalation consent checkbox during registration |
| **Children's Data** (§9) | Institution-gated access ensures age-appropriate usage |
| **Encryption** | All personal data AES-256-GCM encrypted at rest |
| **Audit Trail** | Every admin action logged with actor ID, timestamp, and metadata |
| **Access Control** | Row-Level Security on all tables; `has_role()` prevents privilege escalation |
| **Breach Notification** | Audit log enables rapid breach scope assessment |
| **Data Retention** | Automated cleanup of soft-deleted accounts past retention period |

For the full compliance statement, see the [DPDP Compliance page](/dpdp) within the application.

---

## Environment Variables

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Backend API URL (auto-configured) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Backend anon key (auto-configured) |
| `VITE_SUPABASE_PROJECT_ID` | Backend project ID (auto-configured) |

### Edge Function Secrets

| Secret | Required By | Description |
|--------|-------------|-------------|
| `SUPABASE_URL` | All functions | Backend API URL (auto-injected) |
| `SUPABASE_SERVICE_ROLE_KEY` | All functions | Service role key for admin operations (auto-injected) |
| `SUPABASE_ANON_KEY` | `add-member`, `bulk-add-members` | Anon key for user-context client (auto-injected) |
| `GROQ_API_KEY` | `ai-moderate` | Groq API key for AI content moderation |
| `VIDEOSDK_API_KEY` | `videosdk-token` | VideoSDK.live API key for WebRTC sessions |
| `VIDEOSDK_API_SECRET` | `videosdk-token` | VideoSDK.live secret for JWT signing |
| `LOVABLE_API_KEY` | AI features | Lovable AI integration key |

---

## Local Development

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** or **bun** (bun recommended for speed)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd eternia

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

### Code Quality

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

## PWA Installation

Eternia is a **Progressive Web App**. Students can install it on their home screen for a native-like experience:

### Android (Chrome)
1. Open the app in Chrome
2. Tap the browser menu (⋮)
3. Select **"Install App"** or **"Add to Home Screen"**

### iOS (Safari)
1. Open the app in Safari
2. Tap the **Share** button (↑)
3. Select **"Add to Home Screen"**

### Desktop (Chrome/Edge)
1. Look for the install icon (⊕) in the address bar
2. Click **"Install"**

The app will work offline for cached pages and API responses.

---

## Recent Updates

### March 2026

#### VideoSDK Error Handling & Recovery
- Added `onError` and `onMeetingStateChanged` callbacks to capture SDK failures (WebSocket disconnects, room join failures) with user-facing error messages
- Replaced silent 15-second timeout with informative error display + manual retry
- Increased join timeout to 20 seconds with 3 auto-retry attempts at 5-second intervals
- Added debug logging throughout BlackBox session reconnection flow

#### Security Header Optimization
- Relaxed CSP to allow `https:` sources for scripts, styles, fonts, images, media, and frames — enabling embedded game content and CDN assets without per-game CSP updates
- Changed `Cross-Origin-Opener-Policy` from `same-origin` to `same-origin-allow-popups` for WebRTC compatibility
- Removed `Cross-Origin-Embedder-Policy` and `Cross-Origin-Resource-Policy` headers that blocked WebRTC signaling and cross-origin CDN assets

#### Temp ID Onboarding System
- Bulk temporary credential generation for institutional onboarding (`create-bulk-temp-ids` edge function)
- Temp ID activation flow with credential verification (`verify-temp-credentials`, `activate-account` edge functions)
- CSV download of generated Temp IDs for SPOC distribution

#### Real-time Audio Monitoring
- AI-powered audio classification during live voice sessions at 15-second intervals
- Risk level badges displayed in-session (Normal → L1 Mild → L2 Moderate → L3 Critical)
- Automatic escalation triggers on sustained high-risk audio patterns

#### Additional Features
- Mood Tracker with daily mood logging and visual history
- Gratitude Journal with three daily entries
- Free-form Journaling with mood tagging
- SPOC real-time escalation notifications via Supabase Realtime
- Emergency contact retrieval on L3 escalation
- Trigger snippet storage in escalation requests for audit purposes
- Training status lifecycle: `not_started` → `in_progress` → `assessment_pending` → `failed` → `interview_pending` → `active`
- Dual verification model (APAAR/ERP) for different institution types
- Embedded self-help games (Ragdoll Bash) with relaxed CSP headers

---

## Screenshots

> _Screenshots and demo links will be added in a future release._

---

## Acknowledgements

Eternia is built on the shoulders of exceptional open-source projects:

| Category | Technologies |
|----------|-------------|
| **UI Framework** | [React](https://react.dev), [TypeScript](https://typescriptlang.org) |
| **Build Tool** | [Vite](https://vitejs.dev) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **3D Graphics** | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber), [Three.js](https://threejs.org), [Drei](https://github.com/pmndrs/drei) |
| **Data Fetching** | [TanStack React Query](https://tanstack.com/query) |
| **Routing** | [React Router](https://reactrouter.com) |
| **Charts** | [Recharts](https://recharts.org) |
| **Forms** | [React Hook Form](https://react-hook-form.com), [Zod](https://zod.dev) |
| **Video** | [VideoSDK.live](https://www.videosdk.live/) |
| **QR Codes** | [qrcode.react](https://github.com/zpao/qrcode.react) |
| **PWA** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) |
| **Backend** | [Supabase](https://supabase.com) (via Lovable Cloud) |
| **AI** | [Groq](https://groq.com) |
| **Payments** | [Razorpay](https://razorpay.com) |

---

## Team

**Eternia** is developed by **[Elite Forums](https://eliteforums.in)** under the guidance of **Mr. Harsh Santosh Tambade** — Founder of Elite Forums.

Built with dedication by **Team ETERNIA**.

---

## Contact

- **Website:** [https://eliteforums.in](https://eliteforums.in)
- **Platform:** [Eternia App](https://eternia.app) _(coming soon)_

For business inquiries, licensing, or partnership opportunities, please visit [eliteforums.in](https://eliteforums.in).

---

## License

```
Copyright © 2026 Elite Forums (eliteforms.in). All rights reserved.

This software and its source code are proprietary and confidential.
Unauthorized copying, modification, distribution, or use of this software,
in whole or in part, via any medium, is strictly prohibited without prior
written permission from Elite Forums.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Developed under the guidance of Mr. Harsh Santosh Tambade
(Founder, Elite Forums) and Team ETERNIA.

For licensing inquiries: https://eliteforums.in
```

---

<p align="center">
  <sub>© 2026 Elite Forums. All rights reserved. Built with ❤️ by Team ETERNIA.</sub>
</p>
