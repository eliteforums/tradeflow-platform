

## Fix: Call Transcription Capture — Remaining Issues

### Problems Found

1. **Therapist L2 escalation bypasses edge function** (lines 282-315): When the therapist escalates at Level 2, a direct `escalation_requests` insert stores plain-text `escalationReason` as `trigger_snippet` — no structured JSON, no emergency contact, no student ID, no transcript capture. Only L3 calls the `escalate-emergency` edge function.

2. **Therapist L1 escalation stores no escalation request at all**: Level 1 escalations only update `blackbox_sessions` and write an audit log — no `escalation_requests` row is created, so nothing shows on SPOC/Admin dashboards.

3. **Intern peer sessions don't use VideoCallModal**: The intern dashboard renders peer sessions as text-based chat with a "Join" button that navigates to `/dashboard/peer-connect`. There's no `VideoCallModal` rendered, so `captureSnippetRef` is never populated — meaning the transcript capture code in `submitEscalation` always gets `null`.

4. **Admin dashboard query uses FK join to `peer_sessions`**: The `EscalationManager` query (line 26) tries to join `escalation_requests` with `peer_sessions` via `session_id`, but the edge function doesn't set `session_id` on the escalation record — meaning session details are missing from the admin view. The structured data is inside `trigger_snippet` JSON, which IS parsed and displayed, but the FK join returns null.

### Plan

#### A. Therapist: Route ALL escalation levels through the edge function

**`TherapistDashboardContent.tsx`**: Replace the entire L2 direct insert block (lines 282-315) with a call to `escalate-emergency` for levels 1-2 as well (same pattern as L3 on lines 330-348). This ensures:
- Structured `trigger_snippet` JSON for all levels
- Emergency contact included
- Escalator role tagged
- Transcript snippet captured (±10s)

Specifically:
- Remove the L2-only direct insert block (lines 282-315)
- Move the edge function call (currently only for L3, lines 329-348) to run for ALL levels (1, 2, and 3)
- Keep the L3-specific expert notification and "therapist stays" logic

#### B. Intern: Pass `captureSnippetRef` from PeerConnect video flow

The intern escalation already correctly awaits `captureSnippetRef.current()` (line 138-140), but the ref is never set because there's no `VideoCallModal` with `onCaptureSnippetReady`. Two options:

Since peer sessions use chat (not video calls), transcript capture doesn't apply — the intern should instead pass the recent chat messages as the `transcript_snippet`. Update the intern escalation to pull the last ~10 messages from `peer_messages` and use those as the snippet when `captureSnippetRef.current` is null.

**`InternDashboardContent.tsx`**: In `submitEscalation`, when `captureSnippetRef.current` is null, query recent `peer_messages` for the session and format them as the snippet.

#### C. Admin dashboard: Remove broken FK join, rely on structured trigger_snippet

**`EscalationManager.tsx`**: The current query joins `peer_sessions` via FK, but most escalations don't have `session_id` set (the edge function uses `admin` client to insert without setting this FK). Simplify the query to not rely on the FK join — the structured data is already in `trigger_snippet` JSON which is parsed and displayed. Remove the `session:peer_sessions!...` join from the query to prevent errors on non-peer escalations.

### Files to Edit

| File | Change |
|------|--------|
| `src/components/therapist/TherapistDashboardContent.tsx` | Route L1/L2 escalations through `escalate-emergency` edge function with transcript capture |
| `src/components/intern/InternDashboardContent.tsx` | Fallback: pull recent chat messages as transcript when no audio capture available |
| `src/components/admin/EscalationManager.tsx` | Remove FK join to `peer_sessions`; rely on parsed `trigger_snippet` for all session data |

