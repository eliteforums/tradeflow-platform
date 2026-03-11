# Eternia — Anonymous Mental Wellness Platform

**Eternia** is a privacy-first, institution-controlled mental wellness platform for college students in India. Built for scale (lakhs of concurrent users), it provides expert counselling, peer support, emotional tools, and sound therapy — all anonymously and DPDP-compliant.

## 🏗️ Architecture

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **UI** | shadcn/ui + Framer Motion + Recharts |
| **State** | TanStack React Query (2 min stale, 10 min GC) |
| **Backend** | Lovable Cloud — Postgres + Edge Functions |
| **Auth** | Username/password (email-less, anonymous via @eternia.local) |
| **Video** | VideoSDK.live (WebRTC) |
| **AI** | Lovable AI Gateway (Gemini 2.5 Flash Lite for moderation) |
| **Payments** | Razorpay (ECC credit bundles) |
| **PWA** | vite-plugin-pwa with offline support + runtime caching |

## 🔑 Core Features

### Student Portal
- **Expert Appointments** — Book video/audio sessions with verified M.Phil professionals (50 ECC)
- **Peer Connect** — Realtime encrypted chat with trained psychology interns (20 ECC)
- **BlackBox** — Anonymous emotional expression with AI crisis detection (flag levels 0–3)
- **Sound Therapy** — Curated audio for meditation, relaxation, and focus
- **Self-Help Tools** — Quest Cards, Wreck the Buddy, Tibetan Bowl breathing
- **Care Credits (ECC)** — Internal economy with 5 ECC/day earn cap

### ECC Economy
- **Welcome Bonus**: 100 ECC on signup
- **Daily Earn Cap**: 5 ECC/day via quests, self-help tools, journaling
- **Spending**: Expert sessions (50 ECC), Peer Connect (20 ECC)
- **Stability Pool**: 1 ECC/month auto-contribution per student; zero-balance students can access emergency sessions from the shared pool
- **Top-Up**: Razorpay-powered bundles (₹49/10 ECC, ₹99/25 ECC, ₹199/60 ECC, ₹499/200 ECC)

### Role-Based Dashboards
- **Student Dashboard** — Appointments, Peer Connect, BlackBox, Sounds, Self-Help, Credits, Profile
- **Expert Dashboard** — Schedule management, session completion, encrypted notes, BlackBox crisis queue
- **Intern Dashboard** — 7-day training module progression, peer session logs, training gate (Peer Connect locked until Day 7 approval)
- **SPOC Dashboard** — Institution overview, member management, flagged entries, escalation management
- **Admin Dashboard** — Full platform control, institution management, audit logs, role management

### Privacy & Security
- **Anonymous Identity**: Username-based auth, no email/phone required
- **Encryption**: All PII AES-256-GCM encrypted at rest
- **Device Binding**: SHA-256 composite fingerprint (userAgent + screen + timezone) stored encrypted
- **Recovery**: Fragment word pairs + emoji pattern (no email/phone recovery)
- **Row-Level Security**: RLS on all 16+ tables with `has_role()` security definer function
- **DPDP Act 2023 Compliance**: Data minimization, right to erasure, account deletion with hard-delete PII + soft-delete profile
- **Escalation Consent**: Explicit opt-in during registration for crisis-triggered identity disclosure
- **AI Moderation**: Automated sentiment classification on BlackBox entries (Gemini 2.5 Flash Lite)
- **Audit Trail**: All admin/SPOC actions logged to `audit_logs` table

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/          # Admin tools (RoleManager, MemberManager, AccountDeletion)
│   ├── expert/         # Expert dashboard content
│   ├── intern/         # Intern dashboard with training gate
│   ├── landing/        # Landing page sections (Hero, Features, CTA, etc.)
│   ├── layout/         # DashboardLayout with sidebar + bottom nav
│   ├── mobile/         # Mobile-optimized variants of all dashboard pages
│   ├── selfhelp/       # 3D interactive tools (QuestCard3D, TibetanBowl3D, WreckBuddy3D)
│   ├── spoc/           # SPOC dashboard content
│   ├── therapist/      # Therapist/BlackBox crisis queue
│   ├── ui/             # shadcn/ui primitives
│   └── videosdk/       # VideoSDK meeting components
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
│   ├── admin/          # Admin dashboard
│   └── legal/          # Terms, Privacy, DPDP
└── integrations/
    └── supabase/       # Auto-generated client + types
supabase/
├── functions/
│   ├── ai-moderate/    # AI content risk classification
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
| `user_roles` | RBAC role assignments (student, intern, expert, spoc, admin) |
| `institutions` | Partnered institutions with Eternia codes + credit pools |
| `appointments` | Expert session bookings with slot reference |
| `expert_availability` | Expert schedule slots per institution |
| `peer_sessions` | Peer Connect session records |
| `peer_messages` | Encrypted chat messages (realtime-enabled) |
| `blackbox_entries` | Anonymous emotional entries with AI flag levels (0–3) |
| `blackbox_sessions` | Crisis intervention sessions (expert ↔ student) |
| `credit_transactions` | ECC economy ledger (earn, spend, grant, purchase) |
| `ecc_stability_pool` | Shared emergency credit pool per institution |
| `quest_cards` | Daily wellbeing quest definitions |
| `quest_completions` | User quest completion records |
| `sound_content` | Audio therapy tracks (stored in Supabase Storage) |
| `recovery_credentials` | Fragment pairs + emoji pattern (write-only) |
| `escalation_requests` | SPOC/admin escalation requests with justification |
| `audit_logs` | Immutable action log for compliance |

## 🔐 Onboarding Flow

1. **Institution Code** → Validated against `institutions` table
2. **SPOC QR Scan** → Verified by institution's Grievance Officer
3. **Registration** → Username + password + encrypted private data + device binding + escalation consent

## 🚀 Performance Optimizations

- **Code splitting** — All dashboard pages lazy-loaded via `React.lazy`
- **Query optimization** — 2 min staleTime, window focus refetch disabled
- **Memoized components** — `React.memo` on DashboardLayout + heavy list components
- **Skeleton loaders** — Mobile-first loading states for perceived performance
- **Debounced search** — 300ms debounce on all search inputs
- **GPU acceleration** — `will-change: transform` on animated elements
- **Reduced motion** — Respects `prefers-reduced-motion` for accessibility
- **Safe area insets** — Proper handling for notched devices (iPhone, etc.)
- **Touch targets** — Minimum 44×44px on all interactive mobile elements
- **Service worker** — PWA with offline support and runtime API caching
- **Preconnect** — DNS prefetch to backend API for faster initial requests

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
