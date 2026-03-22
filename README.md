# Eternia — Anonymous Mental Wellness Platform

**Eternia** is a privacy-first, institution-controlled mental wellness platform for college students in India. Built for scale (60K+ concurrent users), it provides expert counselling, peer support, emotional tools, and sound therapy — all anonymously and DPDP-compliant.

## 🏗️ Architecture

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **UI** | shadcn/ui + Framer Motion + Recharts |
| **State** | TanStack React Query (2 min stale, 10 min GC) |
| **Backend** | Lovable Cloud — Postgres + Edge Functions |
| **Auth** | Username/password (email-less, anonymous via @eternia.local) |
| **Video** | VideoSDK.live (WebRTC) |
| **AI** | Groq API (GPT OSS 20B 128k) for content moderation |
| **Payments** | Razorpay (ECC credit bundles) |
| **PWA** | vite-plugin-pwa with offline support + runtime caching |

## 🔑 Core Features

### Student Portal
- **Expert Appointments** — Book video/audio sessions with verified M.Phil professionals (50 ECC)
- **Peer Connect** — Realtime encrypted audio + chat with trained psychology interns (20 ECC, no video)
- **BlackBox** — Anonymous emotional expression with AI crisis detection (flag levels 0–3, 30 ECC)
- **Sound Therapy** — Curated audio for meditation, relaxation, and focus
- **Self-Help Tools** — Quest Cards, Wreck the Buddy, Tibetan Bowl breathing
- **Care Credits (ECC)** — Internal economy with 5 ECC/day earn cap

### ECC Economy
- **Welcome Bonus**: 100 ECC on signup
- **Daily Earn Cap**: 5 ECC/day via quests, self-help tools, journaling
- **Spending**: Expert sessions (50 ECC), Peer Connect (20 ECC), BlackBox (30 ECC)
- **Stability Pool**: 1 ECC/month auto-contribution per student; zero-balance students can access emergency sessions from the shared pool
- **Top-Up**: Razorpay-powered bundles (₹49/10 ECC, ₹99/25 ECC, ₹199/60 ECC, ₹499/200 ECC)

### Role-Based Dashboards
- **Student Dashboard** — Appointments, Peer Connect, BlackBox, Sounds, Self-Help, Credits, Profile
- **Expert Dashboard** — Schedule management, session completion, encrypted notes, BlackBox crisis queue
- **Therapist Dashboard** — BlackBox crisis queue with L3 host-swap, session notes, escalation handling
- **Intern Dashboard** — 7-day training module progression (DB-driven, managed by superadmin), peer session logs, training gate (Peer Connect locked until Day 7 approval)
- **SPOC Dashboard** — Institution overview, member management, flagged entries, escalation management
- **Super Admin Dashboard** — Full platform control via grouped sidebar navigation:
  - **Analytics**: Overview with role counts, session stats, flagged entries
  - **People**: Members browser with role/search filters, Role & Credit management
  - **Activity**: Unified session feed (appointments, peer, blackbox)
  - **Institutions**: SPOC tools, institution detail views
  - **Content**: Database-driven training modules (CRUD + quiz editor), sound management
  - **Safety**: Escalation manager, audit logs, account deletion

### Privacy & Security
- **Anonymous Identity**: Username-based auth, no email/phone required
- **Encryption**: All PII AES-256-GCM encrypted at rest
- **Device Binding**: SHA-256 composite fingerprint (userAgent + screen + timezone) stored encrypted
- **Recovery**: Fragment word pairs + emoji pattern (no email/phone recovery)
- **Row-Level Security**: RLS on all 16+ tables with `has_role()` security definer function
- **DPDP Act 2023 Compliance**: Data minimization, right to erasure, account deletion with hard-delete PII + soft-delete profile
- **Escalation Consent**: Explicit opt-in during registration for crisis-triggered identity disclosure
- **AI Moderation**: Automated sentiment classification on BlackBox entries (Groq GPT OSS 20B 128k)
- **Audit Trail**: All admin/SPOC actions logged to `audit_logs` table

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/          # Admin tools (RoleManager, MemberManager, TrainingModuleManager, SoundManager, etc.)
│   ├── expert/         # Expert dashboard content
│   ├── intern/         # Intern dashboard with training gate (fetches modules from DB)
│   ├── landing/        # Landing page sections (Hero, Features, CTA, etc.)
│   ├── layout/         # DashboardLayout with sidebar + bottom nav
│   ├── mobile/         # Mobile-optimized variants of all dashboard pages
│   ├── selfhelp/       # 3D interactive tools (QuestCard3D, TibetanBowl3D, WreckBuddy3D)
│   ├── spoc/           # SPOC dashboard content
│   ├── therapist/      # Therapist/BlackBox crisis queue with L3 host-swap
│   ├── ui/             # shadcn/ui primitives
│   ├── videosdk/       # VideoSDK meeting components
│   └── PWAUpdatePrompt.tsx  # Service worker update notification
├── contexts/
│   └── AuthContext.tsx  # Auth state + credit balance + profile
├── hooks/              # Data hooks (useCredits, useQuests, useBlackBox, usePeerConnect, etc.)
├── lib/
│   ├── deviceFingerprint.ts  # SHA-256 device binding
│   ├── utils.ts              # Tailwind merge utility
│   └── videosdk.ts           # VideoSDK helpers
├── pages/
│   ├── auth/           # InstitutionCode → QRScan → Register → Login
│   ├── dashboard/      # All dashboard pages (lazy-loaded)
│   ├── admin/          # Admin dashboard (sidebar-driven layout)
│   └── legal/          # Terms, Privacy, DPDP
└── integrations/
    └── supabase/       # Auto-generated client + types
supabase/
├── functions/
│   ├── ai-moderate/    # AI content risk classification (Groq GPT OSS 20B 128k)
│   ├── bulk-add-members/ # Batch user creation for institutions
│   ├── delete-account/ # DPDP-compliant account erasure
│   ├── purchase-credits/ # Razorpay order + verification
│   ├── seed-admin/     # Admin seeding utility
│   └── videosdk-token/ # VideoSDK JWT generation
└── migrations/         # Database schema migrations
```

## 📊 Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User identity (username, role, institution, training_status) |
| `user_private` | Encrypted PII (emergency contacts, student ID, device fingerprint) |
| `user_roles` | RBAC role assignments (student, intern, expert, therapist, spoc, admin) |
| `institutions` | Partnered institutions with Eternia codes + credit pools |
| `appointments` | Expert session bookings with slot reference |
| `expert_availability` | Expert schedule slots per institution (with recurrence_rule) |
| `peer_sessions` | Peer Connect session records |
| `peer_messages` | Encrypted chat messages (realtime-enabled) |
| `blackbox_entries` | Anonymous emotional entries with AI flag levels (0–3) |
| `blackbox_sessions` | Crisis intervention sessions (expert/therapist ↔ student, L3 host-swap) |
| `credit_transactions` | ECC economy ledger (earn, spend, grant, purchase) |
| `ecc_stability_pool` | Shared emergency credit pool per institution |
| `training_modules` | DB-driven intern training content (managed by superadmin) |
| `quest_cards` | Daily wellbeing quest definitions |
| `quest_completions` | User quest completion records |
| `sound_content` | Audio therapy tracks (stored in Supabase Storage) |
| `recovery_credentials` | Fragment pairs + emoji pattern (write-only) |
| `escalation_requests` | SPOC/admin escalation requests with justification (realtime-enabled) |
| `audit_logs` | Immutable action log for compliance |
| `device_sessions` | JWT rotation & multi-device management per user |

## 🔐 Onboarding Flow

1. **Institution Code** → Validated against `institutions` table
2. **SPOC QR Scan** → Verified by institution's Grievance Officer
3. **Registration** → Username + password + encrypted private data + device binding + escalation consent

## 🚀 Performance & Scale (60K+ Concurrent Users)

### PWA Service Worker Strategy
- **skipWaiting + clientsClaim**: New service worker versions activate immediately — no stale tabs
- **PWA Update Prompt**: Toast notification when a new version is available; one-tap update
- **Navigation Preload**: Enabled for faster route transitions on supported browsers

### Runtime Caching (Workbox)
| Pattern | Strategy | TTL | Purpose |
|---------|----------|-----|---------|
| Supabase API (`/rest/`, `/auth/`, `/functions/`) | NetworkFirst (5s timeout) | 1 hour, 200 entries | API resilience — serves cached data on network failure |
| Google Fonts CSS | StaleWhileRevalidate | 1 year | Font stylesheet always fresh |
| Google Fonts WOFF2 | CacheFirst | 1 year | Immutable font files cached permanently |
| Static images (png/svg/jpg) | CacheFirst | 30 days, 100 entries | Images rarely change |

### Frontend Optimizations
- **Code splitting** — All dashboard pages lazy-loaded via `React.lazy`
- **Query optimization** — 2 min staleTime, window focus refetch disabled, retry budget
- **Memoized components** — `React.memo` on DashboardLayout + heavy list components
- **Skeleton loaders** — Mobile-first loading states for perceived performance
- **Debounced search** — 300ms debounce on all search inputs
- **GPU acceleration** — `will-change: transform` on animated elements
- **Reduced motion** — Respects `prefers-reduced-motion` for accessibility
- **Safe area insets** — Proper handling for notched devices (iPhone, etc.)
- **Touch targets** — Minimum 44×44px on all interactive mobile elements
- **Preconnect** — DNS prefetch to backend API for faster initial requests
- **Max cache size** — 4 MB per precached file to handle larger production bundles

### Concurrency Design Notes
- **No thundering herd**: `refetchOnWindowFocus: false` prevents 60K simultaneous refetches when users tab back
- **Retry budget**: Queries retry 2×, mutations 1× — prevents retry storms under load
- **Stale-while-revalidate**: 2 min stale window means most reads are instant from cache
- **Edge Functions**: Stateless, horizontally scalable — no session affinity required
- **RLS at DB layer**: Authorization pushed to Postgres — no application-level auth bottleneck

## 🔒 DPDP Act 2023 Compliance

Eternia is fully compliant with India's Digital Personal Data Protection Act 2023:

- **Data Minimization**: Only username required; no email, phone, or real name collected publicly
- **Right to Erasure**: One-click account deletion via `delete-account` edge function — hard-deletes all PII (`user_private`, `recovery_credentials`, `blackbox_entries`), soft-deletes profile, removes auth user
- **Consent**: Explicit escalation consent checkbox during registration
- **Encryption**: All personal data AES-256 encrypted at rest
- **Audit Trail**: Every admin action logged with actor ID, timestamp, and metadata
- **Access Control**: Row-Level Security on all tables; `has_role()` security definer prevents privilege escalation

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📱 PWA Installation

Eternia is a Progressive Web App. Students can install it on their home screen:

1. Open the app in Chrome/Safari on mobile
2. Tap the browser menu (⋮ or Share)
3. Select "Add to Home Screen" / "Install App"
4. The app will work offline for cached pages

## 📄 License

Proprietary — Eternia © 2026. All rights reserved.
