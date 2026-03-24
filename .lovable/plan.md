

## Plan: Enable AI Transcription for Peer Connect & Fix Session Type Handling

### Current State
- **Expert Connect (BlackBox)**: `enableMonitoring={true}` — audio monitor runs, classifies via `ai-transcribe`, and `captureEscalationSnippet` captures ±10s on escalation. Works correctly.
- **Peer Connect**: `enableMonitoring={false}` — no transcription at all. When intern escalates via `flagSession`, the `trigger_snippet` is just a JSON blob with usernames/reason — no transcript data.
- **`ai-transcribe` edge function**: Hardcoded to update `blackbox_sessions` table — doesn't support `peer_sessions`.

### Changes

#### 1. `src/pages/dashboard/PeerConnect.tsx` — Enable monitoring for intern side
- Set `enableMonitoring={true}` on the `VideoCallModal` when the current user is the intern (not the student)
- Add `onRiskDetected` callback that updates session `is_flagged` if risk level >= 2
- Pass `captureEscalationSnippet` reference so the flag dialog can capture ±10s transcript

#### 2. `src/components/mobile/MobilePeerConnect.tsx` — Same changes for mobile

#### 3. `supabase/functions/ai-transcribe/index.ts` — Support both session types
- Accept optional `session_type` param (`"blackbox"` default, or `"peer"`)
- When `session_type === "peer"`, update `peer_sessions` table (`is_flagged`, `escalation_note_encrypted`) instead of `blackbox_sessions`
- Lookup `student_id` from the correct table based on session type

#### 4. `src/hooks/usePeerConnect.ts` — Include transcript snippet in escalation
- Update `flagSession` mutation to accept optional `transcriptSnippet` parameter
- If provided, include it in the `trigger_snippet` JSON alongside usernames/reason
- This connects the intern's manual escalation button with the audio monitor's ±10s capture

#### 5. Add escalation UI to Peer Connect chat header
- Add a "Flag" button (already exists in intern view) that triggers `captureEscalationSnippet()` before calling `flagSession`
- Show a reason input dialog before flagging

### No full conversation storage
- Rolling buffer purges every 30s (existing behavior)
- On escalation: capture ±10s, purge buffer (existing `captureEscalationSnippet` behavior)
- No transcript persisted to DB except the ±10s snippet

### Files Modified
- `src/pages/dashboard/PeerConnect.tsx` — Enable monitoring, wire escalation snippet
- `src/components/mobile/MobilePeerConnect.tsx` — Same
- `supabase/functions/ai-transcribe/index.ts` — Support `peer` session type
- `src/hooks/usePeerConnect.ts` — Accept transcript snippet in flag mutation

