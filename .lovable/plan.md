

## Fix: Account Deletion "No Coordinator Found" Error

### Root Cause
The `request-account-deletion` edge function queries `user_roles` for `role = 'admin'`. If no admin role entries exist in `user_roles`, it throws `"No administrators found in the system"`. The user sees this as "No Coordinator Found" (possibly via toast truncation or a prior version).

The flow is already admin-controlled (not SPOC-dependent). The code in `request-account-deletion/index.ts`, `admin-delete-member/index.ts`, and `DeletionRequestsManager.tsx` all work correctly. The problem is just that no admin rows exist in `user_roles` at runtime, or the function needs redeployment.

### Changes

**1. Harden `request-account-deletion` edge function**
- Add SPOC as a fallback notification target — if no admins found, also check for SPOCs. If neither exist, return a user-friendly message.
- Improve error message to be specific: "No administrators available. Please contact your institution."
- Ensure the request is still logged to `audit_logs` even if notification delivery partially fails.

**2. Redeploy the edge function**
- The function may not be deployed with latest code. Force redeploy.

**3. Verify admin seeding**
- Confirm that the `seed-admin` edge function properly inserts into `user_roles` table so at least one admin exists.

### Files Modified
- `supabase/functions/request-account-deletion/index.ts` — add SPOC fallback, improve error messages
- Redeploy edge function

### No database or UI changes needed — the `AccountDeletion.tsx`, `DeletionRequestsManager.tsx`, and `admin-delete-member` function are already correct.

