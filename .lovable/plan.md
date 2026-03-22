

## Plan: Fix Eternia Code Display + Therapist BlackBox Join

### Issue 1: Eternia code not displayed in SPOC dashboard

**Root cause**: The institution query in `SPOCDashboardContent.tsx` (line 57) selects `id, name, plan_type, credits_pool, is_active, institution_type` but **omits `eternia_code_hash`**. The code is never rendered anywhere in the SPOC dashboard.

**Fix**:
1. **`src/components/spoc/SPOCDashboardContent.tsx`** — Add `eternia_code_hash` to the institution select query (line 57). Display it in the Home tab's institution overview card (around line 417-428) with a copy button.

### Issue 2: Therapist can't join BlackBox session

**Root cause**: Two problems:
1. The `Profile` type in `AuthContext` (line 8) lists `"student" | "intern" | "expert" | "spoc" | "admin"` — **missing `"therapist"`**. This causes TypeScript mismatches and potential runtime issues with role checks.
2. The BlackBox page (`/dashboard/blackbox`) was added to therapist nav, but it uses `useBlackBoxSession` which is student-centric (requests sessions as a student). Therapists should accept sessions from their **TherapistDashboard** queue tab, not the BlackBox page. The BlackBox nav link for therapists should point to `/dashboard/therapist` instead (their queue).

**Fix**:
1. **`src/contexts/AuthContext.tsx`** — Add `"therapist"` to the Profile role union type on line 8.
2. **`src/components/layout/DashboardLayout.tsx`** — Change the therapist's BlackBox nav item to link to `/dashboard/therapist` (their queue) instead of `/dashboard/blackbox` (student request page). OR remove BlackBox from therapist nav entirely since the TherapistDashboard already has the queue tab.

### Files Modified

| File | Change |
|------|--------|
| `src/components/spoc/SPOCDashboardContent.tsx` | Add `eternia_code_hash` to query + display it with copy button |
| `src/contexts/AuthContext.tsx` | Add `"therapist"` to Profile role type |
| `src/components/layout/DashboardLayout.tsx` | Fix therapist BlackBox nav to point to therapist dashboard queue |

