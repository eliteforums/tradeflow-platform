

## Fix: ID Deletion Bug + University Deletion Feature

### Problem 1: Deleted users can still log in
The `admin-delete-member` edge function already calls `adminClient.auth.admin.deleteUser()` (line 74), which SHOULD prevent login. However, the function currently recycles temp credentials for ALL roles (line 68-71), when it should only recycle for students. For non-student roles (SPOC, Expert, Intern, Therapist), the temp credential should be permanently deleted instead.

**Root cause investigation**: The auth user deletion IS happening. If users can still log in, either:
- The `deleteUser` call is silently failing (error is only logged, not thrown — line 75-76)
- The temp credential recycling re-enables the credential for reuse before the auth user is deleted

### Fix in `supabase/functions/admin-delete-member/index.ts`

1. **Look up the user's role before deletion** — query `profiles.role` for the target user
2. **Make auth deletion a hard failure** — if `deleteUser` fails, throw instead of just logging
3. **Conditional temp credential handling**:
   - If role is `student`: recycle temp credential back to pool (set status = "unused", clear auth_user_id)
   - If role is `spoc`, `expert`, `intern`, or `therapist`: permanently delete the temp credential row
4. **Reorder operations**: delete the auth user BEFORE recycling/deleting temp credentials, so credentials are never in a usable state while the auth user exists

### Problem 2: No "Delete University" option

### New edge function: `supabase/functions/admin-delete-institution/index.ts`

Handles safe deletion of an institution and all associated data:
1. Verify caller is admin
2. Fetch all user IDs linked to the institution (`profiles.institution_id`)
3. For each linked user:
   - Delete PII (`user_private`, `recovery_credentials`, `blackbox_entries`)
   - Soft-delete profile (set `is_active: false`, scrub username/bio/avatar)
   - Remove role assignments
   - Delete auth user via `admin.deleteUser()`
   - Delete or recycle temp credentials (based on role — same logic as above)
4. Delete institution's stability pool entry
5. Delete institution's student ID hashes (`institution_student_ids`)
6. Delete institution's temp credentials pool
7. Delete the institution row itself
8. Audit log the action

### UI: Add delete button to `src/components/admin/InstitutionManager.tsx`

- Add a "Delete" button (with destructive styling) on each institution card
- Wrap in an `AlertDialog` confirmation with warning about cascading deletions
- Show student count in the confirmation dialog
- Call `admin-delete-institution` edge function on confirm
- Invalidate queries on success

### Config: `supabase/config.toml`
- Add `[functions.admin-delete-institution]` with `verify_jwt = false`

### Files
- `supabase/functions/admin-delete-member/index.ts` — fix deletion order and role-based credential handling
- `supabase/functions/admin-delete-institution/index.ts` — new edge function
- `supabase/config.toml` — add new function config
- `src/components/admin/InstitutionManager.tsx` — add delete university UI

