

## Plan: Fix Emergency Contact Visibility in Escalation Flow

### Root Cause Analysis

There are multiple points of failure in the chain: Expert calls `get-emergency-contact` edge function → contact data goes into `trigger_snippet` → SPOC dashboard parses it.

The most likely failures:
1. **Edge function `SUPABASE_ANON_KEY` env var** — may not be set as `SUPABASE_ANON_KEY` (edge functions use `SUPABASE_ANON_KEY` but the secret might be named differently)
2. **Edge function returns non-2xx** (auth fail, session not found, flag_level check) but the client silently catches and proceeds with `contact = null`
3. **No `user_private` record** for the student (registration may not have saved emergency contact)
4. **The expert calls `handleEmergencyEscalation` before accepting the session** — the edge function checks `session.therapist_id === callerId` but if the expert hasn't been set as therapist yet, it returns 403

### Fix: Bypass edge function and fetch contact directly via service role in a new escalation edge function

Instead of doing a two-step process (client calls edge function for contact, then inserts escalation), create a single `escalate-emergency` edge function that:
- Validates the expert/therapist identity
- Fetches the emergency contact via service role (no RLS issues)
- Creates the escalation_request with full contact data
- Sends notifications to SPOC + other experts
- Returns the created escalation with contact info

This eliminates all client-side failure points.

### Changes

#### 1. New edge function: `supabase/functions/escalate-emergency/index.ts`
- Accepts: `session_id`, `justification`, `transcript_snippet`
- Uses service role to:
  - Verify caller is the session therapist or has expert role
  - Fetch student profile (username, student_id, institution_id)
  - Fetch emergency contact from `user_private`
  - Find SPOC for the institution
  - Insert `escalation_requests` with full `trigger_snippet` JSON
  - Insert notifications for SPOC + other experts
  - Insert audit log
- Returns: the created escalation + contact data

#### 2. Update `src/components/expert/ExpertL3AlertPanel.tsx`
- Replace the multi-step `handleEmergencyEscalation` (edge function call + manual insert + notifications) with a single call to `escalate-emergency`
- Much simpler, more reliable

#### 3. Update `src/components/spoc/SPOCDashboardContent.tsx`
- Add a fallback: if `trigger_snippet` has `type === "emergency_contact"` but no name/phone, show a "Fetch Contact" button that calls `get-emergency-contact` directly from the SPOC side
- This gives SPOCs a manual override if the automated flow missed the contact data

### Files Modified
- `supabase/functions/escalate-emergency/index.ts` — New edge function (single atomic operation)
- `src/components/expert/ExpertL3AlertPanel.tsx` — Use new edge function
- `src/components/spoc/SPOCDashboardContent.tsx` — Add manual fetch fallback for missing contact data

### Technical Details
- The new edge function uses `SUPABASE_SERVICE_ROLE_KEY` exclusively for DB operations (bypasses all RLS)
- Auth verification uses the standard `getUser(token)` pattern
- The `escalation_requests` insert uses the service role client, avoiding any RLS policy issues with the expert insert policy
- Notifications use service role insert, ensuring they always succeed regardless of caller identity

