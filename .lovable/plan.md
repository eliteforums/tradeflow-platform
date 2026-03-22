

## Plan: Allow Adding Single Students via Admin Dashboard

### Problem
The `add-member` edge function validates roles against `["intern", "expert", "spoc", "therapist"]` — `"student"` is missing. Any attempt to add a student returns "Invalid role." The frontend `MemberManager.tsx` also doesn't list "student" in its `ROLES` dropdown.

### Fix

| File | Change |
|------|--------|
| `supabase/functions/add-member/index.ts` | Add `"student"` to `validRoles` array on line 55 |
| `src/components/admin/MemberManager.tsx` | Add `{ value: "student", label: "Student" }` to the `ROLES` array on line 12 |

Two lines changed total.

