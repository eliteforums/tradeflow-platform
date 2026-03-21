

## Plan: Implement Missing PRD Modules & Features

After thorough comparison of the TechSpec v2-20 PRD against the existing codebase, most core features are already implemented. Below are the remaining gaps that need to be built.

---

### Gap 1: Dual Student Verification Model (APAAR / ABC ID vs ERP ID)

**PRD Section 3.3**: Registration must support two verification models based on institution type — APAAR/ABC ID for universities/colleges and ERP ID for schools. Currently, the registration form has a single generic "Student ID (APAAR / ABC / ERP)" field with no institution-type distinction.

**Changes**:
- Add `institution_type` column to `institutions` table (`university` or `school`)
- Update `Register.tsx` to detect institution type and show appropriate label ("APAAR / ABC ID" vs "ERP ID")
- Add `apaar_verified` and `erp_verified` boolean columns to `user_private` table
- Store the ID in appropriate encrypted column (`apaar_id_encrypted` or `erp_id_encrypted`)

**Files**: `src/pages/auth/Register.tsx`, DB migration

---

### Gap 2: ECC Low Balance Prompt ("Your care energy is low")

**PRD Section 21**: When wallet balance < 5 ECC, show prompt: "Your care energy is low. Refill gently."

**Status**: Already implemented in `Dashboard.tsx` (line 73-82). The exact text matches. **No action needed.**

---

### Gap 3: Training Status ENUM Alignment

**PRD Section 19**: Training status should include: `NOT_STARTED`, `IN_PROGRESS`, `ASSESSMENT_PENDING`, `FAILED`, `INTERVIEW_PENDING`, `ACTIVE`.

**Current**: Profile has `training_status` as text with default `not_started`. The intern dashboard manages progress but doesn't update status through all 6 states — only `not_started` → `completed`.

**Changes**:
- Update `InternDashboardContent.tsx` to set training_status through the full lifecycle: `not_started` → `in_progress` → `assessment_pending` → `interview_pending` → `active`
- Add `FAILED` handling when quiz scores are insufficient
- Change Peer Connect gate check from `training_status === "completed"` to `training_status === "active"`

**Files**: `src/components/intern/InternDashboardContent.tsx`, `src/pages/dashboard/PeerConnect.tsx`, `src/components/mobile/MobilePeerConnect.tsx`

---

### Gap 4: Therapist Dashboard — Missing DashboardLayout Wrapper

**PRD Section 20**: Therapist dashboard should have Queue, Active Session, Escalation History, Profile tabs. Currently implemented but `TherapistDashboard.tsx` wraps content in `DashboardLayout` while the content component itself doesn't have mobile detection.

**Changes**:
- Add mobile detection to `TherapistDashboard.tsx` (like Expert/Intern dashboards)
- The tab structure matches PRD (queue, session, history, profile)

**Files**: `src/pages/dashboard/TherapistDashboard.tsx`

---

### Gap 5: SPOC Dashboard — "Reports" Tab with Analytics

**PRD Section 20**: SPOC Dashboard should have Home, Student Onboarding, Flags & Escalation, Reports, Profile tabs. Currently has all 5 tabs. Need to verify Reports tab has:
- AI flags summary
- Escalation logs
- M.Phil override records

**Status**: SPOC dashboard already has a reports tab with session analytics, credit analytics, and engagement metrics. The flags tab shows escalations with L1/L2/L3 badges. **Mostly implemented.**

**Changes**:
- Add M.Phil override records display to Reports tab (show escalations where level was changed from L2→L3 or sessions that were transferred to experts)

**Files**: `src/components/spoc/SPOCDashboardContent.tsx`

---

### Gap 6: Self-Help Tools in Student Dashboard

**PRD Section 4.5 & 20**: Self-Help Tools include Sound Therapy, Quest Cards, Tibetan Bowl, Wreck The Buddy. Currently Sound Therapy is under "Wellness" section and Quest Cards/Tibetan Bowl/Wreck Buddy are under "Self-Help & Wellbeing" link. The PRD groups Sound Therapy under Self-Help Tools.

**Changes**:
- Move Sound Therapy into the Self-Help section grouping on the dashboard
- Update "Wellness" section to "Self-Help Tools" and include Sound Therapy alongside Quest Cards, Tibetan Bowl, Wreck Buddy

**Files**: `src/pages/dashboard/Dashboard.tsx`, `src/components/mobile/MobileDashboard.tsx`

---

### Gap 7: Stability Pool Auto-Contribution (1 ECC/month)

**PRD Section 21**: Each student account contributes 1 ECC automatically per month to the stability pool. Currently the stability pool exists but no auto-contribution mechanism.

**Changes**:
- Create `stability-pool-auto-contribute` edge function that runs monthly
- Deducts 1 ECC from each active student and adds to their institution's stability pool
- Create a scheduled invocation or document manual triggering

**Files**: `supabase/functions/stability-pool-auto-contribute/index.ts`

---

### Gap 8: BlackBox ECC Spending

**PRD Section 21**: BlackBox sessions should cost ECC credits. Currently BlackBox sessions don't deduct credits.

**Changes**:
- Add credit deduction when requesting a BlackBox voice session (similar to Peer Connect's 20 ECC check)
- Define BlackBox session cost (e.g., 20 ECC like Peer Connect, or configurable)

**Files**: `src/hooks/useBlackBoxSession.ts`

---

### Summary of Implementation (6 tasks)

| # | Change | Files |
|---|--------|-------|
| 1 | Dual verification model (APAAR vs ERP) | `Register.tsx`, DB migration |
| 2 | Training status full lifecycle | `InternDashboardContent.tsx`, `PeerConnect.tsx` |
| 3 | Therapist mobile detection | `TherapistDashboard.tsx` |
| 4 | Move Sound Therapy into Self-Help group | `Dashboard.tsx`, `MobileDashboard.tsx` |
| 5 | Stability pool auto-contribution | New edge function |
| 6 | BlackBox credit deduction | `useBlackBoxSession.ts` |

### Database Migrations
- Add `institution_type TEXT DEFAULT 'university'` to `institutions`
- Add `apaar_id_encrypted TEXT`, `erp_id_encrypted TEXT`, `apaar_verified BOOLEAN DEFAULT false`, `erp_verified BOOLEAN DEFAULT false` to `user_private`

