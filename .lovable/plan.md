

## Plan: Remaining PRD v2-23 + CR v1.4 Gaps Implementation

After comparing both documents against the current codebase, most features are already implemented. Here are the remaining actionable gaps:

---

### What's Already Done (confirmed)
- 5-step onboarding, dual verification, device binding
- All 6 role dashboards (Student, Intern, Expert, Therapist, SPOC, Admin)
- ECC system with immutable ledger, low balance prompt ("Your care energy is low"), stability pool
- BlackBox audio sessions + AI moderation + L3 host-swap
- Expert escalation button with timestamp + reason
- Training modules (DB-driven), intern tab locking
- Members grouped by institution, credit grants restricted to students
- Recovery setup, SPOC QR generation, device sessions, performance indexes
- SPOC real-time escalation notifications
- Connect portals showing Expert Connect, Peer Connect, BlackBox separately (CR 8.3)
- Account deletion (immediate) with DPDP compliance

---

### Remaining Gaps

#### 1. Peer Connect — Intern Escalation/Flag Button (CR 4.1)
**Problem**: Interns have no UI button to flag/escalate a peer session. The `is_flagged` column exists on `peer_sessions` but there's no button in `PeerConnect.tsx` or `MobilePeerConnect.tsx`. CR 4.1 explicitly requires: "Escalation button click → escalation triggers and stores time slot."

**Changes**:
- Add `flagSession` mutation to `usePeerConnect.ts` (sets `is_flagged = true`, creates escalation_request with timestamp)
- Add flag/escalation button to active chat UI in `PeerConnect.tsx` and `MobilePeerConnect.tsx`
- Button visible only to intern role during active sessions

#### 2. Account Deletion — 30-Day Grace Period (PRD 15.1)
**Problem**: Current flow is immediate deletion. PRD requires "30-day grace period before execution."

**Changes**:
- Add `deletion_requested_at` column to `profiles` table (migration)
- Modify `AccountDeletion.tsx` to set the flag instead of calling `delete-account` immediately
- Update `delete-account` edge function to support both "request" and "execute" modes
- Add a reactivation option in the login flow if user logs in during grace period
- Create a `cleanup-deleted-accounts` edge function + cron job to execute deletions after 30 days

#### 3. SPOC QR Code — TTL Auto-Expiry Cron Job (PRD 3.2)
**Problem**: QR codes have 24-hour TTL in the payload but no server-side enforcement or cleanup. The `validate-spoc-qr` edge function checks `expires_at` in the payload, which is already working. However, the PRD specifies server-side enforcement.

**Changes**:
- Already functional via client-side TTL check in payload signature. No additional changes needed unless we want a separate DB-stored QR token table. Mark as complete.

#### 4. Schools as Institutions (CR 9.1)
**Problem**: CR says "Creating Schools same as Institutions." The `institution_type` column already supports `'school'` and `'university'`. The admin `InstitutionManager` needs to expose the type selector when creating institutions.

**Changes**:
- Add `institution_type` dropdown (University/School) to the institution creation form in admin dashboard

---

### Implementation Summary

| # | Task | Type | Files |
|---|------|------|-------|
| 1 | Add intern flag/escalate button for Peer Connect | Code | `usePeerConnect.ts`, `PeerConnect.tsx`, `MobilePeerConnect.tsx` |
| 2 | Add `deletion_requested_at` to profiles | DB migration | SQL |
| 3 | Implement 30-day grace period deletion flow | Code + Edge fn | `AccountDeletion.tsx`, `delete-account/index.ts`, new `cleanup-deleted-accounts/index.ts` |
| 4 | Add institution type selector in admin | Code | `InstitutionManager.tsx` |
| 5 | Update memory file with completion status | Memory | `prd-implementation.md` |

### Items Confirmed as Phase 2 (Not in Scope)
- AI selective audio transcription monitoring (requires media processing pipeline)
- Full audio stream buffer + sentiment classification (requires dedicated infrastructure)

