

## Plan: PRD v2-21 Gap Implementation + Admin Institution Detail View

After comparing the v2-21 PRD against the current codebase, most features are already implemented. The primary new request is the **dedicated institution detail view** in the admin panel. Below are all remaining gaps.

---

### 1. Admin Panel — Dedicated Institution Detail View (Primary Request)

**Current state**: The SPOC tab shows a flat list of institutions via `InstitutionManager`. Clicking an institution only allows copying its code or toggling active status. There is no drill-down view.

**Changes**:
- Add a new tab type `"institution-detail"` to `AdminDashboard.tsx`
- When an institution card is clicked, transition to the detail view showing:
  - Institution name, code, plan, status, creation date
  - SPOC assignment info
  - Students list (filtered from `members` by `institution_id`)
  - Sessions within that institution (appointments + peer + blackbox)
  - Credit pool balance and stability pool data
  - Escalation/flag count for that institution
  - Bulk ID allocation button
- Add a back button to return to the institutions list
- Update `MobileAdminDashboard.tsx` with the same drill-down capability
- Make institution cards in the SPOC tab clickable to navigate to detail view

**Files**: `src/pages/admin/AdminDashboard.tsx`, `src/components/mobile/MobileAdminDashboard.tsx`, `src/components/admin/InstitutionManager.tsx`

---

### 2. Admin Panel — Missing Tabs (Sounds, Escalations, Audit)

**Current state**: Mobile admin dashboard only has 5 tabs (overview, members, sessions, spoc, roles). Desktop has all 8 tabs including sounds, escalations, and audit. Mobile is missing these.

**Changes**:
- Add `"sounds"`, `"escalations"`, and `"audit"` tabs to `MobileAdminDashboard.tsx`
- Render `SoundManager`, `EscalationManager`, `AuditLogViewer`, and `AccountDeletion` in those tabs

**Files**: `src/components/mobile/MobileAdminDashboard.tsx`

---

### 3. Expert Dashboard — AI Risk Indicator

**PRD Section 20**: Expert dashboard should have an "AI risk indicator" control. Currently the expert dashboard has an escalation button but no visual AI risk level indicator on active sessions.

**Changes**:
- Show the `ai_flag_level` from related `blackbox_entries` or the appointment's flag status as a colored risk badge on the sessions tab in `ExpertDashboardContent.tsx`

**Files**: `src/components/expert/ExpertDashboardContent.tsx`

---

### 4. Intern Dashboard — Notes Tab

**PRD Section 20**: Intern dashboard tabs should be: Training Module, Peer Sessions, Notes, Profile. Currently intern dashboard has Training, Sessions, Profile — missing a dedicated Notes tab.

**Changes**:
- Add a "Notes" tab to `InternDashboardContent.tsx` that shows session notes from completed peer sessions (encrypted notes display)
- Mirror on `MobileInternDashboard.tsx`

**Files**: `src/components/intern/InternDashboardContent.tsx`, `src/components/mobile/MobileInternDashboard.tsx`

---

### Summary

| # | Change | Files |
|---|--------|-------|
| 1 | Institution detail drill-down view in admin | `AdminDashboard.tsx`, `MobileAdminDashboard.tsx`, `InstitutionManager.tsx` |
| 2 | Add missing tabs to mobile admin | `MobileAdminDashboard.tsx` |
| 3 | AI risk indicator on expert sessions | `ExpertDashboardContent.tsx` |
| 4 | Notes tab on intern dashboard | `InternDashboardContent.tsx`, `MobileInternDashboard.tsx` |

No database migrations required. All data is already available through existing queries.

