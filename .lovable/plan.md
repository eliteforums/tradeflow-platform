

## Plan: Remove BlackBox Queue from Expert, Add to Intern

### Problem
Currently, the Expert role has a "BlackBox Queue" nav item pointing to `/dashboard/therapist`, and the route is protected with `allowedRoles: ["expert"]`. Per the PRD, BlackBox queue should only be accessible to **Interns** and **Therapists**, not Experts. Experts handle scheduled appointments only.

### Changes

**1. `src/components/layout/DashboardLayout.tsx`**
- Remove `{ icon: Headphones, label: "BlackBox Queue", path: "/dashboard/therapist" }` from `expertNavItems` (line 55)
- Remove the Queue entry from `expertBottomNavItems` (line 87)
- Add BlackBox Queue nav item to `internNavItems` and `internBottomNavItems`

**2. `src/App.tsx`**
- Change the `/dashboard/therapist` route's `allowedRoles` from `["expert"]` to `["intern"]` (therapist role doesn't exist in the RBAC — interns handle the BlackBox queue after training, and the TherapistDashboardContent component serves as the queue UI for them)

**3. `src/components/expert/ExpertDashboardContent.tsx`**
- Remove the `blackbox_entries` query (lines 109-131) that fetches AI risk levels for students — experts should not see BlackBox data per PRD. They only see appointment data.
- Remove `studentRiskMap` references and the "AI Risk L{n}" badge from appointment cards

| # | File | Change |
|---|------|--------|
| 1 | `DashboardLayout.tsx` | Move BlackBox Queue from expert nav → intern nav |
| 2 | `App.tsx` | Change therapist route allowed role to `intern` |
| 3 | `ExpertDashboardContent.tsx` | Remove BlackBox risk query and badges |

