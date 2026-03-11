

# Admin Dashboard Restructure

## What Changes

The admin dashboard currently has 11 flat tabs. The user wants it reorganized into clearer sections:

### New Tab Structure (5 tabs replacing 11)

1. **Members** — Filter/view by role: SPOC, Expert, Intern, Therapist (role-specific sub-filters)
2. **Sessions** — Show descriptive session log ("Dr. Sharma took an appointment with student_0012"), combining appointments + peer sessions + blackbox sessions
3. **SPOC** — Institutional analytics per university, listing of institutions, each with their own SPOC
4. **Roles** — Add Members (ID creation + role assignment) + Assign Roles + Grant Credits (students only, admin-issued)
5. **Overview** — Stays as the landing tab with stats

### Key Functional Changes

**Members tab:**
- Role filter buttons (SPOC / Expert / Intern / Therapist) to filter the member list
- Each member card shows role badge, institution, active status
- Search within filtered role

**Sessions tab:**
- Unified session feed combining `appointments`, `peer_sessions`, and `blackbox_sessions`
- Human-readable format: "Expert_01 took an appointment with Student_03 on Mar 10 at 2pm — completed"
- Filter by session type (appointment/peer/blackbox)

**SPOC tab:**
- List institutions with their assigned SPOC
- Per-institution analytics (student count, session count, credit usage)
- Replaces current standalone SPOC/Institution tabs

**Roles tab:**
- Contains MemberManager (ID creation with bulk support), RoleManager (assign roles), CreditGrantTool
- CreditGrantTool enforces student-only grants (validate role before granting)
- Clear section headers

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/admin/AdminDashboard.tsx` | Restructure tabs from 11 → 5, new Members/Sessions/SPOC/Roles content |
| `src/components/mobile/MobileAdminDashboard.tsx` | Mirror same tab restructure for mobile |
| `src/components/admin/CreditGrantTool.tsx` | Add student-role validation before granting credits |
| `src/hooks/useAdmin.ts` | Add blackbox_sessions query for unified session feed |

### Technical Details

- Members tab: Add `roleFilter` state, filter `members` array by selected role, include "therapist" (which maps to expert role with therapist function)
- Sessions tab: Fetch `blackbox_sessions` with therapist profile join, merge with existing appointments/peerSessions into a single sorted timeline
- SPOC tab: Group members by `institution_id`, join with institutions table data, show SPOC user per institution
- CreditGrantTool: Before inserting credit_transaction, check that target user's `role === 'student'`; reject with toast error otherwise
- Remove redundant tabs: experts, sounds, escalations, audit, flags — fold flags/escalations into overview alerts, keep sounds/audit accessible via a "More" dropdown or secondary nav

