

## Plan: PRD v2-24 + CR v1.5 Gap Analysis & Implementation

### Gap Analysis Summary

After comparing both documents against the existing codebase, the following gaps remain. I'm grouping them into two categories: **Profile Differentiation** (your explicit request) and **Missing Modules/Features**.

---

### 1. Profile Section — Role-Based Differentiation

**Problem**: Currently, `Profile.tsx` and `MobileProfile.tsx` show the same UI to ALL roles — including APAAR/Student verification, Student ID, emergency contacts, and credits for interns/experts/therapists/SPOCs. Per PRD, APAAR verification, Student ID, credits display, and ECC wallet are student-only features.

Additionally, Expert/Intern/Therapist/SPOC dashboards have minimal inline profile tabs that don't match the full Profile page feature set.

**Changes**:

**a) `Profile.tsx` + `MobileProfile.tsx` — Conditional sections by role:**
- **Student**: Show APAAR/ERP verification, Student ID, emergency contact, credits, wallet balance, recovery setup — full current UI
- **Expert**: Show specialty, licence no., CRR verification status, total sessions, bio. Hide APAAR, Student ID, credits, emergency contact
- **Intern**: Show training status, CRR verification, sessions completed, bio. Hide APAAR, Student ID, credits
- **Therapist**: Show specialty, verification status, sessions, escalation history count. Hide APAAR, Student ID, credits
- **SPOC**: Show institution info, total students onboarded, QR generation link, bio. Hide APAAR, Student ID, credits

Common sections for ALL roles: username (read-only), bio, password change, recovery setup, notifications, privacy, logout, account deletion.

**Files**: `src/pages/dashboard/Profile.tsx`, `src/components/mobile/MobileProfile.tsx`

---

### 2. Missing Modules from PRD

**a) Recovery Setup — Hint Word Dropdown (CR v1.5 §10.1)**
- Current `RecoverySetup` uses emoji pattern + fragment pairs. CR v1.5 says "Hint word as dropdown, Answer word"
- Update the recovery flow to use a hint-word dropdown (predefined security questions) + answer word, keeping emoji pattern as a second layer

**File**: `src/pages/dashboard/RecoverySetup.tsx`, `src/components/mobile/MobileRecoverySetup.tsx`

**b) Connect Button Split (CR v1.5 §8.3)**
- Home page "Connect" section should clearly separate: Expert Connect, Peer Connect, BlackBox as distinct portals — this is ALREADY implemented correctly in `Dashboard.tsx`. No change needed.

**c) Low Balance Prompt (PRD §21)**
- "Your care energy is low. Refill gently." when `wallet_balance < 5 ECC` — this is ALREADY implemented in `Dashboard.tsx` line 75-84. No change needed.

**d) Daily ECC Earning Cap Display**
- PRD specifies 5 ECC daily cap. The hook `useEccEarn.ts` likely enforces this. Add a visual indicator on the Credits page showing daily earned vs cap.

**File**: `src/pages/dashboard/Credits.tsx`, `src/components/mobile/MobileCredits.tsx`

**e) ECC Stability Pool Visibility for SPOC/Admin**
- PRD says the pool exists (and we have the table + auto-contribute function). Add pool balance display to SPOC dashboard reports tab.

**File**: `src/components/spoc/SPOCDashboardContent.tsx`

---

### 3. Implementation Plan

| # | Task | Files |
|---|------|-------|
| 1 | Make Profile.tsx role-aware: hide APAAR/StudentID/credits for non-students, show role-specific fields | `Profile.tsx` |
| 2 | Make MobileProfile.tsx role-aware: same conditional logic | `MobileProfile.tsx` |
| 3 | Update Expert profile tab with licence/specialty fields | `ExpertDashboardContent.tsx` |
| 4 | Update Intern profile tab with training status details | `InternDashboardContent.tsx` |
| 5 | Update Therapist profile tab with specialty/escalation stats | `TherapistDashboardContent.tsx` |
| 6 | Add daily ECC cap indicator on Credits page | `Credits.tsx`, `MobileCredits.tsx` |
| 7 | Add stability pool balance to SPOC reports | `SPOCDashboardContent.tsx` |
| 8 | Update RecoverySetup with hint-word dropdown per CR v1.5 | `RecoverySetup.tsx`, `MobileRecoverySetup.tsx` |

### Technical Details

- Role check: `profile?.role === "student"` to gate APAAR, emergency contact, Student ID, and credits sections
- Expert/Therapist get a "Specialty" editable field (already exists in DB as `profiles.specialty`)
- Intern profile shows `training_status` from profile with progress bar
- No database changes needed — all fields already exist in the schema
- Recovery hint-word dropdown: predefined list of 10-15 security questions stored as the fragment key, with the user's answer as the fragment value

