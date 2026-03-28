

## Fix: Admin ID Deletion — Redeploy Edge Function

### Problem
The `admin-delete-member` edge function code already contains the correct fix (auth deletion first, global session revocation, credential recycling with fresh passwords for students, permanent deletion for staff). However, the function may not have been deployed after the last code edit, meaning the live version still runs the old logic.

### Plan

1. **Redeploy `admin-delete-member` edge function** — ensure the live version matches the corrected code that:
   - Revokes all sessions via `signOut(target_user_id, "global")` before anything else
   - Deletes the auth user immediately (fail-fast)
   - Then cleans up PII, soft-deletes profile, removes roles
   - Recycles student temp credentials with fresh password
   - Permanently deletes staff temp credentials

2. **Verify deployment** — invoke the function with a test payload to confirm it's running the updated code

No code changes needed — the function source is already correct. This is a deployment-only fix.

### File
- `supabase/functions/admin-delete-member/index.ts` — redeploy (no edits)

