

## Fix: Escalation Flow — Phase 4 Logic Alignment

### Problems Found

**1. Therapist L3 escalation does NOT send notification with "Join Session" to Expert Dashboard**
- Current code (TherapistDashboardContent L340-478) tries to directly reassign `therapist_id` to an expert, which breaks the therapist's own session and doesn't let the expert *choose* to join.
- PRD says: L3 → notify expert → expert clicks "Join Session" button → expert joins alongside therapist → therapist can stay or leave.

**2. Expert "Claim & Join" overwrites `therapist_id`**
- ExpertL3AlertPanel line 102: `update({ therapist_id: user.id })` — this kicks the therapist out. Expert should join the *same room* without replacing the therapist.

**3. Therapist has no "Stay / Leave" option after expert joins**
- PRD Step 4: Therapist should see a prompt to stay in or leave the session once an expert joins. Currently no such UI exists.

**4. Expert escalation to SPOC (Step 5) works correctly — already implemented in `ExpertL3AlertPanel.handleEmergencyEscalation` calling `escalate-emergency` edge function.

**5. Intern/Expert AI suggestion → Escalate button is not wired to send to SPOC**
- `MeetingView.onEscalateFromSuggestion` is defined but the therapist dashboard doesn't pass it through. The intern dashboard escalation works via dialog but not from the AI popup.

### Changes

**File: `src/components/therapist/TherapistDashboardContent.tsx`**
- **L3 escalation logic (submitEscalation, lines 340-478)**: Remove direct `therapist_id` reassignment. Instead:
  1. Update session: set `flag_level=3`, `escalation_reason`, `status='escalated'` (not reassign therapist_id)
  2. Notify all active experts via `notifications` table with type `l3_handoff` containing `room_id` and `session_id`
  3. Do NOT leave the session — therapist stays connected
  4. Show toast: "Experts have been notified — they will join your session"
- **Add `onEscalateFromSuggestion` prop** to the `MeetingView` in the session tab so clicking "Escalate Now" on the AI popup opens the escalation dialog pre-filled

**File: `src/components/expert/ExpertL3AlertPanel.tsx`**
- **handleAcceptAndJoin (lines 87-122)**: Stop overwriting `therapist_id`. Instead:
  1. Update session `status` from `escalated` → `active` (to confirm expert engagement)
  2. Store expert ID in `escalation_history` entry (not therapist_id column)
  3. Join the existing `room_id` — do NOT create a new room
  4. Add a notification to the therapist: "Expert has joined your session"
- **Add "Stay / Leave" prompt for therapist**: After expert joins (detected via realtime subscription in TherapistDashboardContent), show a dialog:
  - "An expert has joined. You may stay to assist or leave the session."
  - "Stay" → dismiss dialog, therapist remains
  - "Leave" → therapist calls `leave()`, session continues with expert

**File: `src/components/therapist/TherapistDashboardContent.tsx` (additional)**
- Add realtime listener for `blackbox_sessions` updates where `status` changes while therapist is in session
- When an expert joins (escalation_history updated), show "Stay or Leave" dialog
- If therapist leaves, call `leaveCallRef.current()` and clear session state but do NOT set status to completed

**File: `src/components/videosdk/MeetingView.tsx`**
- Wire `onEscalateFromSuggestion` — already exists as prop, just needs to be passed from TherapistDashboardContent

### Flow After Fix

```text
L3 BlackBox Escalation:
  Therapist clicks Escalate (L3)
    → session.status = 'escalated', flag_level = 3
    → notification sent to all experts
    → therapist STAYS in session

  Expert sees L3 alert panel
    → clicks "Join Session"
    → joins same room_id (no therapist_id overwrite)
    → notification sent to therapist: "Expert joined"

  Therapist sees "Stay / Leave" dialog
    → Stay: continues in session
    → Leave: disconnects, session continues with expert

  Expert clicks "Escalate — Share Emergency Contact"
    → escalate-emergency edge function → SPOC dashboard
```

```text
AI Suggestion → Escalate (Expert/Intern):
  AI popup appears with risk level
    → User clicks "Escalate Now"
    → For Intern: opens escalation dialog → escalate-emergency (peer_session_id) → SPOC
    → For Expert: opens escalation dialog → escalate-emergency (appointment_id) → SPOC
    → For Therapist: opens escalation dialog with pre-filled reason
```

### No database changes needed
Session status `escalated` already exists. The `escalation_history` jsonb field can store expert join events.

