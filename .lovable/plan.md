

## Plan: Clarify Admin Member Management Roles

### Problem
The "Add Member" form currently includes "Student" in the role list — students should only be created via Bulk ID Creation. The Bulk ID Creation role selector shows all roles — it should default to and primarily support "Student".

### Changes

#### 1. `src/components/admin/MemberManager.tsx`
- **Remove "Student"** from the `ROLES` array used in Add Member (keep only intern, expert, spoc, therapist)
- **Bulk ID Creation**: lock role selector to "Student" only (remove the role dropdown from bulk form since bulk is specifically for student creation at institutes)
- Update description text: "Auto-generate multiple student accounts for an institution"

#### 2. `supabase/functions/add-member/index.ts`
- Remove `"student"` from the `validRoles` array (students only via bulk)

No other files need changes. The edge functions already handle SPOC institution-binding and universal roles correctly.

| File | Change |
|------|--------|
| `src/components/admin/MemberManager.tsx` | Remove Student from individual Add Member roles; lock bulk to student-only |
| `supabase/functions/add-member/index.ts` | Remove "student" from validRoles |

