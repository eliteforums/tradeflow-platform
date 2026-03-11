

# Gap Analysis: PRD v2-17 vs Current Codebase

After thorough comparison of the 44-page PRD against every module in the codebase, here are the remaining gaps and logical issues organized by priority.

---

## Critical Gaps (Functional features missing or broken)

### 1. Quest Completion Bypasses Daily ECC Cap
**Problem**: `useQuests.ts` awards XP as credits directly via `credit_transactions` insert, completely bypassing the 5 ECC/day cap enforced by `useEccEarn.ts`. A user could complete 8 quests and earn 80+ ECC in a day.
**Fix**: Integrate `useEccEarn` into quest completion flow. Cap quest earn rewards to the daily remaining allowance.

### 2. Peer Connect Missing Credit Deduction on Session Start
**Problem**: `usePeerConnect.ts` deducts 20 ECC only when ending a session. If a student starts a session and the app crashes or they close the tab, no credits are deducted. PRD says credits deducted on session initiation.
**Fix**: Move credit spend to `requestSession` (session start), not `endSession`.

### 3. BlackBox AI Moderation Skipped for Private Entries
**Problem**: `useBlackBox.ts` fires AI moderation for ALL entries including those marked `is_private: true`. PRD Section 4.3 says "student can mark entries as fully private (no AI scan)".
**Fix**: Add guard: only call `ai-moderate` when `!isPrivate`.

### 4. Appointment Foreign Key Joins Fragile
**Problem**: `useAppointments.ts` uses `profiles!appointments_expert_id_fkey(*)` but the `appointments` table has no FK constraint to profiles (FK section is empty). Same issue in admin `useAdmin` hook. These queries will fail silently or return null joins.
**Fix**: Add proper FK constraints via migration, or switch to manual two-query approach.

### 5. Admin RLS Blocks Admin from Viewing All Sessions
**Problem**: `appointments` RLS only allows users to see their OWN appointments (`student_id` or `expert_id`). Admin dashboard tries to load ALL appointments but will get empty results since there's no admin policy.
**Fix**: Add SELECT policy for admin role on `appointments`, `peer_sessions`, and `blackbox_entries` tables.

---

## Important Gaps (PRD features not yet implemented)

### 6. ECC Low Balance Prompt Missing from Dashboard
**Status**: Already implemented! Dashboard.tsx shows the "Your care energy is low" alert when `balance < 5`.

### 7. ECC Stability Pool — No Auto-Contribution
**Problem**: PRD Section 21 says "1 ECC automatically contributed per student per month". The `ecc_stability_pool` table exists but there's no automated monthly deduction mechanism.
**Fix**: Create a scheduled edge function or a contribution trigger that runs monthly.

### 8. Wreck the Buddy — No ECC Earn Integration
**Problem**: PRD says Wreck the Buddy interactions should trigger credit earning. The 3D component exists but doesn't call `useEccEarn`.
**Fix**: Add earn trigger on interaction completion in the SelfHelp page.

### 9. Tibetan Bowl — No ECC Earn Integration
**Problem**: Same as above. Tibetan Bowl interaction doesn't award ECC.
**Fix**: Add earn trigger on session completion.

### 10. Intern Training Gate Not Enforced
**Problem**: PRD Section 19 says interns must complete all 7 training days before accessing Peer Sessions. Current `InternDashboardContent` shows training modules but doesn't lock the "Peer Sessions" tab based on `training_status`.
**Fix**: Check `profile.training_status === 'active'` before allowing Peer Sessions tab access.

### 11. Expert Appointment — No Session Notes Encryption
**Problem**: PRD requires session notes encrypted with AES-256-GCM. Current expert dashboard stores notes as plaintext in `session_notes_encrypted` column.
**Fix**: This is an application-layer concern; for now, the column name implies encryption but data is stored as plaintext. Add client-side encryption before write.

---

## Logical Issues & Bugs

### 12. Register Page Race Condition
**Problem**: `Register.tsx` calls `signUp()`, then uses `setTimeout(500ms)` to call `supabase.auth.getUser()` and insert into `user_private`. If the profile trigger hasn't finished, the insert could fail or the user might navigate away before private data is saved.
**Fix**: Use the auth state change callback or await proper session establishment before inserting private data.

### 13. QR Scan Fallback Too Permissive
**Problem**: `QRScan.tsx` has a fallback that accepts ANY 8+ character string as valid SPOC code if the edge function call fails. This bypasses institutional verification entirely.
**Fix**: Remove the length-based fallback. Only proceed on successful edge function validation.

### 14. Sound Therapy `play_count` Increment Non-Atomic
**Problem**: Current code reads `currentTrackData.play_count` client-side and sends `play_count + 1` as an update. With multiple concurrent listeners, this causes lost updates.
**Fix**: Use a SQL increment: `supabase.rpc()` call or raw increment in a DB function.

### 15. Peer Messages Realtime Not Enabled
**Problem**: `usePeerConnect.ts` subscribes to realtime on `peer_messages`, but the table hasn't been added to the `supabase_realtime` publication.
**Fix**: Add migration: `ALTER PUBLICATION supabase_realtime ADD TABLE public.peer_messages;`

---

## Implementation Plan (Priority Order)

### Batch 1 — Critical Fixes
1. **Fix quest ECC bypass**: Integrate daily cap check into `useQuests.ts`
2. **Fix Peer Connect credit timing**: Move spend to session start
3. **Fix BlackBox private entry AI skip**: Guard `ai-moderate` call
4. **Fix Admin RLS**: Add SELECT policies for admin on appointments, peer_sessions, blackbox_sessions, blackbox_entries
5. **Enable realtime for peer_messages**: Migration to add to publication

### Batch 2 — Missing Earn Integrations
6. **Add ECC earn to Wreck the Buddy** interaction
7. **Add ECC earn to Tibetan Bowl** interaction
8. **Enforce intern training gate** on Peer Sessions tab

### Batch 3 — Logic Fixes
9. **Remove QR scan permissive fallback**
10. **Fix Register race condition**: Await user session before inserting private data
11. **Fix play_count atomicity**: Create DB function for increment

### Batch 4 — Stability Pool
12. **Create monthly stability pool contribution** edge function

---

## What's Already Well-Implemented (No Changes Needed)
- 5-step onboarding flow (Institution Code → QR → Register with credentials + private profile)
- RBAC with 5 roles stored in `user_roles` table with `has_role()` security definer
- Credit ledger as immutable transactions with computed balance
- AI moderation via Lovable AI gateway
- Recovery setup with fragment pairs + emoji pattern
- Expert availability & booking with credit deduction
- BlackBox with AI flag levels 0-3
- Sound Therapy with categories and audio playback
- Quest Cards with daily completion tracking
- Role-based dashboards (Student, Intern, Expert, Therapist, SPOC, Admin)
- Account deletion with PII hard-delete
- Escalation request workflow
- Device fingerprint binding
- Legal pages (Privacy, Terms, DPDP)
- Mobile-responsive layouts for all pages

