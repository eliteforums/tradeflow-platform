

# Eternia PRD v2-15 — Remaining Gaps & Implementation Plan

After a thorough audit of every file, hook, edge function, and database table against the PRD, here are the remaining gaps categorized by priority.

---

## Gap Summary

### A. Credit Spend Not Server-Side (Critical)
- **Appointments**: `useAppointments.ts` line 106 checks `creditBalance < creditCost` client-side only, then does a client-side `credit_transactions` insert. The `spend-credits` edge function exists but is never called.
- **Peer Connect**: `usePeerConnect.ts` checks `creditBalance < 20` client-side. No server-side atomic check.
- **BlackBox Talk Now**: `useBlackBoxSession.ts` — no credit check at all for requesting a therapist session.
- **Fix**: Wire all 3 service entry points to call the `spend-credits` edge function (atomic balance check + stability pool fallback).

### B. Therapist Dashboard Missing DashboardLayout Wrapper
- `TherapistDashboard.tsx` wraps `TherapistDashboardContent` in `DashboardLayout`, but `TherapistDashboardContent` itself renders without any sidebar/nav — it's a standalone component with its own tab bar but no access to the global navigation.
- **Current**: It renders `<div className="max-w-4xl mx-auto ...">` directly — no sidebar, no bottom nav.
- **Fix**: This is actually wrapped properly in `TherapistDashboard.tsx`. The content component should not double-wrap. This is OK.

### C. Device Fingerprint Validation on App Load
- PRD Section 16.1 item 03: "Device fingerprint validated on EVERY authenticated request"
- **Current**: Fingerprint stored at registration but never validated afterwards.
- **Fix**: Add a check in `AuthContext` on session load that compares current fingerprint with stored `user_private.device_id_encrypted`. Show "Unrecognized device" warning + block access until SPOC resets.

### D. Intern Training Status Not Persisted to DB
- **Current**: `InternDashboardContent.tsx` tracks `completedModules` in local React state (`useState<number[]>([])`). Refreshing the page resets all progress.
- **Fix**: Persist training progress to `profiles.training_status` and a new `intern_training_progress` jsonb column (or separate table). Update status in DB when modules complete.

### E. BlackBox Credit Deduction Missing
- PRD Section 21 says BlackBox sessions cost ECC credits.
- **Current**: Students can request BlackBox therapist sessions with no credit check.
- **Fix**: Add credit deduction via `spend-credits` edge function before queueing a BlackBox session.

### F. ECC Stability Pool Monthly Auto-Contribution
- PRD: "1 ECC automatically contributed per student per month"
- **Current**: `ecc_stability_pool` table exists, `get_pool_balance` function exists, but there's no mechanism to auto-contribute monthly.
- **Fix**: Create a database function + pg_cron job (or an edge function callable via cron) to deduct 1 ECC from each student and add to the pool monthly.

### G. Escalation RLS Policy — Experts Can't Create
- **Current**: `escalation_requests` INSERT policy only allows `spoc` and `admin` roles.
- **Expert dashboard** and **Therapist dashboard** both try to insert escalation requests, but RLS will block them.
- **Fix**: Add an RLS policy allowing `expert` role to INSERT escalation requests.

### H. Student Dashboard Labels
- PRD Section 20: Student home calls it "Wallet" not "Credits"
- **Current**: Dashboard uses "Credits" label. PRD says "Wallet".
- **Fix**: Rename "Credits" to "Wallet" in student-facing navigation and dashboard.

### I. Missing Database Indexes (PRD Section 12.3)
- PRD specifies required indexes on `profiles(institution_id, role, is_active)`, `appointments(student_id, expert_id, status, slot_time)`, `credit_transactions(user_id, type, created_at DESC)`, etc.
- **Current**: No explicit indexes created beyond default PKs and unique constraints.
- **Fix**: Migration to add all required performance indexes.

### J. Audit Logs — No UPDATE/DELETE Permissions
- PRD Section 12.2: "audit_logs table has NO UPDATE and NO DELETE grants"
- **Current**: RLS blocks update/delete for non-admins, but the table itself allows it at schema level.
- **Fix**: Revoke UPDATE and DELETE at the PostgreSQL role level for the anon and authenticated roles.

### K. README Outdated
- Still references some legacy patterns. Needs update with all Batch A-D changes from prior rounds.

---

## Implementation Plan

### Phase 1: Critical Server-Side Credit Enforcement + DB Fixes

1. **Wire `spend-credits` edge function into `useAppointments.ts`** — replace client-side credit check with server call
2. **Wire `spend-credits` into `usePeerConnect.ts`** — atomic deduction before session creation
3. **Wire `spend-credits` into `useBlackBoxSession.ts`** — deduct before queuing
4. **Add RLS policy** — allow experts to INSERT escalation_requests
5. **Database migration** — add performance indexes per PRD Section 12.3
6. **Database migration** — revoke UPDATE/DELETE on audit_logs for authenticated role
7. **Persist intern training progress** — add `training_progress` jsonb column to profiles, save/load completed modules from DB

### Phase 2: Device Validation + Stability Pool + Polish

8. **Device fingerprint validation** — on AuthContext session load, compare fingerprint with stored value; show mismatch warning
9. **Monthly stability pool contribution** — edge function `stability-pool-contribute` callable by cron
10. **Rename "Credits" → "Wallet"** in student navigation (DashboardLayout, Dashboard, MobileDashboard)
11. **README rewrite** — reflect all changes from Batches 1-4

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/hooks/useAppointments.ts` | Call spend-credits edge function |
| `src/hooks/usePeerConnect.ts` | Call spend-credits edge function |
| `src/hooks/useBlackBoxSession.ts` | Call spend-credits edge function |
| `src/components/intern/InternDashboardContent.tsx` | Persist training progress to DB |
| `src/components/mobile/MobileInternDashboard.tsx` | Same persistence |
| `src/contexts/AuthContext.tsx` | Device fingerprint validation on load |
| `src/components/layout/DashboardLayout.tsx` | Rename Credits → Wallet |
| `src/pages/dashboard/Dashboard.tsx` | Rename Credits → Wallet |
| `src/components/mobile/MobileDashboard.tsx` | Rename Credits → Wallet |
| DB migration | Performance indexes + audit_logs revoke + training_progress column + expert escalation RLS |
| `README.md` | Full update |

