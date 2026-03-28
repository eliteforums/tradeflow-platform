

## Fix: Admin ID Deletion — User Can Still Log In After Deletion

### Root Cause

The `admin-delete-member` edge function deletes the auth user at **step 7** (line 77), but performs profile soft-delete and role removal in steps 5-6 first. Two problems:

1. **Order of operations**: If auth deletion fails, the profile is already mangled (username changed, roles removed) but the user can still authenticate. Conversely, if it succeeds, prior steps may have partially failed leaving orphaned data.

2. **No session revocation**: `deleteUser()` removes the auth record but does **not** immediately invalidate existing JWT tokens. The user's cached session remains valid until the access token expires (default: 1 hour). There is no explicit sign-out/session termination call.

3. **Temp credential recycling timing**: For students, temp credentials are recycled to "unused" (step 8) AFTER auth deletion — if auth deletion fails, the function throws and temp credentials are never touched, which is correct. But if auth deletion succeeds, the recycled temp credentials could theoretically be re-scanned and used to create a new account with the same temp username.

### Fix Plan

**File: `supabase/functions/admin-delete-member/index.ts`**

Reorder and harden the deletion flow:

1. **Step 1**: Look up profile role (unchanged)
2. **Step 2**: Audit log (unchanged — always record the attempt)
3. **Step 3 (NEW)**: Delete the auth user FIRST — this is the critical step that prevents login. If this fails, throw immediately before touching any other data.
4. **Step 4**: After auth is gone, delete PII, BlackBox entries, recovery credentials
5. **Step 5**: Soft-delete profile (set `is_active: false`, clear PII fields)
6. **Step 6**: Remove role assignments from `user_roles`
7. **Step 7**: Handle temp credentials — students get recycled to pool, staff get permanently deleted
8. **Step 8**: Sign out all sessions explicitly via `adminClient.auth.admin.signOut(target_user_id, 'global')` — belt-and-suspenders to ensure no cached JWT works even briefly

Additionally, reset the temp credential's `temp_password_plain` and `temp_password_hash` when recycling student credentials, and regenerate them fresh so the old password can't be reused.

### Summary

| Change | Purpose |
|--------|---------|
| Move `deleteUser()` to step 3 (before data cleanup) | Prevent login immediately; fail fast if auth deletion fails |
| Add `auth.admin.signOut(id, 'global')` before deleteUser | Revoke all active sessions instantly |
| Reset password fields on student temp credential recycling | Prevent reuse of old password |
| Keep audit log before auth deletion | Always record the attempt regardless of outcome |

### Files to Edit
1. `supabase/functions/admin-delete-member/index.ts` — reorder steps, add session revocation, harden temp credential recycling

