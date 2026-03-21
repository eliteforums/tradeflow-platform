

## Gap Analysis: PRD v2-22 + Change Request v1.3 vs Current Codebase

After a thorough comparison, here are the **remaining gaps** organized by priority. Items already implemented are excluded.

---

### Already Implemented (No Action Needed)
- 5-step onboarding (institution code → QR → device binding → credentials → private profile)
- Dual verification model (APAAR/ERP)
- All 5 role dashboards (Student, Intern, Expert, Therapist, SPOC, Admin)
- ECC credit system with immutable ledger
- BlackBox with audio-only sessions + AI moderation
- Peer Connect with training gate
- Sound Therapy, Quest Cards, Wreck Buddy, Tibetan Bowl
- Recovery Setup (fragment pairs + emoji pattern)
- Escalation system (L1-L3)
- Training modules (DB-driven, admin-managed)
- Stability pool auto-contribution
- Admin sidebar dashboard
- PWA hardening

---

### Remaining Gaps to Implement

#### Phase A — Database Changes

**1. `device_sessions` table** (PRD Section 12.1)
Track refresh tokens per device for JWT rotation and multi-device management.

```sql
CREATE TABLE public.device_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id_hash text NOT NULL,
  refresh_token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**2. Add `recurrence_rule` column to `expert_availability`** (PRD Section 12.1)
Currently missing — allows recurring weekly slots.

**3. Add missing DB indexes** (PRD Section 12.3)
Create composite indexes on high-query tables for performance at scale.

**4. Add `therapist` to `app_role` enum**
The Change Request defines Therapist as a distinct role (currently using `expert` role for therapist route).

#### Phase B — Change Request Items

**5. Member grouping by institution in Admin dashboard** (CR 3.1)
In the Members tab, group users under their institution name so bulk student IDs are visible per-institution.

**6. BlackBox host-position switching on L3 escalation** (CR 6.1)
When escalation hits L3 in BlackBox, transfer the session from current therapist to an M.Phil expert in real-time (host swap in VideoSDK room).

**7. Recovery Setup — hint word as dropdown** (CR 10.1)
Currently hint words are free-text `Select` dropdowns with predefined options. The CR wants the hint to be a strict dropdown (already implemented — confirmed matching).

**8. Profile section — remove red extreme text** (CR 10.2)
Review Profile page for any red/destructive-colored text that should be toned down.

**9. Credits allotment restricted to students only** (CR 11.1)
Ensure credit grant flows (admin grant tool, welcome bonus) only apply to student-role users.

#### Phase C — PRD Features Not Yet Implemented

**10. Escalation consent checkbox during registration** (PRD Section 3.4)
During Step 5 (private profile), display the escalation consent statement and require acknowledgement before proceeding.

**11. AI selective transcription monitoring** (PRD Section 19.1)
Audio stream → temporary buffer → AI sentiment classifier → risk level. Store only 10s before + 10s after trigger. Currently only text-based AI moderation exists via `ai-moderate` edge function. Audio transcription for live sessions is not implemented.

**12. Live session host replacement on L3** (PRD Section 18)
When escalation L3 triggers during any live session, swap the current moderator with an M.Phil expert without breaking the student's connection. Update session metadata.

**13. Escalation notification to SPOC with limited info** (PRD Section 14.2)
L2: "A student in your institution may need support" — no content, no identity. Currently escalation_requests exist but no push/real-time notification to SPOC dashboard.

**14. Account deletion flow** (PRD Section 15 / DPDP)
Hard-delete `user_private`, soft-delete profile, anonymize `credit_transactions`. 30-day grace period. The `delete-account` edge function exists but the UI flow needs verification.

**15. Intern training module locking** (PRD Section 19)
Upon intern login, only the Training tab should be accessible. All other tabs (Peer Sessions, Notes, Profile) remain locked until `training_status = 'active'`. Currently all tabs are accessible regardless of training status.

**16. SPOC QR code TTL / regeneration** (PRD Section 3.2)
QR codes should have 24-hour validity with regeneration. Currently `generate-spoc-qr` edge function exists but TTL enforcement and auto-expiry need verification.

---

### Implementation Plan (Prioritized)

| # | Task | Type | Files |
|---|------|------|-------|
| 1 | Add `device_sessions` table + indexes migration | DB migration | SQL |
| 2 | Add `therapist` to `app_role` enum | DB migration | SQL |
| 3 | Add escalation consent checkbox to Register Step 2 | Code | `Register.tsx` |
| 4 | Lock intern tabs until training complete | Code | `InternDashboardContent.tsx`, `MobileInternDashboard.tsx` |
| 5 | Group members by institution in admin Members tab | Code | `MemberManager.tsx` |
| 6 | Restrict credit grants to students only | Code | `CreditGrantTool.tsx`, `grant-credits/index.ts` |
| 7 | Add real-time escalation notification to SPOC dashboard | Code | `SPOCDashboardContent.tsx` |
| 8 | Review & soften Profile page destructive text | Code | `Profile.tsx`, `MobileProfile.tsx` |
| 9 | Add L3 host-swap logic for BlackBox sessions | Code | `TherapistDashboardContent.tsx`, `useBlackBoxSession.ts` |
| 10 | Add missing DB indexes for scale | DB migration | SQL |

Items 11 (AI audio transcription) and 12 (live host replacement) are complex real-time features requiring significant VideoSDK integration work and should be scoped as separate phases.

### Scope Note
This plan covers all actionable gaps that can be implemented within the current Lovable + Supabase architecture. Audio stream transcription (item 11) requires a dedicated media processing pipeline and is recommended as a Phase 2 deliverable.

