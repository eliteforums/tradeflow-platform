

## Plan: Fix Emergency Contact Not Reflecting on SPOC Dashboard

### Root Cause
The `get-emergency-contact` edge function uses `anonClient.auth.getClaims(token)` which is **not a valid method** in supabase-js v2. This causes the function to return 401, which makes the expert's `handleEmergencyEscalation` throw an error before the escalation_request is even created. No escalation = nothing on SPOC dashboard.

### Changes

#### 1. Fix `supabase/functions/get-emergency-contact/index.ts`
- Replace `getClaims(token)` with `getUser(token)` — the standard supabase-js v2 method
- Extract `callerId` from `user.id` instead of `claims.sub`

#### 2. Add fallback in `src/components/expert/ExpertL3AlertPanel.tsx`
- If `get-emergency-contact` fails (e.g. no user_private record), still create the escalation_request with available info (student username, session ID) instead of throwing and aborting
- Move the `supabase.functions.invoke("get-emergency-contact")` call inside a try-catch that allows the escalation to proceed even without contact data

### Files Modified
- `supabase/functions/get-emergency-contact/index.ts` — Fix auth method
- `src/components/expert/ExpertL3AlertPanel.tsx` — Make escalation resilient to contact fetch failure

### Technical Details
- `anonClient.auth.getClaims(token)` → `anonClient.auth.getUser(token)` with `data.user.id` for caller identity
- The escalation insert should always succeed; emergency contact data is optional enrichment

