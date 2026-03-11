

# Eternia PRD Gap Analysis — Remaining Missing Features

After a thorough comparison of the PRD (v2-14) against the current codebase, here are the remaining gaps organized into implementable batches.

---

## Batch A: Critical Missing Features

### 1. Training Status Enum Expansion
- **PRD requires**: NOT_STARTED, IN_PROGRESS, ASSESSMENT_PENDING, FAILED, INTERVIEW_PENDING, ACTIVE
- **Current**: `training_status` is just a text column with `not_started`/`completed`
- **Fix**: Migration to add all 6 enum values; update InternDashboardContent to track real progression through modules (mark IN_PROGRESS on Day 1 start, ASSESSMENT_PENDING on Day 3/6, INTERVIEW_PENDING on Day 7, ACTIVE on approval)

### 2. Intern Tab Locking During Training
- **PRD**: "Only Training Module is accessible. All other tabs remain locked until completion."
- **Current**: All 5 tabs visible; training is just a collapsible section on Home
- **Fix**: When `training_status !== 'completed'`, disable/lock Schedule, Sessions, Notes tabs — only Home (with Training Module) and Profile accessible

### 3. Credit Deduction on Service Use (Negative Balance Prevention)
- **PRD**: "Credits deducted per session; negative balance prevention enforced at API layer"
- **Current**: Peer Connect checks `creditBalance < 20` client-side only; BlackBox and Appointments do client checks but no server-side enforcement
- **Fix**: Create an edge function `spend-credits` that atomically checks balance via `get_credit_balance()`, rejects if insufficient, and inserts the negative `credit_transaction` + returns success. Update Peer Connect, Appointments, BlackBox to call this before proceeding. Also check ECC Stability Pool fallback when balance = 0.

### 4. SPOC QR Code Generation & Validation
- **PRD**: "SPOC generates QR via dashboard; HMAC-SHA256 signed payload with 24h TTL"
- **Current**: QRScan page exists but just reads any QR and stores in session. SPOC dashboard has a "Copy QR Data" button but doesn't generate proper HMAC-signed payloads
- **Fix**: Edge function `generate-spoc-qr` that creates HMAC-signed payload (institution_id, spoc_id, timestamp, TTL). Edge function `validate-spoc-qr` that verifies signature + TTL. Update QRScan page to call validation. Update SPOC dashboard to generate real QR codes via the edge function.

### 5. Therapist Dashboard Missing DashboardLayout Wrapper
- **Current**: `TherapistDashboardContent` renders directly without `DashboardLayout`, so it lacks sidebar/nav
- **Fix**: Wrap in DashboardLayout like all other dashboards

### 6. SPOC Credit Granting to Students
- **PRD**: "SPOC bulk-allocates credits to all enrolled students via institution dashboard"
- **Current**: SPOC dashboard has no credit allocation tool
- **Fix**: Add a "Grant Credits" section to SPOC's onboarding tab allowing bulk credit distribution to all students in their institution

---

## Batch B: Security & Compliance Gaps

### 7. Device Fingerprint Validation on Every Auth Request
- **PRD**: "Device fingerprint validated on EVERY authenticated request"
- **Current**: Device fingerprint stored at registration but never validated subsequently
- **Fix**: Edge function middleware or a client-side check on app load that compares current fingerprint with stored `user_private.device_id_encrypted`. Mismatch shows "Unrecognized device" and requires SPOC reset.

### 8. SPOC Device Reset Flow
- **PRD**: "Only SPOC can reset device binding via institution dashboard"
- **Current**: No device reset UI or backend
- **Fix**: Add "Reset Device" button in SPOC's student list (per student). Edge function `reset-device` that clears `user_private.device_id_encrypted` for a given user (SPOC-authorized only), with audit log entry.

### 9. Consent Withdrawal Support
- **PRD DPDP**: "Consent withdrawal supported"
- **Current**: Consent is given at registration but there's no way to withdraw it
- **Fix**: Add a "Withdraw Consent" option in Profile settings that triggers the account deletion/data erasure flow

### 10. ECC Stability Pool Integration in Spend Logic
- **PRD**: "Students who reach zero credits can still access essential services from shared pool"
- **Current**: Pool table exists but is never queried during credit spend
- **Fix**: In `spend-credits` edge function, when user balance = 0, check institution's pool balance; if sufficient, debit from pool instead

---

## Batch C: Dashboard Completeness & Polish

### 11. Expert Dashboard — Escalation Button (PRD Section 18)
- **PRD**: Expert can trigger escalation during session; AI risk indicator shown
- **Current**: Escalation button exists but submits to `escalation_requests` with `spoc_id = user.id` (incorrect — expert is not a SPOC). Should find the student's institution SPOC.
- **Fix**: Look up student's institution → find SPOC → submit escalation request with correct spoc_id

### 12. Therapist Dashboard — PRD Tab Structure
- **PRD Tabs**: Queue, Active Session, Escalation History, Profile
- **Current**: Queue, Session, History, Profile — mostly matches but "History" shows completed/escalated sessions. Missing explicit "Escalation History" with escalation details (level, reason, outcome)
- **Fix**: Enhance History tab to show escalation_history JSON details per session

### 13. Intern Dashboard — PRD Tab Structure  
- **PRD Tabs**: Training Module, Peer Sessions, Notes, Profile
- **Current Tabs**: Home, Schedule, Sessions, Notes, Profile — "Schedule" is not in PRD
- **Fix**: Rename "Home" → "Training", remove "Schedule" tab for interns (they don't manage their own availability — that's expert/SPOC controlled)

### 14. Student Home — "Expert Connect" Label
- **PRD**: Portal is called "Expert Connect" not "Appointments"
- **Fix**: Rename portal label

### 15. Mobile Responsiveness Audit
- Ensure all pages work at 375px width
- Check that bottom nav touch targets are ≥ 44×44px (currently some are flex-1 which could be too narrow on 5-tab layouts)
- Verify safe-area-inset handling on all fixed elements

---

## Batch D: README & Documentation

### 16. README Full Rewrite
- **Current**: Was updated in previous batch but needs to reflect these new changes
- Remove references to Fastify/Prisma/Socket.IO (we use Supabase/Lovable Cloud)
- Add all edge functions, training status enum, QR validation flow
- Add PWA install instructions and DPDP compliance section

---

## Implementation Priority

**Batch A** (Items 1-6) is most critical — these are functional gaps that affect core user flows. I recommend implementing this first.

**Batch B** (Items 7-10) covers security hardening for production readiness.

**Batch C** (Items 11-15) is dashboard polish and correctness.

**Batch D** (Item 16) is documentation.

### Files to Create/Modify

| File | Change |
|------|--------|
| `supabase/functions/spend-credits/index.ts` | New: atomic credit spend with pool fallback |
| `supabase/functions/generate-spoc-qr/index.ts` | New: HMAC-signed QR payload generation |
| `supabase/functions/validate-spoc-qr/index.ts` | New: QR validation |
| `supabase/functions/reset-device/index.ts` | New: SPOC device reset |
| `src/components/intern/InternDashboardContent.tsx` | Tab locking, training enum, rename tabs |
| `src/components/therapist/TherapistDashboardContent.tsx` | Add DashboardLayout wrapper, enhance history |
| `src/components/expert/ExpertDashboardContent.tsx` | Fix escalation spoc_id lookup |
| `src/components/spoc/SPOCDashboardContent.tsx` | QR generation, credit granting, device reset |
| `src/pages/dashboard/Dashboard.tsx` | Rename "Appointments" → "Expert Connect" |
| `src/pages/auth/QRScan.tsx` | Call validate-spoc-qr edge function |
| `src/pages/dashboard/PeerConnect.tsx` | Server-side credit check via spend-credits |
| `src/pages/dashboard/Appointments.tsx` | Server-side credit check via spend-credits |
| `src/pages/dashboard/Profile.tsx` | Consent withdrawal option |
| `supabase/config.toml` | Add new edge function entries |
| `README.md` | Update with all new features |
| DB migration | Training status enum values |

