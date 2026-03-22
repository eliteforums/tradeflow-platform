

## Plan: Fix SPOC QR Generation to Use Temp IDs

### Problem
The `generate-spoc-qr` edge function generates old-style HMAC-signed QR codes (`{institution_id, spoc_id, timestamp, signature}`). It does NOT pick a temp credential from the pool. So when a student scans and registers, no temp ID gets consumed/linked.

The expected flow is:
1. Admin creates 50 temp IDs via `create-bulk-temp-ids`
2. SPOC generates QR → function picks an **unused** temp credential, marks it **assigned**, returns QR with `{temp_id, temp_password, institution_id}`
3. Student scans QR → `verify-temp-credentials` validates → Register → `activate-account` marks it **activated**

Step 2 is broken — the function never queries `temp_credentials`.

### Solution

**Rewrite `supabase/functions/generate-spoc-qr/index.ts`** to:

1. Authenticate SPOC (keep existing auth check)
2. Query `temp_credentials` for the SPOC's institution where `status = 'unused'`, pick one (LIMIT 1)
3. If none available, return an error ("No temp IDs available. Ask admin to generate more.")
4. Update that temp credential to `status = 'assigned'`, `assigned_at = now()`
5. Return QR payload as `JSON.stringify({ temp_id: cred.temp_username, temp_password: cred.temp_password_plain, institution_id })`
6. Audit log the assignment

### Files to modify
- `supabase/functions/generate-spoc-qr/index.ts` — rewrite to use temp credentials pool

