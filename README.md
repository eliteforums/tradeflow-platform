# Eternia — Anonymous Mental Wellness Platform

**Eternia** is a privacy-first, institution-controlled mental wellness platform for college students in India. Built for scale (lakhs of concurrent users), it provides expert counselling, peer support, emotional tools, and sound therapy — all anonymously and DPDP-compliant.

## 🏗️ Architecture

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **UI** | shadcn/ui + Framer Motion + Recharts |
| **State** | TanStack React Query (2 min stale, 10 min GC) |
| **Backend** | Lovable Cloud (Supabase) — Postgres + Edge Functions |
| **Auth** | Username/password (email-less, anonymous) |
| **Video** | VideoSDK.live (WebRTC) |
| **PWA** | vite-plugin-pwa with offline support |

## 🔑 Core Features

### Student Portal
- **Expert Appointments** — Book video/audio sessions with verified professionals (50 ECC)
- **Peer Connect** — Realtime encrypted chat with trained psychology interns (20 ECC)
- **BlackBox** — Anonymous emotional expression with AI crisis detection
- **Sound Therapy** — Curated audio for meditation, relaxation, and focus
- **Self-Help Tools** — Quest Cards, Wreck the Buddy, Tibetan Bowl breathing
- **Care Credits (ECC)** — Internal economy with 5 ECC/day earn cap

### Role-Based Dashboards
- **Expert Dashboard** — Schedule management, session completion, encrypted notes
- **Intern Dashboard** — 7-day training module progression, peer session logs
- **Admin/SPOC Dashboard** — Institution overview, member management, flagged entries

### Privacy & Security
- All PII encrypted at rest (AES-256-GCM)
- Fragment word pairs + emoji pattern account recovery (no email/phone)
- Row-Level Security (RLS) on all tables
- DPDP Act compliant — data minimization, right to erasure
- Emergency escalation consent during registration

## 📁 Project Structure

```
src/
├── components/
│   ├── landing/        # Landing page sections
│   ├── layout/         # DashboardLayout with sidebar
│   ├── ui/             # shadcn/ui primitives
│   └── videosdk/       # VideoSDK meeting components
├── contexts/
│   └── AuthContext.tsx  # Auth state + credit balance
├── hooks/              # Data hooks (useCredits, useQuests, etc.)
├── pages/
│   ├── auth/           # InstitutionCode → QRScan → Register → Login
│   ├── dashboard/      # All dashboard pages
│   └── admin/          # Admin/SPOC dashboard
└── integrations/
    └── supabase/       # Auto-generated client + types
```

## 🚀 Performance Optimizations

- **Code splitting** — All dashboard pages lazy-loaded via `React.lazy`
- **Query optimization** — 2 min staleTime, window focus refetch disabled
- **Memoized callbacks** — All auth functions wrapped in `useCallback`
- **Debounced search** — Search inputs don't trigger on every keystroke
- **PWA** — Service worker caching for static assets
- **StrictMode** — Enabled for development correctness

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📊 Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User identity (username, role, institution) |
| `user_private` | Encrypted PII (emergency contacts, student ID) |
| `user_roles` | RBAC role assignments |
| `institutions` | Partnered institutions with Eternia codes |
| `appointments` | Expert session bookings |
| `expert_availability` | Expert schedule slots |
| `peer_sessions` | Peer Connect session records |
| `peer_messages` | Encrypted chat messages |
| `blackbox_entries` | Anonymous emotional entries with AI flag levels |
| `credit_transactions` | ECC economy ledger |
| `quest_cards` | Daily wellbeing quest definitions |
| `quest_completions` | User quest completion records |
| `sound_content` | Audio therapy tracks |
| `recovery_credentials` | Fragment pairs + emoji pattern (write-only) |

## 🔐 Onboarding Flow

1. **Institution Code** → Validated against `institutions` table
2. **SPOC QR Scan** → Verified by institution's Grievance Officer
3. **Registration** → Username + password + encrypted private data + escalation consent

## 📄 License

Proprietary — Eternia © 2026. All rights reserved.
