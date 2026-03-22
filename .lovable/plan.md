

## Plan: BlackBox L3 Escalation Flow — Expert Notifications, Call Join, Emergency Contact to SPOC

### What exists today

1. **`ai-transcribe` edge function**: Already classifies live call transcripts (L1-L3), updates `blackbox_sessions.flag_level`, and creates `escalation_requests` for L2+. For L3, it sets `status: "critical"`.
2. **`useAudioMonitor` hook**: Runs Web Speech API during BlackBox calls, sends transcript chunks to `ai-transcribe` every 15s.
3. **`MeetingView`**: Shows AI risk badge, supports therapist controls.
4. **`get-emergency-contact` edge function**: Fetches emergency contact from `user_private` for L3 sessions — already validates therapist + L3 flag.
5. **SPOC Dashboard**: Already has realtime subscription on `escalation_requests` INSERT — shows toast for critical escalations. Already displays escalations list.
6. **Expert Dashboard**: Has NO awareness of BlackBox sessions or L3 alerts. Only handles scheduled appointments.

### What's missing

1. **Expert Dashboard**: No notification when an L3 BlackBox session is flagged. No way to see/accept/join an active BlackBox call.
2. **Expert joining BlackBox call**: No mechanism for an expert to join an ongoing BlackBox session mid-call.
3. **Emergency contact flow**: The `get-emergency-contact` function exists but nothing in the UI calls it or sends the result to the SPOC dashboard.

### Solution

#### 1. Expert Dashboard: Add L3 Emergency Alert Panel

Add a realtime subscription on `blackbox_sessions` in the Expert Dashboard. When a session has `flag_level >= 3` and `status` is `active` or `accepted`:
- Show an **emergency alert banner** at the top of the home tab with a pulsing red indicator
- Display session details (flag level, escalation reason snippet, time created)
- Provide an **"Accept & Join Call"** button

When expert clicks "Accept & Join":
- Update `blackbox_sessions` to add themselves as a secondary participant (or replace therapist if none)
- Fetch VideoSDK token via existing `videosdk-token` function
- Open MeetingView in a modal with `isTherapistView=true` so they get session controls
- Show an **"Escalate — Share Emergency Contact"** button in the session controls

#### 2. Emergency Contact Escalation Button

Inside the expert's BlackBox session view, add an "Emergency Escalation" button that:
- Calls `get-emergency-contact` edge function with `student_id` and `session_id`
- Creates an `escalation_request` with `escalation_level: 3`, `status: "critical"`, and the emergency contact info in the `trigger_snippet` field
- The SPOC dashboard already picks this up via realtime and shows it

#### 3. SPOC Dashboard: Display Emergency Contact in Escalation Detail

Update the escalation display in SPOCDashboardContent to:
- For L3/critical escalations, parse and show emergency contact info from `trigger_snippet`
- Highlight critical escalations with a distinct red styling

### Files to modify

1. **`src/components/expert/ExpertDashboardContent.tsx`**
   - Add query for active L3 BlackBox sessions
   - Add realtime subscription on `blackbox_sessions` for `flag_level >= 3`
   - Add emergency alert banner UI on home tab
   - Add "Accept & Join" flow with VideoSDK token fetch + MeetingProvider modal
   - Add "Escalate — Share Emergency Contact" button that calls `get-emergency-contact` then creates escalation_request

2. **`src/components/mobile/MobileExpertDashboard.tsx`**
   - Same L3 alert + join flow for mobile layout

3. **`src/components/spoc/SPOCDashboardContent.tsx`**
   - In the escalations/flags tab, for critical escalations with emergency contact data in `trigger_snippet`, display contact name/phone/relation prominently

### Technical details

- The `get-emergency-contact` function uses `auth.getClaims()` which may not work with the anon key. Since `verify_jwt = false` is not set for this function, we need to ensure the expert sends their auth token. The function already validates the caller is the session's therapist — we may need to also allow experts (check `has_role('expert')` as an alternative auth path).
- We'll update `get-emergency-contact` to also accept experts who have `has_role('expert')` if the session `flag_level >= 3`, not just the assigned therapist.
- Realtime filter: `supabase.channel('expert-l3-alerts').on('postgres_changes', { event: '*', schema: 'public', table: 'blackbox_sessions' }, callback)` — filter in the callback for `flag_level >= 3`.

### Config changes

- Add `[functions.get-emergency-contact]` with `verify_jwt = false` to `supabase/config.toml` (since we validate auth in code)

