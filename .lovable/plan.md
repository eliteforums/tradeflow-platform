

## Plan: Wire AI Transcript Capture & Emergency Contact to All Escalation Flows

### Current State

| Flow | AI Transcript Capture | Emergency Contact to SPOC |
|---|---|---|
| **6.1 Expert → SPOC** (appointments) | Missing — just sends typed reason | Missing — no contact fetch |
| **6.2 Intern → SPOC** (peer sessions) | Missing — just sends typed reason | Missing — no contact fetch |
| **6.3 BlackBox Expert → SPOC** (L3 panel) | Works — uses `captureSnippetRef` | Works — `escalate-emergency` edge function |

### Changes

#### 1. `src/components/expert/ExpertDashboardContent.tsx` — Add transcript capture + emergency contact

- When expert clicks "Escalate" on an appointment and confirms:
  - Call `escalate-emergency` edge function instead of direct `escalation_requests` insert
  - This requires passing the appointment's student_id and session context
  - The edge function already fetches emergency contact and creates the escalation with proper `trigger_snippet` JSON
- Problem: `escalate-emergency` expects a `blackbox_sessions` row. For appointments, we need to either:
  - **Option A**: Create a new edge function `escalate-appointment` that works with `appointments` table
  - **Option B**: Extend `escalate-emergency` to accept `appointment_id` as alternative to `session_id`
- **Going with Option B** — add `appointment_id` support to `escalate-emergency`
- If the expert has an active video call with AI monitoring, capture the ±10s transcript snippet via `captureSnippetRef` pattern (same as L3 panel)

#### 2. `src/components/intern/InternDashboardContent.tsx` — Add transcript capture + emergency contact

- Same pattern: when intern clicks "Escalate" on a peer session:
  - Call `escalate-emergency` edge function with `peer_session_id` parameter
  - Edge function fetches student emergency contact and creates escalation with full `trigger_snippet`
- If intern has active call with monitoring, capture ±10s transcript

#### 3. `supabase/functions/escalate-emergency/index.ts` — Support all session types

Currently only handles `blackbox_sessions`. Extend to accept:
- `session_id` (blackbox) — existing
- `appointment_id` (expert appointments) — new
- `peer_session_id` (peer connect) — new

Logic:
- Determine `student_id` from whichever table is referenced
- Verify caller is the therapist/expert/intern assigned to that session
- Fetch emergency contact from `user_private` (same as current)
- Create escalation request with full contact JSON in `trigger_snippet`
- Notify SPOC + other experts

#### 4. SPOC Dashboard — Already handles display

The `SPOCDashboardContent` already parses `trigger_snippet` JSON for `type === "emergency_contact"` and renders the contact card with name, phone, relation, transcript snippet. No changes needed here since the edge function will produce the same format.

### Files Modified
- `supabase/functions/escalate-emergency/index.ts` — Support `appointment_id` and `peer_session_id`
- `src/components/expert/ExpertDashboardContent.tsx` — Use `escalate-emergency` edge function, add `captureSnippetRef` for transcript
- `src/components/intern/InternDashboardContent.tsx` — Use `escalate-emergency` edge function, add `captureSnippetRef` for transcript

### Technical Details
- The `escalate-emergency` edge function uses service role to bypass RLS when reading `user_private` for emergency contacts
- For appointments: lookup `student_id` from `appointments` table, verify caller is `expert_id`
- For peer sessions: lookup `student_id` from `peer_sessions` table, verify caller is `intern_id`
- Transcript capture only available when a video/audio call is active with `enableMonitoring={true}`; otherwise `transcript_snippet` will be null (acceptable)

