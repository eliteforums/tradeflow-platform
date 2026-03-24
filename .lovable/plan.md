

## Plan: Real APAAR/ERP ID Backend Verification

### Problem
Currently, the "Verify" button on the registration form only does client-side format validation (12-digit check for APAAR, alphanumeric check for ERP). It never actually checks the ID against the institution's uploaded records in `institution_student_ids`. The backend (`activate-account`) does check, but by then the user has already filled out the entire form.

### Changes

#### 1. New Edge Function: `supabase/functions/verify-student-id/index.ts`
Accepts `{ institution_id, id_type, student_id }` and checks against `institution_student_ids` table using service role:
- If found and unclaimed → return `{ verified: true }`
- If found but already claimed → return `{ verified: false, reason: "already_claimed" }`
- If not found → return `{ verified: false, reason: "not_found" }`
No raw ID is stored; the function only reads the hash table for matching.

#### 2. Update `src/pages/auth/Register.tsx` — Replace fake verification with real backend call
In `handleVerifyStudentId`:
- After format validation passes, call `supabase.functions.invoke("verify-student-id")` with institution ID and the entered ID
- Show appropriate error messages: "ID not found in institution records" or "This ID has already been claimed"
- Only set `studentIdVerified = true` if backend returns verified
- If institution has no uploaded IDs (empty table), show a warning but allow proceeding with unverified status

#### 3. Config: `supabase/config.toml`
Add `[functions.verify-student-id]` with `verify_jwt = false` (unauthenticated users during registration need access).

### Files Modified
- `supabase/functions/verify-student-id/index.ts` — New edge function
- `supabase/config.toml` — Register function
- `src/pages/auth/Register.tsx` — Replace setTimeout mock with real backend call

