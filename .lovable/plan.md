

## Plan: Allow Institutes (SPOCs) to Add Members and Students

### Overview

Currently, only admins can add members (`add-member`) and bulk-create students (`bulk-add-members`). SPOCs need these capabilities for their own institution.

### Changes

#### 1. Edge Function: `add-member/index.ts`
- Allow SPOCs in addition to admins (check `has_role(caller, 'spoc')`)
- When caller is SPOC: force `institution_id` to their own institution (from their profile), allow only `student` role
- When caller is admin: keep existing behavior (all roles, any institution)
- Add `"student"` back to valid roles list (SPOCs need it)

#### 2. Edge Function: `bulk-add-members/index.ts`
- Allow SPOCs in addition to admins
- When caller is SPOC: force `institution_id` to their own institution, restrict role to `student`
- When caller is admin: keep existing behavior

#### 3. SPOC Dashboard: `SPOCDashboardContent.tsx`
- Add "Add Student" form in the Onboarding tab (username + password, role locked to "student", institution auto-set)
- Add "Bulk ID Allocation" button+dialog (reuse same pattern as `InstitutionManager` bulk dialog) calling `bulk-add-members`

#### 4. Admin `MemberManager.tsx`
- Re-add `"student"` to the ROLES array so admins can also create individual students
- Show institution selector when role is `student` or `spoc`

### Files Modified

| File | Change |
|------|--------|
| `supabase/functions/add-member/index.ts` | Allow SPOC callers, add student role |
| `supabase/functions/bulk-add-members/index.ts` | Allow SPOC callers |
| `src/components/spoc/SPOCDashboardContent.tsx` | Add student creation form + bulk dialog in Onboarding tab |
| `src/components/admin/MemberManager.tsx` | Re-add student role with institution selector |

