

## Plan: Selective Transcription ±10s Retention, Admin Escalation Logs, SPOC Emergency Contact with Student Details

### Current State

1. **`useAudioMonitor`** captures live speech via Web Speech API, maintains a rolling 30s buffer, and sends to `ai-transcribe` every 15s. On risk detection, a `trigger_snippet` (±200 chars around keyword) is stored. But it does NOT implement true ±10s selective retention — it keeps everything in the buffer until the window expires.

2. **`ExpertL3AlertPanel`** lets experts escalate and share emergency contacts with SPOCs, but does NOT capture the ±10s audio snippet around the escalation button click.

3. **Admin `EscalationManager`** shows escalations but does NOT display the trigger snippet, student ID, username, or emergency contact details — it only shows justification text.

4. **SPOC Dashboard** already parses emergency contact JSON from `trigger_snippet` and shows name/phone/relation, but does NOT show Eternia ID or username.

### Changes

#### 1. `src/hooks/useAudioMonitor.ts` — Add ±10s selective retention on escalation

- Add a `captureEscalationSnippet()` method that grabs ±10s of transcript from the buffer around the current timestamp
- Export this method so the escalation button can call it
- After capture, purge the buffer (selective retention — discard everything else)

#### 2. `src/components/expert/ExpertL3AlertPanel.tsx` — Capture ±10s snippet on escalation click

- When "Confirm Escalation" is clicked, call `captureEscalationSnippet()` from audio monitor (pass via context or prop)
- Include the captured snippet in the escalation request's `trigger_snippet` alongside emergency contact
- Fetch student profile (Eternia ID, username) and include in the escalation payload

#### 3. `src/components/videosdk/MeetingView.tsx` — Pass audio monitor ref to escalation controls

- Expose `audioMonitor.captureEscalationSnippet` via a callback prop or ref so ExpertL3AlertPanel can access it when the expert is in a session

#### 4. `src/components/admin/EscalationManager.tsx` — Show full escalation details

- Parse `trigger_snippet` JSON (same as SPOC dashboard does)
- Display: escalation level badge, student Eternia ID, username, emergency contact, ±10s transcript snippet, timestamp
- Add distinct red styling for L3/critical escalations

#### 5. `src/components/spoc/SPOCDashboardContent.tsx` — Add Eternia ID + username to emergency contact display

- When rendering emergency contact from `trigger_snippet`, also show `student_id` (Eternia ID) and `student_username` fields

#### 6. `src/components/expert/ExpertL3AlertPanel.tsx` — Enrich escalation payload

- Before creating escalation request, fetch student's profile to get `student_id` (Eternia ID) and `username`
- Include in `trigger_snippet` JSON: `{ type: "emergency_contact", name, phone, relation, is_self, student_eternia_id, student_username, transcript_snippet, session_id }`

### Files to modify

1. **`src/hooks/useAudioMonitor.ts`** — Add `captureEscalationSnippet()` method (grabs ±10s from buffer, returns text, then purges)
2. **`src/components/expert/ExpertL3AlertPanel.tsx`** — Enrich payload with student details + transcript snippet
3. **`src/components/admin/EscalationManager.tsx`** — Parse and display full escalation details (student ID, username, contact, snippet)
4. **`src/components/spoc/SPOCDashboardContent.tsx`** — Show Eternia ID + username in emergency contact card
5. **`src/components/videosdk/MeetingView.tsx`** — Expose audio monitor's capture method for escalation use

